# SCRIPT_REVIEW — Why a 25-minute timer beats a to-do list

> Example review for a fictional package: written inline in the roles of `script-critic`, `retention-editor` and `brand-guard` (no separate subagents were run). Edits are applied in `data/script.json`.

## Automated check (`npm run mos -- script 2026-10-08-acme-focus-why-a-25-minute-timer-beats-a-to-do-list`)
- 0 errors, 0 warnings (estimated at 4.6 syllables/s, not calibrated).
- First pass: b01 did not fit (needs ~4.42 s, had 4.2 s). Fixed by lengthening b01 to 4.5 s and shifting later blocks; speech rate unchanged.

## script-critic
- The thought is complete: list grows → choosing feels like work → one question, one timer → 25 minutes, one task, no streak → question.
- "Choosing feels like work" is the core line; keep it unchanged.
- Cut "simple" / "hack" phrasing from early drafts; tone stays calm (TONE_OF_VOICE.md).

## retention-editor — "why will the viewer keep watching?"
| Block | Why they stay | Risk | Fix |
|---|---|---|---|
| b01 | Recognisable confession | low | Accent on "And I started nothing." |
| b02 | Who is talking; a real build | medium | Blockout + progress keep the frame changing |
| b03 | The reason behind the pain | medium | Inbox card lands on "open email instead" |
| b04 | The product answers the problem | low | Hard cut task → running timer on "starts" |
| b05 | Small rule, no guilt | low | Title card, then done screen |
| b06 | Question to answer | medium | CTA after the payoff, spoken question + editorial card |

Checked: repetition, empty lines, long setup, visual change, early CTA, text overload, payoff present. "Change the shot every N seconds" is a HYPOTHESIS only.

## brand-guard — facts and restrictions
| Claim | factId | Status | Decision |
|---|---|---|---|
| "One timer starts" / "what is the one task?" | acme-focus-what-it-is | PUBLIC_CONFIRMED | keep |
| "Three of five beta features shipped." | acme-focus-beta-progress | PUBLIC_CONFIRMED | keep, matches publicWording |
| "No streak to lose if you skip tomorrow." | acme-focus-no-streaks | PUBLIC_CONFIRMED | keep |
| "It's in public beta on iOS." | acme-focus-ios-beta | PUBLIC_CONFIRMED | keep |
| "Twenty-five minutes" | — | not a product claim | Technique, not the app's default; never labeled as a setting |
| User numbers, Android, "more productive" | user-count / android / productivity-claims | NEEDS_CONFIRMATION / FORBIDDEN | not used |

## Decisions
- Hook h01 (confession) selected; payoff lands in b05.
- Editorial CTA "Link in bio" stays on screen only (not spoken, not in the SRT).
