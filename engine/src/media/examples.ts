import { stat } from "node:fs/promises";
import path from "node:path";
import { recordProvenance } from "../assets/provenance";
import { run } from "../lib/exec";
import { ensureDir, exists, sha256File } from "../lib/fsx";
import { UserError } from "../lib/out";
import { ROOT } from "../lib/paths";
import { registerCompositions, remotionDir } from "../video/register";

/**
 * Generates every asset the fictional example brand needs, locally: animated gradient "footage"
 * (ffmpeg) and clearly-labeled mock UI / blockout / logo stills (Remotion). No third-party media.
 */
const BRAND = "acme-focus";
const FOOTAGE = [
  { name: "desk-vertical", size: "1080x1920", colors: ["0x1b2629", "0x2e5e66", "0xff8a5c"] },
  { name: "desk-wide", size: "1920x1080", colors: ["0x0f1416", "0x2e5e66", "0xffd27a"] },
];
const STILLS: { variant: string; rel: string }[] = [
  { variant: "screen-timer", rel: `assets/${BRAND}/screens/timer.png` },
  { variant: "screen-task", rel: `assets/${BRAND}/screens/task.png` },
  { variant: "screen-done", rel: `assets/${BRAND}/screens/done.png` },
  { variant: "blockout", rel: `assets/${BRAND}/preview/blockout.png` },
  { variant: "logo", rel: `assets/${BRAND}/logo/acme-focus-icon.png` },
];

const record = async (rel: string, source: string, method: "synthesized" | "rendered") => {
  const abs = path.join(ROOT, rel);
  await recordProvenance([{ id: `example-${path.basename(rel).replace(/\.\w+$/, "")}`, path: rel, source, sha256: await sha256File(abs), bytes: (await stat(abs)).size, importedAt: new Date().toISOString(), license: "generated locally (no third-party rights)", restriction: "fictional example brand", method }]);
};

export const generateExamples = async (o: { force?: boolean } = {}) => {
  const out: string[] = [];
  for (const f of FOOTAGE) {
    const rel = `assets/${BRAND}/footage/${f.name}.mp4`;
    const abs = path.join(ROOT, rel);
    if (exists(abs) && !o.force) continue;
    await ensureDir(path.dirname(abs));
    const graph = `gradients=s=${f.size}:c0=${f.colors[0]}:c1=${f.colors[1]}:c2=${f.colors[2]}:nb_colors=3:speed=0.012:r=30:d=12`;
    const r = await run("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", graph, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "26", "-movflags", "+faststart", abs], { timeoutMs: 5 * 60_000 });
    if (r.code !== 0) throw new UserError(`ffmpeg example footage: ${r.stderr.trim()}`);
    await record(rel, `ffmpeg lavfi: ${graph}`, "synthesized");
    out.push(rel);
  }
  // The Remotion bundle imports the generated registry and brand tokens: make sure they exist (fresh clone).
  await registerCompositions();
  for (const s of STILLS) {
    const abs = path.join(ROOT, s.rel);
    if (exists(abs) && !o.force) continue;
    await ensureDir(path.dirname(abs));
    const r = await run("npx", ["remotion", "still", "src/index.ts", `example-${s.variant}`, abs, `--props=${JSON.stringify({ variant: s.variant, brand: BRAND })}`, "--image-format=png", "--log=error"], { cwd: remotionDir(), timeoutMs: 10 * 60_000 });
    if (r.code !== 0) throw new UserError(`remotion still example-${s.variant}: ${(r.stderr || r.stdout).trim().split("\n").slice(-6).join("\n")}`);
    await record(s.rel, `remotion still example-${s.variant}`, "rendered");
    out.push(s.rel);
  }
  return out;
};
