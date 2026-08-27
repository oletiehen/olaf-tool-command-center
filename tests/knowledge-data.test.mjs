import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readJson(pathname) {
  return JSON.parse(await readFile(new URL(pathname, import.meta.url), "utf8"));
}

const publicationPatterns = [
  /instagram\.com\/[^/]+\/(?:reel|p)\//,
  /tiktok\.com\/@[^/]+\/video\//,
  /youtube\.com\/(?:shorts\/|watch)/,
  /linkedin\.com\/(?:feed\/update|posts)/,
  /podcasts\.apple\.com\/.*[?&]i=/,
  /(?:podcasters\.spotify\.com|open\.spotify\.com)\/.*episode/,
];

function isPublicationUrl(value) {
  return publicationPatterns.some((pattern) => pattern.test(value));
}

test("cumulative Niklas knowledge is complete, unique and actionable", async () => {
  const [items, manifest] = await Promise.all([
    readJson("../app/knowledge/niklas-insights.json"),
    readJson("../app/knowledge/migration-manifest.json"),
  ]);

  assert.equal(items.length, 66);
  assert.equal(manifest.mergedNiklasCount, items.length);
  assert.equal(manifest.legacyNiklasCount, 11);
  assert.equal(new Set(items.map((item) => item.id)).size, items.length, "duplicate insight IDs");

  for (const item of items) {
    assert.ok(item.id && item.date && item.title && item.what && item.benefit, item.id);
    assert.ok(item.category && item.status && item.priority, item.id);
    assert.ok(item.projects.length > 0, `${item.id} has no project mapping`);
    assert.ok(item.steps.length > 0, `${item.id} has no implementation steps`);
    assert.ok(item.prompts.length > 0 && item.prompts[0].text.length > 80, `${item.id} has no usable prompt`);
    assert.ok(item.opportunities.length > 0, `${item.id} has no opportunity suggestion`);
    assert.equal("prompt" in item, false, `${item.id} contains a deprecated duplicate prompt field`);
    for (const link of item.links) {
      assert.match(link.url, /^https?:\/\//, `${item.id} has an invalid link`);
      assert.doesNotMatch(link.url, /%60/, `${item.id} contains an encoded Markdown backtick`);
    }
  }

  const currentItems = items.filter((item) => item.date === "2026-08-27");
  assert.deepEqual(
    new Set(currentItems.map((item) => item.title)),
    new Set([
      "Anthropic-Marketing-Plugin für Claude",
      "Maxi Raabe verlässt den KI-Talk",
      "Raumdesign mit ChatGPT unter 500 Euro",
    ]),
  );

  const priorDayTitles = new Set(items.filter((item) => item.date === "2026-08-26").map((item) => item.title));
  assert.ok(priorDayTitles.has("Fünf ChatGPT-Fragen für einen ehrlichen Selbstcheck"));
  assert.ok(priorDayTitles.has("Kontextbewusste KI: mehr Hilfe, aber nur mit klaren Grenzen"));

  const currentPublicationUrls = currentItems.flatMap((item) => item.links.map((link) => link.url)).filter(isPublicationUrl);
  for (const expectedId of ["DchA550McS8", "7678432219001539873", "alFC-QiA9_M", "1000786259830", "Dci9LVDsL1l"]) {
    assert.ok(currentPublicationUrls.some((url) => url.includes(expectedId)), `missing current publication ${expectedId}`);
  }

  const allPublicationUrls = items.flatMap((item) => item.links.map((link) => link.url)).filter(isPublicationUrl);
  assert.equal(new Set(allPublicationUrls).size, allPublicationUrls.length, "publication URL occurs in multiple insights");
});

test("migrated Codex navigator retains capabilities and practice prompts", async () => {
  const [navigator, manifest] = await Promise.all([
    readJson("../app/knowledge/codex-navigator.json"),
    readJson("../app/knowledge/migration-manifest.json"),
  ]);
  const capabilities = navigator.categories.flatMap((category) => category.items);

  assert.equal(capabilities.length, 37);
  assert.equal(navigator.practiceExamples.length, 24);
  assert.equal(manifest.codexCapabilityCount, capabilities.length);
  assert.equal(manifest.codexExampleCount, navigator.practiceExamples.length);
  assert.equal(new Set(capabilities.map((item) => item.id)).size, capabilities.length);
  assert.ok(capabilities.every((item) => item.summary && item.actions.length && item.boundary));
  assert.ok(navigator.practiceExamples.every((item) => item.prompt.length > 100 && item.guardrail));
});
