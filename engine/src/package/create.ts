import path from "node:path";
import { GATE_IDS, Manifest, Mode, slugify, TemplateId, pendingGate, type Manifest as ManifestT } from "@mos/core";
import { loadBrand } from "../brands/load";
import { ensureDir, exists, readText, today, writeJson, writeText } from "../lib/fsx";
import { UserError } from "../lib/out";
import { P, ROOT } from "../lib/paths";

export const PACKAGE_DOCS = [
  "BRIEF.md",
  "RESEARCH.md",
  "SCRIPT_REVIEW.md",
  "MOTION_BRIEF.md",
  "EDIT_PLAN.md",
  "SOUND_PLAN.md",
  "QA.md",
  "ANALYTICS_TEMPLATE.md",
] as const;

const SUBDIRS = ["data", "captions", "transcript", "renders", "qa", "video/captions", "video/footage", "video/audio", "video/motion"];

export interface CreateOptions {
  brand: string;
  topic: string;
  mode?: string;
  template?: string;
  date?: string;
  demo?: boolean;
  root?: string;
}

const fill = (tpl: string, vars: Record<string, string>) =>
  tpl.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? `{{${k}}}`);

/** Creates content/YYYY-MM-DD-<brand>-<slug>/ with manifest + document skeletons. Never overwrites. */
export const createPackage = async (o: CreateOptions): Promise<{ id: string; dir: string; manifest: ManifestT }> => {
  const root = o.root ?? ROOT;
  const brand = await loadBrand(o.brand, root);
  const date = o.date ?? today();
  const id = `${date}-${brand.id}-${slugify(o.topic)}`;
  const dir = P.pkgDir(id, root);
  if (exists(dir)) throw new UserError(`package already exists: content/${id} (not overwriting)`, 2);
  const mode = Mode.parse(o.mode ?? brand.config.defaults.mode);
  const template = TemplateId.parse(o.template ?? brand.config.defaults.template);
  const manifest: ManifestT = Manifest.parse({
    schemaVersion: 1,
    id,
    brand: brand.id,
    topic: o.topic,
    created: date,
    mode,
    stage: "brief",
    template,
    formats: brand.config.defaults.formats,
    platforms: brand.config.defaults.platforms,
    campaignId: null,
    demo: Boolean(o.demo),
    gates: Object.fromEntries(GATE_IDS.map((g) => [g, pendingGate()])),
    motionBriefs: {},
    selected: { ideaId: null, hookId: null },
    published: [],
    notes: [],
  });
  for (const sub of SUBDIRS) await ensureDir(path.join(dir, sub));
  await writeJson(path.join(dir, "manifest.json"), manifest);
  const vars: Record<string, string> = {
    id,
    brand: brand.id,
    brandName: brand.config.names.public ?? brand.config.names.working,
    topic: o.topic,
    date,
    mode,
    template,
    duration: brand.config.defaults.durationSec.join("–"),
    captionMode: brand.config.defaults.captionMode,
    platforms: brand.config.defaults.platforms.join(", "),
    formats: brand.config.defaults.formats.join(", "),
    ctaEditorial: brand.config.cta.editorial.join(" / "),
    ctaSpoken: brand.config.cta.spoken.join(" / "),
  };
  for (const doc of PACKAGE_DOCS) {
    const tpl = await readText(path.join(root, "workflows", "templates", doc));
    await writeText(path.join(dir, doc), fill(tpl, vars));
  }
  return { id, dir, manifest };
};
