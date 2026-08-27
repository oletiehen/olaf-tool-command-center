import type { Metadata } from "next";
import ChatGptKnowledge from "../../ChatGptKnowledge";

export const metadata: Metadata = {
  title: "ChatGPT · Olaf Tool Command Center",
  description: "ChatGPT-Funktionen, Apps, Workflows und Prompt-Vorlagen in Olafs gemeinsamer KI-Arbeitszentrale.",
};

export default function ChatGptPage() {
  return <ChatGptKnowledge />;
}

