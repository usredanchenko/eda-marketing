import { z } from "zod";
import { AbsoluteFill } from "remotion";
import { TOKENS } from "../brand";
import { FontGuard } from "../components/FontGuard";

/**
 * Stills for the fictional example brand (`npm run mos -- assets examples` renders them to PNG).
 * Clearly fake on purpose: every screen says "EXAMPLE UI", so nobody mistakes them for a real product.
 */
export const EXAMPLE_VARIANTS = ["screen-timer", "screen-task", "screen-done", "blockout", "logo"] as const;
export const ExampleAssetProps = z.object({ variant: z.enum(EXAMPLE_VARIANTS), brand: z.string() });
export const EXAMPLE_SIZES: Record<(typeof EXAMPLE_VARIANTS)[number], [number, number]> = {
  "screen-timer": [1170, 2532],
  "screen-task": [1170, 2532],
  "screen-done": [1170, 2532],
  blockout: [1920, 1080],
  logo: [1024, 1024],
};

const Screen: React.FC<{ c: Record<string, string>; sans: string; mono: string; title: string; big: string; sub: string; ring: number; button: string }> = ({ c, sans, mono, title, big, sub, ring, button }) => (
  <AbsoluteFill style={{ background: c.bg, color: c.text, fontFamily: `"${sans}"`, alignItems: "center" }}>
    <div style={{ marginTop: 150, fontFamily: `"${mono}"`, fontSize: 34, letterSpacing: 6, color: c.muted }}>EXAMPLE UI · FICTIONAL APP</div>
    <div style={{ marginTop: 90, fontSize: 64, fontWeight: 700 }}>{title}</div>
    <div style={{ marginTop: 160, width: 760, height: 760, borderRadius: 380, border: `26px solid ${c.surface}`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={760} height={760} style={{ position: "absolute", inset: -26 }} viewBox="0 0 812 812">
        <circle cx={406} cy={406} r={380} fill="none" stroke={c.accent} strokeWidth={26} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 380 * ring} 9999`} transform="rotate(-90 406 406)" />
      </svg>
      <div style={{ fontSize: 210, fontWeight: 300, letterSpacing: -6 }}>{big}</div>
    </div>
    <div style={{ marginTop: 120, fontSize: 52, color: c.muted }}>{sub}</div>
    <div style={{ marginTop: 160, padding: "40px 120px", borderRadius: 60, background: c.accent, color: c.cardInk, fontSize: 52, fontWeight: 700 }}>{button}</div>
  </AbsoluteFill>
);

export const ExampleAsset: React.FC<z.infer<typeof ExampleAssetProps>> = ({ variant, brand }) => {
  const t = TOKENS[brand] ?? Object.values(TOKENS)[0];
  const c = t.colors as Record<string, string>;
  const { sans, mono } = t.fonts;
  const body = (() => {
    switch (variant) {
      case "screen-timer":
        return <Screen c={c} sans={sans} mono={mono} title="Write the intro" big="18:42" sub="one timer · one task" ring={0.62} button="Pause" />;
      case "screen-task":
        return <Screen c={c} sans={sans} mono={mono} title="What is the one task?" big="25:00" sub="type one task to start" ring={0} button="Start" />;
      case "screen-done":
        return <Screen c={c} sans={sans} mono={mono} title="Session done" big="✓" sub="no streaks · no scores" ring={1} button="Next task" />;
      case "blockout":
        return (
          <AbsoluteFill style={{ background: "#3a3f43" }}>
            {[[180, 520, 420, 360], [700, 380, 300, 500], [1100, 600, 520, 280], [1660, 450, 160, 430]].map(([x, y, w, h], i) => (
              <div key={i} style={{ position: "absolute", left: x, top: y, width: w, height: h, background: ["#8a9095", "#9ba1a6", "#7c8287", "#a7adb1"][i], boxShadow: "30px 30px 0 rgba(0,0,0,.25)" }} />
            ))}
            <div style={{ position: "absolute", left: 0, right: 0, top: 880, height: 200, background: "#565c60" }} />
            <div style={{ position: "absolute", left: 60, top: 50, fontFamily: `"${mono}"`, fontSize: 40, color: "#e8eaeb", letterSpacing: 4 }}>EXAMPLE BLOCKOUT · NOT A REAL PRODUCT</div>
          </AbsoluteFill>
        );
      case "logo":
        return (
          <AbsoluteFill style={{ background: c.accent, alignItems: "center", justifyContent: "center", borderRadius: 220 }}>
            <div style={{ width: 520, height: 520, borderRadius: 260, border: `56px solid ${c.cardInk}`, borderTopColor: "transparent", rotate: "-30deg" }} />
          </AbsoluteFill>
        );
    }
  })();
  return <FontGuard>{body}</FontGuard>;
};
