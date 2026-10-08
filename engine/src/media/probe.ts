import { run } from "../lib/exec";
import { UserError } from "../lib/out";

export interface Probe {
  width: number;
  height: number;
  rotation: number;
  fps: number;
  durationSec: number;
  vcodec: string | null;
  acodec: string | null;
  pixFmt: string | null;
  colorSpace: string | null;
  audioRate: number | null;
  frames: number | null;
}

const ratio = (r?: string) => {
  if (!r) return 0;
  const [a, b] = r.split("/").map(Number);
  return b ? a / b : a;
};

export const probe = async (file: string): Promise<Probe> => {
  const r = await run("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]);
  if (r.code !== 0) throw new UserError(`ffprobe could not read ${file}: ${r.stderr.trim()}`);
  const j = JSON.parse(r.stdout) as {
    streams: Record<string, unknown>[];
    format: { duration?: string };
  };
  const v = j.streams.find((s) => s.codec_type === "video") as Record<string, any> | undefined;
  const a = j.streams.find((s) => s.codec_type === "audio") as Record<string, any> | undefined;
  const rot = Number(v?.side_data_list?.find((d: any) => d.rotation !== undefined)?.rotation ?? v?.tags?.rotate ?? 0);
  return {
    width: Number(v?.width ?? 0),
    height: Number(v?.height ?? 0),
    rotation: Number.isFinite(rot) ? rot : 0,
    fps: Math.round(ratio(v?.avg_frame_rate || v?.r_frame_rate) * 1000) / 1000,
    durationSec: Number(j.format.duration ?? v?.duration ?? 0),
    vcodec: v?.codec_name ?? null,
    acodec: a?.codec_name ?? null,
    pixFmt: v?.pix_fmt ?? null,
    colorSpace: v?.color_space ?? null,
    audioRate: a?.sample_rate ? Number(a.sample_rate) : null,
    frames: v?.nb_frames ? Number(v.nb_frames) : null,
  };
};
