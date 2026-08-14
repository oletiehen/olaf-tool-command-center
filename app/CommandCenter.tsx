"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  categoryLabels,
  categoryOptions,
  masterPrompt,
  projectLabels,
  projectOptions,
  tools,
  workflow,
  type Category,
  type Priority,
  type Project,
  type Tool,
} from "./tool-data";

type CategoryFilter = "all" | Category;
type ProjectFilter = "all" | Project;
type PriorityFilter = "all" | Priority;

const priorityLabels: Record<Priority, string> = {
  A: "A · hoher Hebel",
  B: "B · sinnvoll",
  C: "C · ergänzend",
};

function ToolCard({ tool, onOpen }: { tool: Tool; onOpen: (tool: Tool) => void }) {
  return (
    <article className="tool-card" data-category={tool.category}>
      <button
        className="tool-card-button"
        type="button"
        onClick={() => onOpen(tool)}
        aria-label={tool.name + " im Detail öffnen"}
      >
        <div className="tool-card-topline">
          <div className="tool-mark" aria-hidden="true">
            {tool.mark}
          </div>
          <span className="tool-number">{String(tool.index).padStart(2, "0")}</span>
        </div>
        <div className="tool-card-copy">
          <div className="tool-meta-row">
            <span className="priority-pill" data-priority={tool.priority}>
              {tool.priority}
            </span>
            <span>{categoryLabels[tool.category]}</span>
          </div>
          <h3>{tool.name}</h3>
          <p>{tool.summary}</p>
        </div>
        <div className="tool-card-footer">
          <span>{tool.type}</span>
          <span className="open-label">
            Details <span aria-hidden="true">↗</span>
          </span>
        </div>
      </button>
    </article>
  );
}

function DetailDialog({ tool, onClose }: { tool: Tool | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (tool && !dialog.open) {
      setCopied(false);
      dialog.showModal();
    }

    if (!tool && dialog.open) dialog.close();
  }, [tool]);

  async function copyPrompt() {
    if (!tool) return;
    await navigator.clipboard.writeText(tool.prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <dialog
      ref={dialogRef}
      className="detail-dialog"
      onClose={onClose}
      onCancel={onClose}
    >
      {tool ? (
        <div className="detail-panel" data-category={tool.category}>
          <header className="detail-header">
            <div className="detail-title-wrap">
              <div className="tool-mark detail-mark" aria-hidden="true">
                {tool.mark}
              </div>
              <div>
                <div className="detail-kicker">
                  {String(tool.index).padStart(2, "0")} · {tool.type}
                </div>
                <h2>{tool.name}</h2>
              </div>
            </div>
            <button className="icon-button" type="button" onClick={() => dialogRef.current?.close()}>
              <span className="sr-only">Detailansicht schließen</span>
              <span aria-hidden="true">×</span>
            </button>
          </header>

          <div className="detail-badges">
            <span className="priority-pill priority-pill-wide" data-priority={tool.priority}>
              {priorityLabels[tool.priority]}
            </span>
            <span className="soft-pill">{categoryLabels[tool.category]}</span>
          </div>

          <div className="detail-grid">
            <section>
              <span className="eyebrow">Funktion an sich</span>
              <p>{tool.function}</p>
            </section>
            <section>
              <span className="eyebrow">Für dich besonders sinnvoll</span>
              <p>{tool.use}</p>
            </section>
          </div>

          <section className="example-card">
            <span className="eyebrow">Konkretes Beispiel</span>
            <p>{tool.example}</p>
          </section>

          <section className="prompt-card">
            <div className="prompt-card-heading">
              <div>
                <span className="eyebrow">Direkt nutzbare Vorlage</span>
                <h3>Prompt für {tool.name}</h3>
              </div>
              <button className="copy-button" type="button" onClick={copyPrompt}>
                {copied ? "Kopiert" : "Prompt kopieren"}
              </button>
            </div>
            <p className="prompt-text">{tool.prompt}</p>
          </section>

          <section className="project-fit">
            <span className="eyebrow">Passt zu</span>
            <div className="pill-row">
              {tool.projects.map((project) => (
                <span className="soft-pill" key={project}>
                  {projectLabels[project]}
                </span>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </dialog>
  );
}

export default function CommandCenter() {
  const [project, setProject] = useState<ProjectFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [masterOpen, setMasterOpen] = useState(false);
  const [masterCopied, setMasterCopied] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("de");
    return tools.filter((tool) => {
      const matchesProject = project === "all" || tool.projects.includes(project);
      const matchesCategory = category === "all" || tool.category === category;
      const matchesPriority = priority === "all" || tool.priority === priority;
      const haystack = [
        tool.name,
        tool.type,
        tool.summary,
        tool.function,
        tool.use,
        tool.example,
        categoryLabels[tool.category],
      ]
        .join(" ")
        .toLocaleLowerCase("de");
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      return matchesProject && matchesCategory && matchesPriority && matchesQuery;
    });
  }, [category, priority, project, query]);

  const hasFilters = project !== "all" || category !== "all" || priority !== "all" || query !== "";

  function resetFilters() {
    setProject("all");
    setCategory("all");
    setPriority("all");
    setQuery("");
  }

  async function copyMasterPrompt() {
    await navigator.clipboard.writeText(masterPrompt);
    setMasterCopied(true);
    window.setTimeout(() => setMasterCopied(false), 1800);
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Olaf Tool Command Center – nach oben">
          <span className="brand-mark" aria-hidden="true">
            OT
          </span>
          <span className="brand-copy">
            <strong>Tool Command Center</strong>
            <span>Olafs persönlicher Navigator</span>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Hauptnavigation">
          <a href="#funktionen">Funktionen</a>
          <a href="#workflow">Workflow</a>
          <a href="#startprompt">Startprompt</a>
        </nav>
        <span className="draft-badge">
          <span className="draft-dot" aria-hidden="true" /> Vorschau
        </span>
      </header>

      <main id="top">
        <section className="hero section-wrap" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="hero-kicker-row">
              <span className="overline">Deine Werkzeug-Landkarte</span>
              <span className="snapshot-label">Momentaufnahme · 29 Funktionen</span>
            </div>
            <h1 id="hero-title">
              Das richtige Werkzeug.
              <span> Im richtigen Moment.</span>
            </h1>
            <p className="hero-lead">
              Kein Funktionslexikon, sondern ein persönliches Command Center: schnell finden,
              verstehen und mit einer fertigen Prompt-Vorlage direkt anwenden.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#funktionen">
                Werkzeug finden <span aria-hidden="true">↓</span>
              </a>
              <a className="secondary-button" href="#workflow">
                Empfohlenen Ablauf ansehen
              </a>
            </div>
          </div>

          <div className="hero-dashboard" aria-label="Übersicht mit Kennzahlen">
            <div className="hero-dashboard-glow" aria-hidden="true" />
            <div className="hero-main-stat">
              <span className="stat-label">Werkzeuge im Überblick</span>
              <strong>29</strong>
              <span className="stat-caption">persönlich eingeordnet</span>
            </div>
            <div className="hero-mini-grid">
              <div>
                <strong>10</strong>
                <span>mit besonders hohem Hebel</span>
              </div>
              <div>
                <strong>7</strong>
                <span>Schritte im Kern-Workflow</span>
              </div>
            </div>
            <div className="hero-recommendation">
              <span className="recommendation-index">01</span>
              <div>
                <span>Empfohlener Start</span>
                <strong>Planmodus</strong>
              </div>
              <span className="recommendation-arrow" aria-hidden="true">↗</span>
            </div>
          </div>
        </section>

        <section className="focus-strip" aria-label="Empfohlene Produktionskette">
          <div className="section-wrap focus-strip-inner">
            <span className="focus-label">Deine Produktionskette</span>
            <div className="focus-chain">
              <span>Planen</span>
              <i aria-hidden="true" />
              <span>Ordnen</span>
              <i aria-hidden="true" />
              <span>Validieren</span>
              <i aria-hidden="true" />
              <span>Bauen</span>
              <i aria-hidden="true" />
              <span>Vermarkten</span>
              <i aria-hidden="true" />
              <span>Lernen</span>
            </div>
          </div>
        </section>

        <section className="tools-section section-wrap" id="funktionen" aria-labelledby="tools-title">
          <div className="section-heading">
            <div>
              <span className="overline">29 Funktionen · eine klare Auswahl</span>
              <h2 id="tools-title">Was bringt dein Projekt jetzt weiter?</h2>
            </div>
            <p>
              Wähle dein Projekt, grenze die Aufgabe ein oder suche direkt nach einem Werkzeug.
            </p>
          </div>

          <div className="filter-panel">
            <div className="filter-main-row">
              <label className="search-field">
                <span className="field-label">Funktion suchen</span>
                <span className="search-input-wrap">
                  <span className="search-icon" aria-hidden="true">⌕</span>
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="z. B. Canva, App, Vertrieb …"
                  />
                  <kbd>/</kbd>
                </span>
              </label>

              <label className="select-field project-select">
                <span className="field-label">Projektfokus</span>
                <select value={project} onChange={(event) => setProject(event.target.value as ProjectFilter)}>
                  {projectOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="select-field priority-select">
                <span className="field-label">Priorität</span>
                <select value={priority} onChange={(event) => setPriority(event.target.value as PriorityFilter)}>
                  <option value="all">Alle Prioritäten</option>
                  <option value="A">A · hoher Hebel</option>
                  <option value="B">B · sinnvoll</option>
                  <option value="C">C · ergänzend</option>
                </select>
              </label>
            </div>

            <div className="category-filter" aria-label="Nach Kategorie filtern">
              {categoryOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={category === option.value ? "category-chip active" : "category-chip"}
                  aria-pressed={category === option.value}
                  onClick={() => setCategory(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="results-bar">
            <p aria-live="polite">
              <strong>{filteredTools.length}</strong> {filteredTools.length === 1 ? "Funktion" : "Funktionen"}
              {project !== "all" ? " für " + projectLabels[project] : ""}
            </p>
            {hasFilters ? (
              <button className="reset-button" type="button" onClick={resetFilters}>
                Filter zurücksetzen
              </button>
            ) : (
              <span className="results-hint">Kachel öffnen für Erklärung & Prompt</span>
            )}
          </div>

          {filteredTools.length ? (
            <div className="tool-grid">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} onOpen={setSelectedTool} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span aria-hidden="true">⌕</span>
              <h3>Keine passende Funktion gefunden</h3>
              <p>Versuche einen allgemeineren Suchbegriff oder setze die Filter zurück.</p>
              <button className="secondary-button" type="button" onClick={resetFilters}>
                Alle Funktionen zeigen
              </button>
            </div>
          )}
        </section>

        <section className="workflow-section" id="workflow" aria-labelledby="workflow-title">
          <div className="section-wrap">
            <div className="section-heading workflow-heading">
              <div>
                <span className="overline overline-light">Empfohlener Ablauf</span>
                <h2 id="workflow-title">Vom Gedanken zum funktionierenden System.</h2>
              </div>
              <p>
                Sieben bewusst aufeinanderfolgende Schritte für den KI-Immobiliencoach – mit klarer
                Grenze zwischen Planung, Prüfung und Ausführung.
              </p>
            </div>

            <div className="workflow-track">
              {workflow.map((item, itemIndex) => (
                <article className="workflow-card" key={item.step}>
                  <div className="workflow-card-head">
                    <span>{item.step}</span>
                    {itemIndex < workflow.length - 1 ? <i aria-hidden="true" /> : null}
                  </div>
                  <h3>{item.title}</h3>
                  <strong>{item.tools}</strong>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
            <p className="swipe-hint">Auf dem iPhone seitlich wischen, um alle Schritte zu sehen.</p>
          </div>
        </section>

        <section className="prompt-section section-wrap" id="startprompt" aria-labelledby="prompt-title">
          <div className="prompt-intro">
            <span className="overline">Direkt starten</span>
            <h2 id="prompt-title">Ein Master-Prompt für den ersten sauberen Schritt.</h2>
            <p>
              Er beginnt bewusst mit Planung und enthält eine feste Freigabegrenze. Du kannst ihn
              direkt kopieren und anschließend an dein Projekt anpassen.
            </p>
          </div>
          <div className={masterOpen ? "master-prompt-card open" : "master-prompt-card"}>
            <div className="master-prompt-head">
              <div className="prompt-symbol" aria-hidden="true">01</div>
              <div>
                <span>Startvorlage</span>
                <h3>KI-Immobiliencoach · Planmodus</h3>
              </div>
              <button
                className="icon-button prompt-toggle"
                type="button"
                aria-expanded={masterOpen}
                onClick={() => setMasterOpen((open) => !open)}
              >
                <span className="sr-only">Master-Prompt {masterOpen ? "einklappen" : "anzeigen"}</span>
                <span aria-hidden="true">{masterOpen ? "−" : "+"}</span>
              </button>
            </div>
            {masterOpen ? (
              <div className="master-prompt-body">
                <p>{masterPrompt}</p>
                <button className="copy-button copy-button-gold" type="button" onClick={copyMasterPrompt}>
                  {masterCopied ? "Prompt kopiert" : "Master-Prompt kopieren"}
                </button>
              </div>
            ) : (
              <button className="prompt-preview" type="button" onClick={() => setMasterOpen(true)}>
                „Arbeite im Planmodus. Projekt: Eine KI-gestützte Coaching-Plattform …“
                <span>Vollständig anzeigen</span>
              </button>
            )}
          </div>
        </section>

        <section className="principles section-wrap" aria-label="Leitplanken">
          <article>
            <span className="principle-index">01</span>
            <h3>Erst verstehen</h3>
            <p>Bestehende Dateien, Entscheidungen und Grenzen bilden immer den Ausgangspunkt.</p>
          </article>
          <article>
            <span className="principle-index">02</span>
            <h3>Gezielt kombinieren</h3>
            <p>Nicht jedes Werkzeug zugleich – sondern das kleinste sinnvolle Set für den nächsten Schritt.</p>
          </article>
          <article>
            <span className="principle-index">03</span>
            <h3>Freigaben bewahren</h3>
            <p>Veröffentlichen, versenden, buchen oder kostenpflichtig handeln erst nach ausdrücklichem Go.</p>
          </article>
        </section>
      </main>

      <footer className="site-footer">
        <div className="section-wrap footer-inner">
          <div>
            <strong>Olaf · Tool Command Center</strong>
            <p>Einmalige, persönliche Orientierung auf Basis der 29 Funktionen aus deinem Menü.</p>
          </div>
          <div className="footer-status">
            <span className="draft-dot" aria-hidden="true" /> Bearbeitbare Vorschau · nicht veröffentlicht
          </div>
        </div>
      </footer>

      <nav className="mobile-nav" aria-label="Mobile Navigation">
        <a href="#top"><span aria-hidden="true">⌂</span>Übersicht</a>
        <a href="#funktionen"><span aria-hidden="true">▦</span>Tools</a>
        <a href="#workflow"><span aria-hidden="true">→</span>Ablauf</a>
        <a href="#startprompt"><span aria-hidden="true">✦</span>Prompt</a>
      </nav>

      <DetailDialog tool={selectedTool} onClose={() => setSelectedTool(null)} />
    </div>
  );
}
