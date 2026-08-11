export const SMALL_SAMPLE_THRESHOLD = 5;

export type FreshnessStatus = 'current' | 'aging' | 'stale' | 'unknown';

export function freshnessStatus(sourceUpdatedAt?: string, now = new Date()): FreshnessStatus {
  if (!sourceUpdatedAt) return 'unknown';
  const sourceDate = new Date(sourceUpdatedAt);
  if (Number.isNaN(sourceDate.valueOf())) return 'unknown';
  const ageInDays = Math.floor((now.valueOf() - sourceDate.valueOf()) / 86_400_000);
  if (ageInDays < 0 || ageInDays <= 90) return 'current';
  if (ageInDays <= 180) return 'aging';
  return 'stale';
}

export function safeSmallCount(value: number): string {
  return value > 0 && value < SMALL_SAMPLE_THRESHOLD ? `<${SMALL_SAMPLE_THRESHOLD}` : String(value);
}
