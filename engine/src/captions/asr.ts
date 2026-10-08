import path from "node:path";
import { langPack, syllables, type LanguageId } from "@mos/core";
import { run } from "../lib/exec";
import { exists, readJson, writeJson } from "../lib/fsx";
import { UserError } from "../lib/out";
import { ROOT, safeResolve } from "../lib/paths";
import type { Pkg } from "../package/load";

export const PY_CANDIDATES = () =>
  [process.env.MOS_ASR_PYTHON, path.join(ROOT, ".venv-asr/bin/python")].filter(Boolean) as string[];
export const MODEL_DIRS = () =>
  [process.env.MOS_ASR_MODEL_DIR, path.join(ROOT, "cache/asr-models")].filter(Boolean) as string[];

export const findAsr = async () => {
  for (const py of PY_CANDIDATES()) {
    if (!exists(py)) continue;
    const r = await run(py, ["-c", "import faster_whisper"]);
    if (r.code !== 0) continue;
    const modelDir = MODEL_DIRS().find((d) => exists(d));
    if (modelDir) return { py, modelDir };
  }
  return null;
};

/**
 * Transcribes one source file into transcript/raw-asr.<source>.json (cached by file name).
 * Never downloads models: if nothing is cached locally, the user must approve setup (docs/VIDEO_PIPELINE.md).
 */
export const transcribe = async (pkg: Pkg, sourceRel: string, model = "small", language = "en") => {
  const asr = await findAsr();
  if (!asr) throw new UserError("no local faster-whisper with a cached model. Installing/downloading happens only with your permission (docs/VIDEO_PIPELINE.md)", 2);
  const src = safeResolve(sourceRel);
  const out = pkg.abs("transcript", `raw-asr.${path.basename(src)}.json`);
  if (exists(out)) return { out, cached: true };
  const r = await run(asr.py, [path.join(ROOT, "engine/py/transcribe.py"), src, out, asr.modelDir, model, langPack(language as LanguageId).asrLanguage], { timeoutMs: 30 * 60_000 });
  if (r.code !== 0) throw new UserError(`ASR: ${r.stderr.trim().split("\n").slice(-3).join(" ")}`);
  return { out, cached: false };
};

/** Real speaking rate (syllables per second of voiced time) from transcribed words. */
export const calibrateRate = async (asrFile: string) => {
  const data = await readJson<{ words: { text: string; startMs: number; endMs: number }[] }>(asrFile);
  let syl = 0;
  let ms = 0;
  data.words.forEach((w, i) => {
    syl += syllables(w.text);
    const next = data.words[i + 1];
    const gap = next ? Math.min(Math.max(0, next.startMs - w.endMs), 150) : 0;
    ms += w.endMs - w.startMs + gap;
  });
  return ms ? Math.round((syl / (ms / 1000)) * 10) / 10 : null;
};

export const writeTimelineWords = (pkg: Pkg, words: { text: string; startMs: number; endMs: number }[]) =>
  writeJson(pkg.abs("transcript", "timeline-words.json"), { verifiedByListening: false, words });
