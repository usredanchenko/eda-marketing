import { Easing, interpolate } from "remotion";
import type { BrandCtx } from "./brand";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 entrance progress with the brand ease, starting at `start` (frames). */
export const enter = (c: BrandCtx, frame: number, start = 0, len = c.t.motion.enterFrames) =>
  interpolate(frame, [start, start + len], [0, 1], { ...clamp, easing: Easing.bezier(...c.t.motion.easeOut) });

/** 1→0 exit progress over the last `len` frames before `end`. */
export const exit = (frame: number, end: number, len = 6) => interpolate(frame, [end - len, end], [1, 0], clamp);

/** Slow zoom (Ken Burns / punch-in) across a scene. */
export const zoomAt = (c: BrandCtx, frame: number, duration: number, from: number, to: number) =>
  interpolate(frame, [0, Math.max(1, duration - 1)], [from, to], { ...clamp, easing: Easing.bezier(...c.t.motion.easeInOut) });

export const lin = (frame: number, input: [number, number], output: [number, number]) => interpolate(frame, input, output, clamp);
