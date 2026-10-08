import path from "node:path";
import { run } from "../lib/exec";
import { ensureDir } from "../lib/fsx";
import { UserError } from "../lib/out";
import { readProps, type Pkg } from "../package/load";
import { compositionId, registerCompositions, remotionDir } from "./register";

export interface RenderOptions {
  kind: "draft" | "final";
  format?: string;
  frames?: string;
  out?: string;
}

/**
 * Renders through the Remotion CLI (rspack bundle). Final render is gated:
 * finalRender approval + transcribed (not estimated) captions + draft badge off.
 */
export const renderPackage = async (pkg: Pkg, o: RenderOptions) => {
  const format = o.format ?? pkg.manifest.formats[0];
  const props = await readProps(pkg, format);
  if (o.kind === "final") {
    if (pkg.manifest.gates.finalRender.status !== "approved") throw new UserError("final render needs the finalRender gate (approve … finalRender --quote …)");
    if (props.draft.enabled) throw new UserError("draft is enabled in props.json — turn it off before the final render");
    if (props.captions?.timingSource === "estimated") throw new UserError("captions use estimated timing: transcribed timing from real speech is required");
  }
  await registerCompositions();
  const name = o.kind === "final" ? "final" : "draft";
  const out = o.out ?? pkg.abs("renders", `${name}${format === "9x16" ? "" : "." + format}.mp4`);
  await ensureDir(path.dirname(out));
  const args = [
    "remotion", "render", "src/index.ts", compositionId(pkg.id, format), out,
    "--codec=h264", `--crf=${o.kind === "final" ? 16 : 22}`, "--audio-bitrate=320k", "--log=error",
  ];
  if (o.frames) args.push(`--frames=${o.frames}`);
  const r = await run("npx", args, { cwd: remotionDir(), timeoutMs: 60 * 60_000 });
  if (r.code !== 0) throw new UserError(`remotion render: ${(r.stderr || r.stdout).trim().split("\n").slice(-8).join("\n")}`);
  return out;
};

export const renderStill = async (pkg: Pkg, frame: number, out: string, format?: string) => {
  const fmt = format ?? pkg.manifest.formats[0];
  await ensureDir(path.dirname(out));
  const r = await run("npx", ["remotion", "still", "src/index.ts", compositionId(pkg.id, fmt), out, `--frame=${frame}`, "--log=error"], {
    cwd: remotionDir(),
    timeoutMs: 10 * 60_000,
  });
  if (r.code !== 0) throw new UserError(`remotion still: ${(r.stderr || r.stdout).trim().split("\n").slice(-6).join("\n")}`);
  return out;
};
