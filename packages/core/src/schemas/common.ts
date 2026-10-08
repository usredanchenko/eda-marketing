import { z } from "zod";

/** Brand folder name under brands/. Folders starting with "_" (e.g. _template) are not brands. */
export const BrandId = z
  .string()
  .regex(/^[a-z][a-z0-9-]{1,30}$/, "brand id: lowercase letters, digits, dashes")
  .refine((s) => !["shared", "all", "template"].includes(s), "reserved brand id");
export type BrandId = z.infer<typeof BrandId>;

export const Platform = z.enum(["tiktok", "instagram", "youtube"]);
export type Platform = z.infer<typeof Platform>;

export const FormatId = z.enum(["9x16", "1x1", "4x5", "16x9"]);
export type FormatId = z.infer<typeof FormatId>;

export const Mode = z.enum(["quick", "standard", "production", "deep"]);
export type Mode = z.infer<typeof Mode>;

export const CaptionMode = z.enum(["replace", "accumulate", "highlight"]);
export type CaptionMode = z.infer<typeof CaptionMode>;

export const TimingSource = z.enum(["estimated", "transcribed"]);
export type TimingSource = z.infer<typeof TimingSource>;

export const ShotClass = z.enum(["SHOOT_THIS", "GENERATE_THIS", "EXISTING_ASSET"]);
export type ShotClass = z.infer<typeof ShotClass>;

export const FactStatus = z.enum([
  "PUBLIC_CONFIRMED",
  "INTERNAL",
  "NEEDS_CONFIRMATION",
  "FORBIDDEN",
]);
export type FactStatus = z.infer<typeof FactStatus>;

export const HookType = z.enum([
  "curiosity",
  "conflict",
  "unexpected_statement",
  "visual_surprise",
  "question",
  "confession",
  "result_first",
  "story_opening",
  "demonstration",
  "controversial_opinion",
]);
export type HookType = z.infer<typeof HookType>;

export const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

export const HexColor = z.string().regex(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/, "expected #rrggbb");

export const REPO_ROOTS = [
  "content",
  "assets",
  "cache",
  "input",
  "brands",
  "research",
  "analytics",
] as const;

/** Repo-relative media/data path. Absolute paths and `..` are rejected everywhere. */
export const isSafeRepoPath = (p: string): boolean => {
  if (!p || p.startsWith("/") || p.startsWith("~") || /^[a-zA-Z]:/.test(p)) return false;
  const parts = p.split(/[\\/]/);
  if (parts.some((s) => s === ".." || s === "." || s === "")) return false;
  return (REPO_ROOTS as readonly string[]).includes(parts[0]);
};

export const RepoPath = z.string().refine(isSafeRepoPath, {
  message: `path must be repo-relative under ${REPO_ROOTS.join("/, ")}/ without '..'`,
});

export const Point01 = z.strictObject({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

export const Rect01 = z.strictObject({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().min(0).max(1),
  h: z.number().min(0).max(1),
});
export type Rect01 = z.infer<typeof Rect01>;
