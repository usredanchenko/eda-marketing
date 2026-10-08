---
name: reference
description: Reference library — saves someone else's (or your own) short video as an abstract pattern (hook, narrative, pacing, camera, text, transitions, payoff, CTA, audience response) without a frame-by-frame copy. Use for /eda-marketing:marketing reference add or whenever the user shares a link to an example video they like.
argument-hint: add <URL|file path> [--brand <brand-id>] [--note "why we save it"]
---

# reference

1. `npm run mos -- reference add <URL|file> --brand <brand-id> --note "…"` — metadata only (yt-dlp `--skip-download`, cached). **Download the video itself only with the user's explicit yes** for that specific link. The user's local files may be read.
2. Run the subagent **`eda-marketing:reference-analyst`**: pass `research/references/<id>/reference.json`, the metadata, the user's note and (if present) frames/transcript from `cache/references/`. Comments only if available without login; never store personal data.
3. Fill `pattern` in `reference.json` and `PATTERN.md`: hook (what is seen/heard/written in the first seconds), narrative, pacing (where the shot changes and why), camera, text (mode, hierarchy), transitions, payoff, CTA, audienceResponse. `applicability` — how to apply it to the active brand with its own means; `doNotCopy` — what must not be carried over; `confidence` — how sure we are (metadata only → low). A transcript from ASR is a draft; say so.
4. A new hook pattern → `research/hooks/<brand-id>.md` (abstract).
