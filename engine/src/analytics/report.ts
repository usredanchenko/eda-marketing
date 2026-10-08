import path from "node:path";
import { summarize, type AnalyticsRecord, type ConfidenceThresholds, type GroupSummary } from "@mos/core";
import { readJsonl, readYaml, today, writeText } from "../lib/fsx";
import { ROOT } from "../lib/paths";
import { MEMORY_INDEX, type MemoryItem } from "../memory/index";
import { RECORDS } from "./import";

interface Cfg {
  thresholds: ConfidenceThresholds;
  primaryMetrics: (keyof AnalyticsRecord)[];
  durationBuckets: number[];
}

type Row = AnalyticsRecord & { template: string | null; hookTypeResolved: string | null; durationBucket: string | null };

/** Latest snapshot per (platform, video) joined with content memory (template, hook type). */
export const loadRows = async (): Promise<Row[]> => {
  const cfg = await readYaml<Cfg>(path.join(ROOT, "config", "analytics.yaml"));
  const latest = new Map<string, AnalyticsRecord>();
  for (const r of await readJsonl<AnalyticsRecord>(RECORDS())) {
    const k = `${r.platform}|${r.video_id}`;
    if (!latest.has(k) || latest.get(k)!.snapshot_date < r.snapshot_date) latest.set(k, r);
  }
  const mem = new Map((await readJsonl<MemoryItem>(MEMORY_INDEX())).map((m) => [m.id, m]));
  return [...latest.values()].map((r) => {
    const m = r.package_id ? mem.get(r.package_id) : undefined;
    const b = r.duration === null ? null : cfg.durationBuckets.find((x) => r.duration! <= x);
    return { ...r, template: r.format ?? m?.template ?? null, hookTypeResolved: r.hook_type ?? m?.hookTypes[0] ?? null, durationBucket: r.duration === null ? null : b ? `≤${b}s` : `>${cfg.durationBuckets.at(-1)}s` };
  });
};

const table = (title: string, groups: GroupSummary[]) =>
  [
    `#### ${title}`,
    "",
    "| Group | n | Median | Min–max | Confidence |",
    "|---|---|---|---|---|",
    ...groups.map((g) => `| ${g.key} | ${g.n} | ${g.median ?? "—"} | ${g.min ?? "—"}–${g.max ?? "—"} | ${g.confidence === "none" ? "no conclusion (n<3)" : g.confidence} |`),
    "",
  ].join("\n");

/** Numbers only: interpretation is written by the analytics-review skill under “Conclusions”, respecting confidence. */
export const writeReport = async () => {
  const cfg = await readYaml<Cfg>(path.join(ROOT, "config", "analytics.yaml"));
  const rows = await loadRows();
  const dims: [string, (r: Row) => string | null][] = [
    ["Brand", (r) => r.brand],
    ["Platform", (r) => r.platform],
    ["Hook type", (r) => r.hookTypeResolved],
    ["Template/format", (r) => r.template],
    ["Duration", (r) => r.durationBucket],
    ["CTA", (r) => r.cta],
  ];
  const parts = [`# Analytics report — ${today()}`, "", `Videos (latest snapshot): ${rows.length}. Empty values are not counted as zeros.`, ""];
  for (const metric of cfg.primaryMetrics) {
    const have = rows.filter((r) => typeof r[metric] === "number");
    if (!have.length) continue;
    parts.push(`### Metric: ${String(metric)} (data for ${have.length})`, "");
    for (const [title, key] of dims) parts.push(table(title, summarize(have, key, (r) => r[metric] as number | null, cfg.thresholds)));
  }
  parts.push("## Conclusions", "", "_Filled in by `/analytics-review`: from our data only, with a confidence level. No conclusions for groups with n<3._", "");
  const file = path.join(ROOT, "analytics", "reports", `${today()}.md`);
  await writeText(file, parts.join("\n"));
  return { file, rows: rows.length };
};
