# /eda-marketing:marketing analytics …

## import <file> [--platform] [--brand]
- CSV: `npm run mos -- analytics import <file> --platform <p> --brand <brand-id> --dry-run` → show the user the column mapping and unmapped columns → after a yes, the same call without `--dry-run`. If columns do not map, fix `analytics/mappings/<p>.yaml` (never guess values).
- Screenshot: read the image, copy only visible numbers into a records YAML file (`source.kind: screenshot`, `source.file: <path>`, `confirmedByUser: false`), show the table, and after the user confirms set `confirmedByUser: true` → `npm run mos -- analytics add <file.yaml>`.
- Manual entry: the same YAML, following the package's `ANALYTICS_TEMPLATE.md`.
- Unknown → `null`. Never fill in "approximately".

## review
Skill `eda-marketing:analytics-review` (agent `eda-marketing:analytics-analyst`): `npm run mos -- analytics report` → findings with confidence levels → update `analytics/learnings/LEARNINGS.md` (statuses hypothesis/supported/rejected; promotion only with the user's consent) and `analytics/experiments.yaml`.
