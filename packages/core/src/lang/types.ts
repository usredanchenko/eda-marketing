import { z } from "zod";

export const LanguageId = z.enum(["en", "ru"]);
export type LanguageId = z.infer<typeof LanguageId>;

/**
 * Everything language-specific in the caption engine, estimated timing and content memory.
 * Selected by `brand.json → language`. Add a language = add one pack + one banned-phrases file.
 */
export interface LanguagePack {
  id: LanguageId;
  /** Attach to the NEXT word on screen: articles, prepositions, negations, short conjunctions. */
  proclitics: Set<string>;
  /** Attach to the PREVIOUS word on screen: particles. */
  enclitics: Set<string>;
  /** Short words glued to the next word with a non-breaking space in big titles. */
  glue: RegExp;
  stopwords: Set<string>;
  stem: (word: string) => string;
  syllables: (word: string) => number;
  /** Typical calm speaking rate, used until `captions calibrate` measures the creator. */
  defaultSyllablesPerSec: number;
  /** Language code passed to faster-whisper. */
  asrLanguage: string;
}

/** Digits count as one syllable each when a token has no vowels (e.g. "2026"). */
export const digitSyllables = (word: string): number =>
  /\d/.test(word) ? Math.max(1, word.replace(/\D/g, "").length) : 1;
