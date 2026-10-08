import { Audio } from "@remotion/media";
import type { VideoProps } from "@mos/core";
import { interpolate, Sequence, staticFile, useVideoConfig } from "remotion";

/**
 * Voice is the main layer. Music ducks under voice and fades in/out; SFX only where the sound plan says so
 * (each SFX carries a reason). Voice is played from processed copies — originals are never modified.
 */
export const AudioBed: React.FC<{ audio: VideoProps["audio"] }> = ({ audio }) => {
  const { fps } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const voiceAt = (frame: number) => audio.voice.some((v) => frame >= f(v.from) - 6 && frame < f(v.from + v.duration) + 6);
  const m = audio.music;
  return (
    <>
      {audio.voice.map((v, i) => (
        <Sequence key={`v${i}`} name={`Voice ${i + 1}`} from={f(v.from)} durationInFrames={Math.max(1, f(v.duration))} layout="none">
          <Audio src={staticFile(v.src)} trimBefore={f(v.trimStart)} volume={v.volume} />
        </Sequence>
      ))}
      {m ? (
        <Sequence name="Music" from={f(m.from)} durationInFrames={Math.max(1, f(m.duration))} layout="none">
          <Audio
            src={staticFile(m.src)}
            trimBefore={f(m.trimStart)}
            volume={(local) => {
              const g = f(m.from) + local;
              const fade = Math.min(
                interpolate(local, [0, Math.max(1, f(m.fadeIn))], [0, 1], { extrapolateRight: "clamp" }),
                interpolate(local, [f(m.duration) - Math.max(1, f(m.fadeOut)), f(m.duration)], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              );
              return m.volume * fade * (voiceAt(g) ? m.duckTo : 1);
            }}
          />
        </Sequence>
      ) : null}
      {audio.sfx.map((s) => (
        <Sequence key={s.id} name={`SFX ${s.id}: ${s.reason}`} from={f(s.at)} durationInFrames={f(1.5)} layout="none">
          <Audio src={staticFile(s.src)} volume={s.volume} />
        </Sequence>
      ))}
    </>
  );
};
