import { z } from "zod";
import { FormatId, Platform, type Rect01 } from "./schemas/common";

export const FORMATS: Record<FormatId, { width: number; height: number; label: string }> = {
  "9x16": { width: 1080, height: 1920, label: "9:16 Reels/Shorts/TikTok" },
  "1x1": { width: 1080, height: 1080, label: "1:1 feed" },
  "4x5": { width: 1080, height: 1350, label: "4:5 feed" },
  "16x9": { width: 1920, height: 1080, label: "16:9 YouTube" },
};

const Margins = z.strictObject({
  top: z.number().min(0).max(0.5),
  bottom: z.number().min(0).max(0.5),
  left: z.number().min(0).max(0.5),
  right: z.number().min(0).max(0.5),
});
export type Margins = z.infer<typeof Margins>;

/** config/platforms.json: UI overlays of each platform as frame fractions. */
export const PlatformsConfig = z.strictObject({
  verified: z.boolean(),
  note: z.string(),
  platforms: z.record(
    Platform,
    z.strictObject({
      label: z.string(),
      verified: z.boolean(),
      source: z.string(),
      margins: z.record(FormatId, Margins),
      captionMaxChars: z.number().int().positive(),
    }),
  ),
});
export type PlatformsConfig = z.infer<typeof PlatformsConfig>;

/** The strictest union of all target platforms' unsafe margins. */
export const combinedMargins = (cfg: PlatformsConfig, format: FormatId, platforms: Platform[]): Margins => {
  const list = platforms.map((p) => cfg.platforms[p]?.margins[format]).filter(Boolean) as Margins[];
  if (!list.length) return { top: 0.05, bottom: 0.05, left: 0.05, right: 0.05 };
  return {
    top: Math.max(...list.map((m) => m.top)),
    bottom: Math.max(...list.map((m) => m.bottom)),
    left: Math.max(...list.map((m) => m.left)),
    right: Math.max(...list.map((m) => m.right)),
  };
};

export type SlotId = "headline" | "center" | "captionBand" | "captionBandAlt" | "lowerThird" | "ctaBand";
export interface RectPx { x: number; y: number; w: number; h: number }

/**
 * Semantic slots instead of hard-coded pixels, so one layout survives 9:16 → 1:1 → 4:5 → 16:9.
 * Captions stay inside the safe area; the alternative band is used when UI covers the main one.
 */
export const computeSlots = (format: FormatId, m: Margins): Record<SlotId, RectPx> => {
  const { width: W, height: H } = FORMATS[format];
  const x = Math.round(W * Math.max(m.left, 0.06));
  const right = Math.round(W * (1 - Math.max(m.right, 0.06)));
  const top = Math.round(H * m.top);
  const bottom = Math.round(H * (1 - m.bottom));
  const w = right - x;
  const band = Math.round(H * (format === "16x9" ? 0.2 : 0.15));
  const rect = (y: number, h: number): RectPx => ({ x, y: Math.round(y), w, h: Math.round(h) });
  return {
    headline: rect(top + H * 0.04, H * 0.22),
    center: rect(H * 0.39, H * 0.22),
    captionBand: rect(bottom - band, band),
    captionBandAlt: rect(top + H * 0.14, band),
    lowerThird: rect(bottom - band - H * 0.09, H * 0.065),
    ctaBand: rect(H * 0.5, H * 0.2),
  };
};

export const rectToFraction = (r: RectPx, format: FormatId): Rect01 => {
  const { width: W, height: H } = FORMATS[format];
  return { x: r.x / W, y: r.y / H, w: r.w / W, h: r.h / H };
};

/** Type sizes are authored for 9:16 at 1080 px width; other formats have less vertical room. */
const TYPE_SCALE: Record<FormatId, number> = { "9x16": 1, "4x5": 0.95, "1x1": 0.9, "16x9": 0.9 };
export const scaleType = (size: number, format: FormatId): number => Math.round(size * TYPE_SCALE[format]);
