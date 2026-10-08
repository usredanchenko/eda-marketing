import path from "node:path";
import type { FactStatus } from "@mos/core";
import { writeText } from "../lib/fsx";
import type { Brand } from "./load";

const LABEL: Record<FactStatus, string> = {
  PUBLIC_CONFIRMED: "May be stated publicly",
  INTERNAL: "Internal — planning only",
  NEEDS_CONFIRMATION: "NEEDS_CONFIRMATION — do not publish until confirmed",
  FORBIDDEN: "Never claim",
};

/** PRODUCT_FACTS.md is generated from facts.yaml so the two never drift. */
export const renderFactsMd = (brand: Brand): string => {
  const lines = [
    `# ${brand.config.names.public ?? brand.config.names.working} — PRODUCT_FACTS`,
    "",
    `> Generated from \`facts.yaml\` (${brand.facts.updated}). Edit \`facts.yaml\`, then run \`npm run mos -- brand facts ${brand.id}\`.`,
    "> Every factual claim in the script, on screen and in the post copy must reference an id below.",
    "",
  ];
  for (const status of Object.keys(LABEL) as FactStatus[]) {
    const facts = brand.facts.facts.filter((f) => f.status === status);
    if (!facts.length) continue;
    lines.push(`## ${LABEL[status]}`, "");
    for (const f of facts) {
      lines.push(`- **\`${f.id}\`** — ${f.statement}`);
      if (f.publicWording) lines.push(`  - Wording: “${f.publicWording}”`);
      lines.push(`  - Source: ${f.source} (checked ${f.checked})`);
      if (f.note) lines.push(`  - Note: ${f.note}`);
    }
    lines.push("");
  }
  return lines.join("\n");
};

export const writeFactsMd = async (brand: Brand) => {
  const file = path.join(brand.dir, "PRODUCT_FACTS.md");
  await writeText(file, renderFactsMd(brand));
  return file;
};
