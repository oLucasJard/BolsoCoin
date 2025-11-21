// Service Worker para BolsoCoin
const CACHE_NAME = 'bolsocoin-v1';
const OFFLINE_URL = '/offline';

// Arquivos para cache inicial
const STATIC_CACHE = [
  '/',
  '/dashboard',
  '/magica',
  '/transacoes',
  '/orcamentos',
  '/offline',
];

// Install
self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_CACHE.map(url => new Request(url, { cache: 'reload' })));
    }).catch((error) => {
      console.error('[SW] Cache failed:', error);
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch((error) => {
        console.error('[SW] Fetch failed:', error);
        
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      });
    })
  );
});

// Push Notifications (para futura implementação)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const title = data.title || 'BolsoCoin';
  const options = {
    body: data.body || 'Nova notificação',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data,
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click');
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/dashboard')
  );
});

