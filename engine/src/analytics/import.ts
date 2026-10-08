import { constants } from "node:fs";
import { copyFile } from "node:fs/promises";
import path from "node:path";
import { AnalyticsRecord, type AnalyticsRecord as Rec, type BrandId, type Platform } from "@mos/core";
import { ensureDir, readJsonl, readText, readYaml, today, writeText } from "../lib/fsx";
import { UserError } from "../lib/out";
import { ROOT } from "../lib/paths";
import { listPackageIds, loadPackage } from "../package/load";
import { parseCount, parseCsv, parseDuration, parsePercent } from "./csv";

interface Mapping {
  id: string;
  platform: Platform;
  verified: boolean;
  columns: Record<string, string[]>;
  transforms: Record<string, "count" | "percent" | "duration" | "text" | "date">;
}

export const RECORDS = () => path.join(ROOT, "analytics", "records.jsonl");

const DEFAULT_TRANSFORM: Record<string, Mapping["transforms"][string]> = {
  video_id: "text", date: "date", topic: "text", format: "text", cta: "text", notes: "text",
  completion_rate: "percent", average_watch_time: "duration", watch_time: "duration", duration: "duration",
};

const toDate = (raw: string) => {
  const m = raw.match(/(\d{4})[-./](\d{1,2})[-./](\d{1,2})/) ?? raw.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (!m) return null;
  const [y, mo, d] = m[1].length === 4 ? [m[1], m[2], m[3]] : [m[3], m[2], m[1]];
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
};

/** Maps one export (CSV) to normalized records. Unknown → null. Unmapped columns are reported, never guessed. */
export const mapCsv = async (file: string, platform: Platform, brand: BrandId) => {
  const mapping = await readYaml<Mapping>(path.join(ROOT, "analytics", "mappings", `${platform}.yaml`));
  const rows = parseCsv(await readText(file));
  if (!rows.length) throw new UserError("CSV is empty or has no header");
  const headers = Object.keys(rows[0]);
  const lower = new Map(headers.map((h) => [h.toLowerCase(), h]));
  const resolved: Record<string, string> = {};
  for (const [field, aliases] of Object.entries(mapping.columns)) {
    const hit = aliases.map((a) => lower.get(a.toLowerCase())).find(Boolean);
    if (hit) resolved[field] = hit;
  }
  const used = new Set(Object.values(resolved));
  const unmapped = headers.filter((h) => !used.has(h));
  if (!resolved.video_id) throw new UserError(`no video_id column found (candidates: ${mapping.columns.video_id?.join(", ")}). Fix analytics/mappings/${platform}.yaml`);
  const pkgByVideo = await packagesByVideoId();
  const records: Rec[] = rows.map((row) => {
    const get = (field: string) => (resolved[field] ? row[resolved[field]] ?? "" : "");
    const conv = (field: string) => {
      const t = mapping.transforms[field] ?? DEFAULT_TRANSFORM[field] ?? "count";
      const raw = get(field);
      if (!resolved[field]) return null;
      return t === "percent" ? parsePercent(raw) : t === "duration" ? parseDuration(raw) : t === "date" ? toDate(raw) : t === "text" ? raw || null : parseCount(raw);
    };
    const vid = get("video_id");
    return AnalyticsRecord.parse({
      platform, brand, video_id: vid, package_id: pkgByVideo.get(`${platform}:${vid}`) ?? null,
      date: conv("date"), snapshot_date: today(), topic: conv("topic"), format: null, hook_type: null,
      duration: conv("duration"), views: conv("views"), reach: conv("reach"), likes: conv("likes"), comments: conv("comments"),
      shares: conv("shares"), saves: conv("saves"), followers_gained: conv("followers_gained"), profile_visits: conv("profile_visits"),
      watch_time: conv("watch_time"), average_watch_time: conv("average_watch_time"), completion_rate: conv("completion_rate"),
      retention_points: null, cta: null, notes: null,
      source: { file: "", kind: "csv", mappingId: mapping.id, confirmedByUser: false },
    });
  });
  return { records, resolved, unmapped, mappingVerified: mapping.verified };
};

const packagesByVideoId = async () => {
  const m = new Map<string, string>();
  for (const id of await listPackageIds()) for (const p of (await loadPackage(id)).manifest.published) if (p.videoId) m.set(`${p.platform}:${p.videoId}`, id);
  return m;
};

/** Keeps the raw export untouched in analytics/raw/ and appends records, deduplicated by (platform, video_id, snapshot_date). */
export const storeRecords = async (file: string, platform: Platform, records: Rec[]) => {
  const rawRel = `analytics/raw/${platform}/${today()}-${path.basename(file)}`;
  await ensureDir(path.dirname(path.join(ROOT, rawRel)));
  await copyFile(file, path.join(ROOT, rawRel), constants.COPYFILE_FICLONE);
  const withSource = records.map((r) => ({ ...r, source: { ...r.source, file: rawRel, confirmedByUser: true } }));
  return appendRecords(withSource);
};

export const appendRecords = async (records: Rec[]) => {
  const key = (r: Rec) => `${r.platform}|${r.video_id}|${r.snapshot_date}`;
  const all = new Map((await readJsonl<Rec>(RECORDS())).map((r) => [key(r), r]));
  for (const r of records) all.set(key(r), AnalyticsRecord.parse(r));
  await writeText(RECORDS(), [...all.values()].map((r) => JSON.stringify(r)).join("\n") + "\n");
  return { total: all.size, added: records.length };
};
