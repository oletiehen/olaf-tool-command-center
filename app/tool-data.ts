export type Priority = "A" | "B" | "C";

export type Category =
  | "strategy"
  | "create"
  | "build"
  | "sales"
  | "analyse"
  | "utility"
  | "travel";

export type Project =
  | "immobilien"
  | "training"
  | "content"
  | "organisation"
  | "inventar"
  | "privat";

export type Tool = {
  id: string;
  index: number;
  name: string;
  mark: string;
  type: string;
  priority: Priority;
  category: Category;
  projects: Project[];
  summary: string;
  function: string;
  use: string;
  example: string;
  prompt: string;
};

export const projectOptions: Array<{ value: "all" | Project; label: string }> = [
  { value: "all", label: "Alle Projekte" },
  { value: "immobilien", label: "KI-Immobiliencoach" },
  { value: "training", label: "Verkaufstraining" },
  { value: "content", label: "Content & Marke" },
  { value: "organisation", label: "Organisation" },
  { value: "inventar", label: "Wohnungsinventar" },
  { value: "privat", label: "Privat & Alltag" },
];

export const categoryOptions: Array<{ value: "all" | Category; label: string }> = [
  { value: "all", label: "Alle" },
  { value: "strategy", label: "Strategie" },
  { value: "create", label: "Erstellen" },
  { value: "build", label: "Apps & Web" },
  { value: "sales", label: "Vertrieb" },
  { value: "analyse", label: "Analyse" },
  { value: "utility", label: "Alltag" },
  { value: "travel", label: "Reise" },
];

export const categoryLabels: Record<Category, string> = {
  strategy: "Strategie",
  create: "Erstellen",
  build: "Apps & Web",
  sales: "Vertrieb",
  analyse: "Analyse",
  utility: "Alltag",
  travel: "Reise",
};

export const projectLabels: Record<Project, string> = {
  immobilien: "KI-Immobiliencoach",
  training: "Verkaufstraining",
  content: "Content & Marke",
  organisation: "Organisation",
  inventar: "Wohnungsinventar",
  privat: "Privat & Alltag",
};

export const tools: Tool[] = [
  {
    id: "planmodus",
    index: 1,
    name: "Planmodus",
    mark: "PL",
    type: "Arbeitsmodus",
    priority: "A",
    category: "strategy",
    projects: ["immobilien", "training", "content", "organisation"],
    summary: "Komplexe Vorhaben vollständig ordnen, bevor etwas umgesetzt wird.",
    function:
      "Der Planmodus trennt Planung und Ausführung. Er klärt Ziel, Abhängigkeiten, Entscheidungen, Risiken und Abnahmekriterien, ohne bereits Änderungen vorzunehmen.",
    use:
      "Der sauberste Startpunkt für Produktarchitektur, Businessplan, Website-Relaunch oder einen größeren Projektabschnitt.",
    example:
      "Den KI-Immobiliencoach von Positionierung und Nutzerreise bis zum Web-App-MVP in eine belastbare Reihenfolge zerlegen.",
    prompt:
      "Arbeite im Planmodus. Erstelle zunächst ausschließlich einen vollständigen Umsetzungsplan für meinen KI-Immobiliencoach. Zeige Abhängigkeiten, offene Entscheidungen, Risiken, Meilensteine und messbare Abnahmekriterien. Führe noch nichts aus und warte anschließend auf meine Freigabe.",
  },
  {
    id: "ziel-verfolgen",
    index: 2,
    name: "Ziel verfolgen",
    mark: "ZG",
    type: "Arbeitsmodus",
    priority: "A",
    category: "strategy",
    projects: ["immobilien", "training", "organisation"],
    summary: "Ein definiertes Endergebnis über mehrere Schritte konsequent fertigstellen.",
    function:
      "Ein Ziel hält den gewünschten Endzustand, Grenzen und Prüfkriterien über längere Arbeit hinweg aktiv und zeigt, was bis zur Fertigstellung noch fehlt.",
    use:
      "Ideal für zusammenhängende Ergebnispakete, die nicht nach einer einzelnen Antwort beendet sein sollen.",
    example:
      "Ein konsistentes MVP-Paket aus Produktkonzept, Finanzmodell, Website, Pitch und Partnerprogramm erstellen.",
    prompt:
      "Verfolge das Ziel: Erstelle ein vollständiges und konsistentes MVP-Paket für meinen KI-Immobiliencoach. Das Ziel ist erst erreicht, wenn alle vereinbarten Ergebnisse vorliegen, geprüft sind und keine offenen Widersprüche mehr bestehen. Veröffentliche oder versende nichts ohne meine Freigabe.",
  },
  {
    id: "dateien",
    index: 3,
    name: "Dateien",
    mark: "DA",
    type: "Grundfunktion",
    priority: "A",
    category: "create",
    projects: ["immobilien", "training", "content", "organisation", "inventar"],
    summary: "Vorhandene Unterlagen als verlässliche Arbeitsgrundlage zusammenführen.",
    function:
      "Dateien wie Dokumente, Tabellen, Präsentationen, Bilder oder CSV-Daten können gelesen, verglichen, strukturiert und weiterverarbeitet werden.",
    use:
      "Hilft, ältere Konzepte und aktuelle Unterlagen zu einer konsistenten Wissensbasis zu verbinden.",
    example:
      "Businessplan, Trainingsskripte und Checklisten gemeinsam auswerten und veraltete Aussagen markieren.",
    prompt:
      "Analysiere alle beigefügten Dateien als zusammengehöriges Projekt. Zeige nutzbare Bausteine, Widersprüche, veraltete Inhalte und fehlende Informationen. Erfinde nichts und kennzeichne jede Unsicherheit.",
  },
  {
    id: "kamera",
    index: 4,
    name: "Kamera",
    mark: "KA",
    type: "Grundfunktion",
    priority: "B",
    category: "utility",
    projects: ["inventar", "immobilien", "content"],
    summary: "Neue Fotos direkt aufnehmen und unmittelbar auswerten lassen.",
    function:
      "Die Kamera fügt ein neu aufgenommenes Bild in die Unterhaltung ein. Sichtbare Gegenstände, Texte, Strukturen oder Schäden können anschließend analysiert werden.",
    use:
      "Praktisch für Wohnungsinventar, Raumdokumentation, Belege, handschriftliche Notizen oder Objektzustände.",
    example:
      "Eine Schublade fotografieren und daraus einen strukturierten, durchsuchbaren Inventareintrag erzeugen.",
    prompt:
      "Analysiere dieses Foto für mein Inventar. Erfasse erkennbare Gegenstände, Kategorie, Raum, eine präzise Kurzbeschreibung und passende Suchbegriffe. Kennzeichne alles, was nicht sicher erkennbar ist.",
  },
  {
    id: "fotos",
    index: 5,
    name: "Fotos",
    mark: "FO",
    type: "Grundfunktion",
    priority: "B",
    category: "utility",
    projects: ["immobilien", "content", "inventar", "privat"],
    summary: "Vorhandene Bilder auswählen, vergleichen, sortieren und bewerten.",
    function:
      "Fotos greift auf bereits vorhandene Bilder zu. Mehrere Motive lassen sich nach Qualität, Wirkung, Reihenfolge oder Eignung vergleichen.",
    use:
      "Besonders nützlich für Immobilienfotos, Website-Motive, Markenmaterial und Inventardokumentation.",
    example:
      "Zehn Objektfotos nach Titelbild-Eignung, Raumverständlichkeit und Verkaufswirkung sortieren.",
    prompt:
      "Bewerte diese Bilder nach technischer Qualität, emotionaler Wirkung, Verständlichkeit und Eignung für den vorgesehenen Zweck. Erstelle eine begründete Reihenfolge und markiere ungeeignete Motive.",
  },
  {
    id: "documents",
    index: 6,
    name: "Documents",
    mark: "DO",
    type: "Dokument-Skill",
    priority: "A",
    category: "create",
    projects: ["immobilien", "training", "content", "organisation"],
    summary: "Strukturierte, editierbare Textdokumente erstellen und überarbeiten.",
    function:
      "Documents erzeugt oder bearbeitet längere Dokumente mit belastbarer Gliederung, konsistenter Formatierung und visueller Qualitätsprüfung.",
    use:
      "Geeignet für Businesspläne, Kundenhandbücher, Skripte, SOPs, Leitfäden und Trainingsunterlagen.",
    example:
      "Ein Kundenhandbuch für private Immobilienverkäufer mit Checklisten und Praxisbeispielen entwickeln.",
    prompt:
      "Erstelle ein editierbares Kundenhandbuch für private Immobilienverkäufer. Strukturiere den gesamten Ablauf von Vorbereitung und Preisfindung bis Notar und Übergabe. Ergänze pro Kapitel eine Checkliste, typische Fehler und ein kurzes Praxisbeispiel.",
  },
  {
    id: "pdf",
    index: 7,
    name: "PDF",
    mark: "PD",
    type: "Dokument-Skill",
    priority: "B",
    category: "create",
    projects: ["immobilien", "training", "content"],
    summary: "Feste, druckfähige Endformate zuverlässig erstellen und prüfen.",
    function:
      "Der PDF-Workflow liest, erstellt und prüft Dokumente, bei denen Seitenaufbau und Layout beim Empfänger unverändert bleiben sollen.",
    use:
      "Ideal für Broschüren, Workbooks, Checklisten, Partnerunterlagen und finale Kundenmaterialien.",
    example:
      "Aus einem Angebotskonzept eine ruhige, hochwertige A4-Broschüre für die Weitergabe erstellen.",
    prompt:
      "Erstelle aus meinem Konzept eine hochwertige A4-PDF-Broschüre. Gliedere sie in Problem, Lösung, Ablauf, Leistungsumfang, Vorteile und häufige Fragen. Halte das Layout ruhig, klar und auch auf dem iPhone gut lesbar.",
  },
  {
    id: "spreadsheets",
    index: 8,
    name: "Spreadsheets",
    mark: "SP",
    type: "Tabellen-Skill",
    priority: "A",
    category: "analyse",
    projects: ["immobilien", "training", "organisation"],
    summary: "Kalkulationen, Szenarien und Kennzahlen in editierbaren Modellen abbilden.",
    function:
      "Spreadsheets erstellt und prüft Arbeitsmappen mit Formeln, Annahmen, Szenarien, Diagrammen und miteinander verknüpften Tabellenblättern.",
    use:
      "Der richtige Ort für Finanzplanung, Lead-Funnel, Marketingkosten, Liquidität und Break-even.",
    example:
      "Eine 36-Monats-Planung mit vorsichtigem, realistischem und ambitioniertem Szenario aufbauen.",
    prompt:
      "Erstelle eine editierbare 36-Monats-Finanzplanung mit klar gekennzeichneten Annahmen, Absatz, Umsatz, Kosten, Marketing, Liquidität, Break-even, drei Szenarien und einem übersichtlichen Dashboard. Verwende Formeln statt fest eingetragener Ergebnisse.",
  },
  {
    id: "presentations",
    index: 9,
    name: "Presentations",
    mark: "PR",
    type: "Präsentations-Skill",
    priority: "A",
    category: "create",
    projects: ["immobilien", "training", "content"],
    summary: "Editierbare Präsentationen mit klarer Dramaturgie und Sprechernotizen bauen.",
    function:
      "Presentations entwickelt aus einem Briefing oder vorhandenen Unterlagen eine nachvollziehbare Foliengeschichte und prüft anschließend das visuelle Ergebnis.",
    use:
      "Stark für Partner-Pitches, Kundenvorträge und Verkaufstrainings mit jeweils eigener Erzählstruktur.",
    example:
      "Ein kompaktes Partner-Pitch-Deck mit Problem, Lösung, Produkt, Geschäftsmodell und nächstem Schritt erstellen.",
    prompt:
      "Erstelle ein editierbares 12-Folien-Pitch-Deck für strategische Partner. Jede Folie braucht eine klare Kernaussage, höchstens fünf kurze Punkte, eine passende Visualisierungsidee und präzise Sprechernotizen.",
  },
  {
    id: "template-creator",
    index: 10,
    name: "Template Creator",
    mark: "TC",
    type: "Vorlagen-Skill",
    priority: "A",
    category: "create",
    projects: ["immobilien", "training", "content", "organisation"],
    summary: "Bewährte Abläufe als wiederverwendbare persönliche Vorlage sichern.",
    function:
      "Template Creator verwandelt Regeln, Beispiele und Qualitätskriterien in eine dauerhaft wiederverwendbare Arbeitsvorlage.",
    use:
      "Damit lassen sich Exposés, Objektanalysen, Einwandbehandlungen, Trainings und Skripte konsistent standardisieren.",
    example:
      "Eine feste Exposé-Vorlage mit Pflichtfeldern und abschließender Qualitätskontrolle entwickeln.",
    prompt:
      "Erstelle eine wiederverwendbare Vorlage für Immobilien-Exposés. Definiere Pflichtbereiche, Tonalität und eine Schlussprüfung auf widersprüchliche Zahlen, fehlende Angaben, unbelegte Aussagen und unklare Formulierungen.",
  },
  {
    id: "sites",
    index: 11,
    name: "Sites",
    mark: "SI",
    type: "Website-Skill",
    priority: "A",
    category: "build",
    projects: ["immobilien", "training", "content"],
    summary: "Websites, Dashboards und interaktive Prototypen direkt umsetzen.",
    function:
      "Sites baut vollständige responsive Weboberflächen und kann daraus nach separater Freigabe eine gehostete Seite machen.",
    use:
      "Passend für Premium-Website, App-Click-Dummy, Kundenportal, Projekttracker oder Investoren-Demo.",
    example:
      "Ein mobiles Dashboard mit Fortschritt, Aufgaben, Unterlagen und nächsten Schritten prototypisieren.",
    prompt:
      "Erstelle eine responsive Premium-Website mit interaktiver App-Vorschau für meinen KI-Immobiliencoach. Mobil zuerst, klare Kachelstruktur, ruhige Blau-Gold-Weiß-Optik und keine Veröffentlichung ohne meine ausdrückliche Freigabe.",
  },
  {
    id: "browser",
    index: 12,
    name: "Browser",
    mark: "BR",
    type: "Browser-Werkzeug",
    priority: "A",
    category: "analyse",
    projects: ["immobilien", "content", "organisation", "privat"],
    summary: "Öffentliche Webseiten recherchieren und sichtbare Abläufe prüfen.",
    function:
      "Der Browser kann Seiten öffnen, sichtbare Informationen erfassen und unterstützte Webabläufe bedienen. Umfang und Anmeldung hängen vom gewählten Browserkontext ab.",
    use:
      "Geeignet für Wettbewerbsrecherche, Angebotsvergleiche, Quellenprüfung und nachvollziehbare Website-Tests.",
    example:
      "Öffentliche Angebote für private Immobilienverkäufer vergleichen und ihre Positionierung gegenüberstellen.",
    prompt:
      "Recherchiere öffentlich zugängliche Angebote für private Immobilienverkäufer. Vergleiche Zielgruppe, Leistungsumfang, Preislogik, digitale Werkzeuge, persönliche Unterstützung und erkennbare Abgrenzungsmöglichkeiten. Belege jede Tatsachenangabe mit einer Quelle.",
  },
  {
    id: "chrome",
    index: 13,
    name: "Chrome",
    mark: "CH",
    type: "Browser-Anbindung",
    priority: "B",
    category: "utility",
    projects: ["immobilien", "content", "organisation", "privat"],
    summary: "Mit bestehenden Tabs und angemeldeten Sitzungen in Chrome arbeiten.",
    function:
      "Die Chrome-Anbindung nutzt nach Freigabe den vorhandenen Browserkontext, wenn eine Aufgabe geöffnete Tabs, Erweiterungen oder eine bestehende Anmeldung benötigt.",
    use:
      "Hilfreich für CMS-Prüfungen, eingeloggte Dashboards, Formulartests und reale Nutzerabläufe.",
    example:
      "Eine bereits geöffnete Website-Vorschau auf Navigation, Formulare und mobile Verständlichkeit prüfen.",
    prompt:
      "Prüfe die aktuell in Chrome geöffnete Vorschau. Untersuche Navigation, mobile Darstellung, Lesbarkeit, Formulare, Fehlermeldungen und widersprüchliche Texte. Nimm zunächst keine Änderungen vor, sondern erstelle einen priorisierten Prüfbericht.",
  },
  {
    id: "computer",
    index: 14,
    name: "Computer",
    mark: "CO",
    type: "Desktop-Werkzeug",
    priority: "B",
    category: "utility",
    projects: ["organisation", "inventar", "content", "privat"],
    summary: "Lokale Mac-Apps für sichtbare, klar abgegrenzte Aufgaben bedienen.",
    function:
      "Computer ermöglicht das Lesen und Bedienen unterstützter lokaler Apps über deren sichtbare Oberfläche. Kritische Aktionen bleiben bestätigungspflichtig.",
    use:
      "Sinnvoll, wenn eine Aufgabe nur in einer Desktop-App möglich ist und kein direkter Datenzugang existiert.",
    example:
      "Eine sichtbare App-Einstellung prüfen oder Informationen aus einer lokalen Oberfläche strukturiert erfassen.",
    prompt:
      "Nutze die sichtbare Mac-App ausschließlich für diese klar abgegrenzte Aufgabe: [Aufgabe]. Verändere keine Einstellungen, lösche nichts und führe keine externe Aktion aus, bevor du mir den geplanten Schritt beschrieben hast.",
  },
  {
    id: "visualize",
    index: 15,
    name: "Visualize",
    mark: "VI",
    type: "Visualisierungs-Skill",
    priority: "B",
    category: "analyse",
    projects: ["immobilien", "training", "content", "organisation"],
    summary: "Zusammenhänge als interaktive Karte, Vergleich oder Simulation sichtbar machen.",
    function:
      "Visualize erzeugt direkt nutzbare interaktive Darstellungen für Abläufe, Szenarien, Karten, Vergleiche und erklärungsbedürftige Systeme.",
    use:
      "Ideal, wenn ein Prozess oder eine Entscheidung durch Erkunden verständlicher wird als durch Fließtext.",
    example:
      "Die komplette Nutzerreise eines Immobilienverkaufs als klickbare Prozesslandkarte darstellen.",
    prompt:
      "Visualisiere die Nutzerreise meines KI-Immobiliencoachs als interaktive Prozesskarte. Zeige Phasen, Entscheidungen, benötigte Unterlagen, Risiken, Hilfen und den jeweils nächsten sinnvollen Schritt.",
  },
  {
    id: "google-calendar",
    index: 16,
    name: "Google Calendar",
    mark: "GC",
    type: "App-Anbindung",
    priority: "A",
    category: "sales",
    projects: ["immobilien", "training", "organisation", "privat"],
    summary: "Termine finden, vorbereiten und nach Freigabe im Kalender verwalten.",
    function:
      "Die Kalender-Anbindung kann Termine und Verfügbarkeiten lesen sowie autorisierte Kalendereinträge anlegen oder ändern.",
    use:
      "Nützlich für Live-Coaching, Partnergespräche, Verkaufstrainings und persönliche Wochenplanung.",
    example:
      "Freie Zeitfenster für ein Partnergespräch finden und einen vollständigen Terminentwurf vorbereiten.",
    prompt:
      "Prüfe meinen Kalender für [Zeitraum] und finde drei passende Zeitfenster für [Zweck]. Berücksichtige Pufferzeiten. Lege oder ändere noch keinen Termin, sondern zeige mir zuerst die Vorschläge.",
  },
  {
    id: "gmail",
    index: 17,
    name: "Gmail",
    mark: "GM",
    type: "App-Anbindung",
    priority: "A",
    category: "sales",
    projects: ["immobilien", "training", "content", "organisation"],
    summary: "E-Mails finden, zusammenfassen, entwerfen und nach Freigabe versenden.",
    function:
      "Gmail verbindet die Arbeit mit einem Postfach. Je nach Berechtigung können Nachrichten recherchiert, geordnet, beantwortet oder als Entwurf vorbereitet werden.",
    use:
      "Stark für Partneransprache, Kundenkommunikation, Nachfassprozesse und die Aufbereitung langer Verläufe.",
    example:
      "Aus einem Partnerprofil eine persönliche, kurze Erstansprache als Entwurf erstellen.",
    prompt:
      "Erstelle einen persönlichen E-Mail-Entwurf an [Empfänger] mit dem Ziel [Ziel]. Nutze nur die bereitgestellten Fakten, formuliere konkret und professionell und versende nichts ohne meine ausdrückliche Freigabe.",
  },
  {
    id: "build-ios-apps",
    index: 18,
    name: "Build iOS Apps",
    mark: "iO",
    type: "App-Bau-Skill",
    priority: "B",
    category: "build",
    projects: ["immobilien", "inventar", "privat"],
    summary: "Native iPhone-Apps planen und als lauffähiges Projekt umsetzen.",
    function:
      "Der Skill unterstützt bei Informationsarchitektur, SwiftUI-Oberfläche, Datenmodell, Geräteschnittstellen und Tests einer nativen iOS-App.",
    use:
      "Für den Immobiliencoach sinnvoll, sobald der mobile Web-App-Ablauf validiert und das Datenmodell stabil ist.",
    example:
      "Aus einem getesteten Web-App-MVP eine native iPhone-Begleitung für Aufgaben und Dokumente ableiten.",
    prompt:
      "Plane eine native iOS-App auf Basis meines validierten Web-App-MVP. Definiere Nutzerrollen, Datenmodell, Screens, Navigation, lokale und cloudbasierte Daten, Datenschutz, MVP-Grenzen und Testplan. Beginne noch nicht mit der Umsetzung.",
  },
  {
    id: "build-macos-apps",
    index: 19,
    name: "Build macOS Apps",
    mark: "MA",
    type: "App-Bau-Skill",
    priority: "C",
    category: "build",
    projects: ["organisation", "inventar", "immobilien"],
    summary: "Native Mac-Anwendungen für fokussierte Desktop-Arbeitsabläufe entwickeln.",
    function:
      "Der Skill strukturiert und baut macOS-Anwendungen, die Desktop-Funktionen, lokale Dateien oder eine Mac-spezifische Bedienung benötigen.",
    use:
      "Später interessant für interne Verwaltung, Inventar oder einen spezialisierten Arbeitsplatz für dein Produkt.",
    example:
      "Eine lokale Verwaltungs-App für Vorlagen, Objektakten und wiederkehrende Arbeitsabläufe konzipieren.",
    prompt:
      "Konzipiere eine schlanke macOS-App für [Arbeitsablauf]. Beschreibe Zielgruppe, Kernaufgaben, Fensterstruktur, Datenhaltung, Datenschutz und eine bewusst kleine erste Version. Prüfe zuerst, ob eine Web-App ausreichend wäre.",
  },
  {
    id: "build-web-apps",
    index: 20,
    name: "Build Web Apps",
    mark: "WA",
    type: "App-Bau-Skill",
    priority: "A",
    category: "build",
    projects: ["immobilien", "training", "inventar", "organisation"],
    summary: "Funktionierende Web-Anwendungen mit echter Logik und Datenflüssen bauen.",
    function:
      "Build Web Apps geht über einen visuellen Prototyp hinaus und setzt Oberfläche, Interaktionen, Datenmodell, Tests und technische Struktur als laufende Anwendung um.",
    use:
      "Das zentrale Werkzeug für den KI-Immobiliencoach nach Validierung von Nutzerreise und Click-Dummy.",
    example:
      "Ein MVP mit Aufgaben, Fortschritt, Dokumentstatus, Preisstrategie und Nutzerkonto entwickeln.",
    prompt:
      "Baue ein mobiloptimiertes Web-App-MVP für meinen KI-Immobiliencoach. Nutze die freigegebene Nutzerreise und beschränke die erste Version auf die validierten Kernaufgaben. Definiere vorab Datenmodell, Berechtigungen, Testfälle und klare Nicht-Ziele.",
  },
  {
    id: "apple-music",
    index: 21,
    name: "Apple Music",
    mark: "AM",
    type: "App-Anbindung",
    priority: "C",
    category: "utility",
    projects: ["privat", "content", "training"],
    summary: "Musik für Situationen, Stimmungen oder Arbeitsphasen entdecken und ordnen.",
    function:
      "Die Apple-Music-Anbindung unterstützt – abhängig von Verbindung und Berechtigung – bei Suche, Auswahl und Organisation von Musik.",
    use:
      "Ein ergänzendes Werkzeug für Fokus, Veranstaltungen, Trainingspausen oder private Playlists.",
    example:
      "Eine ruhige Fokusauswahl für Konzeptarbeit oder Musik für den Empfang eines Trainings zusammenstellen.",
    prompt:
      "Stelle eine Apple-Music-Auswahl für [Situation] zusammen. Gewünschte Stimmung: [Stimmung]. Dauer: [Dauer]. Vermeide [Ausschlüsse] und erkläre kurz die Dramaturgie der Reihenfolge.",
  },
  {
    id: "biorender",
    index: 22,
    name: "BioRender",
    mark: "BI",
    type: "Spezial-App",
    priority: "C",
    category: "create",
    projects: ["content", "training"],
    summary: "Wissenschaftliche und medizinische Sachverhalte visuell strukturieren.",
    function:
      "BioRender ist auf wissenschaftliche Illustrationen, Prozessgrafiken und fachliche Diagramme ausgerichtet. Die konkrete Nutzung hängt von der eingerichteten Verbindung ab.",
    use:
      "Nur situativ relevant – etwa für fachlich belastbare Erklärgrafiken in Schulung oder Dokumentation.",
    example:
      "Einen komplexen biologischen Ablauf als didaktisch klare, beschriftete Grafik vorbereiten.",
    prompt:
      "Entwirf eine fachlich präzise Erklärgrafik zu [Thema]. Definiere Zielgruppe, Kernaussage, notwendige Elemente, Leserichtung, Beschriftungen und Quellenbedarf. Markiere fachliche Unsicherheiten.",
  },
  {
    id: "booking",
    index: 23,
    name: "Booking.com",
    mark: "BK",
    type: "Reise-App",
    priority: "C",
    category: "travel",
    projects: ["privat", "organisation"],
    summary: "Unterkünfte nach konkreten Reisedaten und Anforderungen vergleichen.",
    function:
      "Die Anbindung hilft bei der Suche und Gegenüberstellung von Unterkünften. Verfügbarkeit, Preise und Buchungsbedingungen sind zeitabhängig und müssen live geprüft werden.",
    use:
      "Praktisch für private Reisen oder die Unterkunftssuche rund um Trainings- und Geschäftstermine.",
    example:
      "Hotels nach Lage, Stornierung, Gesamtpreis und realer Eignung für den Termin vergleichen.",
    prompt:
      "Vergleiche Unterkünfte in [Ort] für [Datum] bis [Datum]. Prioritäten: [Lage], [Budget], [Ausstattung] und flexible Stornierung. Zeige Gesamtpreis und Bedingungen transparent. Buche nichts ohne meine Freigabe.",
  },
  {
    id: "canva",
    index: 24,
    name: "Canva",
    mark: "CA",
    type: "Design-App",
    priority: "A",
    category: "create",
    projects: ["immobilien", "training", "content"],
    summary: "Markenmaterial, Social Assets und Präsentationen im bestehenden Design erstellen.",
    function:
      "Canva kann verbundene Designs lesen, prüfen, übersetzen, bearbeiten oder neue visuelle Formate auf Basis eines Briefings erzeugen.",
    use:
      "Stark für Anzeigen, Partnerunterlagen, Social-Media-Serien, Broschüren und visuelle Trainingsmaterialien.",
    example:
      "Eine konsistente Serie aus LinkedIn-Post, Instagram-Post und Story aus einem Kampagnenbriefing ableiten.",
    prompt:
      "Erstelle ein ruhiges, hochwertiges Canva-Design für [Format]. Nutze Blau, Gold und Weiß, klare Typografie, großzügige Abstände und eine eindeutige Informationshierarchie. Keine generische KI- oder Template-Optik.",
  },
  {
    id: "check24",
    index: 25,
    name: "CHECK24",
    mark: "C24",
    type: "Vergleichs-App",
    priority: "C",
    category: "utility",
    projects: ["privat", "organisation"],
    summary: "Verbraucherangebote anhand klarer Kriterien miteinander vergleichen.",
    function:
      "CHECK24 unterstützt Vergleiche in angebotenen Kategorien. Preise, Bedingungen und Verfügbarkeit müssen zum jeweiligen Zeitpunkt live kontrolliert werden.",
    use:
      "Für private Kauf- und Vertragsentscheidungen hilfreich, wenn Kriterien und Gesamtkosten sauber getrennt werden.",
    example:
      "Angebote nicht nur nach Einstiegspreis, sondern nach Laufzeit, Folgekosten und Bedingungen vergleichen.",
    prompt:
      "Vergleiche Angebote für [Kategorie] anhand von Gesamtpreis, Laufzeit, Leistungen, Ausschlüssen und Kündigungsbedingungen. Zeige Annahmen und Datenstand. Schließe nichts ohne meine ausdrückliche Freigabe ab.",
  },
  {
    id: "clay",
    index: 26,
    name: "Clay",
    mark: "CL",
    type: "Vertriebs-App",
    priority: "A",
    category: "sales",
    projects: ["immobilien", "training", "content"],
    summary: "Passende Firmen und Ansprechpartner strukturiert recherchieren und qualifizieren.",
    function:
      "Clay verbindet Datenquellen und Recherchelogik, um Zielunternehmen zu finden, anzureichern, zu segmentieren und personalisierte Ansprache vorzubereiten.",
    use:
      "Ein großer Hebel für Partnerprogramme, B2B-Verkaufstrainings und systematische Kooperationsansprache.",
    example:
      "Potenzielle Partner nach Zielgruppenpassung, Reichweite, Region und Kooperationssignal priorisieren.",
    prompt:
      "Erstelle eine qualifizierte Zielfirmenliste für [Angebot]. Definiere zuerst klare Ein- und Ausschlusskriterien. Erfasse nur geschäftlich relevante Daten, begründe den Fit und formuliere pro Unternehmen einen individuellen Gesprächsanlass.",
  },
  {
    id: "data-analytics",
    index: 27,
    name: "Data Analytics",
    mark: "DA",
    type: "Analyse-Skill",
    priority: "A",
    category: "analyse",
    projects: ["immobilien", "training", "content", "organisation"],
    summary: "Datenqualität prüfen, Kennzahlen erklären und Entscheidungen fundieren.",
    function:
      "Data Analytics untersucht strukturierte Daten, validiert Berechnungen und erstellt nachvollziehbare Berichte, Visualisierungen oder Dashboards.",
    use:
      "Ideal für Funnel, Marketingwirkung, Umsatztreiber, Kursauslastung und regelmäßige Management-Auswertungen.",
    example:
      "Erkennen, an welcher Stelle Interessenten aus dem Vertriebsprozess fallen und welche Maßnahme am meisten bewirkt.",
    prompt:
      "Analysiere die bereitgestellten Daten. Prüfe zuerst Qualität und Definitionen. Erstelle anschließend eine Management-Zusammenfassung, eine Funnel-Übersicht, geeignete Visualisierungen, fünf konkrete Handlungsempfehlungen sowie eine Liste aller Annahmen und Datenprobleme.",
  },
  {
    id: "default-templates",
    index: 28,
    name: "Default templates",
    mark: "DT",
    type: "Vorlagenbibliothek",
    priority: "B",
    category: "create",
    projects: ["immobilien", "training", "content", "organisation", "privat"],
    summary: "Mit einer bewährten Standardstruktur schneller zu einem ersten Entwurf kommen.",
    function:
      "Default templates bietet vorhandene Ausgangsvorlagen. Sie beschleunigen Standardaufgaben, ersetzen aber keine projektspezifische Anpassung.",
    use:
      "Gut für einen schnellen Start bei Protokollen, Plänen, Übersichten oder wiederkehrenden Dokumenten.",
    example:
      "Eine passende Standardvorlage auswählen und anschließend auf Olafs Begriffe, Qualitätsregeln und Design anpassen.",
    prompt:
      "Wähle für [Ergebnis] die passendste Standardvorlage. Zeige mir kurz, welche Teile übernommen, angepasst oder entfernt werden sollten, damit sie zu meinem Projekt und meinen Qualitätsanforderungen passt.",
  },
  {
    id: "getyourguide",
    index: 29,
    name: "GetYourGuide",
    mark: "GY",
    type: "Reise-App",
    priority: "C",
    category: "travel",
    projects: ["privat", "organisation"],
    summary: "Aktivitäten am Reiseziel nach Zeit, Lage und Interessen vergleichen.",
    function:
      "Die Reise-Anbindung unterstützt bei der Suche nach Touren und Aktivitäten. Verfügbarkeit, Preise und Bedingungen sind live zu prüfen.",
    use:
      "Ergänzend für private Wochenenden oder passende Programmpunkte rund um eine Geschäftsreise.",
    example:
      "Zwei gut gelegene Aktivitäten auswählen, die zeitlich realistisch in einen Wochenendplan passen.",
    prompt:
      "Finde Aktivitäten in [Ort] für [Datum]. Berücksichtige Interessen, verfügbare Zeit, Wege, Gesamtpreis und Stornierungsbedingungen. Erstelle einen realistischen Vorschlag und buche nichts ohne meine Freigabe.",
  },
];

export const workflow = [
  {
    step: "01",
    title: "Ausrichten",
    tools: "Planmodus",
    text: "Ziel, Umfang, Grenzen und messbare Abnahme festlegen.",
  },
  {
    step: "02",
    title: "Verbindlich machen",
    tools: "Ziel verfolgen",
    text: "Aus dem freigegebenen Plan einen überprüfbaren Fertigstellungsauftrag machen.",
  },
  {
    step: "03",
    title: "Bestand klären",
    tools: "Dateien + Documents",
    text: "Vorhandenes Wissen ordnen, Widersprüche lösen und die Arbeitsbasis schaffen.",
  },
  {
    step: "04",
    title: "Zahlen prüfen",
    tools: "Spreadsheets + Data Analytics",
    text: "Annahmen, Wirtschaftlichkeit, Funnel und Entscheidungskennzahlen modellieren.",
  },
  {
    step: "05",
    title: "Produkt validieren",
    tools: "Sites → Build Web Apps",
    text: "Erst Nutzerführung und Click-Dummy prüfen, danach das funktionierende MVP bauen.",
  },
  {
    step: "06",
    title: "Marke formen",
    tools: "Canva + Presentations + PDF",
    text: "Auftritt, Pitch und Kundenmaterialien konsistent ausarbeiten.",
  },
  {
    step: "07",
    title: "Vertrieb aktivieren",
    tools: "Clay + Gmail + Calendar",
    text: "Passende Partner finden, persönlich ansprechen und Gespräche organisieren.",
  },
];

export const masterPrompt =
  "Arbeite im Planmodus. Projekt: Eine KI-gestützte Coaching-Plattform für private Immobilienverkäufer mit dem Leitgedanken „Immobilie selbst verkaufen – aber nicht allein“.\n\nErstelle zunächst ausschließlich einen vollständigen Umsetzungsplan und führe noch nichts aus.\n\nAnalysiere: Zielgruppe, Kernproblem, Leistungsumfang, Nutzerreise, Module, Website, Web-App-MVP, spätere iOS-App, Video- und Coaching-Inhalte, Preisstruktur, Partnerprogramm, Marketing, Finanzplanung, Risiken und Meilensteine.\n\nKennzeichne vorhandene Informationen, fehlende Entscheidungen, Abhängigkeiten und Aufgaben mit höchster Priorität. Definiere für jedes Ergebnis messbare Abnahmekriterien. Warte anschließend auf meine Freigabe.";
