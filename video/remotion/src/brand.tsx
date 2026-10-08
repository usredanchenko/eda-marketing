import { createContext, useContext } from "react";
import {
  combinedMargins,
  computeSlots,
  FORMATS,
  gradientCss,
  PlatformsConfig,
  scaleType,
  LanguageId,
  Tokens,
  type BrandId,
  type FormatId,
  type Platform,
  type RectPx,
  type SlotId,
  type Tokens as TokensT,
} from "@mos/core";
import platformsJson from "../../../config/platforms.json";
import { BRANDS } from "./generated/brands";

/** Brand tokens are validated at load: a broken tokens.json fails loudly instead of rendering wrong colors. */
export const TOKENS: Record<BrandId, TokensT> = Object.fromEntries(Object.entries(BRANDS).map(([id, b]) => [id, Tokens.parse(b.tokens)]));
const LANGUAGES: Record<BrandId, LanguageId> = Object.fromEntries(Object.entries(BRANDS).map(([id, b]) => [id, LanguageId.parse(b.language)]));
const PLATFORMS = PlatformsConfig.parse(platformsJson);

export interface BrandCtx {
  brand: BrandId;
  language: LanguageId;
  t: TokensT;
  format: FormatId;
  width: number;
  height: number;
  slots: Record<SlotId, RectPx>;
}

export const makeBrandCtx = (brand: BrandId, format: FormatId, platforms: Platform[]): BrandCtx => {
  const t = TOKENS[brand];
  if (!t) throw new Error(`Unknown brand "${brand}": run \`npm run mos -- video register\` after adding brands/${brand}/`);
  return {
  brand,
  language: LANGUAGES[brand],
  t,
  format,
  width: FORMATS[format].width,
  height: FORMATS[format].height,
  slots: computeSlots(format, combinedMargins(PLATFORMS, format, platforms)),
  };
};

const Ctx = createContext<BrandCtx | null>(null);
export const BrandProvider = Ctx.Provider;
export const useBrand = (): BrandCtx => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useBrand outside BrandProvider");
  return v;
};

/** CSS for a named type style from tokens, scaled for the current format. */
export const typeCss = (c: BrandCtx, key: string, overrides: Partial<{ weight: number; sizeMul: number }> = {}): React.CSSProperties => {
  const s = c.t.type[key] ?? c.t.type.body;
  return {
    fontFamily: s.family === "sans" ? `"${c.t.fonts.sans}"` : `"${c.t.fonts.mono}"`,
    fontWeight: overrides.weight ?? s.weight,
    fontSize: Math.round(scaleType(s.size, c.format) * (overrides.sizeMul ?? 1)),
    lineHeight: s.lineHeight,
    letterSpacing: s.letterSpacing,
    textTransform: s.uppercase ? "uppercase" : "none",
  };
};

export const grad = (c: BrandCtx, name: string): string | null => {
  const g = c.t.gradients[name];
  return g ? gradientCss(g) : null;
};

/** Gradient-filled text (only for large accents; small text uses a solid accent color for contrast). */
export const gradientText = (css: string | null): React.CSSProperties =>
  css ? { backgroundImage: css, backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" } : {};

export const col = (c: BrandCtx, name: string, fallback = "#ffffff") => c.t.colors[name] ?? fallback;

/** Role colors from tokens.json → colors (required by the Tokens schema). */
export const accentColor = (c: BrandCtx) => col(c, "accent");
export const bgColor = (c: BrandCtx) => col(c, "bg");
/** Gradient text for accents when the brand opts in (styles.accentText = "gradient" and a textAccent gradient). */
export const accentTextCss = (c: BrandCtx, which: "accentText" | "ctaText" = "accentText"): React.CSSProperties => {
  const g = grad(c, "textAccent");
  return c.t.styles[which] === "gradient" && g ? gradientText(g) : { color: which === "ctaText" ? textColor(c) : accentColor(c) };
};
export const textColor = (c: BrandCtx) => col(c, "text");
