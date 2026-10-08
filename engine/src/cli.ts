#!/usr/bin/env tsx
import { Command } from "commander";
import { ValidationError } from "./lib/fsx";
import { fail } from "./lib/out";
import { PathError } from "./lib/paths";
import { registerAnalytics } from "./commands/analytics";
import { registerAssets } from "./commands/assets";
import { registerBrand } from "./commands/brand";
import { registerCaptions } from "./commands/captions";
import { registerDoctor } from "./commands/doctor";
import { registerMemory } from "./commands/memory";
import { registerMotion } from "./commands/motion";
import { registerPackage } from "./commands/package";
import { registerQa } from "./commands/qa";
import { registerReference } from "./commands/reference";
import { registerVideo } from "./commands/video";

const program = new Command()
  .name("mos")
  .description("Marketing OS: short-form video pipeline. Run: npm run mos -- <command>")
  .showHelpAfterError();

for (const register of [
  registerDoctor,
  registerBrand,
  registerAssets,
  registerPackage,
  registerCaptions,
  registerVideo,
  registerMotion,
  registerQa,
  registerAnalytics,
  registerMemory,
  registerReference,
]) {
  register(program);
}

program.parseAsync(process.argv).catch((err: unknown) => {
  if (err instanceof ValidationError || err instanceof PathError) {
    fail(err.message);
    process.exit(err.exitCode);
  }
  const e = err as { message?: string; exitCode?: number };
  fail(e.message ?? String(err));
  process.exit(typeof e.exitCode === "number" ? e.exitCode : 1);
});
