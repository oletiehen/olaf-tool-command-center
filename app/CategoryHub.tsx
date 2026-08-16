import AppLink from "./AppLink";
import { categoryLabels, categoryOptions, tools, type Category } from "./tool-data";

const categoryDescriptions: Record<Category, string> = {
  strategy: "Planen, priorisieren und Vorhaben verbindlich strukturieren.",
  create: "Dokumente, Präsentationen, Vorlagen und Inhalte erstellen.",
  build: "Websites, Apps und digitale Produkte konzipieren und umsetzen.",
  sales: "Kontakte, Kommunikation und Vertriebsarbeit organisieren.",
  analyse: "Daten prüfen, Zusammenhänge erkennen und Entscheidungen vorbereiten.",
  utility: "Praktische Aufgaben im Alltag und am Computer erledigen.",
  travel: "Reisen recherchieren, vergleichen und vorbereiten.",
  design: "Interfaces, Markenauftritte und visuelle Systeme gestalten.",
  media: "Bilder, Audio und Videos erstellen oder bearbeiten.",
  productivity: "Aufgaben, Notizen, Meetings und Wissen besser organisieren.",
  documents: "PDFs und andere Dokumentformate bearbeiten und verwalten.",
  research: "Quellen, Daten und Marktinformationen gezielt erschließen.",
  integrations: "Externe Dienste verbinden und Arbeitsabläufe automatisieren.",
};

const categoryItems = categoryOptions
  .filter((option): option is { value: Category; label: string } => option.value !== "all")
  .map((option) => {
    const matchingTools = tools.filter((tool) => tool.category === option.value);
    return {
      ...option,
      description: categoryDescriptions[option.value],
      count: matchingTools.length,
      examples: matchingTools.slice(0, 3).map((tool) => tool.name),
    };
  });

export default function CategoryHub() {
  return (
    <div className="app-page category-hub-page">
      <section className="app-page-intro category-hub-intro">
        <div>
          <span className="app-eyebrow">Unterkategorien</span>
          <h2>Wähle zuerst die Aufgabe.</h2>
        </div>
        <p>
          Jede Kategorie öffnet eine eigene gefilterte Werkzeugansicht. So siehst du nur die
          Funktionen, die zu deinem aktuellen Vorhaben passen.
        </p>
      </section>

      <section className="category-hub-grid" aria-label="Werkzeugkategorien">
        {categoryItems.map((item, index) => (
          <AppLink
            className="category-hub-card"
            data-category={item.value}
            href={`/funktionen/alle?category=${encodeURIComponent(item.value)}`}
            key={item.value}
          >
            <span className="category-hub-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="category-hub-count">{item.count} Funktionen</span>
            <h3>{categoryLabels[item.value]}</h3>
            <p>{item.description}</p>
            <small>{item.examples.join(" · ")}</small>
            <span className="category-hub-action">Kategorie öffnen <i aria-hidden="true">→</i></span>
          </AppLink>
        ))}
      </section>
    </div>
  );
}
