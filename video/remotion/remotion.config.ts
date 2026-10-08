/**
 * Remotion CLI config (Studio + render).
 * Node API renders do not read this file — pass options explicitly there.
 */
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("angle");
Config.setConcurrency(2);
Config.setColorSpace("bt709");

/**
 * Browser: REMOTION_BROWSER_EXECUTABLE, else the Chrome Headless Shell from cache/browsers
 * (stock Chrome for Testing of the version Remotion is tested with; installed by scripts/bootstrap.sh),
 * else Remotion downloads its own.
 */
const findLocalShell = (): string | null => {
  const base = path.resolve(process.cwd(), "../../cache/browsers");
  if (!existsSync(base)) return null;
  for (const dir of readdirSync(base).filter((d) => d.startsWith("chrome-headless-shell")).sort().reverse()) {
    for (const sub of readdirSync(path.join(base, dir))) {
      const bin = path.join(base, dir, sub, "chrome-headless-shell");
      if (existsSync(bin)) return bin;
    }
  }
  return null;
};
const browser = process.env.REMOTION_BROWSER_EXECUTABLE ?? findLocalShell();
if (browser) Config.setBrowserExecutable(browser);
