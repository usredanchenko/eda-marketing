---
name: hook-lab
description: Creates at least 5 genuinely different hooks for a video package (curiosity, conflict, unexpected statement, visual surprise, question, confession, result-first, story opening, demonstration, controversial opinion), each with VOICE, VISUAL and TEXT and a required payoff inside the video. Use for the hooks stage or when the user wants stronger openings.
argument-hint: <package-id>
---

# hook-lab

## Input
The selected idea (`data/ideas.json` + `manifest.selected`), `BRIEF.md`, `brands/<brand-id>/TONE_OF_VOICE.md`, `memory/index.jsonl` (hooks already used — do not repeat type + wording back to back), `analytics/learnings/LEARNINGS.md`. Optional, if installed: `viral-hooks` for archetypes and critique (see `docs/THIRD_PARTY_SKILLS.md`); its algorithm claims are not facts.

## Rules
- ≥5 hooks of **≥5 different types** (the schema checks). 6–7 if there are strong options.
- Each hook has:
  - **VOICE** — what is heard in the first 1–3 s, natural speech in the brand's language, the way the author talks (examples in `TONE_OF_VOICE.md`).
  - **VISUAL** — what the first frame shows (real footage, real UI or brand graphics, not an abstraction; non-real visuals carry an honesty label).
  - **TEXT** — on-screen text (≤ 70 characters; does not repeat the voice word for word without a reason).
  - **payoffBlockId + payoff** — where and how the promise is kept. No payoff, no hook (no clickbait).
  - **risk** — why it might fail (unclear without context, sounds like an ad, needs an unconfirmed fact…).
- Controversial means "debatable but defensible": no insults, no unconfirmed claims about competitors.
- No facts outside `facts.yaml`; unknown → `[CONFIRM: …]`.
- Banned clichés: `config/lang/<language>/banned-phrases.yaml`.

## Write
`data/hooks.json` (`ideaId`, `hooks[]` with `selected`). Recommend 1–2 and explain why. After the user chooses: `selected: true`, `npm run mos -- approve <pkg> hooksSelected --quote "…"`, `npm run mos -- md <pkg>`. `payoffBlockId` must match a script block; `mos script` checks it.
