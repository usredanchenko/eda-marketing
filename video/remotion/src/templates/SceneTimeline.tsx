import { useMemo } from "react";
import type { VideoProps } from "@mos/core";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { BrandProvider, makeBrandCtx } from "../brand";
import { AudioBed } from "../components/AudioBed";
import { Background, DraftBadge, SafeAreaDebug } from "../components/Chrome";
import { DynamicCaption } from "../components/DynamicCaption";
import { FontGuard } from "../components/FontGuard";
import { AccentText } from "../components/HookText";
import { SceneView } from "./SceneView";

/**
 * The one generic renderer behind all 13 templates. Content never lives here: everything comes from props
 * (content/<id>/video/props.json). Layer order: background → base scenes → overlays → accents → captions → draft badge.
 * Global timing is in seconds in props; each Sequence converts to frames and gives scenes local time.
 */
export const SceneTimeline: React.FC<VideoProps & { showSafeArea?: boolean }> = (props) => {
  const { fps } = useVideoConfig();
  const ctx = useMemo(() => makeBrandCtx(props.brand, props.format, props.platforms), [props.brand, props.format, props.platforms]);
  const f = (s: number) => Math.round(s * fps);
  const layer = (l: "base" | "overlay") =>
    props.scenes
      .filter((s) => s.layer === l)
      .map((s) => (
        <Sequence key={s.id} name={`${l === "base" ? "▣" : "◇"} ${s.kind} · ${s.id}`} from={f(s.from)} durationInFrames={Math.max(1, f(s.duration))} premountFor={fps}>
          <SceneView scene={s} />
        </Sequence>
      ));
  return (
    <BrandProvider value={ctx}>
      <FontGuard>
        <AbsoluteFill>
          <Background kind={props.background} />
          {layer("base")}
          {layer("overlay")}
          {props.accents.map((a) => (
            <Sequence key={a.id} name={`Accent: ${a.text}`} from={f(a.from)} durationInFrames={Math.max(1, f(a.duration))} premountFor={fps}>
              <AccentText accent={a} />
            </Sequence>
          ))}
          {props.captions ? <DynamicCaption captions={props.captions} /> : null}
          {props.draft.enabled ? <DraftBadge label={props.draft.label} scenes={props.scenes} /> : null}
          {props.showSafeArea ? <SafeAreaDebug /> : null}
          <AudioBed audio={props.audio} />
        </AbsoluteFill>
      </FontGuard>
    </BrandProvider>
  );
};
