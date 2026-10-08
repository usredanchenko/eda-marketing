import path from "node:path";
import { fileURLToPath } from "node:url";
import { isSafeRepoPath } from "@mos/core";

/** Repository root. MOS_ROOT overrides it (tests run against temp copies). */
export const ROOT = process.env.MOS_ROOT
  ? path.resolve(process.env.MOS_ROOT)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

export class PathError extends Error {
  readonly exitCode = 3;
}

/** Resolves a repo-relative path; rejects absolute paths, `..` and roots outside the allow-list. */
export const safeResolve = (rel: string, root = ROOT): string => {
  if (!isSafeRepoPath(rel)) throw new PathError(`unsafe or unknown path: ${rel}`);
  const abs = path.resolve(root, rel);
  if (!abs.startsWith(path.resolve(root) + path.sep)) throw new PathError(`path escapes repo: ${rel}`);
  return abs;
};

export const repoRel = (abs: string, root = ROOT): string => path.relative(root, abs).split(path.sep).join("/");

export const P = {
  brandDir: (id: string, root = ROOT) => path.join(root, "brands", id),
  contentDir: (root = ROOT) => path.join(root, "content"),
  pkgDir: (pkgId: string, root = ROOT) => path.join(root, "content", pkgId),
  config: (name: string, root = ROOT) => path.join(root, "config", name),
  remotion: (root = ROOT) => path.join(root, "video", "remotion"),
  hyperframes: (root = ROOT) => path.join(root, "video", "hyperframes"),
  cache: (...parts: string[]) => path.join(ROOT, "cache", ...parts),
};
