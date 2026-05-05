import type { DataModel } from '../../../types';
import { fmt } from '../../../lib/format';
import styles from './Preview.module.css';

interface PreviewProps { data: DataModel; }

export default function Preview({ data }: PreviewProps) {
  const rows = data.rows.slice(0, 50);

  return (
    <div>
      <p className={styles.panelTitle}>👁 DATA PREVIEW <span className={styles.sub}>(first {rows.length} rows)</span></p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.rowNum}>#</th>
              {data.headers.map(h => {
                const p = data.profiles.find(pr => pr.name === h);
                return (
                  <th key={h}>
                    {h}
                    {p && <span className={styles.typeTag} style={{ color: fmt.typeColor(p.type) }}>{p.type}</span>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className={styles.rowNum}>{i + 1}</td>
                {data.headers.map(h => {
                  const empty = row[h] === '' || row[h] == null;
                  return (
                    <td key={h} className={empty ? styles.empty : ''}>
                      {empty ? '∅' : row[h]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
