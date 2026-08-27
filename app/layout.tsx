import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppShell from "./AppShell";
import { coreTools, screenshotTools, tools } from "./tool-data";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const publicUrl = process.env.NEXT_PUBLIC_PUBLICATION_URL ?? new URL(`${basePath || "/"}`, siteOrigin).toString();
const imageUrl = new URL(`${basePath}/og-v2.png`, siteOrigin).toString();
const title = "Olaf · Tool Command Center";
const description =
  `Olafs App-Navigator mit ${coreTools.length} Kernfunktionen, ${screenshotTools.length} Screenshot-Erweiterungen, ` +
  "Niklas-Volland-Wissensbasis, Codex-Praxisnavigator, Prompt-Vorlagen und dem empfohlenen Workflow.";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title,
  description,
  alternates: { canonical: publicUrl },
  openGraph: {
    title,
    description,
    type: "website",
    url: publicUrl,
    images: [{ url: imageUrl, width: 1730, height: 909, alt: `Olaf · Tool Command Center · ${tools.length} Funktionen` }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [imageUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
