/** Tiny RFC 4180 CSV parser (quotes, escaped quotes, CRLF, BOM, ; or , delimiter). */
export const parseCsv = (text: string): Record<string, string>[] => {
  const src = text.replace(/^﻿/, "");
  const firstLine = src.split(/\r?\n/, 1)[0] ?? "";
  const delim = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [header, ...body] = rows.filter((r) => r.some((c) => c.trim()));
  if (!header) return [];
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
};

/** "1,2K" → 1200, "12 345" → 12345, "1.5M" → 1500000, "" / "-" → null. */
export const parseCount = (raw: string): number | null => {
  const s = raw.replace(/\s| /g, "").replace(/,(?=\d{3}\b)/g, "");
  if (!s || s === "-" || s === "—") return null;
  const m = s.replace(",", ".").match(/^(-?[\d.]+)([kKкКmMмМ]?)$/);
  if (!m) return null;
  const mult = /[kKкК]/.test(m[2]) ? 1e3 : /[mMмМ]/.test(m[2]) ? 1e6 : 1;
  return Math.round(Number(m[1]) * mult);
};

/** "45%" → 0.45, "0.45" → 0.45, "45" → 0.45 (treated as percent when > 1). */
export const parsePercent = (raw: string): number | null => {
  const s = raw.replace(/\s|%/g, "").replace(",", ".");
  if (!s || s === "-") return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n > 1 ? Math.round(n * 10) / 1000 : n;
};

/** "1:02" → 62, "1:02:03" → 3723, "12s" → 12, "12,5" → 12.5. */
export const parseDuration = (raw: string): number | null => {
  const s = raw.trim().replace(",", ".");
  if (!s || s === "-") return null;
  if (s.includes(":")) return s.split(":").map(Number).reduce((acc, x) => acc * 60 + x, 0);
  const n = Number(s.replace(/s|сек|с$/i, ""));
  return Number.isFinite(n) ? n : null;
};
