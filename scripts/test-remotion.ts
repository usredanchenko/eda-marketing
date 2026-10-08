/**
 * Remotion smoke test: every fixture (13 templates + 3 extra formats) and every content package
 * must be registered, and representative stills must render non-blank with brand fonts loaded
 * (FontGuard cancels the render if a font is missing).
 * Usage: npm run test:remotion
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { TEMPLATE_IDS } from "@mos/core";
import { run } from "../engine/src/lib/exec";
import { fail, ok } from "../engine/src/lib/out";
import { ROOT } from "../engine/src/lib/paths";
import { frameLuma } from "../engine/src/media/proxy";
import { listPackageIds } from "../engine/src/package/load";

const cwd = path.join(ROOT, "video", "remotion");
const out = path.join(ROOT, "cache", "test-remotion");
await mkdir(out, { recursive: true });
let failed = 0;

const list = await run("npx", ["remotion", "compositions", "src/index.ts", "--quiet"], { cwd, timeoutMs: 300_000 });
const ids = new Set(list.stdout.split(/\s+/).filter(Boolean));
const expected = [
  ...TEMPLATE_IDS.map((t) => `fixture-${t}-9x16`),
  ...["1x1", "4x5", "16x9"].map((f) => `fixture-DevDiary-${f}`),
  ...(await listPackageIds()).map((id) => `${id}-9x16`),
];
for (const id of expected) {
  if (ids.has(id)) continue;
  failed++;
  fail(`composition not registered: ${id}`);
}
ok(`compositions found: ${ids.size}, expected ≥ ${expected.length}`);

const stills: [string, number][] = [
  ["fixture-DevDiary-9x16", 75],
  ["fixture-DevDiary-16x9", 75],
  ["fixture-ProductDemo-9x16", 80],
  ["fixture-FounderStory-9x16", 215],
  ["fixture-BeforeAfter-9x16", 120],
  ["fixture-TalkingHead-9x16", 120],
  ...expected.filter((id) => !id.startsWith("fixture-")).map((id) => [id, 45] as [string, number]),
];
for (const [id, frame] of stills) {
  const file = path.join(out, `${id}-${frame}.png`);
  const r = await run("npx", ["remotion", "still", "src/index.ts", id, file, `--frame=${frame}`, "--log=error"], { cwd, timeoutMs: 300_000 });
  const luma = r.code === 0 ? await frameLuma(file) : null;
  if (r.code !== 0 || luma === null || luma < 4) {
    failed++;
    fail(`${id}@${frame}: ${r.code !== 0 ? (r.stderr || r.stdout).trim().split("\n").slice(-3).join(" ") : `blank frame (Y=${luma})`}`);
  } else ok(`${id}@${frame}: Y=${luma.toFixed(1)}`);
}
if (failed) process.exit(1);
