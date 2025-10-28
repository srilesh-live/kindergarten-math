/**
 * Service Worker for Kindergarten Math Adventure
 * Enables offline functionality and caching
 */

const CACHE_NAME = 'kindergarten-math-v1';
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/config.js',
    '/js/ai-phrases.js',
    '/js/supabase-manager.js',
    '/js/game-engine.js',
    'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800&display=swap'
];

// Install event - cache static resources
self.addEventListener('install', event => {
    console.log('📦 Service Worker: Installing');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Service Worker: Caching static files');
                return cache.addAll(STATIC_CACHE_URLS.map(url => new Request(url, { credentials: 'same-origin' })));
            })
            .catch(error => {
                console.error('📦 Service Worker: Failed to cache files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('🔄 Service Worker: Activating');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    // Skip non-GET requests and extension requests
    if (event.request.method !== 'GET' || event.request.url.includes('extension')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    return response;
                }
                
                // Otherwise fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache if not successful
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        // Cache successful responses
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // If network fails and we don't have a cache, return offline page
                        return new Response(
                            '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You\'re offline</h1><p>The math adventure will work when you\'re back online!</p></body></html>',
                            { headers: { 'Content-Type': 'text/html' } }
                        );
                    });
            })
    );
});

// Background sync for offline data
self.addEventListener('sync', event => {
    console.log('🔄 Service Worker: Background sync triggered');
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Here you could sync offline data when connection is restored
            syncOfflineData()
        );
    }
});

async function syncOfflineData() {
    try {
        console.log('📡 Service Worker: Syncing offline data');
        // This would typically send stored offline data to the server
        // For now, just log that sync would happen
        return Promise.resolve();
    } catch (error) {
        console.error('📡 Service Worker: Sync failed:', error);
        throw error;
    }
}

// Handle messages from the main application
self.addEventListener('message', event => {
    console.log('💬 Service Worker: Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});