/**
 * Render smoke test: renders the first 2 seconds of a content package (the first package by default)
 * into cache/test-render/ and runs the automatic QA on it (partial mode).
 * Usage: npm run test:render [-- <package-id-fragment>]
 */
import path from "node:path";
import { fail, ok } from "../engine/src/lib/out";
import { ROOT } from "../engine/src/lib/paths";
import { loadPackage } from "../engine/src/package/load";
import { runQa } from "../engine/src/qa/run";
import { renderPackage } from "../engine/src/video/render";

const pkg = await loadPackage(process.argv[2] ?? "2026-10-08-acme-focus");
const out = path.join(ROOT, "cache", "test-render", `${pkg.id}-0-59.mp4`);
const file = await renderPackage(pkg, { kind: "draft", frames: "0-59", out });
ok(`render: ${path.relative(ROOT, file)}`);
const r = await runQa(pkg, file, { partial: true, write: false });
r.results.filter((x) => x.status === "fail").forEach((x) => fail(`${x.id}: ${x.detail}`));
ok(`QA: ${r.summary}`);
if (r.counts.fail) process.exit(1);
