import type { Scene } from "@mos/core";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { enter, exit } from "../anim";
import { col, textColor, typeCss, useBrand } from "../brand";

type CommentScene = Extract<Scene, { kind: "comment" }>;

/** Viewer comment card. The source label is always visible (illustrative vs real comment). */
export const CommentOverlay: React.FC<{ scene: CommentScene }> = ({ scene }) => {
  const c = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = enter(c, frame, 0, 10);
  const w = Math.min(c.slots.center.w, 860);
  const paper = c.t.styles.commentCard === "paper";
  return (
    <AbsoluteFill style={{ opacity: exit(frame, Math.round(scene.duration * fps)) }}>
      <div style={{ position: "absolute", left: c.slots.center.x, top: c.slots.headline.y + 30, width: w, padding: "24px 28px", background: paper ? col(c, "cardBg") : col(c, "surface"), color: paper ? col(c, "cardInk") : textColor(c), borderRadius: paper ? c.t.radii.card : c.t.radii.panel, translate: `0px ${Math.round((1 - p) * 40)}px`, opacity: p, boxShadow: "0 24px 70px rgba(0,0,0,.45)" }}>
        <div style={{ ...typeCss(c, "uiLabel"), opacity: 0.7, marginBottom: 10 }}>@{scene.author}</div>
        <div style={{ ...typeCss(c, "body", { sizeMul: 1.15 }) }}>{scene.text}</div>
        <div style={{ ...typeCss(c, "uiLabel", { sizeMul: 0.8 }), opacity: 0.55, marginTop: 14 }}>{scene.sourceLabel}</div>
      </div>
    </AbsoluteFill>
  );
};
