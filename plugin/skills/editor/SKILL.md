---
name: editor
description: Builds the edit of a video package — EDIT_PLAN.md, SOUND_PLAN.md and video/props.json for Remotion (scenes, framing, accents, audio, UI zones) — from the approved script and shot list. Use for the edit and sound stages in production, or when the user asks to re-cut, reframe or remix a video.
argument-hint: <package-id>
---

# editor

## Principles
Build a complete thought first. Change the shot at a thought boundary, a contrast, a key word or an emotional turn; shot length follows content, not a fixed interval. Alternate the author's anchor shot with inserts; every insert has a function. Simple cuts are the base; zoom, fade or a visible transition only at a meaningful point. Keep pauses and breathing; never squeeze every pause to zero or build a sentence from word fragments. Full vertical frame = `fit: "contain"` (all edges kept, no zoom or stretch); wide window = `wideWindow`. No automatic color filters.

## Steps
1. `EDIT_PLAN.md`: main thought → scene order → text mode → accents → ending; a scene table with source → timeline and "why".
2. `video/props.json` per the `VideoProps` schema (`packages/core/src/schemas/video.ts`). Times in seconds. `layer: base` for the main row, `overlay` for cards/messages/callouts. Slots without material: `placeholder`, or `footage` with a `draftNote` ("temporary insert from C006 — replace with S03"). Anything that is not the real product: `kind: "preview"` with an honest `stage` (`blockout|mockup|concept|render`) and a `honestyLabel`; only `stage: real` may go unlabeled. Numbers (`metric`, `progress`) only with a `PUBLIC_CONFIRMED` `factId`.
3. `accents` — few (thesis, contrast, conclusion); `spoken: false` for editorial text. Never show the same phrase as a caption and an accent at once (a spoken accent hides the caption page it overlaps).
4. `uiZones` — where UI/cards sit, so captions move to the alternate band.
5. Audio: `SOUND_PLAN.md` + `audio` in props. Voice is the main layer; music `duckTo` 0.15–0.3 under voice, smooth in/out; SFX only with a `reason` (object appears, scene change, UI action, payoff). Demo without voice: `expectSilence: true`.
6. `npm run mos -- video register`, `npm run mos -- video manifest <pkg>`, `npm run mos -- validate <pkg>`.
7. Check in live Studio (`npm run studio`, `http://localhost:3100/<pkg>-9x16`): after seeking, wait for decoding; check both sides of every cut, captions, accents, ending. A still frame does not verify motion. Do not claim audio was listened to unless it was.
