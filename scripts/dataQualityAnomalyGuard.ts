import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  scanRawSourceState,
  type DataReleaseBaseline,
  type DatasetSourceState,
} from './buildDataChangeSummary';

export const MIN_BASELINE_ROWS_FOR_RATE_WARNING = 20;
export const COLLAPSE_RATIO_WARNING = 0.5;
export const SPIKE_RATIO_WARNING = 2;

export type DataQualityIssueSeverity = 'blocker' | 'warning';

export type DataQualityIssueKind =
  | 'missing_dataset'
  | 'source_file_row_count_unreadable'
  | 'dataset_row_count_unreadable'
  | 'unexpected_empty_dataset'
  | 'severe_row_count_collapse'
  | 'severe_row_count_spike';

export type DataQualityIssue = {
  datasetId: string;
  severity: DataQualityIssueSeverity;
  kind: DataQualityIssueKind;
  message: string;
  baselineRowCount?: number;
  currentRowCount?: number;
  ratio?: number;
  sourcePath?: string;
};

export type DataQualityAnomalyReport = {
  schemaVersion: 1;
  baselineCapturedAt: string;
  checkedAt: string;
  status: 'passed' | 'blocked';
  comparableDatasetCount: number;
  blockerCount: number;
  warningCount: number;
  thresholds: {
    minimumBaselineRowsForRateWarning: number;
    collapseRatioWarning: number;
    spikeRatioWarning: number;
  };
  issues: DataQualityIssue[];
};

type RowAggregate = {
  countedSourceFileCount: number;
  rowCount: number;
};

function aggregateRows(dataset: DatasetSourceState): RowAggregate {
  const countable = dataset.files.filter((file) => typeof file.rowCount === 'number');
  return {
    countedSourceFileCount: countable.length,
    rowCount: countable.reduce((total, file) => total + (file.rowCount ?? 0), 0),
  };
}

function rateIssue(
  datasetId: string,
  baselineRowCount: number,
  currentRowCount: number,
): DataQualityIssue | null {
  if (baselineRowCount < MIN_BASELINE_ROWS_FOR_RATE_WARNING || currentRowCount <= 0) return null;

  const ratio = currentRowCount / baselineRowCount;
  if (ratio <= COLLAPSE_RATIO_WARNING) {
    return {
      datasetId,
      severity: 'warning',
      kind: 'severe_row_count_collapse',
      message:
        `Row count fell from ${baselineRowCount} to ${currentRowCount} ` +
        `(${(ratio * 100).toFixed(1)}% of the reviewed baseline).`,
      baselineRowCount,
      currentRowCount,
      ratio,
    };
  }

  if (ratio >= SPIKE_RATIO_WARNING) {
    return {
      datasetId,
      severity: 'warning',
      kind: 'severe_row_count_spike',
      message:
        `Row count rose from ${baselineRowCount} to ${currentRowCount} ` +
        `(${(ratio * 100).toFixed(1)}% of the reviewed baseline).`,
      baselineRowCount,
      currentRowCount,
      ratio,
    };
  }

  return null;
}

export function assessDataQuality(
  baseline: DataReleaseBaseline,
  currentDatasets: DatasetSourceState[],
  checkedAt = new Date().toISOString(),
): DataQualityAnomalyReport {
  const currentById = new Map(currentDatasets.map((dataset) => [dataset.id, dataset]));
  const issues: DataQualityIssue[] = [];
  let comparableDatasetCount = 0;

  for (const previous of [...baseline.datasets].sort((a, b) => a.id.localeCompare(b.id))) {
    const before = aggregateRows(previous);
    if (before.countedSourceFileCount === 0) continue;

    comparableDatasetCount += 1;
    const current = currentById.get(previous.id);

    if (!current) {
      if (before.rowCount > 0) {
        issues.push({
          datasetId: previous.id,
          severity: 'blocker',
          kind: 'missing_dataset',
          message: 'A previously countable raw-data directory is missing after the release fetch.',
          baselineRowCount: before.rowCount,
        });
      }
      continue;
    }

    const currentFilesByPath = new Map(current.files.map((file) => [file.relativePath, file]));
    let stableFileUnreadable = false;

    for (const previousFile of previous.files) {
      if (typeof previousFile.rowCount !== 'number') continue;
      const currentFile = currentFilesByPath.get(previousFile.relativePath);
      if (!currentFile || currentFile.rowCount !== null) continue;

      stableFileUnreadable = true;
      issues.push({
        datasetId: previous.id,
        severity: 'blocker',
        kind: 'source_file_row_count_unreadable',
        message: 'A previously countable source file can no longer be parsed for row-count validation.',
        baselineRowCount: previousFile.rowCount,
        sourcePath: previousFile.relativePath,
      });
    }

    const after = aggregateRows(current);

    if (after.countedSourceFileCount === 0) {
      if (before.rowCount > 0 && !stableFileUnreadable) {
        issues.push({
          datasetId: previous.id,
          severity: 'blocker',
          kind: 'dataset_row_count_unreadable',
          message: 'No current source file can be parsed for row-count validation.',
          baselineRowCount: before.rowCount,
        });
      }
      continue;
    }

    if (before.rowCount > 0 && after.rowCount === 0) {
      issues.push({
        datasetId: previous.id,
        severity: 'blocker',
        kind: 'unexpected_empty_dataset',
        message: 'A dataset with records in the reviewed baseline became empty after the release fetch.',
        baselineRowCount: before.rowCount,
        currentRowCount: after.rowCount,
      });
      continue;
    }

    const warning = rateIssue(previous.id, before.rowCount, after.rowCount);
    if (warning) issues.push(warning);
  }

  issues.sort((a, b) =>
    a.severity.localeCompare(b.severity) ||
    a.datasetId.localeCompare(b.datasetId) ||
    a.kind.localeCompare(b.kind) ||
    (a.sourcePath ?? '').localeCompare(b.sourcePath ?? ''),
  );

  const blockerCount = issues.filter((issue) => issue.severity === 'blocker').length;
  const warningCount = issues.filter((issue) => issue.severity === 'warning').length;

  return {
    schemaVersion: 1,
    baselineCapturedAt: baseline.capturedAt,
    checkedAt,
    status: blockerCount ? 'blocked' : 'passed',
    comparableDatasetCount,
    blockerCount,
    warningCount,
    thresholds: {
      minimumBaselineRowsForRateWarning: MIN_BASELINE_ROWS_FOR_RATE_WARNING,
      collapseRatioWarning: COLLAPSE_RATIO_WARNING,
      spikeRatioWarning: SPIKE_RATIO_WARNING,
    },
    issues,
  };
}

function argumentValue(prefix: string) {
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
}

async function runCli() {
  if (!process.argv.includes('--check')) throw new Error('Pass --check to run the data-quality anomaly guard.');

  const rawDir = resolve(argumentValue('--raw-dir=') ?? join(process.cwd(), 'data/raw'));
  const baselinePath = resolve(
    argumentValue('--baseline=') ?? join(process.cwd(), '.tmp/data-release-baseline.json'),
  );
  const reportPath = resolve(
    argumentValue('--report=') ?? join(process.cwd(), 'public/data/data-quality-anomaly-report.json'),
  );

  const baseline = JSON.parse(await readFile(baselinePath, 'utf8')) as DataReleaseBaseline;
  if (baseline.schemaVersion !== 1 || !Array.isArray(baseline.datasets)) {
    throw new Error('Unsupported or invalid data release baseline.');
  }

  const current = await scanRawSourceState(rawDir);
  const report = assessDataQuality(baseline, current);
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');

  console.log(
    'Data-quality anomaly guard: ' +
    report.blockerCount +
    ' blocker(s), ' +
    report.warningCount +
    ' warning(s) across ' +
    report.comparableDatasetCount +
    ' comparable raw-data directories.',
  );

  for (const issue of report.issues) {
    console.log(`[${issue.severity}] ${issue.datasetId}: ${issue.message}`);
  }

  if (report.status === 'blocked') {
    throw new Error(
      `Data-quality anomaly guard blocked conversion with ${report.blockerCount} release blocker(s).`,
    );
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
