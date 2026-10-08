# /eda-marketing:marketing video <brand-id> "<topic>" [mode]

Goal: a complete package `content/YYYY-MM-DD-<brand-id>-<slug>/`. Stages per mode: `workflows/modes.yaml`.

## A. Pre-production (QUICK / STANDARD / PRODUCTION / DEEP)

1. **Package.** `npm run mos -- new <brand-id> "<topic>" --mode <mode>` (continue an existing package; do not create a new one). Note the id.
2. **Brief.** Fill the current brief block in `BRIEF.md` from `brand.json` and earlier decisions. Ask about unknowns in one block (QUICK ≤ 3 questions). Store answers verbatim under the user's answers. Delegated choices go to assumptions marked `delegated`. `npm run mos -- approve <pkg> brief --quote "…"`.
3. **Research** (STANDARD+): skill `eda-marketing:trend-scout` → `RESEARCH.md` (FACT / OBSERVATION / HYPOTHESIS with sources and dates). Check the `research/trends/` cache first.
4. **Ideas** (STANDARD+): skill `eda-marketing:idea-generator` → `data/ideas.json` (≥10) → `npm run mos -- ideas <pkg>` → top 3 with reasons. If the user neither chose nor delegated, show the top 3 and ask. Choice → `approve <pkg> ideaSelected`. QUICK: 3 ideas without full scoring.
5. **Hooks:** skill `eda-marketing:hook-lab` → `data/hooks.json` (≥5 types, VOICE/VISUAL/TEXT, payoff).
6. **Script:** skill `eda-marketing:script-writer` → `data/script.json` → `npm run mos -- script <pkg>` until 0 errors.
7. **Review** (STANDARD+, in parallel): agents `eda-marketing:script-critic`, `eda-marketing:retention-editor`, `eda-marketing:brand-guard` → record decisions in `SCRIPT_REVIEW.md`, fix the script, rerun `mos script`.
8. **Shot list:** skill `eda-marketing:shot-planner` → `data/shotlist.json` + `data/assets.json` (SHOOT_THIS / GENERATE_THIS / EXISTING_ASSET).
9. **Captions (estimated)** and **publish copy:** skills `eda-marketing:caption-writer` (after props) and `eda-marketing:content-repurposer` → `data/publish.json`.
10. `npm run mos -- md <pkg>` and `npm run mos -- validate <pkg>`.
11. **Summary and stop:** IDEA / HOOK / SHOT LIST / SCRIPT / EDIT / MOTION / CAPTION / CTA. Ask whether to go to production. Answer → `approve <pkg> productionApproved --quote "…"`.

## B. Production (PRODUCTION / DEEP, only after productionApproved)

1. **Footage:** files in `input/` → skill `eda-marketing:footage-ingest` (metadata, proxies, segments, rough cut). Never modify originals.
2. **Edit:** skill `eda-marketing:editor` → `EDIT_PLAN.md`, `SOUND_PLAN.md`, `video/props.json` (preset from the manifest, e.g. `DevDiary`, `ProcessStory`). `npm run mos -- video manifest <pkg>`.
3. **Motion:** skill `eda-marketing:motion-designer` → `MOTION_BRIEF.md` sections → gate `motion:<segment>` → `mos motion new/check/render` → scene `kind: "motion"` in props.
4. **Captions:** `npm run mos -- captions build <pkg>` (`--source transcribed` after recording: `captions transcribe` → review → `corrected.*` → `captions map`).
5. **Studio:** `npm run studio` → open `http://localhost:3100/<pkg>-9x16` in the built-in browser; check frames after decoding, fonts, captions, transitions.
6. **Draft:** `npm run mos -- video render <pkg>` → automatic QA → agent `eda-marketing:video-qa` reviews `qa/contact-sheet.jpg` and stills → `QA.md`.
7. **Final:** only after the `finalRender` gate, with real recorded speech and `draft.enabled=false`: `npm run mos -- video render <pkg> --final`.
8. `npm run mos -- stage <pkg> draft|final`, `npm run mos -- memory rebuild`.

## DEEP adds
Agent `eda-marketing:reference-analyst` on 2–5 references from `research/references/` or new URLs (`reference add`); 2–3 script variants with different hook types, compared in `SCRIPT_REVIEW.md`; a review loop after the draft.

## Never
Invent facts, features or numbers; present blockouts, mockups, concepts or motion as the real product (use `preview` with an honest `stage` and `honestyLabel`); use estimated timing in a final; publish; write to `input/`.
