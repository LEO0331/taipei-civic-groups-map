import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

export type RawSourceFileSnapshot = {
  datasetId: string;
  relativePath: string;
  sha256: string;
  bytes: number;
  format: 'csv' | 'json' | 'other';
  rowCount: number | null;
};

export type DatasetSourceState = {
  id: string;
  sourceTimestamps: string[];
  effectiveSourceTimestamp?: string;
  files: RawSourceFileSnapshot[];
};

export type DataReleaseBaseline = {
  schemaVersion: 1;
  capturedAt: string;
  rawRoot: string;
  datasetDirectoryCount: number;
  sourceFileCount: number;
  datasets: DatasetSourceState[];
};

export type FileChangeStatus = 'added' | 'removed' | 'changed';

export type FileChange = {
  path: string;
  status: FileChangeStatus;
  sha256Before?: string;
  sha256After?: string;
  bytesBefore?: number;
  bytesAfter?: number;
  rowCountBefore?: number | null;
  rowCountAfter?: number | null;
};

export type DatasetChangeStatus = 'added' | 'removed' | 'changed';

export type DatasetChange = {
  id: string;
  status: DatasetChangeStatus;
  contentChanged: boolean;
  sourceTimestampChanged: boolean;
  sourceTimestampsBefore: string[];
  sourceTimestampsAfter: string[];
  effectiveSourceTimestampBefore?: string;
  effectiveSourceTimestampAfter?: string;
  sourceFileCountBefore: number;
  sourceFileCountAfter: number;
  bytesBefore: number;
  bytesAfter: number;
  countedSourceFileCountBefore: number;
  countedSourceFileCountAfter: number;
  sourceRowCountBefore: number;
  sourceRowCountAfter: number;
  files: FileChange[];
};

export type DataChangeSummary = {
  schemaVersion: 1;
  baselineCapturedAt: string;
  comparedAt: string;
  status: 'no_source_changes' | 'source_changes_detected';
  baselineDatasetDirectoryCount: number;
  currentDatasetDirectoryCount: number;
  baselineSourceFileCount: number;
  currentSourceFileCount: number;
  changedDatasetCount: number;
  addedDatasetCount: number;
  removedDatasetCount: number;
  unchangedDatasetCount: number;
  contentChangedDatasetCount: number;
  sourceTimestampChangedDatasetCount: number;
  changedFileCount: number;
  addedFileCount: number;
  removedFileCount: number;
  countedSourceFileCountBefore: number;
  countedSourceFileCountAfter: number;
  sourceRowCountBefore: number;
  sourceRowCountAfter: number;
  changes: DatasetChange[];
  unchangedDatasetIds: string[];
};

const authoritativeTimestampKeys = new Set([
  'csvUpdateDate',
  'sourceFileUpdatedAt',
  'sourceUpdatedAt',
]);

function isValidDate(value: string) {
  return !Number.isNaN(new Date(value).valueOf());
}

export function collectAuthoritativeSourceTimestamps(value: unknown): string[] {
  const timestamps = new Set<string>();

  const visit = (current: unknown): void => {
    if (Array.isArray(current)) {
      current.forEach(visit);
      return;
    }
    if (!current || typeof current !== 'object') return;

    for (const [key, nested] of Object.entries(current as Record<string, unknown>)) {
      if (authoritativeTimestampKeys.has(key) && typeof nested === 'string' && isValidDate(nested)) {
        timestamps.add(nested);
      } else if (nested && typeof nested === 'object') {
        visit(nested);
      }
    }
  };

  visit(value);
  return [...timestamps].sort((a, b) => new Date(a).valueOf() - new Date(b).valueOf() || a.localeCompare(b));
}

export function effectiveSourceTimestamp(timestamps: string[]) {
  return timestamps[0];
}

function decodeCsv(bytes: Uint8Array) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, '');
  } catch {
    return new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, '');
  }
}

export function countCsvDataRows(input: string) {
  let value = '';
  let rowHasValue = false;
  let quoted = false;
  let nonEmptyRecords = 0;

  const finishField = () => {
    if (value.trim().length > 0) rowHasValue = true;
    value = '';
  };

  const finishRecord = () => {
    finishField();
    if (rowHasValue) nonEmptyRecords += 1;
    rowHasValue = false;
  };

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (char === '"') {
      if (quoted && input[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      finishField();
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && input[index + 1] === '\n') index += 1;
      finishRecord();
    } else {
      value += char;
    }
  }

  if (quoted) throw new Error('Invalid CSV: unclosed quoted field.');
  if (value.length || rowHasValue) finishRecord();
  return Math.max(0, nonEmptyRecords - 1);
}

function formatForPath(filePath: string): RawSourceFileSnapshot['format'] {
  const extension = extname(filePath).toLowerCase();
  if (extension === '.csv') return 'csv';
  if (extension === '.json') return 'json';
  return 'other';
}

function rowCountForBytes(filePath: string, bytes: Uint8Array): number | null {
  try {
    const format = formatForPath(filePath);
    if (format === 'csv') return countCsvDataRows(decodeCsv(bytes));
    if (format === 'json') {
      const parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, '')) as unknown;
      return Array.isArray(parsed) ? parsed.length : null;
    }
  } catch {
    return null;
  }
  return null;
}

async function collectRawSourcePaths(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths: string[] = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      paths.push(...await collectRawSourcePaths(fullPath));
    } else if (entry.isFile() && entry.name !== 'fetch-metadata.json' && !entry.name.startsWith('.')) {
      paths.push(fullPath);
    }
  }

  return paths;
}

async function readDatasetSourceTimestamps(rawDir: string, datasetId: string) {
  const metadataPath = join(rawDir, datasetId, 'fetch-metadata.json');
  const metadata = await readFile(metadataPath, 'utf8')
    .then((text) => JSON.parse(text) as unknown)
    .catch(() => null);
  return collectAuthoritativeSourceTimestamps(metadata);
}

export async function scanRawSourceState(rawDir: string): Promise<DatasetSourceState[]> {
  const paths = await collectRawSourcePaths(rawDir);
  const files: RawSourceFileSnapshot[] = [];

  for (const filePath of paths) {
    const relativePath = relative(rawDir, filePath).split(sep).join('/');
    const datasetId = relativePath.split('/')[0] || '__root__';
    const bytes = await readFile(filePath);
    files.push({
      datasetId,
      relativePath,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      bytes: bytes.length,
      format: formatForPath(filePath),
      rowCount: rowCountForBytes(filePath, bytes),
    });
  }

  const grouped = new Map<string, RawSourceFileSnapshot[]>();
  for (const file of files) grouped.set(file.datasetId, [...(grouped.get(file.datasetId) ?? []), file]);

  return Promise.all(
    [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(async ([id, datasetFiles]) => {
        const sourceTimestamps = await readDatasetSourceTimestamps(rawDir, id);
        return {
          id,
          sourceTimestamps,
          effectiveSourceTimestamp: effectiveSourceTimestamp(sourceTimestamps),
          files: datasetFiles.sort((a, b) => a.relativePath.localeCompare(b.relativePath)),
        };
      }),
  );
}

export function buildDataReleaseBaseline(
  datasets: DatasetSourceState[],
  capturedAt = new Date().toISOString(),
  rawRoot = 'data/raw',
): DataReleaseBaseline {
  return {
    schemaVersion: 1,
    capturedAt,
    rawRoot,
    datasetDirectoryCount: datasets.length,
    sourceFileCount: datasets.reduce((total, dataset) => total + dataset.files.length, 0),
    datasets: [...datasets].sort((a, b) => a.id.localeCompare(b.id)),
  };
}

function aggregateFiles(files: RawSourceFileSnapshot[]) {
  const countedFiles = files.filter((file) => typeof file.rowCount === 'number');
  return {
    bytes: files.reduce((total, file) => total + file.bytes, 0),
    countedSourceFileCount: countedFiles.length,
    sourceRowCount: countedFiles.reduce((total, file) => total + (file.rowCount ?? 0), 0),
  };
}

function compareFiles(before: RawSourceFileSnapshot[], after: RawSourceFileSnapshot[]) {
  const beforeByPath = new Map(before.map((file) => [file.relativePath, file]));
  const afterByPath = new Map(after.map((file) => [file.relativePath, file]));
  const paths = [...new Set([...beforeByPath.keys(), ...afterByPath.keys()])].sort();
  const changes: FileChange[] = [];

  for (const path of paths) {
    const previous = beforeByPath.get(path);
    const current = afterByPath.get(path);

    if (!previous && current) {
      changes.push({
        path,
        status: 'added',
        sha256After: current.sha256,
        bytesAfter: current.bytes,
        rowCountAfter: current.rowCount,
      });
    } else if (previous && !current) {
      changes.push({
        path,
        status: 'removed',
        sha256Before: previous.sha256,
        bytesBefore: previous.bytes,
        rowCountBefore: previous.rowCount,
      });
    } else if (previous && current && previous.sha256 !== current.sha256) {
      changes.push({
        path,
        status: 'changed',
        sha256Before: previous.sha256,
        sha256After: current.sha256,
        bytesBefore: previous.bytes,
        bytesAfter: current.bytes,
        rowCountBefore: previous.rowCount,
        rowCountAfter: current.rowCount,
      });
    }
  }

  return changes;
}

function sameStrings(a: string[], b: string[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export function compareDataRelease(
  baseline: DataReleaseBaseline,
  currentDatasets: DatasetSourceState[],
  comparedAt = new Date().toISOString(),
): DataChangeSummary {
  const beforeById = new Map(baseline.datasets.map((dataset) => [dataset.id, dataset]));
  const afterById = new Map(currentDatasets.map((dataset) => [dataset.id, dataset]));
  const ids = [...new Set([...beforeById.keys(), ...afterById.keys()])].sort();

  const changes: DatasetChange[] = [];
  const unchangedDatasetIds: string[] = [];
  let changedDatasetCount = 0;
  let addedDatasetCount = 0;
  let removedDatasetCount = 0;
  let contentChangedDatasetCount = 0;
  let sourceTimestampChangedDatasetCount = 0;
  let changedFileCount = 0;
  let addedFileCount = 0;
  let removedFileCount = 0;

  for (const id of ids) {
    const before = beforeById.get(id);
    const after = afterById.get(id);
    const beforeFiles = before?.files ?? [];
    const afterFiles = after?.files ?? [];
    const fileChanges = compareFiles(beforeFiles, afterFiles);
    const sourceTimestampsBefore = before?.sourceTimestamps ?? [];
    const sourceTimestampsAfter = after?.sourceTimestamps ?? [];
    const sourceTimestampChanged = !sameStrings(sourceTimestampsBefore, sourceTimestampsAfter);
    const contentChanged = fileChanges.length > 0;

    if (before && after && !contentChanged && !sourceTimestampChanged) {
      unchangedDatasetIds.push(id);
      continue;
    }

    let status: DatasetChangeStatus;
    if (!before) {
      status = 'added';
      addedDatasetCount += 1;
    } else if (!after) {
      status = 'removed';
      removedDatasetCount += 1;
    } else {
      status = 'changed';
      changedDatasetCount += 1;
    }

    if (contentChanged) contentChangedDatasetCount += 1;
    if (sourceTimestampChanged) sourceTimestampChangedDatasetCount += 1;

    for (const file of fileChanges) {
      if (file.status === 'changed') changedFileCount += 1;
      if (file.status === 'added') addedFileCount += 1;
      if (file.status === 'removed') removedFileCount += 1;
    }

    const beforeAggregate = aggregateFiles(beforeFiles);
    const afterAggregate = aggregateFiles(afterFiles);

    changes.push({
      id,
      status,
      contentChanged,
      sourceTimestampChanged,
      sourceTimestampsBefore,
      sourceTimestampsAfter,
      effectiveSourceTimestampBefore: before?.effectiveSourceTimestamp,
      effectiveSourceTimestampAfter: after?.effectiveSourceTimestamp,
      sourceFileCountBefore: beforeFiles.length,
      sourceFileCountAfter: afterFiles.length,
      bytesBefore: beforeAggregate.bytes,
      bytesAfter: afterAggregate.bytes,
      countedSourceFileCountBefore: beforeAggregate.countedSourceFileCount,
      countedSourceFileCountAfter: afterAggregate.countedSourceFileCount,
      sourceRowCountBefore: beforeAggregate.sourceRowCount,
      sourceRowCountAfter: afterAggregate.sourceRowCount,
      files: fileChanges,
    });
  }

  const beforeAll = baseline.datasets.flatMap((dataset) => dataset.files);
  const afterAll = currentDatasets.flatMap((dataset) => dataset.files);
  const beforeAggregate = aggregateFiles(beforeAll);
  const afterAggregate = aggregateFiles(afterAll);

  return {
    schemaVersion: 1,
    baselineCapturedAt: baseline.capturedAt,
    comparedAt,
    status: changes.length ? 'source_changes_detected' : 'no_source_changes',
    baselineDatasetDirectoryCount: baseline.datasetDirectoryCount,
    currentDatasetDirectoryCount: currentDatasets.length,
    baselineSourceFileCount: baseline.sourceFileCount,
    currentSourceFileCount: afterAll.length,
    changedDatasetCount,
    addedDatasetCount,
    removedDatasetCount,
    unchangedDatasetCount: unchangedDatasetIds.length,
    contentChangedDatasetCount,
    sourceTimestampChangedDatasetCount,
    changedFileCount,
    addedFileCount,
    removedFileCount,
    countedSourceFileCountBefore: beforeAggregate.countedSourceFileCount,
    countedSourceFileCountAfter: afterAggregate.countedSourceFileCount,
    sourceRowCountBefore: beforeAggregate.sourceRowCount,
    sourceRowCountAfter: afterAggregate.sourceRowCount,
    changes,
    unchangedDatasetIds,
  };
}

function argumentValue(prefix: string) {
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
}

async function runCli() {
  const capture = process.argv.includes('--capture');
  const compare = process.argv.includes('--compare');
  if (capture === compare) throw new Error('Pass exactly one of --capture or --compare.');

  const rawDir = resolve(argumentValue('--raw-dir=') ?? join(process.cwd(), 'data/raw'));
  const baselinePath = resolve(argumentValue('--baseline=') ?? join(process.cwd(), '.tmp/data-release-baseline.json'));
  const reportPath = resolve(argumentValue('--report=') ?? join(process.cwd(), 'public/data/data-change-summary.json'));

  if (capture) {
    const datasets = await scanRawSourceState(rawDir);
    const baseline = buildDataReleaseBaseline(datasets);
    await mkdir(dirname(baselinePath), { recursive: true });
    await writeFile(baselinePath, JSON.stringify(baseline, null, 2) + '\n');
    console.log(
      'Captured release data baseline for ' +
      baseline.sourceFileCount +
      ' source files across ' +
      baseline.datasetDirectoryCount +
      ' raw-data directories.',
    );
    return;
  }

  const baseline = JSON.parse(await readFile(baselinePath, 'utf8')) as DataReleaseBaseline;
  if (baseline.schemaVersion !== 1 || !Array.isArray(baseline.datasets)) {
    throw new Error('Unsupported or invalid data release baseline.');
  }

  const current = await scanRawSourceState(rawDir);
  const summary = compareDataRelease(baseline, current);
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, JSON.stringify(summary, null, 2) + '\n');

  console.log(
    'Release data change summary: ' +
    summary.contentChangedDatasetCount +
    ' content-changed, ' +
    summary.sourceTimestampChangedDatasetCount +
    ' source-timestamp-changed, ' +
    summary.unchangedDatasetCount +
    ' unchanged raw-data directories.',
  );
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
