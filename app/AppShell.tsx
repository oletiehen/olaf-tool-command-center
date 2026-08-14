"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const navigation = [
  { href: "/", label: "Dashboard", icon: "⌂" },
  { href: "/funktionen", label: "Funktionen", icon: "▦" },
  { href: "/workflow", label: "Workflow", icon: "→" },
  { href: "/prompts", label: "Prompt-Studio", icon: "✦" },
] as const;

const pageDetails: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Dashboard",
    description: "Dein persönlicher Ausgangspunkt",
  },
  "/funktionen": {
    title: "Funktionen",
    description: "29 Werkzeuge finden und anwenden",
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
  const router = useRouter();
  const [quickSearch, setQuickSearch] = useState("");
  const details = pageDetails[pathname] ?? pageDetails["/"];

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = quickSearch.trim();
    router.push(query ? "/funktionen?q=" + encodeURIComponent(query) : "/funktionen");
    setQuickSearch("");
  }

  return (
    <div className="app-frame">
      <aside className="app-sidebar">
        <Link className="app-brand" href="/" aria-label="Tool Command Center – Dashboard">
          <span className="app-brand-mark" aria-hidden="true">OT</span>
          <span>
            <strong>Tool Command Center</strong>
            <small>Olafs App-Navigator</small>
          </span>
        </Link>

        <div className="sidebar-section-label">Navigation</div>
        <nav className="sidebar-navigation" aria-label="App-Navigation">
          {navigation.map((item) => (
            <Link
              className={isActive(pathname, item.href) ? "sidebar-link active" : "sidebar-link"}
              href={item.href}
              key={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
            >
              <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
              <span className="sidebar-arrow" aria-hidden="true">›</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-focus-card">
          <span className="sidebar-focus-kicker">Empfohlener Start</span>
          <strong>Planmodus</strong>
          <p>Erst vollständig ordnen, dann gezielt ausführen.</p>
          <Link href="/funktionen?q=Planmodus">Funktion öffnen <span aria-hidden="true">↗</span></Link>
        </div>

        <div className="sidebar-status">
          <span className="draft-dot" aria-hidden="true" />
          <span>
            <strong>Unveröffentlichter Entwurf</strong>
            <small>Nur als Vorschau gespeichert</small>
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
          <div className="header-status" aria-label="Status: Vorschau">
            <span className="draft-dot" aria-hidden="true" />
            Vorschau
          </div>
        </header>

        <main className="app-main">{children}</main>
      </div>

      <nav className="app-mobile-nav" aria-label="Mobile App-Navigation">
        {navigation.map((item) => (
          <Link
            className={isActive(pathname, item.href) ? "active" : ""}
            href={item.href}
            key={item.href}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label === "Prompt-Studio" ? "Prompts" : item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
