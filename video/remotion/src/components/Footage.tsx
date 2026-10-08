import { Video } from "@remotion/media";
import type { Scene } from "@mos/core";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { zoomAt } from "../anim";
import { bgColor, useBrand } from "../brand";

type FootageScene = Extract<Scene, { kind: "footage" }>;

/**
 * Author / b-roll footage.
 * contain — full source frame, all edges kept, no zoom-to-fill;
 * cover — fills the frame around the focus point; wideWindow — 16:9 window with black fields.
 * No colour filters are ever applied.
 */
export const Footage: React.FC<{ scene: FootageScene }> = ({ scene }) => {
  const c = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = Math.round(scene.duration * fps);
  const z = zoomAt(c, frame, dur, scene.zoom.from, scene.zoom.to);
  const origin = `${scene.focus.x * 100}% ${scene.focus.y * 100}%`;
  const video = (style: React.CSSProperties, fit: "contain" | "cover") => (
    <Video
      name={`Footage ${scene.id}`}
      src={staticFile(scene.src)}
      trimBefore={Math.round(scene.trimStart * fps)}
      muted={scene.muted}
      objectFit={fit}
      premountFor={fps}
      style={{ ...style, scale: z, transformOrigin: origin, objectPosition: origin }}
    />
  );
  if (scene.fit === "wideWindow") {
    const h = Math.round((c.width * 9) / 16);
    return (
      <AbsoluteFill style={{ backgroundColor: "#000", justifyContent: "center" }}>
        <div style={{ position: "relative", width: c.width, height: h, overflow: "hidden" }}>{video({ width: c.width, height: h }, "cover")}</div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ backgroundColor: scene.fit === "contain" ? "#000" : bgColor(c), overflow: "hidden" }}>
      {video({ width: c.width, height: c.height }, scene.fit)}
    </AbsoluteFill>
  );
};
