import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import App from './App';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  let refreshedForNewWorker = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshedForNewWorker) {
      refreshedForNewWorker = true;
      window.location.reload();
    }
  });
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
    // The application remains usable without offline caching.
  });
}
