import type { Metadata } from "next";
import CategoryHub from "../../CategoryHub";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Kategorien · Olaf Tool Command Center",
  description: "Werkzeuge nach Aufgabenbereich auswählen.",
};

export default function KategorienPage() {
  return <CategoryHub />;
}
