import path from "node:path";
import {
  assignSlots,
  combinedMargins,
  computeSlots,
  estimateBlock,
  pagesToSrt,
  paginate,
  PlatformsConfig,
  rectToFraction,
  scaleType,
  suppressDuringAccents,
  type TimedWord,
  type VideoProps,
} from "@mos/core";
import { loadBrand } from "../brands/load";
import { exists, readJson, readValidated, writeJson, writeText } from "../lib/fsx";
import { UserError } from "../lib/out";
import { ROOT } from "../lib/paths";
import { propsPath, readData, readProps, type Pkg } from "../package/load";
import { measurer } from "./measure";

export type TimingSource = "estimated" | "transcribed";

/** Words for the timeline: estimated from the script, or real ASR words (already in timeline time). */
export const timelineWords = async (pkg: Pkg, source: TimingSource): Promise<TimedWord[]> => {
  if (source === "estimated") {
    const brand = await loadBrand(pkg.manifest.brand);
    const script = await readData(pkg, "script");
    return script.blocks.flatMap((b) => estimateBlock(b.speech, b.startSec, b.endSec, brand.config.speech.syllablesPerSec).words);
  }
  const file = pkg.abs("transcript", "timeline-words.json");
  if (!exists(file)) throw new UserError("transcript/timeline-words.json is missing — run captions transcribe + captions map first", 2);
  const data = await readJson<{ words: { text: string; startMs: number; endMs: number }[] }>(file);
  return data.words.map((w) => ({ ...w, emphasis: false }));
};

/**
 * Builds caption pages with the brand style and the real font metrics, places them outside UI zones,
 * writes words/pages/SRT and injects the on-screen pages into props.json.
 * SRT keeps every spoken word; on-screen pages hidden under a spoken accent are only suppressed visually.
 */
export const buildCaptions = async (pkg: Pkg, source: TimingSource, format = pkg.manifest.formats[0]) => {
  const brand = await loadBrand(pkg.manifest.brand);
  const props: VideoProps = await readProps(pkg, format);
  const mode = props.captions?.mode ?? brand.config.defaults.captionMode;
  const style = brand.tokens.captionStyles[mode];
  const cfg = await readValidated(path.join(ROOT, "config", "platforms.json"), PlatformsConfig);
  const slots = computeSlots(props.format, combinedMargins(cfg, props.format, props.platforms));
  const size = scaleType(style.size, props.format);
  const indent = mode === "accumulate" ? style.stepIndent * 2 : 0;
  const measure = measurer(brand.tokens, { family: "sans", weight: style.accentWeight, size, letterSpacing: brand.tokens.type.caption.letterSpacing });
  const words = (await timelineWords(pkg, source)).filter((w) => !/\[inaudible\]/i.test(w.text));
  const raw = paginate(words, { mode, maxWidthPx: slots.captionBand.w - indent, measure, protectedPhrases: brand.config.captions.protectedPhrases, language: brand.config.language });
  const placed = assignSlots(raw, { captionBand: rectToFraction(slots.captionBand, props.format) }, props.uiZones);
  const titleSpoken = props.scenes
    .filter((sc) => sc.kind === "title" && sc.suppressCaptions)
    .map((sc) => ({ from: sc.from, duration: sc.duration, spoken: true, slot: "center" }));
  const onScreen = suppressDuringAccents(placed, [...props.accents, ...titleSpoken]);
  await writeJson(pkg.abs("video", "captions", "words.json"), { timingSource: source, verifiedByListening: false, words });
  await writeJson(pkg.abs("video", "captions", "pages.json"), { timingSource: source, mode, pages: placed });
  await writeText(pkg.abs("video", "captions", "speech.srt"), pagesToSrt(placed));
  const next: VideoProps = { ...props, captions: { mode, timingSource: source, pages: onScreen } };
  await writeJson(propsPath(pkg, format), next);
  return { words: words.length, pages: placed.length, onScreen: onScreen.length, mode };
};
