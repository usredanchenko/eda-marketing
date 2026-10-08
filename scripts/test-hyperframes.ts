/**
 * Smoke test for HyperFrames templates: instantiate every template for the test brand into cache/hf-test,
 * run `hyperframes check`, render a transparent WebM and verify the alpha channel.
 * Usage: npm run test:hf [-- --no-render] [--brand <id>]  (default brand: acme-focus, else the first brand)
 */
import { readdir, rm } from "node:fs/promises";
import path from "node:path";
import { run } from "../engine/src/lib/exec";
import { exists } from "../engine/src/lib/fsx";
import { fail, ok } from "../engine/src/lib/out";
import { ROOT } from "../engine/src/lib/paths";
import { findHeadlessShell } from "../engine/src/motion/browser";
import { hasAlpha, instantiateTemplate } from "../engine/src/motion/segment";
import { listBrands } from "../engine/src/brands/load";

const render = !process.argv.includes("--no-render");
const argBrand = process.argv[process.argv.indexOf("--brand") + 1];
const brand = process.argv.includes("--brand") ? argBrand : listBrands().includes("acme-focus") ? "acme-focus" : listBrands()[0];
if (!brand) throw new Error("no brands: run npm run mos -- brand new <id>");
const env = {
  HYPERFRAMES_NO_TELEMETRY: "1",
  DO_NOT_TRACK: "1",
  HYPERFRAMES_NO_UPDATE_CHECK: "1",
  HYPERFRAMES_NO_FEEDBACK: "1",
  HYPERFRAMES_NO_AUTO_INSTALL: "1",
  PRODUCER_HEADLESS_SHELL_PATH: (await findHeadlessShell()) ?? "",
};
const bin = path.join(ROOT, "node_modules", ".bin", "hyperframes");
const templates = (await readdir(path.join(ROOT, "video/hyperframes/templates"))).filter((t) => !t.startsWith("_"));
let failed = 0;
for (const t of templates) {
  const dest = path.join(ROOT, "cache", "hf-test", t);
  await rm(dest, { recursive: true, force: true });
  await instantiateTemplate(t, brand, dest);
  const check = await run(bin, ["check", dest], { env, timeoutMs: 600_000 });
  const tail = (check.stdout + check.stderr).trim().split("\n").slice(-6).join("\n");
  if (check.code !== 0) {
    failed++;
    fail(`${t}: hyperframes check\n${tail}`);
    continue;
  }
  ok(`${t}: check`);
  if (!render) continue;
  const out = path.join(dest, "renders", `${t}.webm`);
  const r = await run(bin, ["render", dest, "--format", "webm", "--fps", "30", "--quality", "draft", "--output", out, "--quiet"], { env, timeoutMs: 900_000 });
  if (r.code !== 0 || !exists(out)) {
    failed++;
    fail(`${t}: render\n${(r.stdout + r.stderr).trim().split("\n").slice(-8).join("\n")}`);
    continue;
  }
  (await hasAlpha(out)) ? ok(`${t}: transparent WebM, alpha confirmed`) : (failed++, fail(`${t}: no alpha channel`));
}
if (failed) process.exit(1);
