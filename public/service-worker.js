/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// https://developers.google.com/web/tools/workbox/modules/workbox-precaching

// Names of the two caches used in this version of the service worker.
// Change to v2, v3, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  'index.html',
  './', // Alias for index.html
  'static/css/main.*.css',
  'static/js/main.*.js',
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
  // Skip cross-origin requests, like those for Google Analytics.
  // Skip API requests to prevent caching POST/PUT/DELETE methods
  // Also skip any authentication-related requests
  if (event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('/api/') &&
      !event.request.url.includes('/auth/') &&
      event.request.method === 'GET' &&
      // Only cache static resources
      (event.request.url.includes('/static/') || 
       event.request.url.endsWith('.js') || 
       event.request.url.endsWith('.css') || 
       event.request.url.endsWith('.png') || 
       event.request.url.endsWith('.jpg') || 
       event.request.url.endsWith('.ico') || 
       event.request.url.endsWith('.html'))) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the runtime cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
