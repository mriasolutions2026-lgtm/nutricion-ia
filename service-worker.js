// ============================================================
// NutricionLu Service Worker v3
// Cache-first for local, Network-first for external resources
// Supports: Background Sync, Push Notifications (stub)
// ============================================================

const CACHE_NAME = 'nutricionlu-v1.15';
const STATIC_CACHE_NAME = 'nutricionlu-static-v1.15';
const DYNAMIC_CACHE_NAME = 'nutricionlu-dynamic-v1.15';

// Core app assets — cached on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app-core.js',
  '/app-features.js',
  '/app-new-features.js',
  '/knowledge.js',
  '/manifest.json',
  '/granada.png',
  '/cerebro-ia.png'
];

// External origins that should always use network-first
const NETWORK_FIRST_ORIGINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com',
  'generativelanguage.googleapis.com',
  'googleapis.com'
];

// ─── INSTALL ────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing NutricionLu v3...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        // Don't fail install if optional assets are missing
        console.warn('[SW] Some assets could not be cached:', err);
      });
    }).then(() => {
      console.log('[SW] Install complete — skipping waiting');
      return self.skipWaiting();
    })
  );
});

// ─── ACTIVATE ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating NutricionLu v3...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Delete any old NutricionLu caches that aren't current
            return name.startsWith('nutricionlu-') &&
              name !== STATIC_CACHE_NAME &&
              name !== DYNAMIC_CACHE_NAME;
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Activation complete — claiming clients');
      return self.clients.claim();
    })
  );
});

// ─── FETCH ──────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip local backend API endpoints (never cache backend API requests!)
  if (url.pathname.startsWith('/api/')) return;

  // Skip browser-extension and non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Determine strategy by origin
  const isExternal = NETWORK_FIRST_ORIGINS.some((origin) =>
    url.hostname.includes(origin)
  );

  if (isExternal) {
    // NETWORK-FIRST for external CDN / API / fonts
    event.respondWith(networkFirst(event.request));
  } else {
    // CACHE-FIRST for local app assets
    event.respondWith(cacheFirst(event.request));
  }
});

// ─── STRATEGY: Cache First ───────────────────────────────────
async function cacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // Not in cache — fetch from network and store
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Cache-first failed:', request.url, error);
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      const cached = await caches.match('/index.html');
      if (cached) return cached;
    }
    return new Response('Offline — NutricionLu no disponible sin conexión', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

// ─── STRATEGY: Network First ─────────────────────────────────
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Network failed — try cache fallback
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] Network-first serving from cache:', request.url);
      return cached;
    }
    // Final fallback
    return new Response('', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// ─── BACKGROUND SYNC ─────────────────────────────────────────
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'sync-meals') {
    event.waitUntil(syncPendingMeals());
  }

  if (event.tag === 'sync-activity') {
    event.waitUntil(syncPendingActivity());
  }
});

async function syncPendingMeals() {
  try {
    // Retrieve queued meals from IndexedDB / localStorage via message
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({ type: 'SYNC_MEALS_REQUESTED' });
    });
    console.log('[SW] Meals sync requested from clients');
  } catch (err) {
    console.error('[SW] Meals sync failed:', err);
  }
}

async function syncPendingActivity() {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({ type: 'SYNC_ACTIVITY_REQUESTED' });
    });
    console.log('[SW] Activity sync requested from clients');
  } catch (err) {
    console.error('[SW] Activity sync failed:', err);
  }
}

// ─── PUSH NOTIFICATIONS (stub for future native integration) ──
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let data = {
    title: 'NutricionLu',
    body: 'Recordatorio nutricional',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    tag: 'nutricionlu-reminder',
    data: { url: '/' }
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Abrir app' },
      { action: 'dismiss', title: 'Ignorar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ─── NOTIFICATION CLICK ───────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ─── MESSAGE CHANNEL ──────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((names) =>
        Promise.all(names.map((name) => caches.delete(name)))
      ).then(() => {
        event.ports[0].postMessage({ cleared: true });
      })
    );
  }
});

console.log('[SW] NutricionLu Service Worker loaded:', CACHE_NAME);
