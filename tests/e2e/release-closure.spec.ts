import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

test('real legacy worker preserves other applications caches and registrations', async ({ page }) => {
  const worker = await readFile('public/sw.js', 'utf8');
  const server = createServer((request, response) => {
    if (request.url?.endsWith('sw.js')) {
      response.setHeader('Content-Type', 'application/javascript');
      response.end(request.url.startsWith('/foreign/') ? "self.addEventListener('install', e => e.waitUntil(self.skipWaiting()));" : worker);
    } else { response.setHeader('Content-Type', 'text/html'); response.end('<!doctype html><title>Worker ownership regression</title>'); }
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing worker test port');
  try {
    await page.goto(`http://127.0.0.1:${address.port}/taipei-civic-groups-map/`);
    await page.evaluate(async () => {
      await caches.open('portfolio-v1'); await caches.open('taipei-crash-map-v1'); await caches.open('taipei-civic-groups-obsolete');
      await navigator.serviceWorker.register('/foreign/sw.js', { scope: '/foreign/' });
      await navigator.serviceWorker.register('/taipei-civic-groups-map/sw.js', { scope: '/taipei-civic-groups-map/' });
    });
    await expect.poll(() => page.evaluate(async () => ({
      caches: (await caches.keys()).sort(), scopes: (await navigator.serviceWorker.getRegistrations()).map(registration => new URL(registration.scope).pathname),
    }))).toEqual({ caches: ['portfolio-v1', 'taipei-civic-groups-v108', 'taipei-crash-map-v1'], scopes: ['/foreign/'] });
  } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
});

test('restored official directories have readable records and deployed notices are discoverable', async ({ page }) => {
  for (const [dataset, name, count] of [['hearingCenters', '建聲台北聽力所', 4], ['seniorServices', '聖若瑟', 355]] as const) {
    await page.goto(`/?dataset=${dataset}&lang=zh`);
    await expect(page.locator('main .notice.error')).toHaveCount(0);
    await expect(page.locator('main .notes-grid article')).toHaveCount(count);
    await expect(page.locator('main')).toContainText(name);
    const query = page.locator('main input').last();
    await query.fill(name);
    await expect(page.locator('main .notes-grid article').first()).toContainText(name);
  }
  const notice = page.getByRole('link', { name: '軟體授權與出處' });
  await expect(notice).toHaveAttribute('href', /THIRD_PARTY_NOTICES\.txt$/);
  const response = await page.request.get((await notice.getAttribute('href'))!);
  expect(response.ok()).toBe(true);
  const text = await response.text();
  expect(text).toContain('Hippocratic License Version Number: 2.1.');
  expect(text).toContain('Copyright (c) 2026 LeoChen');
});
