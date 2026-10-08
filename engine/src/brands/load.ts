import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  BrandConfig,
  BrandId,
  FactsFile,
  Tokens,
  type BrandConfig as BrandConfigT,
  type FactsFile as FactsFileT,
  type Tokens as TokensT,
} from "@mos/core";
import { exists, readValidated, ValidationError } from "../lib/fsx";
import { P, ROOT } from "../lib/paths";

export const BRAND_DOCS = [
  "BRAND.md",
  "AUDIENCE.md",
  "POSITIONING.md",
  "CONTENT_PILLARS.md",
  "TONE_OF_VOICE.md",
  "FORBIDDEN_CLAIMS.md",
  "MOTION_LANGUAGE.md",
] as const;

export interface Brand {
  id: BrandId;
  dir: string;
  config: BrandConfigT;
  facts: FactsFileT;
  tokens: TokensT;
}

/** Brand folders under brands/ (folders starting with "_" are scaffolds, not brands). */
export const listBrands = (root = ROOT): BrandId[] => {
  const dir = path.join(root, "brands");
  if (!exists(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_") && exists(path.join(dir, d.name, "brand.json")))
    .map((d) => d.name)
    .filter((n) => BrandId.safeParse(n).success)
    .sort();
};

/** Accepts the folder id or any spelling listed in brand.json → names.spellings. */
export const parseBrandId = (raw: string, root = ROOT): BrandId => {
  const q = raw.trim().toLowerCase();
  const known = listBrands(root);
  if (known.includes(q)) return q;
  for (const id of known) {
    try {
      const cfg = JSON.parse(readFileSync(path.join(root, "brands", id, "brand.json"), "utf8")) as { names?: { spellings?: string[]; working?: string } };
      const names = [cfg.names?.working ?? "", ...(cfg.names?.spellings ?? [])].map((x) => x.toLowerCase());
      if (names.includes(q)) return id;
    } catch {
      // an invalid brand.json is reported by loadBrand / brand validate
    }
  }
  const hint = known.length ? `known: ${known.join(", ")}` : "no brands yet — run `npm run mos -- brand new <id>`";
  throw new ValidationError("brand", [`unknown brand "${raw}" (${hint})`]);
};

/** Loads and validates one brand. Missing docs and cross-brand ids are errors: brands must never mix. */
export const loadBrand = async (raw: string, root = ROOT): Promise<Brand> => {
  const id = parseBrandId(raw, root);
  const dir = P.brandDir(id, root);
  const config = await readValidated(path.join(dir, "brand.json"), BrandConfig);
  const facts = await readValidated(path.join(dir, "facts.yaml"), FactsFile);
  const tokens = await readValidated(path.join(dir, "tokens.json"), Tokens);
  const issues: string[] = [];
  if (config.id !== id) issues.push(`brand.json id "${config.id}" ≠ folder "${id}"`);
  if (facts.brand !== id) issues.push(`facts.yaml brand "${facts.brand}" ≠ folder "${id}"`);
  if (tokens.brand !== id) issues.push(`tokens.json brand "${tokens.brand}" ≠ folder "${id}"`);
  const others = listBrands(root).filter((b) => b !== id && !id.startsWith(`${b}-`));
  for (const f of facts.facts) if (others.some((b) => f.id.startsWith(`${b}-`))) issues.push(`fact ${f.id} belongs to another brand`);
  if (!facts.facts.every((f) => f.id.startsWith(`${id}-`))) issues.push(`all fact ids must start with "${id}-"`);
  const dupes = facts.facts.map((f) => f.id).filter((x, i, a) => a.indexOf(x) !== i);
  if (dupes.length) issues.push(`duplicate fact ids: ${dupes.join(", ")}`);
  for (const doc of BRAND_DOCS) if (!exists(path.join(dir, doc))) issues.push(`missing ${doc}`);
  for (const f of tokens.fonts.files) if (!exists(path.join(root, f.path))) issues.push(`font file missing: ${f.path}`);
  if (issues.length) throw new ValidationError(dir, issues);
  return { id, dir, config, facts, tokens };
};

export const factById = (brand: Brand, id: string) => brand.facts.facts.find((f) => f.id === id) ?? null;
