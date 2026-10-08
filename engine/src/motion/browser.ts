import { readdir } from "node:fs/promises";
import path from "node:path";
import { exists } from "../lib/fsx";
import { ROOT } from "../lib/paths";

/**
 * HyperFrames renders with headless Chrome. We reuse Remotion's chrome-headless-shell (same machine,
 * already downloaded) via PRODUCER_HEADLESS_SHELL_PATH, as the earlier messenger-motion project did.
 */
export const findHeadlessShell = async (): Promise<string | null> => {
  if (process.env.PRODUCER_HEADLESS_SHELL_PATH && exists(process.env.PRODUCER_HEADLESS_SHELL_PATH)) {
    return process.env.PRODUCER_HEADLESS_SHELL_PATH;
  }
  const bases = [
    path.join(ROOT, "cache/browsers"),
    path.join(ROOT, "node_modules/.remotion/chrome-headless-shell"),
    path.join(ROOT, "video/remotion/node_modules/.remotion/chrome-headless-shell"),
  ];
  for (const base of bases) {
    if (!exists(base)) continue;
    for (const plat of await readdir(base)) {
      const dir = path.join(base, plat);
      for (const sub of await readdir(dir).catch(() => [] as string[])) {
        const bin = path.join(dir, sub, "chrome-headless-shell");
        if (exists(bin)) return bin;
      }
    }
  }
  return null;
};
