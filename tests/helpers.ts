import { cp, mkdtemp, symlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { ROOT } from "../engine/src/lib/paths";

/** Temp copy of the parts of the repo a test needs (brands, configs, templates); assets are symlinked. */
export const tempRoot = async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "mos-test-"));
  for (const d of ["brands", "config", "workflows"]) await cp(path.join(ROOT, d), path.join(dir, d), { recursive: true });
  await symlink(path.join(ROOT, "assets"), path.join(dir, "assets"));
  return dir;
};

export const words = (text: string, start = 0, step = 300) =>
  text.split(" ").map((t, i) => ({ text: t, startMs: start + i * step, endMs: start + i * step + step - 40, emphasis: false }));
