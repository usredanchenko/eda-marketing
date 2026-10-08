---
name: content-repurposer
description: Writes separate publish copy for one video per platform — TikTok, Instagram Reels, YouTube Shorts (title/caption, description, CTA, ≤5 relevant hashtags, keywords, on-screen title, cover text) — and adapts the edit to 1:1, 4:5 or 16:9 when needed. Use for the publish-copy stage or when the user asks for post text or other aspect ratios. Never publishes.
argument-hint: <package-id> [--formats 1x1,4x5,16x9]
---

# content-repurposer

Write copy in the brand's language (`brand.json → language`), in the voice of `TONE_OF_VOICE.md`. Claims only from `facts.yaml` (`PUBLIC_CONFIRMED`, no stronger than `publicWording`).

## Copy per platform → `data/publish.json` (`PublishFile`)
Write each platform **separately** (never paste one text everywhere):
- **TikTok:** conversational caption; the first line continues the hook; title optional.
- **Instagram Reels:** the first line stands alone (it gets truncated); a bit more context is fine; CTA such as save/share when it fits the meaning.
- **YouTube Shorts:** title ≤ 100 characters with keywords from the actual content; description 1–3 sentences.
- `cta` — one, doable, never before the video's point; brand CTAs from `brand.json → cta`.
- `hashtags` — ≤ `brand.json → hashtags.max` (max 5), relevant: `hashtags.core` + 1–2 topical. No walls of random tags.
- `keywords` — only what is really in the video.
- `onScreenTitle`, `coverText` (≤ 40 characters, not covered by platform UI).
- `needsConfirmation` — everything that depends on `NEEDS_CONFIRMATION` facts; use `[CONFIRM: …]` in text.

Optional frameworks, if installed (see `docs/THIRD_PARTY_SKILLS.md`): `viral-captions-and-ctas`, `social` (platform limits). Their claims like "the algorithm punishes…" are hypotheses.

Then `npm run mos -- validate <pkg>` (banned phrases and forbidden claims in copy) and `npm run mos -- md <pkg>` → `captions/{tiktok,instagram,youtube}.md` and `PUBLISH.md`. **Never publish** — the user publishes.

## Format adaptation
Add `formats` to the manifest and create `video/props.<format>.json` from the main props (same edit; check `contain`/`cover`/`wideWindow` framing, focus points, long accents). `npm run mos -- video register`, check in Studio, `npm run mos -- video render <pkg> --format <f>`.
