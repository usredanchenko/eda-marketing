import { cp, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { MotionSegment, type MotionSegment as MotionSegmentT } from "@mos/core";
import { loadBrand } from "../brands/load";
import { renderTokensCss } from "../brands/tokens-css";
import { run } from "../lib/exec";
import { ensureDir, exists, readJson, readText, readValidated, sha256File, sha256Text, writeJson, writeText } from "../lib/fsx";
import { UserError } from "../lib/out";
import { P, repoRel, ROOT } from "../lib/paths";
import { probe } from "../media/probe";
import type { Pkg } from "../package/load";
import { parseMotionBrief } from "./brief";
import { findHeadlessShell } from "./browser";

const HF_ENV = async (): Promise<NodeJS.ProcessEnv> => ({
  HYPERFRAMES_NO_TELEMETRY: "1",
  DO_NOT_TRACK: "1",
  HYPERFRAMES_NO_UPDATE_CHECK: "1",
  HYPERFRAMES_NO_FEEDBACK: "1",
  HYPERFRAMES_NO_AUTO_INSTALL: "1",
  ...((await findHeadlessShell()) ? { PRODUCER_HEADLESS_SHELL_PATH: (await findHeadlessShell())! } : {}),
});

const hfBin = () => path.join(ROOT, "node_modules", ".bin", "hyperframes");
export const segDir = (pkg: Pkg, id: string) => pkg.abs("video", "motion", id);
const segFile = (pkg: Pkg, id: string) => path.join(segDir(pkg, id), "segment.json");

/**
 * Copies a brand template into `dest` and makes it self-contained: brand fonts, tokens inlined into the
 * <style> (HyperFrames lint wants @font-face in-file), local GSAP, project config, variables.json.
 */
export const instantiateTemplate = async (template: string, brandId: string, dest: string, variables: Record<string, string | number | boolean> = {}) => {
  const src = path.join(P.hyperframes(), "templates", template);
  if (!exists(src)) throw new UserError(`no template video/hyperframes/templates/${template}`);
  const brand = await loadBrand(brandId);
  await cp(src, dest, { recursive: true, filter: (f) => !/\/(renders|\.hyperframes|\.thumbnails)(\/|$)/.test(f) });
  await ensureDir(path.join(dest, "fonts"));
  for (const f of brand.tokens.fonts.files) {
    await cp(path.join(ROOT, f.path), path.join(dest, "fonts", path.basename(f.path)));
    // OFL requires the license text to travel with the font files.
    const lic = f.license.match(/\(([^)]+)\)/)?.[1];
    if (lic && exists(path.join(ROOT, lic))) await cp(path.join(ROOT, lic), path.join(dest, "fonts", path.basename(lic)));
  }
  const shared = path.join(P.hyperframes(), "templates", "_shared");
  // GSAP comes from npm (standard no-charge license), never vendored in the repo.
  await cp(path.join(ROOT, "node_modules", "gsap", "dist", "gsap.min.js"), path.join(dest, "gsap.min.js"));
  await cp(path.join(shared, "hyperframes.json"), path.join(dest, "hyperframes.json"));
  const html = path.join(dest, "index.html");
  await writeText(html, (await readText(html)).replace("/*MOS:TOKENS*/", renderTokensCss(brand)));
  await writeJson(path.join(dest, "meta.json"), { id: path.basename(dest), name: path.basename(dest), createdAt: new Date().toISOString() });
  await writeJson(path.join(dest, "variables.json"), variables);
  return dest;
};

/** Gate: a HyperFrames segment exists only after a complete, approved MOTION_BRIEF section. */
export const newSegment = async (pkg: Pkg, id: string, template: string, durationSec: number, sceneId: string, variables: Record<string, string | number> = {}) => {
  const brief = await parseMotionBrief(pkg.abs("MOTION_BRIEF.md"), id);
  if (!brief.found) throw new UserError(`MOTION_BRIEF.md has no section "## Segment: ${id}"`);
  if (brief.missing.length) throw new UserError(`MOTION_BRIEF "${id}" is incomplete: ${brief.missing.join(", ")}`);
  if (pkg.manifest.motionBriefs[id]?.status !== "approved") throw new UserError(`brief "${id}" is not approved: approve ${pkg.id} motion:${id} --quote "…"`);
  const dest = segDir(pkg, id);
  if (exists(dest)) throw new UserError(`segment already exists: ${repoRel(dest)}`, 2);
  await instantiateTemplate(template, pkg.manifest.brand, dest, variables);
  const seg: MotionSegmentT = { id, template, hyperframesVersion: (await readJson<{ version: string }>(path.join(ROOT, "node_modules/hyperframes/package.json"))).version, durationSec, variables, render: null, integration: { sceneId, layer: "overlay" } };
  await writeJson(segFile(pkg, id), MotionSegment.parse(seg));
  return dest;
};

const inputHash = async (dir: string) => {
  const files = (await readdir(dir, { recursive: true })).map(String).filter((f) => !/^(renders|\.hyperframes|\.thumbnails)\b/.test(f) && f !== "segment.json" && f !== "meta.json").sort();
  const parts: string[] = [];
  for (const f of files) if ((await stat(path.join(dir, f))).isFile()) parts.push(`${f}:${await sha256File(path.join(dir, f))}`);
  return sha256Text(parts.join("\n"));
};

export const checkSegment = async (pkg: Pkg, id: string) => run(hfBin(), ["check", segDir(pkg, id)], { env: await HF_ENV(), timeoutMs: 10 * 60_000 });

/** Renders a transparent WebM (VP9 alpha) and verifies the alpha channel. Skips if inputs are unchanged. */
export const renderSegment = async (pkg: Pkg, id: string, force = false) => {
  const dir = segDir(pkg, id);
  const seg = await readValidated(segFile(pkg, id), MotionSegment);
  const hash = await inputHash(dir);
  const outRel = pkg.rel("video", "motion", id, "renders", `${id}.webm`);
  const out = path.join(ROOT, outRel);
  if (!force && seg.render?.inputHash === hash && exists(out)) return { out: outRel, cached: true, alpha: seg.render.alpha };
  const r = await run(hfBin(), ["render", dir, "--format", "webm", "--fps", "30", "--quality", "looks", "--variables-file", path.join(dir, "variables.json"), "--strict-variables", "--output", out, "--quiet"], { env: await HF_ENV(), timeoutMs: 30 * 60_000 });
  if (r.code !== 0 || !exists(out)) throw new UserError(`hyperframes render: ${(r.stderr || r.stdout).trim().split("\n").slice(-8).join("\n")}`);
  const alpha = await hasAlpha(out);
  const pr = await probe(out);
  seg.render = { path: outRel, alpha, fps: pr.fps, sha256: await sha256File(out), inputHash: hash, renderedAt: new Date().toISOString() };
  await writeJson(segFile(pkg, id), seg);
  return { out: outRel, cached: false, alpha };
};

/** True when the WebM carries alpha (ALPHA_MODE=1) AND some decoded frame is actually not fully opaque. */
export const hasAlpha = async (file: string) => {
  const tags = await run("ffprobe", ["-v", "error", "-show_entries", "stream_tags", "-of", "json", file]);
  const all = (JSON.parse(tags.stdout || "{}").streams ?? []).flatMap((s: { tags?: Record<string, string> }) => Object.entries(s.tags ?? {}));
  if (!all.some(([k, v]: [string, string]) => /^alpha_mode$/i.test(k) && v === "1")) return false;
  const r = await run("ffmpeg", ["-v", "error", "-c:v", "libvpx-vp9", "-i", file, "-vf", "alphaextract,signalstats,metadata=print:key=lavfi.signalstats.YMIN:file=-", "-f", "null", "-"]);
  const mins = [...r.stdout.matchAll(/YMIN=([\d.]+)/g)].map((m) => Number(m[1]));
  return mins.length > 0 && mins.some((v) => v < 250);
};
