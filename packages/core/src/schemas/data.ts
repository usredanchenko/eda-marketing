import { z } from "zod";
import { BrandId, HookType, IsoDate, Platform, RepoPath, ShotClass } from "./common";

/** content/<id>/data/assets.json */
export const Asset = z.strictObject({
  id: z.string(),
  class: ShotClass,
  kind: z.enum(["video", "image", "audio", "font", "motion", "model"]),
  path: RepoPath.nullable(),
  status: z.enum(["READY", "PLACEHOLDER", "MISSING", "NEEDS_RIGHTS"]),
  provenanceId: z.string().nullable(),
  restriction: z.string().nullable(),
  usedBy: z.array(z.string()),
  note: z.string(),
});
export type Asset = z.infer<typeof Asset>;
export const AssetsFile = z.strictObject({ assets: z.array(Asset) });

/** assets/PROVENANCE.jsonl — one line per imported file. */
export const Provenance = z.strictObject({
  id: z.string(),
  path: RepoPath,
  source: z.string(),
  sha256: z.string().regex(/^[0-9a-f]{64}$/),
  bytes: z.number().int().nonnegative(),
  importedAt: z.string(),
  license: z.string(),
  restriction: z.string().nullable(),
  method: z.enum(["copy", "clone", "synthesized", "rendered", "downloaded"]),
});
export type Provenance = z.infer<typeof Provenance>;

const n = z.number().nonnegative().nullable();
/** analytics/records.jsonl — never invent: unknown = null. */
export const AnalyticsRecord = z.strictObject({
  platform: Platform,
  brand: BrandId,
  video_id: z.string().min(1),
  package_id: z.string().nullable(),
  date: IsoDate.nullable(),
  snapshot_date: IsoDate,
  topic: z.string().nullable(),
  format: z.string().nullable(),
  hook_type: HookType.nullable(),
  duration: n,
  views: n,
  reach: n,
  likes: n,
  comments: n,
  shares: n,
  saves: n,
  followers_gained: z.number().nullable(),
  profile_visits: n,
  watch_time: n,
  average_watch_time: n,
  completion_rate: z.number().min(0).max(1).nullable(),
  retention_points: z.array(z.strictObject({ tSec: z.number().min(0), pct: z.number().min(0).max(1) })).nullable(),
  cta: z.string().nullable(),
  notes: z.string().nullable(),
  source: z.strictObject({
    file: z.string(),
    kind: z.enum(["csv", "screenshot", "manual"]),
    mappingId: z.string().nullable(),
    confirmedByUser: z.boolean(),
  }),
});
export type AnalyticsRecord = z.infer<typeof AnalyticsRecord>;

export const Experiment = z.strictObject({
  experiment: z.string().regex(/^[a-z0-9_]+$/),
  brand: z.union([BrandId, z.literal("all")]),
  status: z.enum(["planned", "running", "concluded", "abandoned"]),
  hypothesis: z.string(),
  variant_a: z.string(),
  variant_b: z.string(),
  primary_metric: z.string(),
  minimum_sample: z.number().int().positive(),
  videos: z.strictObject({ a: z.array(z.string()), b: z.array(z.string()) }),
  result: z.string().nullable(),
  learning: z.string().nullable(),
  confidence: z.enum(["none", "insufficient", "low", "medium", "high"]).nullable(),
});
export type Experiment = z.infer<typeof Experiment>;
export const ExperimentsFile = z.strictObject({ experiments: z.array(Experiment) });

/** research/references/<id>/reference.json — abstract pattern, never a frame-by-frame copy. */
export const ReferencePattern = z.strictObject({
  id: z.string(),
  url: z.string().nullable(),
  localFile: z.string().nullable(),
  platform: z.string(),
  addedAt: IsoDate,
  brandFit: z.array(BrandId),
  meta: z.strictObject({
    title: z.string().nullable(),
    uploader: z.string().nullable(),
    durationSec: z.number().nullable(),
    viewCount: z.number().nullable(),
    likeCount: z.number().nullable(),
    commentCount: z.number().nullable(),
    uploadDate: z.string().nullable(),
  }),
  metaSource: z.enum(["yt-dlp", "ffprobe", "manual", "none"]),
  analyzedFrom: z.array(z.enum(["metadata", "transcript", "frames", "comments", "user_notes"])),
  pattern: z.strictObject({
    hook: z.string(),
    narrative: z.string(),
    pacing: z.string(),
    camera: z.string(),
    text: z.string(),
    transitions: z.string(),
    payoff: z.string(),
    cta: z.string(),
    audienceResponse: z.string(),
  }),
  applicability: z.string(),
  doNotCopy: z.array(z.string()),
  confidence: z.enum(["low", "medium", "high"]),
});
export type ReferencePattern = z.infer<typeof ReferencePattern>;

/** content/<id>/video/footage/index.json — never destructive; originals stay in input/. */
export const FootageEntry = z.strictObject({
  id: z.string(),
  path: RepoPath,
  sha256: z.string(),
  bytes: z.number().int(),
  probe: z.strictObject({
    width: z.number(),
    height: z.number(),
    rotation: z.number(),
    fps: z.number(),
    durationSec: z.number(),
    vcodec: z.string().nullable(),
    acodec: z.string().nullable(),
  }),
  proxy: z.strictObject({ path: RepoPath, params: z.string() }).nullable(),
  fragments: z.array(z.strictObject({ inSec: z.number(), outSec: z.number(), kind: z.enum(["speech", "silence", "scene"]) })),
});
export type FootageEntry = z.infer<typeof FootageEntry>;
export const FootageIndex = z.strictObject({ generatedAt: z.string(), entries: z.array(FootageEntry) });

/** content/<id>/video/motion/<seg>/segment.json */
export const MotionSegment = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  template: z.string(),
  hyperframesVersion: z.string(),
  durationSec: z.number().positive(),
  /** Values for the template's data-composition-variables (passed with --variables-file). */
  variables: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  render: z
    .strictObject({
      path: RepoPath,
      alpha: z.boolean(),
      fps: z.number(),
      sha256: z.string(),
      inputHash: z.string(),
      renderedAt: z.string(),
    })
    .nullable(),
  integration: z.strictObject({ sceneId: z.string(), layer: z.enum(["base", "overlay"]) }),
});
export type MotionSegment = z.infer<typeof MotionSegment>;
