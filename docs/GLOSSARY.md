# Glossary and naming

One vocabulary for skills, agents, docs, CLI messages and code comments. US English, plain and direct.

## Terms

| Term | Meaning |
|---|---|
| workspace | A clone of this repository. The `mos` engine, brands, packages and renders live here. Commands run from its root: `npm run mos -- <cmd>`. |
| brand | A folder `brands/<brand-id>/` with the brand kit: docs, `brand.json`, `facts.yaml`, `tokens.json`. Brands never mix. `brands/_template/` is the scaffold; `acme-focus` is the fictional example brand. |
| brand kit | The 7 brand docs (`BRAND.md`, `AUDIENCE.md`, `POSITIONING.md`, `CONTENT_PILLARS.md`, `TONE_OF_VOICE.md`, `FORBIDDEN_CLAIMS.md`, `MOTION_LANGUAGE.md`) plus generated `PRODUCT_FACTS.md`. |
| package | One video's self-contained folder `content/YYYY-MM-DD-<brand-id>-<slug>/` (brief, research, ideas, hooks, script, shot list, props, captions, renders, QA, publish copy). |
| brief | `BRIEF.md`: the current brief block, the user's verbatim answers, delegated assumptions, history. |
| gate | A recorded user approval in `manifest.json`: `brief`, `ideaSelected`, `hooksSelected`, `scriptApproved`, `productionApproved`, `motion:<segment>`, `finalRender`, `publish`. Record with `npm run mos -- approve <pkg> <gate> --quote "<verbatim>"` (`--by delegated` when the user delegated the choice). |
| mode | `quick`, `standard`, `production`, `deep` (`workflows/modes.yaml`). |
| animatic / draft | A render with estimated caption timing and placeholders (`renders/draft.mp4`, draft badge on). |
| final render | Only after the `finalRender` gate, real recorded speech, transcribed timing and `draft.enabled=false`. |
| estimated / transcribed timing | Caption timing from the script's syllable rate vs. from ASR of the real voice. |
| fact status | `PUBLIC_CONFIRMED` (may be published, no stronger than `publicWording`), `INTERNAL` (planning only), `NEEDS_CONFIRMATION` (never published), `FORBIDDEN` (never). |
| confirmation marker | `[CONFIRM: <what is missing>]` in scripts and copy when a fact is unknown. Never invent the fact. |
| inaudible marker | `[inaudible]` in a corrected transcript; ask the user, never guess. |
| shot class | `SHOOT_THIS` (the creator films it), `GENERATE_THIS` (the system makes it), `EXISTING_ASSET` (already in `assets/`). |
| honesty label | Required on-screen label for any visual that is not the real product/footage (mockups, blockouts, concepts, illustrative UI, fictional comments). |
| motion segment | A HyperFrames composition rendered to transparent WebM and inserted into Remotion via `<MotionInsert>`. Needs a complete `MOTION_BRIEF.md` section and the `motion:<segment>` gate. |
| caption page | One on-screen caption block; modes `replace`, `accumulate`, `highlight`. |
| accent | A large on-screen phrase (thesis, contrast, turn, conclusion). A spoken accent hides the regular caption it overlaps. |
| editorial text | On-screen text that is not spoken (e.g. a CTA card). It never enters the SRT. |
| language pack | `packages/core/src/lang/<en|ru>.ts`: caption grouping words, typography, syllable counting, stemming. Selected by `brand.json → language`. |
| FACT / OBSERVATION / HYPOTHESIS | Research labels: primary source + date / what was seen where, with sample / interpretation. |

## Names

| Thing | Name |
|---|---|
| Orchestrator | `/eda-marketing:marketing` (subcommands `setup`, `brand`, `video`, `research`, `ideas`, `next`, `review`, `analytics`, `reference`, `status`) |
| Skills / agents | `eda-marketing:<skill>` / `eda-marketing:<agent>` |
| Notification / task card | scene kind `card`, component `NotificationCard`, HyperFrames template `notification-card` |
| Work-in-progress visual | scene kind `preview`, `stage: blockout|mockup|concept|render|real`, component `PreviewFrame` |
| Message bubble transition | HyperFrames template `bubble-transition` |
| Markers | `[CONFIRM: …]`, `[inaudible]` |
| Banned phrases | `config/lang/<en|ru>/banned-phrases.yaml` |
| Brand rules | data in `brand.json` (`defaults.captionMode`, `research.*`, `language`) and the brand kit docs — never in code |

## Commands (engine)

`npm run mos -- <cmd>`: `doctor`, `brand list|new|show|validate|facts`, `tokens`, `new <brand> "<topic>" --mode <mode>`, `status`, `validate`, `md`, `approve`, `stage`, `ideas`, `script`, `footage`, `captions build|transcribe|map|calibrate`, `motion brief|new|check|render`, `video register|manifest|still|render`, `qa`, `analytics import|add|report|experiments`, `memory rebuild|check`, `reference add`, `assets import|restore|verify|sfx|examples`, `published`.

## Style

- US English. Imperative in instructions ("Run…", "Ask…"). Short sentences.
- Keep enum values, file names, JSON keys and CLI flags exactly as in code.
- No marketing fluff in our own docs ("revolutionary", "seamless", "game-changing").
