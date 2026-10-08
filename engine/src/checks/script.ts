import path from "node:path";
import { estimateBlock, lintText, type HooksFile, type LanguageId, type ScriptFile } from "@mos/core";
import type { Brand } from "../brands/load";
import { readYaml } from "../lib/fsx";
import { ROOT } from "../lib/paths";

export interface Finding {
  level: "error" | "warn";
  where: string;
  message: string;
}

type Rule = { id: string; pattern: string; severity: "error" | "warn" };
/** Banned phrases for the brand's language: config/lang/<language>/banned-phrases.yaml. */
export const loadBannedRules = async (language: LanguageId = "en"): Promise<Rule[]> =>
  (await readYaml<{ rules: Rule[] }>(path.join(ROOT, "config", "lang", language, "banned-phrases.yaml"))).rules;

/** `[CONFIRM: …]` marks a fact the user still has to confirm; it never reaches a final render unresolved. */
export const CONFIRM_MARKER = /\[CONFIRM:[^\]]*\]/g;

/** Brand claim patterns → lint rules. Forbidden = error; needs-confirmation = warn (needs a confirmed factId). */
export const claimRules = (b: Brand): Rule[] => [
  ...b.config.claims.forbiddenPatterns.map((p, i) => ({ id: `forbidden-${i}`, pattern: p, severity: "error" as const })),
  ...b.config.claims.needsConfirmationPatterns.map((p, i) => ({ id: `confirm-${i}`, pattern: p, severity: "warn" as const })),
];

/** Lints any public text (script, captions, publish copy, on-screen text). */
export const lintPublicText = (text: string, where: string, banned: Rule[], b: Brand): Finding[] => [
  ...lintText(text, banned).map((h) => ({ level: h.severity, where, message: `banned phrase "${h.match}" (${h.rule})` })),
  ...lintText(text, claimRules(b)).map((h) => ({
    level: h.severity,
    where,
    message:
      h.severity === "error"
        ? `forbidden claim "${h.match}" (see FORBIDDEN_CLAIMS.md)`
        : `"${h.match}" needs a PUBLIC_CONFIRMED fact in claims`,
  })),
  ...(text.match(CONFIRM_MARKER) ?? []).map((m) => ({ level: "warn" as const, where, message: `NEEDS_CONFIRMATION: ${m}` })),
];

export const checkScript = async (s: ScriptFile, b: Brand, hooks: HooksFile | null): Promise<Finding[]> => {
  const out: Finding[] = [];
  const banned = await loadBannedRules(b.config.language);
  const sps = b.config.speech.syllablesPerSec;
  if (s.language !== b.config.language) out.push({ level: "error", where: "script", message: `script language "${s.language}" differs from brand language "${b.config.language}"` });
  s.blocks.forEach((blk, i) => {
    const where = `${blk.id} ${blk.startSec}–${blk.endSec}s`;
    const prevEnd = i === 0 ? 0 : s.blocks[i - 1].endSec;
    if (Math.abs(blk.startSec - prevEnd) > 0.05) out.push({ level: "error", where, message: `gap/overlap: the previous block ends at ${prevEnd}s` });
    const est = estimateBlock(blk.speech, blk.startSec, blk.endSec, sps);
    if (est.overflowSec > 0.15)
      out.push({ level: "error", where, message: `speech does not fit: needs ~${est.requiredSec} s at ${sps} syllables/s, block has ${est.availableSec} s` });
    else if (est.wordsPerSec > 3.4) out.push({ level: "warn", where, message: `dense: ${est.wordsPerSec} words/s — will sound rushed` });
    for (const f of lintPublicText(`${blk.speech}\n${blk.onScreenText}`, where, banned, b)) out.push(f);
  });
  const total = s.blocks[s.blocks.length - 1]?.endSec ?? 0;
  const [lo, hi] = s.targetDurationSec;
  if (total < lo - 0.5 || total > hi + 0.5) out.push({ level: "warn", where: "script", message: `duration ${total} s is outside the target ${lo}–${hi} s` });
  const ctaIdx = s.blocks.findIndex((x) => x.role === "cta");
  if (ctaIdx >= 0 && ctaIdx < s.blocks.length - 2) out.push({ level: "warn", where: s.blocks[ctaIdx].id, message: "CTA too early — before the payoff" });
  if (!s.blocks.some((x) => x.role === "payoff")) out.push({ level: "error", where: "script", message: "no payoff block" });
  for (const c of s.claims) {
    const fact = c.factId ? b.facts.facts.find((f) => f.id === c.factId) : null;
    if (c.factId && !fact) out.push({ level: "error", where: "claims", message: `fact ${c.factId} not found in brands/${b.id}/facts.yaml` });
    else if (fact && fact.status !== c.status) out.push({ level: "error", where: "claims", message: `status of ${c.factId}: ${fact.status} in facts.yaml, ${c.status} in the script` });
    const st = fact?.status ?? c.status;
    if (st === "FORBIDDEN") out.push({ level: "error", where: "claims", message: `forbidden claim: "${c.text}"` });
    if (st === "INTERNAL" || st === "NEEDS_CONFIRMATION" || st === "NO_FACT")
      out.push({ level: /\[CONFIRM:/.test(c.text) ? "warn" : "error", where: "claims", message: `"${c.text}" (${st}) cannot be published without confirmation` });
  }
  if (hooks) {
    const hook = hooks.hooks.find((h) => h.id === s.hookId);
    if (!hook) out.push({ level: "error", where: "hook", message: `hook ${s.hookId} not found in hooks.json` });
    else if (!s.blocks.some((x) => x.id === hook.payoffBlockId))
      out.push({ level: "error", where: "hook", message: `the hook's payoff (${hook.payoffBlockId}) is not in the script — clickbait without delivery` });
  }
  if (s.editorialCta && s.blocks.some((x) => x.speech.includes(s.editorialCta!)))
    out.push({ level: "warn", where: "cta", message: "the editorial CTA is also spoken — then it is not an editorial layer" });
  return out;
};
