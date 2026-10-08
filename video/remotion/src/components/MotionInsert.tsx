import { Video } from "@remotion/media";
import type { Scene } from "@mos/core";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";

type MotionScene = Extract<Scene, { kind: "motion" }>;

/**
 * Plays a HyperFrames segment rendered to transparent WebM (VP9 alpha).
 * If the canvas path cannot decode it, @remotion/media falls back to OffthreadVideo with transparency.
 */
export const MotionInsert: React.FC<{ scene: MotionScene }> = ({ scene }) => {
  const { fps, width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Video
        name={`HyperFrames ${scene.segmentId}`}
        src={staticFile(scene.src)}
        muted
        objectFit="contain"
        premountFor={fps}
        fallbackOffthreadVideoProps={{ transparent: true }}
        style={{ width, height }}
      />
    </AbsoluteFill>
  );
};
