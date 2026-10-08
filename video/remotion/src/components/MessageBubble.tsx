import type { Scene } from "@mos/core";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { enter, exit } from "../anim";
import { col, grad, typeCss, useBrand } from "../brand";

type MessageScene = Extract<Scene, { kind: "message" }>;

/** Messenger-native bubbles: each message pops in at its own time; outgoing uses the brand bubble gradient. */
export const MessageBubble: React.FC<{ scene: MessageScene }> = ({ scene }) => {
  const c = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dark = scene.theme === "dark";
  const out = grad(c, "bubble") ?? col(c, "accent");
  const left = c.slots.center.x;
  const width = c.slots.center.w;
  return (
    <AbsoluteFill style={{ opacity: exit(frame, Math.round(scene.duration * fps)) }}>
      <div style={{ position: "absolute", left, width, top: c.slots.headline.y + 20, display: "flex", flexDirection: "column", gap: 18 }}>
        {scene.messages.map((m, i) => {
          const start = Math.round(m.at * fps);
          const p = enter(c, frame, start, 8);
          if (frame < start) return null;
          const me = m.from === "me";
          return (
            <div key={i} style={{ alignSelf: me ? "flex-end" : "flex-start", maxWidth: "82%", opacity: p, scale: 0.92 + 0.08 * p, translate: `0px ${Math.round((1 - p) * 24)}px`, transformOrigin: me ? "100% 100%" : "0% 100%" }}>
              {m.author && !me ? <div style={{ ...typeCss(c, "uiLabel", { sizeMul: 1.1 }), color: col(c, "text"), opacity: 0.9, textShadow: "0 1px 3px rgba(0,0,0,.8)", margin: "0 0 8px 14px" }}>{m.author}</div> : null}
              <div style={{ ...typeCss(c, "ui", { sizeMul: 1.1 }), padding: "18px 24px", borderRadius: c.t.radii.bubble ?? 22, color: me || dark ? "#ffffff" : col(c, "cardInk"), background: me ? out : dark ? col(c, "bubbleThem", "#1a1a1f") : "#ffffff" }}>{m.text}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
