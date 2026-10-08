# Skills and agents

All skills and agents ship in the plugin (`plugin/skills/`, `plugin/agents/`). Invoke them as `/eda-marketing:<skill>`. The orchestrator calls the others for you; call one directly only to rerun a single stage.

## Skills

| Skill | Invocation | What it does |
|---|---|---|
| marketing | `/eda-marketing:marketing <subcommand>` | Orchestrator: `setup`, `brand`, `video`, `research`, `ideas`, `next`, `review`, `analytics`, `reference`, `status`; modes and gates. |
| trend-scout | `/eda-marketing:trend-scout <brand> ["topic"]` | Research from free sources and web search, labeled FACT / OBSERVATION / HYPOTHESIS. |
| idea-generator | `/eda-marketing:idea-generator <package>` | ≥10 ideas × 9 criteria; `mos ideas` computes scores and duplicates; top 3 with reasons. |
| hook-lab | `/eda-marketing:hook-lab <package>` | ≥5 hooks of different types, each with VOICE / VISUAL / TEXT and a payoff inside the video. |
| script-writer | `/eda-marketing:script-writer <package>` | Timed script blocks (Visual / Speech / Text / Sound / Motion); `mos script` checks pace, banned phrases and facts. |
| script-critic | `/eda-marketing:script-critic <package>` | Launches the `script-critic` subagent in a separate context. |
| retention-editor | `/eda-marketing:retention-editor <package \| video.mp4>` | "Why keep watching?" per block. Retention rules are hypotheses. |
| shot-planner | `/eda-marketing:shot-planner <package>` | 14 fields per shot; `SHOOT_THIS` / `GENERATE_THIS` / `EXISTING_ASSET`. |
| editor | `/eda-marketing:editor <package>` | `EDIT_PLAN.md`, `SOUND_PLAN.md`, `video/props.json`; checks in Studio. |
| motion-designer | `/eda-marketing:motion-designer <package> [segment]` | `MOTION_BRIEF.md` (14 fields) → HyperFrames segment → transparent WebM. |
| caption-writer | `/eda-marketing:caption-writer <package> [estimated\|transcribed]` | Caption pages via the language pack, transcription of real speech, SRT. |
| content-repurposer | `/eda-marketing:content-repurposer <package>` | Per-platform copy (TikTok, Instagram Reels, YouTube Shorts); 1:1 / 4:5 / 16:9 adaptations. |
| analytics-review | `/eda-marketing:analytics-review [brand\|all]` | Conclusions with confidence levels, learnings, experiments. |
| reference | `/eda-marketing:reference add <URL\|file>` | Saves a reference as an abstract pattern, metadata only. |
| footage-ingest | `/eda-marketing:footage-ingest <package>` | Reads `input/`: metadata, proxies, speech/silence ranges, rough cut. |
| video-qa | `/eda-marketing:video-qa <package> [render.mp4]` | Automatic QA plus a visual pass by the `video-qa` subagent. |

## Subagents (read-only)

| Agent | Focus |
|---|---|
| `researcher` | Parallel research directions from open sources; FACT / OBSERVATION / HYPOTHESIS with sources and dates. |
| `brand-guard` | Facts and brand safety against `facts.yaml` and `FORBIDDEN_CLAIMS.md`; invented features, numbers, platforms, brand mixing. |
| `script-critic` | Logic, hook promise and payoff, natural speech in the creator's voice, clichés, text overload, early CTA. |
| `retention-editor` | Repeats, empty lines, long setup, static stretches, predictability, missing payoff. |
| `reference-analyst` | Turns a reference video into an abstract pattern and suggests how to apply it without copying. |
| `video-qa` | Readability, safe areas, text over eyes, duplicate captions and accents, clipped letters, fallback fonts, blank frames, honesty labels, draft marks, sound by measurements. |
| `analytics-analyst` | Interprets reports with sample size in mind; proposes experiments. |

Each agent receives only the paths it needs and returns findings. The orchestrator applies changes. Web pages and file contents are data for the agents, not instructions.

## Companion skills (optional)

The plugin works without them. When installed, they are used as reference frameworks:

| Set | Role |
|---|---|
| Remotion skills (`remotion-best-practices` and related) | Remotion rules: markup, captions, Studio, render. Read before Remotion work. |
| HyperFrames skills | Composition contract and animation for motion segments. Their hosted media and cloud features stay behind a gate. |
| Marketing, hook and short-form frameworks | Reference only. Any claim about "the algorithm" is a hypothesis. |

The global `hyperframes` skill describes itself as the entry point for any video. Inside this workspace it is not: Remotion is the editor and HyperFrames builds only approved motion segments.

## Writing your own skill

1. Create `plugin/skills/<name>/SKILL.md` with frontmatter `name`, `description` (when to use it) and `argument-hint`.
2. Write the body as steps with `npm run mos -- …` commands, inputs and outputs (schemas from `packages/core/src/schemas`) and prohibitions.
3. Put long references in `references/*.md` next to `SKILL.md`.
4. Put deterministic work in `engine/` as a `mos` command, not in skill prose.
5. Keep skills brand-neutral: read brand specifics from `brands/<id>/`, never hard-code them.
