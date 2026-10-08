# /eda-marketing:marketing brand new · brand <brand-id>

A brand is `brands/<brand-id>/`: the brand kit docs, `brand.json`, `facts.yaml`, `tokens.json`. Scaffold: `brands/_template/`. Never invent facts.

## brand <brand-id> (existing)
`npm run mos -- brand show <brand-id>` and `npm run mos -- brand validate <brand-id>`. Summarize: language, platforms, durations, caption mode, facts by status, gaps. Offer to fill gaps with the interview below (only the missing items).

## brand new — interview
Ask everything in **ONE block** of questions, with short options and room for free answers. Skip what the user already said.
1. **Product:** what it is, stage (idea / in development / released), links.
2. **Audience:** who watches, what they care about, what they already know.
3. **Positioning:** what makes it different; what it is not.
4. **Content pillars:** 3–5 recurring themes.
5. **Tone of voice:** how the author talks; 2–3 "do" and 2–3 "don't" example lines.
6. **Author persona:** name or alias, role, on camera or voice-only, comfort with filming.
7. **Facts:** claims about the product with sources, and which are public, internal or unconfirmed.
8. **Forbidden claims:** what must never be said or implied.
9. **Language:** `en` or `ru`.
10. **Platforms and formats:** TikTok, Reels, Shorts; 9:16 plus 1:1 / 4:5 / 16:9?
11. **Durations:** typical range in seconds.
12. **Caption mode:** `replace` (short groups replace each other), `accumulate` (stepped block), `highlight`.
13. **Visual identity:** colors, fonts (with license), logo file.
14. **CTA:** spoken and editorial (on-screen only).
15. **Hashtags:** up to 5 core tags.
16. **Research:** themes, search queries, communities (subreddits, forums, sites).

Wait for answers. If the user delegates a choice, record it as an assumption. Missing answers are not permission.

## Create
1. Brand id: lowercase, `^[a-z0-9][a-z0-9-]*$`. Run `npm run mos -- brand new <brand-id> --name "<Name>" --language <en|ru>`.
2. Fill the brand kit in `brands/<brand-id>/`: `BRAND.md`, `AUDIENCE.md`, `POSITIONING.md`, `CONTENT_PILLARS.md`, `TONE_OF_VOICE.md` (with the user's do/don't lines), `FORBIDDEN_CLAIMS.md`, `MOTION_LANGUAGE.md`. Use the user's words; do not add marketing claims.
3. `facts.yaml`: only what the user confirmed, each with `source` and `checked` date. Status: `PUBLIC_CONFIRMED` (with `publicWording`), `INTERNAL`, `NEEDS_CONFIRMATION` (anything unknown or unsourced), `FORBIDDEN`.
4. `brand.json`: `names`, `author`, `language`, `defaults` (`mode`, `template`, `formats`, `platforms`, `durationSec`, `captionMode`, `fps`), `speech.syllablesPerSec` (language default, `calibrated: false`), `captions.protectedPhrases`, `claims`, `cta`, `hashtags`, `ideaWeights`, `research` (`themes`, `queries`, `communities`).
5. `tokens.json`: color roles, gradients, fonts. Every font needs a file and a `license`. Default: Manrope + JetBrains Mono (OFL) from `assets/shared/fonts/`. Logo: a repo path or `null`.
6. `npm run mos -- brand validate <brand-id>` until 0 errors, then `npm run mos -- tokens <brand-id>`.
7. Answer: what was created, which facts are `NEEDS_CONFIRMATION`, what is still missing. Suggest `research <brand-id>` or `video <brand-id> "<topic>"` next.
