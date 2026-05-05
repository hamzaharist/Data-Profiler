import type { DataModel, NumericStats, CategoricalStats, DateStats } from '../../../types';
import { fmt } from '../../../lib/format';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import styles from './Columns.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: '#6b7080', maxRotation: 0, font: { size: 9 } }, grid: { color: '#25283044' } },
    y: { ticks: { color: '#6b7080', font: { size: 9 } }, grid: { color: '#25283044' } },
  },
} as const;

interface ColumnsProps {
  data: DataModel;
  activeColumn: string | null;
}

export default function Columns({ data, activeColumn }: ColumnsProps) {
  const profile = data.profiles.find(p => p.name === activeColumn);
  if (!profile) return <p className={styles.empty}>Select a column from the sidebar.</p>;

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.colName}>{profile.name}</h2>
        <span className={styles.pill} style={{ color: fmt.typeColor(profile.type), borderColor: fmt.typeColor(profile.type) + '44', background: fmt.typeColor(profile.type) + '22' }}>{profile.type}</span>
        <span className={styles.pill} style={{ color: fmt.scoreColor(profile.dq.score), borderColor: fmt.scoreColor(profile.dq.score) + '44', background: fmt.scoreColor(profile.dq.score) + '22' }}>DQ {fmt.score(profile.dq.score)}</span>
      </div>

      {profile.type === 'numeric' && <NumericProfile stats={profile.stats as NumericStats} />}
      {profile.type === 'categorical' && <CategoricalProfile stats={profile.stats as CategoricalStats} />}
      {profile.type === 'date' && <DateProfile stats={profile.stats as DateStats} />}
    </div>
  );
}

function NumericProfile({ stats }: { stats: NumericStats }) {
  const skewLabel = stats.skewness > 1 ? 'right-skewed' : stats.skewness < -1 ? 'left-skewed' : 'symmetric';
  const skewColor = Math.abs(stats.skewness) > 1 ? '#f5c542' : '#3ecf8e';
  const histData = {
    labels: stats.histogram.map(b => fmt.float(b.bin)),
    datasets: [{ data: stats.histogram.map(b => b.count), backgroundColor: '#5b8dee99', borderColor: '#5b8dee', borderWidth: 1, borderRadius: 2 }],
  };
  return (
    <div>
      <div className={styles.statGrid}>
        <div className={styles.statBox}>
          {[['min', stats.min], ['max', stats.max], ['mean', stats.mean], ['median', stats.median]].map(([k, v]) => (
            <div key={String(k)} className={styles.statRow}><span className={styles.statLabel}>{k}</span><span className={styles.statValue}>{fmt.float(v as number)}</span></div>
          ))}
        </div>
        <div className={styles.statBox}>
          {[['std', stats.std], ['q1', stats.q1], ['q3', stats.q3], ['iqr', stats.iqr], ['skewness', stats.skewness]].map(([k, v]) => (
            <div key={String(k)} className={styles.statRow}><span className={styles.statLabel}>{k}</span><span className={styles.statValue} style={k === 'skewness' ? { color: skewColor } : {}}>{fmt.float(v as number)}</span></div>
          ))}
        </div>
      </div>
      <div className={styles.pills}>
        <Pill color={skewColor} text={skewLabel} />
        <Pill color={stats.outliers.length > 0 ? '#f16b6b' : '#3ecf8e'} text={stats.outliers.length > 0 ? `${stats.outliers.length} outliers` : 'no outliers'} />
        <Pill color="#6b7080" text={`n = ${fmt.int(stats.n)}`} />
      </div>
      {stats.outliers.length > 0 && (
        <div className={styles.alertRed}>Outliers: {stats.outliers.slice(0, 8).map(v => fmt.float(v)).join(', ')}{stats.outliers.length > 8 ? ` … +${stats.outliers.length - 8} more` : ''}</div>
      )}
      <p className={styles.chartLabel}>Distribution</p>
      <div className={styles.chartWrap}>
        <Bar data={histData} options={CHART_OPTS} />
      </div>
    </div>
  );
}

function CategoricalProfile({ stats }: { stats: CategoricalStats }) {
  const top = stats.topValues.slice(0, 15);
  const barData = {
    labels: top.map(t => t.value || '(empty)'),
    datasets: [{ data: top.map(t => t.count), backgroundColor: '#a78bfa99', borderColor: '#a78bfa', borderWidth: 1, borderRadius: 2 }],
  };
  const hOpts = { ...CHART_OPTS, indexAxis: 'y' as const };
  return (
    <div>
      <div className={styles.pills}>
        <Pill color="#6b7080" text={`${fmt.int(stats.uniqueCount)} unique`} />
        {stats.emptyCount > 0 && <Pill color="#f5c542" text={`${fmt.int(stats.emptyCount)} empty`} />}
        {stats.caseConflicts.length > 0 && <Pill color="#f16b6b" text={`${stats.caseConflicts.length} case conflict(s)`} />}
      </div>
      {stats.caseConflicts.length > 0 && (
        <div className={styles.alertYellow}>
          <p className={styles.alertTitle}>⚠ Case inconsistency detected</p>
          {stats.caseConflicts.slice(0, 4).map(c => (
            <p key={c.normalized} className={styles.caseRow}>"{c.normalized}" → {c.variants.map(v => `"${v}"`).join(', ')}</p>
          ))}
        </div>
      )}
      <p className={styles.chartLabel}>Top values (by frequency)</p>
      <div className={styles.chartWrapTall}><Bar data={barData} options={hOpts} /></div>
      <div className={styles.vcTable}>
        {stats.topValues.map(({ value, count }) => (
          <div key={value} className={styles.vcRow}>
            <span className={styles.vcKey}>{value || <em style={{ color: 'var(--muted)' }}>(empty)</em>}</span>
            <span className={styles.vcCount}>{fmt.int(count)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DateProfile({ stats }: { stats: DateStats }) {
  return (
    <div>
      <div className={styles.pills}>
        <Pill color="#6b7080" text={`n = ${fmt.int(stats.count)}`} />
        {stats.formats.length > 1
          ? <Pill color="#f16b6b" text={`${stats.formats.length} formats mixed`} />
          : <Pill color="#3ecf8e" text={stats.formats[0] ?? 'unknown'} />}
        {stats.gaps.length > 0 && <Pill color="#f5c542" text={`${stats.gaps.length} gap(s) detected`} />}
      </div>
      <div className={styles.statBox} style={{ marginBottom: 12 }}>
        <div className={styles.statRow}><span className={styles.statLabel}>earliest</span><span className={styles.statValue} style={{ color: '#3ecf8e' }}>{stats.min}</span></div>
        <div className={styles.statRow}><span className={styles.statLabel}>latest</span><span className={styles.statValue} style={{ color: '#5b8dee' }}>{stats.max}</span></div>
        <div className={styles.statRow}><span className={styles.statLabel}>formats</span><span className={styles.statValue}>{stats.formats.join(', ')}</span></div>
      </div>
      {stats.gaps.length > 0 && (
        <>
          <p className={styles.chartLabel}>Time series gaps (&gt;1 day)</p>
          {stats.gaps.map((g, i) => (
            <div key={i} className={styles.gapRow}>
              <span style={{ color: '#f5c542' }}>{g.from}</span>
              <span style={{ color: 'var(--muted)' }}>→</span>
              <span style={{ color: '#f5c542' }}>{g.to}</span>
              <span style={{ color: '#f16b6b', marginLeft: 'auto' }}>+{g.days}d</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function Pill({ color, text }: { color: string; text: string }) {
  return (
    <span className={styles.pill} style={{ color, borderColor: color + '44', background: color + '22' }}>{text}</span>
  );
}
