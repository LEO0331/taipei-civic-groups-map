import { access, copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const datasetId = 'f4fd7f03-9bf6-41de-a003-02c437596570';
const sourceName = '臺北捷運公司採購案件預定招標時程資訊';
const sourcePage = `https://data.taipei/dataset/detail?id=${datasetId}`;
const rawDir = join(process.cwd(), 'data/raw/metro-procurement-schedules');
const metadataPath = join(rawDir, 'fetch-metadata.json');
const args = process.argv.slice(2);
const local = args.find((arg) => arg.startsWith('--local='))?.slice(8);
const force = args.includes('--force');

type Resource = { name: string; period: string; url: string };

function discoverResources(html: string) {
  const resources = new Map<string, Resource>();
  const pathPattern = new RegExp(`/api/dataset/${datasetId}/resource/([0-9a-f-]{36})/download`, 'gi');
  for (const match of html.matchAll(pathPattern)) {
    const nearby = html.slice(match.index, match.index + 1000).replaceAll('\\u0026', '&');
    const period = nearby.match(new RegExp(`${sourceName}_(\\d{6})`))?.[1];
    if (!period) continue;
    resources.set(period, {
      name: `${sourceName}_${period}.csv`,
      period,
      url: `https://data.taipei${match[0]}`,
    });
  }
  return [...resources.values()].sort((a, b) => a.period.localeCompare(b.period));
}

async function existingCsvs() {
  return (await readdir(rawDir)).filter((file) => file.toLowerCase().endsWith('.csv')).sort();
}

await mkdir(rawDir, { recursive: true });
if (local) {
  const destination = join(rawDir, basename(local));
  if (force || await access(destination).then(() => false).catch(() => true)) await copyFile(local, destination);
}

const resources: Resource[] = [];
const failures: Array<{ name?: string; url: string; error: string }> = [];
try {
  const response = await fetch(sourcePage);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  resources.push(...discoverResources(await response.text()));
  if (!resources.length) throw new Error('No monthly CSV resources found in dataset page.');
} catch (error) {
  failures.push({ url: sourcePage, error: error instanceof Error ? error.message : String(error) });
}

const downloaded = [];
const skipped = [];
for (const resource of resources) {
  const destination = join(rawDir, resource.name);
  if (!force && await access(destination).then(() => true).catch(() => false)) {
    skipped.push(resource);
    continue;
  }
  try {
    const response = await fetch(resource.url);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    await writeFile(destination, Buffer.from(await response.arrayBuffer()));
    const file = await stat(destination);
    downloaded.push({ ...resource, downloadedAt: new Date().toISOString(), fileSize: file.size, encoding: 'CP950 / Big5-compatible' });
  } catch (error) {
    failures.push({ name: resource.name, url: resource.url, error: error instanceof Error ? error.message : String(error) });
  }
}

const localFiles = await existingCsvs();
if (!localFiles.length) throw new Error(`No metro procurement CSV files available. Dataset discovery failures: ${failures.map((item) => item.error).join('; ')}`);
const previous = await readFile(metadataPath, 'utf8').then((text) => JSON.parse(text)).catch(() => ({}));
await writeFile(metadataPath, JSON.stringify({
  sourcePage,
  fetchedAt: new Date().toISOString(),
  discoveredResourceCount: resources.length,
  resources: downloaded,
  skippedResources: skipped,
  failures,
  localFiles,
  previousResources: previous.resources ?? [],
}, null, 2));
console.log(`Metro procurement resources: ${downloaded.length} downloaded, ${skipped.length} skipped, ${failures.length} failed, ${localFiles.length} local CSVs.`);
