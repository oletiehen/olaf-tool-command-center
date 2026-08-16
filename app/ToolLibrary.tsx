"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  availabilityLabels,
  categoryLabels,
  categoryOptions,
  coreTools,
  getToolAvailability,
  getToolSource,
  projectLabels,
  projectOptions,
  screenshotTools,
  sourceLabels,
  sourceOptions,
  tools,
  type Category,
  type Priority,
  type Project,
  type Tool,
  type ToolSource,
} from "./tool-data";

type CategoryFilter = "all" | Category;
type ProjectFilter = "all" | Project;
type PriorityFilter = "all" | Priority;
type SourceFilter = "all" | ToolSource;

const PAGE_SIZE = 48;

const priorityLabels: Record<Priority, string> = {
  A: "A · hoher Hebel",
  B: "B · sinnvoll",
  C: "C · ergänzend",
};

function LibraryCard({ tool, onOpen }: { tool: Tool; onOpen: (tool: Tool) => void }) {
  const source = getToolSource(tool);

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
            {source === "screenshots" ? <span className="source-pill">Screenshot</span> : null}
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
            <span className="soft-pill">{sourceLabels[getToolSource(tool)]}</span>
            <span className="availability-pill" data-availability={getToolAvailability(tool)}>
              {availabilityLabels[getToolAvailability(tool)]}
            </span>
          </div>

          {getToolSource(tool) === "screenshots" ? (
            <div className="catalog-note" role="note">
              Im Screenshot gesehen · nicht automatisch installiert oder verbunden. Bitte vor der Nutzung live prüfen.
            </div>
          ) : null}

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
  const [source, setSource] = useState<SourceFilter>("all");
  const [query, setQuery] = useState(initialQuery);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("de");
    return tools.filter((tool) => {
      const matchesProject = project === "all" || tool.projects.includes(project);
      const matchesCategory = category === "all" || tool.category === category;
      const matchesPriority = priority === "all" || tool.priority === priority;
      const matchesSource = source === "all" || getToolSource(tool) === source;
      const searchable = [
        tool.name,
        tool.type,
        tool.summary,
        tool.function,
        tool.use,
        tool.example,
        categoryLabels[tool.category],
        sourceLabels[getToolSource(tool)],
        availabilityLabels[getToolAvailability(tool)],
      ].join(" ").toLocaleLowerCase("de");
      return matchesProject && matchesCategory && matchesPriority && matchesSource && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, priority, project, query, source]);

  const hasFilters = project !== "all" || category !== "all" || priority !== "all" || source !== "all" || query !== "";

  function resetFilters() {
    setProject("all");
    setCategory("all");
    setPriority("all");
    setSource("all");
    setQuery("");
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div className="app-page library-page">
      <section className="app-page-intro">
        <div>
          <span className="app-eyebrow">Werkzeugbibliothek</span>
          <h2>Finde genau die Funktion, die jetzt weiterhilft.</h2>
        </div>
        <p>
          Durchsuche 29 persönlich eingeordnete Kernfunktionen und den bereinigten Katalog aus
          deinen Screenshots. Jede Erweiterung enthält Status, Einordnung und eine Prompt-Vorlage.
        </p>
      </section>

      <section className="library-summary" aria-label="Bibliotheksübersicht">
        <div><strong>{tools.length}</strong><span>Funktionen gesamt</span></div>
        <div><strong>{coreTools.length}</strong><span>Kernfunktionen</span></div>
        <div><strong>{screenshotTools.length}</strong><span>Screenshot-Erweiterungen</span></div>
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
                onChange={(event) => {
                  setQuery(event.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                placeholder="z. B. Canva, App, Vertrieb …"
              />
            </span>
          </label>
          <label className="select-field project-select">
            <span className="field-label">Projektfokus</span>
            <select value={project} onChange={(event) => {
              setProject(event.target.value as ProjectFilter);
              setVisibleCount(PAGE_SIZE);
            }}>
              {projectOptions.map((option) => (
                <option value={option.value} key={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="select-field priority-select">
            <span className="field-label">Priorität</span>
            <select value={priority} onChange={(event) => {
              setPriority(event.target.value as PriorityFilter);
              setVisibleCount(PAGE_SIZE);
            }}>
              <option value="all">Alle Prioritäten</option>
              <option value="A">A · hoher Hebel</option>
              <option value="B">B · sinnvoll</option>
              <option value="C">C · ergänzend</option>
            </select>
          </label>
          <label className="select-field source-select">
            <span className="field-label">Quelle &amp; Status</span>
            <select value={source} onChange={(event) => {
              setSource(event.target.value as SourceFilter);
              setVisibleCount(PAGE_SIZE);
            }}>
              {sourceOptions.map((option) => (
                <option value={option.value} key={option.value}>{option.label}</option>
              ))}
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
              onClick={() => {
                setCategory(option.value);
                setVisibleCount(PAGE_SIZE);
              }}
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
        <>
          <div className="tool-grid app-tool-grid">
            {filteredTools.slice(0, visibleCount).map((tool) => (
              <LibraryCard key={tool.id} tool={tool} onOpen={setSelectedTool} />
            ))}
          </div>
          {visibleCount < filteredTools.length ? (
            <div className="load-more-row">
              <button className="app-secondary-button" type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                Weitere {Math.min(PAGE_SIZE, filteredTools.length - visibleCount)} anzeigen
              </button>
              <span>{visibleCount} von {filteredTools.length} geladen</span>
            </div>
          ) : null}
        </>
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
