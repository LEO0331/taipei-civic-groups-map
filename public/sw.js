const CACHE = 'taipei-civic-groups-v3';
const BASE = '/taipei-civic-groups-map/';
const DATA = [
  `${BASE}data/civic-groups.json`,
  `${BASE}data/civic-group-summary.json`,
  `${BASE}data/industry-grant-recipients.json`,
  `${BASE}data/industry-grant-summary.json`,
  `${BASE}data/conversion-report.json`,
];

async function cacheAppShell() {
  const cache = await caches.open(CACHE);
  const response = await fetch(BASE);
  await cache.put(BASE, response.clone());
  const html = await response.text();
  const shell = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((url) => url.startsWith(BASE));
  await cache.addAll([...new Set([...shell, ...DATA])]);
}

self.addEventListener('install', (event) => {
  event.waitUntil(Promise.all([cacheAppShell(), self.skipWaiting()]));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
    self.clients.claim(),
  ]));
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(async (response) => {
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(event.request, response.clone());
    }
    return response;
  }).catch(async () => (await caches.match(event.request)) ?? Response.error()));
});
