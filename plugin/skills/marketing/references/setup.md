# /eda-marketing:marketing setup [dir]

Creates a workspace: a clone of the eda-marketing repository where the `mos` engine, brands, packages and renders live.

1. Check first: if a workspace already exists (current dir and parents, `$EDA_MARKETING_HOME`, `~/eda-marketing`), say so and offer to use it instead.
2. Explain what will happen, in one message:
   - clone `https://github.com/usredanchenko/eda-marketing` into the target folder;
   - `npm install` (Node dependencies);
   - download a headless browser for Remotion/HyperFrames rendering;
   - about 2 GB of disk in total; needs `git`, Node.js and network access.
3. Ask for the folder (default `~/eda-marketing`, or `[dir]` if given) and get an explicit yes. No yes → stop. Defaults, timeouts or silence are not a yes.
4. Run:
   ```bash
   bash "${CLAUDE_PLUGIN_ROOT}/scripts/setup-workspace.sh" "<dir>"
   ```
   Report errors verbatim; do not retry with different flags or sudo without asking.
5. Verify: `cd "<dir>" && npm run mos -- doctor`. List what is missing (e.g. local ASR, ffmpeg) without installing it.
6. Recommend:
   - start `claude` inside the workspace, so its `CLAUDE.md` and deny rules (e.g. read-only `input/`) apply;
   - optionally `export EDA_MARKETING_HOME="<dir>"` if it is not `~/eda-marketing`;
   - create the first brand: `/eda-marketing:marketing brand new`.
