import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { TOKENS } from "./brand";

/**
 * Explicit font loading for every brand font file (called from Root, not a side-effect import).
 * Files come from tokens.json → assets/shared/fonts (public/assets is a symlink to /assets).
 */
export const loadBrandFonts = () => {
  const seen = new Set<string>();
  const jobs: Promise<void>[] = [];
  for (const t of Object.values(TOKENS)) {
    for (const f of t.fonts.files) {
      const key = `${f.family}|${f.weight}|${f.style}`;
      if (seen.has(key)) continue;
      seen.add(key);
      jobs.push(loadFont({ family: f.family, url: staticFile(f.path), weight: String(f.weight), style: f.style, display: "block" }));
    }
  }
  return Promise.all(jobs);
};

let fontsPromise: Promise<unknown> | null = null;
/** Memoized: Root calls it explicitly at startup; FontGuard awaits the same promise. */
export const ensureFonts = () => (fontsPromise ??= loadBrandFonts());
