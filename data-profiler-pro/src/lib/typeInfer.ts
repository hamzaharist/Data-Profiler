import type { ColType } from '../types';

export function inferType(values: string[]): ColType {
  const nonEmpty = values.filter(v => v !== '' && v != null);
  if (!nonEmpty.length) return 'categorical';
  const numericCount = nonEmpty.filter(v => !isNaN(Number(v)) && v !== '').length;
  if (numericCount / nonEmpty.length > 0.85) return 'numeric';
  const dateCount = nonEmpty.filter(v => !isNaN(Date.parse(v))).length;
  if (dateCount / nonEmpty.length > 0.85 && nonEmpty.some(v => /\d{4}|\/|-/.test(v))) return 'date';
  return 'categorical';
}
