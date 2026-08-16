import AppLink from "./AppLink";
import { categoryOptions, coreTools, screenshotTools, tools } from "./tool-data";

const functionPaths = [
  {
    index: "01",
    title: "Alle Werkzeuge",
    description: "Nach Namen suchen und bei Bedarf Projekt, Kategorie oder Priorität eingrenzen.",
    meta: `${tools.length} Funktionen`,
    href: "/funktionen/alle",
  },
  {
    index: "02",
    title: "Kernwerkzeuge",
    description: "Die persönlich eingeordneten Funktionen mit dem größten direkten Nutzen.",
    meta: `${coreTools.length} Funktionen`,
    href: "/funktionen/kern",
  },
  {
    index: "03",
    title: "Erweiterungen",
    description: "Der bereinigte Katalog aus deinen Screenshots mit klarer Verfügbarkeitskennzeichnung.",
    meta: `${screenshotTools.length} Funktionen`,
    href: "/funktionen/erweiterungen",
  },
  {
    index: "04",
    title: "Nach Aufgabe",
    description: "Über verständliche Themenbereiche einsteigen, ohne die gesamte Bibliothek zu überblicken.",
    meta: `${categoryOptions.length - 1} Kategorien`,
    href: "/funktionen/kategorien",
  },
] as const;

export default function FunctionHub() {
  return (
    <div className="app-page function-hub-page">
      <section className="app-page-intro function-hub-intro">
        <div>
          <span className="app-eyebrow">Werkzeuge · übersichtlich gegliedert</span>
          <h2>Wie möchtest du ein Werkzeug finden?</h2>
        </div>
        <p>
          Du musst nicht durch alle {tools.length} Einträge scrollen. Wähle zuerst den passenden
          Einstieg und verfeinere deine Auswahl erst auf der nächsten Seite.
        </p>
      </section>

      <section className="function-path-grid" aria-label="Bereiche der Werkzeugbibliothek">
        {functionPaths.map((item) => (
          <AppLink className="function-path-card" href={item.href} key={item.href}>
            <span className="function-path-index">{item.index}</span>
            <span className="function-path-meta">{item.meta}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <span className="function-path-action">Bereich öffnen <i aria-hidden="true">→</i></span>
          </AppLink>
        ))}
      </section>

      <section className="function-guidance-card">
        <div>
          <span className="app-eyebrow">Wenn du noch unsicher bist</span>
          <h2>Beginne mit dem Ziel, nicht mit dem Werkzeug.</h2>
          <p>Der Planmodus ordnet erst das Vorhaben und empfiehlt danach die passenden Funktionen.</p>
        </div>
        <AppLink className="app-primary-button" href="/funktionen/alle?q=Planmodus">
          Planmodus öffnen <span aria-hidden="true">→</span>
        </AppLink>
      </section>
    </div>
  );
}
