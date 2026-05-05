import type { DataModel } from '../../../types';
import { fmt } from '../../../lib/format';
import styles from './MissingMap.module.css';

const MAX_GRID_ROWS = 200;

interface MissingMapProps { data: DataModel; }

export default function MissingMap({ data }: MissingMapProps) {
  const sorted = [...data.profiles].sort((a, b) => a.completeness - b.completeness);
  const sampleRows = data.rows.slice(0, MAX_GRID_ROWS);

  return (
    <div>
      <p className={styles.panelTitle}>🔍 MISSING VALUES MAP</p>

      <div className={styles.bars}>
        {sorted.map(p => {
          const missingPct = 1 - p.completeness;
          return (
            <div key={p.name} className={styles.barRow}>
              <span className={styles.barLabel}>{p.name}</span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: fmt.pct(missingPct), background: missingPct > 0.5 ? '#f16b6b' : missingPct > 0.2 ? '#f5c542' : '#3ecf8e' }} />
              </div>
              <span className={styles.barPct}>{fmt.pct(missingPct)}</span>
            </div>
          );
        })}
      </div>

      <p className={styles.sectionTitle}>CELL-LEVEL GRID {data.rowCount > MAX_GRID_ROWS ? `(first ${MAX_GRID_ROWS} rows)` : ''}</p>
      <div className={styles.gridWrap}>
        <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${data.headers.length}, 12px)` }}>
          {sampleRows.flatMap((row, ri) =>
            data.headers.map(h => (
              <div
                key={`${ri}-${h}`}
                className={styles.cell}
                title={`${h}: ${row[h] || '(empty)'}`}
                style={{ background: row[h] === '' || row[h] == null ? '#f16b6b44' : '#3ecf8e22' }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
