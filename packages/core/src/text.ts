/** Slugs, lexical similarity for content memory, phrase lint. Pure functions, no paid embeddings. */

import { langPack, packForWord, type LanguageId } from "./lang";
import { RU_TRANSLIT as TRANSLIT } from "./lang/ru";

export const slugify = (text: string, max = 48): string => {
  const latin = text
    .toLowerCase()
    .split("")
    .map((c) => TRANSLIT[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const cut = latin.slice(0, max).replace(/-[^-]*$/, (m) => (latin.length > max ? "" : m));
  return cut.replace(/-+$/g, "") || "video";
};

/** Tokens for similarity: lowercase, no stopwords, stemmed by each word's own language. */
export const normalizeTokens = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/\u0451/g, "\u0435")
    .replace(/[’']/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !packForWord(w).stopwords.has(w))
    .map((w) => packForWord(w).stem(w));

const trigrams = (s: string): Map<string, number> => {
  const m = new Map<string, number>();
  const t = ` ${s} `;
  for (let i = 0; i < t.length - 2; i++) {
    const g = t.slice(i, i + 3);
    m.set(g, (m.get(g) ?? 0) + 1);
  }
  return m;
};

const cosine = (a: Map<string, number>, b: Map<string, number>): number => {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const [k, v] of a) {
    na += v * v;
    dot += v * (b.get(k) ?? 0);
  }
  for (const v of b.values()) nb += v * v;
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
};

/** 0..1 similarity of two topics/hooks: stem Jaccard blended with character-trigram cosine. */
export const similarity = (a: string, b: string): number => {
  const ta = normalizeTokens(a);
  const tb = normalizeTokens(b);
  const sa = new Set(ta);
  const sb = new Set(tb);
  const inter = [...sa].filter((x) => sb.has(x)).length;
  const union = new Set([...sa, ...sb]).size;
  const jac = union ? inter / union : 0;
  const tri = cosine(trigrams(ta.join(" ")), trigrams(tb.join(" ")));
  return Math.round((0.5 * jac + 0.5 * tri) * 1000) / 1000;
};

export type SimilarityVerdict = "duplicate" | "similar" | "new";
export const verdict = (score: number): SimilarityVerdict =>
  score >= 0.6 ? "duplicate" : score >= 0.35 ? "similar" : "new";

export interface LintHit {
  rule: string;
  match: string;
  severity: "error" | "warn";
}

/** Patterns are case-insensitive regex sources. */
export const lintText = (
  text: string,
  rules: { id: string; pattern: string; severity: "error" | "warn" }[],
): LintHit[] => {
  const hits: LintHit[] = [];
  for (const r of rules) {
    const re = new RegExp(r.pattern, "giu");
    for (const m of text.matchAll(re)) hits.push({ rule: r.id, match: m[0], severity: r.severity });
  }
  return hits;
};

/**
 * Typography for big text: short words glue to the next word and dashes to the previous one with
 * non-breaking spaces, and the last two words stay together, so wrapping never leaves "the", "not"
 * or a single dangling word at a line end.
 */
export const typograph = (text: string, lang: LanguageId = "en"): string => {
  const { glue } = langPack(lang);
  const glued = text
    .replace(glue, (_m, pre: string, word: string) => `${pre}${word}\u00a0`)
    .replace(glue, (_m, pre: string, word: string) => `${pre}${word}\u00a0`)
    .replace(/\s+([—–])/g, "\u00a0$1");
  return glued.replace(/ (\S{1,12})$/, "\u00a0$1");
};
