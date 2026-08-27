"use client";

import { useMemo, useState } from "react";
import { codexCapabilities, codexCategories, codexPracticeExamples } from "./knowledge-data";

export default function CodexKnowledgeLibrary() {
  const [selectedId, setSelectedId] = useState(codexCapabilities[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCapabilities = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("de");
    return codexCapabilities.filter((item) => {
      const categoryMatches = category === "all" || item.categoryId === category;
      const textMatches = !normalized || [item.title, item.summary, item.categoryLabel, ...item.actions]
        .join(" ").toLocaleLowerCase("de").includes(normalized);
      return categoryMatches && textMatches;
    });
  }, [category, query]);

  const selected = filteredCapabilities.find((item) => item.id === selectedId)
    ?? filteredCapabilities[0]
    ?? codexCapabilities[0];
  const matchingExamples = codexPracticeExamples.filter((example) => example.capabilityId === selected?.id);

  async function copyExample(id: string, prompt: string) {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      setCopiedId(null);
    }
  }

  return (
    <div className="app-page knowledge-page">
      <section className="app-page-intro knowledge-page-intro">
        <div>
          <span className="app-eyebrow">Codex-Praxisnavigator</span>
          <h2>Fähigkeiten, Grenzen und fertige Praxisaufträge.</h2>
        </div>
        <p>
          Die bisher eigenständige Codex-Seite ist hier vollständig als interner Bereich eingebunden:
          mit {codexCapabilities.length} Fähigkeiten und {codexPracticeExamples.length} konkreten Arbeitsaufträgen.
        </p>
      </section>

      <section className="dashboard-stats" aria-label="Codex-Wissensbasis">
        <article><span>Fähigkeiten</span><strong>{codexCapabilities.length}</strong><small>klar beschrieben und eingeordnet</small></article>
        <article><span>Praxisaufträge</span><strong>{codexPracticeExamples.length}</strong><small>mit direkt nutzbaren Prompts</small></article>
        <article><span>Bereiche</span><strong>{codexCategories.length}</strong><small>von Recherche bis Automatisierung</small></article>
        <article><span>Freigabeprinzip</span><strong>1</strong><small>externe Aktionen bleiben unter deiner Kontrolle</small></article>
      </section>

      <section className="knowledge-workspace codex-workspace">
        <aside className="knowledge-browser">
          <div className="knowledge-browser-head">
            <div><span className="app-eyebrow">Fähigkeiten</span><strong>{filteredCapabilities.length} Treffer</strong></div>
            <span>{codexCapabilities.length} gesamt</span>
          </div>
          <div className="knowledge-filters">
            <label className="knowledge-search">
              <span className="sr-only">Codex-Fähigkeiten durchsuchen</span>
              <span aria-hidden="true">⌕</span>
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Fähigkeit oder Aufgabe suchen …" />
            </label>
            <label className="knowledge-select-wide">
              <span>Bereich</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="all">Alle Bereiche</option>
                {codexCategories.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
              </select>
            </label>
          </div>
          <ul className="knowledge-result-list codex-result-list">
            {filteredCapabilities.map((item) => (
              <li key={item.id}>
                <button type="button" className={selected?.id === item.id ? "active" : ""} onClick={() => setSelectedId(item.id)}>
                  <span className="knowledge-result-meta"><time>Fähigkeit {String(item.number).padStart(2, "0")}</time><i>{item.status}</i></span>
                  <strong>{item.title}</strong>
                  <small>{item.categoryLabel}</small>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {selected ? (
          <article className="knowledge-detail codex-detail">
            <header className="knowledge-detail-head">
              <div>
                <div className="knowledge-chip-row"><span>{selected.categoryLabel}</span><span data-tone="gold">{selected.status}</span></div>
                <h2>{selected.title}</h2>
                <p>Fähigkeit {String(selected.number).padStart(2, "0")} von {codexCapabilities.length}</p>
              </div>
              <span className="knowledge-record-mark" aria-hidden="true">CX</span>
            </header>

            <section className="knowledge-answer-block">
              <span className="app-eyebrow">Was Codex hier übernimmt</span>
              <p>{selected.summary}</p>
            </section>

            <section className="knowledge-detail-grid knowledge-action-grid">
              <div>
                <span className="app-eyebrow">Typische Aufgaben</span>
                <ul>{selected.actions.map((action) => <li key={action}>{action}</li>)}</ul>
              </div>
              <div className="knowledge-boundary-card">
                <span className="app-eyebrow">Wichtige Grenze</span>
                <p>{selected.boundary}</p>
              </div>
            </section>

            <section className="codex-example-section">
              <div className="app-section-heading">
                <div><span className="app-eyebrow">Praxis für Olaf</span><h2>Passende fertige Arbeitsaufträge</h2></div>
                <span>{matchingExamples.length} passend</span>
              </div>
              {matchingExamples.length ? (
                <div className="codex-example-grid">
                  {matchingExamples.map((example) => (
                    <article key={example.id}>
                      <span>{example.depth === "quick" ? "Schneller Einsatz" : "Vertiefter Einsatz"}</span>
                      <h3>{example.title}</h3>
                      <p>{example.example}</p>
                      <dl>
                        <div><dt>Ergebnis</dt><dd>{example.outcome}</dd></div>
                        <div><dt>Benötigt</dt><dd>{example.needs}</dd></div>
                        <div><dt>Grenze</dt><dd>{example.guardrail}</dd></div>
                      </dl>
                      <details>
                        <summary>Prompt ansehen</summary>
                        <pre>{example.prompt}</pre>
                      </details>
                      <button type="button" onClick={() => copyExample(example.id, example.prompt)}>
                        {copiedId === example.id ? "Prompt kopiert ✓" : "Prompt kopieren"}
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="knowledge-empty-card">
                  Für diese Fähigkeit ist noch kein projektspezifisches Beispiel hinterlegt. Die Aufgabenbeschreibung oben kann direkt als Briefing verwendet werden.
                </div>
              )}
            </section>
          </article>
        ) : null}
      </section>
    </div>
  );
}

