import { stat } from "node:fs/promises";
import path from "node:path";
import { recordProvenance } from "../assets/provenance";
import { run } from "../lib/exec";
import { ensureDir, sha256File } from "../lib/fsx";
import { ROOT } from "../lib/paths";
import { UserError } from "../lib/out";

/**
 * Deterministic UI sounds synthesized with ffmpeg (aevalsrc / seeded anoisesrc): no licensing questions.
 * Each sound has a single purpose; the sound plan decides where (never on every transition).
 */
const SOUNDS: Record<string, { graph: string; purpose: string }> = {
  "ui-notify": {
    purpose: "incoming request / notification",
    graph:
      "aevalsrc='0.35*sin(2*PI*880*t)*exp(-28*t)*lt(t,0.09)+0.32*sin(2*PI*1320*(t-0.1))*exp(-22*(t-0.1))*gte(t,0.1)':s=48000:d=0.42,afade=t=out:st=0.34:d=0.08",
  },
  "ui-stamp": {
    purpose: "status stamp (single hit)",
    graph:
      "aevalsrc='0.8*sin(2*PI*(70+90*exp(-30*t))*t)*exp(-14*t)':s=48000:d=0.35,lowpass=f=900,afade=t=out:st=0.28:d=0.07",
  },
  "ui-pop": {
    purpose: "message appears",
    graph: "aevalsrc='0.4*sin(2*PI*(520+900*t)*t)*exp(-18*t)':s=48000:d=0.22,afade=t=out:st=0.17:d=0.05",
  },
  "ui-tick": {
    purpose: "cursor / terminal typing",
    graph: "anoisesrc=d=0.03:c=white:a=0.35:r=48000:s=7,highpass=f=2500,afade=t=out:st=0.012:d=0.018",
  },
  "whoosh-soft": {
    purpose: "meaningful transition (rare)",
    graph:
      "anoisesrc=d=0.55:c=pink:a=0.5:r=48000:s=11,bandpass=f=1400:w=1.2:t=o,afade=t=in:d=0.22,afade=t=out:st=0.25:d=0.3,volume=2.2",
  },
};

export const SFX_DIR = "assets/shared/sfx";

export const synthSfx = async (): Promise<string[]> => {
  const dir = path.join(ROOT, SFX_DIR);
  await ensureDir(dir);
  const out: string[] = [];
  for (const [name, s] of Object.entries(SOUNDS)) {
    const rel = `${SFX_DIR}/${name}.wav`;
    const abs = path.join(ROOT, rel);
    const r = await run("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", s.graph, "-ac", "2", "-c:a", "pcm_s16le", abs]);
    if (r.code !== 0) throw new UserError(`ffmpeg sfx ${name}: ${r.stderr.trim()}`);
    await recordProvenance([
      {
        id: `sfx-${name}`,
        path: rel,
        source: `ffmpeg lavfi: ${s.graph}`,
        sha256: await sha256File(abs),
        bytes: (await stat(abs)).size,
        importedAt: new Date().toISOString(),
        license: "synthesized locally (no third-party rights)",
        restriction: `purpose: ${s.purpose}`,
        method: "synthesized",
      },
    ]);
    out.push(rel);
  }
  return out;
};
