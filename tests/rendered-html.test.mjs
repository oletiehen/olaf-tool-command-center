import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html", host: "localhost" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Tool Command Center", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="de">/i);
  assert.match(html, /<title>Olaf · Tool Command Center<\/title>/i);
  assert.match(html, /Das richtige Werkzeug\./);
  assert.match(html, /29 Funktionen/);
  assert.match(html, /Werkzeug finden/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("contains all 29 functions and the requested interaction surfaces", async () => {
  const [data, component, css, layout, packageJson, og] = await Promise.all([
    readFile(new URL("../app/tool-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/CommandCenter.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    stat(new URL("../public/og.png", import.meta.url)),
  ]);

  const toolIds = data.match(/^\s{4}id: /gm) ?? [];
  assert.equal(toolIds.length, 29);

  for (const name of [
    "Planmodus",
    "Ziel verfolgen",
    "Sites",
    "Build Web Apps",
    "Canva",
    "Clay",
    "Data Analytics",
    "GetYourGuide",
  ]) {
    assert.match(data, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(component, /type="search"/);
  assert.match(component, /Projektfokus/);
  assert.match(component, /Priorität/);
  assert.match(component, /showModal\(\)/);
  assert.match(component, /navigator\.clipboard\.writeText/);
  assert.match(component, /workflow\.map/);
  assert.match(component, /masterPrompt/);

  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /@media \(max-width: 370px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.mobile-nav/);
  assert.match(layout, /openGraph/);
  assert.match(layout, /twitter/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.ok(og.size > 100_000);

  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
});
