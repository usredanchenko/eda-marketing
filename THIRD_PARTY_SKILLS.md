# Recommended third-party skills (optional)

eda-marketing works on its own. These community skills add extra creative frameworks and
research sources. They are **not bundled**: install them yourself after reading them.
Treat their claims about platform algorithms as hypotheses, never as facts.

| Skill(s) | Source | License | Used by |
|---|---|---|---|
| `viral-hooks`, `viral-short-form`, `viral-captions-and-ctas` | [vyralcontent/content-skills](https://github.com/vyralcontent/content-skills) | MIT (per skill metadata) | hook-lab, script-writer, content-repurposer |
| `product-marketing`, `social`, `marketing-ideas`, `video` | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | see the repository | idea-generator, content-repurposer |
| `last30days` | [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | MIT (per skill metadata) | trend-scout (free sources only, `--no-browser-cookies`; never run its setup wizard without an explicit yes — it installs CLIs and reads browser cookies) |
| Remotion skills | [remotion-dev/skills](https://github.com/remotion-dev/skills) | MIT | editor, caption-writer |
| HyperFrames skills | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | Apache-2.0 | motion-designer (motion segments only) |

Install into the workspace (project scope) with the [skills CLI](https://github.com/vercel-labs/skills),
for example:

```bash
bash scripts/install-recommended-skills.sh
```

The script only prints and runs `npx skills add …` commands after you confirm each one.
