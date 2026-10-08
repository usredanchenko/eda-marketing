import { createHash } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import type { z } from "zod";

export const exists = (p: string) => existsSync(p);

export const ensureDir = (p: string) => mkdir(p, { recursive: true });

/** Atomic write: temp file + rename, so a crash never leaves a half-written manifest. */
export const writeText = async (file: string, text: string) => {
  await ensureDir(path.dirname(file));
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, text, "utf8");
  await rename(tmp, file);
};

export const writeJson = (file: string, data: unknown) => writeText(file, JSON.stringify(data, null, 2) + "\n");

export const readText = (file: string) => readFile(file, "utf8");

export const readJson = async <T = unknown>(file: string): Promise<T> => JSON.parse(await readText(file)) as T;

export const readYaml = async <T = unknown>(file: string): Promise<T> => YAML.parse(await readText(file)) as T;

export const writeYaml = (file: string, data: unknown) => writeText(file, YAML.stringify(data, { lineWidth: 0 }));

export class ValidationError extends Error {
  readonly exitCode = 1;
  constructor(
    readonly file: string,
    readonly issues: string[],
  ) {
    super(`${file}:\n  - ${issues.join("\n  - ")}`);
  }
}

export const formatIssues = (err: z.ZodError): string[] =>
  err.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`);

/** Reads + validates JSON/YAML by extension; throws ValidationError with readable issues. */
export const readValidated = async <S extends z.ZodType>(file: string, schema: S): Promise<z.infer<S>> => {
  if (!exists(file)) throw new ValidationError(file, ["file not found"]);
  const raw = file.endsWith(".yaml") || file.endsWith(".yml") ? await readYaml(file) : await readJson(file);
  const res = schema.safeParse(raw);
  if (!res.success) throw new ValidationError(file, formatIssues(res.error));
  return res.data;
};

export const sha256File = (file: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const h = createHash("sha256");
    createReadStream(file)
      .on("data", (d) => h.update(d))
      .on("error", reject)
      .on("end", () => resolve(h.digest("hex")));
  });

export const sha256Text = (text: string) => createHash("sha256").update(text).digest("hex");

export const appendJsonl = async (file: string, rows: unknown[]) => {
  const prev = exists(file) ? await readText(file) : "";
  const add = rows.map((r) => JSON.stringify(r)).join("\n");
  await writeText(file, prev + (prev && !prev.endsWith("\n") ? "\n" : "") + (add ? add + "\n" : ""));
};

export const readJsonl = async <T = unknown>(file: string): Promise<T[]> =>
  exists(file)
    ? (await readText(file))
        .split("\n")
        .filter((l) => l.trim())
        .map((l) => JSON.parse(l) as T)
    : [];

export const today = () => new Date().toISOString().slice(0, 10);
