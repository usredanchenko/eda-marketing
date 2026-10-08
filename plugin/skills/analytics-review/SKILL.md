---
name: analytics-review
description: Analyzes performance of the brand's published short videos using only our own data (topics, hook types, duration, visual patterns, CTA, platforms, formats), states a confidence level for every finding, and updates learnings and experiments. Use after importing analytics, for /eda-marketing:marketing analytics review, or when the user asks what worked and why.
argument-hint: [brand-id|all]
---

# analytics-review

1. `npm run mos -- analytics report` → `analytics/reports/YYYY-MM-DD.md` (medians, ranges, n, confidence).
2. Run the subagent **`eda-marketing:analytics-analyst`** with paths: the report, `analytics/records.jsonl`, `memory/index.jsonl`, `analytics/experiments.yaml`, `analytics/learnings/LEARNINGS.md`.
3. Write "Findings" into the report. For each: metric, groups, n, confidence (`none` at n<3 — no finding; `insufficient` 3–4; `low` 5–9; `medium` 10–29; `high` ≥30), alternative explanations (topic, date, platform, length).
4. Questions to answer when data allows: which topics and hook types work; duration **on our data**; recurring visual patterns; CTA results; differences between brands (if several); TikTok vs Instagram vs YouTube; talking head vs product footage vs screen recording; storytelling vs demo.
5. `LEARNINGS.md`: new observations start as `hypothesis`; promotion to `supported`/`rejected` only with data and the user's consent. Update `analytics/experiments.yaml` (results, next experiment). Failures with evidence → `memory/FAILURES.md`.
6. Forbidden: universal conclusions from 2 videos, invented metrics, "the algorithm decided".
