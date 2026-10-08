import type { Scene } from "@mos/core";
import { AbsoluteFill, CanvasImage, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { zoomAt } from "../anim";
import { bgColor, col, typeCss, useBrand } from "../brand";

type PreviewScene = Extract<Scene, { kind: "preview" }>;

/**
 * Work-in-progress visuals (blockouts, mockups, concepts, renders) with an honesty label, so they are
 * never presented as the real product. The label sits inside the safe area, in the mono UI style.
 */
export const PreviewFrame: React.FC<{ scene: PreviewScene }> = ({ scene }) => {
  const c = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const z = zoomAt(c, frame, Math.round(scene.duration * fps), scene.zoom.from, scene.zoom.to);
  const label = scene.stage === "real" ? null : scene.honestyLabel;
  return (
    <AbsoluteFill style={{ backgroundColor: bgColor(c), overflow: "hidden" }}>
      <CanvasImage src={staticFile(scene.src)} premountFor={fps} style={{ width: "100%", height: "100%", objectFit: "cover", scale: z }} />
      {label ? (
        <div
          style={{
            position: "absolute",
            left: c.slots.lowerThird.x,
            top: c.slots.headline.y,
            ...typeCss(c, "uiLabel"),
            color: col(c, "text"),
            background: `${bgColor(c)}cc`,
            padding: "10px 16px",
            borderLeft: `4px solid ${col(c, "accent")}`,
          }}
        >
          {label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
