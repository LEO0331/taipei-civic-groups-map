import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DAY_MS = 86_400_000;

export type FreshnessBand = 'recent' | 'review' | 'priority_review';

export type TrustEntry = {
  id: string;
  sourceName?: string;
  sourceUpdatedAt?: string;
};

export type FreshnessEntry = {
  id: string;
  sourceName?: string;
  sourceUpdatedAt: string;
  ageDays: number;
  band: FreshnessBand;
};

export type FreshnessAudit = {
  schemaVersion: 1;
  asOfDate: string;
  policy: {
    recentMaxAgeDays: number;
    reviewMaxAgeDays: number;
    note: string;
  };
  totalDatasetDirectoryCount: number;
  datedDatasetCount: number;
  unknownDateDatasetCount: number;
  counts: Record<FreshnessBand, number>;
  topPriorityReview: FreshnessEntry[];
  entries: FreshnessEntry[];
};

export const RECENT_MAX_AGE_DAYS = 180;
export const REVIEW_MAX_AGE_DAYS = 365;
export const TOP_PRIORITY_COUNT = 10;

export function parseSourceTimestamp(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00+08:00`);
  }
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return new Date(`${value.replace(' ', 'T')}+08:00`);
  }
  return new Date(value);
}

export function classifyAge(ageDays: number): FreshnessBand {
  if (ageDays <= RECENT_MAX_AGE_DAYS) return 'recent';
  if (ageDays <= REVIEW_MAX_AGE_DAYS) return 'review';
  return 'priority_review';
}

export function buildFreshnessAudit(
  entries: TrustEntry[],
  totalDatasetDirectoryCount: number,
  asOfDate: string,
): FreshnessAudit {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOfDate)) {
    throw new Error('Expected --as-of=YYYY-MM-DD.');
  }

  const asOf = new Date(`${asOfDate}T23:59:59+08:00`);
  if (Number.isNaN(asOf.valueOf())) throw new Error(`Invalid as-of date: ${asOfDate}`);

  const dated = entries
    .filter((entry): entry is TrustEntry & { sourceUpdatedAt: string } => Boolean(entry.sourceUpdatedAt))
    .map((entry) => {
      const updated = parseSourceTimestamp(entry.sourceUpdatedAt);
      if (Number.isNaN(updated.valueOf())) {
        throw new Error(`Invalid sourceUpdatedAt for ${entry.id}: ${entry.sourceUpdatedAt}`);
      }
      const ageDays = Math.max(0, Math.floor((asOf.valueOf() - updated.valueOf()) / DAY_MS));
      return {
        id: entry.id,
        sourceName: entry.sourceName,
        sourceUpdatedAt: entry.sourceUpdatedAt,
        ageDays,
        band: classifyAge(ageDays),
      };
    })
    .sort((a, b) => b.ageDays - a.ageDays || a.id.localeCompare(b.id));

  const counts: Record<FreshnessBand, number> = {
    recent: 0,
    review: 0,
    priority_review: 0,
  };
  for (const entry of dated) counts[entry.band] += 1;

  return {
    schemaVersion: 1,
    asOfDate,
    policy: {
      recentMaxAgeDays: RECENT_MAX_AGE_DAYS,
      reviewMaxAgeDays: REVIEW_MAX_AGE_DAYS,
      note:
        'Age bands are review triage only. They do not assert that a public-data snapshot is stale or current. Confirm the authoritative upstream resource before refreshing.',
    },
    totalDatasetDirectoryCount,
    datedDatasetCount: dated.length,
    unknownDateDatasetCount: totalDatasetDirectoryCount - dated.length,
    counts,
    topPriorityReview: dated.filter((entry) => entry.band === 'priority_review').slice(0, TOP_PRIORITY_COUNT),
    entries: dated,
  };
}

function parseAsOfArgument(argv: string[]) {
  const arg = argv.find((value) => value.startsWith('--as-of='));
  if (!arg) throw new Error('Pass an explicit audit date: --as-of=YYYY-MM-DD');
  return arg.slice('--as-of='.length);
}

export async function writeFreshnessAudit(
  asOfDate: string,
  manifestPath = 'public/data/data-trust-manifest.json',
  outputPath = 'public/data/data-freshness-audit.json',
) {
  const manifest = JSON.parse(await readFile(resolve(manifestPath), 'utf8')) as {
    datasetDirectoryCount: number;
    entries: TrustEntry[];
  };
  const audit = buildFreshnessAudit(manifest.entries, manifest.datasetDirectoryCount, asOfDate);
  await writeFile(resolve(outputPath), JSON.stringify(audit, null, 2) + '\n');
  console.log(
    `Freshness audit ${asOfDate}: ${audit.datedDatasetCount} dated / ${audit.unknownDateDatasetCount} unknown; ` +
      `${audit.counts.recent} recent / ${audit.counts.review} review / ${audit.counts.priority_review} priority review.`,
  );
  return audit;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const asOfDate = parseAsOfArgument(process.argv.slice(2));
  await writeFreshnessAudit(asOfDate);
}
