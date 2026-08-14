"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  categoryLabels,
  categoryOptions,
  projectLabels,
  projectOptions,
  tools,
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

function LibraryCard({ tool, onOpen }: { tool: Tool; onOpen: (tool: Tool) => void }) {
  return (
    <article className="tool-card" data-category={tool.category}>
      <button
        className="tool-card-button"
        type="button"
        onClick={() => onOpen(tool)}
        aria-label={tool.name + " im Detail öffnen"}
      >
        <div className="tool-card-topline">
          <div className="tool-mark" aria-hidden="true">{tool.mark}</div>
          <span className="tool-number">{String(tool.index).padStart(2, "0")}</span>
        </div>
        <div className="tool-card-copy">
          <div className="tool-meta-row">
            <span className="priority-pill" data-priority={tool.priority}>{tool.priority}</span>
            <span>{categoryLabels[tool.category]}</span>
          </div>
          <h3>{tool.name}</h3>
          <p>{tool.summary}</p>
        </div>
        <div className="tool-card-footer">
          <span>{tool.type}</span>
          <span className="open-label">Details <span aria-hidden="true">↗</span></span>
        </div>
      </button>
    </article>
  );
}

function ToolDialog({ tool, onClose }: { tool: Tool | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (tool && !dialog.open) {
      setCopyState("idle");
      dialog.showModal();
    }
    if (!tool && dialog.open) dialog.close();
  }, [tool]);

  async function copyPrompt() {
    if (!tool) return;
    try {
      await navigator.clipboard.writeText(tool.prompt);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
    }
  }

  return (
    <dialog ref={dialogRef} className="detail-dialog" onClose={onClose} onCancel={onClose}>
      {tool ? (
        <div className="detail-panel" data-category={tool.category}>
          <header className="detail-header">
            <div className="detail-title-wrap">
              <div className="tool-mark detail-mark" aria-hidden="true">{tool.mark}</div>
              <div>
                <div className="detail-kicker">{String(tool.index).padStart(2, "0")} · {tool.type}</div>
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
                {copyState === "copied" ? "Kopiert" : copyState === "error" ? "Erneut versuchen" : "Prompt kopieren"}
              </button>
            </div>
            <p className="prompt-text">{tool.prompt}</p>
          </section>

          <section className="project-fit">
            <span className="eyebrow">Passt zu</span>
            <div className="pill-row">
              {tool.projects.map((project) => (
                <span className="soft-pill" key={project}>{projectLabels[project]}</span>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </dialog>
  );
}

function ToolLibraryView({
  initialQuery,
  initialPriority,
}: {
  initialQuery: string;
  initialPriority: PriorityFilter;
}) {
  const [project, setProject] = useState<ProjectFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [priority, setPriority] = useState<PriorityFilter>(initialPriority);
  const [query, setQuery] = useState(initialQuery);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("de");
    return tools.filter((tool) => {
      const matchesProject = project === "all" || tool.projects.includes(project);
      const matchesCategory = category === "all" || tool.category === category;
      const matchesPriority = priority === "all" || tool.priority === priority;
      const searchable = [
        tool.name,
        tool.type,
        tool.summary,
        tool.function,
        tool.use,
        tool.example,
        categoryLabels[tool.category],
      ].join(" ").toLocaleLowerCase("de");
      return matchesProject && matchesCategory && matchesPriority && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, priority, project, query]);

  const hasFilters = project !== "all" || category !== "all" || priority !== "all" || query !== "";

  function resetFilters() {
    setProject("all");
    setCategory("all");
    setPriority("all");
    setQuery("");
  }

  return (
    <div className="app-page library-page">
      <section className="app-page-intro">
        <div>
          <span className="app-eyebrow">Werkzeugbibliothek</span>
          <h2>Finde genau die Funktion, die jetzt weiterhilft.</h2>
        </div>
        <p>
          Suche nach Aufgabe oder Werkzeug, filtere nach deinem Projekt und öffne anschließend
          Erklärung, Beispiel und Prompt-Vorlage in einer kompakten Detailansicht.
        </p>
      </section>

      <section className="library-summary" aria-label="Bibliotheksübersicht">
        <div><strong>29</strong><span>Funktionen</span></div>
        <div><strong>7</strong><span>Kategorien</span></div>
        <div><strong>6</strong><span>Projektfokusse</span></div>
      </section>

      <div className="filter-panel app-filter-panel">
        <div className="filter-main-row">
          <label className="search-field">
            <span className="field-label">Funktion suchen</span>
            <span className="search-input-wrap">
              <span className="search-icon" aria-hidden="true">⌕</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="z. B. Canva, App, Vertrieb …"
              />
            </span>
          </label>
          <label className="select-field project-select">
            <span className="field-label">Projektfokus</span>
            <select value={project} onChange={(event) => setProject(event.target.value as ProjectFilter)}>
              {projectOptions.map((option) => (
                <option value={option.value} key={option.value}>{option.label}</option>
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

      <div className="results-bar app-results-bar">
        <p aria-live="polite">
          <strong>{filteredTools.length}</strong> {filteredTools.length === 1 ? "Funktion" : "Funktionen"}
          {project !== "all" ? " für " + projectLabels[project] : ""}
        </p>
        {hasFilters ? (
          <button className="reset-button" type="button" onClick={resetFilters}>Filter zurücksetzen</button>
        ) : (
          <span className="results-hint">Kachel öffnen für Erklärung und Prompt</span>
        )}
      </div>

      {filteredTools.length ? (
        <div className="tool-grid app-tool-grid">
          {filteredTools.map((tool) => (
            <LibraryCard key={tool.id} tool={tool} onOpen={setSelectedTool} />
          ))}
        </div>
      ) : (
        <div className="empty-state app-empty-state">
          <span aria-hidden="true">⌕</span>
          <h3>Keine passende Funktion gefunden</h3>
          <p>Versuche einen allgemeineren Begriff oder setze die Filter zurück.</p>
          <button className="app-secondary-button" type="button" onClick={resetFilters}>Alle Funktionen zeigen</button>
        </div>
      )}

      <ToolDialog tool={selectedTool} onClose={() => setSelectedTool(null)} />
    </div>
  );
}

export default function ToolLibrary() {
  const searchParams = useSearchParams();
  const requestedPriority = searchParams.get("priority");
  const initialPriority: PriorityFilter =
    requestedPriority === "A" || requestedPriority === "B" || requestedPriority === "C"
      ? requestedPriority
      : "all";

  return (
    <ToolLibraryView
      key={searchParams.toString()}
      initialQuery={searchParams.get("q") ?? ""}
      initialPriority={initialPriority}
    />
  );
}
