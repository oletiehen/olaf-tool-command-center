import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const publicRoot = path.join(root, 'public');
const catalog = JSON.parse(await readFile(path.join(publicRoot, 'data', 'catalog.json'), 'utf8'));
const sites = JSON.parse(await readFile(path.join(publicRoot, 'data', 'sites.json'), 'utf8'));
const errors = [];

function isPrivateIpv4(host) {
  const parts = host.split('.').map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return false;
  const [a, b] = parts;
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

function isPrivateIpv6(host) {
  const normalized = host.replace(/^\[|\]$/g, '').toLowerCase();
  return normalized === '::' || normalized === '::1' || normalized.startsWith('fc') || normalized.startsWith('fd') || /^fe[89ab]/.test(normalized);
}

function isPublicHttps(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
    return url.protocol === 'https:' &&
      host !== 'localhost' &&
      !host.endsWith('.localhost') &&
      !host.endsWith('.local') &&
      !isPrivateIpv4(host) &&
      !isPrivateIpv6(host) &&
      (host.includes('.') || host.includes(':'));
  } catch {
    return false;
  }
}

async function validatePreview(owner, previewImage, previewKind, previewPolicy) {
  if (previewPolicy && !['cover-only', 'website-screenshot', 'no-preview'].includes(previewPolicy)) errors.push(`${owner}: previewPolicy ist ungültig`);
  if (previewPolicy === 'no-preview') {
    if (previewImage || previewKind) errors.push(`${owner}: no-preview darf kein Vorschaubild referenzieren`);
    return;
  }
  if (!previewImage) return;
  if (!['ai-cover', 'website-screenshot'].includes(previewKind)) errors.push(`${owner}: previewKind fehlt oder ist ungültig`);
  if (previewKind === 'ai-cover' && previewPolicy !== 'cover-only') errors.push(`${owner}: KI-Cover muss cover-only sein`);
  if (previewKind === 'website-screenshot' && previewPolicy !== 'website-screenshot') errors.push(`${owner}: Screenshot-Policy fehlt`);
  if (/^[a-z][a-z0-9+.-]*:/i.test(previewImage)) {
    errors.push(`${owner}: Vorschaubild muss als lokales, geprüftes Asset vorliegen`);
    return;
  }
  const resolved = path.resolve(publicRoot, previewImage);
  if (!resolved.startsWith(`${publicRoot}${path.sep}`)) {
    errors.push(`${owner}: Vorschaubild verlässt das Publish-Verzeichnis`);
    return;
  }
  try { await access(resolved); } catch { errors.push(`${owner}: Vorschaubild fehlt (${previewImage})`); }
}

for (const item of catalog.items || []) {
  for (const link of item.links || []) {
    if (!isPublicHttps(link.url)) errors.push(`catalog:${item.id}: nicht öffentliche URL (${link.url})`);
  }
  await validatePreview(`catalog:${item.id}`, item.previewImage, item.previewKind, item.previewPolicy);
}

for (const site of sites.sites || []) {
  if (!isPublicHttps(site.primaryUrl)) errors.push(`sites:${site.id}: nicht öffentliche primaryUrl (${site.primaryUrl})`);
  for (const link of site.links || []) {
    if (!isPublicHttps(link.url)) errors.push(`sites:${site.id}: nicht öffentliche URL (${link.url})`);
  }
  await validatePreview(`sites:${site.id}`, site.previewImage, site.previewKind, site.previewPolicy);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated ${catalog.items.length} catalog items and ${sites.sites.length} monitored sites.`);
}
