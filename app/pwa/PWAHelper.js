/**
 * PWA Helper - Service Worker Registration and Management
 */

export class PWAHelper {
    constructor() {
        this.swRegistration = null;
        this.isOnline = navigator.onLine;
        this.updateAvailable = false;
    }

    /**
     * Initialize PWA features
     */
    async init() {
        if ('serviceWorker' in navigator) {
            try {
                // Register service worker
                this.swRegistration = await navigator.serviceWorker.register('/service-worker.js', {
                    scope: '/'
                });

                console.log('✅ Service Worker registered:', this.swRegistration.scope);

                // Check for updates
                this.swRegistration.addEventListener('updatefound', () => {
                    this.handleUpdateFound();
                });

                // Handle controller change
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    console.log('🔄 Service Worker controller changed');
                    if (this.updateAvailable) {
                        this.showUpdateNotification();
                    }
                });

            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        } else {
            console.warn('⚠️ Service Workers not supported');
        }

        // Setup online/offline detection
        this.setupNetworkDetection();

        // Setup install prompt
        this.setupInstallPrompt();

        // Setup background sync
        this.setupBackgroundSync();
    }

    /**
     * Handle service worker update
     */
    handleUpdateFound() {
        const newWorker = this.swRegistration.installing;
        
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.updateAvailable = true;
                console.log('🎉 New version available!');
                this.showUpdateNotification();
            }
        });
    }

    /**
     * Show update notification
     */
    showUpdateNotification() {
        const message = document.createElement('div');
        message.className = 'pwa-update-banner';
        message.innerHTML = `
            <div class="pwa-update-content">
                <span>🎉 A new version is available!</span>
                <button class="km-button km-button--primary km-button--small" id="pwa-update-btn">
                    Update Now
                </button>
                <button class="km-button km-button--text km-button--small" id="pwa-dismiss-btn">
                    Later
                </button>
            </div>
        `;
        
        document.body.appendChild(message);

        // Update button
        document.getElementById('pwa-update-btn').addEventListener('click', () => {
            this.applyUpdate();
        });

        // Dismiss button
        document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
            message.remove();
        });

        // Show banner
        setTimeout(() => message.classList.add('show'), 100);
    }

    /**
     * Apply service worker update
     */
    applyUpdate() {
        if (this.swRegistration && this.swRegistration.waiting) {
            this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }

    /**
     * Setup network detection
     */
    setupNetworkDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.hideOfflineBanner();
            this.triggerBackgroundSync();
            console.log('📶 Back online');
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('app:online'));
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineBanner();
            console.log('📵 Gone offline');
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('app:offline'));
        });

        // Initial state
        if (!this.isOnline) {
            this.showOfflineBanner();
        }
    }

    /**
     * Show offline banner
     */
    showOfflineBanner() {
        const banner = document.getElementById('offline-banner');
        if (banner) {
            banner.classList.add('show');
        }
    }

    /**
     * Hide offline banner
     */
    hideOfflineBanner() {
        const banner = document.getElementById('offline-banner');
        if (banner) {
            banner.classList.remove('show');
        }
    }

    /**
     * Setup install prompt
     */
    setupInstallPrompt() {
        let deferredPrompt = null;

        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent default install prompt
            e.preventDefault();
            deferredPrompt = e;
            
            console.log('📲 Install prompt available');
            
            // Show custom install button
            this.showInstallButton(deferredPrompt);
        });

        window.addEventListener('appinstalled', () => {
            console.log('✅ App installed successfully');
            deferredPrompt = null;
            
            // Track installation
            if (typeof gtag !== 'undefined') {
                gtag('event', 'app_installed', {
                    event_category: 'pwa'
                });
            }
        });
    }

    /**
     * Show install button
     */
    showInstallButton(deferredPrompt) {
        // Create install banner
        const installBanner = document.createElement('div');
        installBanner.className = 'pwa-install-banner';
        installBanner.innerHTML = `
            <div class="pwa-install-content">
                <div class="pwa-install-icon">📱</div>
                <div class="pwa-install-text">
                    <div class="pwa-install-title">Install Math Adventure</div>
                    <div class="pwa-install-subtitle">Get the app experience with offline support!</div>
                </div>
                <div class="pwa-install-actions">
                    <button class="km-button km-button--primary km-button--small" id="pwa-install-btn">
                        Install
                    </button>
                    <button class="km-button km-button--text km-button--small" id="pwa-install-dismiss">
                        ✕
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(installBanner);

        // Install button
        document.getElementById('pwa-install-btn').addEventListener('click', async () => {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            console.log(`Install prompt outcome: ${outcome}`);
            
            if (outcome === 'accepted') {
                installBanner.remove();
            }
        });

        // Dismiss button
        document.getElementById('pwa-install-dismiss').addEventListener('click', () => {
            installBanner.remove();
            
            // Don't show again for 7 days
            localStorage.setItem('pwa-install-dismissed', Date.now());
        });

        // Check if previously dismissed
        const dismissedTime = localStorage.getItem('pwa-install-dismissed');
        if (dismissedTime) {
            const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < 7) {
                return; // Don't show banner
            }
        }

        // Show banner after delay
        setTimeout(() => installBanner.classList.add('show'), 3000);
    }

    /**
     * Setup background sync
     */
    setupBackgroundSync() {
        if ('sync' in this.swRegistration) {
            console.log('✅ Background sync available');
        } else {
            console.warn('⚠️ Background sync not supported');
        }
    }

    /**
     * Trigger background sync
     */
    async triggerBackgroundSync() {
        if ('sync' in this.swRegistration) {
            try {
                await this.swRegistration.sync.register('sync-progress');
                console.log('🔄 Background sync registered');
            } catch (error) {
                console.error('❌ Background sync failed:', error);
            }
        }
    }

    /**
     * Request notification permission
     */
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                console.log('✅ Notification permission granted');
                return true;
            } else {
                console.log('❌ Notification permission denied');
                return false;
            }
        }
        
        return false;
    }

    /**
     * Show local notification
     */
    async showNotification(title, options = {}) {
        if (Notification.permission === 'granted' && this.swRegistration) {
            await this.swRegistration.showNotification(title, {
                icon: '/icons/icon-192x192.png',
                badge: '/icons/badge-72x72.png',
                vibrate: [100, 50, 100],
                ...options
            });
        }
    }

    /**
     * Cache additional resources
     */
    async cacheResources(urls) {
        if (this.swRegistration && this.swRegistration.active) {
            this.swRegistration.active.postMessage({
                type: 'CACHE_URLS',
                urls: urls
            });
        }
    }

    /**
     * Clear all caches
     */
    async clearCache() {
        if (this.swRegistration && this.swRegistration.active) {
            this.swRegistration.active.postMessage({
                type: 'CLEAR_CACHE'
            });
            
            console.log('🗑️ Cache cleared');
        }
    }

    /**
     * Get service worker version
     */
    async getVersion() {
        return new Promise((resolve) => {
            if (this.swRegistration && this.swRegistration.active) {
                const messageChannel = new MessageChannel();
                
                messageChannel.port1.onmessage = (event) => {
                    resolve(event.data.version);
                };
                
                this.swRegistration.active.postMessage(
                    { type: 'GET_VERSION' },
                    [messageChannel.port2]
                );
            } else {
                resolve('unknown');
            }
        });
    }

    /**
     * Check if running as PWA
     */
    isInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }
}

export default PWAHelper;
