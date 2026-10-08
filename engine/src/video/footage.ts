import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { FootageIndex, type FootageEntry } from "@mos/core";
import { sha256File, writeJson } from "../lib/fsx";
import { repoRel, ROOT, safeResolve } from "../lib/paths";
import { makeProxy } from "../media/proxy";
import { probe } from "../media/probe";
import { sceneCuts, silences } from "../media/detect";
import type { Pkg } from "../package/load";

const MEDIA = /\.(mov|mp4|m4v|mkv|webm|m4a|wav|mp3)$/i;

/**
 * Non-destructive ingest of raw footage from input/: metadata, proxies (only when needed),
 * speech/silence and scene fragments. Originals are only read, never modified or moved.
 */
export const indexFootage = async (pkg: Pkg, fromRel = "input") => {
  const dir = safeResolve(fromRel);
  const files = (await readdir(dir, { recursive: true }))
    .map(String)
    .filter((f) => MEDIA.test(f))
    .map((f) => path.join(dir, f));
  const entries: FootageEntry[] = [];
  for (const abs of files) {
    const p = await probe(abs);
    const isVideo = p.width > 0;
    const needsProxy = isVideo && (p.vcodec !== "h264" || p.rotation !== 0 || p.height > 1920 || /\.mov$/i.test(abs));
    const proxyRel = needsProxy ? pkg.rel("video", "footage", "proxies", `${path.parse(abs).name}.mp4`) : null;
    const params = proxyRel ? await makeProxy(abs, path.join(ROOT, proxyRel)) : null;
    const quiet = await silences(abs, p.durationSec);
    const speech: FootageEntry["fragments"] = [];
    let t = 0;
    for (const s of quiet) {
      if (s.start - t > 0.3) speech.push({ inSec: round(t), outSec: round(s.start), kind: "speech" });
      speech.push({ inSec: round(s.start), outSec: round(s.end), kind: "silence" });
      t = s.end;
    }
    if (p.durationSec - t > 0.3) speech.push({ inSec: round(t), outSec: round(p.durationSec), kind: "speech" });
    const cuts = isVideo ? await sceneCuts(abs) : [];
    entries.push({
      id: path.parse(abs).name,
      path: repoRel(abs),
      sha256: await sha256File(abs),
      bytes: (await stat(abs)).size,
      probe: { width: p.width, height: p.height, rotation: p.rotation, fps: p.fps, durationSec: round(p.durationSec), vcodec: p.vcodec, acodec: p.acodec },
      proxy: proxyRel && params ? { path: proxyRel, params } : null,
      fragments: [...speech, ...cuts.map((c) => ({ inSec: round(c), outSec: round(c), kind: "scene" as const }))],
    });
  }
  const index = FootageIndex.parse({ generatedAt: new Date().toISOString(), entries });
  await writeJson(pkg.abs("video", "footage", "index.json"), index);
  return index;
};

const round = (n: number) => Math.round(n * 100) / 100;
