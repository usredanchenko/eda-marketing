import type { Command } from "commander";
import { GATE_IDS, Stage, type GateId } from "@mos/core";
import { loadBrand } from "../brands/load";
import { scoreIdeas } from "../checks/ideas";
import { checkScript, type Finding } from "../checks/script";
import { validatePackage } from "../checks/validate";
import { writeJson } from "../lib/fsx";
import { fail, head, info, ok, UserError, warn } from "../lib/out";
import { createPackage } from "../package/create";
import { dataPath, listPackageIds, loadPackage, readData, readDataIfAny, saveManifest } from "../package/load";
import { renderAllMd } from "../package/render";

export const report = (findings: Finding[], strict = true) => {
  const errors = findings.filter((f) => f.level === "error");
  findings.forEach((f) => (f.level === "error" ? fail : warn)(`${f.where}: ${f.message}`));
  if (errors.length && strict) throw new UserError(`${errors.length} errors`, 1);
  ok(`errors: ${errors.length}, warnings: ${findings.length - errors.length}`);
};

export const registerPackage = (program: Command) => {
  program
    .command("new <brand> <topic>")
    .description("Create a video package content/YYYY-MM-DD-<brand>-<slug>/")
    .option("--mode <mode>", "quick | standard | production | deep")
    .option("--template <id>", "Remotion template (default from brand.json)")
    .option("--date <YYYY-MM-DD>")
    .option("--demo", "mark as a demo")
    .action(async (brand: string, topic: string, o: { mode?: string; template?: string; date?: string; demo?: boolean }) => {
      const r = await createPackage({ brand, topic, ...o });
      ok(`content/${r.id}`);
      info(`mode ${r.manifest.mode}, template ${r.manifest.template}. Next: fill in BRIEF.md (unknowns only).`);
    });

  program
    .command("status [package]")
    .description("Package status: stage and gates")
    .action(async (q?: string) => {
      const ids = q ? [(await loadPackage(q)).id] : await listPackageIds();
      if (!ids.length) info("no packages yet: npm run mos -- new <brand> \"topic\"");
      for (const id of ids) {
        const p = await loadPackage(id);
        const g = p.manifest.gates;
        const mark = (k: GateId) => (g[k].status === "approved" ? "✔" : g[k].status === "rejected" ? "✖" : "·");
        info(`${id}  [${p.manifest.stage}]  ${GATE_IDS.map((k) => `${mark(k)}${k}`).join(" ")}`);
      }
    });

  program
    .command("validate [package]")
    .description("Validate package(s): schemas, facts, script, props, assets present")
    .option("--all", "all packages")
    .action(async (q: string | undefined, o: { all?: boolean }) => {
      const ids = o.all || !q ? await listPackageIds() : [q];
      let missing = 0;
      for (const id of ids) {
        const pkg = await loadPackage(id);
        head(pkg.id);
        const r = await validatePackage(pkg);
        missing += r.missing.length;
        report(r.findings, false);
        if (r.findings.some((f) => f.level === "error") && !missing) process.exitCode = 1;
      }
      if (missing) throw new UserError(`missing assets: ${missing}`, 2);
    });

  program
    .command("md <package>")
    .description("Generate Markdown (IDEAS, HOOKS, SCRIPT, SHOTLIST, ASSETS, PUBLISH, captions/*) from data/*.json")
    .action(async (q: string) => (await renderAllMd(await loadPackage(q))).forEach((f) => ok(f)));

  program
    .command("approve <package> <gate>")
    .description(`Record the user's decision: ${GATE_IDS.join(" | ")} | motion:<segment>`)
    .requiredOption("--quote <text>", "the user's verbatim words")
    .option("--by <who>", "user | delegated", "user")
    .option("--reject", "reject")
    .action(async (q: string, gate: string, o: { quote: string; by: "user" | "delegated"; reject?: boolean }) => {
      const pkg = await loadPackage(q);
      const value = { status: o.reject ? "rejected" : "approved", at: new Date().toISOString(), quote: o.quote, by: o.by } as const;
      if (gate.startsWith("motion:")) pkg.manifest.motionBriefs[gate.slice(7)] = value;
      else if ((GATE_IDS as readonly string[]).includes(gate)) pkg.manifest.gates[gate as GateId] = value;
      else throw new UserError(`unknown gate ${gate}`);
      await saveManifest(pkg);
      ok(`${gate}: ${value.status} («${o.quote}»)`);
    });

  program
    .command("stage <package> <stage>")
    .description("Move the package to a stage")
    .action(async (q: string, stage: string) => {
      const pkg = await loadPackage(q);
      pkg.manifest.stage = Stage.parse(stage);
      await saveManifest(pkg);
      ok(`${pkg.id}: ${stage}`);
    });

  program
    .command("ideas <package>")
    .description("Score ≥10 ideas on 9 criteria (brand weights), flag duplicates, recompute the top")
    .action(async (q: string) => {
      const pkg = await loadPackage(q);
      const brand = await loadBrand(pkg.manifest.brand);
      const r = await scoreIdeas(await readData(pkg, "ideas"), brand.config.ideaWeights, brand.id, pkg.id);
      await writeJson(dataPath(pkg, "ideas"), r.file);
      r.warnings.forEach((w) => warn(w));
      [...r.file.ideas].sort((a, b) => b.total - a.total).slice(0, 5).forEach((i) => info(`${i.total}  ${i.id} ${i.title}`));
    });

  program
    .command("script <package>")
    .description("Check the script: speech rate, block joins, banned phrases, facts, hook payoff")
    .action(async (q: string) => {
      const pkg = await loadPackage(q);
      const brand = await loadBrand(pkg.manifest.brand);
      report(await checkScript(await readData(pkg, "script"), brand, await readDataIfAny(pkg, "hooks")));
    });

  program
    .command("published <package>")
    .description("Record a publication (done by the user)")
    .requiredOption("--platform <p>", "tiktok | instagram | youtube")
    .option("--url <url>")
    .option("--video-id <id>")
    .option("--date <YYYY-MM-DD>")
    .action(async (q: string, o: { platform: "tiktok" | "instagram" | "youtube"; url?: string; videoId?: string; date?: string }) => {
      const pkg = await loadPackage(q);
      pkg.manifest.published.push({ platform: o.platform, url: o.url ?? null, videoId: o.videoId ?? null, date: o.date ?? new Date().toISOString().slice(0, 10) });
      pkg.manifest.stage = "published";
      await saveManifest(pkg);
      ok(`${pkg.id}: published on ${o.platform}`);
    });
};
