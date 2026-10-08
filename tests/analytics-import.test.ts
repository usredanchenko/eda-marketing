import path from "node:path";
import { describe, expect, it } from "vitest";
import { mapCsv } from "../engine/src/analytics/import";
import { ROOT } from "../engine/src/lib/paths";

describe("analytics import mapping", () => {
  it("maps known columns, reports unknown ones and keeps blanks as null", async () => {
    const r = await mapCsv(path.join(ROOT, "tests/fixtures/tiktok-sample.csv"), "tiktok", "acme-focus");
    expect(r.unmapped).toEqual(["Unknown column"]);
    const [a, b] = r.records;
    expect(a.views).toBe(1200);
    expect(a.shares).toBeNull();
    expect(a.saves).toBeNull();
    expect(a.average_watch_time).toBe(9);
    expect(a.completion_rate).toBeCloseTo(0.31);
    expect(b.shares).toBe(3);
  });
});
