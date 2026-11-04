import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

test('actual legacy worker activation removes only owned stale caches and unregisters itself', async () => {
  const source = await readFile('public/sw.js', 'utf8');
  const handlers = new Map<string, (event: { waitUntil: (value: Promise<unknown>) => void }) => void>();
  const keys = ['portfolio-v1', 'taipei-crash-map-v2', 'taipei-civic-groups-v1', 'taipei-civic-groups-v108'];
  const deleted: string[] = [];
  let unregistered = 0, claimed = 0;
  vm.runInNewContext(source, {
    self: { addEventListener: (type: string, fn: never) => handlers.set(type, fn), clients: { claim: async () => { claimed++; } }, registration: { unregister: async () => { unregistered++; } } },
    caches: { keys: async () => keys, delete: async (key: string) => { deleted.push(key); return true; } },
  });
  let completion: Promise<unknown> | undefined;
  handlers.get('activate')!({ waitUntil: value => { completion = value; } });
  await completion;
  assert.deepEqual(deleted, ['taipei-civic-groups-v1']);
  assert.equal(unregistered, 1);
  assert.equal(claimed, 1);
});

test('production startup cleanup unregisters only the civic scope', async () => {
  const main = await readFile('src/main.tsx', 'utf8');
  const cleanup = main.slice(main.indexOf("if ('serviceWorker'"))
    .replace('import.meta.env.PROD', 'true')
    .replace('import.meta.env.BASE_URL', "'/taipei-civic-groups-map/'");
  const removed: string[] = [], deleted: string[] = [];
  const scopes = ['https://example.test/portfolio/', 'https://example.test/taipei-civic-groups-map/', 'https://example.test/'];
  await vm.runInNewContext(cleanup, {
    navigator: { serviceWorker: { getRegistrations: async () => scopes.map(scope => ({ scope, unregister: async () => { removed.push(scope); } })) } },
    location: { origin: 'https://example.test' }, URL,
    caches: { keys: async () => ['portfolio-v1', 'taipei-civic-groups-v1'], delete: async (key: string) => { deleted.push(key); } },
  });
  assert.deepEqual(removed, ['https://example.test/taipei-civic-groups-map/']);
  assert.deepEqual(deleted, ['taipei-civic-groups-v1']);
});
