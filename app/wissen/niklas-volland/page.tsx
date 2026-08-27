import type { Metadata } from "next";
import NiklasKnowledgeLibrary from "../../NiklasKnowledgeLibrary";

export const metadata: Metadata = {
  title: "Niklas Volland · Olaf Tool Command Center",
  description: "Kumulierte Niklas-Volland-Tipps mit Olaf-Nutzen, Projektbezug, Quellen und direkt nutzbaren Prompts.",
};

export default function NiklasVollandPage() {
  return <NiklasKnowledgeLibrary />;
}

