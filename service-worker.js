const CACHE_NAME = 'startpage-cache-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/service-worker.js',
  '/favicon.ico',
  '/images/favicon-7.png',
  '/images/favicon-8.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'UPDATE_CACHE') {
    event.waitUntil(updateCache());
  }
});

async function updateCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urlsToCache);
    
    // Notify all clients that cache has been updated
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'CACHE_UPDATED' });
    });
  } catch (error) {
    console.error('Cache update failed:', error);
  }
}

self.addEventListener('fetch', (event) => {
  // Allow DuckDuckGo autocomplete requests
  if (event.request.url.startsWith('https://duckduckgo.com/ac/')) {
    return;
  }

  // Cache-first strategy for all local resources
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached version immediately if available
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Only fetch if it's a local resource
      if (event.request.url.startsWith(self.location.origin)) {
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        }).catch(() => {
          // Return a basic offline response for local resources
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      }
      
      // Let other requests (external sites) pass through normally
      return fetch(event.request);
    })
  );
});
