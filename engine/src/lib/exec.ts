import { spawn } from "node:child_process";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { ROOT } from "./paths";

export interface ExecResult {
  code: number;
  stdout: string;
  stderr: string;
}

/** Runs a command without a shell (no injection), with timeout; appends a log line to cache/logs. */
export const run = (
  cmd: string,
  args: string[],
  opts: { cwd?: string; timeoutMs?: number; env?: NodeJS.ProcessEnv; inherit?: boolean } = {},
): Promise<ExecResult> =>
  new Promise((resolve) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd ?? ROOT,
      env: { ...process.env, ...opts.env },
      stdio: opts.inherit ? ["ignore", "inherit", "inherit"] : ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (d) => (stdout += d));
    child.stderr?.on("data", (d) => (stderr += d));
    const timer = opts.timeoutMs ? setTimeout(() => child.kill("SIGKILL"), opts.timeoutMs) : null;
    child.on("error", (e) => {
      if (timer) clearTimeout(timer);
      resolve({ code: 127, stdout, stderr: String(e) });
    });
    child.on("close", async (code) => {
      if (timer) clearTimeout(timer);
      const dir = path.join(ROOT, "cache", "logs");
      await mkdir(dir, { recursive: true }).catch(() => undefined);
      const line = `${new Date().toISOString()} [${code}] ${cmd} ${args.join(" ").slice(0, 400)}\n`;
      await appendFile(path.join(dir, "exec.log"), line).catch(() => undefined);
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });

export const which = async (bin: string): Promise<string | null> => {
  const r = await run("/usr/bin/which", [bin]);
  return r.code === 0 ? r.stdout.trim() : null;
};
