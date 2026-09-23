import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const REVIEW_STATUSES = [
  'not_reviewed',
  'verified',
  'no_authoritative_timestamp',
  'ambiguous_resource',
  'api_source',
  'source_unavailable',
  'needs_manual_review',
] as const;

export type ProvenanceReviewStatus = (typeof REVIEW_STATUSES)[number];

export type ProvenanceReviewEntry = {
  datasetId: string;
  status: ProvenanceReviewStatus;
  lastReviewedAt: string | null;
  sourceFileUpdatedAt?: string;
  notes?: string;
};

export type ProvenanceReviewRegistry = {
  schemaVersion: 1;
  policy: {
    note: string;
  };
  entries: ProvenanceReviewEntry[];
};

export type ReleaseSummary = {
  schemaVersion: 1;
  datasetDirectoryCount: number;
  datedDatasetCount: number;
  unknownDateDatasetCount: number;
  datasetsWithSourceDates: string[];
  datasetsWithoutSourceDates: string[];
};

export type TrustManifest = {
  schemaVersion: 1;
  entries: Array<{
    id: string;
    sourceUpdatedAt?: string;
  }>;
};

export type ProvenanceReviewIssueKind =
  | 'duplicate_registry_entry'
  | 'unknown_status'
  | 'unknown_dataset'
  | 'untracked_unknown_dataset'
  | 'invalid_review_date'
  | 'not_reviewed_has_review_date'
  | 'not_reviewed_has_source_date'
  | 'verified_but_still_unknown'
  | 'verified_source_date_missing'
  | 'verified_source_date_mismatch'
  | 'dated_dataset_not_verified';

export type ProvenanceReviewIssue = {
  kind: ProvenanceReviewIssueKind;
  datasetId: string;
  message: string;
};

export type ProvenanceReviewReport = {
  schemaVersion: 1;
  status: 'passed' | 'blocked';
  datasetDirectoryCount: number;
  datedDatasetCount: number;
  unknownDateDatasetCount: number;
  registryEntryCount: number;
  trackedUnknownDatasetCount: number;
  untrackedUnknownDatasetCount: number;
  reviewedUnknownDatasetCount: number;
  notReviewedUnknownDatasetCount: number;
  statusCounts: Record<ProvenanceReviewStatus, number>;
  notReviewedDatasetIds: string[];
  reviewedUnknownDatasetIds: string[];
  verifiedDatedDatasetIds: string[];
  issues: ProvenanceReviewIssue[];
};

function isValidDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function isValidSourceTimestamp(value: string) {
  return !Number.isNaN(new Date(value).valueOf());
}

export function buildProvenanceReviewReport(
  releaseSummary: ReleaseSummary,
  trustManifest: TrustManifest,
  registry: ProvenanceReviewRegistry,
): ProvenanceReviewReport {
  const issues: ProvenanceReviewIssue[] = [];
  const allDatasets = new Set([
    ...releaseSummary.datasetsWithSourceDates,
    ...releaseSummary.datasetsWithoutSourceDates,
  ]);
  const datedDatasets = new Set(releaseSummary.datasetsWithSourceDates);
  const unknownDatasets = new Set(releaseSummary.datasetsWithoutSourceDates);
  const trustById = new Map(trustManifest.entries.map((entry) => [entry.id, entry]));

  const entriesById = new Map<string, ProvenanceReviewEntry>();
  const duplicates = new Set<string>();

  for (const entry of registry.entries) {
    if (entriesById.has(entry.datasetId)) duplicates.add(entry.datasetId);
    else entriesById.set(entry.datasetId, entry);
  }

  for (const datasetId of [...duplicates].sort()) {
    issues.push({
      kind: 'duplicate_registry_entry',
      datasetId,
      message: 'The provenance review registry contains more than one entry for this dataset.',
    });
  }

  const statusCounts = Object.fromEntries(REVIEW_STATUSES.map((status) => [status, 0])) as Record<
    ProvenanceReviewStatus,
    number
  >;

  for (const entry of registry.entries) {
    if (!REVIEW_STATUSES.includes(entry.status)) {
      issues.push({
        kind: 'unknown_status',
        datasetId: entry.datasetId,
        message: `Unsupported provenance review status: ${String(entry.status)}`,
      });
      continue;
    }

    statusCounts[entry.status] += 1;

    if (!allDatasets.has(entry.datasetId)) {
      issues.push({
        kind: 'unknown_dataset',
        datasetId: entry.datasetId,
        message: 'The registry references a dataset that is not present in the current Data Trust release summary.',
      });
      continue;
    }

    if (entry.status === 'not_reviewed') {
      if (entry.lastReviewedAt !== null) {
        issues.push({
          kind: 'not_reviewed_has_review_date',
          datasetId: entry.datasetId,
          message: 'A not_reviewed entry must keep lastReviewedAt null.',
        });
      }
      if (entry.sourceFileUpdatedAt) {
        issues.push({
          kind: 'not_reviewed_has_source_date',
          datasetId: entry.datasetId,
          message: 'A not_reviewed entry must not carry a sourceFileUpdatedAt value.',
        });
      }
    } else if (!entry.lastReviewedAt || !isValidDateOnly(entry.lastReviewedAt)) {
      issues.push({
        kind: 'invalid_review_date',
        datasetId: entry.datasetId,
        message: 'Reviewed entries must use a valid YYYY-MM-DD lastReviewedAt date.',
      });
    }

    if (entry.status === 'verified') {
      if (unknownDatasets.has(entry.datasetId)) {
        issues.push({
          kind: 'verified_but_still_unknown',
          datasetId: entry.datasetId,
          message: 'A verified entry is still listed as unknown-date in the current Data Trust summary.',
        });
      }

      if (!entry.sourceFileUpdatedAt || !isValidSourceTimestamp(entry.sourceFileUpdatedAt)) {
        issues.push({
          kind: 'verified_source_date_missing',
          datasetId: entry.datasetId,
          message: 'Verified entries must record a valid authoritative sourceFileUpdatedAt value.',
        });
      } else {
        const manifestDate = trustById.get(entry.datasetId)?.sourceUpdatedAt;
        if (manifestDate !== entry.sourceFileUpdatedAt) {
          issues.push({
            kind: 'verified_source_date_mismatch',
            datasetId: entry.datasetId,
            message: 'The verified registry source date does not match the current Data Trust manifest.',
          });
        }
      }
    } else if (datedDatasets.has(entry.datasetId)) {
      issues.push({
        kind: 'dated_dataset_not_verified',
        datasetId: entry.datasetId,
        message: 'A registry entry for a now-dated dataset must be promoted to verified.',
      });
    }
  }

  for (const datasetId of [...unknownDatasets].sort()) {
    if (!entriesById.has(datasetId)) {
      issues.push({
        kind: 'untracked_unknown_dataset',
        datasetId,
        message: 'Every current unknown-date dataset must have an explicit provenance review registry entry.',
      });
    }
  }

  const trackedUnknown = [...unknownDatasets].filter((datasetId) => entriesById.has(datasetId)).sort();
  const notReviewedDatasetIds = trackedUnknown
    .filter((datasetId) => entriesById.get(datasetId)?.status === 'not_reviewed')
    .sort();
  const reviewedUnknownDatasetIds = trackedUnknown
    .filter((datasetId) => entriesById.get(datasetId)?.status !== 'not_reviewed')
    .sort();
  const verifiedDatedDatasetIds = [...datedDatasets]
    .filter((datasetId) => entriesById.get(datasetId)?.status === 'verified')
    .sort();

  issues.sort((a, b) => a.datasetId.localeCompare(b.datasetId) || a.kind.localeCompare(b.kind));

  return {
    schemaVersion: 1,
    status: issues.length ? 'blocked' : 'passed',
    datasetDirectoryCount: releaseSummary.datasetDirectoryCount,
    datedDatasetCount: releaseSummary.datedDatasetCount,
    unknownDateDatasetCount: releaseSummary.unknownDateDatasetCount,
    registryEntryCount: registry.entries.length,
    trackedUnknownDatasetCount: trackedUnknown.length,
    untrackedUnknownDatasetCount: releaseSummary.unknownDateDatasetCount - trackedUnknown.length,
    reviewedUnknownDatasetCount: reviewedUnknownDatasetIds.length,
    notReviewedUnknownDatasetCount: notReviewedDatasetIds.length,
    statusCounts,
    notReviewedDatasetIds,
    reviewedUnknownDatasetIds,
    verifiedDatedDatasetIds,
    issues,
  };
}

async function runCli() {
  const registryPath = resolve('data/provenance-review.json');
  const releaseSummaryPath = resolve('public/data/data-release-summary.json');
  const trustManifestPath = resolve('public/data/data-trust-manifest.json');
  const reportPath = resolve('.tmp/provenance-review-report.json');

  const [registry, releaseSummary, trustManifest] = await Promise.all([
    readFile(registryPath, 'utf8').then((value) => JSON.parse(value) as ProvenanceReviewRegistry),
    readFile(releaseSummaryPath, 'utf8').then((value) => JSON.parse(value) as ReleaseSummary),
    readFile(trustManifestPath, 'utf8').then((value) => JSON.parse(value) as TrustManifest),
  ]);

  if (registry.schemaVersion !== 1) throw new Error('Unsupported provenance review registry schemaVersion.');
  if (releaseSummary.schemaVersion !== 1) throw new Error('Unsupported data release summary schemaVersion.');
  if (trustManifest.schemaVersion !== 1) throw new Error('Unsupported Data Trust manifest schemaVersion.');

  const report = buildProvenanceReviewReport(releaseSummary, trustManifest, registry);
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');

  console.log(
    `Provenance review registry: ${report.trackedUnknownDatasetCount}/${report.unknownDateDatasetCount} unknown-date datasets tracked; ` +
    `${report.reviewedUnknownDatasetCount} reviewed, ${report.notReviewedUnknownDatasetCount} not reviewed; ` +
    `${report.issues.length} issue(s).`,
  );
  console.log(`Report: ${reportPath}`);

  for (const issue of report.issues) {
    console.log(`[${issue.kind}] ${issue.datasetId}: ${issue.message}`);
  }

  if (report.status === 'blocked') {
    throw new Error(`Provenance review registry validation failed with ${report.issues.length} issue(s).`);
  }
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
