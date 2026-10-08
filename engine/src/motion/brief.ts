import { readText } from "../lib/fsx";

export const BRIEF_FIELDS = [
  "Purpose",
  "Duration",
  "Brand",
  "Scene",
  "Visual idea",
  "Typography",
  "Movement",
  "Camera",
  "Background",
  "Transitions",
  "Sound",
  "Entry",
  "Exit",
  "Integration target",
] as const;

/** Parses `## Segment: <id>` from MOTION_BRIEF.md and returns field values + missing fields. */
export const parseMotionBrief = async (file: string, segmentId: string) => {
  const text = await readText(file);
  const section = text
    .split(/^## /m)
    .find((s) => s.split("\n")[0].trim() === `Segment: ${segmentId}`);
  if (!section) return { found: false, fields: {} as Record<string, string>, missing: [...BRIEF_FIELDS] };
  const fields: Record<string, string> = {};
  for (const f of BRIEF_FIELDS) {
    const line = section.match(new RegExp(`^- \\*\\*${f}:\\*\\*(.*)$`, "m"));
    fields[f] = line ? line[1].trim() : "";
  }
  return { found: true, fields, missing: BRIEF_FIELDS.filter((f) => !fields[f]) };
};
