/**
 * Kindergarten Math - Mobile-First Application
 * Main application controller with mobile optimizations
 */

class MobileApp {
    constructor() {
        this.settings = {
            soundEnabled: true,
            difficulty: 'medium',
            autoAdvance: true,
            vibrationEnabled: true
        };
        
        this.isLoading = true;
        this.touchStartY = 0;
        this.touchEndY = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.detectDevice();
        this.initServiceWorker();
        this.hideLoadingScreen();
    }
    
    setupEventListeners() {
        // Loading completion
        window.addEventListener('load', () => {
            setTimeout(() => this.hideLoadingScreen(), 500);
        });
        
        // Settings modal
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }
        
        // Touch and gesture handling
        this.setupTouchHandling();
        
        // Keyboard shortcuts for desktop
        this.setupKeyboardShortcuts();
        
        // Resize handling for responsive design
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Prevent zoom on double-tap for iOS
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Handle visibility changes (app goes background/foreground)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onAppPause();
            } else {
                this.onAppResume();
            }
        });
    }
    
    setupTouchHandling() {
        // Smooth scrolling for iOS
        document.addEventListener('touchstart', (e) => {
            this.touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            this.touchEndY = e.touches[0].clientY;
        });
        
        // Pull-to-refresh prevention
        document.addEventListener('touchmove', (e) => {
            if (this.touchStartY <= 116 && this.touchEndY > this.touchStartY) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Haptic feedback for supported devices
        this.setupHapticFeedback();
    }
    
    setupHapticFeedback() {
        // Add haptic feedback to interactive elements
        const interactiveElements = document.querySelectorAll('.game-card, button');
        
        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', () => {
                this.triggerHaptic('light');
            });
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            
            // Number keys for quick game access
            if (e.key >= '1' && e.key <= '3' && !e.ctrlKey && !e.altKey) {
                const gameIndex = parseInt(e.key) - 1;
                const games = ['arithmetic', 'time-clock', 'sequences'];
                if (games[gameIndex]) {
                    this.navigateToGame(games[gameIndex]);
                }
            }
        });
    }
    
    detectDevice() {
        // Device type detection
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        const isTablet = /ipad|android(?=.*mobile)/i.test(userAgent) && window.innerWidth >= 768;
        const isIOS = /ipad|iphone|ipod/.test(userAgent);
        
        // Add device classes to body
        document.body.classList.add(isMobile ? 'mobile' : 'desktop');
        if (isTablet) document.body.classList.add('tablet');
        if (isIOS) document.body.classList.add('ios');
        
        // Store device info
        this.deviceInfo = {
            isMobile,
            isTablet,
            isIOS,
            hasTouch: 'ontouchstart' in window,
            hasHover: window.matchMedia('(hover: hover)').matches
        };
        
        // Adjust UI based on device
        this.adjustUIForDevice();
    }
    
    adjustUIForDevice() {
        if (this.deviceInfo.isMobile) {
            // Increase touch target sizes on mobile
            document.documentElement.style.setProperty('--touch-target-size', '48px');
            
            // Adjust font sizes for better mobile readability
            if (window.innerWidth < 375) {
                document.documentElement.style.setProperty('--mobile-scale', '0.9');
            }
        }
        
        // Add momentum scrolling for iOS
        if (this.deviceInfo.isIOS) {
            document.documentElement.style.webkitOverflowScrolling = 'touch';
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        if (loadingScreen && app) {
            loadingScreen.style.opacity = '0';
            app.style.opacity = '1';
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                this.isLoading = false;
                this.onAppReady();
            }, 300);
        }
    }
    
    onAppReady() {
        // Trigger animations
        this.animateElements();
        
        // Preload critical game assets
        this.preloadGameAssets();
        
        // Initialize analytics (if needed)
        this.initAnalytics();
    }
    
    animateElements() {
        // Stagger animations for cards
        const cards = document.querySelectorAll('.game-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animationDelay = `${index * 0.1}s`;
                card.classList.add('animate-slide-up');
            }, 200 + index * 100);
        });
    }
    
    preloadGameAssets() {
        // Preload game scripts and assets for faster navigation
        const gameAssets = [
            'assets/js/arithmetic-game.js',
            'assets/js/time-clock-game.js',
            'assets/js/sequences-game.js',
            'assets/js/statistics.js'
        ];
        
        gameAssets.forEach(asset => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = asset;
            document.head.appendChild(link);
        });
    }
    
    // Navigation Methods
    navigateToGame(gameType) {
        this.triggerHaptic('medium');
        this.playSound('click');
        
        // Add loading state to clicked card
        const card = event.currentTarget;
        if (card) {
            card.style.opacity = '0.7';
            card.style.pointerEvents = 'none';
        }
        
        // Navigate with smooth transition
        setTimeout(() => {
            switch (gameType) {
                case 'arithmetic':
                    window.location.href = 'arithmetic.html';
                    break;
                case 'time-clock':
                    window.location.href = 'time-clock.html';
                    break;
                case 'sequences':
                    window.location.href = 'sequences.html';
                    break;
                default:
                    console.warn('Unknown game type:', gameType);
            }
        }, 200);
    }
    
    scrollToGames() {
        const gamesSection = document.getElementById('games-section');
        if (gamesSection) {
            gamesSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    showAbout() {
        this.showToast('Coming soon! Learn more about our educational approach.', 'info');
    }
    
    // Settings Methods
    showSettings() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.remove('opacity-0', 'invisible');
            
            // Focus trap for accessibility
            const firstInput = modal.querySelector('input, button');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }
    
    closeSettings() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.add('opacity-0', 'invisible');
        }
    }
    
    saveSettings() {
        // Collect settings from form
        const soundToggle = document.getElementById('sound-toggle');
        const autoAdvanceToggle = document.getElementById('auto-advance-toggle');
        const difficultyRadio = document.querySelector('input[name="difficulty"]:checked');
        
        this.settings = {
            ...this.settings,
            soundEnabled: soundToggle ? soundToggle.checked : true,
            autoAdvance: autoAdvanceToggle ? autoAdvanceToggle.checked : true,
            difficulty: difficultyRadio ? difficultyRadio.value : 'medium'
        };
        
        // Save to localStorage
        localStorage.setItem('kindergartenMathSettings', JSON.stringify(this.settings));
        
        // Close modal
        this.closeSettings();
        
        // Show confirmation
        this.showToast('Settings saved successfully!', 'success');
        
        this.triggerHaptic('success');
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('kindergartenMathSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Failed to load settings:', e);
        }
        
        // Apply settings to UI
        this.applySettings();
    }
    
    applySettings() {
        const soundToggle = document.getElementById('sound-toggle');
        const autoAdvanceToggle = document.getElementById('auto-advance-toggle');
        const difficultyRadio = document.querySelector(`input[name="difficulty"][value="${this.settings.difficulty}"]`);
        
        if (soundToggle) soundToggle.checked = this.settings.soundEnabled;
        if (autoAdvanceToggle) autoAdvanceToggle.checked = this.settings.autoAdvance;
        if (difficultyRadio) difficultyRadio.checked = true;
    }
    
    closeAllModals() {
        const modals = document.querySelectorAll('[id$="-modal"]');
        modals.forEach(modal => {
            modal.classList.add('opacity-0', 'invisible');
        });
    }
    
    // Utility Methods
    triggerHaptic(type = 'light') {
        if (!this.settings.vibrationEnabled || !this.deviceInfo.hasTouch) return;
        
        try {
            if (navigator.vibrate) {
                switch (type) {
                    case 'light':
                        navigator.vibrate(10);
                        break;
                    case 'medium':
                        navigator.vibrate(20);
                        break;
                    case 'heavy':
                        navigator.vibrate([20, 10, 20]);
                        break;
                    case 'success':
                        navigator.vibrate([10, 5, 10]);
                        break;
                    case 'error':
                        navigator.vibrate([50]);
                        break;
                }
            }
        } catch (e) {
            console.warn('Haptic feedback not supported:', e);
        }
    }
    
    playSound(type = 'click') {
        if (!this.settings.soundEnabled) return;
        
        try {
            // Create audio context for Web Audio API
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            switch (type) {
                case 'click':
                    oscillator.frequency.value = 800;
                    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                    break;
                case 'success':
                    oscillator.frequency.value = 880;
                    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                    break;
                case 'error':
                    oscillator.frequency.value = 300;
                    gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
                    break;
            }
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.5);
        } catch (e) {
            console.warn('Audio not supported:', e);
        }
    }
    
    showToast(message, type = 'info', duration = 3000) {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg max-w-sm mx-4 transition-all duration-300 opacity-0 translate-y-2`;
        
        // Style based on type
        switch (type) {
            case 'success':
                toast.classList.add('bg-green-500', 'text-white');
                break;
            case 'error':
                toast.classList.add('bg-red-500', 'text-white');
                break;
            case 'warning':
                toast.classList.add('bg-yellow-500', 'text-white');
                break;
            default:
                toast.classList.add('bg-gray-800', 'text-white');
        }
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('opacity-0', 'translate-y-2');
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
    
    handleResize() {
        this.adjustUIForDevice();
        
        // Recalculate viewport height for mobile browsers
        if (this.deviceInfo.isMobile) {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }
    }
    
    onAppPause() {
        // Save current state when app goes to background
        if (this.currentGame) {
            this.currentGame.pause();
        }
    }
    
    onAppResume() {
        // Resume game when app comes back to foreground
        if (this.currentGame && this.currentGame.isPaused) {
            this.currentGame.resume();
        }
    }
    
    initServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        }
    }
    
    initAnalytics() {
        // Simple analytics for usage tracking (privacy-friendly)
        const visitData = {
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            screenSize: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            deviceType: this.deviceInfo.isMobile ? 'mobile' : 'desktop'
        };
        
        // Store locally for now (could send to analytics service)
        const visits = JSON.parse(localStorage.getItem('appVisits') || '[]');
        visits.push(visitData);
        
        // Keep only last 10 visits
        if (visits.length > 10) {
            visits.splice(0, visits.length - 10);
        }
        
        localStorage.setItem('appVisits', JSON.stringify(visits));
    }
    
    // Utility helper methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Global functions for HTML onclick handlers
function navigateToGame(gameType) {
    if (window.app) {
        window.app.navigateToGame(gameType);
    }
}

function scrollToGames() {
    if (window.app) {
        window.app.scrollToGames();
    }
}

function showAbout() {
    if (window.app) {
        window.app.showAbout();
    }
}

function closeSettings() {
    if (window.app) {
        window.app.closeSettings();
    }
}

function saveSettings() {
    if (window.app) {
        window.app.saveSettings();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MobileApp();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileApp;
}