import { packForWord } from "../lang";
import type { TimedWord } from "./atoms";

/**
 * Estimated word timing for a script BEFORE the voice is recorded.
 * Output is always flagged `estimated`; real timing comes from transcription.
 * Never divide a phrase duration by word count — use syllables and punctuation pauses.
 */
/** Syllables by the word's own script, so mixed-language scripts still estimate sensibly. */
export const syllables = (word: string): number => packForWord(word).syllables(word);

export const pauseAfterMs = (word: string): number => {
  const t = word.trim();
  if (/…$|\.\.\.$/.test(t)) return 420;
  if (/[.!?]["»”)]*$/.test(t)) return 320;
  if (/[—–:]$/.test(t)) return 220;
  if (/[,;]["»”)]*$/.test(t)) return 160;
  return 0;
};

/** `*word*` in script speech marks an emphasized word. */
export const parseSpeech = (speech: string): { text: string; emphasis: boolean }[] =>
  speech
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      const emphasis = /^\*.+\*[.,!?:;…»"]*$/.test(raw) || /^\*[^*]+\*/.test(raw);
      return { text: raw.replace(/\*/g, ""), emphasis };
    })
    .filter((w) => w.text.length > 0);

export interface BlockEstimate {
  words: TimedWord[];
  requiredSec: number;
  availableSec: number;
  overflowSec: number;
  wordsPerSec: number;
}

export const estimateBlock = (
  speech: string,
  startSec: number,
  endSec: number,
  syllablesPerSec: number,
  leadMs = 80,
): BlockEstimate => {
  const parsed = parseSpeech(speech);
  const words: TimedWord[] = [];
  let t = startSec * 1000 + leadMs;
  for (const w of parsed) {
    if (/^[—–-]$/.test(w.text)) {
      // A dash is punctuation: keep it visible on the previous word and add a pause.
      const prev = words[words.length - 1];
      if (prev) prev.text = `${prev.text} —`;
      t += 200;
      continue;
    }
    const dur = Math.max(140, (syllables(w.text) / syllablesPerSec) * 1000);
    words.push({ text: w.text, startMs: Math.round(t), endMs: Math.round(t + dur), emphasis: w.emphasis });
    t += dur + pauseAfterMs(w.text);
  }
  const requiredSec = (t - startSec * 1000) / 1000;
  const availableSec = Math.round((endSec - startSec) * 100) / 100;
  return {
    words,
    requiredSec: Math.round(requiredSec * 100) / 100,
    availableSec,
    overflowSec: Math.max(0, Math.round((requiredSec - availableSec) * 100) / 100),
    wordsPerSec: availableSec > 0 ? Math.round((words.length / availableSec) * 100) / 100 : 0,
  };
};
