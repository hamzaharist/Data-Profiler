export interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
}

function parseCSVLine(line: string): string[] {
  const vals: string[] = [];
  let cur = '';
  let inQ = false;
  for (const c of line) {
    if (c === '"') inQ = !inQ;
    else if (c === ',' && !inQ) { vals.push(cur); cur = ''; }
    else cur += c;
  }
  vals.push(cur);
  return vals;
}

export function parseCSV(text: string): ParsedData {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const vals = parseCSVLine(line);
      return Object.fromEntries(headers.map((h, i) => [h, (vals[i] ?? '').toString().trim()]));
    });
  return { headers, rows };
}

export function parseExcel(arrayBuffer: ArrayBuffer): ParsedData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const XLSX = (self as any).XLSX;
  const wb = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  const firstSheet = wb.SheetNames.find((name: string) => {
    const json = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: '' });
    return json.length > 0;
  });
  if (!firstSheet) return { headers: [], rows: [] };
  const json = XLSX.utils.sheet_to_json(wb.Sheets[firstSheet], { defval: '', raw: false }) as Record<string, unknown>[];
  if (!json.length) return { headers: [], rows: [] };
  const headers = Object.keys(json[0]);
  const rows = json.map(r =>
    Object.fromEntries(headers.map(h => [h, (r[h] ?? '').toString().trim()]))
  );
  return { headers, rows };
}
