import { constants } from "node:fs";
import { copyFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { Provenance, type Provenance as ProvenanceT } from "@mos/core";
import { ensureDir, exists, readJson, readJsonl, sha256File, writeText } from "../lib/fsx";
import { ROOT, safeResolve } from "../lib/paths";

export const PROVENANCE_FILE = () => path.join(ROOT, "assets", "PROVENANCE.jsonl");

interface SourceItem {
  id: string;
  source: string;
  dest: string;
  license: string;
  restriction: string | null;
}

export const readProvenance = async (): Promise<ProvenanceT[]> =>
  (await readJsonl<unknown>(PROVENANCE_FILE())).map((r) => Provenance.parse(r));

const writeProvenance = (rows: ProvenanceT[]) =>
  writeText(PROVENANCE_FILE(), rows.map((r) => JSON.stringify(r)).join("\n") + "\n");

/** Upserts provenance rows by id (used by import, sfx synth and motion renders). */
export const recordProvenance = async (rows: ProvenanceT[]) => {
  const all = await readProvenance();
  const byId = new Map(all.map((r) => [r.id, r]));
  for (const r of rows) byId.set(r.id, Provenance.parse(r));
  await writeProvenance([...byId.values()].sort((a, b) => a.id.localeCompare(b.id)));
};

/**
 * Copies materials listed in assets/sources.json (`source` may start with ~/) into assets/. Uses a
 * copy-on-write clone when the filesystem supports it, so copies take no extra space. Never touches the
 * source. Idempotent: skips identical files.
 */
export const importAssets = async (opts: { only?: string[]; missingOnly?: boolean } = {}) => {
  const file = path.join(ROOT, "assets", "sources.json");
  const manifest = exists(file) ? await readJson<{ items: SourceItem[] }>(file) : { items: [] };
  const done: ProvenanceT[] = [];
  const skipped: string[] = [];
  const missing: string[] = [];
  for (const raw of manifest.items) {
    if (opts.only && !opts.only.includes(raw.id)) continue;
    const item = { ...raw, source: raw.source.replace(/^~(?=\/)/, homedir()) };
    const dest = safeResolve(item.dest);
    if (!exists(item.source)) {
      missing.push(`${item.id}: source not found ${item.source}`);
      continue;
    }
    if (opts.missingOnly && exists(dest)) {
      skipped.push(item.id);
      continue;
    }
    await ensureDir(path.dirname(dest));
    const srcHash = await sha256File(item.source);
    if (exists(dest) && (await sha256File(dest)) === srcHash) skipped.push(item.id);
    else await copyFile(item.source, dest, constants.COPYFILE_FICLONE);
    done.push({
      id: item.id,
      path: item.dest,
      source: raw.source,
      sha256: srcHash,
      bytes: (await stat(dest)).size,
      importedAt: new Date().toISOString(),
      license: item.license,
      restriction: item.restriction,
      method: "clone",
    });
  }
  if (done.length) await recordProvenance(done);
  return { imported: done.length, skipped, missing };
};

/** Checks that every provenance entry exists on disk with the recorded hash. */
export const verifyAssets = async () => {
  const rows = await readProvenance();
  const problems: string[] = [];
  for (const r of rows) {
    const abs = safeResolve(r.path);
    const generated = r.method === "synthesized" || r.method === "rendered";
    if (!exists(abs)) problems.push(`${r.id}: missing ${r.path} (${generated ? "npm run mos -- assets sfx / assets examples" : "npm run mos -- assets restore"})`);
    // Generated files depend on the local ffmpeg/browser build: existence is checked, bytes may differ.
    else if (!generated && (await sha256File(abs)) !== r.sha256) problems.push(`${r.id}: hash mismatch ${r.path}`);
  }
  return { checked: rows.length, problems };
};
