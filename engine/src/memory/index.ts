import path from "node:path";
import { similarity, verdict, type BrandId, type SimilarityVerdict } from "@mos/core";
import { readJsonl, writeText } from "../lib/fsx";
import { ROOT } from "../lib/paths";
import { hasData, listPackageIds, loadPackage, readData } from "../package/load";

export interface MemoryItem {
  id: string;
  brand: BrandId;
  source: "package" | "seed";
  date: string;
  topic: string;
  template: string | null;
  hooks: string[];
  hookTypes: string[];
  cta: string | null;
  status: "planned" | "in-production" | "draft-rendered" | "published" | "edited-not-confirmed-published";
  outcome: string | null;
  notes: string | null;
}

export const MEMORY_INDEX = () => path.join(ROOT, "memory", "index.jsonl");
const SEED = () => path.join(ROOT, "memory", "seed.jsonl");

/** Index = seed (videos made before Marketing OS) + every content package. Regenerated, never hand-edited. */
export const rebuildMemory = async (): Promise<MemoryItem[]> => {
  const items: MemoryItem[] = await readJsonl<MemoryItem>(SEED());
  for (const id of await listPackageIds()) {
    const pkg = await loadPackage(id);
    const m = pkg.manifest;
    const hooks = hasData(pkg, "hooks") ? (await readData(pkg, "hooks")).hooks : [];
    const chosen = hooks.filter((h) => h.selected);
    const script = hasData(pkg, "script") ? await readData(pkg, "script") : null;
    items.push({
      id: m.id,
      brand: m.brand,
      source: "package",
      date: m.created,
      topic: m.topic,
      template: m.template,
      hooks: (chosen.length ? chosen : hooks).map((h) => `${h.voice} / ${h.text}`),
      hookTypes: chosen.map((h) => h.type),
      cta: script?.editorialCta ?? null,
      status: m.published.length ? "published" : ["draft", "final", "qa"].includes(m.stage) ? "draft-rendered" : m.gates.productionApproved.status === "approved" ? "in-production" : "planned",
      outcome: null,
      notes: m.demo ? "Marketing OS demo package" : null,
    });
  }
  await writeText(MEMORY_INDEX(), items.map((i) => JSON.stringify(i)).join("\n") + "\n");
  return items;
};

export interface SimilarHit {
  id: string;
  brand: BrandId;
  topic: string;
  score: number;
  verdict: SimilarityVerdict;
  status: MemoryItem["status"];
}

/** Lexical duplicate check over topics and used hooks. Same brand first; the other brand only as info. */
export const checkSimilar = async (text: string, brand?: BrandId, exclude?: string): Promise<SimilarHit[]> => {
  const items = await readJsonl<MemoryItem>(MEMORY_INDEX());
  return items
    .filter((i) => i.id !== exclude && (!brand || i.brand === brand))
    .map((i) => {
      const score = Math.max(similarity(text, i.topic), ...i.hooks.map((h) => similarity(text, h)), 0);
      return { id: i.id, brand: i.brand, topic: i.topic, score, verdict: verdict(score), status: i.status };
    })
    .filter((h) => h.verdict !== "new")
    .sort((a, b) => b.score - a.score);
};
