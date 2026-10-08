---
name: caption-writer
description: Builds on-screen captions for a video package with the caption engine (meaning-based word groups, safe areas, UI avoidance), transcribes real recorded speech into a corrected transcript, and produces the SRT. Use for the captions stage, after recording speech, or when captions are out of sync, split badly or duplicated. Platform post text is content-repurposer's job.
argument-hint: <package-id> [estimated|transcribed]
---

# caption-writer

Three separate things: **on-screen captions** (`video/captions/`, `props.captions`, `speech.srt`); **post text** (`captions/<platform>.md`, skill `eda-marketing:content-repurposer`); **editorial text** (`accents` with `spoken: false`, `editorialCta`) — never in the SRT.

Caption text is in the brand's language (`brand.json → language`). Grouping, typography and syllable rules come from the language pack (`packages/core/src/lang/<en|ru>.ts`).

## Before recording (draft)
`npm run mos -- captions build <pkg>` — estimated timing from the script (`brand.json → speech.syllablesPerSec`), "ESTIMATED TIMING" badge, final render blocked.

## After recording
1. `npm run mos -- footage <pkg>` (if sources are in `input/`).
2. `npm run mos -- captions transcribe <pkg> <voice file>` — local faster-whisper, no downloads. No model → ask permission before installing (`docs/VIDEO_PIPELINE.md`).
3. ASR is a draft. Check names, numbers, negations, word endings, quiet words, phrase boundaries. Fixes go to `transcript/corrected.<file>.json` + a line in `transcript/CORRECTIONS.md`; `transcript/raw-asr.*` is immutable. Unclear → `[inaudible]` + ask the user; never guess. Never claim you listened if you did not.
4. If real speech differs from the script, show the difference and decide with the user (keep speech / re-edit / re-record). Captions follow the actual speech; never add words that are not in the audio.
5. `npm run mos -- captions map <pkg>` → `npm run mos -- captions build <pkg> --source transcribed`.
6. Optional: `npm run mos -- captions calibrate <pkg> raw-asr.<file>.json --write` — the author's real pace into `brand.json`.

## Modes and grouping
Default mode: `brand.json → defaults.captionMode`; per video: `props.captions.mode`. `replace` — short groups replace each other; `accumulate` — words build a small stepped block; `highlight` — on request. Emphasis: `*word*` in script speech (for transcribed speech, mark `emphasis` in `corrected`).
Group by meaning. Never split a negation from its verb ("don't / know"), a preposition from its word ("in / the app"), a number from its unit ("30 / seconds"), or a name. Avoid one dangling word on a line. Keep `brand.json → captions.protectedPhrases` intact. Russian rules live in the ru language pack.

## Check
Studio: start/end of each page, caption-to-accent handoff without duplicates, readability on a phone, no text over the eyes. `mos qa` checks line overflow with real font metrics.
