const CACHE_VERSION = 'v6';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/favicon.ico',
  '/images/favicon-7.png',
  '/images/favicon-8.png',
];

const FONT_CACHE = 'fonts-v1';
const FONT_URLS = [
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap',
];

const STATIC_ASSETS_URLS = [...STATIC_ASSETS, ...FONT_URLS];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (name) =>
                name.startsWith('static-') ||
                name.startsWith('dynamic-') ||
                name.startsWith('fonts-')
            )
            .filter(
              (name) =>
                name !== STATIC_CACHE &&
                name !== DYNAMIC_CACHE &&
                name !== FONT_CACHE
            )
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data?.type === 'UPDATE_CACHE') {
    event.waitUntil(updateDynamicCache());
  }
});

async function updateDynamicCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();

    await Promise.all(
      requests.map(async (request) => {
        try {
          const response = await fetch(request, { cache: 'reload' });
          if (response.ok) {
            await cache.put(request, response);
          }
        } catch {}
      })
    );

    const clients = await self.clients.matchAll();
    clients.forEach((client) => client.postMessage({ type: 'CACHE_UPDATED' }));
  } catch (error) {
    console.error('Dynamic cache update failed:', error);
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.hostname === 'duckduckgo.com') {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(JSON.stringify([]), {
            headers: { 'Content-Type': 'application/json' },
          })
      )
    );
    return;
  }

  if (request.method !== 'GET') {
    return;
  }

  if (url.origin === self.location.origin && request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  if (
    request.url.includes('fonts.googleapis.com') ||
    request.url.includes('fonts.gstatic.com')
  ) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }
});

async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network response not OK');
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) return offlinePage;

    return caches.match('/index.html');
  }
}

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
    return cached || new Response('', { status: 503 });
  }
}
