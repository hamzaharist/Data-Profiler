import type { DuplicateGroup } from '../types';

export function detectDuplicates(
  headers: string[],
  rows: Record<string, string>[],
): { groups: DuplicateGroup[]; totalDuplicates: number } {
  const seen: Record<string, number> = {};
  const dupes: Record<string, number[]> = {};

  rows.forEach((r, i) => {
    const key = headers.map(h => r[h] ?? '').join('||');
    if (seen[key] !== undefined) {
      if (!dupes[key]) dupes[key] = [seen[key]];
      dupes[key].push(i);
    } else {
      seen[key] = i;
    }
  });

  const groups = Object.values(dupes).map(rowIndices => ({ rowIndices }));
  const totalDuplicates = groups.reduce((s, g) => s + g.rowIndices.length - 1, 0);
  return { groups, totalDuplicates };
}
