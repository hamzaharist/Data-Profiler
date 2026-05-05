export const fmt = {
  pct: (v: number) => `${(v * 100).toFixed(1)}%`,
  float: (v: number) => {
    if (!isFinite(v)) return '∞';
    if (Math.abs(v) < 0.01 || Math.abs(v) >= 10000) return v.toExponential(2);
    return v.toFixed(4);
  },
  int: (v: number) => v.toLocaleString(),
  score: (v: number) => Math.round(v).toString(),
  scoreColor: (score: number): string => {
    if (score >= 80) return '#3ecf8e';
    if (score >= 60) return '#f5c542';
    if (score >= 40) return '#f59e42';
    return '#f16b6b';
  },
  typeColor: (type: string): string =>
    ({ numeric: '#5b8dee', categorical: '#a78bfa', date: '#3ecf8e' }[type] ?? '#6b7080'),
};
