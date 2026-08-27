import { gunzipSync } from "node:zlib";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "app", "knowledge");
const archiveRoot = process.env.NIKLAS_ARCHIVE_ROOT;

if (!archiveRoot) {
  throw new Error("Set NIKLAS_ARCHIVE_ROOT to the folder containing the dated Niklas monitoring runs.");
}

const legacyDashboardPayload =
  "https://olaf-projektzentrale.onrender.com/apps/niklas-volland/payload-001.txt";
const codexNavigatorData =
  "https://oletiehen.github.io/codex-faehigkeiten-navigator/assets/data.js";

async function fetchText(url) {
  const response = await fetch(url, { headers: { accept: "text/plain,*/*" } });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.text();
}

function extractJsonBetween(source, prefix, suffix) {
  const start = source.indexOf(prefix);
  if (start === -1) throw new Error(`Could not find ${prefix}`);
  const jsonStart = start + prefix.length;
  const end = source.indexOf(suffix, jsonStart);
  if (end === -1) throw new Error(`Could not find ${suffix}`);
  return JSON.parse(source.slice(jsonStart, end));
}

async function loadLegacyNiklasInsights() {
  const payload = (await fetchText(legacyDashboardPayload)).trim();
  const html = gunzipSync(Buffer.from(payload, "base64")).toString("utf8");
  return extractJsonBetween(html, "const seedInsights=", ";const strategy=");
}

async function loadCodexNavigator() {
  const source = await fetchText(codexNavigatorData);
  const jsonStart = source.indexOf("{");
  const jsonEnd = source.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) throw new Error("Codex navigator data is not valid JavaScript data.");
  return JSON.parse(source.slice(jsonStart, jsonEnd + 1));
}

async function loadJsonIfPresent(filename) {
  try {
    return JSON.parse(await readFile(path.join(outputRoot, filename), "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

async function loadKnowledgeSeeds() {
  const [existingNiklas, existingCodex, existingManifest] = await Promise.all([
    loadJsonIfPresent("niklas-insights.json"),
    loadJsonIfPresent("codex-navigator.json"),
    loadJsonIfPresent("migration-manifest.json"),
  ]);

  const [niklas, codex] = await Promise.all([
    existingNiklas ? Promise.resolve(existingNiklas) : loadLegacyNiklasInsights(),
    existingCodex ? Promise.resolve(existingCodex) : loadCodexNavigator(),
  ]);

  return {
    niklas,
    codex,
    existingManifest,
    usedCommittedNiklasSeed: Boolean(existingNiklas),
    usedCommittedCodexSeed: Boolean(existingCodex),
  };
}

function cleanMarkdown(value) {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/[`*_>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTitle(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("de")
    .replace(/\b(?:beitrag|video|short|reel|podcast|linkedin|instagram|tiktok|youtube)\b/g, " ")
    .replace(/[^a-z0-9äöüß]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slug(value) {
  return normalizeTitle(value)
    .replace(/[ä]/g, "ae")
    .replace(/[ö]/g, "oe")
    .replace(/[ü]/g, "ue")
    .replace(/[ß]/g, "ss")
    .replace(/\s+/g, "-")
    .slice(0, 72);
}

function normalizedUrl(value) {
  try {
    const url = new URL(value);
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(?:utm_|si$|feature$|ref$|source$)/i.test(key)) url.searchParams.delete(key);
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return value;
  }
}

function isPublicationUrl(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    const pathAndQuery = `${url.pathname}${url.search}`;
    if (host === "instagram.com") return /\/(?:reel|p)\//.test(url.pathname);
    if (host === "tiktok.com") return /\/@[^/]+\/video\//.test(url.pathname);
    if (host === "youtube.com" || host === "youtu.be") return /\/(?:shorts\/|watch|[^/]+$)/.test(pathAndQuery);
    if (host === "linkedin.com") return /(?:activity|posts|feed\/update)/.test(pathAndQuery);
    if (host === "podcasts.apple.com") return url.searchParams.has("i");
    if (host === "podcasters.spotify.com" || host === "open.spotify.com") return /episode/.test(pathAndQuery);
    if (host.endsWith("beehiiv.com")) return /\/p\//.test(url.pathname);
    return false;
  } catch {
    return false;
  }
}

function titleSimilarity(left, right) {
  const a = new Set(normalizeTitle(left).split(" ").filter((word) => word.length > 2));
  const b = new Set(normalizeTitle(right).split(" ").filter((word) => word.length > 2));
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter((word) => b.has(word)).length;
  return intersection / new Set([...a, ...b]).size;
}

function extractUrls(body) {
  const matches = body.match(/https?:\/\/[^\s)>\]|"'`]+/g) ?? [];
  return [...new Set(matches.map((url) => normalizedUrl(url.replace(/[.,;:]$/, ""))))];
}

function extractReportDate(filename) {
  return filename.match(/(20\d{2}-\d{2}-\d{2})/)?.[1] ?? null;
}

function extractPublicationRows(lines) {
  return lines.flatMap((line) => {
    if (!/^\s*\|/.test(line) || !/https?:\/\//.test(line)) return [];
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    const links = extractUrls(line).filter(isPublicationUrl);
    if (!links.length) return [];
    const platform = cells
      .map(cleanMarkdown)
      .find((cell) => /^(?:Instagram|TikTok|YouTube(?: Shorts)?|LinkedIn|Podcast|Spotify|Apple Podcasts)$/i.test(cell));
    return [{
      cells: cells.map(cleanMarkdown).filter(Boolean),
      links,
      platform: platform ?? "Plattform",
    }];
  });
}

function extractContributionSections(markdown, filename) {
  const lines = markdown.split(/\r?\n/);
  const headings = [];
  const publicationRows = extractPublicationRows(lines);

  lines.forEach((line, index) => {
    const match = line.match(/^(#{2,3})\s+(?:(?:Beitrag\s+)?\d+[.:]\s+)(.+)$/i);
    if (match) headings.push({ index, level: match[1].length, title: cleanMarkdown(match[2]) });
  });

  const date = extractReportDate(filename);
  return headings.map((heading) => {
    const nextHeadingOffset = lines
      .slice(heading.index + 1)
      .findIndex((line) => {
        const match = line.match(/^(#{2,6})\s+/);
        return Boolean(match && match[1].length <= heading.level);
      });
    const sectionEnd = nextHeadingOffset === -1
      ? lines.length
      : heading.index + 1 + nextHeadingOffset;
    const bodyLines = lines.slice(heading.index + 1, sectionEnd);
    const prose = bodyLines.filter((line) => {
      const trimmed = line.trim();
      if (!trimmed || /^#{2,6}\s/.test(trimmed) || /^\|/.test(trimmed)) return false;
      if (/^[-*]\s+\*\*(?:Plattform|Zeit|Quelle|Status|Transkript)/i.test(trimmed)) return false;
      if (/^(?:\[?\d{2}:\d{2}|\d{2}:\d{2}\s*[–-])/.test(trimmed)) return false;
      return !/^https?:\/\//.test(trimmed);
    });
    const fullSummary = cleanMarkdown(prose.slice(0, 6).join(" "));
    const summary = fullSummary.length > 900
      ? `${fullSummary.slice(0, 896).replace(/\s+\S*$/, "")} …`
      : fullSummary;
    const bulletTips = bodyLines
      .map((line) => line.match(/^\s*[-*]\s+(.+)$/)?.[1])
      .filter(Boolean)
      .map(cleanMarkdown)
      .filter((line) => line.length >= 18 && line.length <= 280)
      .slice(0, 5);
    const publicationLinks = publicationRows.flatMap((row) => {
      const bestCellScore = Math.max(...row.cells.map((cell) => titleSimilarity(heading.title, cell)));
      return bestCellScore >= 0.22 ? row.links : [];
    });

    return {
      date,
      title: heading.title.replace(/\s+[—–-]\s+\d{1,2}:\d{2}(?:\s+.*)?$/, "").trim(),
      summary,
      tips: bulletTips,
      links: [...new Set([...publicationLinks, ...extractUrls(bodyLines.join("\n"))])],
      reportFile: filename,
      rawBody: bodyLines.join("\n"),
    };
  });
}

async function findReportFiles() {
  const dayFolders = (await readdir(archiveRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && /^20\d{2}-\d{2}-\d{2}$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  const files = [];

  for (const day of dayFolders) {
    const outputDir = path.join(archiveRoot, day, "jeden-abend-alle-neuen-beitr-ge", "outputs");
    let entries;
    try {
      entries = await readdir(outputDir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (
        /niklas-volland-tagesbericht\.md$/i.test(entry.name)
        || /^Tagesbericht_Niklas_Volland_.*\.md$/i.test(entry.name)
        || entry.name === "2026-08-16-niklas-volland-transkripte-quellen.md"
      ) {
        files.push(path.join(outputDir, entry.name));
      }
    }
  }
  return files;
}

function categoryFor(record) {
  const text = `${record.title} ${record.summary}`.toLocaleLowerCase("de");
  if (/immobil|raum|wohnzimmer|wohnung|haus|einrichtung|amazon/.test(text)) return "Immobilien & Wohnen";
  if (/video|foto|bild|portrait|kamera|reel|social|follower|content|kreativ|text|newsletter/.test(text)) return "Content & Marke";
  if (/marketing|business|dienstleistung|einkommen|verkauf|kunde|agentur/.test(text)) return "Geschäft & Kunden";
  if (/recherche|notebook|quelle|vergleich|analyse|prognose/.test(text)) return "Recherche & Entscheidungen";
  if (/datenschutz|memory|speicher|kontext|selbstcheck|psycholog|ads|aufmerksamkeit/.test(text)) return "Kontext & Selbstorganisation";
  if (/plugin|agent|workflow|prompt|chatgpt|claude|gemini|ki|code|tool/.test(text)) return "KI-Werkzeuge & Workflows";
  return "KI-Wissen";
}

function projectsFor(record) {
  const text = `${record.title} ${record.summary}`.toLocaleLowerCase("de");
  const projects = [];
  if (/immobil|haus|wohnung|raum|wohnzimmer|einrichtung|käufer|verkauf/.test(text)) projects.push("Hausverkauf-Kompass");
  if (/gesund|reha|selbstcheck|psycholog|ads|aufmerksamkeit|gewohnheit/.test(text)) projects.push("Reha-Kompass");
  if (/website|landing|text|design|portrait|bild|marke/.test(text)) projects.push("Persönliche Website");
  if (/content|video|reel|social|follower|newsletter|marketing|kreativ/.test(text)) projects.push("Content & Marke");
  if (/kunde|business|dienstleistung|verkauf|einkommen|agentur/.test(text)) projects.push("Kundenkommunikation");
  if (/prompt|agent|workflow|plugin|chatgpt|claude|gemini|ki|tool|kontext|memory|code/.test(text)) projects.push("Organisation & KI-Workflows");
  return [...new Set(projects.length ? projects : ["Organisation & KI-Workflows"])];
}

const projectBenefits = {
  "Hausverkauf-Kompass": "Der Ansatz kann als verständlicher Schritt, Checkliste oder Assistenzfunktion in den Hausverkauf-Kompass übertragen werden.",
  "Reha-Kompass": "Der Ansatz kann helfen, Selbstreflexion, Orientierung oder sichere Informationsaufbereitung im Reha-Kompass klarer zu gestalten.",
  "Persönliche Website": "Der Ansatz kann Inhalte, Darstellung oder Arbeitsabläufe Ihrer persönlichen Website verbessern, ohne private Angaben öffentlich zu machen.",
  "Content & Marke": "Der Ansatz kann in wiederholbare Content-Formate, Skripte oder Qualitätsprüfungen für Ihre Marke übersetzt werden.",
  Kundenkommunikation: "Der Ansatz kann Kundengespräche, Nachfasskommunikation oder Angebotsvorbereitung konkreter und konsistenter machen.",
  "Organisation & KI-Workflows": "Der Ansatz kann als wiederverwendbarer KI-Workflow mit klarer Eingabe, Prüfung und Freigabegrenze umgesetzt werden.",
};

function benefitFor(projects) {
  return projects.slice(0, 3).map((project) => projectBenefits[project]).join(" ");
}

function opportunitiesFor(projects, category) {
  const primary = projects[0];
  return [
    `Aus dem Thema ein kleines, wiederverwendbares Modul für „${primary}“ entwickeln.`,
    `Eine geprüfte Prompt-Vorlage und ein Praxisbeispiel für den Bereich „${category}“ anlegen.`,
  ];
}

function stepsFor(record, projects) {
  return [
    "Originalquelle und Tatsachenstatus prüfen; Creator-Behauptungen nicht automatisch als bestätigt übernehmen.",
    `Den Ansatz zunächst nur auf „${projects[0]}“ übertragen und ein klar abgegrenztes Testziel formulieren.`,
    "Mit anonymisierten oder unkritischen Beispieldaten testen und Ergebnis, Grenzen sowie Aufwand dokumentieren.",
    "Erst nach Ihrer Prüfung in einen dauerhaften Workflow, eine Website oder Kundenkommunikation übernehmen.",
  ];
}

function transferPrompt(record, projects) {
  const context = record.summary || record.what || `Niklas Volland behandelt den Ansatz „${record.title}“.`;
  return `Übertrage den Ansatz „${record.title}“ auf meine Arbeit.\n\nBekannter Ausgangspunkt aus der ausgewerteten Quelle:\n${context}\n\nPrüfe nacheinander diese passenden Bereiche: ${projects.join(", ")}.\n\nLiefere für jeden wirklich passenden Bereich:\n1. den konkreten Anwendungsfall für mich,\n2. den erwartbaren Nutzen,\n3. ein realistisches Praxisbeispiel,\n4. eine Schritt-für-Schritt-Umsetzung,\n5. benötigte Eingaben und Werkzeuge,\n6. Risiken, Datenschutz und Punkte, die noch verifiziert werden müssen,\n7. einen ersten ausführbaren Arbeitsauftrag, den ich direkt in ChatGPT oder Codex einsetzen kann.\n\nTrenne bestätigte Fakten, Aussagen des Urhebers und deine Transferideen sichtbar voneinander. Erfinde keine Produktfunktionen, Preise oder Verfügbarkeiten. Veröffentliche, versende, installiere oder kaufe nichts ohne meine ausdrückliche Freigabe.`;
}

const overrides = [
  {
    match: /marketing.?plugin/i,
    values: {
      projects: ["Content & Marke", "Persönliche Website", "Kundenkommunikation"],
      benefit: "Der verifizierte Anthropic-Marketing-Plugin-Katalog kann als Ideen- und Qualitätsrahmen für Content-Pläne, Kampagnenbriefings und Website-Inhalte dienen. Er ersetzt weder Ihre Positionierung noch die abschließende fachliche Prüfung.",
      opportunities: [
        "Einen wiederverwendbaren Marketing-Workflow für Immobilien- und Reha-Inhalte aufbauen.",
        "Für jedes Projekt eine kleine Bibliothek aus Recherche-, Briefing-, Entwurfs- und Review-Aufträgen anlegen.",
      ],
      steps: [
        "Einen konkreten Inhalt oder eine Kampagne auswählen.",
        "Zielgruppe, Ton, belastbare Quellen und No-Gos als Briefing festhalten.",
        "Nur die passenden Plugin-Kommandos als Arbeitsstruktur übernehmen und Ergebnis fachlich prüfen.",
        "Erst nach Ihrer Prüfung veröffentlichen oder an Kunden weitergeben.",
      ],
    },
  },
  {
    match: /maxi.*(?:verlässt|verlasst)|ki.?talk/i,
    values: {
      projects: ["Content & Marke", "Organisation & KI-Workflows"],
      benefit: "Die Folge ist vor allem als Organisations- und Format-Lektion nützlich: Ein wiederkehrendes Content-Produkt sollte auch bei Rollenwechseln fortsetzbar bleiben und sein Publikum früh über den neuen Rhythmus informieren.",
      opportunities: [
        "Für eigene Serien einen einfachen Vertretungs- und Fortführungsplan anlegen.",
        "Publikumsfeedback systematisch in die Weiterentwicklung eines Formats einbauen.",
      ],
    },
  },
  {
    match: /raumdesign|wohnzimmer.*500|500.*wohnzimmer/i,
    values: {
      projects: ["Hausverkauf-Kompass", "Content & Marke"],
      benefit: "Der Workflow kann als niedrigschwellige Inspirationshilfe für Raumwirkung, Verkaufspräsentation und Vorher-Nachher-Content dienen. Produktpreise, Verfügbarkeit und Lieferbarkeit müssen separat geprüft werden.",
      opportunities: [
        "Ein Modul „Raumwirkung vor dem Verkauf verbessern“ mit Budgetstufen entwickeln.",
        "Aus anonymisierten Beispielfotos eine nachvollziehbare Vorher-Nachher-Content-Serie erstellen.",
      ],
      steps: [
        "Ein unkritisches Raumfoto und ein verbindliches Maximalbudget auswählen.",
        "Zuerst nur Gestaltungsideen und Prioritäten erzeugen lassen.",
        "Erst danach konkrete Produkte suchen und Preise, Maße sowie Lieferbarkeit einzeln prüfen.",
        "Keine Bestellung oder Warenkorbaktionen ohne Ihre ausdrückliche Freigabe ausführen.",
      ],
    },
  },
];

function applyOverride(record) {
  const override = overrides.find((candidate) => candidate.match.test(record.title));
  if (!override) return record;
  const next = { ...record, ...override.values };
  return {
    ...next,
    prompts: [{ title: `Transfer-Prompt: ${next.title}`, text: transferPrompt(next, next.projects) }],
  };
}

function normalizeLegacyInsight(item) {
  const legacyIdeas = item.legacyIdeas?.length
    ? item.legacyIdeas
    : item.projects?.length
      ? item.projects
      : [];
  const projects = projectsFor({
    title: item.title,
    summary: `${item.what ?? ""} ${item.benefit ?? ""} ${item.category ?? ""}`,
  });
  return {
    id: item.id,
    date: item.date,
    title: item.title,
    source: item.source,
    category: item.category,
    priority: item.priority,
    status: item.status,
    what: item.what,
    tips: item.tips ?? [],
    benefit: item.benefit,
    projects,
    legacyIdeas,
    opportunities: legacyIdeas.length
      ? legacyIdeas.map((idea) => `Mögliche Weiterentwicklung: ${idea}`)
      : opportunitiesFor(projects, item.category),
    steps: item.steps ?? [],
    prompts: item.prompts ?? [],
    links: item.links ?? [],
    evidenceNote: item.transcript,
    keyword: item.keyword,
    origin: "legacy-nutzen-dashboard",
  };
}

function normalizeSeedInsight(item) {
  if (!item.origin || item.origin === "legacy-nutzen-dashboard") return normalizeLegacyInsight(item);
  const normalized = { ...item };
  delete normalized.prompt;
  return normalized;
}

function normalizeReportRecord(record) {
  const projects = projectsFor(record);
  const category = categoryFor(record);
  const normalized = {
    id: `niklas-${record.date}-${slug(record.title)}`,
    date: record.date,
    title: record.title,
    source: "Niklas-Volland-Tagesbericht",
    category,
    priority: projects.includes("Hausverkauf-Kompass") || projects.includes("Content & Marke") ? "hoch" : "mittel",
    status: /historisch|neuauflage|wiederverwendung|re.?upload/i.test(record.rawBody) ? "historische Neuauflage" : "ausgewertet",
    what: record.summary || `Ausgewerteter Beitrag: ${record.title}`,
    tips: record.tips.length ? record.tips : [
      "Den Ansatz auf einen klar abgegrenzten eigenen Anwendungsfall übertragen.",
      "Behauptungen, Verfügbarkeit und Preise vor der Nutzung separat prüfen.",
    ],
    benefit: benefitFor(projects),
    projects,
    opportunities: opportunitiesFor(projects, category),
    steps: stepsFor(record, projects),
    prompts: [{ title: `Transfer-Prompt: ${record.title}`, text: transferPrompt(record, projects) }],
    links: record.links.map((url, index) => ({ label: linkLabelForUrl(url, index), url })),
    evidenceNote: `Aus ${record.reportFile} migriert; automatische oder redaktionell geglättete Transkripte bleiben sinngemäß und nicht wortgetreu.`,
    keyword: "Keine externe Aktion ausgeführt.",
    origin: "daily-report",
  };
  return applyOverride(normalized);
}

function linkLabelForUrl(value, index) {
  try {
    const host = new URL(value).hostname.replace(/^www\./, "");
    if (host === "instagram.com") return "Instagram-Veröffentlichung";
    if (host === "tiktok.com") return "TikTok-Veröffentlichung";
    if (host === "youtube.com" || host === "youtu.be") return "YouTube-Veröffentlichung";
    if (host === "linkedin.com") return "LinkedIn-Veröffentlichung";
    if (host === "podcasters.spotify.com" || host === "open.spotify.com") return "Podcast bei Spotify";
    if (host === "podcasts.apple.com") return "Podcast bei Apple";
  } catch {
    // Keep the deterministic fallback label below.
  }
  return index ? `Quelle ${index + 1}` : "Originalquelle";
}

function enrichLinks(item, urls) {
  const existingUrls = new Set(item.links.map((link) => normalizedUrl(link.url)));
  const additions = urls
    .filter((url) => !existingUrls.has(normalizedUrl(url)))
    .map((url, index) => ({ label: linkLabelForUrl(url, item.links.length + index), url }));
  if (additions.length) item.links.push(...additions);
}

function mergeLinkObjects(primary, secondary) {
  const links = [...primary];
  const known = new Set(links.map((link) => normalizedUrl(link.url)));
  for (const link of secondary) {
    if (!known.has(normalizedUrl(link.url))) links.push(link);
  }
  return links;
}

function dedupeSeedInsights(items) {
  const deduped = [];
  for (const item of items.map(normalizeSeedInsight)) {
    const publicationUrls = item.links
      .map((link) => normalizedUrl(link.url))
      .filter(isPublicationUrl);
    const matchIndex = deduped.findIndex((candidate) =>
      candidate.links.some((link) => publicationUrls.includes(normalizedUrl(link.url))),
    );
    if (matchIndex === -1) {
      deduped.push(item);
      continue;
    }

    const existing = deduped[matchIndex];
    const preferCurrent = item.origin === "legacy-nutzen-dashboard"
      && existing.origin !== "legacy-nutzen-dashboard";
    if (preferCurrent) {
      deduped[matchIndex] = { ...item, links: mergeLinkObjects(item.links, existing.links) };
    } else {
      existing.links = mergeLinkObjects(existing.links, item.links);
    }
  }
  return deduped;
}

function refreshReportItem(item, rawRecord) {
  const refreshed = normalizeReportRecord(rawRecord);
  const links = mergeLinkObjects(refreshed.links, item.links);
  Object.assign(item, { ...refreshed, id: item.id, links });
}

function mergeNiklasInsights(legacyItems, reportItems) {
  const merged = dedupeSeedInsights(legacyItems);

  for (const rawRecord of reportItems.sort((a, b) => `${a.date}${a.title}`.localeCompare(`${b.date}${b.title}`))) {
    if (!rawRecord.date || !rawRecord.title) continue;
    const urls = rawRecord.links.map(normalizedUrl).filter(isPublicationUrl);
    const exactDateTitle = merged.find(
      (item) => item.date === rawRecord.date && normalizeTitle(item.title) === normalizeTitle(rawRecord.title),
    );
    if (exactDateTitle) {
      if (exactDateTitle.origin === "daily-report") refreshReportItem(exactDateTitle, rawRecord);
      else enrichLinks(exactDateTitle, rawRecord.links);
      continue;
    }
    const publicationMatch = merged.find((item) =>
      item.links.some((link) => urls.includes(normalizedUrl(link.url))),
    );
    if (publicationMatch) {
      enrichLinks(publicationMatch, rawRecord.links);
      continue;
    }
    const sameDayNearDuplicate = merged.find(
      (item) => item.date === rawRecord.date && titleSimilarity(item.title, rawRecord.title) >= 0.64,
    );
    if (sameDayNearDuplicate) {
      enrichLinks(sameDayNearDuplicate, rawRecord.links);
      continue;
    }
    const normalized = normalizeReportRecord(rawRecord);
    let id = normalized.id;
    let suffix = 2;
    while (merged.some((item) => item.id === id)) id = `${normalized.id}-${suffix++}`;
    merged.push({ ...normalized, id });
  }

  return merged.sort((a, b) => `${b.date}${b.title}`.localeCompare(`${a.date}${a.title}`, "de"));
}

async function main() {
  const [seeds, reportFiles] = await Promise.all([loadKnowledgeSeeds(), findReportFiles()]);
  const legacyItems = seeds.niklas;
  const codexData = seeds.codex;
  const reportItems = [];
  for (const reportFile of reportFiles) {
    const markdown = await readFile(reportFile, "utf8");
    reportItems.push(...extractContributionSections(markdown, path.basename(reportFile)));
  }
  const niklasItems = mergeNiklasInsights(legacyItems, reportItems);

  await mkdir(outputRoot, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputRoot, "niklas-insights.json"), `${JSON.stringify(niklasItems, null, 2)}\n`),
    writeFile(path.join(outputRoot, "codex-navigator.json"), `${JSON.stringify(codexData, null, 2)}\n`),
    writeFile(
      path.join(outputRoot, "migration-manifest.json"),
      `${JSON.stringify({
        generatedAt: new Date().toISOString(),
        legacyDashboardPayload,
        codexNavigatorData,
        legacyNiklasCount: seeds.existingManifest?.legacyNiklasCount
          ?? legacyItems.filter((item) => !item.origin || item.origin === "legacy-nutzen-dashboard").length,
        seedNiklasCount: legacyItems.length,
        usedCommittedNiklasSeed: seeds.usedCommittedNiklasSeed,
        usedCommittedCodexSeed: seeds.usedCommittedCodexSeed,
        reportFileCount: reportFiles.length,
        reportContributionCount: reportItems.length,
        mergedNiklasCount: niklasItems.length,
        codexCapabilityCount: codexData.categories.reduce((sum, category) => sum + category.items.length, 0),
        codexExampleCount: codexData.practiceExamples?.length ?? 0,
      }, null, 2)}\n`,
    ),
  ]);
}

await main();
