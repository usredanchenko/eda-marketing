import { TEMPLATE_PRESETS, VideoProps, type BrandId, type FormatId, type Scene, type TemplateId } from "@mos/core";

/**
 * Smoke fixtures: one composition per template preset (+ DevDiary in every format), all on the fictional
 * example brand `acme-focus` with locally generated assets (`npm run mos -- assets examples`).
 * They exercise every scene kind; content packages never live here.
 */
type S = Scene;
const BRAND: BrandId = "acme-focus";
const common = (id: string, from: number, duration: number, layer: "base" | "overlay" = "base") => ({ id, from, duration, layer, draftNote: null });
const footage = (id: string, from: number, d: number, src: string, fit: "contain" | "cover" | "wideWindow" = "contain"): S => ({ ...common(id, from, d), kind: "footage", src, trimStart: 1, fit, focus: { x: 0.5, y: 0.35 }, zoom: { from: 1, to: 1.06 }, muted: true });
const screen = (id: string, from: number, d: number, src: string, device: "phone" | "none" = "phone", highlight: { x: number; y: number; w: number; h: number } | null = null): S => ({ ...common(id, from, d), kind: "screen", src, device, placement: "center", label: "EXAMPLE UI · FICTIONAL APP", zoom: { from: 1, to: 1.12 }, focus: { x: 0.5, y: 0.3 }, highlight, sequence: [], redact: [] });
const preview = (id: string, from: number, d: number, src: string): S => ({ ...common(id, from, d), kind: "preview", src, stage: "blockout", honestyLabel: "BLOCKOUT · NOT THE REAL PRODUCT", zoom: { from: 1.05, to: 1.15 } });
const title = (id: string, from: number, d: number, lines: [string, 300 | 700, "plain" | "accent" | "gradient" | "mono"][], eyebrow: string | null = null): S => ({ ...common(id, from, d), kind: "title", eyebrow, lines: lines.map(([text, weight, style]) => ({ text, weight, style })), slot: "center", background: "brand", suppressCaptions: false });
const ph = (id: string, from: number, d: number, shotId: string, t: string): S => ({ ...common(id, from, d), kind: "placeholder", shotId, shotClass: "SHOOT_THIS", title: t, description: "Fixture: a shot slot the creator still has to film" });

const A = {
  v: "assets/acme-focus/footage/desk-vertical.mp4",
  w: "assets/acme-focus/footage/desk-wide.mp4",
  timer: "assets/acme-focus/screens/timer.png",
  task: "assets/acme-focus/screens/task.png",
  done: "assets/acme-focus/screens/done.png",
  blockout: "assets/acme-focus/preview/blockout.png",
};

const card: S = { ...common("card", 0.6, 3.6, "overlay"), kind: "card", header: "INBOX · NEW REQUEST", ref: "#4127", title: "Quick question (5 min?)", rows: [["From", "Your own brain"], ["When", "Right now"]], chip: "PRIORITY: URGENT", statuses: [{ label: "NEW", tone: "info" }, { label: "IN PROGRESS", tone: "neutral" }, { label: "AGAIN", tone: "warn" }] };

const SCENES: Record<TemplateId, S[]> = {
  TalkingHead: [footage("a", 0, 8, A.v), { ...common("lt", 0.5, 3, "overlay"), kind: "lowerThird", name: "Alex", role: "building Acme Focus" }],
  TalkingHeadWithBroll: [footage("a", 0, 3, A.v), screen("b", 3, 3, A.timer), footage("c", 6, 2, A.v)],
  ProcessStory: [preview("a", 0, 5, A.blockout), title("b", 5, 3, [["Just boxes for now", 700, "plain"], ["but it has a shape", 300, "accent"]])],
  DevDiary: [footage("a", 0, 3, A.v), card, preview("b", 3, 3, A.blockout), { ...common("p", 3.4, 2.5, "overlay"), kind: "progress", label: "Beta · 3 of 5 features", value: 0.6, factId: "acme-focus-beta-progress" }, title("c", 6, 2, [["A distraction", 700, "plain"], ["became a feature", 300, "accent"]], "DEV DIARY")],
  ProductDemo: [screen("a", 0, 4, A.task, "phone", { x: 0.08, y: 0.08, w: 0.84, h: 0.06 }), { ...common("f", 1.5, 2.5, "overlay"), kind: "feature", title: "ONE TASK", text: "Type one task, start one timer", target: { x: 0.5, y: 0.3 }, factId: "acme-focus-what-it-is" }, screen("b", 4, 4, A.timer)],
  FounderStory: [footage("a", 0, 3, A.v), { ...common("m", 0.5, 2.5, "overlay"), kind: "message", theme: "dark", messages: [{ from: "them", author: "Friend", text: "Why build another timer app?", at: 0 }, { from: "me", author: null, text: "Give me 30 seconds", at: 1.2 }] }, screen("b", 3, 3, A.done), { ...common("cta", 6, 2), kind: "cta", text: "Link in bio", sub: "ACME FOCUS", editorial: true }],
  BeforeAfter: [{ ...common("a", 0, 8), kind: "split", a: { src: A.task, label: "BEFORE START", media: "image" }, b: { src: A.done, label: "AFTER ONE SESSION", media: "image" }, orientation: "horizontal" }],
  Reaction: [footage("a", 0, 8, A.v), { ...common("c", 0.4, 4, "overlay"), kind: "comment", author: "viewer_01", text: "Does it shame me when I skip a day?", sourceLabel: "illustrative comment (fixture)" }],
  ScreenRecording: [screen("a", 0, 8, A.timer, "none")],
  FeatureReveal: [title("a", 0, 2.5, [["No streaks", 700, "gradient"], ["no guilt", 300, "plain"]]), screen("b", 2.5, 5.5, A.done, "phone", { x: 0.08, y: 0.08, w: 0.84, h: 0.06 })],
  NewsReaction: [ph("a", 0, 3, "S01", "Screenshot of the news with its source"), footage("b", 3, 5, A.v)],
  StoryTime: [footage("a", 0, 5, A.w, "wideWindow"), title("b", 5, 3, [["And then", 300, "plain"], ["I checked email again", 700, "accent"]])],
  MemeExplainer: [footage("a", 0, 8, A.v, "cover"), { ...card, from: 0.3 }],
};

const make = (template: TemplateId, format: FormatId): VideoProps => {
  const scenes = SCENES[template];
  return VideoProps.parse({
    schemaVersion: 1,
    packageId: `fixture-${template}`,
    brand: BRAND,
    template,
    format,
    fps: 30,
    platforms: ["tiktok", "instagram", "youtube"],
    title: TEMPLATE_PRESETS[template].label,
    durationSec: 8,
    draft: { enabled: true, label: `FIXTURE · ${TEMPLATE_PRESETS[template].label}` },
    background: "night",
    scenes,
    captions: null,
    accents: template === "TalkingHead" ? [{ id: "acc", text: "The thought, straight away", from: 3.5, duration: 3, slot: "headline", weight: 700, style: "accent", size: "l", spoken: false }] : [],
    audio: { voice: [], music: null, sfx: template === "DevDiary" ? [{ id: "notify", src: "assets/shared/sfx/ui-notify.wav", at: 0.6, volume: 0.8, reason: "incoming notification card" }] : [], expectSilence: true },
    uiZones: [],
  });
};

export const FIXTURES: { id: string; props: VideoProps }[] = [
  ...(Object.keys(SCENES) as TemplateId[]).map((t) => ({ id: `fixture-${t}-9x16`, props: make(t, "9x16") })),
  ...(["1x1", "4x5", "16x9"] as FormatId[]).map((f) => ({ id: `fixture-DevDiary-${f}`, props: make("DevDiary", f) })),
];
