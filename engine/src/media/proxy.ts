import { run } from "../lib/exec";
import { ensureDir } from "../lib/fsx";
import { UserError } from "../lib/out";
import path from "node:path";

/**
 * Studio-friendly proxy: H.264, short GOP, faststart, height 1920, correct rotation.
 * No colour filters — the look of the source is preserved.
 */
export const PROXY_PARAMS = "libx264 crf18 preset=medium g=12 scale=-2:1920 yuv420p faststart aac192k";

export const makeProxy = async (src: string, dest: string) => {
  await ensureDir(path.dirname(dest));
  const r = await run(
    "ffmpeg",
    ["-v", "error", "-y", "-i", src, "-vf", "scale=-2:1920", "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-g", "12", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-c:a", "aac", "-b:a", "192k", dest],
    { timeoutMs: 60 * 60_000 },
  );
  if (r.code !== 0) throw new UserError(`proxy ${src}: ${r.stderr.trim()}`);
  return PROXY_PARAMS;
};

/** Contact sheet: one frame per `everySec`, tiled. */
export const contactSheet = async (video: string, out: string, everySec = 1, cols = 6) => {
  await ensureDir(path.dirname(out));
  const r = await run("ffmpeg", [
    "-v", "error", "-y", "-i", video,
    "-vf", `fps=1/${everySec},scale=270:-1,tile=${cols}x6:padding=6:margin=6:color=0x202020`,
    "-frames:v", "1", "-q:v", "3", out,
  ]);
  if (r.code !== 0) throw new UserError(`contact sheet: ${r.stderr.trim()}`);
  return out;
};

/** Average luma of one frame (0–255): used to catch blank stills. */
export const frameLuma = async (image: string): Promise<number | null> => {
  const r = await run("ffmpeg", ["-v", "error", "-i", image, "-vf", "signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-", "-f", "null", "-"]);
  const m = r.stdout.match(/YAVG=([\d.]+)/);
  return m ? Number(m[1]) : null;
};
