import path from "node:path";
import type { Command } from "commander";
import { ReferencePattern, slugify, type ReferencePattern as Ref } from "@mos/core";
import { listBrands, parseBrandId } from "../brands/load";
import { run } from "../lib/exec";
import { exists, readJson, sha256Text, today, writeJson, writeText } from "../lib/fsx";
import { info, ok, UserError, warn } from "../lib/out";
import { ROOT } from "../lib/paths";
import { probe } from "../media/probe";

const EMPTY_PATTERN: Ref["pattern"] = { hook: "", narrative: "", pacing: "", camera: "", text: "", transitions: "", payoff: "", cta: "", audienceResponse: "" };

/** Metadata only (yt-dlp --skip-download), cached by URL hash. Downloading the media needs explicit permission. */
const fetchMeta = async (url: string) => {
  const cache = path.join(ROOT, "cache", "references", `${sha256Text(url).slice(0, 16)}.json`);
  if (exists(cache)) return readJson<Record<string, unknown>>(cache);
  const r = await run("yt-dlp", ["--dump-json", "--skip-download", "--no-playlist", "--no-warnings", url], { timeoutMs: 120_000 });
  if (r.code !== 0) return null;
  const j = JSON.parse(r.stdout) as Record<string, unknown>;
  const keep = Object.fromEntries(["title", "uploader", "duration", "view_count", "like_count", "comment_count", "upload_date", "extractor_key", "description"].map((k) => [k, j[k] ?? null]));
  await writeJson(cache, keep);
  return keep;
};

export const registerReference = (program: Command) => {
  const ref = program.command("reference").description("Reference library: abstract patterns, not copies");
  ref
    .command("add <urlOrFile>")
    .description("Add a reference (URL: metadata only; local file: ffprobe). The reference-analyst agent fills in the pattern")
    .option("--brand <id...>", "brands this reference is useful for (default: all brands)")
    .option("--note <text>", "why we keep it")
    .action(async (src: string, o: { brand?: string[]; note?: string }) => {
      const isUrl = /^https?:\/\//.test(src);
      if (!isUrl && !exists(path.resolve(src))) throw new UserError(`no file ${src}`, 2);
      const meta = isUrl ? await fetchMeta(src) : null;
      if (isUrl && !meta) warn("no metadata (yt-dlp) — the pattern is filled in from your description/frames");
      const p = !isUrl ? await probe(path.resolve(src)) : null;
      const title = (meta?.title as string | undefined) ?? path.basename(src);
      const id = `${today()}-${slugify(title, 32)}-${sha256Text(src).slice(0, 6)}`;
      const n = (k: string) => (typeof meta?.[k] === "number" ? (meta[k] as number) : null);
      const record: Ref = ReferencePattern.parse({
        id, url: isUrl ? src : null, localFile: isUrl ? null : path.basename(src),
        platform: (meta?.extractor_key as string | undefined) ?? (isUrl ? new URL(src).hostname : "local"),
        addedAt: today(), brandFit: (o.brand ?? listBrands()).map((b) => parseBrandId(b)),
        meta: { title, uploader: (meta?.uploader as string) ?? null, durationSec: n("duration") ?? p?.durationSec ?? null, viewCount: n("view_count"), likeCount: n("like_count"), commentCount: n("comment_count"), uploadDate: (meta?.upload_date as string) ?? null },
        metaSource: isUrl ? (meta ? "yt-dlp" : "none") : "ffprobe",
        analyzedFrom: o.note ? ["user_notes"] : [],
        pattern: EMPTY_PATTERN, applicability: o.note ?? "", doNotCopy: ["exact shot sequence", "verbatim text", "the author's music and graphics"], confidence: "low",
      });
      const dir = path.join(ROOT, "research", "references", id);
      await writeJson(path.join(dir, "reference.json"), record);
      await writeText(path.join(dir, "PATTERN.md"), `# ${title}\n\n${src}\n\n> Filled in by the reference-analyst agent: hook, narrative, pacing, camera, text, transitions, payoff, CTA, audience reaction — as an abstract pattern. A shot-by-shot copy is not allowed.\n`);
      ok(`research/references/${id}/`);
      info("next: the reference-analyst agent fills in pattern in reference.json and PATTERN.md");
    });
};
