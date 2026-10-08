# /eda-marketing:marketing review <path/to/video.mp4>

Review of a finished video the user owns. The file is read-only.

1. Determine the brand (from the package path or file name; otherwise ask).
2. Technical: `ffprobe` (resolution, fps, duration, audio) and, for a package video, `npm run mos -- qa <pkg> <file>`. Otherwise an `ffmpeg` contact sheet to `cache/review/<name>.jpg` (`fps=1,scale=270:-1,tile=6x6`) and stills at 0 s / 1 s / 3 s / middle / end.
3. Speech: if local ASR is available (`npm run mos -- doctor`), write a transcript to `cache/review/` and mark it as an unverified ASR draft. If not, analyze frames and on-screen text and say so.
4. Agents in parallel: `eda-marketing:retention-editor` (frames + transcript: what happens in the first 1–3 s, where it sags), `eda-marketing:brand-guard` (facts and forbidden claims), `eda-marketing:video-qa` (readability, safe areas, fonts, audio by measurements).
5. Write `research/reviews/YYYY-MM-DD-<name>.md`: hook (what is seen/heard/written), structure, payoff, CTA, text readability, audio (measurements only, never "listened"), fact violations, 3–5 concrete fixes with timecodes, hypotheses for experiments.
