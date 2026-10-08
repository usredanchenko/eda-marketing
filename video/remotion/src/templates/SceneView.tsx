import type { Scene } from "@mos/core";
import { AppDemo } from "../components/AppDemo";
import { AnimatedMetric, FeatureCallout, LowerThird, ProgressBar } from "../components/Callouts";
import { CommentOverlay } from "../components/CommentOverlay";
import { CTA } from "../components/CTA";
import { Footage } from "../components/Footage";
import { HookText } from "../components/HookText";
import { MessageBubble } from "../components/MessageBubble";
import { MotionInsert } from "../components/MotionInsert";
import { NotificationCard } from "../components/NotificationCard";
import { PreviewFrame } from "../components/PreviewFrame";
import { ShotPlaceholder } from "../components/ShotPlaceholder";
import { SplitScreen } from "../components/SplitScreen";

/** Maps a data scene to its reusable component. Adding a scene kind = schema + component + one case here. */
export const SceneView: React.FC<{ scene: Scene }> = ({ scene }) => {
  switch (scene.kind) {
    case "footage":
      return <Footage scene={scene} />;
    case "placeholder":
      return <ShotPlaceholder scene={scene} />;
    case "screen":
      return <AppDemo scene={scene} />;
    case "preview":
      return <PreviewFrame scene={scene} />;
    case "motion":
      return <MotionInsert scene={scene} />;
    case "title":
      return <HookText scene={scene} />;
    case "card":
      return <NotificationCard scene={scene} />;
    case "comment":
      return <CommentOverlay scene={scene} />;
    case "message":
      return <MessageBubble scene={scene} />;
    case "feature":
      return <FeatureCallout scene={scene} />;
    case "metric":
      return <AnimatedMetric scene={scene} />;
    case "split":
      return <SplitScreen scene={scene} />;
    case "cta":
      return <CTA scene={scene} />;
    case "lowerThird":
      return <LowerThird scene={scene} />;
    case "progress":
      return <ProgressBar scene={scene} />;
  }
};
