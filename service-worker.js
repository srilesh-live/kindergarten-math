/**
 * Service Worker for Kindergarten Math Adventure
 * Provides offline functionality, caching, and background sync
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `kindergarten-math-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/app/main.js',
    '/app/config/masterConfig.js',
    '/app/ai/phraseEngine.js',
    '/app/user/UserManager.js',
    '/app/games/BasicArithmeticEngine.js',
    '/app/games/NumberSequencesEngine.js',
    '/app/games/TimeClockEngine.js',
    '/app/games/MoneyMathEngine.js',
    '/app/ui/components.js',
    '/app/ui/theme.css',
    '/app/ui/gameRenderers.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Runtime cache configurations
const RUNTIME_CACHE_NAME = `${CACHE_NAME}-runtime`;
const IMAGE_CACHE_NAME = `${CACHE_NAME}-images`;
const DATA_CACHE_NAME = `${CACHE_NAME}-data`;

// Cache expiration times (in seconds)
const CACHE_EXPIRATION = {
    images: 30 * 24 * 60 * 60, // 30 days
    data: 24 * 60 * 60,        // 1 day
    runtime: 7 * 24 * 60 * 60  // 7 days
};

/**
 * Install Event - Cache essential assets
 */
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...', CACHE_VERSION);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Precaching app shell');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Installed successfully');
                return self.skipWaiting(); // Activate immediately
            })
            .catch((error) => {
                console.error('[Service Worker] Install failed:', error);
            })
    );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...', CACHE_VERSION);
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName.startsWith('kindergarten-math-') && 
                            cacheName !== CACHE_NAME &&
                            cacheName !== RUNTIME_CACHE_NAME &&
                            cacheName !== IMAGE_CACHE_NAME &&
                            cacheName !== DATA_CACHE_NAME) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activated successfully');
                return self.clients.claim(); // Take control immediately
            })
    );
});

/**
 * Fetch Event - Serve from cache with network fallback
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome extensions and other protocols
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Handle different resource types
    if (request.destination === 'image') {
        event.respondWith(handleImageRequest(request));
    } else if (url.pathname.startsWith('/api/') || url.pathname.includes('supabase')) {
        event.respondWith(handleDataRequest(request));
    } else {
        event.respondWith(handleAssetRequest(request));
    }
});

/**
 * Handle asset requests (HTML, CSS, JS)
 * Strategy: Cache-first, falling back to network
 */
async function handleAssetRequest(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('[Service Worker] Serving from cache:', request.url);
            
            // Update cache in background
            updateCacheInBackground(request);
            
            return cachedResponse;
        }

        // If not in cache, fetch from network
        console.log('[Service Worker] Fetching from network:', request.url);
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;

    } catch (error) {
        console.error('[Service Worker] Fetch failed:', error);
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/index.html');
        }
        
        // Return a basic error response
        return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain'
            })
        });
    }
}

/**
 * Handle image requests
 * Strategy: Cache-first with long expiration
 */
async function handleImageRequest(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(IMAGE_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;

    } catch (error) {
        console.error('[Service Worker] Image fetch failed:', error);
        
        // Return placeholder image
        return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#1e1e30" width="200" height="200"/><text fill="#9aa0a6" x="50%" y="50%" text-anchor="middle" dy=".3em">Image Offline</text></svg>',
            {
                headers: { 'Content-Type': 'image/svg+xml' }
            }
        );
    }
}

/**
 * Handle API/data requests
 * Strategy: Network-first, falling back to cache
 */
async function handleDataRequest(request) {
    try {
        // Try network first for fresh data
        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(DATA_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;

    } catch (error) {
        console.log('[Service Worker] Network failed, trying cache:', request.url);
        
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return error response
        return new Response(JSON.stringify({
            error: 'Offline',
            message: 'Unable to fetch data while offline'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Update cache in background (stale-while-revalidate)
 */
async function updateCacheInBackground(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE_NAME);
            cache.put(request, networkResponse);
        }
    } catch (error) {
        // Silent fail - we already served cached content
    }
}

/**
 * Background Sync - Sync offline data when connection returns
 */
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);
    
    if (event.tag === 'sync-progress') {
        event.waitUntil(syncProgressData());
    }
});

/**
 * Sync progress data with server
 */
async function syncProgressData() {
    try {
        // Get pending sync data from IndexedDB
        const db = await openDatabase();
        const syncQueue = await getSyncQueue(db);

        if (syncQueue.length === 0) {
            console.log('[Service Worker] No data to sync');
            return;
        }

        console.log(`[Service Worker] Syncing ${syncQueue.length} items`);

        // Process each item
        for (const item of syncQueue) {
            try {
                const response = await fetch(item.url, {
                    method: item.method,
                    headers: item.headers,
                    body: JSON.stringify(item.data)
                });

                if (response.ok) {
                    // Remove from sync queue
                    await removeSyncItem(db, item.id);
                    console.log('[Service Worker] Synced item:', item.id);
                }
            } catch (error) {
                console.error('[Service Worker] Failed to sync item:', item.id, error);
            }
        }

    } catch (error) {
        console.error('[Service Worker] Sync failed:', error);
        throw error; // Retry sync later
    }
}

/**
 * Push Notifications (for future use)
 */
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New update available!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Open App',
                icon: '/icons/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icons/close.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Kindergarten Math Adventure', options)
    );
});

/**
 * Notification Click Handler
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked:', event.action);
    
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

/**
 * Message Handler - Communication with main app
 */
self.addEventListener('message', (event) => {
    console.log('[Service Worker] Message received:', event.data);

    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(RUNTIME_CACHE_NAME)
                .then((cache) => cache.addAll(event.data.urls))
        );
    }

    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }

    if (event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    }
});

/**
 * IndexedDB Helper Functions
 */
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('KindergartenMathDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('syncQueue')) {
                db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

function getSyncQueue(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['syncQueue'], 'readonly');
        const store = transaction.objectStore('syncQueue');
        const request = store.getAll();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

function removeSyncItem(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['syncQueue'], 'readwrite');
        const store = transaction.objectStore('syncQueue');
        const request = store.delete(id);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

console.log('[Service Worker] Loaded successfully', CACHE_VERSION);
