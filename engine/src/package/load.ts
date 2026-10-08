import { readdir } from "node:fs/promises";
import path from "node:path";
import {
  AssetsFile,
  HooksFile,
  IdeasFile,
  Manifest,
  PublishFile,
  ScriptFile,
  ShotlistFile,
  VideoProps,
  type Manifest as ManifestT,
} from "@mos/core";
import type { z } from "zod";
import { exists, readValidated, writeJson } from "../lib/fsx";
import { UserError } from "../lib/out";
import { P, ROOT } from "../lib/paths";

export const DATA_FILES = {
  ideas: IdeasFile,
  hooks: HooksFile,
  script: ScriptFile,
  shotlist: ShotlistFile,
  assets: AssetsFile,
  publish: PublishFile,
} as const;
export type DataKey = keyof typeof DATA_FILES;
type DataOf<K extends DataKey> = z.infer<(typeof DATA_FILES)[K]>;

export interface Pkg {
  id: string;
  dir: string;
  manifest: ManifestT;
  rel: (...p: string[]) => string;
  abs: (...p: string[]) => string;
}

export const listPackageIds = async (root = ROOT): Promise<string[]> => {
  const dir = P.contentDir(root);
  if (!exists(dir)) return [];
  return (await readdir(dir, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && exists(path.join(dir, d.name, "manifest.json")))
    .map((d) => d.name)
    .sort();
};

/** Accepts a full id or a unique suffix/fragment (e.g. "printer"). */
export const resolvePackageId = async (q: string, root = ROOT): Promise<string> => {
  const ids = await listPackageIds(root);
  if (ids.includes(q)) return q;
  const hits = ids.filter((i) => i.includes(q));
  if (hits.length === 1) return hits[0];
  throw new UserError(hits.length ? `ambiguous: ${hits.join(", ")}` : `package not found: ${q}`, 2);
};

export const loadPackage = async (q: string, root = ROOT): Promise<Pkg> => {
  const id = await resolvePackageId(q, root);
  const dir = P.pkgDir(id, root);
  const manifest = await readValidated(path.join(dir, "manifest.json"), Manifest);
  return {
    id,
    dir,
    manifest,
    rel: (...p) => ["content", id, ...p].join("/"),
    abs: (...p) => path.join(dir, ...p),
  };
};

export const dataPath = (pkg: Pkg, key: DataKey) => pkg.abs("data", `${key}.json`);

export const hasData = (pkg: Pkg, key: DataKey) => exists(dataPath(pkg, key));

export const readData = <K extends DataKey>(pkg: Pkg, key: K): Promise<DataOf<K>> =>
  readValidated(dataPath(pkg, key), DATA_FILES[key]) as Promise<DataOf<K>>;

export const readDataIfAny = async <K extends DataKey>(pkg: Pkg, key: K): Promise<DataOf<K> | null> =>
  hasData(pkg, key) ? readData(pkg, key) : null;

export const propsPath = (pkg: Pkg, format = pkg.manifest.formats[0]) =>
  pkg.abs("video", format === "9x16" ? "props.json" : `props.${format}.json`);

export const readProps = (pkg: Pkg, format?: string) =>
  readValidated(propsPath(pkg, format as never), VideoProps);

export const saveManifest = (pkg: Pkg) => writeJson(pkg.abs("manifest.json"), Manifest.parse(pkg.manifest));
