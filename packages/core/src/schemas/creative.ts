import { z } from "zod";
import { LanguageId } from "../lang/types";
import { TemplateId } from "../templates";
import { FactStatus, HookType, Platform, ShotClass, TimingSource } from "./common";

const Score = z.number().int().min(1).max(5);

export const IDEA_CRITERIA = [
  "relevance",
  "novelty",
  "audienceFit",
  "visualPotential",
  "emotionalPotential",
  "storytellingPotential",
  "productionComplexity",
  "authenticity",
  "productRelevance",
] as const;
export type IdeaCriterion = (typeof IDEA_CRITERIA)[number];

export const Idea = z.strictObject({
  id: z.string().regex(/^i\d{2}$/),
  title: z.string().min(3),
  logline: z.string().min(10),
  template: TemplateId,
  angle: z.string(),
  scores: z.strictObject({
    relevance: Score,
    novelty: Score,
    audienceFit: Score,
    visualPotential: Score,
    emotionalPotential: Score,
    storytellingPotential: Score,
    /** 5 = very hard to produce. Inverted when totalled. */
    productionComplexity: Score,
    authenticity: Score,
    productRelevance: Score,
  }),
  rationale: z.string().min(10),
  total: z.number().optional(),
  duplicateOf: z.string().nullable().optional(),
});
export type Idea = z.infer<typeof Idea>;

export const IdeasFile = z.strictObject({
  topic: z.string(),
  ideas: z.array(Idea).min(10, "idea engine requires at least 10 ideas"),
  top: z
    .array(z.strictObject({ ideaId: z.string(), why: z.string().min(10) }))
    .max(3),
});
export type IdeasFile = z.infer<typeof IdeasFile>;

export const Hook = z.strictObject({
  id: z.string().regex(/^h\d{2}$/),
  type: HookType,
  voice: z.string().min(3),
  visual: z.string().min(3),
  text: z.string().min(1).max(70),
  /** Script block where the hook's promise is paid off — blocks unfulfilled clickbait. */
  payoffBlockId: z.string().min(1),
  payoff: z.string().min(5),
  risk: z.string(),
  selected: z.boolean(),
});
export type Hook = z.infer<typeof Hook>;

export const HooksFile = z
  .strictObject({ ideaId: z.string(), hooks: z.array(Hook).min(5) })
  .refine((f) => new Set(f.hooks.map((h) => h.type)).size >= 5, {
    message: "need at least 5 different hook types",
  });
export type HooksFile = z.infer<typeof HooksFile>;

export const ScriptRole = z.enum(["hook", "setup", "development", "turn", "payoff", "cta"]);

export const ScriptBlock = z
  .strictObject({
    id: z.string().regex(/^b\d{2}$/),
    startSec: z.number().min(0),
    endSec: z.number().positive(),
    role: ScriptRole,
    visual: z.string(),
    speech: z.string(),
    onScreenText: z.string(),
    sound: z.string(),
    motion: z.string(),
    shotIds: z.array(z.string()),
    retention: z.strictObject({
      whyKeepWatching: z.string().min(5),
      risk: z.enum(["low", "medium", "high"]),
    }),
  })
  .refine((b) => b.endSec > b.startSec, { message: "block must end after it starts" });
export type ScriptBlock = z.infer<typeof ScriptBlock>;

export const Claim = z.strictObject({
  text: z.string(),
  factId: z.string().nullable(),
  status: z.union([FactStatus, z.literal("NO_FACT")]),
});

export const ScriptFile = z.strictObject({
  language: LanguageId,
  hookId: z.string(),
  targetDurationSec: z.tuple([z.number(), z.number()]),
  timingSource: TimingSource,
  blocks: z.array(ScriptBlock).min(2),
  claims: z.array(Claim),
  /** Editorial CTA card: on screen only, never in SRT. */
  editorialCta: z.string().nullable(),
  notes: z.array(z.string()),
});
export type ScriptFile = z.infer<typeof ScriptFile>;

export const Shot = z.strictObject({
  /** S = shoot, G = generate, E = existing asset (class is authoritative). */
  id: z.string().regex(/^[SGE]\d{2}$/),
  class: ShotClass,
  duration: z.number().positive(),
  camera: z.string(),
  framing: z.string(),
  action: z.string(),
  speech: z.string(),
  environment: z.string(),
  lighting: z.string(),
  props: z.string(),
  screenRecording: z.string(),
  requiredAsset: z.string(),
  motionGraphics: z.string(),
  audio: z.string(),
  notes: z.string(),
  blockIds: z.array(z.string()).min(1),
  assetId: z.string().nullable(),
  draftSubstitute: z.string().nullable(),
});
export type Shot = z.infer<typeof Shot>;

export const ShotlistFile = z.strictObject({ shots: z.array(Shot).min(1) });
export type ShotlistFile = z.infer<typeof ShotlistFile>;

export const PlatformCopy = z.strictObject({
  platform: Platform,
  title: z.string(),
  caption: z.string().min(1),
  description: z.string(),
  cta: z.string(),
  hashtags: z
    .array(z.string().regex(/^#[\p{L}\p{N}_]+$/u, "hashtag must start with # and have no spaces"))
    .max(5, "no more than 5 relevant hashtags"),
  keywords: z.array(z.string()).max(10),
  onScreenTitle: z.string(),
  coverText: z.string().max(40),
});
export type PlatformCopy = z.infer<typeof PlatformCopy>;

export const PublishFile = z.strictObject({
  platforms: z.array(PlatformCopy).min(1),
  needsConfirmation: z.array(z.string()),
});
export type PublishFile = z.infer<typeof PublishFile>;
