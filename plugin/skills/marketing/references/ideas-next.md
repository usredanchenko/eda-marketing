# /eda-marketing:marketing ideas <brand-id> ["topic"] · next <brand-id>

## ideas
1. Brand, research cache (older than 7 days → suggest `research <brand-id>` or run targeted WebSearch).
2. Skill `eda-marketing:idea-generator` without a package: ≥10 ideas scored on 9 criteria (weights from `brand.json → ideaWeights`). Check each: `npm run mos -- memory check "<idea>" --brand <brand-id>`.
3. Save to `memory/backlog.jsonl` (one line per idea: `{"brand","date","title","logline","template","total","status":"backlog"}`).
4. Answer: top 5 with reasons; for each: format, what to film, fact risk.

## next — "what to film next"
1. `npm run mos -- analytics report` (if there is data) and `analytics/learnings/LEARNINGS.md`. Use only findings with confidence ≥ low.
2. `npm run mos -- memory rebuild`; find pillars from `CONTENT_PILLARS.md` not covered recently, series not continued, experiments in `analytics/experiments.yaml` waiting for a video.
3. `memory/backlog.jsonl` + recent research.
4. Answer: 3 next videos (topic, hook type, template, why now, which experiment it advances) and one series recommendation. Say explicitly where data is thin.
