const state = {
  data: null,
  query: '',
  platform: 'all',
  status: 'all',
  category: 'all'
};

const el = {
  grid: document.querySelector('#project-grid'),
  empty: document.querySelector('#empty-state'),
  search: document.querySelector('#search-input'),
  platform: document.querySelector('#platform-filter'),
  status: document.querySelector('#status-filter'),
  chips: document.querySelector('#category-chips'),
  count: document.querySelector('#result-count'),
  total: document.querySelector('#metric-total'),
  live: document.querySelector('#metric-live'),
  platforms: document.querySelector('#metric-platforms'),
  latest: document.querySelector('#metric-latest'),
  version: document.querySelector('#data-version'),
  dialog: document.querySelector('#detail-dialog'),
  dialogContent: document.querySelector('#dialog-content'),
  dialogClose: document.querySelector('#dialog-close')
};

const statusLabel = {
  live: 'Live',
  repository: 'Repository',
  unknown: 'Ungeprüft',
  'needs-link': 'Link ergänzen',
  offline: 'Nicht erreichbar'
};

const featured = new Set([
  'olaf-wissens-hub',
  'olaf-tool-command-center',
  'codex-faehigkeiten-navigator',
  'harbor-ai-support'
]);

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value, short = false) {
  if (!value) return 'Noch nicht erfasst';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Noch nicht erfasst';
  return new Intl.DateTimeFormat('de-DE', short
    ? { day: '2-digit', month: '2-digit', year: '2-digit' }
    : { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  ).format(date);
}

function latestDate(site) {
  const candidates = [site.lastChangedAt, site.lastPublishedAt, site.lastPlatformUpdateAt, site.lastSourceUpdateAt]
    .filter(Boolean)
    .map(value => new Date(value))
    .filter(date => !Number.isNaN(date.getTime()));
  if (!candidates.length) return null;
  return new Date(Math.max(...candidates.map(date => date.getTime())));
}

function publicationValue(site) {
  return site.lastPublishedAt || site.lastPlatformUpdateAt || site.lastSourceUpdateAt || null;
}

function previewMarkup(site) {
  if (site.previewImage) {
    return `<img src="${escapeHtml(site.previewImage)}" alt="Vorschau von ${escapeHtml(site.title)}" loading="lazy" data-preview>`;
  }
  return `<div class="preview-fallback"><span>OT</span></div>`;
}

function primaryAction(site) {
  const live = (site.links || []).find(link => link.kind === 'live');
  const target = live?.url || site.primaryUrl;
  const label = live ? 'Öffnen ↗' : 'Projekt öffnen ↗';
  return `<a class="btn btn-primary" href="${escapeHtml(target)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

function cardMarkup(site) {
  const publication = publicationValue(site);
  return `
    <article class="project-card ${featured.has(site.id) ? 'featured' : ''}" data-id="${escapeHtml(site.id)}">
      <div class="preview">
        ${previewMarkup(site)}
        <span class="platform-tag">${escapeHtml(site.platform)}</span>
      </div>
      <div class="card-body">
        <div class="card-topline">
          <span class="category">${escapeHtml(site.category)}</span>
          <span class="status status-${escapeHtml(site.status)}">${escapeHtml(statusLabel[site.status] || site.status)}</span>
        </div>
        <h3>${escapeHtml(site.title)}</h3>
        <p class="description">${escapeHtml(site.description)}</p>
        <div class="date-grid">
          <div class="date-box"><span>Veröffentlichung / Update</span><strong>${escapeHtml(formatDate(publication, true))}</strong></div>
          <div class="date-box"><span>Änderung erkannt</span><strong>${escapeHtml(formatDate(site.lastChangedAt, true))}</strong></div>
        </div>
        <div class="card-actions">
          ${primaryAction(site)}
          <button class="btn btn-secondary detail-button" type="button" data-detail="${escapeHtml(site.id)}">Details</button>
        </div>
      </div>
    </article>`;
}

function matches(site) {
  const haystack = [site.title, site.category, site.platform, site.description, ...(site.links || []).map(link => link.label)].join(' ').toLowerCase();
  const queryMatch = !state.query || haystack.includes(state.query.toLowerCase());
  const platformMatch = state.platform === 'all' || site.platform === state.platform;
  const statusMatch = state.status === 'all' || site.status === state.status;
  const categoryMatch = state.category === 'all' || site.category === state.category;
  return queryMatch && platformMatch && statusMatch && categoryMatch;
}

function render() {
  if (!state.data) return;
  const sites = [...state.data.sites].filter(matches).sort((a, b) => {
    const aFeatured = featured.has(a.id) ? 1 : 0;
    const bFeatured = featured.has(b.id) ? 1 : 0;
    if (aFeatured !== bFeatured) return bFeatured - aFeatured;
    const aDate = latestDate(a)?.getTime() || 0;
    const bDate = latestDate(b)?.getTime() || 0;
    return bDate - aDate;
  });
  el.grid.innerHTML = sites.map(cardMarkup).join('');
  el.empty.hidden = sites.length > 0;
  el.count.textContent = `${sites.length} von ${state.data.sites.length}`;

  document.querySelectorAll('[data-preview]').forEach(img => {
    img.addEventListener('error', () => {
      img.replaceWith(Object.assign(document.createElement('div'), { className: 'preview-fallback', innerHTML: '<span>OT</span>' }));
    }, { once: true });
  });
  document.querySelectorAll('.detail-button').forEach(button => {
    button.addEventListener('click', () => openDetails(button.dataset.detail));
  });
}

function renderChips() {
  const categories = [...new Set(state.data.sites.map(site => site.category))].sort((a, b) => a.localeCompare(b, 'de'));
  const values = ['all', ...categories];
  el.chips.innerHTML = values.map(category => `<button type="button" class="chip ${state.category === category ? 'active' : ''}" data-category="${escapeHtml(category)}">${category === 'all' ? 'Alle' : escapeHtml(category)}</button>`).join('');
  el.chips.querySelectorAll('.chip').forEach(button => button.addEventListener('click', () => {
    state.category = button.dataset.category;
    renderChips();
    render();
  }));
}

function renderPlatformOptions() {
  const platforms = [...new Set(state.data.sites.map(site => site.platform))].sort((a, b) => a.localeCompare(b, 'de'));
  el.platform.insertAdjacentHTML('beforeend', platforms.map(platform => `<option value="${escapeHtml(platform)}">${escapeHtml(platform)}</option>`).join(''));
}

function renderMetrics() {
  const sites = state.data.sites;
  el.total.textContent = sites.length;
  el.live.textContent = sites.filter(site => site.status === 'live').length;
  el.platforms.textContent = new Set(sites.map(site => site.platform)).size;
  const dated = sites.map(site => latestDate(site)).filter(Boolean).sort((a, b) => b - a);
  el.latest.textContent = dated[0] ? formatDate(dated[0], true) : '–';
  const generated = state.data.meta?.generatedAt ? formatDate(state.data.meta.generatedAt) : 'unbekannt';
  el.version.textContent = `Datenstand ${generated} · Prüfung ${state.data.meta?.monitoring || 'automatisch'}`;
}

function openDetails(id) {
  const site = state.data.sites.find(item => item.id === id);
  if (!site) return;
  const publicationLabel = site.lastPublishedAt ? 'Letzte Veröffentlichung' : site.lastPlatformUpdateAt ? 'Plattform-Update' : 'Quellcode-Update';
  const links = (site.links || []).map(link => `
    <a class="dialog-link" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">
      <span><strong>${escapeHtml(link.label)}</strong><br><small>${escapeHtml(link.url)}</small></span><span>↗</span>
    </a>`).join('');

  el.dialogContent.innerHTML = `
    <div class="dialog-hero">
      <p class="eyebrow">${escapeHtml(site.category)} · ${escapeHtml(site.platform)}</p>
      <h2>${escapeHtml(site.title)}</h2>
      <p>${escapeHtml(site.description)}</p>
    </div>
    <div class="dialog-meta">
      <div><span>Status</span><strong>${escapeHtml(statusLabel[site.status] || site.status)}</strong></div>
      <div><span>${escapeHtml(publicationLabel)}</span><strong>${escapeHtml(formatDate(publicationValue(site)))}</strong></div>
      <div><span>Änderung erkannt</span><strong>${escapeHtml(formatDate(site.lastChangedAt))}</strong></div>
    </div>
    <div class="dialog-links">${links}</div>
    <div class="dialog-note">„Letzte Veröffentlichung“ wird nur angezeigt, wenn die Plattform einen belastbaren Veröffentlichungszeitpunkt liefert. Sonst zeigt die Zentrale bewusst den letzten Plattform- oder Quellcode-Stand.</div>`;
  el.dialog.showModal();
}

async function init() {
  try {
    const response = await fetch(`data/sites.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.data = await response.json();
    renderPlatformOptions();
    renderChips();
    renderMetrics();
    render();
  } catch (error) {
    el.grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-mark">!</div><h2>Daten konnten nicht geladen werden</h2><p>${escapeHtml(error.message)}</p></div>`;
  }
}

el.search.addEventListener('input', event => { state.query = event.target.value.trim(); render(); });
el.platform.addEventListener('change', event => { state.platform = event.target.value; render(); });
el.status.addEventListener('change', event => { state.status = event.target.value; render(); });
el.dialogClose.addEventListener('click', () => el.dialog.close());
el.dialog.addEventListener('click', event => { if (event.target === el.dialog) el.dialog.close(); });

init();
