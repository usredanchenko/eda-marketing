import path from "node:path";
import { combinedMargins, computeSlots, PlatformsConfig, scaleType, secToFrames, type VideoProps } from "@mos/core";
import type { Brand } from "../brands/load";
import { measurer } from "../captions/measure";
import { checkMedia } from "../checks/validate";
import { lintPublicText, loadBannedRules } from "../checks/script";
import { exists, readValidated } from "../lib/fsx";
import { ROOT } from "../lib/paths";
import { blackFrames, decodeErrors, freezes, loudness, silences } from "../media/detect";
import type { Probe } from "../media/probe";

export type Status = "pass" | "warn" | "fail" | "skip";
export interface Result {
  id: string;
  status: Status;
  detail: string;
}
const R = (id: string, status: Status, detail: string): Result => ({ id, status, detail });

export const formatChecks = (p: VideoProps, pr: Probe, partial: boolean): Result[] => {
  const W = { "9x16": [1080, 1920], "1x1": [1080, 1080], "4x5": [1080, 1350], "16x9": [1920, 1080] }[p.format];
  const expectFrames = secToFrames(p.durationSec, p.fps);
  const gotFrames = Math.round(pr.durationSec * pr.fps);
  return [
    R("resolution", pr.width === W[0] && pr.height === W[1] ? "pass" : "fail", `${pr.width}x${pr.height}, expected ${W.join("x")}`),
    R("fps", Math.abs(pr.fps - p.fps) < 0.01 ? "pass" : "fail", `${pr.fps} fps, expected ${p.fps}`),
    partial
      ? R("duration", "skip", "partial render (--frames)")
      : R("duration", Math.abs(gotFrames - expectFrames) <= 1 ? "pass" : "fail", `${gotFrames} frames, expected ${expectFrames}`),
    R("codec", pr.vcodec === "h264" && pr.pixFmt === "yuv420p" ? "pass" : "warn", `${pr.vcodec} ${pr.pixFmt} ${pr.colorSpace ?? ""}`.trim()),
    R("audio-stream", pr.acodec ? "pass" : p.audio.expectSilence ? "warn" : "fail", pr.acodec ? `${pr.acodec} ${pr.audioRate} Hz` : "no audio track"),
  ];
};

export const mediaChecks = async (file: string, p: VideoProps, pr: Probe): Promise<Result[]> => {
  const out: Result[] = [];
  const errs = await decodeErrors(file);
  out.push(R("corrupted-media", errs ? "fail" : "pass", errs ? errs.split("\n").slice(0, 3).join(" | ") : "full decode without errors"));
  if (pr.acodec) {
    const l = await loudness(file);
    const silentMix = l.integratedLufs === null || l.integratedLufs < -60;
    if (silentMix) out.push(R("silent-audio", p.audio.expectSilence ? "pass" : "fail", p.audio.expectSilence ? "silent mix expected (animatic without voice)" : "the mix is nearly silent"));
    else {
      const I = l.integratedLufs!;
      out.push(R("loudness", p.audio.expectSilence ? "skip" : Math.abs(I + 16) <= 2 ? "pass" : "warn", `${I} LUFS (target −16 ±2)`));
    }
    const tp = l.truePeakDbtp ?? l.samplePeakDb;
    out.push(R("clipping", tp === null ? "skip" : tp > -0.1 ? "fail" : tp > -1 ? "warn" : "pass", `true peak ${tp ?? "—"} dBTP (≤ −1)`));
    if (!p.audio.expectSilence) {
      const long = (await silences(file, pr.durationSec, -50, 1.5)).filter((s) => s.end - s.start >= 1.5);
      out.push(R("silence-gaps", long.length ? "warn" : "pass", long.length ? `silence: ${long.map((s) => `${s.start.toFixed(1)}–${s.end.toFixed(1)}s`).join(", ")}` : "no pauses ≥1.5 s"));
    }
  }
  const black = await blackFrames(file);
  out.push(R("blank-frames", black.length ? "warn" : "pass", black.length ? `black spans: ${black.map((b) => `${b.start.toFixed(1)}–${b.end.toFixed(1)}s`).join(", ")}` : "none"));
  const frozen = await freezes(file, pr.durationSec);
  out.push(R("frozen-frames", frozen.length ? "warn" : "pass", frozen.length ? `static ≥2 s: ${frozen.map((b) => `${b.start.toFixed(1)}–${b.end.toFixed(1)}s`).join(", ")}` : "none"));
  return out;
};

/** Text that will be on screen must fit its slot (measured with the same TTF) and pass fact/anti-slop lint. */
export const textChecks = async (p: VideoProps, b: Brand, final: boolean): Promise<Result[]> => {
  const out: Result[] = [];
  const missing = checkMedia(p);
  const fontsMissing = b.tokens.fonts.files.filter((f) => !exists(path.join(ROOT, f.path)));
  out.push(R("missing-assets", missing.length ? "fail" : "pass", missing.length ? missing.join(", ") : "all assets present"));
  out.push(R("fonts", fontsMissing.length ? "fail" : "pass", fontsMissing.length ? `missing files: ${fontsMissing.map((f) => f.path).join(", ")}` : "brand font files present; FontGuard checks loading in frame (the render fails on a fallback)"));
  const cfg = await readValidated(path.join(ROOT, "config", "platforms.json"), PlatformsConfig);
  const slots = computeSlots(p.format, combinedMargins(cfg, p.format, p.platforms));
  if (p.captions) {
    const st = b.tokens.captionStyles[p.captions.mode];
    const m = measurer(b.tokens, { family: "sans", weight: st.accentWeight, size: scaleType(st.size, p.format), letterSpacing: b.tokens.type.caption.letterSpacing });
    const over = p.captions.pages.flatMap((pg) => pg.lines.map((l) => ({ t: l.words.map((w) => w.text).join(" "), w: m(l.words.map((w) => w.text).join(" ")) + l.step * st.stepIndent }))).filter((x) => x.w > slots.captionBand.w + 2);
    out.push(R("caption-overflow", over.length ? "fail" : "pass", over.length ? over.map((o) => `“${o.t}” ${Math.round(o.w)}px > ${slots.captionBand.w}px`).join("; ") : `all lines ≤ ${slots.captionBand.w}px`));
    out.push(R("caption-timing", p.captions.timingSource === "estimated" ? (final ? "fail" : "warn") : "pass", p.captions.timingSource === "estimated" ? "estimated timing (before speech is recorded)" : "from real speech"));
  }
  const hl = b.tokens.type.headline;
  const mh = measurer(b.tokens, { family: hl.family, weight: 700, size: scaleType(hl.size, p.format), letterSpacing: hl.letterSpacing });
  const longWords = p.accents.flatMap((a) => a.text.split(/\s+/).filter((w) => mh(w) * (a.size === "xl" ? 1.25 : a.size === "m" ? 0.75 : 1) > slots.headline.w));
  out.push(R("accent-overflow", longWords.length ? "fail" : "pass", longWords.length ? `words do not fit: ${longWords.join(", ")}` : "the longest accent words fit"));
  const texts = [...p.accents.map((a) => a.text), ...p.scenes.flatMap((s) => (s.kind === "title" ? s.lines.map((l) => l.text) : s.kind === "cta" ? [s.text, s.sub ?? ""] : s.kind === "feature" ? [s.title, s.text] : []))].join("\n");
  const lint = lintPublicText(texts, "on-screen", await loadBannedRules(), b);
  out.push(R("claims-on-screen", lint.some((l) => l.level === "error") ? "fail" : lint.length ? "warn" : "pass", lint.map((l) => l.message).join("; ") || "no forbidden or unconfirmed claims"));
  const unclear = (p.captions?.pages ?? []).some((pg) => pg.lines.some((l) => l.words.some((w) => /\[inaudible\]/i.test(w.text))));
  out.push(R("unclear-speech", unclear ? "fail" : "pass", unclear ? "captions contain [inaudible]" : "none"));
  return out;
};
