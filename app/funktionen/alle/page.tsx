import type { Metadata } from "next";
import { Suspense } from "react";
import ToolLibrary from "../../ToolLibrary";
import { tools } from "../../tool-data";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Alle Werkzeuge · Olaf Tool Command Center",
  description: `${tools.length} Funktionen gezielt durchsuchen und filtern.`,
};

export default function AlleWerkzeugePage() {
  return (
    <Suspense fallback={<div className="app-route-loading">Werkzeugbibliothek wird geladen …</div>}>
      <ToolLibrary mode="all" />
    </Suspense>
  );
}
