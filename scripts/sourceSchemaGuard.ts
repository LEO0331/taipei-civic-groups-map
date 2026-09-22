import { mkdir, open, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

export type CsvSchemaSnapshot = {
  datasetId: string;
  relativePath: string;
  headers: string[];
  encoding: string;
};

export type DatasetSchemaBaseline = {
  id: string;
  files: Array<{ relativePath: string; headers: string[] }>;
  headerSets: string[][];
};

export type SourceSchemaBaseline = {
  schemaVersion: 1;
  capturedAt: string;
  rawRoot: string;
  datasetDirectoryCount: number;
  csvFileCount: number;
  datasets: DatasetSchemaBaseline[];
};

export type SourceSchemaIssue =
  | { kind: 'missing_dataset_csv'; datasetId: string }
  | { kind: 'new_dataset'; datasetId: string; files: string[] }
  | {
      kind: 'unexpected_headers';
      datasetId: string;
      file: string;
      headers: string[];
      expectedHeaderSets: string[][];
    };

export type SourceSchemaReport = {
  schemaVersion: 1;
  checkedAt: string;
  baselineCapturedAt: string;
  baselineDatasetDirectoryCount: number;
  baselineCsvFileCount: number;
  currentDatasetDirectoryCount: number;
  currentCsvFileCount: number;
  matchedCsvFileCount: number;
  issueCount: number;
  status: 'passed' | 'failed';
  issues: SourceSchemaIssue[];
};

function normalizeHeaders(values: string[]) {
  return values.map((value, index) => {
    const withoutBom = index === 0 ? value.replace(/^\uFEFF/, '') : value;
    return withoutBom.trim();
  });
}

export function parseFirstCsvRecord(input: string) {
  let row: string[] = [];
  let value = '';
  let quoted = false;

  const finishRow = () => {
    row.push(value);
    value = '';
    const finished = row;
    row = [];
    return finished.some((cell) => cell.trim().length > 0) ? finished : null;
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
      row.push(value);
      value = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && input[index + 1] === '\n') index += 1;
      const finished = finishRow();
      if (finished) return finished;
    } else {
      value += char;
    }
  }

  if (quoted) throw new Error('Invalid CSV header: unclosed quoted field.');
  if (value.length || row.length) {
    const finished = finishRow();
    if (finished) return finished;
  }
  throw new Error('Invalid CSV header: no non-empty record found.');
}

export function decodeCsvHeader(bytes: Uint8Array) {
  const candidates = [
    { encoding: 'utf-8', label: 'UTF-8' },
    { encoding: 'big5', label: 'Big5/CP950' },
  ];

  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      const text = new TextDecoder(candidate.encoding, { fatal: true }).decode(bytes);
      return {
        headers: normalizeHeaders(parseFirstCsvRecord(text)),
        encoding: candidate.label,
      };
    } catch (error) {
      lastError = error;
    }
  }

  const message = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error('Unable to decode CSV header as UTF-8 or Big5/CP950: ' + message);
}

async function readHeaderPrefix(filePath: string) {
  const handle = await open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(256 * 1024);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    if (bytesRead === 0) throw new Error('CSV file is empty.');
    const content = buffer.subarray(0, bytesRead);
    const newline = content.indexOf(0x0a);
    return newline >= 0 ? content.subarray(0, newline + 1) : content;
  } finally {
    await handle.close();
  }
}

async function collectCsvFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectCsvFiles(fullPath));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.csv')) files.push(fullPath);
  }

  return files;
}

export async function scanRawCsvSchemas(rawDir: string): Promise<CsvSchemaSnapshot[]> {
  const files = await collectCsvFiles(rawDir);
  const snapshots: CsvSchemaSnapshot[] = [];

  for (const filePath of files) {
    const relativePath = relative(rawDir, filePath).split(sep).join('/');
    const datasetId = relativePath.split('/')[0] || '__root__';
    const decoded = decodeCsvHeader(await readHeaderPrefix(filePath));
    snapshots.push({
      datasetId,
      relativePath,
      headers: decoded.headers,
      encoding: decoded.encoding,
    });
  }

  return snapshots.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

const headerKey = (headers: string[]) => JSON.stringify(headers);

export function buildSourceSchemaBaseline(
  snapshots: CsvSchemaSnapshot[],
  capturedAt = new Date().toISOString(),
  rawRoot = 'data/raw',
): SourceSchemaBaseline {
  const grouped = new Map<string, CsvSchemaSnapshot[]>();
  for (const snapshot of snapshots) {
    grouped.set(snapshot.datasetId, [...(grouped.get(snapshot.datasetId) ?? []), snapshot]);
  }

  const datasets = [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([id, entries]) => {
    const headerSets = new Map<string, string[]>();
    for (const entry of entries) headerSets.set(headerKey(entry.headers), entry.headers);

    return {
      id,
      files: entries
        .map((entry) => ({ relativePath: entry.relativePath, headers: entry.headers }))
        .sort((a, b) => a.relativePath.localeCompare(b.relativePath)),
      headerSets: [...headerSets.values()].sort((a, b) => headerKey(a).localeCompare(headerKey(b))),
    };
  });

  return {
    schemaVersion: 1,
    capturedAt,
    rawRoot,
    datasetDirectoryCount: datasets.length,
    csvFileCount: snapshots.length,
    datasets,
  };
}

export function compareSourceSchemas(
  baseline: SourceSchemaBaseline,
  current: CsvSchemaSnapshot[],
  checkedAt = new Date().toISOString(),
): SourceSchemaReport {
  const baselineByDataset = new Map(baseline.datasets.map((dataset) => [dataset.id, dataset]));
  const currentByDataset = new Map<string, CsvSchemaSnapshot[]>();

  for (const snapshot of current) {
    currentByDataset.set(snapshot.datasetId, [...(currentByDataset.get(snapshot.datasetId) ?? []), snapshot]);
  }

  const issues: SourceSchemaIssue[] = [];
  let matchedCsvFileCount = 0;

  for (const dataset of baseline.datasets) {
    const currentFiles = currentByDataset.get(dataset.id) ?? [];
    if (currentFiles.length === 0) {
      issues.push({ kind: 'missing_dataset_csv', datasetId: dataset.id });
      continue;
    }

    const exactBaseline = new Map(dataset.files.map((file) => [file.relativePath, file.headers]));
    const datasetHeaderKeys = new Set(dataset.headerSets.map(headerKey));

    for (const currentFile of currentFiles) {
      const exactExpected = exactBaseline.get(currentFile.relativePath);
      const matches = exactExpected
        ? headerKey(exactExpected) === headerKey(currentFile.headers)
        : datasetHeaderKeys.has(headerKey(currentFile.headers));

      if (matches) {
        matchedCsvFileCount += 1;
      } else {
        issues.push({
          kind: 'unexpected_headers',
          datasetId: dataset.id,
          file: currentFile.relativePath,
          headers: currentFile.headers,
          expectedHeaderSets: exactExpected ? [exactExpected] : dataset.headerSets,
        });
      }
    }
  }

  for (const [datasetId, files] of currentByDataset) {
    if (!baselineByDataset.has(datasetId)) {
      issues.push({
        kind: 'new_dataset',
        datasetId,
        files: files.map((file) => file.relativePath).sort(),
      });
    }
  }

  return {
    schemaVersion: 1,
    checkedAt,
    baselineCapturedAt: baseline.capturedAt,
    baselineDatasetDirectoryCount: baseline.datasetDirectoryCount,
    baselineCsvFileCount: baseline.csvFileCount,
    currentDatasetDirectoryCount: currentByDataset.size,
    currentCsvFileCount: current.length,
    matchedCsvFileCount,
    issueCount: issues.length,
    status: issues.length ? 'failed' : 'passed',
    issues,
  };
}

function argumentValue(prefix: string) {
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
}

function describeIssue(issue: SourceSchemaIssue) {
  if (issue.kind === 'missing_dataset_csv') return issue.datasetId + ': no CSV remains after fetch';
  if (issue.kind === 'new_dataset') return issue.datasetId + ': new CSV dataset has no reviewed baseline';
  return issue.file + ': fetched headers do not match the reviewed baseline';
}

async function runCli() {
  const capture = process.argv.includes('--capture');
  const check = process.argv.includes('--check');
  if (capture === check) throw new Error('Pass exactly one of --capture or --check.');

  const rawDir = resolve(argumentValue('--raw-dir=') ?? join(process.cwd(), 'data/raw'));
  const baselinePath = resolve(argumentValue('--baseline=') ?? join(process.cwd(), '.tmp/source-schema-baseline.json'));
  const reportPath = resolve(argumentValue('--report=') ?? join(process.cwd(), 'public/data/source-schema-report.json'));

  if (capture) {
    const snapshots = await scanRawCsvSchemas(rawDir);
    const baseline = buildSourceSchemaBaseline(snapshots);
    await mkdir(dirname(baselinePath), { recursive: true });
    await writeFile(baselinePath, JSON.stringify(baseline, null, 2) + '\n');
    console.log(
      'Captured source schema baseline for ' +
      baseline.csvFileCount +
      ' CSV files across ' +
      baseline.datasetDirectoryCount +
      ' raw-data directories.',
    );
    return;
  }

  const baseline = JSON.parse(await readFile(baselinePath, 'utf8')) as SourceSchemaBaseline;
  if (baseline.schemaVersion !== 1 || !Array.isArray(baseline.datasets)) {
    throw new Error('Unsupported or invalid source schema baseline.');
  }

  const current = await scanRawCsvSchemas(rawDir);
  const report = compareSourceSchemas(baseline, current);
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');

  if (report.status === 'failed') {
    const preview = report.issues.slice(0, 10).map(describeIssue).join('\n- ');
    throw new Error(
      'Source schema drift detected (' +
      report.issueCount +
      ' issue' +
      (report.issueCount === 1 ? '' : 's') +
      ').\n- ' +
      preview +
      (report.issueCount > 10 ? '\n- ...' : ''),
    );
  }

  console.log(
    'Source schema check passed for ' +
    report.currentCsvFileCount +
    ' CSV files across ' +
    report.currentDatasetDirectoryCount +
    ' raw-data directories.',
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
