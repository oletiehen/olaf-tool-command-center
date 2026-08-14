import type { Metadata } from "next";
import WorkflowBoard from "../WorkflowBoard";

export const metadata: Metadata = {
  title: "Workflow · Olaf Tool Command Center",
  description: "Der empfohlene siebenstufige Workflow für Olafs Projekte.",
};

export default function WorkflowPage() {
  return <WorkflowBoard />;
}
