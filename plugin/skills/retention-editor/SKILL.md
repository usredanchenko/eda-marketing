---
name: retention-editor
description: Retention pass over a script or a finished video — for every block asks "why will the viewer keep watching?" and finds repeats, empty phrases, long setup, static stretches, predictability, early CTA, text overload and missing payoff. Runs the retention-editor subagent. Use in the script review stage or when a video loses viewers.
argument-hint: <package-id> | <path/to/video.mp4>
---

# retention-editor

1. Run the subagent **`eda-marketing:retention-editor`** with paths: `data/script.json` (or the video's frames/transcript from `cache/review/`), `data/shotlist.json` if present, `analytics/learnings/LEARNINGS.md`.
2. Copy its table "Block · Why they keep watching · Risk · Fix" into `SCRIPT_REVIEW.md`. A block without an answer gets changed (the orchestrator edits the script).
3. Rules like "pattern interrupt every N seconds", "cut every N seconds" or universal retention percentages are **not rules** but hypotheses. To test one, add it to `analytics/experiments.yaml` (`status: planned`).
