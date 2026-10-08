import type { HooksFile, IdeasFile, ScriptFile, ShotlistFile, Shot } from "@mos/core";
import { IDEA_CRITERIA } from "@mos/core";

export const GENERATED = (src: string) =>
  `> Generated from \`${src}\` by \`npm run mos -- md\`. Edit the JSON, not this file.\n`;

const tc = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return `${String(m).padStart(2, "0")}:${s.toFixed(1).padStart(4, "0")}`;
};

const SHORT: Record<string, string> = {
  relevance: "Rel",
  novelty: "Nov",
  audienceFit: "Aud",
  visualPotential: "Vis",
  emotionalPotential: "Emo",
  storytellingPotential: "Story",
  productionComplexity: "Cplx↓",
  authenticity: "Auth",
  productRelevance: "Prod",
};

export const ideasMd = (f: IdeasFile) => {
  const rows = [...f.ideas].sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
  const head = `| # | Idea | Template | ${IDEA_CRITERIA.map((c) => SHORT[c]).join(" | ")} | Total | Duplicate |`;
  const sep = `|${"---|".repeat(5 + IDEA_CRITERIA.length)}`;
  const body = rows.map(
    (i) =>
      `| ${i.id} | **${i.title}** — ${i.logline} | ${i.template} | ${IDEA_CRITERIA.map((c) => i.scores[c]).join(" | ")} | ${i.total ?? "—"} | ${i.duplicateOf ?? ""} |`,
  );
  const top = f.top.map((t, n) => {
    const idea = f.ideas.find((i) => i.id === t.ideaId);
    return `${n + 1}. **${idea?.title ?? t.ideaId}** (${t.ideaId}) — ${t.why}`;
  });
  return [`# IDEAS — ${f.topic}`, "", GENERATED("data/ideas.json"), "Cplx↓: 5 = hard to shoot (inverted in the total).", "", head, sep, ...body, "", "## Top 3 and why", "", ...top, "", "## Score rationale", "", ...f.ideas.map((i) => `- **${i.id}** ${i.rationale}`), ""].join("\n");
};

export const hooksMd = (f: HooksFile) =>
  [
    "# HOOKS",
    "",
    GENERATED("data/hooks.json"),
    ...f.hooks.flatMap((h) => [
      `## ${h.id} · ${h.type}${h.selected ? " · ✅ selected" : ""}`,
      "",
      `- **VOICE HOOK** (what they hear): ${h.voice}`,
      `- **VISUAL HOOK** (what they see): ${h.visual}`,
      `- **TEXT HOOK** (what is on screen): ${h.text}`,
      `- **Payoff** (block ${h.payoffBlockId}): ${h.payoff}`,
      `- Risk: ${h.risk}`,
      "",
    ]),
  ].join("\n");

export const scriptMd = (f: ScriptFile, wordsPerSecNote = "") =>
  [
    "# SCRIPT",
    "",
    GENERATED("data/script.json"),
    `Hook: \`${f.hookId}\` · target duration ${f.targetDurationSec.join("–")} s · timing: **${f.timingSource === "estimated" ? "estimated (before speech is recorded)" : "from real speech"}**${wordsPerSecNote}`,
    "",
    ...f.blocks.flatMap((b) => [
      `### ${tc(b.startSec)}–${tc(b.endSec)} · ${b.role} · ${b.id}`,
      "",
      `- **Visual:** ${b.visual}`,
      `- **Speech:** ${b.speech || "—"}`,
      `- **Text:** ${b.onScreenText || "—"}`,
      `- **Sound:** ${b.sound || "—"}`,
      `- **Motion:** ${b.motion || "—"}`,
      `- _Why they keep watching:_ ${b.retention.whyKeepWatching} (risk: ${b.retention.risk})`,
      b.shotIds.length ? `- Shots: ${b.shotIds.join(", ")}` : "",
      "",
    ]),
    f.editorialCta ? `**Editorial CTA (on screen only, not in the SRT):** ${f.editorialCta}\n` : "",
    "## Claims and facts",
    "",
    ...f.claims.map((c) => `- «${c.text}» → ${c.factId ?? "no fact"} (${c.status})`),
    "",
    ...(f.notes.length ? ["## Notes", "", ...f.notes.map((n) => `- ${n}`), ""] : []),
  ].join("\n");

const shotBlock = (s: Shot) =>
  [
    `### ${s.id} · ${s.duration} s`,
    "",
    `- **Camera:** ${s.camera}`,
    `- **Framing:** ${s.framing}`,
    `- **Action:** ${s.action}`,
    `- **Speech:** ${s.speech || "—"}`,
    `- **Environment:** ${s.environment}`,
    `- **Lighting:** ${s.lighting}`,
    `- **Props:** ${s.props || "—"}`,
    `- **Screen recording:** ${s.screenRecording || "—"}`,
    `- **Required asset:** ${s.requiredAsset || "—"}`,
    `- **Motion graphics:** ${s.motionGraphics || "—"}`,
    `- **Audio:** ${s.audio || "—"}`,
    `- **Notes:** ${s.notes || "—"}`,
    `- Script blocks: ${s.blockIds.join(", ")}${s.draftSubstitute ? ` · draft substitute: ${s.draftSubstitute}` : ""}`,
    "",
  ].join("\n");

export const shotlistMd = (f: ShotlistFile) => {
  const group = (cls: Shot["class"], title: string, hint: string) => {
    const shots = f.shots.filter((s) => s.class === cls);
    return [`## ${title} (${shots.length})`, "", `_${hint}_`, "", ...(shots.length ? shots.map(shotBlock) : ["—", ""])];
  };
  const total = f.shots.reduce((s, x) => s + x.duration, 0);
  return [
    "# SHOTLIST",
    "",
    GENERATED("data/shotlist.json"),
    `Shots: ${f.shots.length}, ~${total.toFixed(1)} s of screen time in total.`,
    "",
    ...group("SHOOT_THIS", "SHOOT_THIS — you film these", "Camera, light and action are spelled out so you can shoot without a call."),
    ...group("GENERATE_THIS", "GENERATE_THIS — the system makes these", "Remotion components and HyperFrames segments."),
    ...group("EXISTING_ASSET", "EXISTING_ASSET — taken from assets/", "Paths and restrictions are in ASSETS.md."),
  ].join("\n");
};
