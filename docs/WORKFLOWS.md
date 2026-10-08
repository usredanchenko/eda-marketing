# Workflows

Machine-readable: [`workflows/modes.yaml`](../workflows/modes.yaml) and [`workflows/stages.yaml`](../workflows/stages.yaml). Step-by-step agent instructions: `plugin/skills/marketing/references/*.md`.

## Entry point

```
/eda-marketing:marketing <subcommand> [brand] [mode] ["topic" | path | URL]
```

| Subcommand | What it does |
|---|---|
| `setup` | Prepare a workspace (prerequisites, dependencies, folders). |
| `brand new` / `brand show <id>` | Brand interview that scaffolds `brands/<id>/`; show a brand profile. |
| `video <brand> "<topic>" [mode]` | Create or continue a package and run the stages of the mode. |
| `research <brand> ["topic"]` | Trend and audience research into `research/trends/`. |
| `ideas <brand> ["topic"]`, `next <brand>` | Scored ideas; the next video based on learnings and backlog. |
| `review <path/to/video.mp4>` | Review a finished video (read-only). |
| `analytics import <file> …`, `analytics review` | Import platform stats; interpret them with confidence levels. |
| `reference add <URL>` | Save a reference as an abstract pattern. |
| `status` | `npm run mos -- status` plus a short summary. |

## Modes

Each mode includes the previous one.

| Mode | Stages | Stops |
|---|---|---|
| `quick` | brief (≤3 questions) → 3 ideas → 5 hooks → script → brand-guard | after the script |
| `standard` | + research, ≥10 scored ideas, review by 3 agents, shot list, captions, publish copy | after the summary (waits for a yes) |
| `production` | + footage, edit, motion, sound, QA, draft render | after the draft |
| `deep` | + references, 2–3 script variants, review after the draft | after the draft; final only by gate |

## Stages and gates

```
brief ─gate:brief─▶ research ─▶ ideas ─gate:ideaSelected─▶ hooks ─gate:hooksSelected─▶ script
  ─▶ review (script-critic ∥ retention-editor ∥ brand-guard) ─gate:scriptApproved─▶ shotlist
  ─▶ captions ─▶ publish-copy ─▶ summary ─gate:productionApproved (STOP)─▶ assets ─▶ edit
  ─▶ motion ─gate:motion:<segment>─▶ sound ─▶ qa ─▶ draft ─gate:finalRender─▶ final
  ─gate:publish (the user publishes)─▶ published ─▶ analytics ─▶ learnings
```

| Stage | By | Outputs |
|---|---|---|
| brief | orchestrator | `BRIEF.md` |
| research | `trend-scout` + `researcher` | `RESEARCH.md`, `research/trends/*` (7-day cache) |
| ideas | `idea-generator` + `mos ideas` | `data/ideas.json`, `IDEAS.md` |
| hooks | `hook-lab` | `data/hooks.json`, `HOOKS.md` |
| script | `script-writer` + `mos script` | `data/script.json`, `SCRIPT.md` |
| review | `script-critic` ∥ `retention-editor` ∥ `brand-guard` | `SCRIPT_REVIEW.md` |
| shotlist | `shot-planner` | `data/shotlist.json`, `data/assets.json`, `SHOTLIST.md`, `ASSETS.md` |
| captions | `caption-writer` + `mos captions build` | `video/captions/*`, `video/captions/speech.srt` |
| publish-copy | `content-repurposer` | `data/publish.json`, `captions/*.md`, `PUBLISH.md` |
| summary | orchestrator | IDEA · HOOK · SHOT LIST · SCRIPT · EDIT · MOTION · CAPTION · CTA |
| assets | `footage-ingest` + `mos footage` | `video/footage/index.json`, rough cut in `EDIT_PLAN.md` |
| edit | `editor` | `EDIT_PLAN.md`, `video/props.json`, `video/timeline-manifest.json` |
| motion | `motion-designer` + `mos motion` | `MOTION_BRIEF.md`, `video/motion/<segment>/` |
| sound | `editor` | `SOUND_PLAN.md`, `props.audio` |
| qa | `mos qa` + `video-qa` | `qa/qa-report.json`, `qa/contact-sheet.jpg`, `QA.md` |
| draft | `mos video render` | `renders/draft.mp4` |
| final | `mos video render --final` | `renders/final.mp4` |
| published | the user | `manifest.published` via `mos published` |
| analytics | `mos analytics` + `analytics-review` | `analytics/records.jsonl`, reports, learnings |

Record each gate with the user's verbatim words:

```bash
npm run mos -- approve <package> <gate> --quote "<verbatim>"            # user decision
npm run mos -- approve <package> <gate> --quote "<verbatim>" --by delegated   # user delegated the choice
```

Without the matching gate the system does not start production, render a final, publish, call paid APIs, download models or media, or touch `input/`.

## Briefing

1. Fill the current brief block in `BRIEF.md` from `brand.json` defaults and earlier decisions.
2. Check files, metadata and package state first. Do not ask about facts the workspace already answers.
3. Ask only what is still unknown, in one block: goal and audience, platform and framing, duration, footage, speech, music and rights, on-screen text, what is forbidden, the expected result. `quick` mode asks at most 3 questions.
4. Copy the user's answers verbatim into `BRIEF.md`.
5. When the user delegates a choice, record it under assumptions marked `delegated` and continue.
6. No answer is not permission. A default option, a timeout or an empty form is not an answer.
7. A concrete edit request (change the font, swap the track, remove a duplicate) is permission for that edit and its dependent layers; it needs no new brief.

## Footage (`input/`)

```bash
npm run mos -- footage <package> --from input/<folder>
```

Produces metadata, sha256, proxies only when needed (MOV/HEVC, rotation, larger than 1920), speech and silence ranges, and scene cuts. The rough cut is a section of `EDIT_PLAN.md`. The source → timeline mapping is `video/props.json` → `video/timeline-manifest.json` (`mos video manifest`). Originals are never modified, moved or deleted.

## Feedback loop

`analytics import` → `analytics report` (n and confidence) → `/eda-marketing:analytics-review` → `analytics/learnings/LEARNINGS.md` (hypothesis → supported / rejected, only with data and the user's agreement) + `analytics/experiments.yaml` → `/eda-marketing:marketing next` and `idea-generator` read the learnings. Details: [ANALYTICS.md](ANALYTICS.md).

## Example run

Rehearse the whole `production` path on the fictional brand `acme-focus` without any footage of your own:

```bash
npm run mos -- assets examples          # gradients, test patterns, UI mock screens, synthesized SFX
/eda-marketing:marketing video acme-focus "why a 25-minute timer beats a to-do list" production
```

The run goes through brief, ideas, hooks, script with pace checks, parallel review, shot list, a motion brief and HyperFrames segment, props, estimated captions, a draft render, automatic QA and the `video-qa` visual pass. Placeholders stand in for shots the creator would film. No third-party media is used.
