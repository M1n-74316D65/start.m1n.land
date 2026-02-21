const CACHE_NAME = 'startpage-cache-v5';
const STATIC_CACHE = 'static-v5';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/images/favicon-7.png',
  '/images/favicon-8.png',
];

const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap',
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Message handling
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data?.type === 'UPDATE_CACHE') {
    event.waitUntil(updateCache());
  }
});

// Update cache with fresh content
async function updateCache() {
  try {
    const cache = await caches.open(STATIC_CACHE);

    await Promise.all(
      STATIC_ASSETS.map(async (url) => {
        try {
          const response = await fetch(url, { cache: 'reload' });
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (err) {
          console.warn(`Failed to update cache for ${url}:`, err);
        }
      })
    );

    // Notify clients
    const clients = await self.clients.matchAll();
    clients.forEach((client) =>
      client.postMessage({ type: 'CACHE_UPDATED' })
    );
  } catch (error) {
    console.error('Cache update failed:', error);
  }
}

// Fetch handling
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip DuckDuckGo autocomplete
  if (url.hostname === 'duckduckgo.com') {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Static assets from same origin
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // External assets (fonts, etc.)
  if (EXTERNAL_ASSETS.some((asset) => request.url.includes(asset))) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }
});

// Navigation: Network First with fallback to cache
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse?.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network response not OK');
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Final fallback
    const fallback = await caches.match('/index.html');
    return fallback || Response.error();
  }
}

// Stale-While-Revalidate: Return cached version immediately, update in background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response?.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// Cache First: Return from cache, fetch from network if not cached
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response?.status === 200) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cached || Response.error();
  }
}
