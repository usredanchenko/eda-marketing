import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { confidenceFor, similarity, slugify, summarize, verdict } from "@mos/core";
import { parseCount, parseCsv, parseDuration, parsePercent } from "../engine/src/analytics/csv";
import { scoreIdea } from "../engine/src/checks/ideas";
import { createPackage, PACKAGE_DOCS } from "../engine/src/package/create";
import { tempRoot } from "./helpers";

describe("content package", () => {
  it("creates the package skeleton and refuses to overwrite", async () => {
    const root = await tempRoot();
    const r = await createPackage({ brand: "acme-focus", topic: "Why one timer beats a growing to-do list", date: "2026-10-08", root });
    expect(r.id).toBe("2026-10-08-acme-focus-why-one-timer-beats-a-growing-to-do-list");
    for (const doc of PACKAGE_DOCS) expect(existsSync(path.join(r.dir, doc))).toBe(true);
    expect(existsSync(path.join(r.dir, "video", "motion"))).toBe(true);
    expect(r.manifest.gates.productionApproved.status).toBe("pending");
    await expect(createPackage({ brand: "acme-focus", topic: "Why one timer beats a growing to-do list", date: "2026-10-08", root })).rejects.toThrow();
  });

  it("turns topics into stable ASCII slugs", () => {
    expect(slugify("Why I'm building *another* timer app?")).toBe("why-i-m-building-another-timer-app");
  });
});

describe("idea scoring and content memory", () => {
  it("inverts production complexity", () => {
    const w = { relevance: 1, novelty: 1, audienceFit: 1, visualPotential: 1, emotionalPotential: 1, storytellingPotential: 1, productionComplexity: 1, authenticity: 1, productRelevance: 1 };
    const s = { relevance: 4, novelty: 4, audienceFit: 4, visualPotential: 4, emotionalPotential: 4, storytellingPotential: 4, productionComplexity: 1, authenticity: 4, productRelevance: 4 };
    expect(scoreIdea(s, w)).toBeGreaterThan(scoreIdea({ ...s, productionComplexity: 5 }, w));
  });

  it("detects repeated topics without paid embeddings", () => {
    const a = "Why I am building my own focus timer";
    expect(verdict(similarity(a, "Building my own focus timer app"))).not.toBe("new");
    expect(verdict(similarity(a, "How video calls work in a messenger"))).toBe("new");
  });
});

describe("analytics", () => {
  it("parses platform number formats and never turns blanks into zeros", () => {
    expect(parseCount("1,2K")).toBe(1200);
    expect(parseCount("12 345")).toBe(12345);
    expect(parseCount("")).toBeNull();
    expect(parsePercent("45%")).toBe(0.45);
    expect(parseDuration("1:02")).toBe(62);
    expect(parseCsv('Video ID;Views\n"7";"1,5K"\n')).toEqual([{ "Video ID": "7", Views: "1,5K" }]);
  });

  it("gives no conclusion for tiny samples", () => {
    expect(confidenceFor(2)).toBe("none");
    expect(confidenceFor(4)).toBe("insufficient");
    expect(confidenceFor(12)).toBe("medium");
    const rows = [{ k: "a", v: 1 }, { k: "a", v: null }, { k: "b", v: 3 }];
    const g = summarize(rows, (r) => r.k, (r) => r.v);
    expect(g.find((x) => x.key === "a")?.n).toBe(1);
  });
});
