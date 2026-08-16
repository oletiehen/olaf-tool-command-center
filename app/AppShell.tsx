"use client";

import { FormEvent, ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import AppLink from "./AppLink";
import { appHref } from "./app-routes";
import { coreTools, screenshotTools, tools } from "./tool-data";

const isPublicBuild = Boolean(process.env.NEXT_PUBLIC_PUBLICATION_URL);

const navigation = [
  { href: "/", label: "Dashboard", icon: "⌂" },
  { href: "/funktionen", label: "Funktionen", icon: "▦" },
  { href: "/workflow", label: "Workflow", icon: "→" },
  { href: "/prompts", label: "Prompt-Studio", icon: "✦" },
] as const;

const functionNavigation = [
  { href: "/funktionen", label: "Übersicht" },
  { href: "/funktionen/alle", label: "Alle Werkzeuge" },
  { href: "/funktionen/kern", label: `Kern · ${coreTools.length}` },
  { href: "/funktionen/erweiterungen", label: `Erweiterungen · ${screenshotTools.length}` },
  { href: "/funktionen/kategorien", label: "Kategorien" },
] as const;

const pageDetails: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Dashboard",
    description: "Dein persönlicher Ausgangspunkt",
  },
  "/funktionen": {
    title: "Funktionen",
    description: "Werkzeuge über klare Bereiche auswählen",
  },
  "/funktionen/alle": {
    title: "Alle Werkzeuge",
    description: `${tools.length} Funktionen durchsuchen und filtern`,
  },
  "/funktionen/kern": {
    title: "Kernwerkzeuge",
    description: `${coreTools.length} persönlich eingeordnete Funktionen`,
  },
  "/funktionen/erweiterungen": {
    title: "Erweiterungen",
    description: `${screenshotTools.length} Funktionen aus deinen Screenshots`,
  },
  "/funktionen/kategorien": {
    title: "Kategorien",
    description: "Werkzeuge nach Aufgabe auswählen",
  },
  "/workflow": {
    title: "Workflow",
    description: "Vom Plan zum funktionierenden System",
  },
  "/prompts": {
    title: "Prompt-Studio",
    description: "Vorlagen auswählen und direkt kopieren",
  },
};

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const routePath = pathname === "/" ? pathname : pathname.replace(/\/+$/, "");
  const [quickSearch, setQuickSearch] = useState("");
  const details = pageDetails[routePath]
    ?? (routePath.startsWith("/funktionen") ? pageDetails["/funktionen"] : pageDetails["/"]);
  const showFunctionNavigation = routePath.startsWith("/funktionen");

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = quickSearch.trim();
    window.location.assign(appHref(query ? "/funktionen/alle?q=" + encodeURIComponent(query) : "/funktionen/alle"));
    setQuickSearch("");
  }

  return (
    <div className="app-frame">
      <aside className="app-sidebar">
        <AppLink className="app-brand" href="/" aria-label="Tool Command Center – Dashboard">
          <span className="app-brand-mark" aria-hidden="true">OT</span>
          <span>
            <strong>Tool Command Center</strong>
            <small>Olafs App-Navigator</small>
          </span>
        </AppLink>

        <div className="sidebar-section-label">Navigation</div>
        <nav className="sidebar-navigation" aria-label="App-Navigation">
          {navigation.map((item) => (
            <div className="sidebar-nav-group" key={item.href}>
              <AppLink
                className={isActive(routePath, item.href) ? "sidebar-link active" : "sidebar-link"}
                href={item.href}
                aria-current={isActive(routePath, item.href) ? "page" : undefined}
              >
                <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
                <span className="sidebar-arrow" aria-hidden="true">›</span>
              </AppLink>
              {item.href === "/funktionen" && showFunctionNavigation ? (
                <div className="sidebar-subnavigation" aria-label="Untermenü Funktionen">
                  {functionNavigation.map((subitem) => (
                    <AppLink
                      className={routePath === subitem.href ? "active" : ""}
                      href={subitem.href}
                      key={subitem.href}
                      aria-current={routePath === subitem.href ? "page" : undefined}
                    >
                      {subitem.label}
                    </AppLink>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="sidebar-focus-card">
          <span className="sidebar-focus-kicker">Empfohlener Start</span>
          <strong>Planmodus</strong>
          <p>Erst vollständig ordnen, dann gezielt ausführen.</p>
          <AppLink href="/funktionen/alle?q=Planmodus">Funktion öffnen <span aria-hidden="true">↗</span></AppLink>
        </div>

        <div className="sidebar-status">
          <span className="draft-dot" aria-hidden="true" />
          <span>
            <strong>{isPublicBuild ? "Auf GitHub veröffentlicht" : "Lokale Vorschau"}</strong>
            <small>{coreTools.length} Kern + {screenshotTools.length} Erweiterungen</small>
          </span>
        </div>
      </aside>

      <div className="app-stage">
        <header className="app-header">
          <div className="mobile-brand-mark" aria-hidden="true">OT</div>
          <div className="app-page-title">
            <h1>{details.title}</h1>
            <p>{details.description}</p>
          </div>
          <form className="global-search" role="search" onSubmit={submitSearch}>
            <label className="sr-only" htmlFor="global-tool-search">Alle Funktionen durchsuchen</label>
            <span aria-hidden="true">⌕</span>
            <input
              id="global-tool-search"
              type="search"
              value={quickSearch}
              onChange={(event) => setQuickSearch(event.target.value)}
              placeholder="Funktion suchen …"
            />
            <button type="submit">Suchen</button>
          </form>
          <div className="header-status" aria-label={isPublicBuild ? "Status: öffentlich auf GitHub Pages" : "Status: lokale Vorschau"}>
            <span className="draft-dot" aria-hidden="true" />
            {isPublicBuild ? "GitHub Pages" : "Vorschau"}
          </div>
        </header>

        {showFunctionNavigation ? (
          <nav className="app-section-nav" aria-label="Untermenü Funktionen">
            {functionNavigation.map((item) => (
              <AppLink
                className={routePath === item.href ? "active" : ""}
                href={item.href}
                key={item.href}
                aria-current={routePath === item.href ? "page" : undefined}
              >
                {item.label}
              </AppLink>
            ))}
          </nav>
        ) : null}

        <main className="app-main">{children}</main>
      </div>

      <nav className="app-mobile-nav" aria-label="Mobile App-Navigation">
        {navigation.map((item) => (
          <AppLink
            className={isActive(routePath, item.href) ? "active" : ""}
            href={item.href}
            key={item.href}
            aria-current={isActive(routePath, item.href) ? "page" : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label === "Prompt-Studio" ? "Prompts" : item.label}
          </AppLink>
        ))}
      </nav>
    </div>
  );
}
