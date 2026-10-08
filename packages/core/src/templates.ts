import { z } from "zod";

/**
 * 13 video templates. A template is a *preset* (data), not a component:
 * one generic SceneTimeline renders every preset; the preset constrains scene kinds,
 * suggests structure by role and gives the duration range.
 */
export const TEMPLATE_IDS = [
  "TalkingHead",
  "TalkingHeadWithBroll",
  "ProcessStory",
  "DevDiary",
  "ProductDemo",
  "FounderStory",
  "BeforeAfter",
  "Reaction",
  "ScreenRecording",
  "FeatureReveal",
  "NewsReaction",
  "StoryTime",
  "MemeExplainer",
] as const;
export const TemplateId = z.enum(TEMPLATE_IDS);
export type TemplateId = z.infer<typeof TemplateId>;

export const SCENE_KINDS = [
  "footage",
  "placeholder",
  "screen",
  "preview",
  "motion",
  "title",
  "card",
  "comment",
  "message",
  "feature",
  "metric",
  "split",
  "cta",
  "lowerThird",
  "progress",
] as const;
export type SceneKind = (typeof SCENE_KINDS)[number];

export type PresetRole = "hook" | "setup" | "development" | "turn" | "payoff" | "cta";

export interface TemplatePreset {
  id: TemplateId;
  label: string;
  description: string;
  durationSec: [number, number];
  allowedKinds: SceneKind[];
  structure: { role: PresetRole; kinds: SceneKind[]; note: string }[];
  /** Fully designed + used by a demo; others are presets covered by smoke fixtures. */
  depth: "full" | "preset";
}

const ALWAYS: SceneKind[] = ["placeholder", "title", "cta", "motion", "lowerThird"];
const k = (...kinds: SceneKind[]): SceneKind[] => Array.from(new Set([...ALWAYS, ...kinds]));

export const TEMPLATE_PRESETS: Record<TemplateId, TemplatePreset> = {
  TalkingHead: { id: "TalkingHead", label: "Talking head", description: "One anchor shot of the creator; on-screen text carries the accents.", durationSec: [15, 45], allowedKinds: k("footage"), structure: [{ role: "hook", kinds: ["footage"], note: "the thought, straight to camera" }, { role: "development", kinds: ["footage"], note: "punch-ins on turns" }, { role: "payoff", kinds: ["footage", "title"], note: "conclusion as large text" }], depth: "preset" },
  TalkingHeadWithBroll: { id: "TalkingHeadWithBroll", label: "Creator + B-roll", description: "The anchor shot alternates with inserts that reinforce what is said.", durationSec: [20, 60], allowedKinds: k("footage", "screen", "preview", "split"), structure: [{ role: "hook", kinds: ["footage"], note: "creator" }, { role: "development", kinds: ["screen", "preview", "footage"], note: "insert on the key word" }, { role: "payoff", kinds: ["footage"], note: "back to the creator" }], depth: "preset" },
  ProcessStory: { id: "ProcessStory", label: "Process story", description: "A story told over work-in-progress visuals; only real footage is presented as the real product.", durationSec: [15, 60], allowedKinds: k("preview", "footage", "card"), structure: [{ role: "hook", kinds: ["preview"], note: "the strangest moment" }, { role: "development", kinds: ["preview"], note: "context" }, { role: "payoff", kinds: ["preview", "title"], note: "resolution" }], depth: "preset" },
  DevDiary: { id: "DevDiary", label: "Dev diary", description: "Creator + build process + work-in-progress inserts + brand UI graphics.", durationSec: [20, 45], allowedKinds: k("footage", "preview", "card", "screen", "comment", "progress", "split", "feature"), structure: [{ role: "hook", kinds: ["footage", "card"], note: "a relatable real-life moment" }, { role: "setup", kinds: ["footage"], note: "who I am and what I build" }, { role: "turn", kinds: ["preview", "card", "motion"], note: "how it became a feature" }, { role: "payoff", kinds: ["footage", "title"], note: "punchline" }, { role: "cta", kinds: ["cta"], note: "follow / comment" }], depth: "full" },
  ProductDemo: { id: "ProductDemo", label: "Product demo", description: "Real interface first; callouts only for features in PRODUCT_FACTS.", durationSec: [15, 45], allowedKinds: k("screen", "feature", "message", "footage"), structure: [{ role: "hook", kinds: ["screen"], note: "the result first" }, { role: "development", kinds: ["screen", "feature"], note: "steps" }, { role: "payoff", kinds: ["screen", "title"], note: "what the user gets" }], depth: "preset" },
  FounderStory: { id: "FounderStory", label: "Founder story", description: "A founder's personal story; the product is shown as proof, not as an ad.", durationSec: [25, 50], allowedKinds: k("footage", "screen", "message", "feature", "comment", "split"), structure: [{ role: "hook", kinds: ["footage", "message"], note: "confession or conflict" }, { role: "setup", kinds: ["footage"], note: "why it is personal" }, { role: "turn", kinds: ["screen", "motion"], note: "what I did differently" }, { role: "payoff", kinds: ["footage", "title"], note: "honest conclusion" }, { role: "cta", kinds: ["cta"], note: "soft call to action" }], depth: "full" },
  BeforeAfter: { id: "BeforeAfter", label: "Before / after", description: "Two states compared.", durationSec: [10, 30], allowedKinds: k("split", "screen", "preview", "footage"), structure: [{ role: "hook", kinds: ["split"], note: "contrast" }, { role: "payoff", kinds: ["split", "title"], note: "what changed" }], depth: "preset" },
  Reaction: { id: "Reaction", label: "Reaction", description: "The creator reacts to a comment or event.", durationSec: [10, 40], allowedKinds: k("footage", "comment", "split"), structure: [{ role: "hook", kinds: ["comment"], note: "someone else's line" }, { role: "development", kinds: ["footage"], note: "reaction" }], depth: "preset" },
  ScreenRecording: { id: "ScreenRecording", label: "Screen recording", description: "Screen capture with zooms on actions.", durationSec: [15, 60], allowedKinds: k("screen", "feature"), structure: [{ role: "hook", kinds: ["screen"], note: "the outcome" }, { role: "development", kinds: ["screen", "feature"], note: "steps" }], depth: "preset" },
  FeatureReveal: { id: "FeatureReveal", label: "Feature reveal", description: "One feature: problem → reveal → use.", durationSec: [10, 30], allowedKinds: k("screen", "feature", "message", "footage"), structure: [{ role: "hook", kinds: ["footage", "screen"], note: "the pain" }, { role: "turn", kinds: ["motion", "screen"], note: "reveal" }, { role: "payoff", kinds: ["screen", "feature"], note: "how it works" }], depth: "preset" },
  NewsReaction: { id: "NewsReaction", label: "News reaction", description: "A sourced fact → the creator's opinion. The source is mandatory.", durationSec: [15, 45], allowedKinds: k("footage", "comment", "screen"), structure: [{ role: "hook", kinds: ["screen"], note: "headline / source screenshot" }, { role: "development", kinds: ["footage"], note: "opinion" }], depth: "preset" },
  StoryTime: { id: "StoryTime", label: "Story time", description: "A story with setup, turn and resolution.", durationSec: [20, 60], allowedKinds: k("footage", "preview", "screen", "comment"), structure: [{ role: "hook", kinds: ["footage"], note: "start of the story" }, { role: "turn", kinds: ["footage", "preview"], note: "twist" }, { role: "payoff", kinds: ["footage", "title"], note: "resolution" }], depth: "preset" },
  MemeExplainer: { id: "MemeExplainer", label: "Meme explainer", description: "A recognizable situation → explained through the product.", durationSec: [8, 25], allowedKinds: k("footage", "preview", "card", "comment", "split"), structure: [{ role: "hook", kinds: ["title", "card"], note: "recognizable situation" }, { role: "payoff", kinds: ["footage", "preview"], note: "punch" }], depth: "preset" },
};
