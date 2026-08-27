"use client";

import { useMemo, useState } from "react";
import { knowledgeManifest, niklasInsights } from "./knowledge-data";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

const categories = [...new Set(niklasInsights.map((item) => item.category))].sort((a, b) => a.localeCompare(b, "de"));
const projects = [...new Set(niklasInsights.flatMap((item) => item.projects))].sort((a, b) => a.localeCompare(b, "de"));

export default function NiklasKnowledgeLibrary() {
  const [selectedId, setSelectedId] = useState(niklasInsights[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [project, setProject] = useState("all");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("de");
    return niklasInsights.filter((item) => {
      const categoryMatches = category === "all" || item.category === category;
      const projectMatches = project === "all" || item.projects.includes(project);
      const queryMatches = !normalizedQuery || [
        item.title,
        item.what,
        item.benefit,
        item.category,
        ...item.projects,
        ...item.tips,
      ].join(" ").toLocaleLowerCase("de").includes(normalizedQuery);
      return categoryMatches && projectMatches && queryMatches;
    });
  }, [category, project, query]);

  const selected = filteredItems.find((item) => item.id === selectedId)
    ?? filteredItems[0]
    ?? niklasInsights[0];
  const activePrompt = selected?.prompts[0];

  async function copyPrompt() {
    if (!activePrompt) return;
    try {
      await navigator.clipboard.writeText(activePrompt.text);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
    }
  }

  return (
    <div className="app-page knowledge-page">
      <section className="app-page-intro knowledge-page-intro">
        <div>
          <span className="app-eyebrow">Kumulierte Nutzen-Bibliothek</span>
          <h2>Alle Niklas-Tipps – auf deine Projekte übersetzt.</h2>
        </div>
        <p>
          Hier stehen nicht nur die Veröffentlichungen des Tages. Jeder eigenständige Beitrag wird
          mit Nutzen, Projektbezug, Umsetzung, Quellen und einer direkt kopierbaren Prompt-Vorlage geführt.
        </p>
      </section>

      <section className="dashboard-stats" aria-label="Niklas-Wissensbasis">
        <article>
          <span>Ausgewertete Impulse</span>
          <strong>{niklasInsights.length}</strong>
          <small>historisch und täglich fortgeführt</small>
        </article>
        <article>
          <span>Tagesberichte</span>
          <strong>{knowledgeManifest.reportFileCount}</strong>
          <small>in die gemeinsame Bibliothek eingelesen</small>
        </article>
        <article>
          <span>Projektbezüge</span>
          <strong>{projects.length}</strong>
          <small>für deine laufenden Vorhaben</small>
        </article>
        <article>
          <span>Neuester Stand</span>
          <strong>{formatDate(niklasInsights[0].date).replace(/\s\d{4}$/, "")}</strong>
          <small>Quellenstand {formatDate(niklasInsights[0].date)}</small>
        </article>
      </section>

      <section className="knowledge-workspace" aria-label="Niklas-Tipps durchsuchen und anwenden">
        <aside className="knowledge-browser">
          <div className="knowledge-browser-head">
            <div>
              <span className="app-eyebrow">Tipps &amp; Anwendungen</span>
              <strong>{filteredItems.length} Treffer</strong>
            </div>
            <span>{niklasInsights.length} gesamt</span>
          </div>

          <div className="knowledge-filters">
            <label className="knowledge-search">
              <span className="sr-only">Niklas-Tipps durchsuchen</span>
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Thema, Nutzen oder Projekt suchen …"
              />
            </label>
            <div className="knowledge-filter-grid">
              <label>
                <span>Kategorie</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="all">Alle Kategorien</option>
                  {categories.map((item) => <option value={item} key={item}>{item}</option>)}
                </select>
              </label>
              <label>
                <span>Projekt</span>
                <select value={project} onChange={(event) => setProject(event.target.value)}>
                  <option value="all">Alle Projekte</option>
                  {projects.map((item) => <option value={item} key={item}>{item}</option>)}
                </select>
              </label>
            </div>
          </div>

          <ul className="knowledge-result-list">
            {filteredItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={selected?.id === item.id ? "active" : ""}
                  onClick={() => {
                    setSelectedId(item.id);
                    setCopyState("idle");
                  }}
                >
                  <span className="knowledge-result-meta">
                    <time dateTime={item.date}>{formatDate(item.date)}</time>
                    <i>{item.status}</i>
                  </span>
                  <strong>{item.title}</strong>
                  <small>{item.category} · {item.projects.slice(0, 2).join(" · ")}</small>
                </button>
              </li>
            ))}
            {!filteredItems.length ? <li className="knowledge-empty">Keine passenden Tipps gefunden.</li> : null}
          </ul>
        </aside>

        {selected ? (
          <article className="knowledge-detail">
            <header className="knowledge-detail-head">
              <div>
                <div className="knowledge-chip-row">
                  <span>{selected.category}</span>
                  <span data-tone="gold">Priorität {selected.priority}</span>
                  <span>{selected.status}</span>
                </div>
                <h2>{selected.title}</h2>
                <p>{formatDate(selected.date)} · {selected.source}</p>
              </div>
              <span className="knowledge-record-mark" aria-hidden="true">NV</span>
            </header>

            <section className="knowledge-answer-block">
              <span className="app-eyebrow">Worum geht es?</span>
              <p>{selected.what}</p>
            </section>

            <section className="knowledge-benefit-card">
              <div className="knowledge-benefit-mark" aria-hidden="true">OT</div>
              <div>
                <span className="app-eyebrow">Was bringt es Olaf?</span>
                <p>{selected.benefit}</p>
              </div>
            </section>

            <section className="knowledge-detail-grid">
              <div>
                <span className="app-eyebrow">Passende Projekte</span>
                <div className="knowledge-project-list">
                  {selected.projects.map((item) => <span key={item}>{item}</span>)}
                </div>
              </div>
              <div>
                <span className="app-eyebrow">Neue Möglichkeiten</span>
                <ul>{selected.opportunities.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </section>

            <section className="knowledge-detail-grid knowledge-action-grid">
              <div>
                <span className="app-eyebrow">Nützliche Tipps</span>
                <ol>{selected.tips.map((item) => <li key={item}>{item}</li>)}</ol>
              </div>
              <div>
                <span className="app-eyebrow">So setzt du es sicher um</span>
                <ol>{selected.steps.map((item) => <li key={item}>{item}</li>)}</ol>
              </div>
            </section>

            {activePrompt ? (
              <section className="knowledge-prompt-card">
                <div className="knowledge-prompt-head">
                  <div>
                    <span className="app-eyebrow">Direkt nutzbare Prompt-Vorlage</span>
                    <h3>{activePrompt.title}</h3>
                  </div>
                  <button type="button" onClick={copyPrompt}>
                    {copyState === "copied" ? "Kopiert ✓" : copyState === "error" ? "Erneut versuchen" : "Prompt kopieren"}
                  </button>
                </div>
                <pre>{activePrompt.text}</pre>
              </section>
            ) : null}

            <footer className="knowledge-source-footer">
              <div>
                <span className="app-eyebrow">Quellen &amp; Einordnung</span>
                <p>{selected.evidenceNote}</p>
              </div>
              <div className="knowledge-source-links">
                {selected.links.length ? selected.links.map((link) => (
                  <a href={link.url} target="_blank" rel="noreferrer" key={`${link.label}-${link.url}`}>
                    {link.label} <span aria-hidden="true">↗</span>
                  </a>
                )) : <span>Kein belastbarer Direktlink im archivierten Eintrag.</span>}
              </div>
            </footer>
          </article>
        ) : null}
      </section>
    </div>
  );
}

