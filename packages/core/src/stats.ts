/** Small statistics for analytics review. Conclusions are gated by sample size. */

export type Confidence = "none" | "insufficient" | "low" | "medium" | "high";

export interface ConfidenceThresholds {
  insufficient: number;
  low: number;
  medium: number;
  high: number;
}

export const DEFAULT_THRESHOLDS: ConfidenceThresholds = { insufficient: 3, low: 5, medium: 10, high: 30 };

/** n < 3 → no conclusion at all; 3–4 → insufficient; 5–9 low; 10–29 medium; ≥30 high. */
export const confidenceFor = (n: number, t: ConfidenceThresholds = DEFAULT_THRESHOLDS): Confidence =>
  n >= t.high ? "high" : n >= t.medium ? "medium" : n >= t.low ? "low" : n >= t.insufficient ? "insufficient" : "none";

export const median = (xs: number[]): number | null => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

export interface GroupSummary {
  key: string;
  n: number;
  median: number | null;
  min: number | null;
  max: number | null;
  confidence: Confidence;
}

/** Groups rows by key and summarises a metric; rows where the metric is null are excluded (never treated as 0). */
export const summarize = <T>(
  rows: T[],
  keyOf: (r: T) => string | null,
  metricOf: (r: T) => number | null,
  t: ConfidenceThresholds = DEFAULT_THRESHOLDS,
): GroupSummary[] => {
  const groups = new Map<string, number[]>();
  for (const r of rows) {
    const k = keyOf(r);
    const v = metricOf(r);
    if (k === null || v === null || Number.isNaN(v)) continue;
    groups.set(k, [...(groups.get(k) ?? []), v]);
  }
  return [...groups.entries()]
    .map(([key, xs]) => ({
      key,
      n: xs.length,
      median: median(xs),
      min: Math.min(...xs),
      max: Math.max(...xs),
      confidence: confidenceFor(xs.length, t),
    }))
    .sort((a, b) => b.n - a.n);
};

export const secToFrames = (sec: number, fps: number): number => Math.round(sec * fps);
