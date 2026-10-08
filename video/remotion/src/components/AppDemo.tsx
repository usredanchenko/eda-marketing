import type { Rect01, Scene } from "@mos/core";
import { AbsoluteFill, CanvasImage, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { enter, zoomAt } from "../anim";
import { accentColor, bgColor, col, grad, typeCss, useBrand, type BrandCtx } from "../brand";
import { PhoneFrame } from "./PhoneFrame";

type ScreenScene = Extract<Scene, { kind: "screen" }>;

/** Highlight of one UI element: thin outline that draws in after the camera settles. */
const Highlight: React.FC<{ rect: Rect01 }> = ({ rect }) => {
  const c = useBrand();
  const frame = useCurrentFrame();
  const p = enter(c, frame, 12, 10);
  return (
    <div
      style={{
        position: "absolute",
        left: `${rect.x * 100}%`,
        top: `${rect.y * 100}%`,
        width: `${rect.w * 100}%`,
        height: `${rect.h * 100}%`,
        borderRadius: c.t.radii.card ?? 12,
        boxShadow: `0 0 0 ${Math.round(4 * p)}px ${accentColor(c)}, 0 0 60px ${accentColor(c)}55`,
        opacity: p,
      }}
    />
  );
};

/** Covers unconfirmed numbers, announcements or personal data on a real screenshot. */
const Redactions: React.FC<{ rects: Rect01[] }> = ({ rects }) => (
  <>
    {rects.map((r, i) => (
      <div key={i} style={{ position: "absolute", left: `${r.x * 100}%`, top: `${r.y * 100}%`, width: `${r.w * 100}%`, height: `${r.h * 100}%`, borderRadius: 6, background: "rgba(22,22,28,0.96)" }} />
    ))}
  </>
);

/** Honesty label for UI captured in test mode (fictional data). */
const ScreenLabel: React.FC<{ text: string; top: number; c: BrandCtx; p: number }> = ({ text, top, c, p }) => (
  <div style={{ position: "absolute", left: c.slots.center.x, top, ...typeCss(c, "uiLabel", { sizeMul: 0.9 }), color: col(c, "muted", "#ccc"), opacity: p }}>{text}</div>
);

/** Current screenshot and its redactions: hard cuts inside the same, persistent phone frame. */
const current = (scene: ScreenScene, t: number) => {
  const step = [...scene.sequence].reverse().find((q) => t >= q.at);
  return step ? { src: step.src, redact: step.redact } : { src: scene.src, redact: scene.redact };
};

/**
 * ScreenshotZoom + AppDemo: a REAL app screen (test mode) inside PhoneFrame or full-bleed,
 * with a camera move to the focus point, optional highlight, redactions and in-frame screen cuts.
 */
export const AppDemo: React.FC<{ scene: ScreenScene }> = ({ scene }) => {
  const c = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = Math.round(scene.duration * fps);
  const z = zoomAt(c, frame, dur, scene.zoom.from, scene.zoom.to);
  const origin = `${scene.focus.x * 100}% ${scene.focus.y * 100}%`;
  const appear = enter(c, frame, 0, 12);
  const shot = current(scene, frame / fps);
  if (scene.device === "none") {
    return (
      <AbsoluteFill style={{ backgroundColor: bgColor(c), overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, scale: z, transformOrigin: origin }}>
          <CanvasImage src={staticFile(shot.src)} premountFor={fps} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <Redactions rects={shot.redact} />
        </div>
        {scene.highlight ? <Highlight rect={scene.highlight} /> : null}
        {scene.label ? <ScreenLabel text={scene.label} top={c.slots.headline.y} c={c} p={appear} /> : null}
      </AbsoluteFill>
    );
  }
  const bottom = scene.placement === "bottom";
  // bottom: the phone sits low and may run off the frame; captions/accents use the space above it.
  const phoneW = bottom ? Math.round(c.width * 0.66) : Math.round(Math.min(c.width * 0.72, c.height * 0.36));
  const top = bottom ? Math.round(c.height * 0.4) : undefined;
  return (
    <AbsoluteFill style={{ background: grad(c, "night") ?? bgColor(c), alignItems: "center", justifyContent: bottom ? "flex-start" : "center", overflow: "hidden" }}>
      <div style={{ position: bottom ? "absolute" : "relative", top, scale: z * (0.94 + 0.06 * appear), transformOrigin: origin, opacity: appear, translate: `0px ${Math.round((1 - appear) * 60)}px` }}>
        <PhoneFrame src={shot.src} width={phoneW}>
          <Redactions rects={shot.redact} />
          {scene.highlight ? <Highlight rect={scene.highlight} /> : null}
        </PhoneFrame>
      </div>
      {scene.label ? <ScreenLabel text={scene.label} top={bottom ? Math.round(c.height * 0.4) - 56 : c.slots.headline.y} c={c} p={appear} /> : null}
    </AbsoluteFill>
  );
};
