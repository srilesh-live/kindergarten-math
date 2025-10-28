/**
 * SupabaseClient.js - Supabase client wrapper
 * Manages connection to Supabase backend
 */

import { SUPABASE_CONFIG } from '../config/supabase.config.js';

/**
 * Supabase Client Wrapper
 * Uses Supabase JS client (loaded from CDN)
 */
export class SupabaseClient {
    constructor() {
        this.client = null;
        this.isInitialized = false;
        this.currentUser = null;
    }

    /**
     * Initialize Supabase client
     */
    async init() {
        try {
            // Check if Supabase is configured
            if (SUPABASE_CONFIG.url === 'https://your-project.supabase.co' || 
                SUPABASE_CONFIG.anonKey === 'your-anon-key') {
                console.log('ℹ️ Supabase not configured - skipping backend initialization');
                return false;
            }

            // Load Supabase client from CDN if not already loaded (with timeout)
            if (!window.supabase) {
                const loaded = await Promise.race([
                    this.loadSupabaseClient(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Supabase CDN load timeout')), 5000)
                    )
                ]);
                
                if (!loaded) {
                    console.warn('⚠️ Failed to load Supabase client from CDN');
                    return false;
                }
            }

            // Create Supabase client
            const { createClient } = window.supabase;
            this.client = createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey,
                SUPABASE_CONFIG.options
            );

            // Get current session (with timeout)
            const sessionResult = await Promise.race([
                this.client.auth.getSession(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Session check timeout')), 3000)
                )
            ]);
            
            const { data: { session } = {}, error } = sessionResult || {};
            
            if (session && !error) {
                this.currentUser = session.user;
            }

            this.isInitialized = true;
            console.log('✅ Supabase client initialized');

            return true;
        } catch (error) {
            console.warn('⚠️ Supabase client initialization failed (continuing without backend):', error.message);
            return false;
        }
    }

    /**
     * Load Supabase client from CDN
     */
    async loadSupabaseClient() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (window.supabase) {
                resolve();
                return;
            }

            // Create script tag
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.async = true;

            script.onload = () => {
                console.log('✅ Supabase client loaded from CDN');
                resolve();
            };

            script.onerror = (error) => {
                console.error('❌ Failed to load Supabase client:', error);
                reject(error);
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Get the Supabase client instance
     */
    getClient() {
        if (!this.isInitialized) {
            throw new Error('Supabase client not initialized. Call init() first.');
        }
        return this.client;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Set current user (used by auth manager)
     */
    setCurrentUser(user) {
        this.currentUser = user;
    }
}

// Export singleton instance
export const supabaseClient = new SupabaseClient();
