import type { ColType, ColumnProfile, DQScore, NumericStats, CategoricalStats, DateStats } from '../types';
import { numericStats, categoricalStats, dateStats } from './stats';

function computeDQScore(
  values: string[],
  type: ColType,
  stats: NumericStats | CategoricalStats | DateStats | null,
): DQScore {
  let score = 100;
  const penalties: { reason: string; value: number }[] = [];

  const total = values.length;
  const empty = values.filter(v => v === '' || v == null).length;
  const pct = total > 0 ? empty / total : 0;

  if (pct > 0.5) { penalties.push({ reason: `${(pct * 100).toFixed(0)}% missing`, value: 40 }); score -= 40; }
  else if (pct > 0.2) { penalties.push({ reason: `${(pct * 100).toFixed(0)}% missing`, value: 20 }); score -= 20; }
  else if (pct > 0.05) { penalties.push({ reason: `${(pct * 100).toFixed(0)}% missing`, value: 8 }); score -= 8; }

  const unique = new Set(values.filter(v => v !== '')).size;
  if (unique === 1 && total > 0) { penalties.push({ reason: 'constant column', value: 30 }); score -= 30; }

  const nonEmpty = total - empty;
  const cardinality = nonEmpty > 0 ? unique / nonEmpty : 0;
  if (type === 'categorical' && cardinality > 0.95 && total > 20) {
    penalties.push({ reason: 'likely ID column', value: 10 });
    score -= 10;
  }

  if (type === 'numeric' && stats) {
    const ns = stats as NumericStats;
    const outlierPct = ns.outliers.length / ns.n;
    if (outlierPct > 0.05) { penalties.push({ reason: `${(outlierPct * 100).toFixed(0)}% outliers`, value: 10 }); score -= 10; }
    if (Math.abs(ns.skewness) > 2) { penalties.push({ reason: 'highly skewed', value: 5 }); score -= 5; }
  }

  if (type === 'categorical' && stats) {
    const cs = stats as CategoricalStats;
    if (cs.caseConflicts.length > 0) {
      const pen = 8 * Math.min(cs.caseConflicts.length, 3);
      penalties.push({ reason: `${cs.caseConflicts.length} case conflict(s)`, value: pen });
      score -= pen;
    }
  }

  if (type === 'date' && stats) {
    const ds = stats as DateStats;
    if (ds.formats.length > 1) { penalties.push({ reason: `${ds.formats.length} mixed date formats`, value: 15 }); score -= 15; }
    if (ds.gaps.length > 0) { penalties.push({ reason: `${ds.gaps.length} time gap(s)`, value: 5 }); score -= 5; }
  }

  return { score: Math.max(0, score), penalties };
}

export function buildColumnProfiles(
  headers: string[],
  rows: Record<string, string>[],
  types: Record<string, ColType>,
): ColumnProfile[] {
  return headers.map(name => {
    const values = rows.map(r => r[name] ?? '');
    const type = types[name];
    const total = values.length;
    const empty = values.filter(v => v === '' || v == null).length;
    const nonEmpty = total - empty;
    const uniqueCount = new Set(values.filter(v => v !== '')).size;
    const cardinality = nonEmpty > 0 ? uniqueCount / nonEmpty : 0;
    const completeness = total > 0 ? (total - empty) / total : 0;

    let stats: NumericStats | CategoricalStats | DateStats | null = null;
    if (type === 'numeric') stats = numericStats(values);
    else if (type === 'categorical') stats = categoricalStats(values);
    else if (type === 'date') stats = dateStats(values);

    const dq = computeDQScore(values, type, stats);

    return {
      name,
      type,
      dq,
      completeness,
      uniqueCount,
      cardinality,
      stats: stats ?? categoricalStats(values),
    };
  });
}
