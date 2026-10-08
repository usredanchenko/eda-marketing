/** Minimal console helpers: Russian, short, no internal noise. */
const tty = process.stdout.isTTY;
const c = (code: number, s: string) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);

export const ok = (msg: string) => console.log(`${c(32, "✔")} ${msg}`);
export const warn = (msg: string) => console.log(`${c(33, "!")} ${msg}`);
export const fail = (msg: string) => console.error(`${c(31, "✖")} ${msg}`);
export const info = (msg: string) => console.log(`  ${msg}`);
export const head = (msg: string) => console.log(`\n${c(1, msg)}`);

export class UserError extends Error {
  constructor(
    message: string,
    readonly exitCode = 1,
  ) {
    super(message);
  }
}
