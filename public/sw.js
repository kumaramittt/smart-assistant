// Smart Assistant PWA Service Worker
const CACHE_NAME = 'smart-assistant-v1';

// Static app shell assets to precache for fast startup
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/favicon.svg',
];

// Install Event: Precache app shell and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Precache critical shell files; catch individually to avoid failing install if an asset isn't yet built
      return Promise.allSettled(
        APP_SHELL_ASSETS.map((asset) => cache.add(asset))
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clear older cache versions and claim all clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Cache app shell, DO NOT cache /api/chat or any /api/* endpoints
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. NEVER cache /api/chat or any API route (and ignore non-GET methods)
  if (url.pathname.startsWith('/api/') || request.method !== 'GET') {
    return; // Pass through to standard browser network fetch
  }

  // 2. Navigation requests (HTML pages) -> Network first, fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If valid response, update the cache
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          // Offline fallback
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const fallbackShell = await caches.match('/index.html') || await caches.match('/');
          return fallbackShell || new Response('Offline - Smart Assistant', {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // 3. Static assets (JS, CSS, fonts, images) -> Cache-first with stale-while-revalidate update
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Silent catch for background revalidation errors while offline
          return null;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
