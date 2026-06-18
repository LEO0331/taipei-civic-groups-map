const CACHE = 'taipei-civic-groups-v1';
const BASE = '/taipei-civic-groups-map/';
const ASSETS = [BASE, `${BASE}data/civic-groups.json`, `${BASE}data/civic-group-summary.json`];
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS))));
self.addEventListener('fetch', (event) => event.respondWith(
  caches.match(event.request).then((cached) => cached || fetch(event.request))
));
