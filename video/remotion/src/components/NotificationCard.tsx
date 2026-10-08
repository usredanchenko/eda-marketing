import type { Scene } from "@mos/core";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { enter, exit, lin } from "../anim";
import { col, typeCss, useBrand } from "../brand";

type CardScene = Extract<Scene, { kind: "card" }>;

const TONE: Record<CardScene["statuses"][number]["tone"], string> = {
  neutral: "statusNeutral",
  info: "statusInfo",
  warn: "statusWarn",
  done: "statusDone",
};

/**
 * A diegetic card (notification, task, support ticket) whose status stamp advances over the scene.
 * Remotion-native; the HyperFrames `notification-card` template is the animated counterpart.
 * Serious UI × trivial problem: the joke is the contrast, not decoration.
 */
export const NotificationCard: React.FC<{ scene: CardScene }> = ({ scene }) => {
  const c = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = Math.round(scene.duration * fps);
  const drop = enter(c, frame, 0, 12);
  const step = Math.max(1, Math.floor((total - 14) / scene.statuses.length));
  const current = Math.min(scene.statuses.length - 1, Math.floor(Math.max(0, frame - 10) / step));
  const stampAt = 10 + current * step;
  const stamp = lin(frame, [stampAt, stampAt + 5], [0, 1]);
  const st = scene.statuses[current];
  const stColor = col(c, TONE[st.tone]);
  const w = Math.min(c.slots.center.w, 900);
  const mono = (k: string) => ({ ...typeCss(c, k), color: col(c, "muted") });
  return (
    <AbsoluteFill style={{ opacity: exit(frame, total) }}>
      <div style={{ position: "absolute", left: (c.width - w) / 2, top: c.slots.headline.y + 40, width: w, translate: `0px ${Math.round((1 - drop) * -140)}px`, opacity: drop, background: col(c, "surface"), border: `2px solid ${col(c, "line")}`, borderRadius: c.t.radii.card ?? 6, boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "18px 26px", borderBottom: `2px solid ${col(c, "line")}`, ...mono("uiLabel") }}>
          <span>{scene.header}</span>
          <span style={{ color: col(c, "accent") }}>{scene.ref}</span>
        </div>
        <div style={{ padding: "26px 26px 30px" }}>
          <div style={{ ...typeCss(c, "headline", { sizeMul: 0.58 }), color: col(c, "text"), marginBottom: 22 }}>{scene.title}</div>
          {scene.rows.map(([label, value], i) => (
            <div key={i} style={{ ...mono("ui"), marginBottom: i === scene.rows.length - 1 ? 18 : 6 }}>
              {label}: <span style={{ color: col(c, "text") }}>{value}</span>
            </div>
          ))}
          {scene.chip ? (
            <span style={{ ...typeCss(c, "uiLabel"), color: col(c, "cardInk"), background: col(c, "accent"), padding: "6px 12px", borderRadius: c.t.radii.chip ?? 3, display: "inline-block" }}>{scene.chip}</span>
          ) : null}
        </div>
        <div style={{ position: "absolute", right: 30, bottom: 26, ...typeCss(c, "eyebrow", { sizeMul: 1.5 }), color: stColor, border: `4px solid ${stColor}`, padding: "8px 16px", rotate: "-8deg", scale: 1.6 - 0.6 * stamp, opacity: stamp }}>{st.label}</div>
      </div>
    </AbsoluteFill>
  );
};
