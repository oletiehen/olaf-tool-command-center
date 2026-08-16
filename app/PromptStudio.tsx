"use client";

import { useMemo, useState } from "react";
import AppLink from "./AppLink";
import {
  categoryLabels,
  categoryOptions,
  coreTools,
  getToolSource,
  masterPrompt,
  screenshotTools,
  sourceLabels,
  sourceOptions,
  tools,
  type Category,
  type ToolSource,
} from "./tool-data";

type PromptItem = {
  id: string;
  name: string;
  mark: string;
  category: "master" | Category;
  label: string;
  summary: string;
  prompt: string;
  toolName: string;
  source: ToolSource;
};

const promptItems: PromptItem[] = [
  {
    id: "master",
    name: "Master-Startprompt",
    mark: "01",
    category: "master",
    label: "Empfohlener Start",
    summary: "Der vollständige Planungsauftrag für den KI-Immobiliencoach mit klarer Freigabegrenze.",
    prompt: masterPrompt,
    toolName: "Planmodus",
    source: "core",
  },
  ...tools.map((tool) => ({
    id: tool.id,
    name: tool.name,
    mark: tool.mark,
    category: tool.category,
    label: categoryLabels[tool.category],
    summary: tool.summary,
    prompt: tool.prompt,
    toolName: tool.name,
    source: getToolSource(tool),
  })),
];

export default function PromptStudio() {
  const [selectedId, setSelectedId] = useState("master");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | Category>("all");
  const [source, setSource] = useState<"all" | ToolSource>("all");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("de");
    return promptItems.filter((item) => {
      const categoryMatches = category === "all" || item.category === category;
      const sourceMatches = source === "all" || item.source === source;
      const textMatches = !normalized || [item.name, item.label, item.summary, item.prompt]
        .join(" ")
        .toLocaleLowerCase("de")
        .includes(normalized);
      return categoryMatches && sourceMatches && textMatches;
    });
  }, [category, query, source]);

  const selected = promptItems.find((item) => item.id === selectedId) ?? promptItems[0];

  async function copySelectedPrompt() {
    try {
      await navigator.clipboard.writeText(selected.prompt);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
    }
  }

  return (
    <div className="app-page prompts-page">
      <section className="app-page-intro prompts-page-intro">
        <div>
          <span className="app-eyebrow">{promptItems.length} direkt nutzbare Vorlagen</span>
          <h2>Wähle den Prompt, der zu deinem nächsten Schritt passt.</h2>
        </div>
        <p>
          Enthalten sind der Master-Startprompt, {coreTools.length} persönliche Kernvorlagen und
          {" "}{screenshotTools.length} Vorlagen aus dem erweiterten Screenshot-Katalog.
        </p>
      </section>

      <section className="prompt-studio-status" aria-label="Prompt-Studio Übersicht">
        <div>
          <span>Aktive Vorlage</span>
          <strong>{selected.name}</strong>
        </div>
        <div>
          <span>Bibliothek</span>
          <strong>{promptItems.length} Vorlagen</strong>
        </div>
        <div className="prompt-safety-status">
          <span className="draft-dot" aria-hidden="true" />
          <span>Freigabegrenze enthalten</span>
        </div>
      </section>

      <section className="prompt-studio-layout">
        <aside className="prompt-browser">
          <div className="prompt-browser-heading">
            <span className="app-eyebrow">Vorlagen</span>
            <strong>{filteredItems.length}</strong>
          </div>
          <label className="prompt-search-field">
            <span className="sr-only">Prompt-Vorlagen durchsuchen</span>
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Vorlage suchen …"
            />
          </label>
          <label className="prompt-category-field">
            <span className="sr-only">Prompt-Kategorie auswählen</span>
            <select value={category} onChange={(event) => setCategory(event.target.value as "all" | Category)}>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="prompt-category-field">
            <span className="sr-only">Prompt-Quelle auswählen</span>
            <select value={source} onChange={(event) => setSource(event.target.value as "all" | ToolSource)}>
              {sourceOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <ul className="prompt-list" aria-label="Prompt-Vorlagen">
            {filteredItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={selected.id === item.id ? "prompt-list-item active" : "prompt-list-item"}
                  onClick={() => {
                    setSelectedId(item.id);
                    setCopyState("idle");
                  }}
                >
                  <span className="prompt-list-mark" data-category={item.category}>{item.mark}</span>
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.label} · {item.source === "screenshots" ? "Screenshot" : "Kern"}</small>
                  </span>
                  <i aria-hidden="true">›</i>
                </button>
              </li>
            ))}
            {!filteredItems.length ? (
              <li className="prompt-list-empty">Keine passende Vorlage gefunden.</li>
            ) : null}
          </ul>
        </aside>

        <article className="prompt-editor">
          <header className="prompt-editor-header">
            <div>
              <span className="app-eyebrow">Ausgewählte Vorlage</span>
              <h2>{selected.name}</h2>
              <p>{selected.summary}</p>
            </div>
            <span className="prompt-editor-mark" data-category={selected.category}>{selected.mark}</span>
          </header>

          <div className="prompt-editor-meta">
            <span>{selected.label}</span>
            <span>{sourceLabels[selected.source]}</span>
            <span>{selected.prompt.length} Zeichen</span>
          </div>

          <div className="prompt-editor-content" aria-label={"Prompt für " + selected.name}>
            {selected.prompt}
          </div>

          <footer className="prompt-editor-actions">
            <button className="app-primary-button" type="button" onClick={copySelectedPrompt}>
              {copyState === "copied" ? "Prompt kopiert" : copyState === "error" ? "Erneut versuchen" : "Prompt kopieren"}
              <span aria-hidden="true">{copyState === "copied" ? "✓" : "↗"}</span>
            </button>
            <AppLink className="app-secondary-button" href={"/funktionen/alle?q=" + encodeURIComponent(selected.toolName)}>
              Funktion ansehen
            </AppLink>
          </footer>
        </article>
      </section>

      <section className="prompt-guidance-grid">
        <article>
          <span>01</span>
          <h3>Platzhalter anpassen</h3>
          <p>Ersetze eckige Klammern durch dein konkretes Ziel, den Zeitraum oder die Zielgruppe.</p>
        </article>
        <article>
          <span>02</span>
          <h3>Ergebnisgrenze nennen</h3>
          <p>Definiere, was fertig sein soll und welche Aktion ausdrücklich noch nicht erfolgen darf.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Mit Quellen arbeiten</h3>
          <p>Gib vorhandene Dateien oder verlässliche Quellen mit, statt fehlende Fakten zu erraten.</p>
        </article>
      </section>
    </div>
  );
}
