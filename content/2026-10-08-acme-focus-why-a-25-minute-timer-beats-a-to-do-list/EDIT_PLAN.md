# EDIT_PLAN — Why a 25-minute timer beats a to-do list

Template `DevDiary` · format 9x16 · captions `replace` · 30.0 s · draft (estimated timing, no voice)

## Core idea
A growing list makes you choose before you start → scenes: confession → the build → the distraction → one question, one timer → small rule → question → text: short replace captions, one spoken accent, one spoken title → ending: editorial "Link in bio" card.

## Scenes (global video time)
| # | Time | Scene | Source (source → timeline) | Framing | Transition | Why this scene |
|---|---|---|---|---|---|---|
| 1 | 0.0–4.5 | footage `s01-hook` + lowerThird `s01-lt` 0.6–2.9 | desk-vertical.mp4 0.0 → 0.0 (stand-in for S01) | contain | cut | The confession; who is talking |
| 2 | 4.5–7.6 | preview `s02-blockout` | blockout.png (E01) | cover crop, zoom 1.30→1.36 | cut | "building a focus timer" — labeled work in progress |
| 3 | 7.6–10.1 | placeholder `s02-intro` (S02) + progress `s02-progress` 7.8–10.0 | — | — | cut | Beta milestone 3/5 (`acme-focus-beta-progress`) |
| 4 | 10.1–15.9 | footage `s03-reach` + card `s03-card` 11.0–15.6 | desk-vertical.mp4 4.5 → 10.1 (stand-in for S03) | contain | cut | The distraction, labeled ILLUSTRATION |
| 5 | 15.9–20.9 | screen `s04-start`: task.png, cut at +3.0 s to timer.png | E02 | phone, center | hard cut inside the phone on "starts" | The turn: one question, one timer |
| 6 | 20.9–22.8 | title `s05-title` "25 minutes / one task" | G04 | center, brand bg | cut + whoosh | Payoff; captions suppressed (spoken phrase) |
| 7 | 22.8–25.7 | screen `s05-done` | done.png (E03) | phone, center | cut | "no streak to lose" |
| 8 | 25.7–27.7 | footage `s06-ask` | desk-vertical.mp4 8.5 → 25.7 (stand-in for S05) | contain | cut | The question to camera |
| 9 | 27.7–30.0 | cta `s06-cta` "Link in bio" · ACME FOCUS | G03 | CTA band | fade in | Editorial ending |

## Text
- Regular captions: `replace`, 13 on-screen pages from estimated timing (`video/captions/`).
- Large accents: "And I started nothing." (spoken, 3.0–4.5, headline, gradient); title "25 minutes / one task" (spoken, suppresses captions 20.9–22.8).
- Editorial text (not in the SRT): "Link in bio" · ACME FOCUS; honesty labels; card header "ILLUSTRATION · INBOX".
- Progress label is "BETA MILESTONE" (not "3 of 5…") so it does not duplicate the spoken caption.

## Framing
- Stand-in footage: `contain`. Screens: phone frame. Blockout: `preview` scenes always cover-crop, so the 16:9 example blockout is zoomed past its burned-in label; the props honesty label stays visible.
- Known weak spot (stills): captions over the light-gray blockout (4.5–7.6 s) have less contrast than elsewhere; the caption shadow keeps them readable in the still. Recheck on a phone.

## Checked
- Stills at frames 60, 100, 250, 280, 400, 540, 650, 720, 860 (`renders/stills/`). No full render, no Studio playback, no listening pass.

## Related files
`video/props.json` (composition), `video/timeline-manifest.json` (source → timeline), `video/captions/` (captions).
