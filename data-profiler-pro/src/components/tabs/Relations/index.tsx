import { useState } from 'react';
import type { DataModel } from '../../../types';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import { pearson } from '../../../lib/stats';
import { fmt } from '../../../lib/format';
import styles from './Relations.module.css';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const MAX_SCATTER = 500;

interface RelationsProps { data: DataModel; }

export default function Relations({ data }: RelationsProps) {
  const numericCols = data.profiles.filter(p => p.type === 'numeric').map(p => p.name);
  const catCols = data.profiles.filter(p => p.type === 'categorical').map(p => p.name);

  const [scatterX, setScatterX] = useState(numericCols[0] ?? '');
  const [scatterY, setScatterY] = useState(numericCols[1] ?? numericCols[0] ?? '');
  const [crossA, setCrossA] = useState(catCols[0] ?? '');
  const [crossB, setCrossB] = useState(catCols[1] ?? catCols[0] ?? '');

  const sample = data.rows.length > MAX_SCATTER
    ? data.rows.filter((_, i) => i % Math.ceil(data.rows.length / MAX_SCATTER) === 0)
    : data.rows;

  const scatterPoints = scatterX && scatterY
    ? sample.map(r => ({ x: Number(r[scatterX]), y: Number(r[scatterY]) })).filter(p => !isNaN(p.x) && !isNaN(p.y))
    : [];

  const rVal = scatterX && scatterY
    ? pearson(data.rows.map(r => r[scatterX]), data.rows.map(r => r[scatterY]))
    : null;

  const crossTable = crossA && crossB ? buildCrossTab(data, crossA, crossB) : null;

  return (
    <div>
      <p className={styles.panelTitle}>⚡ RELATIONSHIPS</p>

      {numericCols.length >= 2 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>SCATTER PLOT</p>
          <div className={styles.selectors}>
            <select className={styles.sel} value={scatterX} onChange={e => setScatterX(e.target.value)}>
              {numericCols.map(c => <option key={c}>{c}</option>)}
            </select>
            <span className={styles.vs}>vs</span>
            <select className={styles.sel} value={scatterY} onChange={e => setScatterY(e.target.value)}>
              {numericCols.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          {rVal !== null && (
            <p className={styles.rLabel}>Pearson r = <span style={{ color: '#5b8dee' }}>{fmt.float(rVal)}</span></p>
          )}
          <div className={styles.chartWrap}>
            <Scatter
              data={{ datasets: [{ data: scatterPoints, backgroundColor: '#5b8dee55', borderColor: '#5b8dee', pointRadius: 3 }] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#6b7080', font: { size: 9 } }, grid: { color: '#25283044' } }, y: { ticks: { color: '#6b7080', font: { size: 9 } }, grid: { color: '#25283044' } } } }}
            />
          </div>
        </div>
      )}

      {catCols.length >= 1 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>CROSS-TAB</p>
          <div className={styles.selectors}>
            <select className={styles.sel} value={crossA} onChange={e => setCrossA(e.target.value)}>
              {catCols.map(c => <option key={c}>{c}</option>)}
            </select>
            <span className={styles.vs}>×</span>
            <select className={styles.sel} value={crossB} onChange={e => setCrossB(e.target.value)}>
              {catCols.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          {crossTable && <CrossTabTable table={crossTable} />}
        </div>
      )}
    </div>
  );
}

function buildCrossTab(data: DataModel, colA: string, colB: string) {
  const valA = [...new Set(data.rows.map(r => r[colA]))].slice(0, 10);
  const valB = [...new Set(data.rows.map(r => r[colB]))].slice(0, 10);
  const counts: Record<string, Record<string, number>> = {};
  valA.forEach(a => { counts[a] = {}; valB.forEach(b => { counts[a][b] = 0; }); });
  data.rows.forEach(r => { if (counts[r[colA]] && valB.includes(r[colB])) counts[r[colA]][r[colB]]++; });
  const max = Math.max(...valA.flatMap(a => valB.map(b => counts[a][b])));
  return { valA, valB, counts, max };
}

function CrossTabTable({ table }: { table: ReturnType<typeof buildCrossTab> }) {
  const { valA, valB, counts, max } = table;
  return (
    <div className={styles.crossWrap}>
      <table className={styles.crossTable}>
        <thead><tr><th /> {valB.map(b => <th key={b}>{b || '(empty)'}</th>)}</tr></thead>
        <tbody>
          {valA.map(a => (
            <tr key={a}>
              <td className={styles.crossLabel}>{a || '(empty)'}</td>
              {valB.map(b => {
                const c = counts[a][b];
                const alpha = max > 0 ? Math.round((c / max) * 180) : 0;
                return <td key={b} className={styles.crossCell} style={{ background: `rgba(91,141,238,${alpha / 255})` }}>{c || ''}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
