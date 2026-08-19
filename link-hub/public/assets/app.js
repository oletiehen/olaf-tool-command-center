const state = {
  sites: [],
  catalog: [],
  items: [],
  overrides: loadOverrides(),
  kind: 'all',
  query: '',
  category: 'all',
  priority: 'all',
  status: 'all'
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const el = {
  grid: $('#project-grid'),
  empty: $('#empty-state'),
  search: $('#search-input'),
  category: $('#category-filter'),
  priority: $('#priority-filter'),
  status: $('#status-filter'),
  count: $('#result-count'),
  total: $('#metric-total'),
  active: $('#metric-active'),
  attention: $('#metric-attention'),
  processes: $('#metric-processes'),
  version: $('#data-version'),
  sectionTitle: $('#section-title'),
  sectionEyebrow: $('#section-eyebrow'),
  attentionStrip: $('#attention-strip'),
  attentionList: $('#attention-list'),
  detail: $('#detail-dialog'),
  detailContent: $('#dialog-content'),
  detailClose: $('#dialog-close'),
  editor: $('#editor-dialog'),
  editorForm: $('#editor-form'),
  editorClose: $('#editor-close'),
  editorCancel: $('#editor-cancel'),
  newItem: $('#new-item-button'),
  exportButton: $('#export-button'),
  importButton: $('#import-button'),
  importFile: $('#import-file'),
  toast: $('#toast')
};

const kindLabel = { project: 'Projekt', artifact: 'ChatGPT-Seite', process: 'Prozess' };
const statusLabel = {
  live: 'Live', active: 'Aktiv', repository: 'Repository', draft: 'Entwurf', artifact: 'Artefakt', historical: 'Historisch',
  unknown: 'Ungeprüft', 'needs-link': 'Öffentliche URL fehlt', offline: 'Nicht erreichbar'
};
const priorityWeight = { 'sehr hoch': 4, hoch: 3, mittel: 2, niedrig: 1 };

function loadOverrides() {
  try { return JSON.parse(localStorage.getItem('olafProjectHubOverrides') || '{}'); }
  catch { return {}; }
}
function saveOverrides() {
  localStorage.setItem('olafProjectHubOverrides', JSON.stringify(state.overrides));
}
function escapeHtml(value = '') {
  return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
}
function formatDate(value, short = false) {
  if (!value) return 'Nicht erfasst';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat('de-DE', short ? {day:'2-digit',month:'2-digit',year:'2-digit'} : {day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(d);
}
function clamp(n, min=0, max=100) { return Math.max(min, Math.min(max, Number(n) || 0)); }
function slugify(text='eintrag') { return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60) || `eintrag-${Date.now()}`; }
function isPrivateIpv4(host) {
  const parts = host.split('.').map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return false;
  const [a,b] = parts;
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}
function isPrivateIpv6(host) {
  const normalized = host.replace(/^\[|\]$/g, '').toLowerCase();
  return normalized === '::' || normalized === '::1' || normalized.startsWith('fc') || normalized.startsWith('fd') || /^fe[89ab]/.test(normalized);
}
function isPublicWebUrl(value='') {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const normalizedHost = host.replace(/^\[|\]$/g, '');
    return url.protocol === 'https:' &&
      normalizedHost !== 'localhost' &&
      !normalizedHost.endsWith('.localhost') &&
      !normalizedHost.endsWith('.local') &&
      !isPrivateIpv4(normalizedHost) &&
      !isPrivateIpv6(normalizedHost) &&
      (normalizedHost.includes('.') || normalizedHost.includes(':'));
  } catch { return false; }
}
function publicLinks(item) {
  return (item.links || []).filter(link => link?.url && isPublicWebUrl(link.url));
}
function isReachableLink(link) {
  const status = Number(link?.lastHttpStatus || 0);
  return !status || (status >= 200 && status < 400);
}
function reachablePublicLinks(item) {
  return publicLinks(item).filter(isReachableLink);
}
function latestTechnicalDate(site={}) {
  const values = [site.lastChangedAt,site.lastPublishedAt,site.lastPlatformUpdateAt,site.lastSourceUpdateAt,site.firstSeenAt].filter(Boolean).map(v=>new Date(v)).filter(d=>!Number.isNaN(d.getTime()));
  return values.length ? new Date(Math.max(...values.map(d=>d.getTime()))) : null;
}
function defaultProgressFromSite(site) {
  if (site.status === 'live') return 80;
  if (site.status === 'repository') return 55;
  if (site.status === 'needs-link') return 50;
  return 45;
}
function siteAsCatalog(site) {
  return {
    id: site.id,
    kind: 'project',
    title: site.title,
    category: site.category || 'Webprojekt',
    source: site.platform || 'Web',
    description: site.description || '',
    objective: '',
    phase: site.status === 'live' ? 'Live' : site.status === 'repository' ? 'Repository vorhanden' : 'In Klärung',
    progress: defaultProgressFromSite(site),
    priority: 'mittel',
    status: site.status || 'unknown',
    statusText: site.status === 'live' ? 'Öffentliche Version ist erreichbar.' : site.status === 'repository' ? 'Quellcode ist öffentlich vorhanden.' : 'Technischer Stand wird geprüft.',
    currentState: '',
    nextAction: site.status === 'needs-link' ? 'Öffentliche HTTPS-Adresse ergänzen.' : '',
    openPoints: site.status === 'needs-link' ? ['Öffentliche HTTPS-Adresse zuordnen'] : [],
    tags: [site.platform].filter(Boolean),
    links: site.links || [],
    previewImage: site.previewImage,
    previewKind: site.previewKind,
    previewPolicy: site.previewPolicy,
    files: [],
    timeline: []
  };
}
function mergeItem(base, site) {
  const override = state.overrides[base.id] || {};
  const localLinks = Array.isArray(override.links) ? override.links : [];
  const baseLinks = [...(base.links || [])];
  const siteLinks = [...(site?.links || [])];
  const links = [...baseLinks, ...siteLinks, ...localLinks].filter((link, idx, arr) => link?.url && arr.findIndex(x => x.url === link.url) === idx);
  return {
    ...base,
    ...override,
    id: base.id,
    links,
    technical: site ? {
      platform: site.platform,
      liveStatus: site.status,
      httpStatus: site.lastHttpStatus,
      resolvedUrl: site.resolvedUrl,
      previewImage: site.previewImage,
      previewKind: site.previewKind,
      previewPolicy: site.previewPolicy,
      lastChangedAt: site.lastChangedAt,
      lastPublishedAt: site.lastPublishedAt,
      lastPlatformUpdateAt: site.lastPlatformUpdateAt,
      lastSourceUpdateAt: site.lastSourceUpdateAt,
      firstSeenAt: site.firstSeenAt,
      sourceRepo: site.sourceRepo
    } : null
  };
}
function buildItems() {
  const catalogMap = new Map(state.catalog.map(item => [item.id, item]));
  const siteMap = new Map(state.sites.map(site => [site.id, site]));
  for (const site of state.sites) if (!catalogMap.has(site.id)) catalogMap.set(site.id, siteAsCatalog(site));
  for (const [id, override] of Object.entries(state.overrides)) {
    if (!catalogMap.has(id) && override?.title) catalogMap.set(id, { id, kind:'project', category:'Eigener Eintrag', priority:'mittel', progress:0, status:'draft', openPoints:[], tags:[], links:[], ...override });
  }
  state.items = [...catalogMap.values()].map(base => mergeItem(base, siteMap.get(base.id)));
}

function itemSearchText(item) {
  return [item.title,item.category,item.source,item.description,item.objective,item.phase,item.priority,item.status,item.statusText,item.currentState,item.nextAction,item.notes,...(item.tags||[]),...(item.openPoints||[]),...(item.files||[]),...publicLinks(item).flatMap(l=>[l.label,l.url])].filter(Boolean).join(' ').toLowerCase();
}
function matches(item) {
  return (state.kind === 'all' || item.kind === state.kind) &&
    (!state.query || itemSearchText(item).includes(state.query.toLowerCase())) &&
    (state.category === 'all' || item.category === state.category) &&
    (state.priority === 'all' || item.priority === state.priority) &&
    (state.status === 'all' || item.status === state.status || item.technical?.liveStatus === state.status);
}
function sortItems(a,b) {
  const attentionA = (a.openPoints?.length || 0) + (a.nextAction ? 1 : 0);
  const attentionB = (b.openPoints?.length || 0) + (b.nextAction ? 1 : 0);
  if (priorityWeight[b.priority] !== priorityWeight[a.priority]) return (priorityWeight[b.priority]||0) - (priorityWeight[a.priority]||0);
  if (attentionB !== attentionA) return attentionB - attentionA;
  return a.title.localeCompare(b.title,'de');
}
function statusClass(status='unknown') { return `status-${String(status).replace(/[^a-z0-9-]/gi,'-')}`; }
function previewMarkup(item) {
  if (item.previewPolicy === 'no-preview' || item.technical?.previewPolicy === 'no-preview') {
    const symbol = item.kind === 'process' ? '↻' : item.kind === 'artifact' ? '◇' : 'OT';
    return `<div class="preview-fallback ${escapeHtml(item.kind)}"><span>${symbol}</span></div>`;
  }
  const src = item.previewImage || item.technical?.previewImage || publicLinks(item).find(link => link.previewImage)?.previewImage;
  const previewKind = item.previewKind || item.technical?.previewKind || publicLinks(item).find(link => link.previewImage)?.previewKind || (src ? 'website-screenshot' : 'fallback');
  if (src) {
    const alt = previewKind === 'ai-cover' ? `KI-Cover zu ${item.title}` : `Screenshot der öffentlichen Website ${item.title}`;
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" data-preview data-preview-kind="${escapeHtml(previewKind)}">`;
  }
  const symbol = item.kind === 'process' ? '↻' : item.kind === 'artifact' ? '◇' : 'OT';
  return `<div class="preview-fallback ${escapeHtml(item.kind)}"><span>${symbol}</span></div>`;
}
function previewOriginMarkup(item) {
  if (item.previewPolicy === 'no-preview' || item.technical?.previewPolicy === 'no-preview') return '';
  const src = item.previewImage || item.technical?.previewImage || publicLinks(item).find(link => link.previewImage)?.previewImage;
  if (!src) return '';
  const previewKind = item.previewKind || item.technical?.previewKind || publicLinks(item).find(link => link.previewImage)?.previewKind || 'website-screenshot';
  const label = previewKind === 'ai-cover' ? 'KI-Cover' : 'Webseiten-Screenshot';
  return `<span class="preview-origin preview-origin-${escapeHtml(previewKind)}">${label}</span>`;
}
function linkTypeLabel(kind='') {
  return ({live:'Live-Webseite',source:'Öffentlicher Quellcode',historical:'Historische öffentliche Seite',reference:'Öffentliche Referenz'})[kind] || 'Öffentliche URL';
}
function primaryLink(item) {
  const links = reachablePublicLinks(item);
  return links.find(l=>l.kind==='live') || links.find(l=>l.kind==='reference') || links[0] || null;
}
function cardMarkup(item) {
  const open = primaryLink(item);
  const technicalStatus = item.technical?.liveStatus;
  const status = technicalStatus === 'live' ? 'live' : item.status || technicalStatus || 'unknown';
  return `<article class="project-card kind-${escapeHtml(item.kind)}" data-id="${escapeHtml(item.id)}">
    <div class="preview">${previewMarkup(item)}${previewOriginMarkup(item)}<span class="platform-tag">${escapeHtml(item.source || item.technical?.platform || kindLabel[item.kind])}</span><span class="kind-tag">${escapeHtml(kindLabel[item.kind] || item.kind)}</span></div>
    <div class="card-body">
      <div class="card-topline"><span class="category">${escapeHtml(item.category || '')}</span><span class="status ${statusClass(status)}">${escapeHtml(statusLabel[status] || status)}</span></div>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="description">${escapeHtml(item.description || item.statusText || '')}</p>
      <div class="progress-row"><div class="progress-meta"><span>${escapeHtml(item.phase || 'Stand offen')}</span><strong>${clamp(item.progress)}%</strong></div><div class="progress-track"><span style="width:${clamp(item.progress)}%"></span></div></div>
      <div class="mini-info"><div><span>Nächster Schritt</span><strong>${escapeHtml(item.nextAction || 'Keiner eingetragen')}</strong></div><div><span>Erreichbare URLs</span><strong>${reachablePublicLinks(item).length}</strong></div></div>
      <div class="card-actions">
        ${open ? `<a class="btn btn-primary" href="${escapeHtml(open.url)}" target="_blank" rel="noopener noreferrer">Öffnen ↗</a>` : `<button class="btn btn-primary detail-button" type="button" data-detail="${escapeHtml(item.id)}">Ansehen</button>`}
        <button class="btn btn-secondary detail-button" type="button" data-detail="${escapeHtml(item.id)}">Details</button>
        <button class="btn btn-icon edit-button" type="button" data-edit="${escapeHtml(item.id)}" title="Bearbeiten">✎</button>
      </div>
    </div>
  </article>`;
}

function render() {
  const items = state.items.filter(matches).sort(sortItems);
  el.grid.innerHTML = items.map(cardMarkup).join('');
  el.empty.hidden = items.length > 0;
  el.count.textContent = `${items.length} von ${state.items.length}`;
  const labels = { all:['GESAMTÜBERSICHT','Projekte, Seiten & Prozesse'], project:['PROJEKTE','Aktive Vorhaben & Anwendungen'], artifact:['CHATGPT-SEITEN','Seiten, Prototypen & Artefakte'], process:['PROZESSE','Automationen & wiederkehrende Abläufe'] };
  [el.sectionEyebrow.textContent, el.sectionTitle.textContent] = labels[state.kind];
  $$('[data-preview]').forEach(img => img.addEventListener('error', () => img.replaceWith(Object.assign(document.createElement('div'),{className:'preview-fallback',innerHTML:'<span>OT</span>'})),{once:true}));
  $$('.detail-button').forEach(btn => btn.addEventListener('click',()=>openDetails(btn.dataset.detail)));
  $$('.edit-button').forEach(btn => btn.addEventListener('click',()=>openEditor(btn.dataset.edit)));
}

function renderFilters() {
  const cats = [...new Set(state.items.map(i=>i.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
  el.category.innerHTML = `<option value="all">Alle Kategorien</option>${cats.map(v=>`<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('')}`;
  el.category.value = state.category;
  const statuses = [...new Set(state.items.flatMap(i=>[i.status,i.technical?.liveStatus]).filter(Boolean))].sort();
  el.status.innerHTML = `<option value="all">Alle Status</option>${statuses.map(v=>`<option value="${escapeHtml(v)}">${escapeHtml(statusLabel[v]||v)}</option>`).join('')}`;
  el.status.value = state.status;
}
function renderMetrics() {
  el.total.textContent = state.items.length;
  el.active.textContent = state.items.filter(i=>['live','active'].includes(i.status)||i.technical?.liveStatus==='live').length;
  el.attention.textContent = state.items.filter(i=>(i.openPoints?.length||0)>0 || i.nextAction).length;
  el.processes.textContent = state.items.filter(i=>i.kind==='process').length;
  const scan = state.sites.map(s=>latestTechnicalDate(s)).filter(Boolean).sort((a,b)=>b-a)[0];
  el.version.textContent = `Katalog ${formatDate(new Date())} · technischer Scan ${scan ? formatDate(scan) : 'nicht erfasst'}`;
}
function renderAttention() {
  const items = state.items.filter(i=>priorityWeight[i.priority]>=3 && (i.nextAction || i.openPoints?.length)).sort(sortItems).slice(0,6);
  el.attentionStrip.hidden = items.length === 0;
  el.attentionList.innerHTML = items.map(i=>`<button type="button" data-attention="${escapeHtml(i.id)}"><span>${escapeHtml(i.title)}</span><strong>${escapeHtml(i.nextAction || i.openPoints?.[0] || 'Details prüfen')}</strong></button>`).join('');
  $$('[data-attention]').forEach(b=>b.addEventListener('click',()=>openDetails(b.dataset.attention)));
}

function linksMarkup(item) {
  const links = publicLinks(item);
  if (!links.length) return `<div class="no-public-link"><strong>Noch keine öffentliche HTTPS-Adresse</strong><p>Lokale Entwicklungsadressen, Sandbox-Dateien und interne Codex-Links werden hier bewusst nicht angezeigt.</p></div>`;
  return links.map(link=>{
    const status = Number(link.lastHttpStatus || 0);
    const reachable = isReachableLink(link);
    const check = status ? `HTTP ${status}${reachable ? '' : ' · nicht erreichbar'}` : 'wird geprüft';
    return `<div class="resource-link">
      <div><span class="resource-type">${escapeHtml(linkTypeLabel(link.kind))} · ${escapeHtml(check)}</span><strong>${escapeHtml(link.label || 'Öffentliche URL')}</strong><code>${escapeHtml(link.url)}</code></div>
      ${reachable ? `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">Öffnen ↗</a>` : `<span style="flex:0 0 auto;color:#e19a9a;font-size:10px;font-weight:700">Nicht erreichbar</span>`}
    </div>`;
  }).join('');
}
function listMarkup(items=[], empty='Keine Einträge.') {
  if (!items.length) return `<p class="muted-copy">${escapeHtml(empty)}</p>`;
  return `<ul class="clean-list">${items.map(x=>`<li>${escapeHtml(typeof x==='string'?x:(x.text||x.name||JSON.stringify(x)))}</li>`).join('')}</ul>`;
}
function timelineMarkup(item) {
  const auto = [];
  if (item.technical?.firstSeenAt) auto.push({date:item.technical.firstSeenAt,text:'Erstmals vom technischen Monitoring erfasst.'});
  if (item.technical?.lastChangedAt) auto.push({date:item.technical.lastChangedAt,text:'Inhaltsänderung vom Monitoring erkannt.'});
  return [...(item.timeline||[]),...auto].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(t=>`<div class="timeline-row"><time>${escapeHtml(formatDate(t.date,true))}</time><span>${escapeHtml(t.text)}</span></div>`).join('') || `<p class="muted-copy">Noch keine Historie dokumentiert.</p>`;
}
function technicalMarkup(item) {
  if (!item.technical) return `<p class="muted-copy">Für diesen Eintrag gibt es noch keine automatische technische Überwachung.</p>`;
  const t=item.technical;
  return `<div class="tech-grid">
    <div><span>Plattform</span><strong>${escapeHtml(t.platform||'–')}</strong></div>
    <div><span>Live-Status</span><strong>${escapeHtml(statusLabel[t.liveStatus]||t.liveStatus||'–')}</strong></div>
    <div><span>HTTP</span><strong>${escapeHtml(t.httpStatus ?? '–')}</strong></div>
    <div><span>Erster Scan</span><strong>${escapeHtml(formatDate(t.firstSeenAt,true))}</strong></div>
    <div><span>Plattform-Update</span><strong>${escapeHtml(formatDate(t.lastPlatformUpdateAt,true))}</strong></div>
    <div><span>Code-Update</span><strong>${escapeHtml(formatDate(t.lastSourceUpdateAt,true))}</strong></div>
    <div><span>Änderung erkannt</span><strong>${escapeHtml(formatDate(t.lastChangedAt,true))}</strong></div>
    <div><span>Repository</span><strong>${escapeHtml(t.sourceRepo||'–')}</strong></div>
  </div>`;
}
function openDetails(id) {
  const item = state.items.find(i=>i.id===id); if(!item)return;
  el.detailContent.innerHTML = `<div class="dialog-hero detail-hero"><p class="eyebrow">${escapeHtml(kindLabel[item.kind]||item.kind)} · ${escapeHtml(item.category||'')}</p><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description||'')}</p><div class="detail-statusline"><span class="priority priority-${escapeHtml(item.priority||'mittel')}">Priorität ${escapeHtml(item.priority||'mittel')}</span><span>${escapeHtml(item.phase||'Phase offen')}</span><strong>${clamp(item.progress)}%</strong></div></div>
    <div class="detail-progress"><div><span style="width:${clamp(item.progress)}%"></span></div></div>
    <div class="detail-actions"><button class="btn btn-primary" id="detail-edit" type="button">✎ Bearbeiten</button>${primaryLink(item)?`<a class="btn btn-secondary" href="${escapeHtml(primaryLink(item).url)}" target="_blank" rel="noopener noreferrer">Öffentliche Seite öffnen ↗</a>`:''}</div>
    <div class="detail-tabs" role="tablist"><button class="active" data-detail-tab="overview">Übersicht</button><button data-detail-tab="links">Öffentliche Links & Dateien</button><button data-detail-tab="tech">Technik</button><button data-detail-tab="history">Historie</button></div>
    <section class="detail-panel active" data-detail-panel="overview">
      <div class="detail-grid"><article><span>Ziel</span><p>${escapeHtml(item.objective||'Noch nicht dokumentiert.')}</p></article><article><span>Aktueller Stand</span><p>${escapeHtml(item.currentState||item.statusText||'Noch nicht dokumentiert.')}</p></article></div>
      <div class="focus-card"><span>Nächster sinnvoller Schritt</span><strong>${escapeHtml(item.nextAction||'Noch nicht festgelegt.')}</strong></div>
      <div class="detail-grid"><article><span>Offene Punkte</span>${listMarkup(item.openPoints||[])}</article><article><span>Notizen</span><p class="notes-copy">${escapeHtml(item.notes||'Noch keine eigenen Notizen auf diesem Gerät.')}</p></article></div>
      ${(item.tags||[]).length?`<div class="tag-row">${item.tags.map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div>`:''}
    </section>
    <section class="detail-panel" data-detail-panel="links"><h3>Öffentliche HTTPS-Adressen</h3><div class="resource-list">${linksMarkup(item)}</div><h3>Dateien / interne Projektartefakte</h3>${listMarkup(item.files||[],'Keine Datei zugeordnet.')}</section>
    <section class="detail-panel" data-detail-panel="tech"><h3>Automatisch erkannte Fakten</h3>${technicalMarkup(item)}<p class="dialog-note">Nur öffentliche HTTPS-Seiten werden als Website verlinkt und automatisch fotografiert. Lokale oder interne Pfade bleiben außerhalb der Linkliste.</p></section>
    <section class="detail-panel" data-detail-panel="history"><h3>Projekt-Historie</h3><div class="timeline">${timelineMarkup(item)}</div></section>`;
  $('#detail-edit').addEventListener('click',()=>{el.detail.close();openEditor(id)});
  $$('[data-detail-tab]').forEach(btn=>btn.addEventListener('click',()=>{
    $$('[data-detail-tab]').forEach(x=>x.classList.toggle('active',x===btn));
    $$('[data-detail-panel]').forEach(p=>p.classList.toggle('active',p.dataset.detailPanel===btn.dataset.detailTab));
  }));
  el.detail.showModal();
}

function openEditor(id=null) {
  const item = id ? state.items.find(i=>i.id===id) : {id:'',title:'',kind:'project',priority:'mittel',category:'',phase:'Idee',description:'',currentState:'',nextAction:'',progress:0,status:'draft',openPoints:[],notes:'',links:[]};
  if(!item)return;
  $('#edit-id').value=item.id||'';
  $('#edit-title').value=item.title||'';
  $('#edit-kind').value=item.kind||'project';
  $('#edit-priority').value=item.priority||'mittel';
  $('#edit-category').value=item.category||'';
  $('#edit-phase').value=item.phase||'';
  $('#edit-description').value=item.description||'';
  $('#edit-current').value=item.currentState||'';
  $('#edit-next').value=item.nextAction||'';
  $('#edit-progress').value=clamp(item.progress);
  $('#edit-status').value=item.status||'';
  $('#edit-open').value=(item.openPoints||[]).join('\n');
  $('#edit-notes').value=item.notes||'';
  $('#edit-url').value='';
  $('#editor-title').textContent=id?item.title:'Neuen Eintrag anlegen';
  el.editor.showModal();
}
function saveEditor() {
  const oldId=$('#edit-id').value.trim();
  const title=$('#edit-title').value.trim();
  if(!title)return;
  const id=oldId||`${slugify(title)}-${Date.now().toString().slice(-5)}`;
  const current=state.items.find(i=>i.id===id)||{};
  const existingOverride=state.overrides[id]||{};
  const url=$('#edit-url').value.trim();
  if (url && !isPublicWebUrl(url)) {
    showToast('Nur öffentliche HTTPS-Adressen werden als URL gespeichert.');
    return;
  }
  const newLinks=[...(existingOverride.links||[])].filter(link=>isPublicWebUrl(link.url));
  if(url && !newLinks.some(l=>l.url===url)) newLinks.push({label:'Eigene öffentliche URL',url,kind:'live'});
  state.overrides[id]={
    ...existingOverride,
    title, kind:$('#edit-kind').value, priority:$('#edit-priority').value, category:$('#edit-category').value.trim()||'Eigener Eintrag',
    phase:$('#edit-phase').value.trim(), description:$('#edit-description').value.trim(), currentState:$('#edit-current').value.trim(),
    nextAction:$('#edit-next').value.trim(), progress:clamp($('#edit-progress').value), status:$('#edit-status').value.trim()||current.status||'draft',
    openPoints:$('#edit-open').value.split('\n').map(x=>x.trim()).filter(Boolean), notes:$('#edit-notes').value.trim(), links:newLinks,
    locallyCreated: !oldId && !state.catalog.some(i=>i.id===id) && !state.sites.some(i=>i.id===id)
  };
  saveOverrides(); buildItems(); renderFilters(); renderMetrics(); renderAttention(); render(); el.editor.close(); showToast('Änderungen auf diesem Gerät gespeichert.');
}
function exportOverrides() {
  const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),overrides:state.overrides},null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`olaf-projektzentrale-backup-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(a.href); showToast('Lokale Projektdaten exportiert.');
}
function importOverrides(file) {
  const reader=new FileReader(); reader.onload=()=>{try{const parsed=JSON.parse(reader.result);state.overrides={...state.overrides,...(parsed.overrides||parsed)};saveOverrides();buildItems();renderFilters();renderMetrics();renderAttention();render();showToast('Projektdaten importiert.')}catch{showToast('JSON konnte nicht importiert werden.')}};reader.readAsText(file);
}
function showToast(message) { el.toast.textContent=message;el.toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>el.toast.classList.remove('show'),2400); }

async function init() {
  try {
    const bust=Date.now();
    const [sitesRes,catalogRes]=await Promise.all([fetch(`data/sites.json?v=${bust}`,{cache:'no-store'}),fetch(`data/catalog.json?v=${bust}`,{cache:'no-store'})]);
    if(!sitesRes.ok)throw new Error(`sites.json HTTP ${sitesRes.status}`);
    if(!catalogRes.ok)throw new Error(`catalog.json HTTP ${catalogRes.status}`);
    state.sites=(await sitesRes.json()).sites||[];
    state.catalog=(await catalogRes.json()).items||[];
    buildItems(); renderFilters(); renderMetrics(); renderAttention(); render();
  } catch(error) {
    el.grid.innerHTML=`<div class="empty-state" style="grid-column:1/-1"><div class="empty-mark">!</div><h2>Daten konnten nicht geladen werden</h2><p>${escapeHtml(error.message)}</p></div>`;
  }
}

el.search.addEventListener('input',e=>{state.query=e.target.value.trim();render()});
el.category.addEventListener('change',e=>{state.category=e.target.value;render()});
el.priority.addEventListener('change',e=>{state.priority=e.target.value;render()});
el.status.addEventListener('change',e=>{state.status=e.target.value;render()});
$$('.mode-tab').forEach(btn=>btn.addEventListener('click',()=>{$$('.mode-tab').forEach(x=>x.classList.toggle('active',x===btn));state.kind=btn.dataset.kind;render()}));
el.detailClose.addEventListener('click',()=>el.detail.close());el.detail.addEventListener('click',e=>{if(e.target===el.detail)el.detail.close()});
el.editorClose.addEventListener('click',()=>el.editor.close());el.editorCancel.addEventListener('click',()=>el.editor.close());el.editor.addEventListener('click',e=>{if(e.target===el.editor)el.editor.close()});
el.editorForm.addEventListener('submit',e=>{e.preventDefault();saveEditor()});
el.newItem.addEventListener('click',()=>openEditor());
el.exportButton.addEventListener('click',exportOverrides);el.importButton.addEventListener('click',()=>el.importFile.click());el.importFile.addEventListener('change',e=>{if(e.target.files?.[0])importOverrides(e.target.files[0]);e.target.value=''});

init();
