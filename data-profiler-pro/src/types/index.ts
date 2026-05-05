export type ColType = 'numeric' | 'categorical' | 'date';

export type TabId =
  | 'overview'
  | 'columns'
  | 'correlation'
  | 'missing'
  | 'duplicates'
  | 'preview'
  | 'relations';

export interface HistogramBin {
  bin: number;
  count: number;
}

export interface NumericStats {
  n: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  std: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  outliers: number[];
  histogram: HistogramBin[];
}

export interface CategoricalStats {
  uniqueCount: number;
  emptyCount: number;
  topValues: { value: string; count: number }[];
  caseConflicts: { normalized: string; variants: string[] }[];
}

export interface DateStats {
  min: string;
  max: string;
  count: number;
  formats: string[];
  gaps: { from: string; to: string; days: number }[];
}

export interface DQPenalty {
  reason: string;
  value: number;
}

export interface DQScore {
  score: number;
  penalties: DQPenalty[];
}

export interface ColumnProfile {
  name: string;
  type: ColType;
  dq: DQScore;
  completeness: number;
  uniqueCount: number;
  cardinality: number;
  stats: NumericStats | CategoricalStats | DateStats;
}

export type InsightSeverity = 'critical' | 'warning' | 'info' | 'good';

export interface Insight {
  severity: InsightSeverity;
  column: string | null;
  message: string;
}

export interface DuplicateGroup {
  rowIndices: number[];
}

export interface DataModel {
  fileName: string;
  headers: string[];
  rows: Record<string, string>[];
  profiles: ColumnProfile[];
  insights: Insight[];
  rowCount: number;
  colCount: number;
  duplicateGroups: DuplicateGroup[];
  totalDuplicates: number;
  correlationMatrix: { colA: string; colB: string; r: number }[];
}

export type AppState =
  | { status: 'idle' }
  | { status: 'loading'; progress: number }
  | {
      status: 'ready';
      data: DataModel;
      activeTab: TabId;
      activeColumn: string | null;
      columnSearch: string;
    }
  | { status: 'error'; message: string };

export type AppAction =
  | { type: 'FILE_PARSE_START' }
  | { type: 'FILE_PARSE_PROGRESS'; payload: number }
  | { type: 'FILE_PARSE_COMPLETE'; payload: DataModel }
  | { type: 'FILE_PARSE_ERROR'; payload: string }
  | { type: 'TAB_CHANGE'; payload: TabId }
  | { type: 'COLUMN_SELECT'; payload: string }
  | { type: 'COLUMN_SEARCH'; payload: string }
  | { type: 'FILE_RESET' };

export interface WorkerInbound {
  type: 'PARSE';
  payload: { data: ArrayBuffer | string; fileName: string };
}

export type WorkerOutbound =
  | { type: 'PROGRESS'; payload: number }
  | { type: 'COMPLETE'; payload: DataModel }
  | { type: 'ERROR'; payload: string };
