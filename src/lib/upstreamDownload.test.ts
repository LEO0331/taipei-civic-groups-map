import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchUpstream } from '../../scripts/fetchUpstream.ts';

const officialUrl = 'https://data.taipei/download.csv';

test('follows same-origin HTTPS redirects with one request deadline', async (t) => {
  const responses = [
    new Response(null, { status: 302, headers: { location: '/current.csv' } }),
    new Response('name\nTaipei\n'),
  ];
  const visited: string[] = [];
  const signals: (AbortSignal | null | undefined)[] = [];
  t.mock.method(globalThis, 'fetch', async (url: URL, init: RequestInit) => {
    visited.push(url.href);
    signals.push(init.signal);
    assert.equal(init.redirect, 'manual');
    return responses.shift()!;
  });

  assert.equal(await (await fetchUpstream(officialUrl)).text(), 'name\nTaipei\n');
  assert.deepEqual(visited, [officialUrl, 'https://data.taipei/current.csv']);
  assert.ok(signals[0]);
  assert.equal(signals[0], signals[1]);
});

test('validates initial and redirect destinations before contacting them', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response(null, {
    status: 302,
    headers: { location: 'https://example.org/current.csv' },
  }));

  await assert.rejects(fetchUpstream('https://example.org/data.csv'), /approved origin/);
  await assert.rejects(fetchUpstream('http://data.taipei/data.csv'), /HTTPS/);
  assert.equal(fetchMock.mock.callCount(), 0);

  await assert.rejects(fetchUpstream(officialUrl), /approved origin/);
  assert.equal(fetchMock.mock.callCount(), 1);
});

test('limits repeated redirects and accepts a maintainer-supplied HTTPS origin', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response(null, {
    status: 301,
    headers: { location: '/current.csv' },
  }));

  await assert.rejects(fetchUpstream('https://example.org/data.csv', { manualUrl: true }), /redirect limit/);
  assert.equal(fetchMock.mock.callCount(), 6);
});

test('enforces the body limit with or without a content length', async (t) => {
  let cancelled = 0;
  const tooLarge = (headers?: HeadersInit) => new Response(new ReadableStream({
    pull(controller) { controller.enqueue(Uint8Array.of(1, 2, 3)); },
    cancel() { cancelled++; },
  }), { headers });
  const responses = [tooLarge({ 'content-length': '6' }), tooLarge()];
  t.mock.method(globalThis, 'fetch', async () => responses.shift()!);

  await assert.rejects(fetchUpstream(officialUrl, { maxBytes: 4 }), /exceeds 4 bytes/);
  await assert.rejects(fetchUpstream(officialUrl, { maxBytes: 4 }), /exceeds 4 bytes/);
  assert.equal(cancelled, 2);
});

test('enforces the same deadline when response headers arrive before a stalled body', async (t) => {
  t.mock.method(globalThis, 'fetch', async (_url: URL, init: RequestInit) => new Response(new ReadableStream({
    start(controller) {
      const signal = init.signal!;
      signal.addEventListener('abort', () => controller.error(signal.reason), { once: true });
    },
  })));

  // AbortSignal.timeout does not keep Node alive on its own.
  const holdEventLoop = setTimeout(() => {}, 1000);
  try {
    await assert.rejects(fetchUpstream(officialUrl, { timeoutMs: 10 }), { name: 'TimeoutError' });
  } finally {
    clearTimeout(holdEventLoop);
  }
});

test('returns HTTP error status for existing fallback handling and cancels the body', async (t) => {
  let cancelled = false;
  t.mock.method(globalThis, 'fetch', async () => new Response(new ReadableStream({
    cancel() { cancelled = true; },
  }), { status: 503, statusText: 'Service Unavailable' }));

  const response = await fetchUpstream(officialUrl);
  assert.equal(response.ok, false);
  assert.equal(response.status, 503);
  assert.equal(response.statusText, 'Service Unavailable');
  assert.equal(cancelled, true);
});
