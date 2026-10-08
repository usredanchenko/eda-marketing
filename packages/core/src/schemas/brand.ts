import { z } from "zod";
import { LanguageId } from "../lang/types";
import { TemplateId } from "../templates";
import {
  BrandId,
  CaptionMode,
  FactStatus,
  FormatId,
  HexColor,
  IsoDate,
  Mode,
  Platform,
} from "./common";

export const IdeaWeights = z.strictObject({
  relevance: z.number().min(0),
  novelty: z.number().min(0),
  audienceFit: z.number().min(0),
  visualPotential: z.number().min(0),
  emotionalPotential: z.number().min(0),
  storytellingPotential: z.number().min(0),
  productionComplexity: z.number().min(0),
  authenticity: z.number().min(0),
  productRelevance: z.number().min(0),
});
export type IdeaWeights = z.infer<typeof IdeaWeights>;

/** brands/<id>/brand.json — machine-readable brand profile and defaults for briefs. */
export const BrandConfig = z.strictObject({
  id: BrandId,
  /** Language of on-screen text and speech: selects the caption/typography/syllable pack and banned phrases. */
  language: LanguageId,
  names: z.strictObject({
    working: z.string(),
    public: z.string().nullable(),
    publicNameStatus: z.enum(["confirmed", "undecided", "needs_confirmation"]),
    spellings: z.array(z.string()),
  }),
  author: z.strictObject({ name: z.string(), role: z.string() }),
  defaults: z.strictObject({
    mode: Mode,
    template: TemplateId,
    formats: z.array(FormatId).min(1),
    platforms: z.array(Platform).min(1),
    durationSec: z.tuple([z.number().positive(), z.number().positive()]),
    captionMode: CaptionMode,
    fps: z.number().int().positive(),
  }),
  speech: z.strictObject({
    syllablesPerSec: z.number().min(2).max(9),
    calibrated: z.boolean(),
    note: z.string(),
  }),
  captions: z.strictObject({ protectedPhrases: z.array(z.string()) }),
  claims: z.strictObject({
    forbiddenPatterns: z.array(z.string()),
    needsConfirmationPatterns: z.array(z.string()),
  }),
  cta: z.strictObject({ editorial: z.array(z.string()), spoken: z.array(z.string()) }),
  hashtags: z.strictObject({ core: z.array(z.string()), max: z.number().int().min(0).max(5) }),
  ideaWeights: IdeaWeights,
  research: z.strictObject({
    themes: z.array(z.string()),
    queries: z.array(z.string()),
    communities: z.array(z.string()),
  }),
});
export type BrandConfig = z.infer<typeof BrandConfig>;

/** brands/<id>/facts.yaml — every product claim must resolve to one of these. */
export const Fact = z.strictObject({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  statement: z.string().min(3),
  status: FactStatus,
  source: z.string().min(3),
  publicWording: z.string().optional(),
  note: z.string().optional(),
  checked: IsoDate,
});
export type Fact = z.infer<typeof Fact>;

export const FactsFile = z.strictObject({
  brand: BrandId,
  updated: IsoDate,
  facts: z.array(Fact),
});
export type FactsFile = z.infer<typeof FactsFile>;

const TypeStyle = z.strictObject({
  family: z.enum(["sans", "mono"]),
  weight: z.number().int(),
  size: z.number().positive(),
  lineHeight: z.number().positive(),
  letterSpacing: z.number(),
  uppercase: z.boolean(),
});
export type TypeStyle = z.infer<typeof TypeStyle>;

const Gradient = z.strictObject({
  kind: z.enum(["linear", "radial"]),
  angle: z.number(),
  stops: z.array(z.tuple([HexColor, z.number().min(0).max(100)])).min(2),
});
export type Gradient = z.infer<typeof Gradient>;

const CaptionStyle = z.strictObject({
  color: HexColor,
  accentColor: HexColor,
  accentGradient: z.string().nullable(),
  activeColor: HexColor,
  weight: z.number().int(),
  accentWeight: z.number().int(),
  size: z.number().positive(),
  align: z.enum(["left", "center"]),
  stepIndent: z.number().min(0),
  shadow: z.string(),
});
export type CaptionStyle = z.infer<typeof CaptionStyle>;

/** brands/<id>/tokens.json — single source for Remotion (TS import) and HyperFrames (generated tokens.css). */
export const Tokens = z.strictObject({
  brand: BrandId,
  source: z.string(),
  /** Repo-relative logo file, or null when the brand has no public logo yet. */
  logo: z.string().nullable(),
  /** Role colors every component relies on, plus any extra named brand colors. */
  colors: z
    .object({
      bg: HexColor,
      surface: HexColor,
      line: HexColor,
      text: HexColor,
      muted: HexColor,
      accent: HexColor,
      cardBg: HexColor,
      cardInk: HexColor,
      bubbleThem: HexColor,
      statusNeutral: HexColor,
      statusInfo: HexColor,
      statusWarn: HexColor,
      statusDone: HexColor,
    })
    .catchall(HexColor),
  /** Gradients by name; `night` is the default background. `textAccent` / `bubble` are optional. */
  gradients: z.record(z.string(), Gradient).refine((g) => "night" in g, "gradients.night is required (background)"),
  /** How accents, CTA text and comment cards are drawn. */
  styles: z.strictObject({
    accentText: z.enum(["solid", "gradient"]),
    ctaText: z.enum(["solid", "gradient"]),
    commentCard: z.enum(["paper", "panel"]),
  }),
  fonts: z.strictObject({
    sans: z.string(),
    mono: z.string(),
    files: z.array(
      z.strictObject({
        family: z.string(),
        weight: z.number().int(),
        style: z.enum(["normal", "italic"]),
        path: z.string(),
        license: z.string(),
      }),
    ),
  }),
  type: z.record(z.string(), TypeStyle),
  radii: z.record(z.string(), z.number().min(0)),
  motion: z.strictObject({
    easeOut: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    easeInOut: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    enterFrames: z.number().int().positive(),
    gsap: z.record(z.string(), z.string()),
  }),
  captionStyles: z.strictObject({
    replace: CaptionStyle,
    accumulate: CaptionStyle,
    highlight: CaptionStyle,
  }),
  rules: z.array(z.string()),
});
export type Tokens = z.infer<typeof Tokens>;

export const gradientCss = (g: Gradient): string => {
  const stops = g.stops.map(([c, p]) => `${c} ${p}%`).join(", ");
  return g.kind === "radial"
    ? `radial-gradient(circle at 50% 40%, ${stops})`
    : `linear-gradient(${g.angle}deg, ${stops})`;
};
