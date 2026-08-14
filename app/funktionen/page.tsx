import type { Metadata } from "next";
import { Suspense } from "react";
import ToolLibrary from "../ToolLibrary";

export const metadata: Metadata = {
  title: "Funktionen · Olaf Tool Command Center",
  description: "29 ChatGPT-Funktionen durchsuchen, filtern und direkt anwenden.",
};

export default function FunktionenPage() {
  return (
    <Suspense fallback={<div className="app-route-loading">Werkzeugbibliothek wird geladen …</div>}>
      <ToolLibrary />
    </Suspense>
  );
}
