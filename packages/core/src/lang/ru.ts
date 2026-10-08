import { digitSyllables, type LanguagePack } from "./types";

const words = (s: string) => new Set(s.split(/\s+/).filter(Boolean));

const syllables = (word: string): number => {
  const m = word.match(/[аеёиоуыэюя]/gi);
  return m ? m.length : digitSyllables(word);
};

export const ru: LanguagePack = {
  id: "ru",
  // Negation carries meaning: «не можешь» must never become «можешь» on screen.
  proclitics: words(`
    не ни в во на с со к ко у о об обо от ото до из изо за по под подо над надо при про для без безо
    через между перед передо сквозь среди из-за из-под а и но да или что чтобы как уже ещё еще очень
    самый самая самое
  `),
  enclitics: words("бы б же ж ли ль"),
  glue: /(^|[\s(«])(не|ни|в|во|на|с|со|к|ко|у|о|об|от|до|из|за|по|под|над|при|про|для|без|и|а|но|да|же|бы|ли|что|как|я|мы|ты|вы)\s+/giu,
  stopwords: words(`
    и в во не что он на я с со как а то все она так его но да ты к у же вы за бы по только ее мне было вот от
    меня еще нет о из ему теперь когда даже ну вдруг ли если уже или ни быть был него до вас нибудь опять уж
    вам ведь там потом себя ничего ей может они тут где есть надо ней для мы тебя их чем была сам чтоб без
    будто чего раз тоже себе под будет ж тогда кто этот того потому этого какой совсем ним здесь этом один
    почти мой тем чтобы нее сейчас были куда зачем всех никогда можно при наконец два об другой хоть после
    над больше тот через эти нас про всего них какая много разве три эту моя впрочем хорошо свою этой перед
    иногда лучше чуть том нельзя такой им более всегда конечно всю между это моей моего свой своей вообще
    очень просто почему
  `),
  // Light stemming: Russian endings are short, a 5-letter prefix groups most word forms.
  stem: (w) => (w.length > 5 ? w.slice(0, 5) : w),
  syllables,
  defaultSyllablesPerSec: 4.8,
  asrLanguage: "ru",
};

/** Cyrillic → Latin for slugs (package ids stay ASCII whatever the topic language). */
export const RU_TRANSLIT: Record<string, string> = Object.fromEntries(
  [..."абвгдеёжзийклмнопрстуфхцчшщъыьэюя"].map((c, i) => [
    c,
    ["a", "b", "v", "g", "d", "e", "e", "zh", "z", "i", "y", "k", "l", "m", "n", "o", "p", "r", "s", "t", "u", "f", "h", "ts", "ch", "sh", "sch", "", "y", "", "e", "yu", "ya"][i],
  ]),
);
