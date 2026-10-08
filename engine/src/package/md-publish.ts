import type { PlatformCopy, PublishFile } from "@mos/core";
import { z } from "zod";
import { AssetsFile } from "@mos/core";
import { GENERATED } from "./md-creative";

const NAMES: Record<PlatformCopy["platform"], string> = {
  tiktok: "TikTok",
  instagram: "Instagram Reels",
  youtube: "YouTube Shorts",
};

/** Ready-to-paste post copy for one platform: captions/<platform>.md */
export const platformMd = (c: PlatformCopy) =>
  [
    `# ${NAMES[c.platform]}`,
    "",
    GENERATED("data/publish.json"),
    c.title ? `**Title:** ${c.title}\n` : "",
    "**Caption (paste as is):**",
    "",
    "```text",
    [c.caption, c.hashtags.join(" ")].filter(Boolean).join("\n\n"),
    "```",
    "",
    c.description ? `**Description:** ${c.description}\n` : "",
    `**CTA:** ${c.cta}`,
    "",
    `**Hashtags (${c.hashtags.length}):** ${c.hashtags.join(" ") || "—"}`,
    "",
    `**Keywords:** ${c.keywords.join(", ") || "—"}`,
    "",
    `**On-screen title:** ${c.onScreenTitle}`,
    "",
    `**Cover text:** ${c.coverText}`,
    "",
  ].join("\n");

export const publishMd = (f: PublishFile, pkgId: string) =>
  [
    "# PUBLISH",
    "",
    GENERATED("data/publish.json"),
    "> Only you publish, or someone with your separate explicit permission. The system never publishes.",
    "",
    f.needsConfirmation.length ? "## ⚠ NEEDS_CONFIRMATION before publishing\n" : "",
    ...f.needsConfirmation.map((n) => `- [ ] ${n}`),
    f.needsConfirmation.length ? "" : "",
    "## Checklist",
    "",
    "- [ ] The final render passed QA (`QA.md`); no estimated timing",
    "- [ ] Every claim is checked against PRODUCT_FACTS",
    "- [ ] The cover and on-screen title are not covered by the platform UI",
    `- [ ] After publishing: links and video_id → \`npm run mos -- published ${pkgId} --platform … --url …\``,
    "",
    "## Copy per platform",
    "",
    ...f.platforms.map((p) => `- [${NAMES[p.platform]}](captions/${p.platform}.md) — «${p.onScreenTitle}»`),
    "",
  ].join("\n");

export const assetsMd = (f: z.infer<typeof AssetsFile>) =>
  [
    "# ASSETS",
    "",
    GENERATED("data/assets.json"),
    "| id | Class | Kind | Status | Path | Restriction | Used by |",
    "|---|---|---|---|---|---|---|",
    ...f.assets.map(
      (a) => `| ${a.id} | ${a.class} | ${a.kind} | ${a.status} | ${a.path ?? "—"} | ${a.restriction ?? ""} | ${a.usedBy.join(", ")} |`,
    ),
    "",
    ...f.assets.filter((a) => a.note).map((a) => `- **${a.id}:** ${a.note}`),
    "",
  ].join("\n");
