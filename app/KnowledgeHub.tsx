import AppLink from "./AppLink";
import { codexCapabilities, codexPracticeExamples, niklasInsights } from "./knowledge-data";
import { tools } from "./tool-data";

const areas = [
  {
    index: "01",
    title: "Niklas Volland",
    copy: "Neue Beiträge werden in konkrete Tipps, Olaf-Nutzen, Projektideen und direkt nutzbare Prompts übersetzt.",
    href: "/wissen/niklas-volland",
    link: "Alle Niklas-Tipps öffnen",
  },
  {
    index: "02",
    title: "ChatGPT",
    copy: `${tools.length} Funktionen und Apps mit Einsatzgrenzen, Beispielen und fertigen Arbeitsaufträgen.`,
    href: "/wissen/chatgpt",
    link: "ChatGPT-Zentrale öffnen",
  },
  {
    index: "03",
    title: "Codex",
    copy: "Fähigkeiten, Praxisaufträge und sichere Freigabegrenzen für Entwicklung, Recherche und Medienarbeit.",
    href: "/wissen/codex",
    link: "Codex-Navigator öffnen",
  },
] as const;

export default function KnowledgeHub() {
  return (
    <div className="app-page dashboard-page">
      <section className="app-page-intro">
        <div>
          <span className="app-eyebrow">Eine gemeinsame Wissensbasis</span>
          <h2>Aus KI-Neuigkeiten werden anwendbare nächste Schritte.</h2>
        </div>
        <p>
          Dieser Bereich führt Niklas-Volland-Auswertungen, ChatGPT-Werkzeuge und Codex-Praxis
          vollständig auf einer Plattform zusammen. Alle drei Bereiche folgen derselben Olaf-Logik.
        </p>
      </section>

      <section className="dashboard-stats" aria-label="KI-Wissensbasis im Aufbau">
        <article>
          <span>Niklas-Impulse</span>
          <strong>{niklasInsights.length}</strong>
          <small>mit Nutzen, Projekten und Prompts</small>
        </article>
        <article>
          <span>ChatGPT-Bibliothek</span>
          <strong>{tools.length}</strong>
          <small>Funktionen und Apps</small>
        </article>
        <article>
          <span>Codex-Navigator</span>
          <strong>{codexCapabilities.length}</strong>
          <small>Fähigkeiten + {codexPracticeExamples.length} Praxisaufträge</small>
        </article>
        <article>
          <span>Gemeinsame Plattform</span>
          <strong>1</strong>
          <small>Wissen, Werkzeuge und Umsetzung</small>
        </article>
      </section>

      <section className="dashboard-section">
        <div className="app-section-heading">
          <div>
            <span className="app-eyebrow">Nach Wissensquelle starten</span>
            <h2>Was möchten Sie heute anwenden?</h2>
          </div>
        </div>
        <div className="area-grid">
          {areas.map((area) => (
            <AppLink className="area-card" href={area.href} key={area.title}>
              <span className="area-card-index">{area.index}</span>
              <div className="area-card-icon" aria-hidden="true">{area.index}</div>
              <h3>{area.title}</h3>
              <p>{area.copy}</p>
              <span className="area-card-link">{area.link} <i aria-hidden="true">→</i></span>
            </AppLink>
          ))}
        </div>
      </section>

      <section className="catalog-highlight">
        <div>
          <span className="app-eyebrow">Die gemeinsame Olaf-Logik</span>
          <h2>Jeder Eintrag beantwortet künftig dieselben sechs Fragen.</h2>
          <p>Worum geht es? Was ist belastbar? Was bringt es Ihnen? Zu welchem Projekt passt es? Wie setzen Sie es um? Welchen Prompt können Sie sofort kopieren?</p>
        </div>
        <div className="catalog-highlight-links" aria-label="Gemeinsame Funktionen">
          <span>Projektbezug</span>
          <span>Quellenstatus</span>
          <span>Umsetzung</span>
          <span>Prompt-Vorlage</span>
        </div>
      </section>
    </div>
  );
}
