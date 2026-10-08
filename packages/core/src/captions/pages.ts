import type { Rect01 } from "../schemas/common";
import type { CaptionMode } from "../schemas/common";
import type { CaptionPage } from "../schemas/video";
import type { LanguageId } from "../lang";
import { atomize, atomText, endsClause, endsSentence, type Atom, type TimedWord } from "./atoms";

export interface PaginateOptions {
  mode: CaptionMode;
  /** Width available for one caption line in px (measured with the real font). */
  maxWidthPx: number;
  measure: (text: string) => number;
  protectedPhrases?: string[];
  language?: LanguageId;
  minPageMs?: number;
  holdMs?: number;
  pauseBreakMs?: number;
  longPauseMs?: number;
}

const LINES: Record<CaptionMode, number> = { replace: 2, accumulate: 3, highlight: 2 };

const lastWord = (a: Atom) => a.words[a.words.length - 1];

/**
 * Splits timed words into caption pages:
 * replace    — short meaning groups replace each other (reference style A)
 * accumulate — groups stack into a stepped block until the sentence ends (style B)
 * highlight  — fuller pages, the active word is highlighted at render time
 */
export const paginate = (words: TimedWord[], o: PaginateOptions): Omit<CaptionPage, "slot">[] => {
  const atoms = atomize(words, o.protectedPhrases ?? [], o.language ?? "en");
  const maxLines = LINES[o.mode];
  const pauseBreak = o.pauseBreakMs ?? 250;
  const longPause = o.longPauseMs ?? 700;
  const pages: Atom[][][] = [];
  let page: Atom[][] = [];
  let line: Atom[] = [];

  const closeLine = () => {
    if (line.length) page.push(line);
    line = [];
  };
  const closePage = () => {
    closeLine();
    if (page.length) pages.push(page);
    page = [];
  };

  atoms.forEach((atom, i) => {
    const candidate = [...line, atom].map(atomText).join(" ");
    if (line.length && o.measure(candidate) > o.maxWidthPx) {
      closeLine();
      if (page.length >= maxLines) closePage();
    }
    line.push(atom);
    const next = atoms[i + 1];
    const end = lastWord(atom);
    const gap = next ? next.words[0].startMs - end.endMs : Infinity;
    if (!next || endsSentence(end.text) || gap >= longPause) return closePage();
    const soft = endsClause(end.text) || gap >= pauseBreak;
    if (!soft) return;
    if (o.mode === "replace") return closePage();
    closeLine();
    if (page.length >= maxLines) closePage();
  });
  closePage();

  const minPage = o.minPageMs ?? 600;
  const hold = o.holdMs ?? 250;
  return pages.map((p, idx) => {
    const flat = p.flat();
    const startMs = flat[0].words[0].startMs;
    const lastEnd = lastWord(flat[flat.length - 1]).endMs;
    const nextStart = pages[idx + 1]?.[0]?.[0]?.words[0].startMs ?? Infinity;
    const endMs = Math.min(Math.max(lastEnd + hold, startMs + minPage), nextStart);
    return {
      startMs,
      endMs: Math.max(endMs, lastEnd),
      lines: p.map((l, li) => ({
        step: o.mode === "accumulate" ? li : 0,
        // a group (e.g. "can't stop", "in the office") is revealed at once, at its first word
        words: l.flatMap((a) => a.words.map((w) => ({ ...w, startMs: a.words[0].startMs }))),
      })),
    };
  });
};

const overlaps = (a: Rect01, b: Rect01) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** Moves a page to the alternative band when a UI zone (phone UI, ticket, callout) covers the main band. */
export const assignSlots = (
  pages: Omit<CaptionPage, "slot">[],
  bands: { captionBand: Rect01 },
  zones: { rect: Rect01; fromSec: number; toSec: number }[],
): CaptionPage[] =>
  pages.map((p) => {
    const blocked = zones.some(
      (z) => z.fromSec * 1000 < p.endMs && p.startMs < z.toSec * 1000 && overlaps(z.rect, bands.captionBand),
    );
    return { ...p, slot: blocked ? "captionBandAlt" : "captionBand" };
  });

/**
 * Pages hidden while a spoken big accent covers most of them (≥60% of the page time), so one phrase is
 * never shown twice. Tolerant to millisecond rounding between estimated words and accent timing.
 */
export const suppressDuringAccents = (
  pages: CaptionPage[],
  accents: { from: number; duration: number; spoken: boolean; slot: string }[],
): CaptionPage[] =>
  pages.filter(
    (p) =>
      !accents.some((a) => {
        if (!a.spoken) return false;
        const overlap = Math.min(p.endMs, (a.from + a.duration) * 1000) - Math.max(p.startMs, a.from * 1000);
        return overlap >= 0.6 * (p.endMs - p.startMs);
      }),
  );
