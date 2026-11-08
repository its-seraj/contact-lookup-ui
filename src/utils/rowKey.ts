import type { ContactRow } from '../types/enrichment';

/** Strip diacritics the same way the backend's `names.alpha()` does. */
const stripMarks = (input: string): string =>
  (input || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function alpha(input: string): string {
  return stripMarks(input).toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * Stable identity for a contact row, mirroring `ehunter.progress.row_key`.
 * The domain is prefixed so a multi-domain scan cannot collapse two people
 * with the same name in different companies.
 */
export function rowKey(row: ContactRow): string {
  const domain = (row.domain || '').toLowerCase();
  const first = alpha(row.first_name || '');
  const last = alpha(row.last_name || '');
  let key: string;

  if (first && last) key = `n:${first}.${last}`;
  else if (first) key = `n:${first}`;
  else if (row.email) key = `e:${row.email.trim().toLowerCase()}`;
  else if (row.github) key = `g:${row.github.trim().toLowerCase()}`;
  else key = `x:${alpha(row.full_name || '')}`;

  return domain ? `${domain}|${key}` : key;
}

/**
 * Apply a `partial` event: upsert incoming rows, drop the removed keys.
 * Keys in `removed` arrive without a domain prefix, so it is added back here.
 */
export function mergeRows(
  current: ContactRow[],
  incoming: ContactRow[],
  removed: string[] = [],
  domain = ''
): ContactRow[] {
  const map = new Map<string, ContactRow>();
  for (const row of current) map.set(rowKey(row), row);
  for (const row of incoming) map.set(rowKey(row), row);

  const prefix = domain ? `${domain.toLowerCase()}|` : '';
  for (const key of removed) map.delete(`${prefix}${key}`);

  return Array.from(map.values());
}

/** A `result` event is authoritative for its domain: replace, never append. */
export function replaceDomain(
  current: ContactRow[],
  domain: string,
  rows: ContactRow[]
): ContactRow[] {
  const target = (domain || '').toLowerCase();
  return [
    ...current.filter((row) => (row.domain || '').toLowerCase() !== target),
    ...rows,
  ];
}
