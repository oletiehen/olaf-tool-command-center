# Olaf Tiehen · Projektzentrale

Zentrale, mobile-first Übersicht aller öffentlichen Webseiten, Apps, GitHub-Projekte und geteilten Links von Olaf Tiehen.

## Design

- tiefes Navy als Grundfläche
- warmes, zurückhaltendes Gold als Akzent
- große abgerundete Premium-Flächen
- typografischer Markenblock **Olaf Tiehen** ohne Zusatz „Immobiliencoaching“
- iPhone-first, vollständig responsiv

## Funktionen

- echter Website-Screenshot pro erreichbarer öffentlicher Webseite
- klar gekennzeichnetes KI-Projektcover für Projekte ohne veröffentlichte Website
- direkter Öffnen-Button
- mehrere Links pro Projekt (z. B. Lovable + GitHub Pages + Repository)
- Suche, Plattform-, Status- und Kategorienfilter
- Plattform-/Quellcode-Stand
- Zeitpunkt einer vom Monitor erkannten Änderung
- Status Live / Repository / Ungeprüft / Link ergänzen

## Automatische Aktualisierung

Der Workflow `.github/workflows/project-hub-monitor.yml` läuft stündlich und kann zusätzlich manuell gestartet werden.

Er prüft:

1. Erreichbarkeit öffentlicher Webseiten
2. Änderungen am ausgelieferten HTML bzw. Deployment-Fingerprint
3. neue Pushes bei reinen GitHub-Projekten
4. Statuswechsel
5. Vorschaubilder beim ersten Lauf und nach echten Änderungen

Kontogeschützte oder sensible Projekte können mit `previewPolicy: no-preview` vollständig von der automatischen Screenshot-Erzeugung ausgeschlossen werden. Vorschaubilder werden ausschließlich als lokale Dateien unter `public/previews` eingebunden; externe Bild-URLs werden in der Oberfläche nicht übernommen.

Nur wenn sich tatsächlich etwas ändert, werden `sites.json` bzw. Vorschaubilder committed. Dadurch löst Render nicht bei jedem Scan einen unnötigen Deploy aus.

## Render

`render.yaml` im Repository-Root definiert eine eigenständige Static Site mit `link-hub` als Root Directory und `public` als Publish-Verzeichnis. Auto-Deploy ist auf Commits aktiviert.

Nach dem einmaligen Verbinden des Repositories als Render Blueprint übernimmt Render zukünftige Deployments automatisch.

## Datenquelle

`public/data/sites.json`

Nicht verifizierte URLs werden nicht erfunden. Sie bleiben mit dem Status `needs-link` bzw. `unknown` sichtbar, bis eine belastbare öffentliche Adresse vorliegt.
