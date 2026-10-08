import { Video } from "@remotion/media";
import type { Scene } from "@mos/core";
import { AbsoluteFill, CanvasImage, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { enter } from "../anim";
import { bgColor, col, typeCss, useBrand } from "../brand";

type SplitScene = Extract<Scene, { kind: "split" }>;

/** Before/after or two-sided comparison. Vertical = top/bottom (fits 9:16), horizontal = left/right. */
export const SplitScreen: React.FC<{ scene: SplitScene }> = ({ scene }) => {
  const c = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vertical = scene.orientation === "vertical";
  const w = vertical ? c.width : c.width / 2;
  const h = vertical ? c.height / 2 : c.height;
  const side = (s: SplitScene["a"], i: number) => {
    const p = enter(c, frame, i * 8, 12);
    return (
      <div key={i} style={{ position: "absolute", left: vertical ? 0 : i * w, top: vertical ? i * h : 0, width: w, height: h, overflow: "hidden", clipPath: vertical ? `inset(0 ${Math.round((1 - p) * 100)}% 0 0)` : `inset(${Math.round((1 - p) * 100)}% 0 0 0)` }}>
        {s.media === "video" ? (
          <Video src={staticFile(s.src)} muted objectFit="cover" premountFor={fps} style={{ width: w, height: h }} />
        ) : (
          <CanvasImage src={staticFile(s.src)} premountFor={fps} style={{ width: w, height: h, objectFit: "cover" }} />
        )}
        <div style={{ position: "absolute", left: c.slots.center.x, top: i === 0 && vertical ? c.slots.headline.y : 40, ...typeCss(c, "uiLabel", { sizeMul: 1.2 }), color: col(c, "text"), background: `${bgColor(c)}cc`, padding: "8px 14px" }}>{s.label}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ backgroundColor: bgColor(c) }}>
      {side(scene.a, 0)}
      {side(scene.b, 1)}
      <div style={{ position: "absolute", background: col(c, "text"), opacity: 0.85, ...(vertical ? { left: 0, top: h - 2, width: c.width, height: 4 } : { top: 0, left: w - 2, width: 4, height: c.height }) }} />
    </AbsoluteFill>
  );
};
