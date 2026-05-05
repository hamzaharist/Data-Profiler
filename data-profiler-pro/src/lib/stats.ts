import type { NumericStats, CategoricalStats, DateStats, HistogramBin } from '../types';

export function numericStats(values: string[]): NumericStats | null {
  const nums = values.map(Number).filter(v => !isNaN(v)).sort((a, b) => a - b);
  const n = nums.length;
  if (!n) return null;
  const mean = nums.reduce((s, v) => s + v, 0) / n;
  const median = n % 2 === 0 ? (nums[n / 2 - 1] + nums[n / 2]) / 2 : nums[(n - 1) / 2];
  const variance = nums.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  const skewness = n > 2 && std > 0 ? nums.reduce((s, v) => s + ((v - mean) / std) ** 3, 0) / n : 0;
  const q1 = nums[Math.floor(n * 0.25)];
  const q3 = nums[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  const outliers = nums.filter(v => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr);
  const histogram = buildHistogram(nums);
  return { n, min: nums[0], max: nums[n - 1], mean, median, std, skewness, q1, q3, iqr, outliers, histogram };
}

export function buildHistogram(nums: number[], bins = 16): HistogramBin[] {
  if (!nums.length) return [];
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const bw = (max - min) / bins || 1;
  const counts = Array(bins).fill(0) as number[];
  nums.forEach(v => {
    const i = Math.min(Math.floor((v - min) / bw), bins - 1);
    counts[i]++;
  });
  return counts.map((count, i) => ({ bin: min + i * bw, count }));
}

export function valueCounts(values: string[]): { value: string; count: number }[] {
  const c: Record<string, number> = {};
  values.forEach(v => { c[v] = (c[v] || 0) + 1; });
  return Object.entries(c)
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ value, count }));
}

export function detectCaseConflicts(values: string[]): { normalized: string; variants: string[] }[] {
  const seen: Record<string, Set<string>> = {};
  values.filter(v => v).forEach(v => {
    const low = v.toLowerCase();
    if (!seen[low]) seen[low] = new Set();
    seen[low].add(v);
  });
  return Object.entries(seen)
    .filter(([, s]) => s.size > 1)
    .map(([normalized, s]) => ({ normalized, variants: [...s] }));
}

export function categoricalStats(values: string[]): CategoricalStats {
  const nonEmpty = values.filter(v => v !== '' && v != null);
  const emptyCount = values.length - nonEmpty.length;
  const top = valueCounts(values).slice(0, 15);
  const caseConflicts = detectCaseConflicts(nonEmpty);
  return {
    uniqueCount: new Set(nonEmpty).size,
    emptyCount,
    topValues: top,
    caseConflicts,
  };
}

export function dateStats(values: string[]): DateStats | null {
  const dates = values
    .filter(v => v && !isNaN(Date.parse(v)))
    .map(v => new Date(v))
    .sort((a, b) => a.getTime() - b.getTime());
  if (!dates.length) return null;
  const gaps: { from: string; to: string; days: number }[] = [];
  for (let i = 1; i < dates.length; i++) {
    const diff = (dates[i].getTime() - dates[i - 1].getTime()) / 86400000;
    if (diff > 1) gaps.push({ from: dates[i - 1].toISOString().slice(0, 10), to: dates[i].toISOString().slice(0, 10), days: diff });
  }
  const formats = [...new Set(values.filter(v => v).map(v => {
    if (/^\d{4}-\d{2}-\d{2}/.test(v)) return 'YYYY-MM-DD';
    if (/^\d{2}\/\d{2}\/\d{4}/.test(v)) return 'MM/DD/YYYY';
    if (/^\d{2}-\d{2}-\d{4}/.test(v)) return 'DD-MM-YYYY';
    if (/^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(v)) return 'M/D/YY';
    return 'other';
  }))];
  return {
    min: dates[0].toISOString().slice(0, 10),
    max: dates[dates.length - 1].toISOString().slice(0, 10),
    count: dates.length,
    gaps: gaps.slice(0, 5),
    formats,
  };
}

export function pearson(x: string[], y: string[]): number | null {
  const pairs: [number, number][] = [];
  const n0 = Math.min(x.length, y.length);
  for (let i = 0; i < n0; i++) {
    const a = Number(x[i]);
    const b = Number(y[i]);
    if (!isNaN(a) && !isNaN(b) && x[i] !== '' && y[i] !== '') pairs.push([a, b]);
  }
  const n = pairs.length;
  if (n < 2) return null;
  const mX = pairs.reduce((s, p) => s + p[0], 0) / n;
  const mY = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dX = 0, dY = 0;
  for (const [a, b] of pairs) { num += (a - mX) * (b - mY); dX += (a - mX) ** 2; dY += (b - mY) ** 2; }
  const denom = Math.sqrt(dX * dY);
  return denom === 0 ? null : num / denom;
}

export function pearsonMatrix(headers: string[], rows: Record<string, string>[]): { colA: string; colB: string; r: number }[] {
  const result: { colA: string; colB: string; r: number }[] = [];
  for (let i = 0; i < headers.length; i++) {
    for (let j = i + 1; j < headers.length; j++) {
      const x = rows.map(r => r[headers[i]]);
      const y = rows.map(r => r[headers[j]]);
      const r = pearson(x, y);
      if (r !== null) result.push({ colA: headers[i], colB: headers[j], r });
    }
  }
  return result.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
}
