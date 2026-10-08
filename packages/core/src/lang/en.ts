import { digitSyllables, type LanguagePack } from "./types";

const words = (s: string) => new Set(s.split(/\s+/).filter(Boolean));

/** Vowel groups minus a silent final "e" ("make" = 1, "table" = 2). */
const syllables = (word: string): number => {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return digitSyllables(word);
  if (w.length <= 3) return 1;
  const trimmed = w.replace(/(?:[^laeiouy]es|[^laeiouy]ed|[^laeiouy]e)$/, (m) => m.slice(0, 1)).replace(/^y/, "");
  const groups = trimmed.match(/[aeiouy]+/g);
  return Math.max(1, groups ? groups.length : 1);
};

const SUFFIXES = ["ational", "ization", "fulness", "ousness", "iveness", "ingly", "ments", "ment", "ness", "tion", "sion", "able", "ible", "ally", "ings", "ing", "edly", "ies", "ied", "ers", "est", "ed", "er", "ly", "es", "s"];
const stem = (w: string): string => {
  for (const s of SUFFIXES) if (w.length - s.length >= 3 && w.endsWith(s)) return w.slice(0, -s.length);
  return w;
};

export const en: LanguagePack = {
  id: "en",
  proclitics: words(`
    a an the to of in on at by for from with into onto about over under after before between through without
    as not no never don't doesn't didn't can't won't isn't aren't wasn't weren't couldn't shouldn't wouldn't
    my your his her its our their this that these those very so too more most just
    and or but if than
  `),
  enclitics: new Set(),
  glue: /(^|[\s("“])(a|an|the|to|of|in|on|at|by|for|I|not|no|my|your|our|is|and|or)\s+/giu,
  stopwords: words(`
    a an the and or but if then so to of in on at by for from with into about as is are was were be been being
    it its this that these those i me my we our you your he she they them their his her not no do does did
    have has had can could will would just very really also how why what when where who which there here
  `),
  stem,
  syllables,
  defaultSyllablesPerSec: 4.6,
  asrLanguage: "en",
};
