---
name: script-writer
description: Writes a timecoded short-video script (Visual / Speech / Text / Sound / Motion) in the author's natural voice and the brand's language, with checks for speech pace, facts and banned phrases. Use for the script stage of a package or when the user asks to write or rewrite a video script.
argument-hint: <package-id>
---

# script-writer

## Input
`BRIEF.md` (current block), the selected idea and hook, `brands/<brand-id>/TONE_OF_VOICE.md`, `PRODUCT_FACTS.md`, `FORBIDDEN_CLAIMS.md`, the template (`TEMPLATE_PRESETS` in `packages/core/src/templates.ts` — structure by roles), `analytics/learnings/LEARNINGS.md`. Optional, if installed: `viral-short-form` (structure), `video` (production reference only, not a reason for paid generators).

## Structure
A complete thought: **hook → setup/development or contrast → turn → payoff → CTA**. Block roles: `hook | setup | development | turn | payoff | cta`. CTA last, never before the payoff.

## Blocks in `data/script.json` (`ScriptFile`)
- `id` b01…, `startSec`/`endSec` — contiguous from 0; total within the brief's duration.
- `visual` — what is on screen (author / UI / product / graphics), concrete.
- `speech` — what the author says. Mark key words for accents with `*asterisks*` (the caption engine highlights them). A dash marks a pause.
- `onScreenText` — large text/accent (sparingly; do not duplicate speech without a reason).
- `sound`, `motion` — when meaningful; no SFX on every transition.
- `shotIds` — filled by shot-planner. `retention.whyKeepWatching` — an honest answer for every block.
- `claims` — every factual claim about the product: `factId` + status from `facts.yaml`. No fact → `[CONFIRM: …]` in the text and `status: NEEDS_CONFIRMATION`.
- `editorialCta` — on-screen text without voice (never in the SRT).
- `timingSource: "estimated"` until speech is recorded.

## Language
Write in the brand's language (`brand.json → language`), the way the author talks per `TONE_OF_VOICE.md`: direct, short, concrete, no corporate filler. Avoid clichés such as "In today's world", "Imagine…", "Have you ever wondered", "revolutionary", "seamless", "game-changing", "the future is here", "a unique experience"; the full list is `config/lang/<language>/banned-phrases.yaml`. Never squeeze text to fit a timecode; change the block length instead.

## Check
`npm run mos -- script <pkg>` until 0 errors: pace (`brand.json → speech.syllablesPerSec`, block overflow), joins, banned phrases, forbidden claims, payoff of the selected hook. Warnings: fix or explain in `SCRIPT_REVIEW.md`. Then `npm run mos -- md <pkg>` → `SCRIPT.md`.
