import { z } from "zod";
import { TemplateId } from "../templates";
import {
  BrandId,
  CaptionMode,
  FormatId,
  Platform,
  Point01,
  Rect01,
  RepoPath,
  ShotClass,
  TimingSource,
} from "./common";

/**
 * Props for every Remotion composition. Times are in SECONDS (converted to frames inside
 * components) so the same props work at any fps. No `.default()` here: mos writes explicit
 * values, which keeps Studio's prop editor and TS types identical.
 */
const base = {
  id: z.string().min(1),
  from: z.number().min(0),
  duration: z.number().positive(),
  layer: z.enum(["base", "overlay"]),
  /** Visible draft label, e.g. "temporary insert from clip C006 — replace with S03". */
  draftNote: z.string().nullable(),
};
const Zoom = z.strictObject({ from: z.number().positive(), to: z.number().positive() });

export const FootageScene = z.strictObject({
  ...base,
  kind: z.literal("footage"),
  src: RepoPath,
  trimStart: z.number().min(0),
  fit: z.enum(["contain", "cover", "wideWindow"]),
  focus: Point01,
  zoom: Zoom,
  muted: z.boolean(),
});
export const PlaceholderScene = z.strictObject({
  ...base,
  kind: z.literal("placeholder"),
  shotId: z.string(),
  shotClass: ShotClass,
  title: z.string(),
  description: z.string(),
});
export const ScreenScene = z.strictObject({
  ...base,
  kind: z.literal("screen"),
  src: RepoPath,
  device: z.enum(["phone", "none"]),
  /** center = phone in the middle; bottom = phone anchored low, captions/accents live above it. */
  placement: z.enum(["center", "bottom"]),
  /** Honesty label, e.g. "test mode · fictional data". */
  label: z.string().nullable(),
  zoom: Zoom,
  focus: Point01,
  highlight: Rect01.nullable(),
  /** Hard cuts to other screenshots inside the same phone frame (seconds from scene start). */
  sequence: z.array(z.strictObject({ at: z.number().min(0), src: RepoPath, redact: z.array(Rect01) })),
  /** Areas of the screenshot to cover (unconfirmed numbers, announcements, personal data). */
  redact: z.array(Rect01),
});
export const PreviewScene = z
  .strictObject({
    ...base,
    kind: z.literal("preview"),
    src: RepoPath,
    /** How finished the visual is. Anything but `real` is work in progress and must say so on screen. */
    stage: z.enum(["blockout", "mockup", "concept", "render", "real"]),
    /** Required unless stage is `real`: a mockup must never pass as the real product. */
    honestyLabel: z.string().nullable(),
    zoom: Zoom,
  })
  .refine((s) => s.stage === "real" || (s.honestyLabel ?? "").trim().length > 0, {
    message: "work-in-progress visuals need an honestyLabel",
    path: ["honestyLabel"],
  });
export const MotionScene = z.strictObject({
  ...base,
  kind: z.literal("motion"),
  src: RepoPath,
  segmentId: z.string(),
});
export const TitleScene = z.strictObject({
  ...base,
  kind: z.literal("title"),
  eyebrow: z.string().nullable(),
  lines: z
    .array(
      z.strictObject({
        text: z.string(),
        weight: z.union([z.literal(300), z.literal(700)]),
        style: z.enum(["plain", "accent", "gradient", "mono"]),
      }),
    )
    .min(1),
  slot: z.enum(["headline", "center"]),
  background: z.enum(["none", "brand", "dim"]),
  /** true when the title shows the phrase being spoken: subtitles for that moment are hidden (no duplicate). */
  suppressCaptions: z.boolean(),
});
/** A diegetic notification / task / support-ticket card with a status stamp that advances over time. */
export const CardScene = z.strictObject({
  ...base,
  kind: z.literal("card"),
  /** Header line, e.g. "SUPPORT · INCOMING". */
  header: z.string(),
  /** Reference shown top-right, e.g. "#4127". */
  ref: z.string(),
  title: z.string(),
  /** Label/value rows under the title, e.g. [["From", "Accounting"], ["Where", "Floor 3"]]. */
  rows: z.array(z.tuple([z.string(), z.string()])),
  /** Chip text, e.g. "PRIORITY: CRITICAL"; null hides it. */
  chip: z.string().nullable(),
  statuses: z.array(z.strictObject({ label: z.string(), tone: z.enum(["neutral", "info", "warn", "done"]) })).min(1),
});
export const CommentScene = z.strictObject({
  ...base,
  kind: z.literal("comment"),
  author: z.string(),
  text: z.string(),
  /** Comments are illustrative unless sourced; the label is shown on screen. */
  sourceLabel: z.string(),
});
export const MessageScene = z.strictObject({
  ...base,
  kind: z.literal("message"),
  theme: z.enum(["dark", "light"]),
  messages: z
    .array(
      z.strictObject({
        from: z.enum(["me", "them"]),
        author: z.string().nullable(),
        text: z.string(),
        at: z.number().min(0),
      }),
    )
    .min(1),
});
export const FeatureScene = z.strictObject({
  ...base,
  kind: z.literal("feature"),
  title: z.string(),
  text: z.string(),
  target: Point01,
  factId: z.string().nullable(),
});
export const MetricScene = z.strictObject({
  ...base,
  kind: z.literal("metric"),
  value: z.number(),
  prefix: z.string(),
  suffix: z.string(),
  label: z.string(),
  /** Must resolve to a PUBLIC_CONFIRMED fact (checked by `mos validate`). */
  factId: z.string().min(1),
});
const SplitSide = z.strictObject({
  src: RepoPath,
  label: z.string(),
  media: z.enum(["image", "video"]),
});
export const SplitScene = z.strictObject({
  ...base,
  kind: z.literal("split"),
  a: SplitSide,
  b: SplitSide,
  orientation: z.enum(["vertical", "horizontal"]),
});
export const CtaScene = z.strictObject({
  ...base,
  kind: z.literal("cta"),
  text: z.string(),
  sub: z.string().nullable(),
  /** Editorial (not spoken) CTA never enters the SRT. */
  editorial: z.boolean(),
});
export const LowerThirdScene = z.strictObject({
  ...base,
  kind: z.literal("lowerThird"),
  name: z.string(),
  role: z.string(),
});
export const ProgressScene = z.strictObject({
  ...base,
  kind: z.literal("progress"),
  label: z.string(),
  value: z.number().min(0).max(1),
  factId: z.string().min(1),
});

export const Scene = z.discriminatedUnion("kind", [
  FootageScene,
  PlaceholderScene,
  ScreenScene,
  PreviewScene,
  MotionScene,
  TitleScene,
  CardScene,
  CommentScene,
  MessageScene,
  FeatureScene,
  MetricScene,
  SplitScene,
  CtaScene,
  LowerThirdScene,
  ProgressScene,
]);
export type Scene = z.infer<typeof Scene>;

export const CaptionWord = z.strictObject({
  text: z.string(),
  startMs: z.number().min(0),
  endMs: z.number().min(0),
  emphasis: z.boolean(),
});
export type CaptionWord = z.infer<typeof CaptionWord>;
export const CaptionPage = z.strictObject({
  startMs: z.number().min(0),
  endMs: z.number().min(0),
  slot: z.enum(["captionBand", "captionBandAlt"]),
  lines: z.array(z.strictObject({ step: z.number().int().min(0), words: z.array(CaptionWord).min(1) })).min(1),
});
export type CaptionPage = z.infer<typeof CaptionPage>;

export const Accent = z.strictObject({
  id: z.string(),
  text: z.string(),
  from: z.number().min(0),
  duration: z.number().positive(),
  slot: z.enum(["headline", "center", "captionBand"]),
  weight: z.union([z.literal(300), z.literal(700)]),
  style: z.enum(["plain", "accent", "gradient"]),
  size: z.enum(["m", "l", "xl"]),
  /** false = editorial text that is not in the speech (kept out of SRT). */
  spoken: z.boolean(),
});
export type Accent = z.infer<typeof Accent>;

const Clip = { src: RepoPath, from: z.number().min(0), trimStart: z.number().min(0), duration: z.number().positive(), volume: z.number().min(0).max(2) };
export const Audio = z.strictObject({
  voice: z.array(z.strictObject(Clip)),
  music: z.strictObject({ ...Clip, duckTo: z.number().min(0).max(1), fadeIn: z.number().min(0), fadeOut: z.number().min(0) }).nullable(),
  sfx: z.array(z.strictObject({ id: z.string(), src: RepoPath, at: z.number().min(0), volume: z.number().min(0).max(2), reason: z.string().min(3) })),
  expectSilence: z.boolean(),
});
export type Audio = z.infer<typeof Audio>;

export const VideoProps = z.strictObject({
  schemaVersion: z.literal(1),
  packageId: z.string(),
  brand: BrandId,
  template: TemplateId,
  format: FormatId,
  fps: z.number().int().positive(),
  platforms: z.array(Platform).min(1),
  title: z.string(),
  durationSec: z.number().positive(),
  draft: z.strictObject({ enabled: z.boolean(), label: z.string() }),
  background: z.enum(["night", "plain", "brand"]),
  scenes: z.array(Scene),
  captions: z
    .strictObject({
      mode: CaptionMode,
      timingSource: TimingSource,
      pages: z.array(CaptionPage),
    })
    .nullable(),
  accents: z.array(Accent),
  audio: Audio,
  uiZones: z.array(z.strictObject({ id: z.string(), rect: Rect01, fromSec: z.number().min(0), toSec: z.number().min(0), reason: z.string() })),
});
export type VideoProps = z.infer<typeof VideoProps>;

/** All media paths referenced by props (for asset checks and staging). */
export const mediaPaths = (p: VideoProps): string[] => {
  const out: string[] = [];
  for (const s of p.scenes) {
    if ("src" in s) out.push(s.src);
    if (s.kind === "screen") s.sequence.forEach((q) => out.push(q.src));
    if (s.kind === "split") out.push(s.a.src, s.b.src);
  }
  for (const v of p.audio.voice) out.push(v.src);
  if (p.audio.music) out.push(p.audio.music.src);
  for (const s of p.audio.sfx) out.push(s.src);
  return Array.from(new Set(out));
};
