import type { WorkerInbound, WorkerOutbound, DataModel } from '../types';
import { parseCSV, parseExcel } from '../lib/parser';
import { inferType } from '../lib/typeInfer';
import { buildColumnProfiles } from '../lib/dqEngine';
import { generateInsights } from '../lib/insights';
import { detectDuplicates } from '../lib/duplicates';
import { pearsonMatrix } from '../lib/stats';

// SheetJS is imported dynamically since it's a UMD bundle
import * as XLSX from 'xlsx';
// Make XLSX available on self for parseExcel
(self as unknown as Record<string, unknown>).XLSX = XLSX;

self.onmessage = (e: MessageEvent<WorkerInbound>) => {
  const { type, payload } = e.data;
  if (type !== 'PARSE') return;

  try {
    post({ type: 'PROGRESS', payload: 5 });

    const { data, fileName } = payload;
    const isExcel = /\.(xlsx|xls)$/i.test(fileName);
    const parsed = isExcel
      ? parseExcel(data as ArrayBuffer)
      : parseCSV(data as string);

    if (!parsed.headers.length) {
      post({ type: 'ERROR', payload: 'File appears to be empty or unreadable.' });
      return;
    }

    post({ type: 'PROGRESS', payload: 20 });

    const { headers, rows } = parsed;
    const types = Object.fromEntries(
      headers.map(h => [h, inferType(rows.map(r => r[h] ?? ''))])
    ) as Record<string, ReturnType<typeof inferType>>;

    post({ type: 'PROGRESS', payload: 40 });

    const profiles = buildColumnProfiles(headers, rows, types);

    post({ type: 'PROGRESS', payload: 60 });

    const { groups: duplicateGroups, totalDuplicates } = detectDuplicates(headers, rows);

    post({ type: 'PROGRESS', payload: 75 });

    const numericHeaders = headers.filter(h => types[h] === 'numeric');
    const correlationMatrix = pearsonMatrix(numericHeaders, rows);

    post({ type: 'PROGRESS', payload: 85 });

    const insights = generateInsights(profiles, rows, duplicateGroups, totalDuplicates);

    post({ type: 'PROGRESS', payload: 95 });

    const model: DataModel = {
      fileName,
      headers,
      rows,
      profiles,
      insights,
      rowCount: rows.length,
      colCount: headers.length,
      duplicateGroups,
      totalDuplicates,
      correlationMatrix,
    };

    post({ type: 'COMPLETE', payload: model });
  } catch (err) {
    post({ type: 'ERROR', payload: err instanceof Error ? err.message : 'Unknown error during parsing.' });
  }
};

function post(msg: WorkerOutbound) {
  self.postMessage(msg);
}
