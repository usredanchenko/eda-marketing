import path from "node:path";
import type { Command } from "commander";
import { AnalyticsRecord, ExperimentsFile, Platform } from "@mos/core";
import { parseBrandId } from "../brands/load";
import { appendRecords, mapCsv, storeRecords } from "../analytics/import";
import { writeReport } from "../analytics/report";
import { readValidated } from "../lib/fsx";
import { info, ok, warn } from "../lib/out";
import { ROOT } from "../lib/paths";
import { rebuildMemory } from "../memory/index";

export const registerAnalytics = (program: Command) => {
  const an = program.command("analytics").description("Analytics: import, manual entry, report, experiments");

  an.command("import <csv>")
    .description("Import a platform CSV export via analytics/mappings/<platform>.yaml (the raw file is kept)")
    .requiredOption("--platform <p>", "tiktok | instagram | youtube")
    .requiredOption("--brand <id>", "brand id")
    .option("--dry-run", "only show the column mapping")
    .action(async (csv: string, o: { platform: string; brand: string; dryRun?: boolean }) => {
      const file = path.resolve(csv);
      const r = await mapCsv(file, Platform.parse(o.platform), parseBrandId(o.brand));
      Object.entries(r.resolved).forEach(([f, h]) => info(`${f} ← «${h}»`));
      if (r.unmapped.length) warn(`unmapped columns (not imported): ${r.unmapped.join(", ")}`);
      if (!r.mappingVerified) warn("mapping not checked against a real export (verified:false) — review the mapping above");
      if (o.dryRun) return info(`rows: ${r.records.length}. Without --dry-run the data will be written.`);
      const s = await storeRecords(file, Platform.parse(o.platform), r.records);
      await rebuildMemory();
      ok(`added ${s.added}, total records ${s.total}`);
    });

  an.command("add <file>")
    .description("Manual entry / transcribed from a screenshot: YAML or JSON with one record (or a list)")
    .action(async (file: string) => {
      const data = await readValidated(path.resolve(file), AnalyticsRecord.array().or(AnalyticsRecord));
      const rows = Array.isArray(data) ? data : [data];
      const s = await appendRecords(rows);
      ok(`added ${s.added}, total ${s.total}`);
    });

  an.command("report")
    .description("Summary tables from our data with sample size and confidence level")
    .action(async () => {
      await rebuildMemory();
      const r = await writeReport();
      ok(`${path.relative(ROOT, r.file)} (videos: ${r.rows})`);
    });

  an.command("experiments")
    .description("Validate and show analytics/experiments.yaml")
    .action(async () => {
      const f = await readValidated(path.join(ROOT, "analytics", "experiments.yaml"), ExperimentsFile);
      f.experiments.forEach((e) => info(`${e.experiment} [${e.status}] ${e.primary_metric}: A=${e.videos.a.length} B=${e.videos.b.length} / min ${e.minimum_sample}`));
      ok(`experiments: ${f.experiments.length}`);
    });
};
