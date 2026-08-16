import Link from "next/link";
import { coreTools, screenshotTools, tools, workflow } from "./tool-data";

const priorityTools = coreTools.filter((tool) => tool.priority === "A").slice(0, 6);
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
            Von hier aus findest du {coreTools.length} persönliche Kernwerkzeuge und
            {" "}{screenshotTools.length} ergänzende Funktionen aus deinen Screenshots.
          </p>
          <div className="welcome-actions">
            <Link className="app-primary-button" href="/funktionen">Funktion auswählen <span aria-hidden="true">→</span></Link>
            <Link className="app-secondary-button" href="/workflow">Workflow öffnen</Link>
          </div>
        </div>
        <div className="welcome-focus">
          <div className="welcome-focus-head">
            <span>Nächster sinnvoller Start</span>
            <span className="focus-number">01</span>
          </div>
          <strong>Planmodus</strong>
          <p>Komplexe Vorhaben zuerst vollständig ordnen, bevor etwas umgesetzt wird.</p>
          <Link href="/funktionen?q=Planmodus">Mit Vorlage starten <span aria-hidden="true">↗</span></Link>
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
            <Link href={"/funktionen?q=" + encodeURIComponent(tool.name)} key={tool.id}>
              <span>{tool.mark}</span>{tool.name}<i aria-hidden="true">↗</i>
            </Link>
          ))}
          <Link className="catalog-all-link" href="/funktionen">Gesamten Katalog öffnen <i aria-hidden="true">→</i></Link>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="app-section-heading">
          <div>
            <span className="app-eyebrow">Schnellzugriff</span>
            <h2>Womit möchtest du arbeiten?</h2>
          </div>
        </div>
        <div className="area-grid">
          <Link className="area-card" href="/funktionen">
            <span className="area-card-index">01</span>
            <div className="area-card-icon" aria-hidden="true">▦</div>
            <h3>Funktionen</h3>
            <p>Alle Werkzeuge durchsuchen, filtern und im Detail verstehen.</p>
            <span className="area-card-link">Bibliothek öffnen <i aria-hidden="true">→</i></span>
          </Link>
          <Link className="area-card" href="/workflow">
            <span className="area-card-index">02</span>
            <div className="area-card-icon" aria-hidden="true">→</div>
            <h3>Workflow</h3>
            <p>Den empfohlenen Weg vom Plan bis zur Auswertung Schritt für Schritt nutzen.</p>
            <span className="area-card-link">Ablauf öffnen <i aria-hidden="true">→</i></span>
          </Link>
          <Link className="area-card" href="/prompts">
            <span className="area-card-index">03</span>
            <div className="area-card-icon" aria-hidden="true">✦</div>
            <h3>Prompt-Studio</h3>
            <p>Die richtige Vorlage auswählen, prüfen und mit einem Klick kopieren.</p>
            <span className="area-card-link">Studio öffnen <i aria-hidden="true">→</i></span>
          </Link>
        </div>
      </section>

      <section className="dashboard-columns">
        <article className="dashboard-panel priority-panel">
          <div className="panel-heading">
            <div>
              <span className="app-eyebrow">Priorität A</span>
              <h2>Werkzeuge mit hohem Hebel</h2>
            </div>
            <Link href="/funktionen?priority=A">Alle zeigen</Link>
          </div>
          <div className="priority-tool-list">
            {priorityTools.map((tool) => (
              <Link href={"/funktionen?q=" + encodeURIComponent(tool.name)} key={tool.id}>
                <span className="mini-tool-mark" data-category={tool.category}>{tool.mark}</span>
                <span>
                  <strong>{tool.name}</strong>
                  <small>{tool.summary}</small>
                </span>
                <i aria-hidden="true">›</i>
              </Link>
            ))}
          </div>
        </article>

        <article className="dashboard-panel workflow-preview-panel">
          <div className="panel-heading">
            <div>
              <span className="app-eyebrow">Produktionskette</span>
              <h2>Die ersten vier Schritte</h2>
            </div>
            <Link href="/workflow">Komplett öffnen</Link>
          </div>
          <ol className="mini-workflow">
            {workflow.slice(0, 4).map((item) => (
              <li key={item.step}>
                <span>{item.step}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.tools}</small>
                </div>
              </li>
            ))}
          </ol>
          <div className="approval-note">
            <span className="draft-dot" aria-hidden="true" />
            <div>
              <strong>Freigabegrenze aktiv</strong>
              <p>Veröffentlichen, versenden oder buchen erst nach deinem ausdrücklichen Go.</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
