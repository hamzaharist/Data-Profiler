import { useReducer, useRef, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import type { AppState, AppAction, TabId, WorkerOutbound } from './types';
import DropZone from './components/DropZone';
import ProgressBar from './components/ProgressBar';
import ErrorState from './components/ErrorState';
import Sidebar from './components/Sidebar';
import Overview from './components/tabs/Overview';
import Columns from './components/tabs/Columns';
import Correlation from './components/tabs/Correlation';
import MissingMap from './components/tabs/MissingMap';
import Duplicates from './components/tabs/Duplicates';
import Preview from './components/tabs/Preview';
import Relations from './components/tabs/Relations';
import styles from './App.module.css';

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'FILE_PARSE_START':
      return { status: 'loading', progress: 0 };
    case 'FILE_PARSE_PROGRESS':
      return { status: 'loading', progress: action.payload };
    case 'FILE_PARSE_COMPLETE':
      return {
        status: 'ready',
        data: action.payload,
        activeTab: 'overview',
        activeColumn: action.payload.headers[0] ?? null,
        columnSearch: '',
      };
    case 'FILE_PARSE_ERROR':
      return { status: 'error', message: action.payload };
    case 'TAB_CHANGE':
      if (state.status !== 'ready') return state;
      return { ...state, activeTab: action.payload };
    case 'COLUMN_SELECT':
      if (state.status !== 'ready') return state;
      return { ...state, activeColumn: action.payload, activeTab: 'columns' };
    case 'COLUMN_SEARCH':
      if (state.status !== 'ready') return state;
      return { ...state, columnSearch: action.payload };
    case 'FILE_RESET':
      return { status: 'idle' };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, { status: 'idle' });
  const workerRef = useRef<Worker | null>(null);

  const handleFile = useCallback((file: File) => {
    if (workerRef.current) workerRef.current.terminate();
    dispatch({ type: 'FILE_PARSE_START' });

    const worker = new Worker(new URL('./workers/profiler.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<WorkerOutbound>) => {
      const { type, payload } = e.data;
      if (type === 'PROGRESS') dispatch({ type: 'FILE_PARSE_PROGRESS', payload });
      else if (type === 'COMPLETE') { dispatch({ type: 'FILE_PARSE_COMPLETE', payload }); worker.terminate(); }
      else if (type === 'ERROR') { dispatch({ type: 'FILE_PARSE_ERROR', payload }); worker.terminate(); }
    };

    worker.onerror = (err) => {
      dispatch({ type: 'FILE_PARSE_ERROR', payload: err.message ?? 'Worker error.' });
      worker.terminate();
    };

    const isExcel = /\.(xlsx|xls)$/i.test(file.name);
    if (isExcel) {
      file.arrayBuffer().then(buf => worker.postMessage({ type: 'PARSE', payload: { data: buf, fileName: file.name } }));
    } else {
      file.text().then(text => worker.postMessage({ type: 'PARSE', payload: { data: text, fileName: file.name } }));
    }
  }, []);

  const handleReset = useCallback(() => {
    if (workerRef.current) { workerRef.current.terminate(); workerRef.current = null; }
    dispatch({ type: 'FILE_RESET' });
  }, []);

  if (state.status === 'idle') {
    return (
      <>
        <div className={styles.page}>
          <header className={styles.header}>
            <h1>Data Profiler <span>Pro</span></h1>
            <span className={styles.subtitle}>Drop a file. Get instant data quality insights.</span>
          </header>
          <DropZone onFile={handleFile} />
        </div>
        <Analytics />
      </>
    );
  }

  if (state.status === 'loading') {
    return (
      <>
        <div className={styles.page}>
          <header className={styles.header}>
            <h1>Data Profiler <span>Pro</span></h1>
          </header>
          <ProgressBar progress={state.progress} />
        </div>
        <Analytics />
      </>
    );
  }

  if (state.status === 'error') {
    return (
      <>
        <div className={styles.page}>
          <header className={styles.header}>
            <h1>Data Profiler <span>Pro</span></h1>
          </header>
          <ErrorState message={state.message} onReset={handleReset} />
        </div>
        <Analytics />
      </>
    );
  }

  const { data, activeTab, activeColumn, columnSearch } = state;

  const renderTab = (tab: TabId) => {
    switch (tab) {
      case 'overview':    return <Overview data={data} onColumnSelect={col => dispatch({ type: 'COLUMN_SELECT', payload: col })} />;
      case 'columns':     return <Columns data={data} activeColumn={activeColumn} />;
      case 'correlation': return <Correlation data={data} />;
      case 'missing':     return <MissingMap data={data} />;
      case 'duplicates':  return <Duplicates data={data} />;
      case 'preview':     return <Preview data={data} />;
      case 'relations':   return <Relations data={data} />;
    }
  };

  return (
    <>
      <div className={styles.appLayout}>
        <Sidebar
          data={data}
          activeTab={activeTab}
          activeColumn={activeColumn}
          columnSearch={columnSearch}
          onTabChange={tab => dispatch({ type: 'TAB_CHANGE', payload: tab })}
          onColumnSelect={col => dispatch({ type: 'COLUMN_SELECT', payload: col })}
          onColumnSearch={q => dispatch({ type: 'COLUMN_SEARCH', payload: q })}
          onReset={handleReset}
        />
        <main className={styles.mainPanel}>
          {renderTab(activeTab)}
        </main>
      </div>
      <Analytics />
    </>
  );
}
