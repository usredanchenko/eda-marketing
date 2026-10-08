import path from "node:path";
import * as fontkit from "fontkit";
import type { Tokens, TypeStyle } from "@mos/core";
import { ROOT } from "../lib/paths";

type FontLike = { unitsPerEm: number; layout: (s: string) => { advanceWidth: number } };
const cache = new Map<string, FontLike>();

const openFont = (rel: string): FontLike => {
  const hit = cache.get(rel);
  if (hit) return hit;
  const f = fontkit.openSync(path.join(ROOT, rel)) as unknown as FontLike;
  cache.set(rel, f);
  return f;
};

/** Picks the brand font file for a family/weight (nearest weight). */
export const fontFileFor = (t: Tokens, family: "sans" | "mono", weight: number): string => {
  const name = family === "sans" ? t.fonts.sans : t.fonts.mono;
  const files = t.fonts.files.filter((f) => f.family === name);
  if (!files.length) throw new Error(`no font files for ${name}`);
  return files.reduce((a, b) => (Math.abs(b.weight - weight) < Math.abs(a.weight - weight) ? b : a)).path;
};

/** Width in px of text set in a brand type style — the same TTF Remotion renders with. */
export const measurer = (t: Tokens, style: Pick<TypeStyle, "family" | "weight" | "size" | "letterSpacing">) => {
  const font = openFont(fontFileFor(t, style.family, style.weight));
  return (text: string): number => {
    const run = font.layout(text);
    return (run.advanceWidth / font.unitsPerEm) * style.size + style.letterSpacing * Math.max(0, text.length - 1);
  };
};
