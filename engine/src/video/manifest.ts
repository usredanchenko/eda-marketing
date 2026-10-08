import { secToFrames, type VideoProps } from "@mos/core";
import { writeJson } from "../lib/fsx";
import type { Pkg } from "../package/load";

/**
 * video/timeline-manifest.json — reproducible record of the edit (source → timeline in seconds AND frames).
 * Derived from props.json (single source of truth), never edited by hand.
 */
export const writeTimelineManifest = async (pkg: Pkg, p: VideoProps) => {
  const f = (s: number) => secToFrames(s, p.fps);
  const scenes = p.scenes.map((s) => ({
    id: s.id,
    kind: s.kind,
    layer: s.layer,
    from: s.from,
    duration: s.duration,
    fromFrame: f(s.from),
    durationInFrames: f(s.duration),
    source: "src" in s ? s.src : s.kind === "split" ? [s.a.src, s.b.src] : null,
    sourceIn: s.kind === "footage" ? s.trimStart : null,
    sourceOut: s.kind === "footage" ? s.trimStart + s.duration : null,
    draftNote: s.draftNote,
  }));
  const voice = p.audio.voice.map((v) => ({ source: v.src, sourceIn: v.trimStart, sourceOut: v.trimStart + v.duration, timelineFrom: v.from, fromFrame: f(v.from), durationInFrames: f(v.duration) }));
  await writeJson(pkg.abs("video", "timeline-manifest.json"), {
    generated: "npm run mos -- video manifest (from props.json)",
    packageId: pkg.id,
    format: p.format,
    fps: p.fps,
    durationSec: p.durationSec,
    durationInFrames: f(p.durationSec),
    captions: p.captions ? { mode: p.captions.mode, timingSource: p.captions.timingSource, pages: p.captions.pages.length } : null,
    voice,
    music: p.audio.music,
    sfx: p.audio.sfx.map((s) => ({ ...s, frame: f(s.at) })),
    scenes,
    colorFilters: [],
  });
};
