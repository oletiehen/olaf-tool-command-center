import { createHash } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dataPath = path.join(root, 'public', 'data', 'sites.json');
const previewsDir = path.join(root, 'public', 'previews');
const now = new Date().toISOString();
const token = process.env.GITHUB_TOKEN || '';

let browser = null;
let dirty = false;

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

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Olaf-Tiehen-Project-Hub-Monitor/1.0',
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
  const headers = { 'User-Agent': 'Olaf-Tiehen-Project-Hub-Monitor/1.0', 'Accept': 'application/vnd.github+json' };
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

async function screenshot(site) {
  try {
    const activeBrowser = await ensureBrowser();
    const page = await activeBrowser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    await page.goto(site.primaryUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(2500);
    const file = path.join(previewsDir, `${site.id}.png`);
    await page.screenshot({ path: file, type: 'png', fullPage: false });
    await page.close();
    site.previewImage = `previews/${site.id}.png`;
    return true;
  } catch (error) {
    console.warn(`[preview] ${site.id}: ${error.message}`);
    return false;
  }
}

async function monitorWeb(site) {
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
      dirty = true;
    }
    console.warn(`[web] ${site.id}: ${error.message}`);
    return;
  }

  const fingerprint = hash(canonicalizeHtml(result.text));
  const baseline = !previousFingerprint;
  const contentChanged = Boolean(previousFingerprint && previousFingerprint !== fingerprint);
  const statusChanged = previousHttpStatus !== null && previousHttpStatus !== result.status;
  const wasNotLive = !['live', 'unknown'].includes(site.status);

  if (site.fingerprint !== fingerprint) { site.fingerprint = fingerprint; dirty = true; }
  if (site.lastHttpStatus !== result.status) { site.lastHttpStatus = result.status; dirty = true; }
  if (site.resolvedUrl !== result.url) { site.resolvedUrl = result.url; dirty = true; }

  if (result.ok && site.status !== 'live') {
    site.status = 'live';
    dirty = true;
  } else if (!result.ok && site.status !== 'offline') {
    site.status = 'offline';
    dirty = true;
  }

  if (!site.firstSeenAt && result.ok) {
    site.firstSeenAt = now;
    dirty = true;
  }

  if (!baseline && (contentChanged || statusChanged || wasNotLive)) {
    site.lastChangedAt = now;
    dirty = true;
  }

  const needsPreview = !(await exists(previewFile));
  if (result.ok && (needsPreview || contentChanged || statusChanged || wasNotLive)) {
    if (await screenshot(site)) dirty = true;
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
      dirty = true;
    }
    if (!site.firstSeenAt) {
      site.firstSeenAt = now;
      dirty = true;
    }
  } catch (error) {
    console.warn(`[repo] ${site.id}: ${error.message}`);
  }
}

async function main() {
  await mkdir(previewsDir, { recursive: true });
  const data = JSON.parse(await readFile(dataPath, 'utf8'));

  for (const site of data.sites) {
    console.log(`Checking ${site.id} (${site.monitorMode})`);
    if (site.monitorMode === 'web') await monitorWeb(site);
    if (site.monitorMode === 'repo') await monitorRepo(site);
  }

  if (browser) await browser.close();

  if (dirty) {
    data.meta.generatedAt = now;
    data.meta.version = Number(data.meta.version || 0) + 1;
    await writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    console.log('Project hub data changed. Files updated.');
  } else {
    console.log('No project changes detected. Nothing to commit.');
  }
}

main().catch(async error => {
  if (browser) await browser.close().catch(() => {});
  console.error(error);
  process.exitCode = 1;
});
