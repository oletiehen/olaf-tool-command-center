import type { Metadata } from "next";
import CodexKnowledgeLibrary from "../../CodexKnowledgeLibrary";

export const metadata: Metadata = {
  title: "Codex · Olaf Tool Command Center",
  description: "Codex-Fähigkeiten, Grenzen und fertige Praxisaufträge in Olafs gemeinsamer KI-Arbeitszentrale.",
};

export default function CodexPage() {
  return <CodexKnowledgeLibrary />;
}
