import path from "node:path";
import type { Command } from "commander";
import { loadBrand } from "../brands/load";
import { calibrateRate, transcribe, writeTimelineWords } from "../captions/asr";
import { buildCaptions, type TimingSource } from "../captions/build";
import { exists, readJson, writeJson } from "../lib/fsx";
import { info, ok, UserError, warn } from "../lib/out";
import { loadPackage, readProps } from "../package/load";

type AsrWord = { text: string; startMs: number; endMs: number };

export const registerCaptions = (program: Command) => {
  const cap = program.command("captions").description("Captions: estimated timing, transcription, mapping to the edit, SRT");

  cap
    .command("build <package>")
    .description("Build caption pages (brand style, real font metrics) → video/captions/*, props.json, speech.srt")
    .option("--source <s>", "estimated | transcribed", "estimated")
    .action(async (q: string, o: { source: TimingSource }) => {
      const r = await buildCaptions(await loadPackage(q), o.source);
      ok(`${r.words} words → ${r.pages} pages (${r.mode}), on screen ${r.onScreen}; timing: ${o.source}`);
      if (o.source === "estimated") warn("estimated timing: draft only; final needs recorded speech and transcription");
    });

  cap
    .command("transcribe <package> <source>")
    .description("Local transcription (faster-whisper, no downloads) → transcript/raw-asr.<file>.json")
    .action(async (q: string, source: string) => {
      const pkg = await loadPackage(q);
      const brand = await loadBrand(pkg.manifest.brand);
      const r = await transcribe(pkg, source, "small", brand.config.language);
      ok(`${path.basename(r.out)}${r.cached ? " (cached)" : ""} — draft, not checked by listening`);
    });

  cap
    .command("map <package>")
    .description("Map ASR words (corrected.json, else raw) to edit time using audio.voice from props.json")
    .action(async (q: string) => {
      const pkg = await loadPackage(q);
      const props = await readProps(pkg);
      const out: AsrWord[] = [];
      for (const clip of props.audio.voice) {
        const base = path.basename(clip.src);
        const corrected = pkg.abs("transcript", `corrected.${base}.json`);
        const raw = pkg.abs("transcript", `raw-asr.${base}.json`);
        const file = exists(corrected) ? corrected : raw;
        if (!exists(file)) throw new UserError(`no transcript for ${clip.src}: captions transcribe ${pkg.id} ${clip.src}`, 2);
        const words = (await readJson<{ words: AsrWord[] }>(file)).words;
        const a = clip.trimStart * 1000;
        const b = a + clip.duration * 1000;
        for (const w of words)
          if (w.startMs >= a - 20 && w.endMs <= b + 20)
            out.push({ text: w.text, startMs: Math.round(clip.from * 1000 + w.startMs - a), endMs: Math.round(clip.from * 1000 + w.endMs - a) });
        if (file === raw) warn(`${base}: using raw ASR — check names, numbers and negations, then create corrected.${base}.json`);
      }
      await writeTimelineWords(pkg, out.sort((x, y) => x.startMs - y.startMs));
      ok(`${out.length} words in transcript/timeline-words.json`);
    });

  cap
    .command("calibrate <package> <asrFile>")
    .description("Measure the creator's real speech rate (syllables/s); --write saves it to brand.json")
    .option("--write", "write to brands/<id>/brand.json")
    .action(async (q: string, asrFile: string, o: { write?: boolean }) => {
      const pkg = await loadPackage(q);
      const rate = await calibrateRate(pkg.abs("transcript", asrFile));
      if (!rate) throw new UserError("no words to calibrate on");
      const brand = await loadBrand(pkg.manifest.brand);
      info(`real rate: ${rate} syllables/s (profile now: ${brand.config.speech.syllablesPerSec})`);
      if (o.write) {
        await writeJson(path.join(brand.dir, "brand.json"), { ...brand.config, speech: { ...brand.config.speech, syllablesPerSec: rate, calibrated: true } });
        ok("brand.json updated");
      }
    });
};
