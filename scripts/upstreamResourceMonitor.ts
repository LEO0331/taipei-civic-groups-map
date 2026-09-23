import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export type MonitorStatus =
  | 'unchanged'
  | 'newer_resource'
  | 'resource_changed'
  | 'unknown_date'
  | 'unresolved'
  | 'error';

type Json = Record<string, unknown>;

export type LocalProvenance = {
  id: string;
  sourcePage?: string;
  sourceName?: string;
  resourceId?: string;
  recordedSourceFileUpdatedAt?: string;
};

export type UpstreamResource = {
  name: string;
  updatedAt: string;
  resourceId?: string;
  format?: string;
};

export type MonitorEntry = LocalProvenance & {
  status: MonitorStatus;
  upstreamSourceFileUpdatedAt?: string;
  upstreamResourceId?: string;
  message: string;
};

export type UpstreamMonitorReport = {
  schemaVersion: 1;
  checkedAt: string;
  totalDatasetDirectoryCount: number;
  eligibleDatasetCount: number;
  skippedUnsupportedSourceCount: number;
  counts: Record<MonitorStatus, number>;
  entries: MonitorEntry[];
};

const TAIPEI_DATA_HOST = 'data.taipei';
const TAIPEI_DETAIL_PATH = '/dataset/detail';
const RESOURCE_ID_PATTERN = /[?&]rid=([0-9a-f-]{36})(?:&|["'&#<\s]|$)/i;
const TAIPEI_TIMESTAMP_PATTERN = /\b(20\d{2}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})\b/;

function readJson(path: string): Promise<Json | null> {
  return readFile(path, 'utf8').then((value) => JSON.parse(value) as Json).catch(() => null);
}

function stringValue(record: Json | null, key: string) {
  const value = record?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function textContent(html: string) {
  return decodeHtml(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  ).replace(/\s+/g, ' ').trim();
}

export function normalizeTaipeiTimestamp(value: string) {
  const match = value.match(TAIPEI_TIMESTAMP_PATTERN);
  if (match) return `${match[1]}T${match[2]}+08:00`;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return undefined;
  return value;
}

export function extractResourceId(value?: string) {
  if (!value) return undefined;
  return value.match(RESOURCE_ID_PATTERN)?.[1]?.toLowerCase();
}

export function isTaipeiDataDetailPage(value?: string) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      url.hostname === TAIPEI_DATA_HOST &&
      url.pathname.replace(/\/$/, '') === TAIPEI_DETAIL_PATH &&
      Boolean(url.searchParams.get('id'))
    );
  } catch {
    return false;
  }
}

export function parseTaipeiResourceRows(html: string): UpstreamResource[] {
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];
  const resources: UpstreamResource[] = [];

  for (const row of rows) {
    const cells = [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => ({
      html: match[1],
      text: textContent(match[1]),
    }));
    if (!cells.length) continue;

    const updatedCell = cells.find((cell) => TAIPEI_TIMESTAMP_PATTERN.test(cell.text));
    if (!updatedCell) continue;
    const updatedAt = normalizeTaipeiTimestamp(updatedCell.text);
    if (!updatedAt) continue;

    const rowHtml = row[1];
    const resourceId = extractResourceId(decodeHtml(rowHtml));
    const name = cells[0]?.text ?? '';
    const format = cells.find((cell) => /^(CSV|JSON|XML|XLSX?|ODS|ZIP|PDF)$/i.test(cell.text))?.text;
    if (!name) continue;

    resources.push({ name, updatedAt, resourceId, format });
  }

  return resources;
}

function sameName(left?: string, right?: string) {
  if (!left || !right) return false;
  const normalize = (value: string) => value.replace(/\s+/g, '').toLocaleLowerCase('zh-Hant');
  return normalize(left) === normalize(right);
}

export function assessUpstreamEntry(local: LocalProvenance, resources: UpstreamResource[]): MonitorEntry {
  let selected: UpstreamResource | undefined;

  if (local.resourceId) {
    selected = resources.find((resource) => resource.resourceId === local.resourceId);
    if (!selected) {
      const replacement = resources.find((resource) => sameName(resource.name, local.sourceName)) ??
        (resources.length === 1 ? resources[0] : undefined);
      if (replacement) {
        return {
          ...local,
          status: 'resource_changed',
          upstreamSourceFileUpdatedAt: replacement.updatedAt,
          upstreamResourceId: replacement.resourceId,
          message: `Recorded resource ${local.resourceId} is no longer present; a replacement candidate was found.`,
        };
      }
      return {
        ...local,
        status: 'unresolved',
        message: `Recorded resource ${local.resourceId} was not found and no unambiguous replacement could be selected.`,
      };
    }
  } else if (local.sourceName) {
    selected = resources.find((resource) => sameName(resource.name, local.sourceName));
  }

  if (!selected && resources.length === 1) selected = resources[0];
  if (!selected) {
    return {
      ...local,
      status: 'unresolved',
      message: resources.length
        ? 'Multiple upstream resources were found, but local provenance is not specific enough to select one safely.'
        : 'No downloadable resource row with an authoritative update timestamp could be parsed.',
    };
  }

  if (!local.recordedSourceFileUpdatedAt) {
    return {
      ...local,
      status: 'unknown_date',
      upstreamSourceFileUpdatedAt: selected.updatedAt,
      upstreamResourceId: selected.resourceId,
      message: 'An upstream file timestamp is visible, but the local snapshot has no recorded authoritative source date.',
    };
  }

  const localTimestamp = new Date(local.recordedSourceFileUpdatedAt);
  const upstreamTimestamp = new Date(selected.updatedAt);
  if (Number.isNaN(localTimestamp.valueOf()) || Number.isNaN(upstreamTimestamp.valueOf())) {
    return { ...local, status: 'unresolved', message: 'The local or upstream source timestamp could not be parsed safely.' };
  }

  if (upstreamTimestamp.valueOf() > localTimestamp.valueOf()) {
    return {
      ...local,
      status: 'newer_resource',
      upstreamSourceFileUpdatedAt: selected.updatedAt,
      upstreamResourceId: selected.resourceId,
      message: 'The official downloadable resource has a newer file timestamp than the recorded local provenance.',
    };
  }

  if (upstreamTimestamp.valueOf() < localTimestamp.valueOf()) {
    return {
      ...local,
      status: 'unresolved',
      upstreamSourceFileUpdatedAt: selected.updatedAt,
      upstreamResourceId: selected.resourceId,
      message: 'The official resource timestamp is older than the recorded local provenance; manual review is required.',
    };
  }

  return {
    ...local,
    status: 'unchanged',
    upstreamSourceFileUpdatedAt: selected.updatedAt,
    upstreamResourceId: selected.resourceId,
    message: 'The official downloadable resource timestamp matches the recorded local provenance.',
  };
}

export async function discoverLocalProvenance(
  publicDataDir = resolve('public/data'),
  rawDataDir = resolve('data/raw'),
) {
  const directories = (await readdir(publicDataDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const entries = await Promise.all(directories.map(async (id): Promise<LocalProvenance> => {
    const publicMetadata = await readJson(join(publicDataDir, id, 'metadata.json'));
    const rawMetadata = await readJson(join(rawDataDir, id, 'fetch-metadata.json'));
    const possiblePages = [
      stringValue(publicMetadata, 'sourcePage'),
      stringValue(rawMetadata, 'sourcePage'),
      stringValue(publicMetadata, 'sourceUrl'),
      stringValue(rawMetadata, 'sourceUrl'),
    ];
    const sourcePage = possiblePages.find(isTaipeiDataDetailPage);
    const sourceName =
      stringValue(publicMetadata, 'source') ??
      stringValue(publicMetadata, 'sourceName') ??
      stringValue(rawMetadata, 'resourceName');
    const possibleResourceUrls = [
      stringValue(rawMetadata, 'sourceUrl'),
      stringValue(rawMetadata, 'downloadUrl'),
      stringValue(publicMetadata, 'sourceUrl'),
      stringValue(publicMetadata, 'downloadUrl'),
    ];
    const resourceId = possibleResourceUrls.map(extractResourceId).find(Boolean);
    const recordedSourceFileUpdatedAt =
      stringValue(publicMetadata, 'sourceFileUpdatedAt') ?? stringValue(rawMetadata, 'sourceFileUpdatedAt');

    return { id, sourcePage, sourceName, resourceId, recordedSourceFileUpdatedAt };
  }));

  return entries;
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, worker: (item: T) => Promise<R>) {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function buildUpstreamMonitorReport(
  localEntries: LocalProvenance[],
  options: {
    fetchHtml?: (url: string) => Promise<string>;
    checkedAt?: string;
    concurrency?: number;
  } = {},
): Promise<UpstreamMonitorReport> {
  const checkedAt = options.checkedAt ?? new Date().toISOString();
  const concurrency = Math.max(1, options.concurrency ?? 4);
  const fetchHtml = options.fetchHtml ?? (async (url: string) => {
    const response = await fetch(url, {
      headers: { 'user-agent': 'taipei-civic-groups-map-upstream-monitor/1.0' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
    return response.text();
  });

  const eligible = localEntries.filter((entry): entry is LocalProvenance & { sourcePage: string } => Boolean(entry.sourcePage));
  const grouped = new Map<string, LocalProvenance[]>();
  for (const entry of eligible) grouped.set(entry.sourcePage, [...(grouped.get(entry.sourcePage) ?? []), entry]);

  const pageGroups = [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
  const groupedResults = await mapWithConcurrency(pageGroups, concurrency, async ([sourcePage, entries]) => {
    try {
      const html = await fetchHtml(sourcePage);
      const resources = parseTaipeiResourceRows(html);
      return entries.map((entry) => assessUpstreamEntry(entry, resources));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return entries.map((entry): MonitorEntry => ({
        ...entry,
        status: 'error',
        message: `Official source page check failed: ${message}`,
      }));
    }
  });

  const entries = groupedResults.flat().sort((a, b) => a.id.localeCompare(b.id));
  const counts: Record<MonitorStatus, number> = {
    unchanged: 0,
    newer_resource: 0,
    resource_changed: 0,
    unknown_date: 0,
    unresolved: 0,
    error: 0,
  };
  for (const entry of entries) counts[entry.status] += 1;

  return {
    schemaVersion: 1,
    checkedAt,
    totalDatasetDirectoryCount: localEntries.length,
    eligibleDatasetCount: eligible.length,
    skippedUnsupportedSourceCount: localEntries.length - eligible.length,
    counts,
    entries,
  };
}

function argumentValue(prefix: string) {
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
}

async function runCli() {
  const reportPath = resolve(argumentValue('--report=') ?? '.tmp/upstream-monitor-report.json');
  const concurrency = Number(argumentValue('--concurrency=') ?? '4');
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 16) {
    throw new Error('--concurrency must be an integer from 1 to 16.');
  }

  const localEntries = await discoverLocalProvenance();
  const report = await buildUpstreamMonitorReport(localEntries, { concurrency });
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');

  console.log(
    `Upstream monitor: ${report.eligibleDatasetCount}/${report.totalDatasetDirectoryCount} eligible; ` +
    `${report.counts.unchanged} unchanged, ${report.counts.newer_resource} newer, ` +
    `${report.counts.resource_changed} resource-changed, ${report.counts.unknown_date} unknown-date, ` +
    `${report.counts.unresolved} unresolved, ${report.counts.error} error; ` +
    `${report.skippedUnsupportedSourceCount} unsupported-source skipped.`,
  );
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
