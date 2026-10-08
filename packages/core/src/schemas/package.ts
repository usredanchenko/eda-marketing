import { z } from "zod";
import { TemplateId } from "../templates";
import { BrandId, FormatId, IsoDate, Mode, Platform } from "./common";

export const GateStatus = z.enum(["pending", "approved", "rejected", "skipped"]);

export const Gate = z.strictObject({
  status: GateStatus,
  at: z.string().nullable(),
  /** Verbatim user words that granted the gate (or the delegation). */
  quote: z.string().nullable(),
  by: z.enum(["user", "delegated", "system"]).nullable(),
});
export type Gate = z.infer<typeof Gate>;

export const pendingGate = (): Gate => ({ status: "pending", at: null, quote: null, by: null });

export const STAGES = [
  "brief",
  "research",
  "ideas",
  "hooks",
  "script",
  "review",
  "shotlist",
  "captions",
  "publish-copy",
  "summary",
  "assets",
  "edit",
  "motion",
  "sound",
  "props",
  "qa",
  "draft",
  "final",
  "published",
  "analytics",
] as const;
export const Stage = z.enum(STAGES);
export type Stage = z.infer<typeof Stage>;

export const GATE_IDS = [
  "brief",
  "ideaSelected",
  "hooksSelected",
  "scriptApproved",
  "productionApproved",
  "finalRender",
  "publish",
] as const;
export type GateId = (typeof GATE_IDS)[number];

/** content/<id>/manifest.json — the package's machine state. */
export const Manifest = z.strictObject({
  schemaVersion: z.literal(1),
  id: z.string().regex(/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/),
  brand: BrandId,
  topic: z.string().min(3),
  created: IsoDate,
  mode: Mode,
  stage: Stage,
  template: TemplateId,
  formats: z.array(FormatId).min(1),
  platforms: z.array(Platform).min(1),
  campaignId: z.string().nullable(),
  demo: z.boolean(),
  gates: z.strictObject({
    brief: Gate,
    ideaSelected: Gate,
    hooksSelected: Gate,
    scriptApproved: Gate,
    productionApproved: Gate,
    finalRender: Gate,
    publish: Gate,
  }),
  motionBriefs: z.record(z.string(), Gate),
  selected: z.strictObject({
    ideaId: z.string().nullable(),
    hookId: z.string().nullable(),
  }),
  published: z.array(
    z.strictObject({
      platform: Platform,
      url: z.string().nullable(),
      videoId: z.string().nullable(),
      date: IsoDate,
    }),
  ),
  notes: z.array(z.string()),
});
export type Manifest = z.infer<typeof Manifest>;
