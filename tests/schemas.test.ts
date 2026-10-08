import { describe, expect, it } from "vitest";
import { PreviewScene, HooksFile, IdeasFile, isSafeRepoPath, MetricScene, PlatformCopy, VideoProps } from "@mos/core";
import { loadBrand } from "../engine/src/brands/load";
import { checkMedia, checkProps } from "../engine/src/checks/validate";
import { PathError, safeResolve } from "../engine/src/lib/paths";

const baseProps = (): VideoProps => ({
  schemaVersion: 1,
  packageId: "t",
  brand: "acme-focus",
  template: "ProductDemo",
  format: "9x16",
  fps: 30,
  platforms: ["tiktok"],
  title: "t",
  durationSec: 5,
  draft: { enabled: true, label: "draft" },
  background: "night",
  scenes: [],
  captions: null,
  accents: [],
  audio: { voice: [], music: null, sfx: [], expectSilence: true },
  uiZones: [],
});
const common = { id: "s", from: 0, duration: 2, layer: "overlay" as const, draftNote: null };

describe("schemas and guards", () => {
  it("rejects absolute and traversal paths", () => {
    expect(isSafeRepoPath("assets/a.png")).toBe(true);
    expect(isSafeRepoPath("/etc/passwd")).toBe(false);
    expect(isSafeRepoPath("assets/../../.env")).toBe(false);
    expect(isSafeRepoPath("node_modules/x.js")).toBe(false);
    expect(() => safeResolve("../secrets")).toThrow(PathError);
  });

  it("requires an honesty label for work-in-progress visuals", () => {
    const scene = { ...common, kind: "preview", src: "assets/acme-focus/preview/blockout.png", stage: "blockout", honestyLabel: null, zoom: { from: 1, to: 1 } };
    expect(PreviewScene.safeParse(scene).success).toBe(false);
    expect(PreviewScene.safeParse({ ...scene, honestyLabel: "BLOCKOUT · NOT THE REAL PRODUCT" }).success).toBe(true);
    expect(PreviewScene.safeParse({ ...scene, stage: "real" }).success).toBe(true);
  });

  it("blocks metrics that are not confirmed facts", async () => {
    const metric = { ...common, kind: "metric" as const, value: 100000, prefix: "", suffix: "", label: "users", factId: "acme-focus-user-count" };
    expect(MetricScene.safeParse({ ...metric, factId: "" }).success).toBe(false);
    const findings = checkProps({ ...baseProps(), scenes: [metric] }, await loadBrand("acme-focus"));
    expect(findings.some((f) => f.level === "error" && f.message.includes("acme-focus-user-count"))).toBe(true);
  });

  it("limits hashtags to 5 relevant ones", () => {
    const copy = { platform: "tiktok", title: "", caption: "c", description: "", cta: "", hashtags: ["#a", "#b", "#c", "#d", "#e", "#f"], keywords: [], onScreenTitle: "", coverText: "" };
    expect(PlatformCopy.safeParse(copy).success).toBe(false);
    expect(PlatformCopy.safeParse({ ...copy, hashtags: ["#indiedev"] }).success).toBe(true);
  });

  it("requires ≥5 distinct hook types and ≥10 ideas", () => {
    const hook = (i: number, type: string) => ({ id: `h0${i}`, type, voice: "voice", visual: "visual", text: "text", payoffBlockId: "b03", payoff: "payoff", risk: "", selected: false });
    expect(HooksFile.safeParse({ ideaId: "i01", hooks: [1, 2, 3, 4, 5].map((i) => hook(i, "question")) }).success).toBe(false);
    expect(IdeasFile.safeParse({ topic: "t", ideas: [], top: [] }).success).toBe(false);
  });

  it("reports missing media files", () => {
    const props = { ...baseProps(), scenes: [{ ...common, kind: "screen" as const, src: "assets/acme-focus/screens/nope.png", device: "phone" as const, placement: "center" as const, label: null, zoom: { from: 1, to: 1 }, focus: { x: 0.5, y: 0.5 }, highlight: null, sequence: [], redact: [] }] };
    expect(checkMedia(props)).toEqual(["assets/acme-focus/screens/nope.png"]);
  });
});
