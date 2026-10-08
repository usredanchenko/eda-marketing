import { describe, expect, it } from "vitest";
import { atomize, atomText, estimateBlock, paginate, slugify, syllables, typograph } from "@mos/core";
import { words } from "./helpers";

const measure = (t: string) => t.length * 30;
const ru = (text: string) => atomize(words(text), [], "ru").map(atomText);

describe("Russian language pack", () => {
  it("never separates «не» from the next word", () => {
    expect(ru("Ты не можешь это бросить")).toContain("не можешь");
    expect(ru("Ты не можешь это бросить")).not.toContain("можешь");
  });

  it("keeps prepositions, numbers with units and particles together", () => {
    expect(ru("Я работал в поддержке")).toContain("в поддержке");
    expect(ru("Это 14 заявок подряд")).toContain("14 заявок");
    expect(ru("Сделал бы иначе")).toContain("Сделал бы");
  });

  it("never ends a line on «не» under width pressure", () => {
    const pages = paginate(words("Я правда не понимаю зачем это всё"), { mode: "replace", maxWidthPx: 330, measure, language: "ru" });
    const lines = pages.flatMap((p) => p.lines.map((l) => l.words.map((w) => w.text).join(" ")));
    expect(lines.some((l) => /\sне$|^не$/.test(l))).toBe(false);
  });

  it("counts Russian syllables by vowels and estimates timing", () => {
    expect(syllables("таймер")).toBe(2);
    expect(estimateBlock("Я сделал таймер для одной задачи.", 0, 3, 4.8).overflowSec).toBe(0);
  });

  it("transliterates topics into stable slugs and glues short words in titles", () => {
    expect(slugify("Зачем ещё один таймер")).toBe("zachem-esche-odin-taymer");
    expect(typograph("Мне нужен свой — для своих", "ru")).toBe("Мне нужен свой — для своих");
  });
});
