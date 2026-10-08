# Analytics and feedback

The system draws conclusions only from your own data, with the sample size stated next to every number.

## Record schema (`analytics/records.jsonl`, `AnalyticsRecord`)

`platform, brand, video_id, package_id, date, snapshot_date, topic, format, hook_type, duration, views, reach, likes, comments, shares, saves, followers_gained, profile_visits, watch_time, average_watch_time, completion_rate (0–1), retention_points [{tSec, pct}], cta, notes, source {file, kind: csv|screenshot|manual, mappingId, confirmedByUser}`.

- Unknown values are `null`, never `0` and never an estimate. `null ≠ 0`.
- Records are deduplicated by `(platform, video_id, snapshot_date)`.
- Raw files are kept unchanged in `analytics/raw/<platform>/`.

## Input

| Source | Command |
|---|---|
| CSV export (TikTok Studio, YouTube Studio, Meta) | `npm run mos -- analytics import file.csv --platform tiktok --brand acme-focus --dry-run` → check the column mapping → rerun without `--dry-run` |
| Screenshot | The agent copies visible numbers into YAML (`source.kind: screenshot`, path to the image); you confirm; `npm run mos -- analytics add file.yaml` |
| Manual | YAML from the package's `ANALYTICS_TEMPLATE.md` → `analytics add` |

Column mappings live in `analytics/mappings/<platform>.yaml`: column name variants and value conversions ("1.2K", "45%", "0:09"). Every mapping is `verified: false` until it has been checked against a real export from your account. Link a package to its record with:

```bash
npm run mos -- published <package> --platform tiktok --video-id <id> [--url <url>] [--date YYYY-MM-DD]
```

## Report

```bash
npm run mos -- analytics report
```

Writes `analytics/reports/YYYY-MM-DD.md`: median, min–max and **n** by brand, platform, hook type, format, duration bucket and CTA, for the metrics in `config/analytics.yaml` (`completion_rate`, `average_watch_time`, `shares`, `saves`, `followers_gained`, `views`).

Confidence by n in a group:

| n | Level |
|---|---|
| < 3 | no conclusion |
| 3–4 | insufficient |
| 5–9 | low |
| 10–29 | medium |
| ≥ 30 | high |

`/eda-marketing:analytics-review` (subagent `analytics-analyst`) writes conclusions with alternative explanations and proposes changes to `analytics/learnings/LEARNINGS.md` and `analytics/experiments.yaml`. A learning moves from `hypothesis` to `supported` or `rejected` only with data and your agreement. Platform "algorithm" claims from outside sources stay hypotheses.

## Experiments (`analytics/experiments.yaml`)

Fields: `experiment, brand, status, hypothesis, variant_a, variant_b, primary_metric, minimum_sample, videos {a, b}, result, learning, confidence`.

Example ideas to test: a confession hook vs a question hook; cuts on thought boundaries vs a fixed cut rhythm; revealing the problem in the first second vs after a setup; a CTA that asks for a comment vs one that asks for a follow. Do not call a winner before both variants reach `minimum_sample`.

## Content memory (`memory/`)

- `mos memory rebuild` builds `memory/index.jsonl` from `memory/seed.jsonl` (optional: videos made before the system) and all packages: topic, hooks, hook types, CTA, status.
- `mos memory check "<topic>" --brand <id>` measures lexical similarity with the brand's language pack (stems + trigrams, no paid embeddings): ≥ 0.6 is a duplicate; 0.35–0.6 is similar, so justify a new angle or frame it as a series.
- `idea-generator` checks every idea against memory.
- `memory/FAILURES.md` records failures with evidence; `memory/backlog.jsonl` holds ideas without a package.
