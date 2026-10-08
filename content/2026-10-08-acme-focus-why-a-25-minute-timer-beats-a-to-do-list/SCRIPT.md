# SCRIPT

> Generated from `data/script.json` by `npm run mos -- md`. Edit the JSON, not this file.

Hook: `h01` · target duration 25–30 s · timing: **estimated (before speech is recorded)**

### 00:00.0–00:04.5 · hook · b01

- **Visual:** S01 Alex at the desk, to camera; lower third 'Alex · solo developer of Acme Focus' (draft: stand-in footage).
- **Speech:** Every morning my to-do list got longer. And I started nothing.
- **Text:** Lower third: Alex · solo developer of Acme Focus. Accent: And I started nothing.
- **Sound:** —
- **Motion:** —
- _Why they keep watching:_ Confession: the viewer recognises the pain. (risk: low)
- Shots: S01

### 00:04.5–00:10.1 · setup · b02

- **Visual:** E01 blockout of the next screen (labeled), then S02 Alex to camera with the beta progress bar.
- **Speech:** I'm Alex, building a focus timer on my own. Three of five beta features shipped.
- **Text:** Honesty label: BLOCKOUT · NOT THE REAL PRODUCT. Progress bar: BETA MILESTONE (3/5).
- **Sound:** —
- **Motion:** Progress bar fills to 3/5.
- _Why they keep watching:_ Who is talking and that this is a real build, not an ad. (risk: medium)
- Shots: E01, S02, G02

### 00:10.1–00:15.9 · development · b03

- **Visual:** S03 Alex reaches for the laptop; G01 notification card (illustration) lands over it.
- **Speech:** A long list makes you choose first. Choosing feels like work — so you open email instead.
- **Text:** Card: ILLUSTRATION · INBOX — Quick question (5 min?)
- **Sound:** ui-notify when the card lands.
- **Motion:** Card enters with a short ease-out; status stamps NEW → OPENED.
- _Why they keep watching:_ The why: the contrast between choosing and doing. (risk: medium)
- Shots: S03, G01

### 00:15.9–00:20.9 · turn · b04

- **Visual:** E02 phone: start screen 'What is the one task?' → cut to the running timer.
- **Speech:** So the app asks one thing: what is the one task? Then one timer starts.
- **Text:** Screen labels: EXAMPLE UI · FICTIONAL APP
- **Sound:** ui-pop on the cut to the running timer.
- **Motion:** Hard cut inside the phone frame.
- _Why they keep watching:_ The product answers the problem from b03. (risk: low)
- Shots: E02

### 00:20.9–00:25.7 · payoff · b05

- **Visual:** G04 title card '25 minutes / one task' (S04 optional cover), then E03 done screen.
- **Speech:** Twenty-five minutes, one task. And no streak to lose if you skip tomorrow.
- **Text:** Title: 25 minutes / one task
- **Sound:** whoosh-soft on the title.
- **Motion:** Title wipe in coral.
- _Why they keep watching:_ The punchline: the rule is small enough to start. (risk: low)
- Shots: S04, E03

### 00:25.7–00:30.0 · cta · b06

- **Visual:** S05 Alex to camera, then G03 CTA card.
- **Speech:** It's in public beta on iOS. Tell me what breaks your focus.
- **Text:** CTA (editorial): Link in bio · ACME FOCUS
- **Sound:** —
- **Motion:** CTA card fades in.
- _Why they keep watching:_ A question to answer in the comments. (risk: medium)
- Shots: S05, G03

**Editorial CTA (on screen only, not in the SRT):** Link in bio

## Claims and facts

- «Three of five beta features shipped.» → acme-focus-beta-progress (PUBLIC_CONFIRMED)
- «The app asks one thing: what is the one task? Then one timer starts.» → acme-focus-what-it-is (PUBLIC_CONFIRMED)
- «No streak to lose if you skip tomorrow.» → acme-focus-no-streaks (PUBLIC_CONFIRMED)
- «It's in public beta on iOS.» → acme-focus-ios-beta (PUBLIC_CONFIRMED)

## Notes

- Fictional example package: speech is a written script for Alex; nothing is recorded yet. Timing is estimated from brand.json syllablesPerSec (not calibrated).
- 'Twenty-five minutes' is the pomodoro-style technique Alex describes, not a claim about the app's default timer length; facts.yaml has no fact for a default duration, so the edit never labels it as a product setting.
- The email/notification card is an illustration and is labeled on screen.
- language is "ru" only because the ScriptFile schema (packages/core/src/schemas/creative.ts) currently accepts z.literal("ru"); the script is English (brand.json → language: en). Switch to "en" once the schema accepts it.
