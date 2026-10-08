import type { Scene } from "@mos/core";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { enter } from "../anim";
import { accentColor, bgColor, col, typeCss, useBrand } from "../brand";

type PlaceholderScene = Extract<Scene, { kind: "placeholder" }>;

/**
 * Visible slot for a shot that does not exist yet (SHOOT_THIS) or is still being generated.
 * Deliberately looks like a production card, never like finished content.
 */
export const ShotPlaceholder: React.FC<{ scene: PlaceholderScene }> = ({ scene }) => {
  const c = useBrand();
  const frame = useCurrentFrame();
  const p = enter(c, frame, 0, 10);
  const line = col(c, "line", "#ffffff22");
  return (
    <AbsoluteFill style={{ backgroundColor: bgColor(c), backgroundImage: `repeating-linear-gradient(135deg, transparent 0 38px, ${line}55 38px 40px)` }}>
      <div style={{ position: "absolute", left: c.slots.center.x, top: c.slots.headline.y + c.slots.headline.h, width: c.slots.center.w, opacity: p }}>
        <div style={{ ...typeCss(c, "uiLabel"), color: accentColor(c), marginBottom: 20 }}>
          {scene.shotClass} · {scene.shotId}
        </div>
        <div style={{ ...typeCss(c, "headline", { sizeMul: 0.62 }), color: col(c, "text"), marginBottom: 24 }}>{scene.title}</div>
        <div style={{ ...typeCss(c, "body"), color: col(c, "muted", "#cccccc") }}>{scene.description}</div>
      </div>
    </AbsoluteFill>
  );
};
