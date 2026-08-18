import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import App from './App';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // This site deploys content-hashed bundles frequently. An offline app shell can
  // pair a cached HTML document with a removed bundle and leave a blank page.
  // Remove legacy workers and their caches; GitHub Pages remains network-first.
  navigator.serviceWorker.getRegistrations().then((registrations) =>
    Promise.all(registrations.map((registration) => registration.unregister())),
  ).then(() => caches.keys()).then((keys) =>
    Promise.all(keys.filter((key) => key.startsWith('taipei-civic-groups-')).map((key) => caches.delete(key))),
  ).catch(() => { /* caching is optional */ });
}
