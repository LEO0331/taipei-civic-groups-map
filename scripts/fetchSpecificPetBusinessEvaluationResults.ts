import { access, copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const datasetId = 'c32bc515-c984-4929-881f-31528e24fb13';
const rawDir = join(process.cwd(), 'data/raw/specific-pet-business-evaluation-results');
const metadataPath = join(rawDir, 'fetch-metadata.json');
const sourcePage = `https://data.taipei/dataset/detail?id=${datasetId}`;
const args = process.argv.slice(2), force = args.includes('--force');
const locals = args.filter((arg) => arg.startsWith('--local=')).map((arg) => arg.slice(8));
const names = args.filter((arg) => arg.startsWith('--name=')).map((arg) => arg.slice(7));
const urls = args.filter((arg) => arg.startsWith('--url=')).map((arg) => arg.slice(6));
const fileName = (name: string) => `${name.match(/(\d{3})年度/)?.[1] ?? basename(name, '.csv')}-specific-pet-business-evaluation-results.csv`;

async function writeMetadata(resources: unknown[], failure?: string) {
  const previous = await readFile(metadataPath, 'utf8').then(JSON.parse).catch(() => ({}));
  await writeFile(metadataPath, JSON.stringify({ sourceUrl: sourcePage, downloadedAt: new Date().toISOString(), resources, failure, previous }, null, 2));
}
async function officialUrls() {
  const response = await fetch(sourcePage); if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const html = (await response.text()).replaceAll('\\u0026', '&');
  return [...html.matchAll(new RegExp(`(\\d{3}年度臺北市特定寵物業評鑑成果)[\\s\\S]{0,800}?(/api/dataset/${datasetId}/resource/[0-9a-f-]{36}/download[^"'<>]*)`, 'gi'))].map((m) => ({ name: m[1], url: `https://data.taipei${m[2]}` }));
}

await mkdir(rawDir, { recursive: true });
const resources = [];
if (locals.length) {
  for (const [index, local] of locals.entries()) {
    const name = names[index] ?? basename(local, '.csv'), destination = join(rawDir, fileName(name));
    if (!force) await access(destination).then(() => { throw new Error(`${destination} exists. Pass --force to replace it.`); }).catch((error) => { if (!String(error).includes('ENOENT')) throw error; });
    await copyFile(local, destination);
    const file = await stat(destination);
    resources.push({ resourceName: name, sourceUrl: 'local-file', file: basename(destination), fileSize: file.size, notes: [`Copied from ${basename(local)}`] });
  }
} else {
  try {
    const discovered = urls.length ? urls.map((url, index) => ({ url, name: names[index] ?? `${index + 1}` })) : await officialUrls();
    for (const resource of discovered) {
      const destination = join(rawDir, fileName(resource.name));
      if (!force) try { await access(destination); resources.push({ ...resource, file: basename(destination), notes: ['Existing local CSV reused.'] }); continue; } catch { /* fetch */ }
      const response = await fetch(resource.url); if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      await writeFile(destination, Buffer.from(await response.arrayBuffer()));
      const file = await stat(destination);
      resources.push({ ...resource, file: basename(destination), fileSize: file.size, notes: ['Downloaded resource.'] });
    }
  } catch (error) {
    const failure = error instanceof Error ? error.message : String(error);
    await writeMetadata(resources, failure);
    if (!resources.length) throw new Error(`No local CSV copied and official download failed: ${failure}. Pass --local=/path.csv --name=114年度臺北市特定寵物業評鑑成果.`);
  }
}
await writeMetadata(resources);
console.log(`Prepared ${resources.length} specific pet business evaluation CSV resource(s) in ${rawDir}.`);
