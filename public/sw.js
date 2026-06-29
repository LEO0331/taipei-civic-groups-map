const CACHE = 'taipei-civic-groups-v10';
const BASE = '/taipei-civic-groups-map/';
const DATA = [
  `${BASE}data/civic-groups.json`,
  `${BASE}data/civic-group-summary.json`,
  `${BASE}data/registered-labor-unions.json`,
  `${BASE}data/registered-labor-union-summary.json`,
  `${BASE}data/quasi-public-infant-care-centers.json`,
  `${BASE}data/quasi-public-infant-care-center-summary.json`,
  `${BASE}data/industry-grant-recipients.json`,
  `${BASE}data/industry-grant-summary.json`,
  `${BASE}data/metro-procurement-schedules.json`,
  `${BASE}data/metro-procurement-summary.json`,
  `${BASE}data/registered-cram-schools.json`,
  `${BASE}data/registered-cram-school-summary.json`,
  `${BASE}data/registered-hotels.json`,
  `${BASE}data/registered-hotel-summary.json`,
  `${BASE}data/labor-standard-act-violation-summary.json`,
  `${BASE}data/labor-standard-act-violation-records/manifest.json`,
  `${BASE}data/nangang-software-park-companies.json`,
  `${BASE}data/nangang-software-park-company-summary.json`,
  `${BASE}data/registered-animal-hospitals.json`,
  `${BASE}data/registered-animal-hospital-summary.json`,
  `${BASE}data/public-records-summary.json`,
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
