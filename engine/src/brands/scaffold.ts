import { cp, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { BrandId, LanguageId } from "@mos/core";
import { exists, ValidationError } from "../lib/fsx";
import { P, ROOT } from "../lib/paths";

/**
 * Creates brands/<id>/ from brands/_template/, replacing __BRAND_ID__, __BRAND_NAME__, __LANGUAGE__ and
 * __TODAY__. Never overwrites an existing brand. The result is a valid brand whose facts are all unconfirmed.
 */
export const scaffoldBrand = async (o: { id: string; name: string; language: string; root?: string }) => {
  const root = o.root ?? ROOT;
  const id = BrandId.parse(o.id);
  const language = LanguageId.parse(o.language);
  const src = path.join(root, "brands", "_template");
  const dir = P.brandDir(id, root);
  if (!exists(src)) throw new ValidationError("brands/_template", ["scaffold not found"]);
  if (exists(dir)) throw new ValidationError(dir, ["brand already exists — not overwriting"]);
  await cp(src, dir, { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  for (const f of await readdir(dir)) {
    const file = path.join(dir, f);
    const text = await readFile(file, "utf8");
    const next = text
      .replaceAll("__BRAND_ID__", id)
      .replaceAll("__BRAND_NAME__", o.name)
      .replaceAll("__LANGUAGE__", language)
      .replaceAll("__TODAY__", today);
    await writeFile(file, next);
  }
  return dir;
};
