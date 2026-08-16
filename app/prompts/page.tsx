import type { Metadata } from "next";
import PromptStudio from "../PromptStudio";
import { tools } from "../tool-data";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Prompt-Studio · Olaf Tool Command Center",
  description: `Master-Prompt und ${tools.length} direkt nutzbare Werkzeugvorlagen auswählen und kopieren.`,
};

export default function PromptsPage() {
  return <PromptStudio />;
}
