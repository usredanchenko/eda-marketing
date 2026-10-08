import { en } from "./en";
import { ru } from "./ru";
import type { LanguageId, LanguagePack } from "./types";

export * from "./types";

export const LANGUAGE_PACKS: Record<LanguageId, LanguagePack> = { en, ru };
export const langPack = (id: LanguageId = "en"): LanguagePack => LANGUAGE_PACKS[id];

/** Picks the pack by script, for text whose language is unknown (e.g. similarity across brands). */
export const packForWord = (word: string): LanguagePack => (/[а-яё]/i.test(word) ? ru : en);
