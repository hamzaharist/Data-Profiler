import type { DataModel } from '../../../types';
import { fmt } from '../../../lib/format';
import styles from './Duplicates.module.css';

interface DuplicatesProps { data: DataModel; }

export default function Duplicates({ data }: DuplicatesProps) {
  const { duplicateGroups, totalDuplicates, rowCount } = data;
  const pct = rowCount > 0 ? totalDuplicates / rowCount : 0;
  const top10 = duplicateGroups.slice(0, 10);

  return (
    <div>
      <p className={styles.panelTitle}>📋 DUPLICATE DETECTION</p>
      <div className={styles.summary}>
        <div className={styles.kpi}><span className={styles.kpiVal} style={{ color: totalDuplicates > 0 ? '#f5c542' : '#3ecf8e' }}>{fmt.int(totalDuplicates)}</span><span className={styles.kpiLabel}>Duplicate Rows</span></div>
        <div className={styles.kpi}><span className={styles.kpiVal}>{fmt.int(duplicateGroups.length)}</span><span className={styles.kpiLabel}>Groups</span></div>
        <div className={styles.kpi}><span className={styles.kpiVal}>{fmt.pct(pct)}</span><span className={styles.kpiLabel}>of Dataset</span></div>
      </div>

      {totalDuplicates === 0 ? (
        <div className={styles.clean}>✨ No duplicate rows found.</div>
      ) : (
        <>
          <p className={styles.sectionTitle}>DUPLICATE GROUPS (first 10)</p>
          {top10.map((group, i) => (
            <div key={i} className={styles.group}>
              <div className={styles.groupHeader}>Group {i + 1} — {group.rowIndices.length} rows (indices: {group.rowIndices.join(', ')})</div>
              <div className={styles.rowPreview}>
                <table className={styles.miniTable}>
                  <thead><tr>{data.headers.slice(0, 6).map(h => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {group.rowIndices.slice(0, 3).map(ri => (
                      <tr key={ri}>
                        {data.headers.slice(0, 6).map(h => <td key={h}>{data.rows[ri]?.[h] ?? ''}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
