import { mediaPaths, TEMPLATE_PRESETS, type VideoProps } from "@mos/core";
import { loadBrand, type Brand } from "../brands/load";
import { exists, ValidationError } from "../lib/fsx";
import { safeResolve } from "../lib/paths";
import { DATA_FILES, hasData, propsPath, readData, readProps, type DataKey, type Pkg } from "../package/load";
import { checkScript, lintPublicText, loadBannedRules, type Finding } from "./script";

/** Cross-checks props against brand facts and the template preset. */
export const checkProps = (p: VideoProps, b: Brand): Finding[] => {
  const out: Finding[] = [];
  const preset = TEMPLATE_PRESETS[p.template];
  if (p.brand !== b.id) out.push({ level: "error", where: "props", message: `brand ${p.brand} ≠ package ${b.id}` });
  for (const s of p.scenes) {
    const where = `scene ${s.id}`;
    if (!preset.allowedKinds.includes(s.kind)) out.push({ level: "warn", where, message: `${s.kind} is unusual for template ${p.template}` });
    if (s.from + s.duration > p.durationSec + 0.01) out.push({ level: "error", where, message: `runs past the video duration (${p.durationSec} s)` });
    const factId = s.kind === "metric" || s.kind === "progress" ? s.factId : s.kind === "feature" ? s.factId : null;
    if (s.kind === "metric" || s.kind === "progress") {
      const f = b.facts.facts.find((x) => x.id === factId);
      if (!f || f.status !== "PUBLIC_CONFIRMED") out.push({ level: "error", where, message: `number without a confirmed fact (${factId}) — fake metrics are not allowed` });
    }
    if (s.kind === "feature") {
      const f = factId ? b.facts.facts.find((x) => x.id === factId) : null;
      if (!f) out.push({ level: "warn", where, message: "feature callout without factId — brand-guard must confirm it" });
      else if (f.status !== "PUBLIC_CONFIRMED") out.push({ level: "error", where, message: `feature ${factId} has status ${f.status}` });
    }
  }
  if (p.captions?.timingSource === "estimated" && !p.draft.enabled)
    out.push({ level: "error", where: "captions", message: "estimated timing is allowed only in a draft (draft.enabled=true)" });
  return out;
};

/** Every referenced media file must exist. Missing assets → exit code 2. */
export const checkMedia = (p: VideoProps): string[] =>
  mediaPaths(p).filter((rel) => {
    try {
      return !exists(safeResolve(rel));
    } catch {
      return true;
    }
  });

export const validatePackage = async (pkg: Pkg) => {
  const findings: Finding[] = [];
  const brand = await loadBrand(pkg.manifest.brand);
  for (const key of Object.keys(DATA_FILES) as DataKey[]) {
    if (!hasData(pkg, key)) continue;
    try {
      await readData(pkg, key);
    } catch (e) {
      if (e instanceof ValidationError) e.issues.forEach((m) => findings.push({ level: "error", where: `data/${key}.json`, message: m }));
      else throw e;
    }
  }
  const hooks = hasData(pkg, "hooks") ? await readData(pkg, "hooks").catch(() => null) : null;
  if (hasData(pkg, "script")) {
    const script = await readData(pkg, "script").catch(() => null);
    if (script) findings.push(...(await checkScript(script, brand, hooks)));
  }
  if (hasData(pkg, "publish")) {
    const banned = await loadBannedRules();
    const pub = await readData(pkg, "publish").catch(() => null);
    for (const c of pub?.platforms ?? [])
      findings.push(...lintPublicText([c.title, c.caption, c.description, c.cta, c.onScreenTitle, c.coverText].join("\n"), `publish/${c.platform}`, banned, brand));
  }
  let missing: string[] = [];
  for (const fmt of pkg.manifest.formats) {
    if (!exists(propsPath(pkg, fmt))) continue;
    try {
      const props = await readProps(pkg, fmt);
      findings.push(...checkProps(props, brand));
      missing = missing.concat(checkMedia(props));
    } catch (e) {
      if (e instanceof ValidationError) e.issues.forEach((m) => findings.push({ level: "error", where: `props ${fmt}`, message: m }));
      else throw e;
    }
  }
  missing.forEach((m) => findings.push({ level: "error", where: "assets", message: `missing file: ${m}` }));
  return { findings, missing };
};
