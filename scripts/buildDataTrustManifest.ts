import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

type Json = Record<string, unknown>;
const dataDir = join(process.cwd(), 'public/data');
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
  const metadata = await readFile(metadataPath, 'utf8').then((text) => JSON.parse(text) as Json).catch(() => null);
  const summary = await readFile(summaryPath, 'utf8').then((text) => JSON.parse(text) as Json).catch(() => null);
  const sourceUpdatedAt = findDate(metadata) ?? findDate(summary);
  return { id: directory.name, sourceName: typeof metadata?.source === 'string' ? metadata.source : undefined, sourceUpdatedAt };
}));

const manifest = {
  schemaVersion: 1,
  datasetDirectoryCount: entries.length,
  datedDatasetCount: entries.filter((entry) => entry.sourceUpdatedAt).length,
  entries: entries.sort((a, b) => a.id.localeCompare(b.id)),
};

const releaseSummary = {
  schemaVersion: 1,
  datasetDirectoryCount: manifest.datasetDirectoryCount,
  datedDatasetCount: manifest.datedDatasetCount,
  unknownDateDatasetCount: manifest.datasetDirectoryCount - manifest.datedDatasetCount,
  datasetsWithSourceDates: manifest.entries.filter((entry) => entry.sourceUpdatedAt).map((entry) => entry.id),
  datasetsWithoutSourceDates: manifest.entries.filter((entry) => !entry.sourceUpdatedAt).map((entry) => entry.id),
};

await writeFile(join(dataDir, 'data-trust-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(join(dataDir, 'data-release-summary.json'), `${JSON.stringify(releaseSummary, null, 2)}\n`);
console.log(`Built data trust manifest and release summary for ${manifest.datasetDirectoryCount} dataset directories.`);
