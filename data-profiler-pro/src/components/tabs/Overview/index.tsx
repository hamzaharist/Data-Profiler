import type { DataModel } from '../../../types';
import { fmt } from '../../../lib/format';
import styles from './Overview.module.css';

interface OverviewProps {
  data: DataModel;
  onColumnSelect: (col: string) => void;
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#f16b6b',
  warning: '#f5c542',
  info: '#5b8dee',
  good: '#3ecf8e',
};

const SEVERITY_ICON: Record<string, string> = {
  critical: '🚨', warning: '⚠️', info: '🔗', good: '✨',
};

export default function Overview({ data, onColumnSelect }: OverviewProps) {
  const totalCells = data.rowCount * data.colCount;
  const totalEmpty = data.profiles.reduce((s, p) => s + Math.round((1 - p.completeness) * data.rowCount), 0);
  const completeness = totalCells > 0 ? (totalCells - totalEmpty) / totalCells : 0;
  const avgDQ = data.profiles.length > 0
    ? data.profiles.reduce((s, p) => s + p.dq.score, 0) / data.profiles.length
    : 0;

  const typeCounts = data.profiles.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <p className={styles.panelTitle}>📊 OVERVIEW</p>

      <div className={styles.kpiGrid}>
        <div className={styles.kpi}>
          <span className={styles.kpiValue}>{fmt.int(data.rowCount)}</span>
          <span className={styles.kpiLabel}>Rows</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiValue} style={{ color: fmt.scoreColor(completeness * 100) }}>
            {fmt.pct(completeness)}
          </span>
          <span className={styles.kpiLabel}>Completeness</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiValue} style={{ color: fmt.scoreColor(avgDQ) }}>
            {fmt.score(avgDQ)}
          </span>
          <span className={styles.kpiLabel}>Avg DQ Score</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiValue} style={{ color: data.totalDuplicates > 0 ? '#f5c542' : '#3ecf8e' }}>
            {fmt.int(data.totalDuplicates)}
          </span>
          <span className={styles.kpiLabel}>Duplicates</span>
        </div>
      </div>

      <div className={styles.typePills}>
        {Object.entries(typeCounts).map(([type, count]) => (
          <span key={type} className={styles.pill} style={{ color: fmt.typeColor(type), borderColor: fmt.typeColor(type) + '44', background: fmt.typeColor(type) + '22' }}>
            {count} {type}
          </span>
        ))}
      </div>

      <p className={styles.sectionTitle}>AUTO-INSIGHTS</p>
      <div className={styles.insightsList}>
        {data.insights.map((ins, i) => (
          <div key={i} className={styles.insight} style={{ borderLeftColor: SEVERITY_COLOR[ins.severity] }}>
            <span className={styles.insightIcon}>{SEVERITY_ICON[ins.severity]}</span>
            <span className={styles.insightText}>
              {ins.column && (
                <button className={styles.colRef} onClick={() => onColumnSelect(ins.column!)}>
                  {ins.column}
                </button>
              )}
              {' '}{ins.message.replace(ins.column ? ins.column : '', '').trim()}
            </span>
          </div>
        ))}
      </div>

      <p className={styles.sectionTitle}>COLUMN QUALITY</p>
      <div className={styles.tableWrap}>
        <table className={styles.dqTable}>
          <thead>
            <tr>
              <th>Column</th>
              <th>Type</th>
              <th>DQ Score</th>
              <th>Completeness</th>
              <th>Unique</th>
              <th>Issues</th>
            </tr>
          </thead>
          <tbody>
            {data.profiles.map(p => (
              <tr key={p.name}>
                <td>
                  <button className={styles.colLink} onClick={() => onColumnSelect(p.name)}>
                    {p.name}
                  </button>
                </td>
                <td><span className={styles.pill} style={{ color: fmt.typeColor(p.type), borderColor: fmt.typeColor(p.type) + '44', background: fmt.typeColor(p.type) + '22' }}>{p.type}</span></td>
                <td style={{ color: fmt.scoreColor(p.dq.score), fontFamily: 'var(--font-mono)' }}>{fmt.score(p.dq.score)}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{fmt.pct(p.completeness)}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{fmt.int(p.uniqueCount)}</td>
                <td className={styles.issues}>{p.dq.penalties.map(pen => pen.reason).join(', ') || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
