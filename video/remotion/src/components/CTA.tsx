import { typograph, type Scene } from "@mos/core";
import { AbsoluteFill, CanvasImage, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { enter } from "../anim";
import { accentColor, accentTextCss, bgColor, grad, typeCss, useBrand } from "../brand";

type CtaScene = Extract<Scene, { kind: "cta" }>;

/**
 * Final card. Editorial CTA (not spoken) is visual only and never enters the SRT.
 * Long enough to read; no empty black tail.
 */
export const CTA: React.FC<{ scene: CtaScene }> = ({ scene }) => {
  const c = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = enter(c, frame, 0, 14);
  const p2 = enter(c, frame, 8, 14);
  const s = c.slots.ctaBand;
  const textCss = accentTextCss(c, "ctaText");
  return (
    <AbsoluteFill style={{ background: grad(c, "night") ?? bgColor(c) }}>
      <div style={{ position: "absolute", left: s.x, top: s.y - 120, width: s.w }}>
        {c.t.logo ? <CanvasImage src={staticFile(c.t.logo)} premountFor={fps} style={{ width: 132, height: 132, borderRadius: 30, marginBottom: 40, opacity: p, scale: 0.9 + 0.1 * p }} /> : null}
        <div style={{ ...typeCss(c, "headline"), ...textCss, opacity: p, translate: `0px ${Math.round((1 - p) * 40)}px` }}>{typograph(scene.text, c.language)}</div>
        {scene.sub ? <div style={{ ...typeCss(c, "eyebrow", { sizeMul: 1.2 }), color: accentColor(c), marginTop: 28, opacity: p2 }}>{scene.sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};
