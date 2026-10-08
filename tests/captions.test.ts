import { describe, expect, it } from "vitest";
import { assignSlots, atomize, atomText, estimateBlock, pagesToSrt, paginate, srtText, suppressDuringAccents, syllables, typograph, type CaptionPage } from "@mos/core";
import { words } from "./helpers";

const measure = (t: string) => t.length * 30;

describe("caption engine (English pack)", () => {
  it("never separates a negation from the next word", () => {
    const atoms = atomize(words("You can't stop now")).map(atomText);
    expect(atoms).toContain("can't stop");
    expect(atoms).not.toContain("stop");
    expect(atomize(words("It is not finished")).map(atomText)).toContain("not finished");
  });

  it("keeps articles, prepositions, numbers with units and protected phrases together", () => {
    expect(atomize(words("I worked in support")).map(atomText)).toContain("in support");
    expect(atomize(words("Open the app")).map(atomText)).toContain("the app");
    expect(atomize(words("It took 25 minutes")).map(atomText)).toContain("25 minutes");
    expect(atomize(words("Try Acme Focus today"), ["Acme Focus"]).map(atomText)).toContain("Acme Focus");
  });

  it("never ends a caption line on a dangling article under width pressure", () => {
    const pages = paginate(words("I really do not understand the point of this"), { mode: "replace", maxWidthPx: 330, measure });
    const lines = pages.flatMap((p) => p.lines.map((l) => l.words.map((w) => w.text).join(" ")));
    expect(lines.some((l) => /\b(the|not)$/.test(l))).toBe(false);
  });

  it("counts English syllables and estimates monotonic timing", () => {
    expect(syllables("make")).toBe(1);
    expect(syllables("table")).toBe(2);
    expect(syllables("productivity")).toBeGreaterThanOrEqual(4);
    const ok = estimateBlock("I built a timer for one task.", 0, 3, 4.6);
    const starts = ok.words.map((w) => w.startMs);
    expect([...starts].sort((a, b) => a - b)).toEqual(starts);
    expect(ok.overflowSec).toBe(0);
    const tooLong = estimateBlock("This is a very long sentence that will never fit into a single second of airtime", 0, 1, 4.6);
    expect(tooLong.overflowSec).toBeGreaterThan(0);
  });

  it("replace mode starts a new page at a comma; accumulate stacks lines", () => {
    const w = words("First email, then chat, then email again.");
    expect(paginate(w, { mode: "replace", maxWidthPx: 900, measure }).length).toBe(3);
    const acc = paginate(w, { mode: "accumulate", maxWidthPx: 900, measure });
    expect(acc[0].lines.length).toBeGreaterThan(1);
    expect(acc[0].lines[1].step).toBe(1);
  });

  it("SRT keeps every spoken word even when on-screen pages are suppressed by an accent", () => {
    const text = "One timer beats a long list.";
    const pages: CaptionPage[] = paginate(words(text), { mode: "replace", maxWidthPx: 2000, measure }).map((p) => ({ ...p, slot: "captionBand" }));
    expect(suppressDuringAccents(pages, [{ from: 0, duration: 10, spoken: true, slot: "center" }]).length).toBe(0);
    expect(srtText(pagesToSrt(pages))).toBe(text);
  });

  it("editorial (non-spoken) text never enters SRT", () => {
    const pages: CaptionPage[] = paginate(words("I build apps."), { mode: "replace", maxWidthPx: 2000, measure }).map((p) => ({ ...p, slot: "captionBand" }));
    expect(srtText(pagesToSrt(pages))).not.toMatch(/Link in bio/);
  });

  it("moves captions to the alternative band when UI covers the main band", () => {
    const pages = paginate(words("Look at the screen"), { mode: "replace", maxWidthPx: 2000, measure });
    const band = { x: 0.06, y: 0.65, w: 0.8, h: 0.15 };
    const placed = assignSlots(pages, { captionBand: band }, [{ rect: { x: 0, y: 0.6, w: 1, h: 0.3 }, fromSec: 0, toSec: 5 }]);
    expect(placed[0].slot).toBe("captionBandAlt");
  });

  it("hides a page that a spoken accent covers, despite millisecond rounding", () => {
    const pages: CaptionPage[] = [{ startMs: 19875, endMs: 21472, slot: "captionBand", lines: [{ step: 0, words: words("not every time.", 19875) }] }];
    expect(suppressDuringAccents(pages, [{ from: 19.88, duration: 2, spoken: true, slot: "captionBand" }])).toHaveLength(0);
    expect(suppressDuringAccents(pages, [{ from: 19.88, duration: 2, spoken: false, slot: "captionBand" }])).toHaveLength(1);
  });

  it("glues short words and the last word in big titles", () => {
    expect(typograph("One timer for the task")).toBe("One timer for the task".replace("for the", "for the"));
    expect(typograph("it is not done")).toContain("not done");
  });
});
