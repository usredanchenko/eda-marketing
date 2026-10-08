# analytics/ — results of published videos

| Path | Purpose |
|---|---|
| `raw/` | Original platform exports (CSV, screenshots). Immutable: never edit or delete. |
| `mappings/` | Column mappings per platform export (`<platform>.yaml`). Set `verified: true` after checking against a real file. |
| `records.jsonl` | Normalized records, written by `npm run mos -- analytics import` / `analytics add`. |
| `reports/` | Generated reports (`npm run mos -- analytics report`). |
| `learnings/LEARNINGS.md` | Hypotheses and what the data supported or rejected. |
| `experiments.yaml` | Planned and running experiments (`npm run mos -- analytics experiments`). |

Confidence by sample size n in a group: n < 3 none; 3–4 insufficient; 5–9 low; 10–29 medium; ≥ 30 high (`config/analytics.yaml`).

`null` means no data, not zero. Never invent a metric the platform did not provide.
