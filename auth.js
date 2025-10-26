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
        // Login form
        document.getElementById('login-form')?.addEventListener('submit', this.handleLogin.bind(this));
        
        // Register form
        document.getElementById('register-form')?.addEventListener('submit', this.handleRegister.bind(this));
        
        // Forgot password form
        document.getElementById('forgot-form')?.addEventListener('submit', this.handleForgotPassword.bind(this));
        
        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', this.handleLogout.bind(this));
        
        // Modal controls
        document.getElementById('show-login')?.addEventListener('click', () => this.showModal('login'));
        document.getElementById('show-register')?.addEventListener('click', () => this.showModal('register'));
        document.getElementById('show-forgot')?.addEventListener('click', () => this.showModal('forgot'));
        document.getElementById('close-auth-modal')?.addEventListener('click', this.hideModal.bind(this));
        
        // Switch between forms
        document.getElementById('switch-to-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal('register');
        });
        
        document.getElementById('switch-to-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal('login');
        });
        
        document.getElementById('switch-to-forgot')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal('forgot');
        });
    }

    /**
     * Check current authentication state
     */
    async checkAuthState() {
        if (!this.supabase) return;
        
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (user) {
                this.currentUser = user;
                this.updateUIForAuthenticatedUser(user);
            } else {
                this.updateUIForUnauthenticatedUser();
            }
        } catch (error) {
            console.error('Auth state check failed:', error);
            this.updateUIForUnauthenticatedUser();
        }
    }

    /**
     * Handle user login
     */
    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        this.showLoading('login');
        
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            this.currentUser = data.user;
            this.updateUIForAuthenticatedUser(data.user);
            this.hideModal();
            this.showSuccess('Login successful!');
            
        } catch (error) {
            this.showError('login', error.message);
        } finally {
            this.hideLoading('login');
        }
    }

    /**
     * Handle user registration
     */
    async handleRegister(event) {
        event.preventDefault();
        
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        if (password !== confirmPassword) {
            this.showError('register', 'Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            this.showError('register', 'Password must be at least 6 characters');
            return;
        }
        
        this.showLoading('register');
        
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password
            });
            
            if (error) throw error;
            
            this.showSuccess('Registration successful! Please check your email to verify your account.');
            this.showModal('login');
            
        } catch (error) {
            this.showError('register', error.message);
        } finally {
            this.hideLoading('register');
        }
    }

    /**
     * Handle forgot password
     */
    async handleForgotPassword(event) {
        event.preventDefault();
        
        const email = document.getElementById('forgot-email').value;
        
        this.showLoading('forgot');
        
        try {
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password'
            });
            
            if (error) throw error;
            
            this.showSuccess('Password reset email sent! Please check your inbox.');
            this.hideModal();
            
        } catch (error) {
            this.showError('forgot', error.message);
        } finally {
            this.hideLoading('forgot');
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
            this.updateUIForUnauthenticatedUser();
            this.showSuccess('Logged out successfully!');
            
        } catch (error) {
            console.error('Logout failed:', error);
            this.showError('general', 'Logout failed');
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
        // Hide auth buttons, show user info
        const authButtons = document.getElementById('auth-buttons');
        const userInfo = document.getElementById('user-info');
        const userEmail = document.getElementById('user-email');
        
        if (authButtons) authButtons.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (userEmail) userEmail.textContent = user.email;
        
        // Update user name in status bar if exists
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = user.email.split('@')[0];
        }
    }

    /**
     * Update UI for unauthenticated user
     */
    updateUIForUnauthenticatedUser() {
        // Show auth buttons, hide user info
        const authButtons = document.getElementById('auth-buttons');
        const userInfo = document.getElementById('user-info');
        
        if (authButtons) authButtons.style.display = 'flex';
        if (userInfo) userInfo.style.display = 'none';
        
        // Update user name in status bar
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = 'Guest User';
        }
    }

    /**
     * Show loading state
     */
    showLoading(formType) {
        const button = document.querySelector(`#${formType}-form button[type="submit"]`);
        if (button) {
            button.disabled = true;
            button.textContent = 'Loading...';
        }
    }

    /**
     * Hide loading state
     */
    hideLoading(formType) {
        const button = document.querySelector(`#${formType}-form button[type="submit"]`);
        if (button) {
            button.disabled = false;
            const originalText = {
                'login': 'Sign In',
                'register': 'Sign Up',
                'forgot': 'Send Reset Email'
            };
            button.textContent = originalText[formType] || 'Submit';
        }
    }

    /**
     * Show error message
     */
    showError(formType, message) {
        const errorDiv = document.getElementById(`${formType}-error`);
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        // You can implement a toast notification or use the existing success display
        console.log('Success:', message);
        alert(message); // Replace with better notification system
    }

    /**
     * Clear all error messages
     */
    clearErrors() {
        const errorDivs = document.querySelectorAll('[id$="-error"]');
        errorDivs.forEach(div => {
            div.style.display = 'none';
            div.textContent = '';
        });
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