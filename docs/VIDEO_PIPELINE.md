# Video pipeline

```
input/ (originals, read-only)
  └─ mos footage ─▶ video/footage/index.json (sha256, probe, proxies if needed, speech/silence, cuts)
data/script.json + data/shotlist.json
  └─ editor ─▶ video/props.json   ← the single source of the edit (seconds; scenes, overlays, accents, audio, UI zones)
        ├─ mos captions build ─▶ video/captions/{words,pages}.json + speech.srt → props.captions
        ├─ motion-designer: MOTION_BRIEF.md → gate motion:<segment> → mos motion new / check / render
        │     └─ video/motion/<segment>/renders/<segment>.webm (VP9 with alpha, alpha check, cached by hash)
        ├─ mos video manifest ─▶ video/timeline-manifest.json (source → timeline, seconds and frames)
        └─ Remotion Studio (npm run studio) → mos video render → renders/draft.mp4 → mos qa
                                                       → gate finalRender → renders/final.mp4
```

Remotion is the editor. HyperFrames builds only motion segments described in an approved `MOTION_BRIEF.md`.

## Remotion (`video/remotion`)

- One composition per package and format: `<package-id>-<format>`. `mos video register` generates the registry and brand tokens. Smoke fixtures cover every template preset and the alternate formats (`npm run test:remotion`).
- `SceneTimeline` renders every template. Layer order: background → base scenes → overlays → accents → captions → draft badge → audio.
- **Template presets** (`packages/core/src/templates.ts`) are data: allowed scene kinds, a suggested structure by role (hook, setup, development, turn, payoff, cta) and a duration range. The 13 presets: `TalkingHead`, `TalkingHeadWithBroll`, `ProcessStory`, `DevDiary`, `ProductDemo`, `FounderStory`, `BeforeAfter`, `Reaction`, `ScreenRecording`, `FeatureReveal`, `NewsReaction`, `StoryTime`, `MemeExplainer`.
- **Formats:** 9:16 (1080×1920, default), 1:1, 4:5, 16:9. Layout uses semantic slots (`packages/core/src/layout.ts`) and platform safe areas (`config/platforms.json`, `verified: false` until checked against current platform screenshots).
- **FontGuard** stops the render if a brand font did not load.

### Scene kinds

| Kind | Use | Rules |
|---|---|---|
| `footage` | Recorded video | `fit`: `contain` (full frame, no crop), `cover`, `wideWindow` (letterboxed wide shot); focus and zoom. |
| `placeholder` | A shot not yet filmed or generated | Shows shot id, class and description. Draft only. |
| `screen` | Screenshots or screen recordings, optionally in a phone frame | Honesty `label`; `redact` areas for unconfirmed numbers and personal data; hard cuts inside the frame via `sequence`. |
| `preview` | Work-in-progress visuals | `stage`: `blockout`, `mockup`, `concept`, `render`, `real`. `honestyLabel` is required unless `stage` is `real`. |
| `motion` | A HyperFrames segment (transparent WebM) | Needs the `motion:<segment>` gate. |
| `title` | Large text lines | `suppressCaptions: true` when the title shows the phrase being spoken. |
| `card` | `NotificationCard`: an incoming notification or ticket with statuses | |
| `comment` | A comment overlay | `sourceLabel` on screen; illustrative unless sourced. |
| `message` | Chat bubbles | |
| `feature` | A callout pointing at the UI | `factId` for product claims. |
| `metric`, `progress` | Animated number, progress bar | `factId` must resolve to a `PUBLIC_CONFIRMED` fact (`mos validate`). |
| `split` | Two images or videos side by side | |
| `cta` | Call to action | `editorial: true` keeps it out of the SRT. |
| `lowerThird` | Name and role | |

Studio: `npm run studio`, then open `/<package-id>-9x16` at the URL Studio prints. Edit props in Studio only to experiment; save decisions to `video/props.json`. After seeking, wait for media to decode before judging a frame.

## HyperFrames (`video/hyperframes`)

- CLI 0.8.140 (devDependency), run with `HYPERFRAMES_NO_TELEMETRY=1`, `DO_NOT_TRACK=1`, `HYPERFRAMES_NO_UPDATE_CHECK=1` and the local headless browser from `cache/browsers/`.
- Templates:
  - `notification-card`: an incoming notification or ticket card (title, body, sender, status stamp timing, honesty label).
  - `bubble-transition`: a bubble wipe in the brand gradient.
- `mos motion brief <package> <segment>` checks that the segment's `MOTION_BRIEF.md` section has all 14 fields.
- `mos motion new <package> <segment> --template <name> --duration <sec> --scene <scene-id> [--var key=value…]` copies the template, adds fonts, inlines `tokens.css`, writes the variables, and copies `gsap` (installed from npm) into the segment so it renders offline.
- `mos motion check` runs lint, runtime, layout and contrast checks. `mos motion render` produces the transparent WebM and verifies alpha; renders are cached by input hash (`--force` to rerender).
- Why not a direct runtime integration: the models differ (HTML/GSAP vs React), each layer is easier to verify alone, and a WebM with alpha embeds and caches reliably.

## Speech and captions

- **Before recording:** estimated timing from the script and `brand.json → speech.syllablesPerSec`, marked as estimated. Final render is blocked.
- **After recording:**
  1. `mos captions transcribe <package> <file>`: local faster-whisper in the brand's language. `raw-asr.*` is never edited.
  2. Check names, numbers, negations, endings and quiet words against the audio. Mark unclear words `[inaudible]` and ask.
  3. Save `transcript/corrected.<file>.json` and `CORRECTIONS.md`.
  4. `mos captions map` moves real word timestamps onto the edit timeline.
  5. `mos captions build <package> --source transcribed`.
  6. Optional: `mos captions calibrate <package> <asrFile> --write` stores the measured syllable rate.
- **ASR models:** installing faster-whisper (`uv venv .venv-asr && uv pip install faster-whisper`) and a model into `cache/asr-models` is a download and needs the user's yes.
- **Grouping:** the language pack keeps negations, prepositions, articles, number + unit, names and `protectedPhrases` together. A group appears whole; a page lasts at least 600 ms; captions move out of UI zones; a page is hidden when its phrase is shown as a spoken accent or title (`suppressCaptions`).
- **Overflow** is measured with real font metrics (fontkit), not character counts.
- **Voice:** high-pass, gentle EQ, gentle compression, loudness normalization toward −16 LUFS with true peak ≤ −1 dBTP. No noise reduction and no gate unless the user asks.

## Assets

- `npm run mos -- assets examples` generates the example brand's media locally: ffmpeg gradients and test patterns, rendered UI mock screens, synthesized SFX. No third-party media.
- `assets import` records provenance in `assets/PROVENANCE.jsonl`; `assets verify` checks hashes; `assets restore` rebuilds media that is not in git; `assets sfx` synthesizes sound effects.

## QA (`mos qa`, runs automatically after `video render`)

| Check | What |
|---|---|
| `resolution`, `fps`, `duration`, `codec` | Match props; duration within ±1 frame. |
| `corrupted-media` | Full decode without errors. |
| `audio-stream`, `silent-audio` | Audio present and not silent (unless `expectSilence`). |
| `loudness` | EBU R128 integrated loudness −16 LUFS ±2. |
| `clipping` | True peak ≤ −1 dBTP. |
| `silence-gaps` | Long silent stretches. |
| `blank-frames`, `frozen-frames` | Black and frozen frames. |
| `missing-assets`, `fonts` | Every referenced file exists; brand fonts loaded. |
| `caption-overflow`, `accent-overflow` | Lines fit the slot, measured with real font metrics; safe areas and UI zones respected. |
| `claims-on-screen` | On-screen text linted against forbidden and needs-confirmation patterns and banned phrases. |
| `unclear-speech`, `caption-timing` | No `[inaudible]` left; no estimated timing in a final render. |

Output: `qa/qa-report.json`, `qa/contact-sheet.jpg`, an automatic section in `QA.md`. The `video-qa` subagent reviews the contact sheet and stills. Measurements do not replace a human listening pass; never report one that did not happen.

## Final render

Requires all of: the `finalRender` gate, real recorded speech, transcribed caption timing, `draft.enabled=false`, and a passing QA. Then `npm run mos -- video render <package> --final`.

## Render browser

Chrome Headless Shell matching the tested Remotion version is installed into `cache/browsers/` by `scripts/bootstrap.sh` from the official Chrome for Testing CDN. `remotion.config.ts` picks it up; otherwise Remotion downloads its own.
