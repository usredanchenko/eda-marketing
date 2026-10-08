---
name: video-qa
description: Checks a rendered video before the final render — automatic QA (resolution, fps, duration, clipping, loudness, silence, black/frozen frames, missing assets, fonts, text overflow, safe areas, on-screen facts) plus a visual review of the contact sheet and stills by the video-qa subagent. Use after a draft render, before asking for the finalRender gate, or when the user asks to check a video.
argument-hint: <package-id> [path/to/render.mp4]
---

# video-qa

1. `npm run mos -- qa <pkg> [file]` (default `renders/draft.mp4` or `final.mp4`) → `qa/qa-report.json`, `qa/contact-sheet.jpg`, the automatic section of `QA.md`.
2. Stills of key moments: `npm run mos -- video still <pkg> <frame>` — first frame, hook→setup change, every large accent, each motion segment, the ending.
3. Subagent **`eda-marketing:video-qa`**: pass paths to the report, contact sheet, stills, `props.json`, `MOTION_LANGUAGE.md`. It looks for text over eyes or key action, unreadable text on a phone, duplicated phrases (caption + accent), clipped letters, fallback fonts, safe-area violations, empty frames, missing honesty labels on non-real visuals, leftover draft notes, editorial text in the SRT.
4. Write "Visual check" into `QA.md`. Keep "Not verified" honest: human listening, motion in live Studio (if not watched), unconfirmed safe areas. Loudness numbers are not listening.
5. `fail` → fix and re-render; `warn` → explain in `QA.md` or fix. Final render only after the `finalRender` gate.
