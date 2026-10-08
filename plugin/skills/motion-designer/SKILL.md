---
name: motion-designer
description: Writes the motion design brief and builds HyperFrames motion segments in the brand's motion language, renders them to transparent WebM and inserts them into the Remotion edit. Use for the motion stage in production or when the user asks for animated cards, transitions or motion graphics. No segment is built without an approved MOTION_BRIEF section.
argument-hint: <package-id> [segment-id]
---

# motion-designer

## 1. Brief (required)
In `MOTION_BRIEF.md`, a section `## Segment: <id>` with all 14 fields: Purpose, Duration, Brand, Scene, Visual idea, Typography, Movement, Camera, Background, Transitions, Sound, Entry, Exit, Integration target. Motion language: `brands/<brand-id>/MOTION_LANGUAGE.md`. Check: `npm run mos -- motion brief <pkg> <id>`. Show the brief to the user → `npm run mos -- approve <pkg> motion:<id> --quote "…"` (`--by delegated` only if the user explicitly delegated motion; quote their words).

## 2. Template
Templates live in `video/hyperframes/templates/`: shared ones (`notification-card`, `bubble-transition`) and brand ones (`<brand-id>-*`). Tokens from `tokens.json` are inlined, fonts and GSAP are local, texts go through `data-composition-variables`. Build a new template per the HyperFrames composition contract (if the `hyperframes-core` / `hyperframes-animation` skills are installed, follow them): one paused timeline in `window.__timelines["<id>"]`, deterministic, no CSS transform and GSAP on the same property, `@font-face` in the file. Forbidden unless `MOTION_LANGUAGE.md` asks for it: generic SaaS animations, bento grids, random gradients, neon. Never copy another company's UI or trademarks.
On-screen text in the brand's language. Non-real product visuals (mockups, concepts, illustrative UI, fictional comments) carry an honesty label; never present a mockup as the real product.

## 3. Segment
```bash
npm run mos -- motion new <pkg> <id> --template <template> --duration <sec> --scene <scene-id> --var key=value …
npm run mos -- motion check <pkg> <id>     # lint + runtime + layout + contrast, until 0 errors
npm run mos -- motion render <pkg> <id>    # transparent VP9 WebM, alpha check, cached by input hash
```
Rendering is local. Do not run `media-use`, cloud rendering, TTS or generation without explicit permission.

## 4. Integration
In `video/props.json`, a scene `{"kind":"motion","src":"content/<pkg>/video/motion/<id>/renders/<id>.webm","segmentId":"<id>","layer":"overlay", …}`. Check the frame in Studio and with `npm run mos -- video still <pkg> <frame>`: the lower layer must show through transparent areas. No alpha → fall back to a Remotion component (`NotificationCard` etc.).
