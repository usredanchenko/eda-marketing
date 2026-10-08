import type { Command } from "commander";
import { exists } from "../lib/fsx";
import { fail, ok, UserError, warn } from "../lib/out";
import { loadPackage } from "../package/load";
import { runQa } from "../qa/run";

export const registerQa = (program: Command) =>
  program
    .command("qa <package> [file]")
    .description("Automatic QA of a render (default renders/draft.mp4) → qa/qa-report.json, QA.md, contact sheet")
    .option("--partial", "partial render (skip the duration check)")
    .action(async (q: string, file: string | undefined, o: { partial?: boolean }) => {
      const pkg = await loadPackage(q);
      const target = file ?? (exists(pkg.abs("renders", "final.mp4")) ? pkg.abs("renders", "final.mp4") : pkg.abs("renders", "draft.mp4"));
      if (!exists(target)) throw new UserError(`no render file: ${target}`, 2);
      const r = await runQa(pkg, target, { partial: o.partial });
      r.results.filter((x) => x.status === "fail").forEach((x) => fail(`${x.id}: ${x.detail}`));
      r.results.filter((x) => x.status === "warn").forEach((x) => warn(`${x.id}: ${x.detail}`));
      ok(`QA: ${r.summary} → ${pkg.rel("qa", "qa-report.json")}`);
      if (r.counts.fail) process.exitCode = 1;
    });
