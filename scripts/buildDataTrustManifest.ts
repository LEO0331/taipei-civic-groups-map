import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

type Json = Record<string, unknown>;
const dataDir = join(process.cwd(), 'public/data');
const rawDataDir = join(process.cwd(), 'data/raw');
const dateKeys = ['csvUpdateDate', 'sourceFileUpdatedAt', 'sourceUpdatedAt', 'updatedAt', 'metadataUpdateDate'];

function findDate(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Json;
  for (const key of dateKeys) if (typeof record[key] === 'string' && !Number.isNaN(new Date(record[key] as string).valueOf())) return record[key] as string;
  return undefined;
}

const directories = await readdir(dataDir, { withFileTypes: true });
const entries = await Promise.all(directories.filter((entry) => entry.isDirectory()).map(async (directory) => {
  const metadataPath = join(dataDir, directory.name, 'metadata.json');
  const summaryPath = join(dataDir, directory.name, 'summary.json');
  const fetchMetadataPath = join(rawDataDir, directory.name, 'fetch-metadata.json');
  const metadata = await readFile(metadataPath, 'utf8').then((text) => JSON.parse(text) as Json).catch(() => null);
  const summary = await readFile(summaryPath, 'utf8').then((text) => JSON.parse(text) as Json).catch(() => null);
  const fetchMetadata = await readFile(fetchMetadataPath, 'utf8').then((text) => JSON.parse(text) as Json).catch(() => null);
  const sourceUpdatedAt = findDate(metadata) ?? findDate(summary);
  const fetchFailure = typeof fetchMetadata?.failure === 'string' && fetchMetadata.failure.trim() ? fetchMetadata.failure : undefined;
  const fetchFailedAt = fetchFailure && typeof fetchMetadata?.downloadedAt === 'string' ? fetchMetadata.downloadedAt : undefined;
  return {
    id: directory.name,
    sourceName: typeof metadata?.source === 'string' ? metadata.source : typeof fetchMetadata?.resourceName === 'string' ? fetchMetadata.resourceName : undefined,
    sourceUpdatedAt,
    fetchStatus: fetchFailure ? 'reused_snapshot' : 'current',
    fetchFailedAt,
  };
}));

const manifest = {
  schemaVersion: 1,
  datasetDirectoryCount: entries.length,
  datedDatasetCount: entries.filter((entry) => entry.sourceUpdatedAt).length,
  fetchFallbackDatasetCount: entries.filter((entry) => entry.fetchStatus === 'reused_snapshot').length,
  entries: entries.sort((a, b) => a.id.localeCompare(b.id)),
};

const releaseSummary = {
  schemaVersion: 1,
  datasetDirectoryCount: manifest.datasetDirectoryCount,
  datedDatasetCount: manifest.datedDatasetCount,
  unknownDateDatasetCount: manifest.datasetDirectoryCount - manifest.datedDatasetCount,
  fetchFallbackDatasetCount: manifest.fetchFallbackDatasetCount,
  datasetsWithSourceDates: manifest.entries.filter((entry) => entry.sourceUpdatedAt).map((entry) => entry.id),
  datasetsWithoutSourceDates: manifest.entries.filter((entry) => !entry.sourceUpdatedAt).map((entry) => entry.id),
};

await writeFile(join(dataDir, 'data-trust-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(join(dataDir, 'data-release-summary.json'), `${JSON.stringify(releaseSummary, null, 2)}\n`);
console.log(`Built data trust manifest and release summary for ${manifest.datasetDirectoryCount} dataset directories.`);
