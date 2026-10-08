import type { Command } from "commander";
import { fail, info, ok, UserError, warn } from "../lib/out";
import { loadPackage } from "../package/load";
import { parseMotionBrief } from "../motion/brief";
import { checkSegment, newSegment, renderSegment } from "../motion/segment";

export const registerMotion = (program: Command) => {
  const motion = program.command("motion").description("HyperFrames segments: brief → project → check → transparent WebM for Remotion");

  motion
    .command("brief <package> <segment>")
    .description("Check that a MOTION_BRIEF.md section is complete (14 fields)")
    .action(async (q: string, id: string) => {
      const pkg = await loadPackage(q);
      const b = await parseMotionBrief(pkg.abs("MOTION_BRIEF.md"), id);
      if (!b.found) throw new UserError(`no section "## Segment: ${id}"`);
      if (b.missing.length) b.missing.forEach((m) => fail(`not filled in: ${m}`));
      else ok("brief complete");
      info(`approval: ${pkg.manifest.motionBriefs[id]?.status ?? "pending"}`);
    });

  motion
    .command("new <package> <segment>")
    .description("Create a segment's HyperFrames project from a brand template (approved brief only)")
    .requiredOption("--template <name>", "folder in video/hyperframes/templates/")
    .requiredOption("--duration <sec>", "segment duration")
    .requiredOption("--scene <id>", "scene in props.json to insert into")
    .option("--var <kv...>", "template variables key=value")
    .action(async (q: string, id: string, o: { template: string; duration: string; scene: string; var?: string[] }) => {
      const parse = (v: string): string | number => (/^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v);
      const vars = Object.fromEntries((o.var ?? []).map((kv) => [kv.slice(0, kv.indexOf("=")), parse(kv.slice(kv.indexOf("=") + 1))]));
      ok(await newSegment(await loadPackage(q), id, o.template, Number(o.duration), o.scene, vars));
    });

  motion
    .command("check <package> <segment>")
    .description("hyperframes check: lint + runtime + layout")
    .action(async (q: string, id: string) => {
      const r = await checkSegment(await loadPackage(q), id);
      const tail = (r.stdout + r.stderr).trim().split("\n").slice(-15).join("\n");
      console.log(tail);
      if (r.code !== 0) throw new UserError("hyperframes check failed");
      ok("check passed");
    });

  motion
    .command("render <package> <segment>")
    .description("Render to transparent WebM (VP9 alpha) with an alpha check; unchanged input comes from cache")
    .option("--force", "re-render")
    .action(async (q: string, id: string, o: { force?: boolean }) => {
      const r = await renderSegment(await loadPackage(q), id, o.force);
      (r.alpha ? ok : warn)(`${r.out}${r.cached ? " (cached)" : ""} · alpha: ${r.alpha ? "yes" : "NO — use the fallback"}`);
    });
};
