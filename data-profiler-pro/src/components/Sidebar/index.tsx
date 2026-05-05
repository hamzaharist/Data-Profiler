import type { DataModel, TabId } from '../../types';
import { fmt } from '../../lib/format';
import styles from './Sidebar.module.css';

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'overview',    icon: '📊', label: 'Overview' },
  { id: 'columns',     icon: '📑', label: 'Columns' },
  { id: 'correlation', icon: '🔗', label: 'Correlation' },
  { id: 'missing',     icon: '🔍', label: 'Missing Map' },
  { id: 'duplicates',  icon: '📋', label: 'Duplicates' },
  { id: 'preview',     icon: '👁',  label: 'Preview' },
  { id: 'relations',   icon: '⚡', label: 'Relations' },
];

interface SidebarProps {
  data: DataModel;
  activeTab: TabId;
  activeColumn: string | null;
  columnSearch: string;
  onTabChange: (tab: TabId) => void;
  onColumnSelect: (col: string) => void;
  onColumnSearch: (q: string) => void;
  onReset: () => void;
}

export default function Sidebar({
  data, activeTab, activeColumn, columnSearch,
  onTabChange, onColumnSelect, onColumnSearch, onReset,
}: SidebarProps) {
  const filteredProfiles = data.profiles.filter(p =>
    p.name.toLowerCase().includes(columnSearch.toLowerCase())
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.metaBox}>
        <span className={styles.fileName}>{data.fileName}</span>
        <span>{fmt.int(data.rowCount)} rows · {data.colCount} cols</span>
      </div>

      <nav className={styles.tabList}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className={styles.ico}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'columns' && (
        <div className={styles.colSection}>
          <input
            type="text"
            className={styles.colSearch}
            placeholder="Search columns…"
            value={columnSearch}
            onChange={e => onColumnSearch(e.target.value)}
          />
          <div className={styles.colList}>
            {filteredProfiles.map(p => (
              <button
                key={p.name}
                className={`${styles.colItem} ${activeColumn === p.name ? styles.colActive : ''}`}
                onClick={() => onColumnSelect(p.name)}
              >
                <span className={styles.colName}>{p.name}</span>
                <span className={styles.colType} style={{ color: fmt.typeColor(p.type) }}>
                  {p.type}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button className={styles.resetBtn} onClick={onReset}>↩ Load new file</button>
    </aside>
  );
}
