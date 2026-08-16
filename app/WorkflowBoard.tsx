"use client";

import { useState } from "react";
import AppLink from "./AppLink";
import { workflow } from "./tool-data";

const workflowDetails = [
  {
    result: "Ein freigegebener Gesamtplan mit Ziel, Umfang, Grenzen, Risiken und Abnahmekriterien.",
    question: "Was soll am Ende konkret fertig sein – und was gehört bewusst noch nicht dazu?",
    tool: "Planmodus",
  },
  {
    result: "Ein überprüfbarer Fertigstellungsauftrag, der offene Arbeit sichtbar hält.",
    question: "Welche Bedingungen müssen erfüllt sein, bevor das Vorhaben wirklich als fertig gilt?",
    tool: "Ziel verfolgen",
  },
  {
    result: "Eine konsistente Wissensbasis ohne veraltete oder widersprüchliche Aussagen.",
    question: "Welche vorhandenen Unterlagen sind verbindlich, welche nur historische Referenz?",
    tool: "Dateien",
  },
  {
    result: "Ein belastbares Modell für Annahmen, Wirtschaftlichkeit, Funnel und Entscheidungspunkte.",
    question: "Welche drei Zahlen würden eine falsche Richtung am frühesten sichtbar machen?",
    tool: "Spreadsheets",
  },
  {
    result: "Eine getestete Nutzerführung und danach ein bewusst begrenztes, funktionierendes MVP.",
    question: "Welche Kernaufgabe muss der erste Prototyp wirklich besser lösen als der bisherige Weg?",
    tool: "Sites",
  },
  {
    result: "Ein konsistenter Auftritt für Website, Pitch, Kundenmaterial und Partnerkommunikation.",
    question: "Welche eine Aussage soll nach jedem Kontakt mit der Marke im Gedächtnis bleiben?",
    tool: "Canva",
  },
  {
    result: "Eine priorisierte Partnerliste, persönliche Ansprache und sauber organisierte Gespräche.",
    question: "Welche Partner haben echten Zielgruppenfit – und welcher konkrete Anlass macht die Ansprache relevant?",
    tool: "Clay",
  },
] as const;

export default function WorkflowBoard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = workflow[activeIndex];
  const detail = workflowDetails[activeIndex];

  return (
    <div className="app-page workflow-page">
      <section className="app-page-intro workflow-page-intro">
        <div>
          <span className="app-eyebrow">Sieben Schritte · klare Reihenfolge</span>
          <h2>Arbeite nicht mit allen Werkzeugen zugleich.</h2>
        </div>
        <p>
          Der Workflow führt vom ersten Plan bis zur Vertriebsaktivierung. Wähle einen Schritt,
          um Ziel, Ergebnis und das wichtigste Werkzeug zu sehen.
        </p>
      </section>

      <section className="workflow-progress-card" aria-label="Workflow-Fortschritt">
        <div>
          <span>Ausgewählter Schritt</span>
          <strong>{activeIndex + 1} von {workflow.length}</strong>
        </div>
        <div className="workflow-progress-track" aria-hidden="true">
          <span style={{ width: ((activeIndex + 1) / workflow.length) * 100 + "%" }} />
        </div>
        <p>{active.title} · {active.tools}</p>
      </section>

      <section className="workflow-app-grid">
        <nav className="workflow-step-list" aria-label="Workflow-Schritte">
          {workflow.map((item, index) => (
            <button
              type="button"
              key={item.step}
              className={index === activeIndex ? "workflow-step-button active" : "workflow-step-button"}
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            >
              <span className="step-button-number">{item.step}</span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.tools}</small>
              </span>
              <i aria-hidden="true">›</i>
            </button>
          ))}
        </nav>

        <article className="workflow-detail-card">
          <header>
            <span className="workflow-detail-number">{active.step}</span>
            <div>
              <span className="app-eyebrow">Aktiver Schritt</span>
              <h2>{active.title}</h2>
            </div>
          </header>
          <div className="workflow-tool-chip">{active.tools}</div>
          <p className="workflow-detail-lead">{active.text}</p>

          <div className="workflow-detail-sections">
            <section>
              <span>Ergebnis dieses Schritts</span>
              <p>{detail.result}</p>
            </section>
            <section>
              <span>Entscheidende Frage</span>
              <p>{detail.question}</p>
            </section>
          </div>

          <div className="workflow-detail-actions">
            <AppLink className="app-primary-button" href={"/funktionen/alle?q=" + encodeURIComponent(detail.tool)}>
              {detail.tool} öffnen <span aria-hidden="true">→</span>
            </AppLink>
            <AppLink className="app-secondary-button" href="/prompts">Prompt-Studio öffnen</AppLink>
          </div>

          <div className="workflow-step-controls">
            <button
              type="button"
              disabled={activeIndex === 0}
              onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
            >
              <span aria-hidden="true">←</span> Vorheriger Schritt
            </button>
            <button
              type="button"
              disabled={activeIndex === workflow.length - 1}
              onClick={() => setActiveIndex((index) => Math.min(workflow.length - 1, index + 1))}
            >
              Nächster Schritt <span aria-hidden="true">→</span>
            </button>
          </div>
        </article>
      </section>

      <section className="workflow-boundary-card">
        <span className="boundary-symbol" aria-hidden="true">✓</span>
        <div>
          <span className="app-eyebrow">Feste Leitplanke</span>
          <h2>Planen und vorbereiten ist nicht dasselbe wie veröffentlichen.</h2>
          <p>
            Externe Aktionen wie Veröffentlichung, Versand, Buchung oder kostenpflichtige Schritte
            bleiben immer eine separate Entscheidung mit deiner ausdrücklichen Freigabe.
          </p>
        </div>
      </section>
    </div>
  );
}
