import path from "node:path";
import { gradientCss } from "@mos/core";
import { writeText } from "../lib/fsx";
import { P } from "../lib/paths";
import type { Brand } from "./load";

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/** HyperFrames gets the same tokens as Remotion: one source (tokens.json) → generated CSS variables. */
export const renderTokensCss = (b: Brand): string => {
  const t = b.tokens;
  const vars = [
    ...Object.entries(t.colors).map(([k, v]) => `  --c-${kebab(k)}: ${v};`),
    ...Object.entries(t.gradients).map(([k, g]) => `  --g-${kebab(k)}: ${gradientCss(g)};`),
    ...Object.entries(t.radii).map(([k, v]) => `  --r-${kebab(k)}: ${v}px;`),
    `  --font-sans: "${t.fonts.sans}", sans-serif;`,
    `  --font-mono: "${t.fonts.mono}", monospace;`,
    `  --ease-out: cubic-bezier(${t.motion.easeOut.join(",")});`,
    `  --ease-in-out: cubic-bezier(${t.motion.easeInOut.join(",")});`,
  ];
  const faces = t.fonts.files.map(
    (f) =>
      `@font-face { font-family: "${f.family}"; src: url("fonts/${path.basename(f.path)}") format("truetype"); font-weight: ${f.weight}; font-style: ${f.style}; font-display: block; }`,
  );
  return [
    `/* Generated from brands/${b.id}/tokens.json — do not edit by hand. npm run mos -- tokens */`,
    ...faces,
    ":root {",
    ...vars,
    "}",
    "",
  ].join("\n");
};

export const writeTokensCss = async (b: Brand) => {
  const file = path.join(P.hyperframes(), "templates", "_shared", `tokens-${b.id}.css`);
  await writeText(file, renderTokensCss(b));
  return file;
};
