import type { DataModel } from '../../../types';
import { fmt } from '../../../lib/format';
import styles from './Correlation.module.css';

interface CorrelationProps { data: DataModel; }

function strengthLabel(r: number): string {
  const abs = Math.abs(r);
  if (abs >= 0.9) return 'very strong';
  if (abs >= 0.7) return 'strong';
  if (abs >= 0.5) return 'moderate';
  if (abs >= 0.3) return 'weak';
  return 'very weak';
}

function rColor(r: number): string {
  const abs = Math.abs(r);
  const alpha = Math.round(abs * 200 + 30);
  const hex = alpha.toString(16).padStart(2, '0');
  return r >= 0 ? `#5b8dee${hex}` : `#f16b6b${hex}`;
}

export default function Correlation({ data }: CorrelationProps) {
  const numericProfiles = data.profiles.filter(p => p.type === 'numeric');
  const headers = numericProfiles.map(p => p.name);
  const matrix: Record<string, Record<string, number>> = {};
  headers.forEach(h => { matrix[h] = {}; headers.forEach(h2 => { matrix[h][h2] = h === h2 ? 1 : 0; }); });
  data.correlationMatrix.forEach(({ colA, colB, r }) => { matrix[colA][colB] = r; matrix[colB][colA] = r; });
  const top10 = data.correlationMatrix.slice(0, 10);

  if (!headers.length) return <p className={styles.empty}>No numeric columns found.</p>;

  return (
    <div>
      <p className={styles.panelTitle}>🔗 CORRELATION MATRIX</p>
      <div className={styles.tableWrap}>
        <table className={styles.heatmap}>
          <thead>
            <tr>
              <th />
              {headers.map(h => <th key={h} className={styles.heatHead}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {headers.map(rowH => (
              <tr key={rowH}>
                <td className={styles.heatLabel}>{rowH}</td>
                {headers.map(colH => {
                  const r = matrix[rowH]?.[colH] ?? 0;
                  return (
                    <td key={colH} className={styles.heatCell} style={{ background: rColor(r) }}>
                      <span className={styles.heatVal}>{fmt.float(r).replace('0.', '.').slice(0, 5)}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {top10.length > 0 && (
        <>
          <p className={styles.sectionTitle}>TOP CORRELATIONS</p>
          <table className={styles.topTable}>
            <thead><tr><th>#</th><th>Column A</th><th>Column B</th><th>r</th><th>Strength</th></tr></thead>
            <tbody>
              {top10.map(({ colA, colB, r }, i) => (
                <tr key={i}>
                  <td className={styles.rankCell}>{i + 1}</td>
                  <td className={styles.colCell}>{colA}</td>
                  <td className={styles.colCell}>{colB}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: r >= 0 ? '#5b8dee' : '#f16b6b' }}>{fmt.float(r)}</td>
                  <td className={styles.strength}>{strengthLabel(r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
