/**
 * MathBuddy Configuration
 * AI-Driven Learning Platform for Kids
 */

// Supabase Configuration (optimized for free tier)
export const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co', // Replace with your Supabase URL
    anonKey: 'your-anon-key', // Replace with your Supabase anon key
    
    // Free tier optimizations
    MAX_REQUESTS_PER_MINUTE: 100,
    BATCH_SIZE: 10,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    OFFLINE_SYNC_INTERVAL: 30 * 1000, // 30 seconds
};

// AI Configuration
export const AI_CONFIG = {
    // Difficulty adaptation parameters
    DIFFICULTY_ADJUSTMENT: {
        SUCCESS_THRESHOLD: 0.8, // 80% success rate to increase difficulty
        STRUGGLE_THRESHOLD: 0.5, // 50% or below to decrease difficulty
        ADAPTATION_WINDOW: 5, // Number of recent questions to consider
    },
    
    // AI phrase generation
    PHRASE_CATEGORIES: {
        ENCOURAGEMENT: 'encouragement',
        CELEBRATION: 'celebration',
        GUIDANCE: 'guidance',
        CURIOSITY: 'curiosity',
        ACHIEVEMENT: 'achievement'
    },
    
    // Learning analytics
    ANALYTICS: {
        PATTERN_RECOGNITION_THRESHOLD: 3, // Minimum attempts to identify patterns
        SKILL_MASTERY_THRESHOLD: 0.9, // 90% accuracy for skill mastery
        LEARNING_VELOCITY_WINDOW: 20, // Questions to calculate learning speed
    }
};

// App Configuration
export const APP_CONFIG = {
    // Age groups and skill levels
    AGE_GROUPS: {
        KINDERGARTEN: { min: 4, max: 6, skills: ['counting', 'basic_addition', 'shapes'] },
        GRADE_1: { min: 6, max: 7, skills: ['addition', 'subtraction', 'time_basic'] },
        GRADE_2: { min: 7, max: 8, skills: ['multiplication_basic', 'patterns', 'time_advanced'] },
        GRADE_3: { min: 8, max: 9, skills: ['multiplication', 'division', 'fractions_basic'] }
    },
    
    // Game types
    GAMES: {
        ARITHMETIC: {
            id: 'arithmetic',
            name: '🔢 Number Magic',
            description: 'Cast spells with numbers!',
            skills: ['addition', 'subtraction', 'multiplication', 'division']
        },
        PATTERNS: {
            id: 'patterns',
            name: '🔮 Pattern Detective',
            description: 'Solve mysterious number puzzles!',
            skills: ['sequences', 'patterns', 'logic']
        },
        TIME: {
            id: 'time',
            name: '⏰ Time Wizard',
            description: 'Master the magic of time!',
            skills: ['time_telling', 'time_concepts', 'duration']
        },
        GEOMETRY: {
            id: 'geometry',
            name: '🎨 Shape Artist',
            description: 'Create art with shapes!',
            skills: ['shapes', 'spatial_reasoning', 'measurement']
        }
    },
    
    // Performance thresholds
    PERFORMANCE: {
        EXCELLENT: 0.9,
        GOOD: 0.75,
        IMPROVING: 0.6,
        NEEDS_HELP: 0.4
    },
    
    // Theme configuration
    THEME: {
        PRIMARY: '#1a1a2e',      // Dark navy
        SECONDARY: '#16213e',     // Darker blue
        SURFACE: '#0f172a',       // Deep dark
        ACCENT_PURPLE: '#a78bfa', // Soft purple
        ACCENT_PINK: '#f472b6',   // Soft pink
        ACCENT_BLUE: '#60a5fa',   // Soft blue
        ACCENT_GREEN: '#4ade80',  // Soft green
        ACCENT_YELLOW: '#fbbf24', // Soft yellow
        ACCENT_ORANGE: '#fb7c37', // Soft orange
        TEXT_PRIMARY: '#f8fafc',  // Light text
        TEXT_SECONDARY: '#cbd5e1', // Muted text
        TEXT_TERTIARY: '#64748b'  // Subtle text
    }
};

// Database Schema Definitions (for Supabase)
export const DATABASE_SCHEMA = {
    TABLES: {
        users: {
            id: 'uuid',
            created_at: 'timestamp',
            email: 'text',
            display_name: 'text',
            avatar_url: 'text',
            age: 'integer',
            grade_level: 'text',
            parent_email: 'text',
            preferences: 'jsonb',
            last_active: 'timestamp'
        },
        
        learning_sessions: {
            id: 'uuid',
            user_id: 'uuid',
            game_type: 'text',
            started_at: 'timestamp',
            ended_at: 'timestamp',
            questions_attempted: 'integer',
            questions_correct: 'integer',
            average_response_time: 'float',
            difficulty_level: 'text',
            skills_practiced: 'text[]',
            performance_data: 'jsonb'
        },
        
        question_attempts: {
            id: 'uuid',
            session_id: 'uuid',
            question_type: 'text',
            question_data: 'jsonb',
            user_answer: 'text',
            correct_answer: 'text',
            is_correct: 'boolean',
            response_time_ms: 'integer',
            attempts_count: 'integer',
            hints_used: 'integer',
            difficulty_level: 'text',
            timestamp: 'timestamp'
        },
        
        ai_insights: {
            id: 'uuid',
            user_id: 'uuid',
            insight_type: 'text',
            insight_data: 'jsonb',
            confidence_score: 'float',
            generated_at: 'timestamp',
            is_active: 'boolean'
        },
        
        achievements: {
            id: 'uuid',
            user_id: 'uuid',
            achievement_type: 'text',
            achievement_data: 'jsonb',
            earned_at: 'timestamp',
            is_milestone: 'boolean'
        }
    }
};

// Offline Storage Configuration
export const OFFLINE_CONFIG = {
    STORAGE_KEYS: {
        USER_PROFILE: 'mathbuddy_user_profile',
        PENDING_SESSIONS: 'mathbuddy_pending_sessions',
        CACHED_INSIGHTS: 'mathbuddy_cached_insights',
        OFFLINE_QUESTIONS: 'mathbuddy_offline_questions',
        SETTINGS: 'mathbuddy_settings'
    },
    
    MAX_OFFLINE_SESSIONS: 50,
    MAX_CACHED_QUESTIONS: 200,
    SYNC_RETRY_ATTEMPTS: 3,
    SYNC_RETRY_DELAY: 2000 // 2 seconds
};

// Performance Monitoring
export const PERFORMANCE_CONFIG = {
    METRICS: {
        LOAD_TIME: 'load_time',
        INTERACTION_DELAY: 'interaction_delay',
        API_RESPONSE_TIME: 'api_response_time',
        RENDER_TIME: 'render_time'
    },
    
    THRESHOLDS: {
        FAST_LOAD: 1000,      // 1 second
        SLOW_LOAD: 3000,      // 3 seconds
        FAST_INTERACTION: 100, // 100ms
        SLOW_INTERACTION: 300  // 300ms
    }
};

export default {
    SUPABASE_CONFIG,
    AI_CONFIG,
    APP_CONFIG,
    DATABASE_SCHEMA,
    OFFLINE_CONFIG,
    PERFORMANCE_CONFIG
};