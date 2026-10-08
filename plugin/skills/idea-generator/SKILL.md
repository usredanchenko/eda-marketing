---
name: idea-generator
description: Turns research and a topic into 10+ short-video ideas for the active brand, scores each on 9 criteria with the brand's weights, flags repeats from memory and picks a top 3 with reasons. Use for the ideas stage of a package, for /eda-marketing:marketing ideas, or when the user asks "what should I make a video about".
argument-hint: <package-id> | <brand-id> "topic"
---

# idea-generator

## Input
`BRIEF.md`, the package `RESEARCH.md` (or recent `research/trends/*`), `brands/<brand-id>/{BRAND,AUDIENCE,CONTENT_PILLARS,TONE_OF_VOICE,PRODUCT_FACTS}.md`, `memory/index.jsonl` (what was done), `analytics/learnings/LEARNINGS.md`. Optional inspiration, if installed (not for copying): `marketing-ideas`, `viral-short-form` (ideas section).

## Generation rules
- At least **10 genuinely different** ideas: different angles (story → mechanic, contrast, reaction, demo, confession, comparison with everyday life, series). Not 10 variations of one.
- Every idea rests on the real author and the real product. No features or numbers outside `facts.yaml`; if an idea needs an unconfirmed fact, mark `[CONFIRM: …]` and lower `productRelevance`/`authenticity`.
- Pick a fitting template from `packages/core/src/templates.ts`.
- Ideas must matter to the audience in `AUDIENCE.md`, not just to the team. Avoid faceless ads: the author, the viewer's problem, the real product.
- Titles and loglines in the brand's language.

## Scoring (integers 1–5)
`relevance, novelty, audienceFit, visualPotential, emotionalPotential, storytellingPotential, productionComplexity (5 = hard to film), authenticity, productRelevance`. `rationale`: one or two sentences on why (especially novelty and productionComplexity).

## Write and score
1. `data/ideas.json` per the `IdeasFile` schema (`id: i01…`, `title`, `logline`, `template`, `angle`, `scores`, `rationale`, `top: [{ideaId, why}]`).
2. `npm run mos -- ideas <pkg>` — weighted totals (`brand.json → ideaWeights`) + duplicate check against memory. Read warnings: duplicate → change the angle or replace the idea.
3. Top 3: by score, but the choice may differ; explain in `why` (e.g. "quick to film this week", "continues a series").
4. `npm run mos -- md <pkg>` → `IDEAS.md`.

## Answer
Top-3 table: idea · why film it · template · risk. Ask which to take (or accept delegation and record it in `BRIEF.md` assumptions).
