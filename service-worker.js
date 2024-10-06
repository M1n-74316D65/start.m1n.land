const CACHE_NAME = 'startpage-cache-v1';
const urlsToCache = [
  '/index.html',
  '/favicon.ico',
  '/images/favicon-7.png', // Added image from manifest.json
  '/images/favicon-8.png', // Added image from manifest.json
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
