---
name: footage-ingest
description: Ingests raw footage from input/ for a video package — metadata, proxies when needed, speech/silence/scene segments, a rough-cut plan and the source → timeline mapping. Originals are never modified, moved or deleted. Use when the user has dropped recordings into input/ or asks to process their footage.
argument-hint: <package-id> [input/subfolder]
---

# footage-ingest

1. The user puts files in `input/` (preferably `input/<package-id>/`). The folder is read-only; the workspace deny rules block writes there.
2. `npm run mos -- footage <pkg> --from input/<subfolder>` → `video/footage/index.json`: sha256, resolution, rotation, fps, duration, codecs; a proxy (H.264, 1920 px tall, no color filters) only if the source is MOV/HEVC, rotated or larger than 1920; speech/silence/scene segments.
3. Rough-cut plan as a section in `EDIT_PLAN.md`: which segments (source in/out) map to which script blocks, takes, what is unusable (focus, noise, flubs — judged by frames and transcript), what is missing vs. `SHOTLIST.md` (SHOOT_THIS → filmed / not filmed).
4. Speech: `npm run mos -- captions transcribe <pkg> <file>` (ASR draft; `raw-asr.*` stays untouched) → review → `corrected.*`, `[inaudible]` where unclear. Do not squeeze pauses to zero or assemble phrases from word fragments.
5. Voice: a processed copy only — EQ, gentle compression, normalization (no noise reduction, no gate, no hidden speech restoration). The original stays untouched. Record parameters in `SOUND_PLAN.md`. Loudness numbers are measurements, not proof it was listened to.
6. The source → timeline mapping lives in `video/props.json` and is exported to `video/timeline-manifest.json` (`npm run mos -- video manifest <pkg>`).
