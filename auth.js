/**
 * Supabase Authentication Module
 * Handles user registration, login, logout, and password reset
 */

class AuthManager {
    constructor() {
        // Load configuration from config.js
        if (typeof window.APP_CONFIG === 'undefined') {
            throw new Error('APP_CONFIG not found. Make sure config.js is loaded before auth.js');
        }
        
        this.supabaseUrl = window.APP_CONFIG.supabase.url;
        this.supabaseKey = window.APP_CONFIG.supabase.anonKey;
        this.supabase = null;
        this.currentUser = null;
        
        // Set initial UI state immediately (will be updated by checkAuthState)
        this.updateUIForGuestUser();
        
        this.initializeSupabase();
        this.bindAuthEvents();
        this.checkAuthState();
    }

    /**
     * Initialize Supabase client
     */
    async initializeSupabase() {
        try {
            // Import Supabase from CDN
            if (typeof window.supabase === 'undefined') {
                await this.loadSupabaseScript();
            }
            
            this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
            console.log('Supabase initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
        }
    }

    /**
     * Load Supabase script dynamically
     */
    loadSupabaseScript() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Bind authentication form events
     */
    bindAuthEvents() {
        // Logout button (only one we need in the main app now)
        document.getElementById('logout-btn')?.addEventListener('click', this.handleLogout.bind(this));
        
        // Exit button for both guest and authenticated users
        document.getElementById('exit-btn')?.addEventListener('click', this.showExitModal.bind(this));
        
        // Exit modal event listeners
        document.getElementById('close-exit-modal')?.addEventListener('click', this.hideExitModal.bind(this));
        document.getElementById('cancel-exit')?.addEventListener('click', this.hideExitModal.bind(this));
        document.getElementById('confirm-exit')?.addEventListener('click', this.handleExit.bind(this));
    }

    /**
     * Check current authentication state
     */
    async checkAuthState() {
        if (!this.supabase) return;
        
        // Check if user came from landing page
        const authMode = sessionStorage.getItem('authMode');
        
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (user && authMode === 'authenticated') {
                this.currentUser = user;
                this.updateUIForAuthenticatedUser(user);
            } else if (authMode === 'guest') {
                this.updateUIForGuestUser();
            } else {
                // No auth mode set, redirect to landing page
                window.location.href = 'index.html';
                return;
            }
        } catch (error) {
            console.error('Auth state check failed:', error);
            // If there's an auth error and user expected to be authenticated, redirect to landing
            if (authMode === 'authenticated') {
                window.location.href = 'index.html';
            } else {
                this.updateUIForGuestUser();
            }
        }
    }



    /**
     * Handle user logout
     */
    async handleLogout() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            this.currentUser = null;
            
            // Clear session storage and redirect to landing page
            sessionStorage.removeItem('authMode');
            window.location.href = 'index.html';
            
        } catch (error) {
            console.error('Logout failed:', error);
            // Even if logout fails, redirect to landing page for security
            sessionStorage.removeItem('authMode');
            window.location.href = 'index.html';
        }
    }

    /**
     * Show authentication modal
     */
    showModal(type) {
        const modal = document.getElementById('auth-modal');
        const forms = ['login-form-container', 'register-form-container', 'forgot-form-container'];
        
        // Hide all forms
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) form.style.display = 'none';
        });
        
        // Show selected form
        const selectedForm = document.getElementById(`${type}-form-container`);
        if (selectedForm) {
            selectedForm.style.display = 'block';
            modal.style.display = 'flex';
        }
    }

    /**
     * Hide authentication modal
     */
    hideModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.clearErrors();
    }

    /**
     * Update UI for authenticated user
     */
    updateUIForAuthenticatedUser(user) {
        const userInfo = document.getElementById('user-info');
        const guestInfo = document.getElementById('guest-info');
        const userEmail = document.getElementById('user-email');
        
        if (guestInfo) guestInfo.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (userEmail) userEmail.textContent = user.email;
    }

    /**
     * Update UI for guest user
     */
    updateUIForGuestUser() {
        const userInfo = document.getElementById('user-info');
        const guestInfo = document.getElementById('guest-info');
        
        if (userInfo) userInfo.style.display = 'none';
        if (guestInfo) guestInfo.style.display = 'flex';
    }

    /**
     * Update UI for unauthenticated user (legacy - redirects to landing)
     */
    updateUIForUnauthenticatedUser() {
        // In the new flow, unauthenticated users should go to landing page
        window.location.href = 'index.html';
    }



    /**
     * Show exit confirmation modal
     */
    showExitModal() {
        const modal = document.getElementById('exit-modal');
        const message = document.getElementById('exit-message');
        
        const authMode = sessionStorage.getItem('authMode');
        const isGuest = authMode === 'guest';
        
        if (message) {
            message.textContent = isGuest 
                ? 'Exit application?' 
                : 'Sign out and return to welcome page?';
        }
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    /**
     * Hide exit confirmation modal
     */
    hideExitModal() {
        const modal = document.getElementById('exit-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Handle exit/logout confirmation
     */
    async handleExit() {
        const authMode = sessionStorage.getItem('authMode');
        const isGuest = authMode === 'guest';
        
        if (isGuest) {
            // For guest users, just redirect to landing page
            sessionStorage.removeItem('authMode');
            window.location.href = 'index.html';
        } else {
            // For authenticated users, perform logout
            await this.handleLogout();
        }
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.currentUser;
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});