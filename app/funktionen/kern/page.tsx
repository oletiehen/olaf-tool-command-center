import type { Metadata } from "next";
import { Suspense } from "react";
import ToolLibrary from "../../ToolLibrary";
import { coreTools } from "../../tool-data";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Kernwerkzeuge · Olaf Tool Command Center",
  description: `${coreTools.length} persönlich eingeordnete Kernwerkzeuge.`,
};

export default function KernwerkzeugePage() {
  return (
    <Suspense fallback={<div className="app-route-loading">Kernwerkzeuge werden geladen …</div>}>
      <ToolLibrary mode="core" />
    </Suspense>
  );
}
