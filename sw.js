const CACHE_NAME = 'quote-svg-v1';
const ASSETS = [
  './',
  './index.html',
  './work.html',
  './manifest-index.json',
  './manifest-work.json',
  './icon-index.svg',
  './icon-work.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 網路優先：有網路時抓最新版，沒網路時才用快取
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});