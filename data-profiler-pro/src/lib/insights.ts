import type { Insight, ColumnProfile, NumericStats, CategoricalStats, DateStats, DuplicateGroup } from '../types';
import { pearson } from './stats';

export function generateInsights(
  profiles: ColumnProfile[],
  rows: Record<string, string>[],
  duplicateGroups: DuplicateGroup[],
  totalDuplicates: number,
): Insight[] {
  const insights: Insight[] = [];
  const totalRows = rows.length;

  for (const p of profiles) {
    const missingPct = 1 - p.completeness;
    if (missingPct > 0.5) {
      insights.push({ severity: 'critical', column: p.name, message: `${p.name} is ${(missingPct * 100).toFixed(0)}% missing — consider dropping or imputing.` });
    } else if (missingPct > 0.2) {
      insights.push({ severity: 'warning', column: p.name, message: `${p.name} has ${(missingPct * 100).toFixed(0)}% missing values.` });
    }
  }

  for (const p of profiles) {
    if (p.uniqueCount === 1) {
      insights.push({ severity: 'warning', column: p.name, message: `${p.name} has only 1 unique value — no signal, consider dropping.` });
    }
  }

  for (const p of profiles) {
    if (p.type === 'categorical' && p.cardinality > 0.95 && totalRows > 20) {
      insights.push({ severity: 'info', column: p.name, message: `${p.name} has ${(p.cardinality * 100).toFixed(0)}% unique values — likely an ID column.` });
    }
  }

  const numericProfiles = profiles.filter(p => p.type === 'numeric');
  for (let i = 0; i < numericProfiles.length; i++) {
    for (let j = i + 1; j < numericProfiles.length; j++) {
      const colA = numericProfiles[i].name;
      const colB = numericProfiles[j].name;
      const x = rows.map(r => r[colA]);
      const y = rows.map(r => r[colB]);
      const r = pearson(x, y);
      if (r !== null && Math.abs(r) > 0.85) {
        const dir = r > 0 ? 'positively' : 'negatively';
        insights.push({ severity: 'info', column: null, message: `${colA} and ${colB} are strongly ${dir} correlated (r = ${r.toFixed(2)}) — possible redundancy.` });
      }
    }
  }

  for (const p of profiles) {
    if (p.type === 'numeric' && p.stats) {
      const ns = p.stats as NumericStats;
      const outlierPct = ns.outliers.length / ns.n;
      if (outlierPct > 0.1) {
        insights.push({ severity: 'warning', column: p.name, message: `${p.name} has ${(outlierPct * 100).toFixed(0)}% outliers — investigate before modeling.` });
      }
    }
  }

  for (const p of profiles) {
    if (p.type === 'date' && p.stats) {
      const ds = p.stats as DateStats;
      if (ds.formats.length > 1) {
        insights.push({ severity: 'critical', column: p.name, message: `${p.name} mixes ${ds.formats.length} date formats — clean before time analysis.` });
      }
    }
  }

  for (const p of profiles) {
    if (p.type === 'categorical' && p.stats) {
      const cs = p.stats as CategoricalStats;
      if (cs.caseConflicts.length > 0) {
        insights.push({ severity: 'warning', column: p.name, message: `${p.name} has ${cs.caseConflicts.length} case inconsistency(ies) (e.g. "Apple" vs "apple").` });
      }
    }
  }

  if (totalDuplicates > 0) {
    const pct = (totalDuplicates / totalRows * 100).toFixed(1);
    const severity = totalDuplicates > totalRows * 0.05 ? 'critical' : 'warning';
    insights.push({ severity, column: null, message: `Found ${totalDuplicates} duplicate rows (${pct}% of data) across ${duplicateGroups.length} group(s).` });
  }

  if (insights.length === 0) {
    insights.push({ severity: 'good', column: null, message: 'No major data quality issues detected. Looks clean!' });
  }

  const order: Record<string, number> = { critical: 0, warning: 1, info: 2, good: 3 };
  insights.sort((a, b) => order[a.severity] - order[b.severity]);
  return insights;
}
