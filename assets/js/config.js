/**
 * Public Configuration for Kindergarten Math App
 * 
 * NOTE: These values are intentionally public as they're used in client-side code.
 * Security is enforced through Supabase Row Level Security (RLS) policies.
 * 
 * The anon key has limited permissions and can only perform actions
 * that are explicitly allowed by your RLS policies.
 */

window.APP_CONFIG = {
    supabase: {
        url: 'https://aajuzlivkbnmlyqjuxxf.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhanV6bGl2a2JubWx5cWp1eHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDAxNjMsImV4cCI6MjA3NzAxNjE2M30.zks4gHHsCn-Ebhe6dt7Q9FXXsMtq95wJ2oy7P9NrAJs'
    },
    
    // App-specific settings
    app: {
        name: 'Kindergarten Math',
        version: '1.0.0',
        domain: 'math.xiva.us'
    }
};