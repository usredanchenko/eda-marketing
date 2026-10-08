import type { Command } from "commander";
import { info, ok } from "../lib/out";
import { loadPackage, readProps } from "../package/load";
import { indexFootage } from "../video/footage";
import { writeTimelineManifest } from "../video/manifest";
import { registerCompositions } from "../video/register";
import { renderPackage, renderStill } from "../video/render";
import { runQa } from "../qa/run";

export const registerVideo = (program: Command) => {
  const video = program.command("video").description("Remotion: composition registry, timeline manifest, stills, render");

  video
    .command("register")
    .description("Generate the Remotion composition registry from content/*/video/props*.json")
    .action(async () => {
      const e = await registerCompositions();
      ok(`package compositions: ${e.length}`);
    });

  video
    .command("manifest <package>")
    .description("Write video/timeline-manifest.json (source → timeline, seconds and frames) from props.json")
    .action(async (q: string) => {
      const pkg = await loadPackage(q);
      await writeTimelineManifest(pkg, await readProps(pkg));
      ok(pkg.rel("video", "timeline-manifest.json"));
    });

  video
    .command("still <package> <frame>")
    .description("Render one frame to renders/stills/")
    .action(async (q: string, frame: string) => {
      const pkg = await loadPackage(q);
      ok(await renderStill(pkg, Number(frame), pkg.abs("renders", "stills", `frame-${frame}.png`)));
    });

  video
    .command("render <package>")
    .description("Render: --draft (default) or --final (only after the finalRender gate). Runs QA afterwards")
    .option("--final", "final render")
    .option("--format <f>", "9x16 | 1x1 | 4x5 | 16x9")
    .option("--frames <range>", "frame range, e.g. 0-59")
    .option("--no-qa", "skip automatic QA")
    .action(async (q: string, o: { final?: boolean; format?: string; frames?: string; qa: boolean }) => {
      const pkg = await loadPackage(q);
      await writeTimelineManifest(pkg, await readProps(pkg, o.format));
      const out = await renderPackage(pkg, { kind: o.final ? "final" : "draft", format: o.format, frames: o.frames });
      ok(`render: ${out}`);
      if (o.qa) {
        const r = await runQa(pkg, out, { partial: Boolean(o.frames) });
        info(`QA: ${r.summary}`);
      }
    });

  program
    .command("footage <package>")
    .description("Ingest sources from input/: metadata, proxies (if needed), speech/silence, cuts. Originals are never changed")
    .option("--from <dir>", "folder inside input/", "input")
    .action(async (q: string, o: { from: string }) => {
      const idx = await indexFootage(await loadPackage(q), o.from);
      idx.entries.forEach((e) => info(`${e.id}: ${e.probe.width}x${e.probe.height} ${e.probe.fps}fps ${e.probe.durationSec}s${e.proxy ? " → proxy" : ""}`));
      ok(`sources: ${idx.entries.length} → video/footage/index.json`);
    });
};
