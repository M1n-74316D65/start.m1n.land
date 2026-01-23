const CACHE_NAME = 'startpage-cache-v4';
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
    // Fetch all URLs to ensure we have the latest versions
    await Promise.all(urlsToCache.map(url => 
      fetch(url, { cache: 'reload' }).then(response => {
        if (response.ok) {
          return cache.put(url, response);
        }
      })
    ));
    
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
  // Allow DuckDuckGo autocomplete requests to pass through
  if (event.request.url.startsWith('https://duckduckgo.com/ac/')) {
    return;
  }

  // Handle Navigation Requests (HTML) - Network First, then Cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If we got a valid response, cache it and return it
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails (offline), return cached version
          return caches.match(event.request).then((response) => {
             return response || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Handle other local resources (CSS, JS, Images) - Cache First, then Network
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Return cached version immediately if available
        if (cachedResponse) {
          // Optional: Background update for next time (Stale-While-Revalidate)
          // fetch(event.request).then(response => {
          //   caches.open(CACHE_NAME).then(cache => cache.put(event.request, response));
          // });
          return cachedResponse;
        }

        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
    );
    return;
  }

  // Default behavior for everything else
  event.respondWith(fetch(event.request));
});
