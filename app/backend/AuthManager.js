/**
 * AuthManager.js - Authentication management with Supabase
 * Handles user registration, login, logout, and session management
 */

import { supabaseClient } from './SupabaseClient.js';
import { TABLES } from '../config/supabase.config.js';

export class AuthManager {
    constructor() {
        this.supabase = null;
        this.authStateCallbacks = [];
        this.currentSession = null;
    }

    /**
     * Initialize authentication manager
     */
    async init() {
        // Initialize Supabase client
        await supabaseClient.init();
        this.supabase = supabaseClient.getClient();

        // Set up auth state listener
        this.supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);
            this.currentSession = session;
            
            if (session) {
                supabaseClient.setCurrentUser(session.user);
            } else {
                supabaseClient.setCurrentUser(null);
            }

            // Notify all listeners
            this.authStateCallbacks.forEach(callback => {
                callback(event, session);
            });
        });

        console.log('✅ Auth manager initialized');
    }

    /**
     * Register auth state change callback
     */
    onAuthStateChange(callback) {
        this.authStateCallbacks.push(callback);
        
        // Return unsubscribe function
        return () => {
            this.authStateCallbacks = this.authStateCallbacks.filter(cb => cb !== callback);
        };
    }

    /**
     * Sign up with email and password
     */
    async signUp(email, password, metadata = {}) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: metadata.displayName || email.split('@')[0],
                        age_group: metadata.ageGroup || '4-5',
                        avatar: metadata.avatar || '👶',
                        ...metadata
                    }
                }
            });

            if (error) throw error;

            // Create user profile
            if (data.user) {
                await this.createUserProfile(data.user);
            }

            return { success: true, user: data.user, session: data.session };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sign in with email and password
     */
    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            return { success: true, user: data.user, session: data.session };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sign in with OAuth provider (Google, GitHub, etc.)
     */
    async signInWithProvider(provider) {
        try {
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.origin
                }
            });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('OAuth sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sign out
     */
    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            
            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get current session
     */
    async getSession() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) throw error;

            this.currentSession = session;
            return session;
        } catch (error) {
            console.error('Get session error:', error);
            return null;
        }
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentSession?.user || null;
    }

    /**
     * Update user metadata
     */
    async updateUserMetadata(metadata) {
        try {
            const { data, error } = await this.supabase.auth.updateUser({
                data: metadata
            });

            if (error) throw error;

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Update user metadata error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Reset password
     */
    async resetPassword(email) {
        try {
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update password
     */
    async updatePassword(newPassword) {
        try {
            const { error } = await this.supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('Update password error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create user profile in database
     */
    async createUserProfile(user) {
        try {
            const { error } = await this.supabase
                .from(TABLES.USER_PROFILES)
                .insert({
                    user_id: user.id,
                    email: user.email,
                    display_name: user.user_metadata?.display_name || user.email.split('@')[0],
                    age_group: user.user_metadata?.age_group || '4-5',
                    avatar: user.user_metadata?.avatar || '👶',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            console.log('✅ User profile created');
            return true;
        } catch (error) {
            console.error('Create user profile error:', error);
            return false;
        }
    }

    /**
     * Get user profile
     */
    async getUserProfile(userId) {
        try {
            const { data, error } = await this.supabase
                .from(TABLES.USER_PROFILES)
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Get user profile error:', error);
            return null;
        }
    }

    /**
     * Update user profile
     */
    async updateUserProfile(userId, updates) {
        try {
            const { data, error } = await this.supabase
                .from(TABLES.USER_PROFILES)
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;

            return { success: true, profile: data };
        } catch (error) {
            console.error('Update user profile error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.currentSession !== null;
    }
}
