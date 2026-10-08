import { loadBrand } from "../brands/load";
import { exists, readText, writeJson, writeText } from "../lib/fsx";
import { contactSheet } from "../media/proxy";
import { probe } from "../media/probe";
import { readProps, type Pkg } from "../package/load";
import { formatChecks, mediaChecks, textChecks, type Result } from "./checks";

const NOT_CHECKED = [
  "A human listening pass over speech, cuts and mix — not done automatically.",
  "Animation motion in live Studio — stills and the contact sheet do not prove smoothness.",
  "Platform safe areas — approximate (config/platforms.json verified:false).",
];

/** Runs all automatic checks on a rendered file and writes qa/qa-report.json + the auto section of QA.md. */
export const runQa = async (pkg: Pkg, file: string, o: { partial?: boolean; format?: string; write?: boolean } = {}) => {
  const props = await readProps(pkg, o.format);
  const brand = await loadBrand(pkg.manifest.brand);
  const pr = await probe(file);
  const final = /final/.test(file);
  const results: Result[] = [
    ...formatChecks(props, pr, Boolean(o.partial)),
    ...(await mediaChecks(file, props, pr)),
    ...(await textChecks(props, brand, final)),
  ];
  const counts = { pass: 0, warn: 0, fail: 0, skip: 0 };
  results.forEach((r) => counts[r.status]++);
  const summary = `pass ${counts.pass}, warn ${counts.warn}, fail ${counts.fail}, skip ${counts.skip}`;
  // Test renders (write: false) must never overwrite the package's real QA report.
  if (o.write === false) return { summary, results, counts };
  const sheet = await contactSheet(file, pkg.abs("qa", "contact-sheet.jpg"), Math.max(1, Math.round(pr.durationSec / 30)));
  await writeJson(pkg.abs("qa", "qa-report.json"), {
    file: file.replace(pkg.dir + "/", ""),
    checkedAt: new Date().toISOString(),
    partial: Boolean(o.partial),
    summary,
    results,
    contactSheet: "qa/contact-sheet.jpg",
    notChecked: NOT_CHECKED,
  });
  await updateQaMd(pkg, results, summary, sheet);
  return { summary, results, counts };
};

const ICON = { pass: "✅", warn: "⚠️", fail: "❌", skip: "➖" } as const;

const updateQaMd = async (pkg: Pkg, results: Result[], summary: string, sheet: string) => {
  const file = pkg.abs("QA.md");
  const prev = exists(file) ? await readText(file) : "# QA\n\n## Automated checks\n\n## Visual check (frames, contact sheet)\n";
  const auto = [
    "## Automated checks",
    "",
    `_${new Date().toISOString()} · ${summary}_ · contact sheet: \`${sheet.replace(pkg.dir + "/", "")}\``,
    "",
    "| Check | Status | Details |",
    "|---|---|---|",
    ...results.map((r) => `| ${r.id} | ${ICON[r.status]} ${r.status} | ${r.detail.replace(/\|/g, "/")} |`),
    "",
  ].join("\n");
  const notChecked = ["## Not checked", "", ...NOT_CHECKED.map((n) => `- ${n}`), ""].join("\n");
  let next = prev.replace(/## Automated checks[\s\S]*?(?=\n## )/, auto);
  next = next.replace(/## Not checked[\s\S]*$/, notChecked);
  if (!next.includes("## Not checked")) next += "\n" + notChecked;
  await writeText(file, next);
};
