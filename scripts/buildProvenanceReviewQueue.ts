import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  type ProvenanceReviewEntry,
  type ProvenanceReviewRegistry,
} from './provenanceReviewRegistry';
import {
  discoverLocalProvenance,
  type LocalProvenance,
} from './upstreamResourceMonitor';

const DAY_MS = 86_400_000;
export const DEFAULT_QUEUE_LIMIT = 10;
export const REVIEW_RECHECK_DAYS = 180;

export type ProvenanceQueuePriority =
  | 'exact_source_and_resource'
  | 'source_page_needs_resource_match'
  | 'source_needs_classification'
  | 'manual_follow_up';

export type ProvenanceReviewQueueEntry = {
  datasetId: string;
  status: ProvenanceReviewEntry['status'];
  lastReviewedAt: string | null;
  priority: ProvenanceQueuePriority;
  sourcePage?: string;
  resourceId?: string;
  reason: string;
};

export type ProvenanceReviewQueue = {
  schemaVersion: 1;
  asOfDate: string;
  limit: number;
  eligibleCount: number;
  selectedCount: number;
  policy: {
    reviewedRecheckDays: number;
    note: string;
  };
  entries: ProvenanceReviewQueueEntry[];
};

function parseDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Expected --as-of=YYYY-MM-DD.');
  const parsed = new Date(`${value}T00:00:00+08:00`);
  if (Number.isNaN(parsed.valueOf())) throw new Error(`Invalid as-of date: ${value}`);
  return parsed;
}

function daysSince(reviewDate: string, asOfDate: string) {
  const reviewed = parseDateOnly(reviewDate);
  const asOf = parseDateOnly(asOfDate);
  return Math.floor((asOf.valueOf() - reviewed.valueOf()) / DAY_MS);
}

function isEligible(entry: ProvenanceReviewEntry, asOfDate: string) {
  if (entry.status === 'not_reviewed' || entry.status === 'needs_manual_review') return true;
  if (entry.status === 'verified' || entry.status === 'no_authoritative_timestamp') return false;
  if (!entry.lastReviewedAt) return true;
  return daysSince(entry.lastReviewedAt, asOfDate) >= REVIEW_RECHECK_DAYS;
}

function classifyPriority(
  entry: ProvenanceReviewEntry,
  provenance?: LocalProvenance,
): Pick<ProvenanceReviewQueueEntry, 'priority' | 'reason'> {
  if (entry.status === 'not_reviewed') {
    if (provenance?.sourcePage && provenance.resourceId) {
      return {
        priority: 'exact_source_and_resource',
        reason: 'Never reviewed; exact official source page and resource ID are already known.',
      };
    }
    if (provenance?.sourcePage) {
      return {
        priority: 'source_page_needs_resource_match',
        reason: 'Never reviewed; official source page is known but the exact downloadable resource still needs matching.',
      };
    }
    return {
      priority: 'source_needs_classification',
      reason: 'Never reviewed; source mechanism needs classification before an authoritative file timestamp can be assessed.',
    };
  }

  if (entry.status === 'api_source') {
    return {
      priority: 'source_needs_classification',
      reason: 'Previously classified as an API/system source and is due for periodic recheck.',
    };
  }

  return {
    priority: 'manual_follow_up',
    reason:
      entry.status === 'needs_manual_review'
        ? 'Explicit manual follow-up remains open.'
        : `Previously reviewed as ${entry.status} and is due for periodic recheck.`,
  };
}

const priorityOrder: Record<ProvenanceQueuePriority, number> = {
  exact_source_and_resource: 1,
  source_page_needs_resource_match: 2,
  source_needs_classification: 3,
  manual_follow_up: 4,
};

export function buildProvenanceReviewQueue(
  registry: ProvenanceReviewRegistry,
  provenanceEntries: LocalProvenance[],
  asOfDate: string,
  limit = DEFAULT_QUEUE_LIMIT,
): ProvenanceReviewQueue {
  parseDateOnly(asOfDate);
  if (!Number.isInteger(limit) || limit < 1 || limit > 10) {
    throw new Error('--limit must be an integer from 1 to 10.');
  }

  const provenanceById = new Map(provenanceEntries.map((entry) => [entry.id, entry]));
  const eligible = registry.entries
    .filter((entry) => isEligible(entry, asOfDate))
    .map((entry): ProvenanceReviewQueueEntry => {
      const provenance = provenanceById.get(entry.datasetId);
      const classified = classifyPriority(entry, provenance);
      return {
        datasetId: entry.datasetId,
        status: entry.status,
        lastReviewedAt: entry.lastReviewedAt,
        priority: classified.priority,
        sourcePage: provenance?.sourcePage,
        resourceId: provenance?.resourceId,
        reason: classified.reason,
      };
    })
    .sort((a, b) => {
      const priorityDelta = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDelta) return priorityDelta;
      const aDate = a.lastReviewedAt ?? '';
      const bDate = b.lastReviewedAt ?? '';
      if (aDate !== bDate) return aDate.localeCompare(bDate);
      return a.datasetId.localeCompare(b.datasetId);
    });

  return {
    schemaVersion: 1,
    asOfDate,
    limit,
    eligibleCount: eligible.length,
    selectedCount: Math.min(limit, eligible.length),
    policy: {
      reviewedRecheckDays: REVIEW_RECHECK_DAYS,
      note:
        'Queue generation is review triage only. It never assigns source dates. Verified and no_authoritative_timestamp entries are excluded from routine requeue; other reviewed unresolved states are rechecked after 180 days.',
    },
    entries: eligible.slice(0, limit),
  };
}

function argumentValue(prefix: string) {
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
}

async function runCli() {
  const asOfDate = argumentValue('--as-of=');
  if (!asOfDate) throw new Error('Pass an explicit queue date: --as-of=YYYY-MM-DD');
  const limit = Number(argumentValue('--limit=') ?? String(DEFAULT_QUEUE_LIMIT));
  const reportPath = resolve(argumentValue('--report=') ?? '.tmp/provenance-review-queue.json');

  const registry = JSON.parse(
    await (await import('node:fs/promises')).readFile(resolve('data/provenance-review.json'), 'utf8'),
  ) as ProvenanceReviewRegistry;
  if (registry.schemaVersion !== 1) throw new Error('Unsupported provenance review registry schemaVersion.');

  const provenance = await discoverLocalProvenance();
  const queue = buildProvenanceReviewQueue(registry, provenance, asOfDate, limit);
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, JSON.stringify(queue, null, 2) + '\n');

  console.log(
    `Provenance review queue ${asOfDate}: ${queue.selectedCount}/${queue.eligibleCount} candidate(s) selected; limit ${queue.limit}.`,
  );
  for (const entry of queue.entries) {
    console.log(`[${entry.priority}] ${entry.datasetId}: ${entry.reason}`);
  }
  console.log(`Report: ${reportPath}`);
}

const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  try {
    await runCli();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
