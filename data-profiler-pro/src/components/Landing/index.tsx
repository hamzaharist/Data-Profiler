import DropZone from '../DropZone';
import styles from './Landing.module.css';

interface LandingProps {
  onFile: (file: File) => void;
}

const TRUST_BADGES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Zero Upload',
    desc: 'Your file never touches a server. Processing happens entirely in your browser.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: 'Browser Sandbox',
    desc: 'Data stays inside the browser sandbox — no network egress, no third-party access.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: 'Isolated Worker',
    desc: 'Analysis runs in a dedicated Web Worker thread — isolated from the UI and other tabs.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'No Account Required',
    desc: 'No sign-up, no tracking, no cookies tied to your data. Just open and use.',
  },
];

const FEATURES = [
  { label: 'Overview', desc: 'Row count, column count, completeness score at a glance.' },
  { label: 'Column Stats', desc: 'Type inference, nulls, uniques, min/max, distributions.' },
  { label: 'Correlations', desc: 'Pearson correlation heatmap across numeric columns.' },
  { label: 'Missing Map', desc: 'Visual grid of where nulls live across your dataset.' },
  { label: 'Duplicates', desc: 'Detect exact and near-duplicate rows instantly.' },
  { label: 'Relations', desc: 'Inferred foreign-key candidates between columns.' },
];

const CYBER_USES = [
  {
    tag: 'Incident Response',
    text: 'Profile exported logs or forensic CSVs without exposing sensitive indicators to cloud services.',
  },
  {
    tag: 'Compliance & Audit',
    text: 'Verify PII coverage and field completeness in regulated datasets (HIPAA, GDPR, SOC 2) before submission.',
  },
  {
    tag: 'Threat Intelligence',
    text: 'Analyze IOC lists, SIEM exports, or threat feeds offline — no data leaves your air-gapped browser session.',
  },
  {
    tag: 'Pentest Reporting',
    text: 'QA your findings spreadsheet — catch missing fields, duplicate entries, or formatting issues before delivery.',
  },
  {
    tag: 'SIEM / Log Analysis',
    text: 'Drop firewall or authentication logs to spot column anomalies, cardinality spikes, and null patterns fast.',
  },
  {
    tag: 'Red Team Ops',
    text: 'Profile exfil-simulation datasets or target data locally without creating forensic artifacts on external servers.',
  },
];

export default function Landing({ onFile }: LandingProps) {
  return (
    <div className={styles.page}>
      {/* NAV */}
      <nav className={styles.nav}>
        <span className={styles.logo}>
          Data Profiler <span>Pro</span>
        </span>
        <span className={styles.navBadge}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          100% local · no upload
        </span>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroEyebrow}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Your data never leaves this browser tab
        </div>
        <h1 className={styles.heroTitle}>
          Instant data quality insights.<br />
          <span>Zero exposure risk.</span>
        </h1>
        <p className={styles.heroSub}>
          Drop any CSV or Excel file. Get a full profile — column stats, correlations, missing data, duplicates — in seconds.
          No server. No account. No network call. Safe for sensitive, regulated, and classified datasets.
        </p>

        {/* TRUST BADGES */}
        <div className={styles.badges}>
          {TRUST_BADGES.map(b => (
            <div key={b.title} className={styles.badge}>
              <span className={styles.badgeIcon}>{b.icon}</span>
              <div>
                <strong>{b.title}</strong>
                <span>{b.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* DROP ZONE */}
        <div className={styles.dropWrap}>
          <DropZone onFile={onFile} />
          <p className={styles.dropHint}>
            Supports .csv · .xlsx · .xls — up to your browser's memory limit
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How privacy is enforced</h2>
        <div className={styles.howGrid}>
          <div className={styles.howStep}>
            <span className={styles.howNum}>01</span>
            <h3>File selected locally</h3>
            <p>The browser's File API reads your file directly from disk using a local object URL. No HTTP request is made.</p>
          </div>
          <div className={styles.howStep}>
            <span className={styles.howNum}>02</span>
            <h3>Web Worker isolation</h3>
            <p>All parsing and statistical analysis runs in a dedicated Worker thread — a separate JS execution context with no DOM access.</p>
          </div>
          <div className={styles.howStep}>
            <span className={styles.howNum}>03</span>
            <h3>Browser sandbox boundary</h3>
            <p>Browsers enforce the same-origin policy and Content Security Policy. Your file bytes cannot reach the network by design.</p>
          </div>
          <div className={styles.howStep}>
            <span className={styles.howNum}>04</span>
            <h3>Memory-only processing</h3>
            <p>Results live in RAM only. No IndexedDB write, no localStorage, no service worker cache. Close the tab and it's gone.</p>
          </div>
        </div>
      </section>

      {/* CYBERSECURITY USE CASES */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Built for security-sensitive workflows</h2>
        <p className={styles.sectionSub}>
          When you can't upload data to ChatGPT, Google Sheets, or any cloud tool — Data Profiler Pro is the safe alternative.
        </p>
        <div className={styles.cyberGrid}>
          {CYBER_USES.map(u => (
            <div key={u.tag} className={styles.cyberCard}>
              <span className={styles.cyberTag}>{u.tag}</span>
              <p>{u.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Everything you need to understand a dataset</h2>
        <div className={styles.featureGrid}>
          {FEATURES.map(f => (
            <div key={f.label} className={styles.featureCard}>
              <strong>{f.label}</strong>
              <span>{f.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className={styles.footerCta}>
        <h2>Ready? Drop your file above.</h2>
        <p>No sign-up. No upload. Works offline.</p>
      </section>

      <footer className={styles.footer}>
        <span>Data Profiler <strong>Pro</strong> · All processing is local · No data collected</span>
      </footer>
    </div>
  );
}
