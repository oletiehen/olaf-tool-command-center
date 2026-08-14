import type { Metadata } from "next";
import PromptStudio from "../PromptStudio";

export const metadata: Metadata = {
  title: "Prompt-Studio · Olaf Tool Command Center",
  description: "Master-Prompt und 29 direkt nutzbare Werkzeugvorlagen auswählen und kopieren.",
};

export default function PromptsPage() {
  return <PromptStudio />;
}
