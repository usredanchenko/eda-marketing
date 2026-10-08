# input/ — raw source footage

Put your recorded files here, preferably in a per-package subfolder: `input/<package-id>/S01.mov`.

- The folder is **read-only** for the system: `.claude/settings.json` denies agent writes here; `mos` only reads the files.
- Its content stays out of git (`.gitignore`).
- Ingest: `npm run mos -- footage <package> --from input/<package-id>` → `content/<pkg>/video/footage/index.json` (metadata, proxies when needed, speech/silence, cuts).
- Originals are never deleted, moved or re-encoded in place.
