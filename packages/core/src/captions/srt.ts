import { parseSrt, serializeSrt, type Caption } from "@remotion/captions";
import type { CaptionPage } from "../schemas/video";

/**
 * SRT contains SPOKEN words only. Editorial CTAs/accents with spoken=false are never passed here.
 * One page = one cue; lines inside a page become line breaks.
 */
export const pagesToSrt = (pages: CaptionPage[]): string =>
  serializeSrt({
    lines: pages.map((page) => {
      const cue: Caption[] = [];
      page.lines.forEach((line, li) =>
        line.words.forEach((w, wi) => {
          const sep = wi === 0 ? (li === 0 ? "" : "\n") : " ";
          cue.push({ text: sep + w.text, startMs: w.startMs, endMs: w.endMs, timestampMs: null, confidence: null });
        }),
      );
      cue[cue.length - 1] = { ...cue[cue.length - 1], endMs: page.endMs };
      return cue;
    }),
  }) + "\n";

export const srtText = (srt: string): string =>
  parseSrt({ input: srt })
    .captions.map((c) => c.text.replace(/\s+/g, " ").trim())
    .join(" ");

export { parseSrt };
