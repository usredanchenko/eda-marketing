import { typograph, type Accent, type Scene } from "@mos/core";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { enter, exit } from "../anim";
import { accentColor, accentTextCss, grad, textColor, typeCss, useBrand, type BrandCtx } from "../brand";

type TitleScene = Extract<Scene, { kind: "title" }>;
type LineStyle = TitleScene["lines"][number]["style"];

const lineStyle = (c: BrandCtx, style: LineStyle, weight: number, sizeMul = 1): React.CSSProperties => {
  if (style === "mono") return { ...typeCss(c, "ui", { sizeMul: 1.4 * sizeMul }), color: textColor(c) };
  const base = typeCss(c, weight === 300 ? "headlineLight" : "headline", { weight, sizeMul });
  if (style === "accent") return { ...base, color: accentColor(c) };
  if (style === "gradient") {
    return { ...base, ...accentTextCss(c) };
  }
  return { ...base, color: textColor(c) };
};

/** One line that wipes in (clip-path) and slides up, staggered by index. */
const Line: React.FC<{ text: string; css: React.CSSProperties; delay: number; align: "left" | "center" }> = ({ text, css, delay, align }) => {
  const c = useBrand();
  const frame = useCurrentFrame();
  const p = enter(c, frame, delay, c.t.motion.enterFrames + 4);
  return (
    <div style={{ ...css, textAlign: align, opacity: p, translate: `0px ${Math.round((1 - p) * 36)}px`, clipPath: `inset(-20% ${Math.round((1 - p) * 100)}% -30% 0)`, ...(css.backgroundClip === "text" ? { filter: "drop-shadow(0 2px 10px rgba(0,0,0,.45))" } : { textShadow: "0 2px 24px rgba(0,0,0,.35)" }) }}>{typograph(text, c.language)}</div>
  );
};

/** HookText for title scenes: eyebrow + 1–3 lines in the headline or center slot. */
export const HookText: React.FC<{ scene: TitleScene }> = ({ scene }) => {
  const c = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const end = Math.round(scene.duration * fps);
  const slot = c.slots[scene.slot];
  const bg = scene.background === "brand" ? grad(c, "night") : scene.background === "dim" ? "rgba(0,0,0,.45)" : null;
  return (
    <AbsoluteFill style={{ background: bg ?? undefined, opacity: exit(frame, end) }}>
      <div style={{ position: "absolute", left: slot.x, top: slot.y, width: slot.w, minHeight: slot.h, display: "flex", flexDirection: "column", justifyContent: scene.slot === "center" ? "center" : "flex-start", gap: 6 }}>
        {scene.eyebrow ? <Line text={scene.eyebrow} css={{ ...typeCss(c, "eyebrow"), color: accentColor(c), marginBottom: 18 }} delay={0} align="left" /> : null}
        {scene.lines.map((l, i) => (
          <Line key={i} text={l.text} css={lineStyle(c, l.style, l.weight)} delay={3 + i * 5} align="left" />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const SIZE: Record<Accent["size"], number> = { m: 0.75, l: 1, xl: 1.25 };

/** Big semantic accent over the scene (thesis, contrast, turn). Not a subtitle duplicate. */
export const AccentText: React.FC<{ accent: Accent }> = ({ accent }) => {
  const c = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slot = c.slots[accent.slot];
  const style = accent.style === "plain" ? "plain" : accent.style;
  return (
    <AbsoluteFill style={{ opacity: exit(frame, Math.round(accent.duration * fps)) }}>
      <div style={{ position: "absolute", left: slot.x, top: slot.y, width: slot.w, minHeight: slot.h, display: "flex", flexDirection: "column", justifyContent: accent.slot === "center" ? "center" : "flex-start" }}>
        <Line text={accent.text} css={lineStyle(c, style, accent.weight, SIZE[accent.size])} delay={0} align="left" />
      </div>
    </AbsoluteFill>
  );
};
