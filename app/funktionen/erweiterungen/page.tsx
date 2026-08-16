import type { Metadata } from "next";
import { Suspense } from "react";
import ToolLibrary from "../../ToolLibrary";
import { screenshotTools } from "../../tool-data";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Erweiterungen · Olaf Tool Command Center",
  description: `${screenshotTools.length} deduplizierte Funktionen aus Olafs Screenshots.`,
};

export default function ErweiterungenPage() {
  return (
    <Suspense fallback={<div className="app-route-loading">Erweiterungen werden geladen …</div>}>
      <ToolLibrary mode="screenshots" />
    </Suspense>
  );
}
