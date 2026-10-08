import path from "node:path";
import type { Command } from "commander";
import { writeFactsMd } from "../brands/facts-md";
import { listBrands, loadBrand } from "../brands/load";
import { scaffoldBrand } from "../brands/scaffold";
import { writeTokensCss } from "../brands/tokens-css";
import { head, info, ok, warn } from "../lib/out";
import { ROOT } from "../lib/paths";

const allOr = (id?: string) => {
  const ids = id ? [id] : listBrands();
  if (!ids.length) warn("no brands yet — run `npm run mos -- brand new <id> --name \"Name\"`");
  return ids;
};

export const registerBrand = (program: Command) => {
  const brand = program.command("brand").description("Brands: create, validate, facts, tokens");

  brand
    .command("list")
    .description("List brands (folders under brands/ with a brand.json)")
    .action(() => allOr().forEach((b) => info(b)));

  brand
    .command("new <id>")
    .description("Create brands/<id>/ from brands/_template (never overwrites)")
    .requiredOption("--name <name>", "public or working brand name")
    .option("--language <lang>", "language of on-screen text and speech: en | ru", "en")
    .action(async (id: string, o: { name: string; language: string }) => {
      const dir = await scaffoldBrand({ id, name: o.name, language: o.language });
      await writeFactsMd(await loadBrand(id));
      ok(`${path.relative(ROOT, dir)}/ — fill in the brand kit docs, facts.yaml, brand.json and tokens.json, then run brand validate ${id}`);
    });

  brand
    .command("validate [brand]")
    .description("Validate brand.json, facts.yaml, tokens.json, brand kit docs and font files")
    .action(async (id?: string) => {
      for (const b of allOr(id)) {
        const loaded = await loadBrand(b);
        ok(`${loaded.id}: ${loaded.facts.facts.length} facts, ${loaded.tokens.fonts.files.length} font files, language ${loaded.config.language}`);
      }
    });

  brand
    .command("show <brand>")
    .description("Short brand summary for the agent's context")
    .action(async (id: string) => {
      const b = await loadBrand(id);
      head(`${b.config.names.public ?? b.config.names.working} (${b.id}, ${b.config.language})`);
      info(`default template: ${b.config.defaults.template}, ${b.config.defaults.durationSec.join("–")} s, captions: ${b.config.defaults.captionMode}`);
      const by = (s: string) => b.facts.facts.filter((f) => f.status === s).map((f) => f.id).join(", ") || "—";
      info(`PUBLIC_CONFIRMED: ${by("PUBLIC_CONFIRMED")}`);
      info(`INTERNAL: ${by("INTERNAL")}`);
      info(`NEEDS_CONFIRMATION: ${by("NEEDS_CONFIRMATION")}`);
      info(`FORBIDDEN: ${by("FORBIDDEN")}`);
      info(`brand kit: ${path.relative(ROOT, b.dir)}/*.md`);
    });

  brand
    .command("facts [brand]")
    .description("Generate PRODUCT_FACTS.md from facts.yaml")
    .action(async (id?: string) => {
      for (const b of allOr(id)) ok(path.relative(ROOT, await writeFactsMd(await loadBrand(b))));
    });

  program
    .command("tokens [brand]")
    .description("Generate tokens.css for HyperFrames from brands/<id>/tokens.json")
    .action(async (id?: string) => {
      for (const b of allOr(id)) ok(path.relative(ROOT, await writeTokensCss(await loadBrand(b))));
    });
};
