import codexNavigatorJson from "./knowledge/codex-navigator.json";
import migrationManifestJson from "./knowledge/migration-manifest.json";
import niklasInsightsJson from "./knowledge/niklas-insights.json";

export type KnowledgePrompt = {
  title: string;
  text: string;
};

export type KnowledgeLink = {
  label: string;
  url: string;
};

export type NiklasInsight = {
  id: string;
  date: string;
  title: string;
  source: string;
  category: string;
  priority: string;
  status: string;
  what: string;
  tips: string[];
  benefit: string;
  projects: string[];
  legacyIdeas?: string[];
  opportunities: string[];
  steps: string[];
  prompts: KnowledgePrompt[];
  links: KnowledgeLink[];
  evidenceNote: string;
  keyword: string;
  origin: "legacy-nutzen-dashboard" | "daily-report";
};

export type CodexCapability = {
  number: number;
  id: string;
  title: string;
  icon: string;
  status: string;
  summary: string;
  actions: string[];
  boundary: string;
  categoryId: string;
  categoryLabel: string;
};

export type CodexPracticeExample = {
  id: string;
  area: string;
  depth: string;
  capabilityId: string;
  title: string;
  example: string;
  outcome: string;
  does: string;
  needs: string;
  guardrail: string;
  prompt: string;
};

type CodexNavigator = {
  categories: Array<{
    id: string;
    label: string;
    items: Omit<CodexCapability, "categoryId" | "categoryLabel">[];
  }>;
  practiceExamples: CodexPracticeExample[];
};

export type KnowledgeMigrationManifest = {
  generatedAt: string;
  legacyNiklasCount: number;
  reportFileCount: number;
  reportContributionCount: number;
  mergedNiklasCount: number;
  codexCapabilityCount: number;
  codexExampleCount: number;
};

const codexNavigator = codexNavigatorJson as CodexNavigator;

export const niklasInsights = niklasInsightsJson as NiklasInsight[];
export const knowledgeManifest = migrationManifestJson as KnowledgeMigrationManifest;
export const codexPracticeExamples = codexNavigator.practiceExamples;
export const codexCategories = codexNavigator.categories.map(({ id, label }) => ({ id, label }));
export const codexCapabilities: CodexCapability[] = codexNavigator.categories.flatMap((category) =>
  category.items.map((item) => ({
    ...item,
    categoryId: category.id,
    categoryLabel: category.label,
  })),
);
