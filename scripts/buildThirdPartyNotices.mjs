import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Ship the exact installed production dependencies' full notices, not guessed
// summaries of their licenses. No claim about suitability or legal compliance.
export async function buildThirdPartyNotices(root = process.cwd()) {
  const lock = JSON.parse(await readFile(resolve(root, 'package-lock.json'), 'utf8'));
  const sections = ['Third-party software notices and adapted artwork attribution',
    'These are the upstream license texts for the installed production dependencies.\nTheir inclusion does not certify compliance or suitability for a particular use.'];
  for (const [path, entry] of Object.entries(lock.packages).sort(([a], [b]) => a.localeCompare(b))) {
    if (!path.startsWith('node_modules/') || entry.dev || entry.devOptional) continue;
    const directory = resolve(root, path);
    const metadata = JSON.parse(await readFile(resolve(directory, 'package.json'), 'utf8'));
    if (metadata.version !== entry.version) throw new Error(`Installed/locked version mismatch: ${path}`);
    const files = (await readdir(directory)).filter(name => /^(licen[cs]e|copying|copyright|notice)(\..*)?$/i.test(name)).sort();
    if (!files.length) throw new Error(`Missing upstream license text: ${metadata.name}`);
    const texts = await Promise.all(files.map(async name => `${name}\n${await readFile(resolve(directory, name), 'utf8')}`));
    sections.push(`${metadata.name} ${metadata.version}\nDeclared license: ${metadata.license ?? entry.license ?? 'see upstream text'}\n\n${texts.join('\n\n')}`);
  }
  const adapted = (await readFile(resolve(root, 'docs/civic-explorer-attribution.md'), 'utf8')).replace(/\r\n/g, '\n');
  sections.push(`Adapted Civic Explorer artwork and presentation attribution\n\n${adapted}`);
  sections.push('End of software notices.');
  return sections.join('\n\n' + '='.repeat(72) + '\n\n') + '\n';
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await writeFile(resolve('public/THIRD_PARTY_NOTICES.txt'), await buildThirdPartyNotices());
  console.log('Built deployable production dependency and Civic Explorer notices.');
}
