---
name: shot-planner
description: Turns an approved script into a practical shot list with 14 fields (ID, Duration, Camera, Framing, Action, Speech, Environment, Lighting, Props, Screen recording, Required asset, Motion graphics, Audio, Notes) and splits shots into SHOOT_THIS (the creator films it), GENERATE_THIS (the system makes it) and EXISTING_ASSET (already in assets/). Use for the shot-list stage or when the user asks what to film.
argument-hint: <package-id>
---

# shot-planner

## Input
`data/script.json`, `BRIEF.md`, `assets/PROVENANCE.jsonl` and `assets/sources.json` (what exists and its limits), `brands/<brand-id>/MOTION_LANGUAGE.md`, `video/footage/index.json` (if ingest already ran).

## Each shot (`data/shotlist.json`, `ShotlistFile`)
- `id` S01…, `duration` (s), `blockIds` (script blocks covered).
- **Camera** — phone/camera, lens/zoom, tripod/handheld, horizon.
- **Framing** — shot size, eye line (upper third, not under text), room for captions (lower third clear), margin for 1:1/4:5.
- **Action** — what the author does / what happens, from which moment.
- **Speech** — the line, or "no speech".
- **Environment**, **Lighting** (window from the side / lamp, no blown-out face), **Props**.
- **Screen recording** — what to capture (app in test mode with fictional data; product build as it really is; what to open, which gestures).
- **Required asset** — the file that must exist; **Motion graphics** — what goes on top; **Audio** — what is heard / SFX; **Notes** — takes, safety shots.
- `class`: SHOOT_THIS / GENERATE_THIS / EXISTING_ASSET; `assetId` for existing assets; `draftSubstitute` — what temporarily fills the slot in the draft (e.g. "C006 from an earlier video, muted").

## Rules
- A SHOOT_THIS shot must be filmable without a call: everything concrete (light, phone position, number of takes).
- Never promise on screen what does not exist: no real product footage → a screen recording of what really exists, or a `preview` with an honest `stage` and `honestyLabel` (blockout, mockup, concept, illustrative UI, fictional comments).
- Real product first. Privacy: test accounts and fictional data only; no real users' names or messages.
- Fill `data/assets.json` in parallel (id, class, type, path or null, status READY/PLACEHOLDER/MISSING/NEEDS_RIGHTS, provenanceId, limitation).
- `npm run mos -- md <pkg>` → `SHOTLIST.md` (sections SHOOT_THIS / GENERATE_THIS / EXISTING_ASSET) and `ASSETS.md`.
