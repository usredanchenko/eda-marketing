import type { Scene } from "@mos/core";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { enter, exit, lin } from "../anim";
import { accentColor, bgColor, col, textColor, typeCss, useBrand } from "../brand";

type FeatureScene = Extract<Scene, { kind: "feature" }>;
type MetricScene = Extract<Scene, { kind: "metric" }>;
type ProgressScene = Extract<Scene, { kind: "progress" }>;
type LowerThirdScene = Extract<Scene, { kind: "lowerThird" }>;

/** FeatureCallout: a one-line label with a thin leader line to the UI element. Never covers the interface. */
export const FeatureCallout: React.FC<{ scene: FeatureScene }> = ({ scene }) => {
  const c = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = enter(c, frame, 4, 10);
  const tx = scene.target.x * c.width;
  const ty = scene.target.y * c.height;
  const boxY = ty < c.height / 2 ? ty + 160 : ty - 260;
  const boxX = c.slots.center.x;
  return (
    <AbsoluteFill style={{ opacity: exit(frame, Math.round(scene.duration * fps)) }}>
      <svg width={c.width} height={c.height} style={{ position: "absolute", inset: 0 }}>
        <line x1={tx} y1={ty} x2={tx + (boxX + 40 - tx) * p} y2={ty + (boxY - ty) * p} stroke={accentColor(c)} strokeWidth={3} />
        <circle cx={tx} cy={ty} r={10 * p} fill={accentColor(c)} />
      </svg>
      <div style={{ position: "absolute", left: boxX, top: boxY, maxWidth: c.slots.center.w * 0.8, opacity: p, background: col(c, "surface"), borderRadius: c.t.radii.control ?? 8, padding: "14px 20px" }}>
        <div style={{ ...typeCss(c, "uiLabel"), color: accentColor(c), marginBottom: 6 }}>{scene.title}</div>
        <div style={{ ...typeCss(c, "body"), color: textColor(c) }}>{scene.text}</div>
      </div>
    </AbsoluteFill>
  );
};

/** AnimatedMetric: counts up to a value that MUST be a confirmed fact (validated in mos). */
export const AnimatedMetric: React.FC<{ scene: MetricScene }> = ({ scene }) => {
  const c = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = Math.round(lin(frame, [0, Math.round(1.2 * fps)], [0, 1]) ** 0.6 * scene.value);
  return (
    <AbsoluteFill style={{ justifyContent: "center", paddingLeft: c.slots.center.x, opacity: exit(frame, Math.round(scene.duration * fps)) }}>
      <div style={{ ...typeCss(c, "headline", { sizeMul: 1.5 }), color: accentColor(c), fontVariantNumeric: "tabular-nums" }}>{`${scene.prefix}${v.toLocaleString("ru-RU")}${scene.suffix}`}</div>
      <div style={{ ...typeCss(c, "eyebrow"), color: textColor(c) }}>{scene.label}</div>
    </AbsoluteFill>
  );
};

/** ProgressBar: labelled progress — only with a confirmed fact (no fake readiness percentages). */
export const ProgressBar: React.FC<{ scene: ProgressScene }> = ({ scene }) => {
  const c = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fill = enter(c, frame, 6, Math.round(fps)) * scene.value;
  const s = c.slots.lowerThird;
  return (
    <AbsoluteFill style={{ opacity: exit(frame, Math.round(scene.duration * fps)) }}>
      <div style={{ position: "absolute", left: s.x, top: s.y, width: s.w }}>
        <div style={{ ...typeCss(c, "uiLabel"), color: textColor(c), marginBottom: 12 }}>{scene.label}</div>
        <div style={{ height: 10, background: col(c, "line", "#ffffff22"), borderRadius: 5 }}>
          <div style={{ width: `${fill * 100}%`, height: "100%", background: accentColor(c), borderRadius: 5 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** LowerThird: name + role, with a brand accent rule. */
export const LowerThird: React.FC<{ scene: LowerThirdScene }> = ({ scene }) => {
  const c = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = enter(c, frame, 0, 10);
  const s = c.slots.lowerThird;
  return (
    <AbsoluteFill style={{ opacity: exit(frame, Math.round(scene.duration * fps)) }}>
      <div style={{ position: "absolute", left: s.x, top: s.y, borderLeft: `5px solid ${accentColor(c)}`, padding: "12px 22px", background: `${bgColor(c)}d9`, borderRadius: c.t.radii.chip ?? 4, clipPath: `inset(0 ${Math.round((1 - p) * 100)}% 0 0)` }}>
        <div style={{ ...typeCss(c, "headline", { sizeMul: 0.5 }), color: textColor(c) }}>{scene.name}</div>
        <div style={{ ...typeCss(c, "uiLabel"), color: col(c, "muted") }}>{scene.role}</div>
      </div>
    </AbsoluteFill>
  );
};
