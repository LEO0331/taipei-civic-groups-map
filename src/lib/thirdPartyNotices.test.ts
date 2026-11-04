import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
// The notice generator is a plain Node build script shared with prebuild.
// @ts-expect-error no declaration file is needed for this Node-only test import
import { buildThirdPartyNotices } from '../../scripts/buildThirdPartyNotices.mjs';

test('deployed notices reproduce exact installed production licenses and copied artwork MIT text', async () => {
  const generated = await buildThirdPartyNotices();
  assert.equal(await readFile('public/THIRD_PARTY_NOTICES.txt', 'utf8'), generated);
  for (const name of ['react', 'react-dom', 'scheduler', 'leaflet', 'react-leaflet', '@react-leaflet/core']) {
    const metadata = JSON.parse(await readFile(`node_modules/${name}/package.json`, 'utf8'));
    assert.ok(generated.includes(`${name} ${metadata.version}`));
  }
  const hippocratic = await readFile('node_modules/react-leaflet/LICENSE.md', 'utf8');
  assert.ok(generated.includes(hippocratic));
  assert.ok(generated.includes(await readFile('node_modules/leaflet/LICENSE', 'utf8')));
  assert.ok(generated.includes('Copyright (c) 2026 LeoChen'));
  assert.ok(generated.includes((await readFile('docs/civic-explorer-attribution.md', 'utf8')).replace(/\r\n/g, '\n').trimEnd()));
});
