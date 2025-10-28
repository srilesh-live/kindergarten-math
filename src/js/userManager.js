/**
 * User Management System
 * Handles guest and signed-in user modes with Supabase integration
 * Kindergarten Math Adventure v3
 */

import { SUPABASE_CONFIG, UI_CONFIG, STORAGE_CONFIG, APP_CONFIG } from './config.js';

/**
 * User Management Class
 * Manages authentication, session handling, and feature access
 */
export class UserManager {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.isGuest = true;
        this.sessionTimeout = null;
        this.offlineMode = false;
        
        // Feature access levels
        this.featureAccess = {
            guest: {
                gamesAllowed: ['number-magic'], // Limited to one game
                maxQuestions: 10, // Limit questions per session
                aiPersonalization: false, // No AI learning
                progressTracking: false, // No cloud progress
                achievements: false, // No achievement system
                customization: false, // No theme customization
                statistics: false, // No detailed analytics
                offlineSync: false // No data sync
            },
            authenticated: {
                gamesAllowed: Object.keys(APP_CONFIG.GAMES), // All games
                maxQuestions: -1, // Unlimited questions
                aiPersonalization: true, // Full AI learning
                progressTracking: true, // Cloud progress tracking
                achievements: true, // Achievement system
                customization: true, // Theme customization
                statistics: true, // Detailed analytics
                offlineSync: true // Data synchronization
            }
        };

        this.init();
    }

    /**
     * Initialize the user management system
     */
    async init() {
        try {
            // Check if we're in development mode
            if (APP_CONFIG.ENVIRONMENT === 'development') {
                console.log('[UserManager] Initializing in development mode');
                // In dev mode, simulate offline first
                this.offlineMode = true;
                await this.initGuestMode();
                return;
            }

            // Check network connectivity
            this.offlineMode = !navigator.onLine;
            
            // Set up network listeners
            window.addEventListener('online', this.handleOnline.bind(this));
            window.addEventListener('offline', this.handleOffline.bind(this));

            if (this.offlineMode) {
                console.log('[UserManager] Starting in offline mode');
                await this.initGuestMode();
            } else {
                console.log('[UserManager] Starting in online mode');
                await this.initSupabase();
                await this.checkExistingSession();
            }

        } catch (error) {
            console.error('[UserManager] Initialization error:', error);
            // Fallback to guest mode
            await this.initGuestMode();
        }
    }

    /**
     * Initialize Supabase client
     */
    async initSupabase() {
        try {
            // Import Supabase dynamically to avoid loading in offline mode
            const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2');
            
            this.supabase = createClient(
                SUPABASE_CONFIG.URL,
                SUPABASE_CONFIG.ANON_KEY
            );

            // Set up auth state listener
            this.supabase.auth.onAuthStateChange((event, session) => {
                this.handleAuthStateChange(event, session);
            });

            console.log('[UserManager] Supabase initialized');
        } catch (error) {
            console.error('[UserManager] Supabase initialization failed:', error);
            this.offlineMode = true;
            await this.initGuestMode();
        }
    }

    /**
     * Initialize guest mode
     */
    async initGuestMode() {
        this.isGuest = true;
        this.currentUser = {
            id: 'guest',
            email: null,
            name: 'Guest',
            avatar: '👶',
            created_at: new Date().toISOString(),
            preferences: this.getDefaultPreferences(),
            progress: this.loadGuestProgress()
        };

        // Start session timeout for guests (30 minutes)
        this.startSessionTimeout(30 * 60 * 1000);
        
        this.saveUserSession();
        this.notifyAuthStateChange('guest_signin', this.currentUser);
        
        console.log('[UserManager] Guest mode initialized');
    }

    /**
     * Check for existing user session
     */
    async checkExistingSession() {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (session && session.user) {
                await this.handleAuthenticatedUser(session.user);
            } else {
                // Check for saved guest session
                const savedSession = this.loadUserSession();
                if (savedSession && savedSession.id === 'guest') {
                    this.currentUser = savedSession;
                    this.isGuest = true;
                    this.startSessionTimeout(30 * 60 * 1000);
                } else {
                    await this.initGuestMode();
                }
            }
        } catch (error) {
            console.error('[UserManager] Session check failed:', error);
            await this.initGuestMode();
        }
    }

    /**
     * Handle authenticated user setup
     */
    async handleAuthenticatedUser(user) {
        try {
            this.isGuest = false;
            this.clearSessionTimeout();

            // Load or create user profile
            const profile = await this.loadUserProfile(user.id);
            
            this.currentUser = {
                id: user.id,
                email: user.email,
                name: profile.name || user.email.split('@')[0],
                avatar: profile.avatar || this.generateAvatar(user.email),
                created_at: user.created_at,
                preferences: profile.preferences || this.getDefaultPreferences(),
                progress: profile.progress || this.getDefaultProgress()
            };

            this.saveUserSession();
            this.notifyAuthStateChange('authenticated_signin', this.currentUser);
            
            // Sync offline data if available
            await this.syncOfflineData();
            
            console.log('[UserManager] Authenticated user loaded:', this.currentUser.name);
        } catch (error) {
            console.error('[UserManager] Authenticated user setup failed:', error);
            await this.signOut();
        }
    }

    /**
     * Handle authentication state changes
     */
    handleAuthStateChange(event, session) {
        console.log('[UserManager] Auth state change:', event);
        
        switch (event) {
            case 'SIGNED_IN':
                if (session?.user) {
                    this.handleAuthenticatedUser(session.user);
                }
                break;
                
            case 'SIGNED_OUT':
                this.handleSignOut();
                break;
                
            case 'TOKEN_REFRESHED':
                console.log('[UserManager] Token refreshed');
                break;
                
            default:
                console.log('[UserManager] Unhandled auth event:', event);
        }
    }

    /**
     * Sign in with email/password
     */
    async signIn(email, password) {
        if (this.offlineMode || !this.supabase) {
            throw new Error('Sign in not available offline');
        }

        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            
            return { success: true, user: data.user };
        } catch (error) {
            console.error('[UserManager] Sign in failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sign up with email/password
     */
    async signUp(email, password, name) {
        if (this.offlineMode || !this.supabase) {
            throw new Error('Sign up not available offline');
        }

        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name
                    }
                }
            });

            if (error) throw error;
            
            return { success: true, user: data.user };
        } catch (error) {
            console.error('[UserManager] Sign up failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sign out current user
     */
    async signOut() {
        try {
            if (!this.offlineMode && this.supabase && !this.isGuest) {
                await this.supabase.auth.signOut();
            }
            
            this.handleSignOut();
        } catch (error) {
            console.error('[UserManager] Sign out error:', error);
            this.handleSignOut(); // Force local signout
        }
    }

    /**
     * Handle sign out cleanup
     */
    handleSignOut() {
        this.clearSessionTimeout();
        this.clearUserSession();
        this.initGuestMode();
    }

    /**
     * Check if feature is available for current user
     */
    hasFeatureAccess(feature) {
        const userType = this.isGuest ? 'guest' : 'authenticated';
        return this.featureAccess[userType][feature];
    }

    /**
     * Get available games for current user
     */
    getAvailableGames() {
        const userType = this.isGuest ? 'guest' : 'authenticated';
        return this.featureAccess[userType].gamesAllowed;
    }

    /**
     * Get maximum questions allowed for current user
     */
    getMaxQuestions() {
        const userType = this.isGuest ? 'guest' : 'authenticated';
        return this.featureAccess[userType].maxQuestions;
    }

    /**
     * Update user progress
     */
    async updateProgress(gameId, progressData) {
        if (!this.currentUser) return;

        // Update local progress
        this.currentUser.progress = this.currentUser.progress || {};
        this.currentUser.progress[gameId] = {
            ...this.currentUser.progress[gameId],
            ...progressData,
            updated_at: new Date().toISOString()
        };

        // Save locally
        this.saveUserSession();

        // Sync to cloud if authenticated and online
        if (!this.isGuest && !this.offlineMode && this.supabase) {
            try {
                await this.syncProgressToCloud();
            } catch (error) {
                console.error('[UserManager] Progress sync failed:', error);
                // Store for later sync
                this.queueOfflineAction('updateProgress', { gameId, progressData });
            }
        }
    }

    /**
     * Load user profile from Supabase
     */
    async loadUserProfile(userId) {
        if (!this.supabase) return {};

        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.TABLES.PROFILES)
                .select('*')
                .eq('id', userId)
                .single();

            if (error && error.code !== 'PGRST116') { // Not found error is ok
                throw error;
            }

            return data || {};
        } catch (error) {
            console.error('[UserManager] Profile load failed:', error);
            return {};
        }
    }

    /**
     * Sync progress to cloud
     */
    async syncProgressToCloud() {
        if (!this.supabase || this.isGuest) return;

        try {
            const { error } = await this.supabase
                .from(SUPABASE_CONFIG.TABLES.PROGRESS)
                .upsert({
                    user_id: this.currentUser.id,
                    progress_data: this.currentUser.progress,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            
            console.log('[UserManager] Progress synced to cloud');
        } catch (error) {
            console.error('[UserManager] Progress sync failed:', error);
            throw error;
        }
    }

    /**
     * Handle network online event
     */
    async handleOnline() {
        console.log('[UserManager] Network online');
        this.offlineMode = false;
        
        if (!this.supabase) {
            await this.initSupabase();
        }
        
        // Sync offline data
        await this.syncOfflineData();
        
        // Notify UI
        this.notifyNetworkChange(true);
    }

    /**
     * Handle network offline event
     */
    handleOffline() {
        console.log('[UserManager] Network offline');
        this.offlineMode = true;
        this.notifyNetworkChange(false);
    }

    /**
     * Sync offline data when coming back online
     */
    async syncOfflineData() {
        const offlineActions = this.getOfflineActions();
        
        for (const action of offlineActions) {
            try {
                await this.executeOfflineAction(action);
            } catch (error) {
                console.error('[UserManager] Offline action sync failed:', error);
            }
        }
        
        this.clearOfflineActions();
    }

    /**
     * Session timeout management
     */
    startSessionTimeout(duration) {
        this.clearSessionTimeout();
        
        this.sessionTimeout = setTimeout(() => {
            console.log('[UserManager] Session timeout');
            this.signOut();
        }, duration);
    }

    clearSessionTimeout() {
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.sessionTimeout = null;
        }
    }

    /**
     * Local storage management
     */
    saveUserSession() {
        try {
            localStorage.setItem(STORAGE_CONFIG.KEYS.USER_SESSION, 
                JSON.stringify(this.currentUser));
        } catch (error) {
            console.error('[UserManager] Session save failed:', error);
        }
    }

    loadUserSession() {
        try {
            const session = localStorage.getItem(STORAGE_CONFIG.KEYS.USER_SESSION);
            return session ? JSON.parse(session) : null;
        } catch (error) {
            console.error('[UserManager] Session load failed:', error);
            return null;
        }
    }

    clearUserSession() {
        try {
            localStorage.removeItem(STORAGE_CONFIG.KEYS.USER_SESSION);
        } catch (error) {
            console.error('[UserManager] Session clear failed:', error);
        }
    }

    /**
     * Guest progress management
     */
    loadGuestProgress() {
        try {
            const progress = localStorage.getItem(STORAGE_CONFIG.KEYS.GUEST_PROGRESS);
            return progress ? JSON.parse(progress) : this.getDefaultProgress();
        } catch (error) {
            console.error('[UserManager] Guest progress load failed:', error);
            return this.getDefaultProgress();
        }
    }

    /**
     * Offline actions queue
     */
    queueOfflineAction(type, data) {
        try {
            const actions = this.getOfflineActions();
            actions.push({
                type,
                data,
                timestamp: new Date().toISOString()
            });
            
            localStorage.setItem(STORAGE_CONFIG.KEYS.OFFLINE_QUEUE, 
                JSON.stringify(actions));
        } catch (error) {
            console.error('[UserManager] Offline action queue failed:', error);
        }
    }

    getOfflineActions() {
        try {
            const actions = localStorage.getItem(STORAGE_CONFIG.KEYS.OFFLINE_QUEUE);
            return actions ? JSON.parse(actions) : [];
        } catch (error) {
            console.error('[UserManager] Offline actions load failed:', error);
            return [];
        }
    }

    clearOfflineActions() {
        try {
            localStorage.removeItem(STORAGE_CONFIG.KEYS.OFFLINE_QUEUE);
        } catch (error) {
            console.error('[UserManager] Offline actions clear failed:', error);
        }
    }

    async executeOfflineAction(action) {
        switch (action.type) {
            case 'updateProgress':
                await this.syncProgressToCloud();
                break;
            default:
                console.warn('[UserManager] Unknown offline action:', action.type);
        }
    }

    /**
     * Utility functions
     */
    getDefaultPreferences() {
        return {
            theme: 'dark',
            soundEnabled: true,
            animationsEnabled: true,
            difficultyLevel: 'adaptive',
            language: 'en',
            fontSize: 'medium',
            autoAdvance: true,
            showHints: true
        };
    }

    getDefaultProgress() {
        return {};
    }

    generateAvatar(email) {
        // Generate avatar based on email hash
        const avatars = ['👶', '🧒', '👧', '🧑', '👩', '🦸', '🌟', '🚀'];
        const hash = email.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        return avatars[hash % avatars.length];
    }

    /**
     * Event notification system
     */
    notifyAuthStateChange(event, user) {
        window.dispatchEvent(new CustomEvent('userAuthChange', {
            detail: { event, user, isGuest: this.isGuest }
        }));
    }

    notifyNetworkChange(isOnline) {
        window.dispatchEvent(new CustomEvent('userNetworkChange', {
            detail: { isOnline, offlineMode: this.offlineMode }
        }));
    }

    /**
     * Public getters
     */
    get user() {
        return this.currentUser;
    }

    get isAuthenticated() {
        return !this.isGuest && this.currentUser !== null;
    }

    get isOnline() {
        return !this.offlineMode;
    }
}

// Create singleton instance
export const userManager = new UserManager();