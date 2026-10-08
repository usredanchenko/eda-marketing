import { scaleType, type VideoProps } from "@mos/core";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { grad, gradientText, useBrand } from "../brand";

type Captions = NonNullable<VideoProps["captions"]>;

/**
 * Reusable caption engine renderer. Pages/lines/slots are precomputed by `mos captions build`
 * (Russian grouping rules, real font metrics, UI-zone avoidance). Here we only reveal words at
 * their real start time: replace (style A), accumulate (stepped block, style B), highlight (active word).
 * Hidden words keep their space, so lines never jump while revealing.
 */
export const DynamicCaption: React.FC<{ captions: Captions }> = ({ captions }) => {
  const c = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame / fps) * 1000;
  const page = captions.pages.find((p) => t >= p.startMs && t < p.endMs);
  if (!page) return null;
  const st = c.t.captionStyles[captions.mode];
  const size = scaleType(st.size, c.format);
  const slot = c.slots[page.slot];
  const accentGrad = st.accentGradient ? grad(c, st.accentGradient) : null;
  const pageIn = Math.min(1, (t - page.startMs) / 90);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: slot.x,
          width: slot.w,
          top: slot.y,
          height: slot.h,
          display: "flex",
          flexDirection: "column",
          justifyContent: page.slot === "captionBand" ? "flex-end" : "flex-start",
          alignItems: st.align === "center" ? "center" : "flex-start",
          opacity: pageIn,
        }}
      >
        {page.lines.map((line, li) => (
          <div key={li} style={{ paddingLeft: line.step * st.stepIndent, textAlign: st.align, fontFamily: `"${c.t.fonts.sans}"`, fontSize: size, lineHeight: c.t.type.caption.lineHeight, letterSpacing: c.t.type.caption.letterSpacing, textShadow: st.shadow }}>
            {line.words.map((w, wi) => {
              const shown = captions.mode === "highlight" || t >= w.startMs;
              const appear = captions.mode === "highlight" ? 1 : Math.max(0, Math.min(1, (t - w.startMs) / 70));
              const active = captions.mode === "highlight" && t >= w.startMs && t < w.endMs;
              const emph = w.emphasis;
              const useGrad = emph && accentGrad && size >= 56;
              const style: React.CSSProperties = {
                fontWeight: emph ? st.accentWeight : st.weight,
                color: active ? st.activeColor : emph ? st.accentColor : st.color,
                opacity: shown ? appear : 0,
                // Chrome paints text-shadow over background-clip:text — gradient words get a drop-shadow filter instead.
                ...(useGrad ? { ...gradientText(accentGrad), textShadow: "none", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.85))" } : {}),
              };
              return (
                <span key={wi}>
                  <span style={style}>{w.text}</span>
                  {wi < line.words.length - 1 ? " " : ""}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
