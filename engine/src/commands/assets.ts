import type { Command } from "commander";
import { importAssets, verifyAssets } from "../assets/provenance";
import { generateExamples } from "../media/examples";
import { synthSfx } from "../media/sfx";
import { fail, info, ok, UserError, warn } from "../lib/out";

export const registerAssets = (program: Command) => {
  const assets = program.command("assets").description("Assets: import with provenance, verify, restore, SFX");

  assets
    .command("import")
    .description("Copy assets listed in assets/sources.json (APFS clones; originals are never changed)")
    .option("--only <ids...>", "only these ids")
    .action(async (o: { only?: string[] }) => {
      const r = await importAssets({ only: o.only });
      ok(`imported/updated: ${r.imported}, unchanged: ${r.skipped.length}`);
      r.missing.forEach((m) => warn(m));
    });

  assets
    .command("restore")
    .description("Restore missing files (heavy media are not in git after a clone)")
    .action(async () => {
      const r = await importAssets({ missingOnly: true });
      ok(`restored: ${r.imported}, already present: ${r.skipped.length}`);
      r.missing.forEach((m) => warn(m));
    });

  assets
    .command("verify")
    .description("Verify files against PROVENANCE.jsonl (presence and sha256)")
    .action(async () => {
      const r = await verifyAssets();
      if (r.problems.length) {
        r.problems.forEach((p) => fail(p));
        throw new UserError(`${r.problems.length} asset problem(s)`, 2);
      }
      ok(`all ${r.checked} files present, hashes match`);
    });

  assets
    .command("examples")
    .description("Generate the fictional example brand's footage and mock screens locally (ffmpeg + Remotion)")
    .option("--force", "regenerate existing files")
    .action(async (o: { force?: boolean }) => {
      const files = await generateExamples(o);
      files.forEach((f) => info(f));
      ok(`example assets: ${files.length} generated`);
    });

  assets
    .command("sfx")
    .description("Synthesize UI sounds locally (ffmpeg lavfi), no licensing questions")
    .action(async () => {
      const files = await synthSfx();
      files.forEach((f) => info(f));
      ok(`SFX: ${files.length}`);
    });
};
