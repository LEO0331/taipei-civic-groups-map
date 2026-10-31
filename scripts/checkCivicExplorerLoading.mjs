import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { writeFileSync, readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { createServer } from 'node:net';
import assert from 'node:assert/strict';
// Allocate a fresh port so another preview cannot supply misleading evidence.
const port = await new Promise((resolve, reject) => {
  const probe = createServer();
  probe.on('error', reject);
  probe.listen(0, '127.0.0.1', () => {
    const port = probe.address().port;
    probe.close(error => error ? reject(error) : resolve(port));
  });
});
const origin = `http://127.0.0.1:${port}/taipei-civic-groups-map/`;
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { windowsHide: true, stdio: 'pipe' });
let browser;
try {
  for (let n = 0; n < 100; n++) {
    if (server.exitCode !== null) throw new Error(`Preview exited before readiness: ${server.exitCode}`);
    try { if ((await fetch(origin)).ok) break; } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  browser = await chromium.launch();
  const page = await browser.newPage();
  const requests = [], errors = [];
  page.on('request', request => requests.push(new URL(request.url()).pathname));
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}?dataset=notes&lang=en`);
  await page.waitForLoadState('networkidle');
  const initial = [...requests];
  assert.equal(initial.filter(url => /CivicExplorer-/.test(url)).length, 0);
  await page.locator('.catalogue-trigger').click();
  await page.locator('.catalogue-explorer-trigger').click();
  await page.locator('#civic-explorer-heading').waitFor();
  for (const hub of await page.locator('[data-explorer-group]').all()) await hub.click();
  await page.waitForLoadState('networkidle');
  const added = requests.slice(initial.length);
  assert.ok(added.some(url => /CivicExplorer-.*\.js/.test(url)));
  assert.equal(added.filter(url => /\/data\/|Module-.*\.js|TileLayer-/.test(url)).length, 0);
  assert.deepEqual(errors, []);
  const assets = readdirSync('dist/assets').filter(name => /^(index-|CivicExplorer-)/.test(name)).map(name => {
    const bytes = readFileSync('dist/assets/' + name);
    return { name, bytes: bytes.length, gzipBytes: gzipSync(bytes, { level: 9 }).length };
  });
  writeFileSync('docs/evidence/civic-explorer/production-loading.json', JSON.stringify({ status: 'PASS', initialRequests: initial, explorerAddedRequests: added, unexpectedPageErrors: errors, assets }, null, 2) + '\n');
  console.log(JSON.stringify({ status: 'PASS', added, assets }));
} finally { await browser?.close(); server.kill(); }
