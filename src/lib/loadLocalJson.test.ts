import assert from 'node:assert/strict';
import test from 'node:test';
import { LocalDataLoadError, loadLocalJson } from './loadLocalJson';

test('loads a successful local JSON response', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ value: 1 }), { status: 200 });
  try {
    assert.deepEqual(await loadLocalJson<{ value: number }>('data/example.json'), { value: 1 });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('rejects HTTP and malformed JSON responses with a local-data error', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response('', { status: 503 });
    await assert.rejects(() => loadLocalJson('data/example.json'), LocalDataLoadError);

    globalThis.fetch = async () => new Response('<!doctype html>', { status: 200 });
    await assert.rejects(() => loadLocalJson('data/example.json'), LocalDataLoadError);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
