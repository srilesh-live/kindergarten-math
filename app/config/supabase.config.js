/**
 * Supabase Configuration
 * Cloud backend for authentication, data sync, and leaderboards
 */

// Supabase project credentials
// NOTE: Replace these with your actual Supabase project URL and anon key
export const SUPABASE_CONFIG = {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://aajuzlivkbnmlyqjuxxf.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhanV6bGl2a2JubWx5cWp1eHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDAxNjMsImV4cCI6MjA3NzAxNjE2M30.zks4gHHsCn-Ebhe6dt7Q9FXXsMtq95wJ2oy7P9NrAJs',
    
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
