import type { Scene, VideoProps } from "@mos/core";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { bgColor, col, grad, typeCss, useBrand } from "../brand";

/** Composition background (behind every scene). */
export const Background: React.FC<{ kind: VideoProps["background"] }> = ({ kind }) => {
  const c = useBrand();
  return <AbsoluteFill style={{ background: kind === "plain" ? bgColor(c) : grad(c, "night") ?? bgColor(c) }} />;
};

/**
 * Draft marker: "DRAFT · ESTIMATED TIMING" + the current scene's draft note
 * (e.g. "temporary insert from C006 — replace with S03"). Never appears when draft.enabled=false.
 */
export const DraftBadge: React.FC<{ label: string; scenes: Scene[] }> = ({ label, scenes }) => {
  const c = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const note = scenes.find((s) => s.draftNote && frame >= f(s.from) && frame < f(s.from + s.duration))?.draftNote;
  const box: React.CSSProperties = { ...typeCss(c, "uiLabel", { sizeMul: 0.85 }), color: "#111", background: "#f5d76e", padding: "6px 12px", display: "inline-block", maxWidth: c.slots.center.w };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: c.slots.center.x, top: Math.max(24, c.slots.headline.y - 70), display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={box}>{label}</span>
        {note ? <span style={{ ...box, background: "#ffffffd9", textTransform: "none", letterSpacing: 0 }}>{note}</span> : null}
      </div>
    </AbsoluteFill>
  );
};

/** Safe-area overlay for checking layouts in Studio (fixtures only). */
export const SafeAreaDebug: React.FC = () => {
  const c = useBrand();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Object.entries(c.slots).map(([k, r]) => (
        <div key={k} style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, outline: `2px dashed ${col(c, "accent", "#ffff00")}88`, ...typeCss(c, "uiLabel", { sizeMul: 0.7 }), color: "#ff0" }}>
          {k}
        </div>
      ))}
    </AbsoluteFill>
  );
};
