import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../dist/client/", import.meta.url);
const basePath = "/olaf-tool-command-center";

test("GitHub Pages export contains all routes under the repository base path", async () => {
  await access(new URL(".nojekyll", outputRoot));
  await access(new URL("og-v2.png", outputRoot));
  const routeFiles = [
    ["index.html", /Guten Tag, Olaf\./],
    ["funktionen/index.html", /Wie möchtest du ein Werkzeug finden/],
    ["funktionen/alle/index.html", /Finde genau die Funktion/],
    ["funktionen/kern/index.html", /Deine wichtigsten Werkzeuge/],
    ["funktionen/erweiterungen/index.html", /Ergänzende Funktionen gezielt prüfen/],
    ["funktionen/kategorien/index.html", /Wähle zuerst die Aufgabe/],
    ["prompts/index.html", /Wähle den Prompt/],
    ["workflow/index.html", /Arbeite nicht mit allen Werkzeugen zugleich/],
  ];

  for (const [file, expectedCopy] of routeFiles) {
    const html = await readFile(new URL(file, outputRoot), "utf8");
    assert.match(html, expectedCopy, file);
    assert.match(html, new RegExp(`(?:href|src)="${basePath.replaceAll("/", "\\/")}`), file);
    assert.doesNotMatch(html, /(?:href|src)="\/(?!olaf-tool-command-center(?:\/|"))/, file);

    const assetPaths = [...html.matchAll(/(?:href|src)="(\/olaf-tool-command-center\/_next\/[^"?]+)(?:\?[^" ]*)?"/g)]
      .map((match) => match[1])
      .filter((value, index, values) => values.indexOf(value) === index);

    assert.ok(assetPaths.length > 0, `${file} contains no prefixed assets`);
    for (const assetPath of assetPaths) {
      await access(new URL(assetPath.slice(basePath.length + 1), outputRoot));
    }
  }

  const [home, functionsHub, library, prompts, workflow, manifest] = await Promise.all([
    readFile(new URL("index.html", outputRoot), "utf8"),
    readFile(new URL("funktionen/index.html", outputRoot), "utf8"),
    readFile(new URL("funktionen/alle/index.html", outputRoot), "utf8"),
    readFile(new URL("prompts/index.html", outputRoot), "utf8"),
    readFile(new URL("workflow/index.html", outputRoot), "utf8"),
    readFile(new URL("../server/vinext-prerender.json", outputRoot), "utf8"),
  ]);

  assert.match(home, /alle <!-- -->235<!-- --> Funktionen/);
  assert.match(functionsHub, /13 Kategorien/);
  assert.match(library, /235<\/strong><span>Funktionen gesamt/);
  assert.match(prompts, /236<!-- --> direkt nutzbare Vorlagen/);
  assert.match(workflow, /<h1>Workflow<\/h1>/);

  const prerender = JSON.parse(manifest);
  const expectedRoutes = [
    "/",
    "/funktionen",
    "/funktionen/alle",
    "/funktionen/kern",
    "/funktionen/erweiterungen",
    "/funktionen/kategorien",
    "/prompts",
    "/workflow",
  ];
  const appRoutes = prerender.routes.filter((route) => expectedRoutes.includes(route.route));
  assert.equal(appRoutes.length, expectedRoutes.length);
  assert.ok(appRoutes.every((route) => route.status === "rendered"));
});
