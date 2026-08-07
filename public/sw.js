const CACHE_NAME = 'nexa-icons-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.png',
  '/great-minds-logo.svg',
  '/images/nexa_app_logo.jpg',
  '/images/app_ai_icon.jpg',
  '/images/greatminds_ai_icon.jpg',
  '/images/greatminds_chat_bg.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static app assets & icons');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Cache-first strategy for images and icons
  if (request.destination === 'image' || request.url.includes('/images/') || request.url.endsWith('.png') || request.url.endsWith('.svg') || request.url.endsWith('.jpg')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        }).catch(() => cachedResponse);
      })
    );
  }
});
