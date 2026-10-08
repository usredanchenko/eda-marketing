---
name: trend-scout
description: Researches current topics, discussions, questions, pains and formats around the active brand's themes using web search (and last30days if installed), and writes research split into FACT / OBSERVATION / HYPOTHESIS with sources and dates. Use for /eda-marketing:marketing research, the research stage of a package, or when the user asks what people are talking about in their niche.
argument-hint: <brand-id> ["topic"] [--pkg <package-id>]
---

# trend-scout

## Inputs
Themes, queries and communities come from `brand.json → research` (`themes`, `queries`, `communities`), narrowed by the topic. Search in the brand's language and in English when the niche is international.

## Sources and limits
- **Default: WebSearch / WebFetch.** Platform trends (TikTok, YouTube, Instagram), forums, communities, news, docs. Save every URL with the access date.
- **Cache:** before searching, check `research/trends/` for the last 7 days. Do not repeat the same query without a reason.
- **last30days — only if installed** (see `docs/THIRD_PARTY_SKILLS.md`), free sources only. Never run its first-run setup wizard without an explicit yes: it installs CLI tools and reads browser cookies. Call its engine directly, for example:
  ```bash
  python3 <last30days-skill-dir>/scripts/last30days.py "<query>" \
    --search reddit,hackernews,github,polymarket --no-browser-cookies --web-backend none \
    --days 30 --emit md --save-dir research/trends/last30days
  ```
  Add `--subreddits` from `brand.json → research.communities` for narrow communities. Paid keys only if already configured and the user allowed them.
- Parallel directions (e.g. two different themes) → separate `eda-marketing:researcher` agents.

## What to look for (not "what goes viral", but why)
What people discuss; what they ask; which pains repeat; which formats appear; which narrative structures work; which comments draw reactions; which topics are contested.

## Output — `research/trends/YYYY-MM-DD-<brand-id>[-slug].md` (and/or the package `RESEARCH.md`)
- **FACT** — verifiable at a primary source: claim · link · date.
- **OBSERVATION** — seen in a sample: what · where · how many examples · period.
- **HYPOTHESIS** — our interpretation · what it rests on · how to test it (→ `analytics/experiments.yaml`).
- Sections: discussions / questions / pains / formats and structures (abstract) / reactions / **opportunities for the brand** (linked to `CONTENT_PILLARS.md`).

## Forbidden
"The algorithm promotes X" without an official platform source. Copying other people's videos (abstract patterns only). Storing personal data of commenters (keep only the gist).
