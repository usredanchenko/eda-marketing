# /eda-marketing:marketing research <brand-id> ["topic"]

1. `npm run mos -- brand show <brand-id>`; themes, queries and communities come from `brand.json → research`.
2. Check the cache: recent (≤ 7 days) files `research/trends/*-<brand-id>*.md`. Reuse them; do not collect again without a reason.
3. Skill `eda-marketing:trend-scout` (WebSearch/WebFetch by default; `last30days` with free sources only if installed; agent `eda-marketing:researcher` for parallel directions).
4. Output: `research/trends/YYYY-MM-DD-<brand-id>[-slug].md` with strict FACT / OBSERVATION / HYPOTHESIS sections, plus: what people discuss, questions they ask, recurring pains, formats and narrative structures (abstract), comment reactions, opportunities for the brand (linked to `CONTENT_PILLARS.md`).
5. New abstract hook patterns → `research/hooks/<brand-id>.md`; audience insights → `research/audience-insights/<brand-id>.md`; competitors → `research/competitors/<brand-id>/`.
6. Answer: 5–8 key findings labeled FACT/OBSERVATION/HYPOTHESIS, and 3–5 directions for videos. No "the algorithm loves X".
