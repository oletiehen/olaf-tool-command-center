import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
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

test("server-renders all four app routes", async () => {
  const routes = [
    ["/", /Guten Tag, Olaf\./],
    ["/funktionen", /Finde genau die Funktion/],
    ["/workflow", /Arbeite nicht mit allen Werkzeugen zugleich/],
    ["/prompts", /Wähle den Prompt/],
  ];

  for (const [pathname, expectedCopy] of routes) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

    const html = await response.text();
    assert.match(html, /<html lang="de">/i);
    assert.match(html, /Olaf · Tool Command Center/i);
    assert.match(html, expectedCopy);
    assert.match(html, /Dashboard/);
    assert.match(html, /Funktionen/);
    assert.match(html, /Workflow/);
    assert.match(html, /Prompts/);
    assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
  }
});

test("contains the 29-function core, the deduplicated screenshot catalog and all interaction surfaces", async () => {
  const [data, catalog, shell, library, workflowBoard, promptStudio, css, layout, packageJson, nextConfig, pagesWorkflow, og] = await Promise.all([
    readFile(new URL("../app/tool-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/plugin-catalog.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/AppShell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ToolLibrary.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/WorkflowBoard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/PromptStudio.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8"),
    stat(new URL("../public/og-v2.png", import.meta.url)),
  ]);

  const coreToolIds = data.match(/^\s{4}id: "/gm) ?? [];
  const coreToolNames = [...data.matchAll(/^\s{4}name: "([^"]+)",/gm)].map((match) => match[1]);
  const catalogNames = [...catalog.matchAll(/^\s{4}\["([^"]+)",/gm)].map((match) => match[1]);
  const normalizedCoreNames = new Set(coreToolNames.map((name) => name.toLocaleLowerCase("de")));
  const normalizedCatalogNames = catalogNames.map((name) => name.toLocaleLowerCase("de"));

  assert.equal(coreToolIds.length, 29);
  assert.equal(coreToolNames.length, 29);
  assert.equal(catalogNames.length, 206);
  assert.equal(new Set(normalizedCatalogNames).size, catalogNames.length, "screenshot catalog contains duplicates");
  assert.deepEqual(
    catalogNames.filter((name) => normalizedCoreNames.has(name.toLocaleLowerCase("de"))),
    [],
    "screenshot catalog duplicates the personal core",
  );

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

  for (const name of ["GitHub", "Figma", "Supabase", "Vercel", "Remotion", "HeyGen", "Dovetail"]) {
    assert.match(catalog, new RegExp(`\\["${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
  }

  for (const href of ["/", "/funktionen", "/workflow", "/prompts"]) {
    assert.match(shell, new RegExp(`href: "${href.replace("/", "\\/")}"`));
  }
  assert.match(shell, /app-mobile-nav/);
  assert.match(shell, /router\.push/);

  assert.match(library, /type="search"/);
  assert.match(library, /Projektfokus/);
  assert.match(library, /Priorität/);
  assert.match(library, /Quelle &amp; Status/);
  assert.match(library, /PAGE_SIZE = 48/);
  assert.match(library, /availabilityLabels/);
  assert.match(library, /showModal\(\)/);
  assert.match(library, /navigator\.clipboard\.writeText/);
  assert.match(workflowBoard, /workflow\.map/);
  assert.match(workflowBoard, /setActiveIndex/);
  assert.match(promptStudio, /masterPrompt/);
  assert.match(promptStudio, /sourceOptions/);
  assert.match(promptStudio, /navigator\.clipboard\.writeText/);

  assert.match(css, /@media \(max-width: 860px\)/);
  assert.match(css, /@media \(max-width: 360px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.app-mobile-nav/);
  assert.match(css, /\.app-sidebar/);
  assert.match(layout, /openGraph/);
  assert.match(layout, /twitter/);
  assert.doesNotMatch(layout, /headers\(\)/);
  assert.match(nextConfig, /output: "export"/);
  assert.match(nextConfig, /basePath/);
  assert.match(pagesWorkflow, /actions\/deploy-pages@v4/);
  assert.match(pagesWorkflow, /NEXT_PUBLIC_BASE_PATH: \/olaf-tool-command-center/);
  assert.match(pagesWorkflow, /path: dist\/client/);
  assert.match(packageJson, /"build:pages"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.ok(og.size > 100_000);

  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
});
