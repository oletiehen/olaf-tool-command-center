import AppLink from "./AppLink";
import { categoryLabels, coreTools, screenshotTools, tools } from "./tool-data";

const featuredTools = coreTools.slice(0, 6);

export default function ChatGptKnowledge() {
  return (
    <div className="app-page knowledge-page">
      <section className="app-page-intro knowledge-page-intro">
        <div>
          <span className="app-eyebrow">ChatGPT-Arbeitszentrale</span>
          <h2>Funktionen verstehen, richtig auswählen und direkt anwenden.</h2>
        </div>
        <p>
          Der bestehende Funktionskatalog ist der ChatGPT-Bereich dieses gemeinsamen Dashboards.
          Er verbindet Werkzeugerklärung, Einsatzgrenzen, Projektbezug und fertige Vorlagen.
        </p>
      </section>

      <section className="dashboard-stats" aria-label="ChatGPT-Wissensbasis">
        <article><span>Werkzeuge &amp; Apps</span><strong>{tools.length}</strong><small>{coreTools.length} Kern + {screenshotTools.length} Erweiterungen</small></article>
        <article><span>Direkte Vorlagen</span><strong>{tools.length + 1}</strong><small>inklusive Master-Startprompt</small></article>
        <article><span>Aufgabenbereiche</span><strong>{Object.keys(categoryLabels).length}</strong><small>für eine schnelle Auswahl</small></article>
        <article><span>Empfohlener Weg</span><strong>4</strong><small>Planen · Bauen · Prüfen · Auswerten</small></article>
      </section>

      <section className="knowledge-path-grid">
        <AppLink href="/funktionen">
          <span>01</span><h3>Werkzeug finden</h3>
          <p>Über Aufgabe, Kernkatalog oder Erweiterungen zum passenden Werkzeug gelangen.</p>
          <strong>Auswahl öffnen →</strong>
        </AppLink>
        <AppLink href="/prompts">
          <span>02</span><h3>Prompt verwenden</h3>
          <p>Eine fertige Vorlage auswählen, Platzhalter anpassen und direkt kopieren.</p>
          <strong>Prompt-Studio öffnen →</strong>
        </AppLink>
        <AppLink href="/workflow">
          <span>03</span><h3>Vorhaben strukturieren</h3>
          <p>Ein Projekt von der Planung bis zur Auswertung in kontrollierten Schritten führen.</p>
          <strong>Workflow öffnen →</strong>
        </AppLink>
      </section>

      <section className="dashboard-section">
        <div className="app-section-heading">
          <div><span className="app-eyebrow">Persönlicher Kern</span><h2>Die wichtigsten direkten Einstiege</h2></div>
          <AppLink href="/funktionen/kern">Alle Kernwerkzeuge ansehen →</AppLink>
        </div>
        <div className="knowledge-featured-tools">
          {featuredTools.map((tool) => (
            <AppLink href={`/funktionen/alle?q=${encodeURIComponent(tool.name)}`} key={tool.id}>
              <span>{tool.mark}</span>
              <div><h3>{tool.name}</h3><p>{tool.summary}</p></div>
              <i aria-hidden="true">›</i>
            </AppLink>
          ))}
        </div>
      </section>
    </div>
  );
}

