# Olaf · Tool Command Center

Interaktive, mobiloptimierte Web-App für Olafs persönliche Werkzeugbibliothek.
Sie verbindet die bestehenden 29 Kernfunktionen mit 206 deduplizierten
Screenshot-Erweiterungen. Enthalten sind Projekt-, Kategorie-, Prioritäts- und
Quellenfilter, Suche, Detailansichten, kopierbare Prompt-Vorlagen sowie der
empfohlene siebenstufige Workflow.

Öffentliche App: [oletiehen.github.io/olaf-tool-command-center](https://oletiehen.github.io/olaf-tool-command-center/)

Die Screenshot-Erweiterungen sind Referenzeinträge. Sie dokumentieren die in
den bereitgestellten Aufnahmen sichtbaren Namen und Kurzbeschreibungen, bedeuten
aber nicht automatisch, dass eine Funktion installiert oder verbunden ist.

## Lokale Vorschau

```bash
npm install
npm run dev
```

## Qualitätsprüfung

```bash
npm run build
npm run lint
npm test
```

## GitHub Pages

Der Workflow `.github/workflows/pages.yml` baut bei Änderungen auf `main` eine
statische Ausgabe mit dem Repository-Basispfad und veröffentlicht exakt diesen
Build aus `dist/client` über GitHub Pages. Ein kleiner, versionsgebundener
Build-Patch korrigiert dabei die Unterpfad-Behandlung des aktuellen
vinext-Exports; bei einem vinext-Update bricht er bewusst ab, bis der Export
erneut geprüft wurde.

Für einen lokalen Test der statischen Ausgabe:

```bash
GITHUB_PAGES=true \
NEXT_PUBLIC_BASE_PATH=/olaf-tool-command-center \
NEXT_PUBLIC_SITE_URL=https://oletiehen.github.io \
NEXT_PUBLIC_PUBLICATION_URL=https://oletiehen.github.io/olaf-tool-command-center/ \
npm run build:pages
```
