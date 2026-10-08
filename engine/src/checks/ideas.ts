import { IDEA_CRITERIA, type IdeasFile, type IdeaWeights } from "@mos/core";
import { checkSimilar } from "../memory/index";
import type { BrandId } from "@mos/core";

/** Weighted 0–100 score. productionComplexity is inverted: easier to produce = better. */
export const scoreIdea = (scores: Record<string, number>, w: IdeaWeights): number => {
  let sum = 0;
  let max = 0;
  for (const c of IDEA_CRITERIA) {
    const s = c === "productionComplexity" ? 6 - scores[c] : scores[c];
    sum += s * w[c];
    max += 5 * w[c];
  }
  return Math.round((sum / max) * 1000) / 10;
};

/** Scores all ideas, marks duplicates against content memory, returns the file sorted with totals. */
export const scoreIdeas = async (f: IdeasFile, w: IdeaWeights, brand: BrandId, pkgId: string) => {
  const ideas = [];
  const warnings: string[] = [];
  for (const idea of f.ideas) {
    const hits = await checkSimilar(`${idea.title}. ${idea.logline}`, brand, pkgId);
    const dup = hits.find((h) => h.verdict === "duplicate");
    if (dup) warnings.push(`${idea.id} is similar to “${dup.topic}” (${dup.id}, ${dup.score}) — find a new angle`);
    else if (hits[0]) warnings.push(`${idea.id} is close to “${hits[0].topic}” (${hits[0].score}) — explain the difference`);
    ideas.push({ ...idea, total: scoreIdea(idea.scores, w), duplicateOf: dup?.id ?? null });
  }
  const ranked = [...ideas].sort((a, b) => b.total - a.total);
  const topIds = f.top.map((t) => t.ideaId);
  const best3 = ranked.slice(0, 3).map((i) => i.id);
  if (topIds.length && !topIds.every((id) => best3.includes(id)))
    warnings.push(`the selected top (${topIds.join(", ")}) differs from the top by score (${best3.join(", ")}) — give the reasons in "why"`);
  return { file: { ...f, ideas }, warnings };
};
