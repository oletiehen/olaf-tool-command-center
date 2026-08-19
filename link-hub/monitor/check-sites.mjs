import { createHash } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const sitesPath = path.join(root, 'public', 'data', 'sites.json');
const catalogPath = path.join(root, 'public', 'data', 'catalog.json');
const previewsDir = path.join(root, 'public', 'previews');
const catalogPreviewsDir = path.join(previewsDir, 'catalog');
const now = new Date().toISOString();
const token = process.env.GITHUB_TOKEN || '';

let browser = null;
let sitesDirty = false;
let catalogDirty = false;

const exists = async file => {
  try { await access(file); return true; } catch { return false; }
};

const hash = value => createHash('sha256').update(value).digest('hex');

function canonicalizeHtml(html) {
  return html
    .replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, (_match, attrs) => `<script${attrs}></script>`)
    .replace(/\s(?:nonce|integrity)=("[^"]*"|'[^']*')/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

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

function isPublicHttps(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const normalizedHost = host.replace(/^\[|\]$/g, '');
    if (url.protocol !== 'https:') return false;
    if (normalizedHost === 'localhost' || normalizedHost.endsWith('.localhost') || normalizedHost.endsWith('.local')) return false;
    if (isPrivateIpv4(normalizedHost) || isPrivateIpv6(normalizedHost)) return false;
    return normalizedHost.includes('.') || normalizedHost.includes(':');
  } catch {
    return false;
  }
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Olaf-Tiehen-Project-Hub-Monitor/2.0',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });
    const text = await response.text();
    return { ok: response.ok, status: response.status, url: response.url, text };
  } finally {
    clearTimeout(timer);
  }
}

async function githubRepo(repo) {
  const headers = { 'User-Agent': 'Olaf-Tiehen-Project-Hub-Monitor/2.0', 'Accept': 'application/vnd.github+json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`https://api.github.com/repos/${repo}`, { headers });
  if (!response.ok) throw new Error(`GitHub ${response.status}`);
  return response.json();
}

async function ensureBrowser() {
  if (browser) return browser;
  const { chromium } = await import('playwright');
  browser = await chromium.launch({ headless: true });
  return browser;
}

async function screenshotUrl(url, file, label) {
  let page;
  try {
    const activeBrowser = await ensureBrowser();
    page = await activeBrowser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(2500);
    const bodyText = await page.locator('body').innerText().catch(() => '');
    if (/Seite konnte nicht geladen werden|Failed to fetch/i.test(bodyText)) {
      console.warn(`[preview] ${label}: rendered content reports a loading failure`);
      return { ok: false, contentStatus: 'failed' };
    }
    await page.screenshot({ path: file, type: 'png', fullPage: false });
    return { ok: true, contentStatus: 'ok' };
  } catch (error) {
    console.warn(`[preview] ${label}: ${error.message}`);
    return { ok: false, contentStatus: 'unavailable' };
  } finally {
    if (page) await page.close().catch(() => {});
  }
}

async function screenshotSite(site) {
  const file = path.join(previewsDir, `${site.id}.png`);
  const result = await screenshotUrl(site.primaryUrl, file, site.id);
  if (site.contentStatus !== result.contentStatus) {
    site.contentStatus = result.contentStatus;
    sitesDirty = true;
  }
  if (result.ok) {
    site.previewImage = `previews/${site.id}.png`;
    site.previewKind = 'website-screenshot';
    site.previewPolicy = 'website-screenshot';
  }
  return result.ok;
}

async function monitorWeb(site) {
  if (!isPublicHttps(site.primaryUrl)) {
    console.warn(`[web] ${site.id}: skipped non-public URL ${site.primaryUrl}`);
    return;
  }

  const previousFingerprint = site.fingerprint;
  const previousHttpStatus = site.lastHttpStatus;
  const previewFile = path.join(previewsDir, `${site.id}.png`);
  let result;

  try {
    result = await fetchText(site.primaryUrl);
  } catch (error) {
    const wasOffline = site.status === 'offline';
    site.lastHttpStatus = 0;
    if (!wasOffline) {
      site.status = 'offline';
      site.lastChangedAt = now;
      sitesDirty = true;
    }
    console.warn(`[web] ${site.id}: ${error.message}`);
    return;
  }

  const fingerprint = hash(canonicalizeHtml(result.text));
  const baseline = !previousFingerprint;
  const contentChanged = Boolean(previousFingerprint && previousFingerprint !== fingerprint);
  const statusChanged = previousHttpStatus !== null && previousHttpStatus !== result.status;
  const wasNotLive = !['live', 'unknown'].includes(site.status);

  if (site.fingerprint !== fingerprint) { site.fingerprint = fingerprint; sitesDirty = true; }
  if (site.lastHttpStatus !== result.status) { site.lastHttpStatus = result.status; sitesDirty = true; }
  if (site.resolvedUrl !== result.url) { site.resolvedUrl = result.url; sitesDirty = true; }

  if (result.ok && site.status !== 'live') {
    site.status = 'live';
    sitesDirty = true;
  } else if (!result.ok && site.status !== 'offline') {
    site.status = 'offline';
    sitesDirty = true;
  }

  if (!site.firstSeenAt && result.ok) {
    site.firstSeenAt = now;
    sitesDirty = true;
  }

  if (!baseline && (contentChanged || statusChanged || wasNotLive)) {
    site.lastChangedAt = now;
    sitesDirty = true;
  }

  const coverOnly = site.previewPolicy === 'cover-only' || site.previewKind === 'ai-cover';
  const needsPreview = !coverOnly && !(await exists(previewFile));
  if (result.ok && !coverOnly && (needsPreview || contentChanged || statusChanged || wasNotLive)) {
    if (await screenshotSite(site)) sitesDirty = true;
  }
}

async function monitorRepo(site) {
  if (!site.sourceRepo) return;
  try {
    const repo = await githubRepo(site.sourceRepo);
    const pushedAt = repo.pushed_at || repo.updated_at || null;
    if (pushedAt && site.lastSourceUpdateAt !== pushedAt) {
      if (site.lastSourceUpdateAt) site.lastChangedAt = now;
      site.lastSourceUpdateAt = pushedAt;
      sitesDirty = true;
    }
    if (!site.firstSeenAt) {
      site.firstSeenAt = now;
      sitesDirty = true;
    }
  } catch (error) {
    console.warn(`[repo] ${site.id}: ${error.message}`);
  }
}

function safeFilePart(value) {
  return String(value || 'link').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'link';
}

async function monitorCatalogLink(item, link, index) {
  if (!isPublicHttps(link.url)) return false;

  const previousFingerprint = link.fingerprint || null;
  const previousStatus = link.lastHttpStatus ?? null;
  let result;

  try {
    result = await fetchText(link.url);
  } catch (error) {
    if (link.lastHttpStatus !== 0) {
      link.lastHttpStatus = 0;
      link.lastCheckedAt = now;
      catalogDirty = true;
    }
    console.warn(`[catalog] ${item.id} ${link.url}: ${error.message}`);
    return false;
  }

  const fingerprint = hash(canonicalizeHtml(result.text));
  const contentChanged = Boolean(previousFingerprint && previousFingerprint !== fingerprint);
  const statusChanged = previousStatus !== null && previousStatus !== result.status;
  const fileName = `${safeFilePart(item.id)}-${index + 1}.png`;
  const file = path.join(catalogPreviewsDir, fileName);
  const previewPath = `previews/catalog/${fileName}`;
  const coverOnly = item.previewPolicy === 'cover-only';
  let metadataChanged = false;

  if (link.fingerprint !== fingerprint) { link.fingerprint = fingerprint; metadataChanged = true; }
  if (link.lastHttpStatus !== result.status) { link.lastHttpStatus = result.status; metadataChanged = true; }
  if (link.resolvedUrl !== result.url) { link.resolvedUrl = result.url; metadataChanged = true; }
  if (metadataChanged) {
    link.lastCheckedAt = now;
    catalogDirty = true;
  }

  const needsPreview = !coverOnly && !(await exists(file));
  const mustRecheckFailedContent = item.previewPolicy === 'recover-to-screenshot' && link.contentStatus === 'failed';
  if (result.ok && !coverOnly && (needsPreview || contentChanged || statusChanged || mustRecheckFailedContent)) {
    const screenshot = await screenshotUrl(link.url, file, `${item.id}#${index + 1}`);
    if (link.contentStatus !== screenshot.contentStatus) {
      link.contentStatus = screenshot.contentStatus;
      if (screenshot.contentStatus === 'ok') delete link.contentMessage;
      catalogDirty = true;
    }
    if (screenshot.ok) {
      if (link.previewImage !== previewPath) link.previewImage = previewPath;
      link.previewKind = 'website-screenshot';
      catalogDirty = true;
    }
  } else if (result.ok && !coverOnly && link.contentStatus !== 'failed' && await exists(file) && link.previewImage !== previewPath) {
    link.previewImage = previewPath;
    link.previewKind = 'website-screenshot';
    catalogDirty = true;
  }

  return result.ok;
}

async function monitorCatalog(catalog) {
  for (const item of catalog.items || []) {
    const publicLinks = (item.links || []).filter(link => isPublicHttps(link.url));
    if (!publicLinks.length) continue;

    console.log(`Checking catalog links for ${item.id}`);
    for (let index = 0; index < publicLinks.length; index++) {
      await monitorCatalogLink(item, publicLinks[index], index);
    }

    if (item.previewPolicy === 'cover-only') continue;
    const preferred = publicLinks.find(link => link.kind === 'live' && link.previewImage) || publicLinks.find(link => link.previewImage);
    if (preferred?.previewImage && item.previewImage !== preferred.previewImage) {
      const recoveredFromCover = item.previewPolicy === 'recover-to-screenshot';
      item.previewImage = preferred.previewImage;
      item.previewKind = 'website-screenshot';
      item.previewPolicy = 'website-screenshot';
      if (recoveredFromCover) {
        item.status = 'active';
        item.phase = 'Öffentlich auf Render veröffentlicht';
        item.statusText = 'Die öffentliche Web-App ist wieder vollständig erreichbar.';
        item.currentState = 'Der Ladefehler wurde behoben und die Projektzentrale zeigt wieder einen echten Website-Screenshot.';
        item.nextAction = 'Produktionsdaten und Inhalt regelmäßig prüfen.';
        item.openPoints = (item.openPoints || []).filter(point => !/Ladefehler/i.test(point));
      }
      catalogDirty = true;
    }
  }
}

async function main() {
  await mkdir(previewsDir, { recursive: true });
  await mkdir(catalogPreviewsDir, { recursive: true });

  const sites = JSON.parse(await readFile(sitesPath, 'utf8'));
  const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));

  for (const site of sites.sites) {
    console.log(`Checking ${site.id} (${site.monitorMode})`);
    if (site.monitorMode === 'web') await monitorWeb(site);
    if (site.monitorMode === 'repo') await monitorRepo(site);
  }

  await monitorCatalog(catalog);

  if (browser) await browser.close();

  if (sitesDirty) {
    sites.meta.generatedAt = now;
    sites.meta.version = Number(sites.meta.version || 0) + 1;
    await writeFile(sitesPath, `${JSON.stringify(sites, null, 2)}\n`, 'utf8');
  }

  if (catalogDirty) {
    catalog.meta.updatedAt = now;
    catalog.meta.version = Number(catalog.meta.version || 0) + 1;
    await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  }

  if (sitesDirty || catalogDirty) console.log('Project hub monitoring updated data and/or previews.');
  else console.log('No project changes detected. Nothing to commit.');
}

main().catch(async error => {
  if (browser) await browser.close().catch(() => {});
  console.error(error);
  process.exitCode = 1;
});
