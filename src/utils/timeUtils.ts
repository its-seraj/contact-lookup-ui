/**
 * Safely parses any number, string, BSON Double, or object into a float.
 * Handles Double('21.2'), '$numberDouble', '21.2', 21.2, etc.
 */
export function parseTimingNumber(val: unknown): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  if (typeof val === 'object' && val !== null) {
    if ('value' in val) return parseTimingNumber((val as Record<string, unknown>).value);
    if ('$numberDouble' in val) return parseTimingNumber((val as Record<string, unknown>).$numberDouble);
    if ('$numberDecimal' in val) return parseTimingNumber((val as Record<string, unknown>).$numberDecimal);
  }
  const str = String(val);
  const match = str.match(/[-+]?[0-9]*\.?[0-9]+/);
  if (match) {
    const parsed = parseFloat(match[0]);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Formats a duration in seconds into 'Xmin Xsec' format.
 * Examples:
 *  652.7 -> '10min 53sec'
 *  725.2 -> '12min 5sec'
 *  45.0  -> '0min 45sec'
 */
export function formatEnrichTime(seconds?: number | null): string {
  if (seconds === undefined || seconds === null || isNaN(seconds) || seconds < 0) {
    return '—';
  }
  const total = Math.round(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}min ${secs}sec`;
}

