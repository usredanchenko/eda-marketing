# Third-party notices

eda-marketing is MIT-licensed (see `LICENSE`). It depends on, or works with, the
components below. They are installed from their official sources (npm, PyPI, Chrome for
Testing) and keep their own licenses. Only the fonts are redistributed in this repository.

| Component | How it is used | License | What it means for you |
|---|---|---|---|
| [Remotion](https://www.remotion.dev) (`remotion`, `@remotion/*` 4.0.534) | Video editing and rendering layer (npm dependency) | [Remotion License](https://www.remotion.dev/docs/license) (source-available); a few helper packages are MIT | Free for individuals, non-profits and for-profit organizations with **up to 3 employees**. Larger companies need a [Remotion company license](https://www.remotion.pro). eda-marketing does not grant any Remotion rights. |
| [HyperFrames](https://github.com/heygen-com/hyperframes) CLI 0.8.140 | Motion segments rendered to transparent WebM (npm dev dependency) | Apache-2.0 | Telemetry, update checks and auto-install are disabled by the engine. |
| [GSAP](https://gsap.com) 3.14.2 | Animation runtime inside HyperFrames segments (npm dependency, copied into each segment at creation) | [GSAP Standard "No Charge" License](https://gsap.com/standard-license) | Free, including commercial use; keep its notices; do not use it to build a no-code visual animation tool that competes with Webflow. Not vendored in this repository. |
| [Manrope](https://github.com/sharanda/manrope), [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) | Default brand fonts in `assets/shared/fonts/` | SIL Open Font License 1.1 | License texts ship next to the files (`*-OFL.txt`) and are copied into every motion segment. |
| React 19, zod 4, commander, fontkit, tsx, vitest, @types/* | Runtime and tooling | MIT | — |
| yaml | YAML parsing | ISC | — |
| TypeScript | Type checking | Apache-2.0 | — |
| Chrome Headless Shell (Chrome for Testing) | Headless browser for rendering, downloaded by `scripts/bootstrap.sh` into `cache/` | Google Chrome for Testing terms / Chromium BSD-style licenses | Downloaded on your machine, never committed. |
| FFmpeg / ffprobe | Media probing, QA, proxies, SFX synthesis (system install) | LGPL/GPL depending on your build | Not bundled. |
| faster-whisper + Whisper models (optional) | Local speech transcription | MIT | Installed only with your explicit permission. |
| yt-dlp (optional) | Reference metadata only (`--skip-download`) | Unlicense | Not bundled. |

Recommended third-party Claude Code skills are listed in `THIRD_PARTY_SKILLS.md`; they
are not part of this repository.
