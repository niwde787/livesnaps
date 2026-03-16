// Incrementing the cache version forces the service worker to update and re-cache all assets.
const CACHE_NAME = 'cjf-snaps-cache-v10';
const BASE_URL = self.registration.scope;

const URLS_TO_PRECACHE = [
  BASE_URL,
  `${BASE_URL}index.html`,
  `${BASE_URL}metadata.json`,
  `${BASE_URL}manifest.json`,
  `${BASE_URL}assets/icons.svg`
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching pre-cache content');
        return cache.addAll(URLS_TO_PRECACHE);
      })
  );
  self.skipWaiting(); // Force the new service worker to activate immediately.
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If the cache name is different from the current one, it's an old cache. Delete it.
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // We only want to handle GET requests and http/https schemes.
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Stale-while-revalidate strategy:
  // Respond with the cached version immediately if available (stale),
  // then fetch a fresh version from the network in the background to update the cache for the next visit (revalidate).
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // If the network response is valid, update the cache.
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(error => {
            console.error('Service Worker fetch failed:', error);
            // If fetch fails (e.g., offline) and we have a cached response,
            // we've already returned it. If not, the error will propagate.
            throw error;
        });

        // Return the cached response immediately if available, otherwise wait for the network.
        return cachedResponse || fetchPromise;
      });
    })
  );
});

// Listen for a message from the client to skip waiting and activate the new SW.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
