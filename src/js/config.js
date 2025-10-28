/**
 * Core Configuration for Kindergarten Math Adventure v3
 * Complete rewrite with enhanced features and clean architecture
 */

// Application Configuration
export const APP_CONFIG = {
  name: 'Kindergarten Math Adventure',
  version: '3.0.0',
  
  // User modes
  modes: {
    GUEST: 'guest',
    SIGNED_IN: 'signed_in'
  },
  
  // Age groups with progressive skill levels
  ageGroups: {
    '4': {
      name: 'Pre-K (4 years)',
      skills: ['counting_1_5', 'shape_recognition', 'basic_patterns'],
      maxNumber: 5,
      preferredGames: ['shapes', 'patterns']
    },
    '5': {
      name: 'Kindergarten (5 years)', 
      skills: ['counting_1_10', 'addition_basic', 'time_hours'],
      maxNumber: 10,
      preferredGames: ['number_magic', 'time_wizard']
    },
    '6': {
      name: 'Grade 1 (6 years)',
      skills: ['addition_advanced', 'subtraction_basic', 'time_half_hours'], 
      maxNumber: 20,
      preferredGames: ['number_magic', 'time_wizard', 'patterns']
    },
    '7': {
      name: 'Grade 2 (7+ years)',
      skills: ['multiplication_basic', 'division_basic', 'time_minutes'],
      maxNumber: 50,
      preferredGames: ['number_magic', 'time_wizard', 'patterns', 'shapes']
    }
  },
  
  // Game configuration
  games: {
    number_magic: {
      name: 'Number Magic',
      icon: '🧮',
      description: 'Master numbers through magical adventures!',
      progression: ['addition', 'subtraction', 'multiplication', 'division'],
      visualElements: true,
      adaptiveDifficulty: true
    },
    time_wizard: {
      name: 'Time Wizard',
      icon: '🕐', 
      description: 'Learn to read clocks like a time wizard!',
      progression: ['hours', 'half_hours', 'quarter_hours', 'minutes'],
      visualElements: true,
      adaptiveDifficulty: true
    },
    pattern_quest: {
      name: 'Pattern Quest',
      icon: '🔮',
      description: 'Discover magical patterns and sequences!',
      progression: ['simple', 'numeric', 'complex', 'advanced'],
      visualElements: true,
      adaptiveDifficulty: true
    },
    shape_explorer: {
      name: 'Shape Explorer',
      icon: '⭐',
      description: 'Explore the magical world of shapes!',
      progression: ['basic', 'intermediate', 'advanced', 'geometric'],
      visualElements: true,
      adaptiveDifficulty: true
    }
  },
  
  // Performance thresholds
  performance: {
    masteryThreshold: 0.85, // 85% accuracy for skill mastery
    strugglingThreshold: 0.60, // Below 60% indicates struggling
    adaptationWindow: 5, // Questions to consider for difficulty adjustment
    maxConsecutiveErrors: 3, // Max errors before offering help
    streakRewards: [3, 5, 10, 15, 20] // Streak milestones for celebrations
  }
};

// AI Configuration
export const AI_CONFIG = {
  // Difficulty adaptation engine
  adaptation: {
    enabled: true,
    aggressiveness: 0.3, // How quickly to adjust (0.1 = conservative, 0.5 = aggressive)
    stabilityPeriod: 5, // Min questions before considering changes
    maxDifficultyJump: 1, // Max levels to jump at once
    cooldownPeriod: 10 // Questions between major adjustments
  },
  
  // Phrase generation system
  phrases: {
    categories: {
      ENCOURAGEMENT: 'encouragement',
      CELEBRATION: 'celebration', 
      GUIDANCE: 'guidance',
      CURIOSITY: 'curiosity',
      MOTIVATION: 'motivation',
      ACHIEVEMENT: 'achievement'
    },
    personalityTypes: ['magical', 'adventurous', 'scientific', 'friendly'],
    contextFactors: ['difficulty', 'performance', 'streak', 'timeOfDay', 'gameType']
  },
  
  // Learning analytics
  analytics: {
    patternRecognitionThreshold: 3,
    skillMasteryThreshold: 0.90,
    learningVelocityWindow: 20,
    retentionTestInterval: 24 * 60 * 60 * 1000, // 24 hours
    progressMilestones: [10, 25, 50, 100, 250, 500, 1000]
  }
};

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: 'https://your-project.supabase.co',
  anonKey: 'your-anon-key-here',
  
  // Feature flags
  features: {
    authentication: false, // Set to true to enable user accounts
    realtime: false,      // Set to true for real-time features
    analytics: true,      // Always enabled for learning insights
    offline: true         // Offline-first architecture
  },
  
  // Free tier optimizations
  limits: {
    maxRequestsPerMinute: 100,
    batchSize: 10,
    cacheDuration: 5 * 60 * 1000, // 5 minutes
    syncInterval: 30 * 1000,      // 30 seconds
    maxOfflineActions: 1000
  },
  
  // Database schema
  tables: {
    users: 'user_profiles',
    sessions: 'learning_sessions', 
    attempts: 'question_attempts',
    progress: 'user_progress',
    achievements: 'user_achievements'
  }
};

// UI Configuration
export const UI_CONFIG = {
  // Dark Material Design theme
  theme: {
    name: 'dark_material',
    colors: {
      // Base colors
      primary: '#1a1a2e',
      secondary: '#16213e', 
      surface: '#1e1e30',
      background: '#0f0f23',
      
      // Accent colors (soft pastels)
      accent: {
        purple: '#9d4edd',
        blue: '#5e60ce',
        teal: '#4cc9f0', 
        pink: '#f72585',
        orange: '#fb8500',
        green: '#06ffa5'
      },
      
      // Pastel variants for UI elements
      pastel: {
        purple: '#c77dff',
        blue: '#7b68ee',
        cyan: '#6dd5ed',
        pink: '#ff9a9e',
        orange: '#feca57',
        green: '#5fa8d3'
      },
      
      // Text colors
      text: {
        primary: '#e8eaed',
        secondary: '#bdc1c6',
        muted: '#9aa0a6',
        accent: '#c77dff'
      }
    },
    
    // Animation preferences
    animations: {
      duration: {
        fast: '150ms',
        normal: '300ms', 
        slow: '500ms'
      },
      easing: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }
    },
    
    // Spacing system
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem', 
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem'
    }
  },
  
  // Accessibility features
  accessibility: {
    minTouchTarget: '44px',
    focusRingWidth: '3px',
    reducedMotion: true,
    screenReaderSupport: true,
    keyboardNavigation: true,
    highContrast: true
  },
  
  // Mobile optimizations
  mobile: {
    breakpoints: {
      sm: '640px',
      md: '768px', 
      lg: '1024px',
      xl: '1280px'
    },
    touchOptimizations: {
      tapHighlight: 'none',
      userSelect: 'none', 
      touchAction: 'manipulation'
    }
  }
};

// Storage Configuration
export const STORAGE_CONFIG = {
  // Local storage keys
  keys: {
    userProfile: 'km_user_profile',
    gameProgress: 'km_game_progress',
    settings: 'km_settings',
    offlineQueue: 'km_offline_queue',
    analytics: 'km_analytics',
    achievements: 'km_achievements'
  },
  
  // Data retention
  retention: {
    guestSession: 24 * 60 * 60 * 1000, // 24 hours
    userProgress: 30 * 24 * 60 * 60 * 1000, // 30 days
    analytics: 90 * 24 * 60 * 60 * 1000, // 90 days
    offlineQueue: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  
  // Compression
  compression: {
    enabled: true,
    algorithm: 'lz-string', // For large datasets
    threshold: 1024 // Compress if data > 1KB
  }
};

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  // Loading optimization
  loading: {
    lazyLoadImages: true,
    prefetchCritical: true,
    deferNonCritical: true,
    resourceHints: true
  },
  
  // Caching strategy
  caching: {
    staticAssets: 'cache-first',
    dynamicContent: 'network-first', 
    offlineContent: 'cache-only',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  
  // Memory management
  memory: {
    maxCachedQuestions: 100,
    maxAnalyticsEntries: 1000,
    gcInterval: 5 * 60 * 1000, // 5 minutes
    memoryThreshold: 50 * 1024 * 1024 // 50MB
  }
};

// Development Configuration
export const DEV_CONFIG = {
  debug: {
    enabled: false, // Set to true for development
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    showPerformance: false,
    mockOffline: false
  },
  
  testing: {
    enableTestMode: false,
    mockData: false,
    skipAnimations: false,
    fastMode: false
  }
};

export default {
  APP_CONFIG,
  AI_CONFIG, 
  SUPABASE_CONFIG,
  UI_CONFIG,
  STORAGE_CONFIG,
  PERFORMANCE_CONFIG,
  DEV_CONFIG
};