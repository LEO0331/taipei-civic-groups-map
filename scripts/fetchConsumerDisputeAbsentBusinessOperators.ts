import { access, copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const datasetId = 'c15e49fd-f511-46c8-8613-0ad91f370bfd';
const rawDir = join(process.cwd(), 'data/raw/consumer-dispute-absent-business-operators');
const metadataPath = join(rawDir, 'fetch-metadata.json');
const sourcePage = `https://data.taipei/dataset/detail?id=${datasetId}`;
const defaultLocals = [
  '/Users/Leo/Downloads/109年度無故不到場協商之被申訴企業經營者列表.csv',
  '/Users/Leo/Downloads/110年度無故不到場協商之被申訴企業經營者列表.csv',
  '/Users/Leo/Downloads/111年度無故不到場協商之被申訴企業經營者列表.csv',
  '/Users/Leo/Downloads/無故不到場協商之被申訴企業經營者列表.csv',
];
const args = process.argv.slice(2), force = args.includes('--force');
const locals = args.filter((arg) => arg.startsWith('--local=')).map((arg) => arg.slice(8));
const sanitize = (name: string) => basename(name).replace(/\.csv$/i, '').replace(/[^\p{Script=Han}\w.-]+/gu, '-').slice(0, 120);

async function exists(path: string) {
  try { await access(path); return true; } catch { return false; }
}
async function saveMetadata(resources: Array<{ resourceName: string; sourceUrl: string; fileName: string; fileSize: number; notes: string[] }>, warnings: string[]) {
  const previous = await readFile(metadataPath, 'utf8').then(JSON.parse).catch(() => ({}));
  await writeFile(metadataPath, JSON.stringify({ sourcePage, downloadedAt: new Date().toISOString(), resources, warnings, previous }, null, 2));
}
async function copyLocalFiles(paths: string[]) {
  const resources = [];
  for (const path of paths) {
    if (!await exists(path)) continue;
    const resourceName = basename(path).replace(/\.csv$/i, '');
    const fileName = `${sanitize(resourceName)}.csv`, destination = join(rawDir, fileName);
    if (!force && await exists(destination)) {
      const file = await stat(destination);
      resources.push({ resourceName, sourceUrl: 'local-file', fileName, fileSize: file.size, notes: ['Existing local CSV reused.'] });
      continue;
    }
    await copyFile(path, destination);
    const file = await stat(destination);
    resources.push({ resourceName, sourceUrl: 'local-file', fileName, fileSize: file.size, notes: [`Copied from ${basename(path)}`] });
  }
  return resources;
}
async function officialResources() {
  const response = await fetch(sourcePage);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const html = (await response.text()).replaceAll('\\u0026', '&');
  return [...html.matchAll(new RegExp(`(/api/dataset/${datasetId}/resource/[0-9a-f-]{36}/download[^"'<>]*)`, 'ig'))]
    .map((match) => `https://data.taipei${match[1]}`).filter((url, index, all) => all.indexOf(url) === index);
}

await mkdir(rawDir, { recursive: true });
const warnings: string[] = [];
let resources = await copyLocalFiles(locals.length ? locals : defaultLocals);
if (!resources.length) {
  for (const url of await officialResources()) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const name = decodeURIComponent(url.split('/').at(-2) ?? 'consumer-dispute-absence');
      const fileName = `${sanitize(name)}.csv`, destination = join(rawDir, fileName);
      await writeFile(destination, Buffer.from(await response.arrayBuffer()));
      const file = await stat(destination);
      resources.push({ resourceName: name, sourceUrl: url, fileName, fileSize: file.size, notes: ['Downloaded from official Taipei Open Data resource.'] });
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : String(error));
    }
  }
}
if (!resources.length) throw new Error('No consumer dispute absence CSV resources prepared.');
await saveMetadata(resources, warnings);
console.log(`Prepared ${resources.length} consumer dispute absence CSV resource(s).`);
