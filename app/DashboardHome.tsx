import AppLink from "./AppLink";
import { coreTools, screenshotTools, tools, workflow } from "./tool-data";

const featuredScreenshotTools = ["GitHub", "Figma", "Supabase", "Vercel"]
  .map((name) => screenshotTools.find((tool) => tool.name === name))
  .filter((tool): tool is (typeof screenshotTools)[number] => Boolean(tool));

export default function DashboardHome() {
  return (
    <div className="app-page dashboard-page">
      <section className="dashboard-welcome">
        <div className="welcome-copy">
          <span className="app-eyebrow">Dein persönliches Command Center</span>
          <h2>Guten Tag, Olaf.</h2>
          <p>
            Wähle zuerst, was du erreichen möchtest. Die App führt dich danach in den passenden
            Bereich – ohne dass du alle {tools.length} Funktionen überblicken musst.
          </p>
          <div className="welcome-actions">
            <AppLink className="app-primary-button" href="/funktionen">Werkzeug finden <span aria-hidden="true">→</span></AppLink>
            <AppLink className="app-secondary-button" href="/workflow">Workflow starten</AppLink>
          </div>
        </div>
        <div className="welcome-focus">
          <div className="welcome-focus-head">
            <span>Nächster sinnvoller Start</span>
            <span className="focus-number">01</span>
          </div>
          <strong>Planmodus</strong>
          <p>Komplexe Vorhaben zuerst vollständig ordnen, bevor etwas umgesetzt wird.</p>
          <AppLink href="/funktionen/alle?q=Planmodus">Mit Vorlage starten <span aria-hidden="true">↗</span></AppLink>
        </div>
      </section>

      <section className="dashboard-stats" aria-label="App-Kennzahlen">
        <article>
          <span>Werkzeugbibliothek</span>
          <strong>{tools.length}</strong>
          <small>{coreTools.length} Kern + {screenshotTools.length} Erweiterungen</small>
        </article>
        <article>
          <span>Hohe Priorität</span>
          <strong>{coreTools.filter((tool) => tool.priority === "A").length}</strong>
          <small>persönliche Werkzeuge mit direktem Hebel</small>
        </article>
        <article>
          <span>Kern-Workflow</span>
          <strong>{workflow.length}</strong>
          <small>aufeinanderfolgende Schritte</small>
        </article>
        <article>
          <span>Prompt-Bibliothek</span>
          <strong>{tools.length + 1}</strong>
          <small>alle Werkzeuge plus Master-Prompt</small>
        </article>
      </section>

      <section className="catalog-highlight" aria-label="Neue Screenshot-Erweiterungen">
        <div>
          <span className="app-eyebrow">Neu eingelesen &amp; bereinigt</span>
          <h2>{screenshotTools.length} zusätzliche Funktionen aus deinen Screenshots</h2>
          <p>Als eigener Katalog geführt, ohne Dopplungen und mit dem Status „Verfügbarkeit prüfen“.</p>
        </div>
        <div className="catalog-highlight-links">
          {featuredScreenshotTools.map((tool) => (
            <AppLink href={"/funktionen/erweiterungen?q=" + encodeURIComponent(tool.name)} key={tool.id}>
              <span>{tool.mark}</span>{tool.name}<i aria-hidden="true">↗</i>
            </AppLink>
          ))}
          <AppLink className="catalog-all-link" href="/funktionen/erweiterungen">Erweiterungen öffnen <i aria-hidden="true">→</i></AppLink>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="app-section-heading">
          <div>
            <span className="app-eyebrow">Drei klare Wege</span>
            <h2>Was möchtest du jetzt tun?</h2>
          </div>
        </div>
        <div className="area-grid">
          <AppLink className="area-card" href="/funktionen">
            <span className="area-card-index">01</span>
            <div className="area-card-icon" aria-hidden="true">01</div>
            <h3>Werkzeug auswählen</h3>
            <p>Über Kernwerkzeuge, Erweiterungen oder Aufgabenbereiche gezielt einsteigen.</p>
            <span className="area-card-link">Bereiche ansehen <i aria-hidden="true">→</i></span>
          </AppLink>
          <AppLink className="area-card" href="/workflow">
            <span className="area-card-index">02</span>
            <div className="area-card-icon" aria-hidden="true">02</div>
            <h3>Vorhaben strukturieren</h3>
            <p>Den empfohlenen Weg vom Plan bis zur Auswertung Schritt für Schritt nutzen.</p>
            <span className="area-card-link">Ablauf öffnen <i aria-hidden="true">→</i></span>
          </AppLink>
          <AppLink className="area-card" href="/prompts">
            <span className="area-card-index">03</span>
            <div className="area-card-icon" aria-hidden="true">03</div>
            <h3>Vorlage verwenden</h3>
            <p>Die richtige Vorlage auswählen, prüfen und mit einem Klick kopieren.</p>
            <span className="area-card-link">Studio öffnen <i aria-hidden="true">→</i></span>
          </AppLink>
        </div>
      </section>
    </div>
  );
}
