/**
 * Supabase Configuration
 * Cloud backend for authentication, data sync, and leaderboards
 */

// Supabase project credentials
// NOTE: Replace these with your actual Supabase project URL and anon key
export const SUPABASE_CONFIG = {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
    
    // Optional: Custom options
    options: {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            storage: window.localStorage,
            storageKey: 'km-auth-token'
        },
        db: {
            schema: 'public'
        },
        global: {
            headers: {
                'x-app-name': 'kindergarten-math-adventure'
            }
        }
    }
};

// Table names
export const TABLES = {
    USERS: 'users',
    USER_PROFILES: 'user_profiles',
    USER_PROGRESS: 'user_progress',
    USER_SETTINGS: 'user_settings',
    ACHIEVEMENTS: 'user_achievements',
    GAME_SESSIONS: 'game_sessions',
    DAILY_CHALLENGES: 'daily_challenge_completions',
    LEADERBOARD: 'leaderboard_entries'
};

// Real-time channels
export const CHANNELS = {
    LEADERBOARD: 'leaderboard-updates',
    USER_PROGRESS: 'user-progress-updates'
};
