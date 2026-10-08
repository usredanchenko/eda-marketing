import { run } from "../lib/exec";

export interface Span {
  start: number;
  end: number;
}

const spans = (text: string, startKey: string, endKey: string, total: number): Span[] => {
  const out: Span[] = [];
  let open: number | null = null;
  for (const line of text.split("\n")) {
    const s = line.match(new RegExp(`${startKey}[:=]\\s*([\\d.]+)`));
    const e = line.match(new RegExp(`${endKey}[:=]\\s*([\\d.]+)`));
    if (s) open = Number(s[1]);
    if (e && open !== null) {
      out.push({ start: open, end: Number(e[1]) });
      open = null;
    }
  }
  if (open !== null) out.push({ start: open, end: total });
  return out;
};

export const silences = async (file: string, total: number, noiseDb = -45, minSec = 0.35) => {
  const r = await run("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", `silencedetect=n=${noiseDb}dB:d=${minSec}`, "-f", "null", "-"]);
  return spans(r.stderr, "silence_start", "silence_end", total);
};

export const blackFrames = async (file: string, minSec = 0.5) => {
  const r = await run("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-vf", `blackdetect=d=${minSec}:pix_th=0.10`, "-an", "-f", "null", "-"]);
  return [...r.stderr.matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)].map((m) => ({ start: Number(m[1]), end: Number(m[2]) }));
};

export const freezes = async (file: string, total: number, minSec = 2) => {
  const r = await run("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-vf", `freezedetect=n=-60dB:d=${minSec}`, "-an", "-f", "null", "-"]);
  return spans(r.stderr, "lavfi.freezedetect.freeze_start", "lavfi.freezedetect.freeze_end", total);
};

export const sceneCuts = async (file: string, threshold = 0.3): Promise<number[]> => {
  const r = await run("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-vf", `select='gt(scene,${threshold})',showinfo`, "-an", "-f", "null", "-"]);
  return [...r.stderr.matchAll(/pts_time:([\d.]+)/g)].map((m) => Number(m[1]));
};

export interface Loudness {
  integratedLufs: number | null;
  truePeakDbtp: number | null;
  samplePeakDb: number | null;
}

export const loudness = async (file: string): Promise<Loudness> => {
  const r = await run("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-vn", "-af", "ebur128=peak=true,astats", "-f", "null", "-"]);
  const n = (m: RegExpMatchArray | null) => (m && m[1] !== "-inf" ? Number(m[1]) : null);
  const summary = r.stderr.slice(r.stderr.lastIndexOf("Summary:"));
  const overall = r.stderr.slice(r.stderr.lastIndexOf("Overall"));
  return {
    integratedLufs: n(summary.match(/I:\s+(-?[\d.]+|-inf) LUFS/)),
    truePeakDbtp: n(summary.match(/Peak:\s+(-?[\d.]+|-inf) dBFS/)),
    samplePeakDb: n(overall.match(/Peak level dB:\s+(-?[\d.]+|-inf)/)),
  };
};

/** Full decode: any error output means corrupted media. */
export const decodeErrors = async (file: string) => {
  const r = await run("ffmpeg", ["-v", "error", "-i", file, "-f", "null", "-"], { timeoutMs: 10 * 60_000 });
  return r.stderr.trim();
};
