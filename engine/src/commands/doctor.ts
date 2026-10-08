import { readdir } from "node:fs/promises";
import path from "node:path";
import type { Command } from "commander";
import { run, which } from "../lib/exec";
import { exists, readText } from "../lib/fsx";
import { fail, head, info, ok, warn } from "../lib/out";
import { ROOT } from "../lib/paths";
import { MODEL_DIRS, PY_CANDIDATES } from "../captions/asr";
import { findHeadlessShell } from "../motion/browser";

const ENV_KEYS = ["SCRAPECREATORS_KEY", "X_BEARER_TOKEN", "PERPLEXITY_KEY", "BRAVE_SEARCH_KEY", "OPENROUTER_KEY"];

/** Environment check. Reports only the PRESENCE of keys, never their values. */
export const registerDoctor = (program: Command) =>
  program
    .command("doctor")
    .description("Check the environment: node, ffmpeg, Remotion, HyperFrames, browser, ASR, keys (presence only)")
    .action(async () => {
      head("Tools");
      info(`node ${process.version}`);
      for (const bin of ["ffmpeg", "ffprobe", "git", "gitleaks", "yt-dlp", "uv"]) {
        const p = await which(bin);
        (p ? ok : warn)(`${bin}: ${p ?? "not found"}`);
      }
      const rv = await run("npx", ["remotion", "versions"], { cwd: path.join(ROOT, "video/remotion"), timeoutMs: 60000 });
      (rv.code === 0 && !/not.*match|mismatch/i.test(rv.stdout) ? ok : warn)(
        `remotion: ${rv.stdout.split("\n").find((l) => /^remotion\b|On version/i.test(l.trim()))?.trim() ?? "see npx remotion versions"}`,
      );
      const hf = path.join(ROOT, "node_modules/hyperframes/package.json");
      (exists(hf) ? ok : fail)(`hyperframes: ${exists(hf) ? JSON.parse(await readText(hf)).version : "not installed"}`);
      const shell = await findHeadlessShell();
      (shell ? ok : warn)(`chrome-headless-shell for HyperFrames: ${shell ?? "not found (Remotion downloads one on first render)"}`);

      head("Transcription (local)");
      const py = PY_CANDIDATES().find((p) => exists(p));
      const fw = py ? await run(py, ["-c", "import faster_whisper; print(faster_whisper.__version__)"]) : null;
      (py && fw?.code === 0 ? ok : warn)(`faster-whisper: ${py && fw?.code === 0 ? fw.stdout.trim() + ` (${py})` : "not found (MOS_ASR_PYTHON or .venv-asr) — see docs/VIDEO_PIPELINE.md"}`);
      const models = MODEL_DIRS().find((d) => exists(d));
      (models ? ok : warn)(`ASR models: ${models ? (await readdir(models)).join(", ") : "no cache in MOS_ASR_MODEL_DIR or cache/asr-models (downloads only with permission)"}`);

      head("Keys (.env — presence only)");
      const envFile = path.join(ROOT, ".env");
      const env = exists(envFile) ? await readText(envFile) : "";
      for (const k of ENV_KEYS) {
        const present = new RegExp(`^${k}=.+$`, "m").test(env) || Boolean(process.env[k]);
        info(`${k}: ${present ? "set" : "not set (paid sources are not used)"}`);
      }
    });
