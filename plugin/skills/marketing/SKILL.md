---
name: marketing
description: Main orchestrator of the eda-marketing short-form video pipeline (research → ideas → hooks → script → shot list → Remotion montage → HyperFrames motion → captions → publish copy → QA → analytics → next video). Subcommands setup, brand, video, research, ideas, next, review, analytics, reference, status. Use when the user types /eda-marketing:marketing or asks to set up the workspace, onboard a brand, or make, research, review or analyze a short video for a brand.
argument-hint: <setup|brand|video|research|ideas|next|review|analytics|reference|status> [brand-id] [quick|standard|production|deep] ["topic" | path | URL]
disable-model-invocation: true
---

# /eda-marketing:marketing — orchestrator

Arguments: `$ARGUMENTS`

Talk to the user in the user's language. Write user-facing content (scripts, captions, publish copy) in the brand's language (`brand.json → language`, `en` or `ru`).

## 0. Workspace
The engine needs a workspace: a directory whose `package.json` has `"name": "eda-marketing"` and that contains `engine/src/cli.ts`. Look in this order:
1. The current directory and its parents.
2. `$EDA_MARKETING_HOME`.
3. `~/eda-marketing`.

`cd` into the first match before any `npm run mos -- <cmd>`. No workspace found → run the `setup` subcommand (ask first; see below).

## 1. Parse the command
1. Subcommand = first word. Mode = `quick|standard|production|deep`, otherwise `brand.json → defaults.mode`. The rest (quoted) is the topic, path or URL.
2. Brand: a word matching a folder in `brands/` (ignore `_template`). Not given → `npm run mos -- brand list`: exactly one brand → use it; several → ask one question; none → `brand new`. Never mix brands.
3. Load the matching reference and follow it strictly:

| Subcommand | Reference |
|---|---|
| `setup [dir]` | [references/setup.md](references/setup.md) |
| `brand new` / `brand <brand-id>` | [references/brand.md](references/brand.md) |
| `video <brand-id> "<topic>"` | [references/video.md](references/video.md) |
| `research <brand-id> ["topic"]` | [references/research.md](references/research.md) |
| `ideas <brand-id> ["topic"]` / `next <brand-id>` | [references/ideas-next.md](references/ideas-next.md) |
| `review <path/to/video.mp4>` | [references/review.md](references/review.md) |
| `analytics import <file> …` / `analytics review` | [references/analytics.md](references/analytics.md) |
| `reference add <URL>` | skill `eda-marketing:reference` |
| `status` | `npm run mos -- status` + a short summary |

## 2. Always before work
- `npm run mos -- brand show <brand-id>`; read `brands/<brand-id>/BRAND.md`, `TONE_OF_VOICE.md`, `PRODUCT_FACTS.md`, `FORBIDDEN_CLAIMS.md` (+ `MOTION_LANGUAGE.md` for production).
- `npm run mos -- memory check "<topic>" --brand <brand-id>`. A repeat → propose a new angle or a series continuation.
- Pipeline and gates per mode: `workflows/modes.yaml`; stage descriptions: `workflows/stages.yaml`.

## 3. Delegation
- Generation runs inline via skills: `eda-marketing:trend-scout`, `idea-generator`, `hook-lab`, `script-writer`, `shot-planner`, `caption-writer`, `content-repurposer`, `editor`, `motion-designer`, `footage-ingest`.
- Evaluation runs in subagents (Agent tool), **in parallel** and independently: `eda-marketing:script-critic`, `eda-marketing:retention-editor`, `eda-marketing:brand-guard`; in production also `eda-marketing:video-qa`. Pass only file paths of the package and brand. You apply their findings.
- Third-party skills are not bundled. If installed (see `docs/THIRD_PARTY_SKILLS.md`): `viral-hooks`, `viral-short-form`, `viral-captions-and-ctas`, `product-marketing`, `social`, `marketing-ideas`, `video`, `last30days` serve as reference frameworks only. Their claims about platform algorithms are hypotheses. `video` is no reason to use paid AI generators.

## 4. Gates
Record user decisions verbatim: `npm run mos -- approve <pkg> <gate> --quote "<verbatim>"` (`--by delegated` when the user delegated the choice). Without an explicit yes: no production, no final render, no publishing, no paid APIs, no model/media downloads, no writes to `input/` or other projects.

## 5. Answer to the user
Short, in the user's language, no internal plumbing: **IDEA · HOOK · SHOT LIST · SCRIPT · EDIT · MOTION · CAPTION · CTA**, links to package files, what needs confirmation (`NEEDS_CONFIRMATION`, `[CONFIRM: …]`), what was not verified (e.g. audio not listened to). Then stop and ask whether to move to production.

Studio: `npm run studio` → `http://localhost:3100/<package-id>-9x16`.
