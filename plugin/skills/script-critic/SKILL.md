---
name: script-critic
description: Independent critique of a video script — logic, the author's voice, clichés, hook promises, facts. Runs the script-critic subagent in a separate context so the script's writer never grades their own work. Use in the script review stage or when the user asks for honest feedback on a script.
argument-hint: <package-id>
---

# script-critic

1. Run the subagent **`eda-marketing:script-critic`** (Agent tool) and pass only paths: `content/<pkg>/data/script.json`, `content/<pkg>/data/hooks.json`, `content/<pkg>/BRIEF.md`, `brands/<brand-id>/TONE_OF_VOICE.md`, `brands/<brand-id>/PRODUCT_FACTS.md`, `brands/<brand-id>/FORBIDDEN_CLAIMS.md`, `config/lang/<language>/banned-phrases.yaml`.
2. In the review stage, run it in parallel with `eda-marketing:retention-editor` and `eda-marketing:brand-guard`.
3. Copy its notes into `SCRIPT_REVIEW.md → script-critic` (short, with block ids), decide what to fix and record it under "Decisions". The orchestrator edits the script, then `npm run mos -- script <pkg>`.
