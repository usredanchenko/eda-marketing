import { langPack, type LanguageId } from "../lang";

/**
 * Language-aware grouping: words that must never be split across caption lines/pages.
 * A negation carries meaning: "can't do" must never show up as "do" on its own.
 */
export interface TimedWord {
  text: string;
  startMs: number;
  endMs: number;
  emphasis: boolean;
}

export interface Atom {
  words: TimedWord[];
}

const LEADING = /^[«"„“(\[]+/;
const TRAILING = /[»"”).,!?:;…\]]+$/;

export const bareWord = (t: string): string =>
  t.trim().toLowerCase().replace(LEADING, "").replace(TRAILING, "").replace(/\u0451/g, "\u0435").replace(/[’]/g, "'");

export const endsSentence = (t: string): boolean => /[.!?…]["»”)]*$/.test(t.trim());
export const endsClause = (t: string): boolean => /[,;:—–]["»”)]*$/.test(t.trim());
const isDash = (t: string): boolean => /^[—–-]$/.test(t.trim());
const hasDigit = (t: string): boolean => /\d/.test(t);

const phraseTokens = (phrase: string): string[] =>
  phrase.split(/\s+/).map(bareWord).filter(Boolean);

/** Returns link[i] === true when word i must stay with word i+1. */
export const computeLinks = (words: TimedWord[], protectedPhrases: string[] = [], lang: LanguageId = "en"): boolean[] => {
  const { proclitics, enclitics } = langPack(lang);
  const link = words.map(() => false);
  const bares = words.map((w) => bareWord(w.text));
  for (let i = 0; i < words.length - 1; i++) {
    const cur = words[i].text;
    const next = words[i + 1].text;
    if (endsSentence(cur)) continue;
    if (proclitics.has(bares[i]) && !endsClause(cur)) link[i] = true;
    if (enclitics.has(bares[i + 1])) link[i] = true;
    if (isDash(next)) link[i] = true;
    if (hasDigit(cur) && !endsClause(cur)) link[i] = true;
  }
  for (const phrase of protectedPhrases) {
    const toks = phraseTokens(phrase);
    if (toks.length < 2) continue;
    for (let i = 0; i + toks.length <= words.length; i++) {
      if (toks.every((t, j) => bares[i + j] === t)) {
        for (let j = 0; j < toks.length - 1; j++) link[i + j] = true;
      }
    }
  }
  return link;
};

export const atomize = (words: TimedWord[], protectedPhrases: string[] = [], lang: LanguageId = "en"): Atom[] => {
  const link = computeLinks(words, protectedPhrases, lang);
  const atoms: Atom[] = [];
  let cur: TimedWord[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    if (!link[i]) {
      atoms.push({ words: cur });
      cur = [];
    }
  });
  if (cur.length) atoms.push({ words: cur });
  return atoms;
};

export const atomText = (a: Atom): string => a.words.map((w) => w.text).join(" ");
