import type { Metadata } from "next";
import FunctionHub from "../FunctionHub";
import { coreTools, screenshotTools, tools } from "../tool-data";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Funktionen · Olaf Tool Command Center",
  description: `${tools.length} Funktionen durchsuchen: ${coreTools.length} persönliche Kernfunktionen und ${screenshotTools.length} Screenshot-Erweiterungen.`,
};

export default function FunktionenPage() {
  return <FunctionHub />;
}
