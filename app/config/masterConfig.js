/**
 * Master Configuration System
 * Kindergarten Math Adventure - Complete Rewrite v4
 * Comprehensive configuration for all application aspects
 */

// Application Metadata
export const APP_META = {
    name: 'Kindergarten Math Adventure',
    version: '4.0.0',
    description: 'AI-powered learning games with adaptive difficulty for children aged 3-7',
    author: 'Educational Technology Initiative',
    buildDate: new Date().toISOString(),
    environment: 'production'
};

// User Management Configuration
export const USER_CONFIG = {
    modes: {
        GUEST: 'guest',
        AUTHENTICATED: 'authenticated'
    },
    
    guestLimitations: {
        maxGames: 1, // Only Number Magic
        maxQuestionsPerSession: 10,
        maxDailyQuestions: 50,
        aiPersonalization: false,
        progressTracking: false,
        parentsMode: false,
        customization: false
    },
    
    authenticatedFeatures: {
        allGames: true,
        unlimitedQuestions: true,
        aiPersonalization: true,
        progressTracking: true,
        parentsMode: true,
        customization: true,
        cloudSync: true,
        multipleProfiles: true
    },
    
    profileTypes: {
        CHILD: 'child',
        PARENT: 'parent',
        ADMIN: 'admin'
    },
    
    ageGroups: {
        '3-4': {
            name: 'Early Learners',
            maxNumber: 10,
            preferredOperations: ['counting', 'addition_simple'],
            attentionSpan: 300, // 5 minutes
            visualComplexity: 'simple'
        },
        '4-5': {
            name: 'Pre-K Explorers', 
            maxNumber: 20,
            preferredOperations: ['addition', 'subtraction_simple', 'patterns'],
            attentionSpan: 450, // 7.5 minutes
            visualComplexity: 'moderate'
        },
        '5-6': {
            name: 'Kindergarten Stars',
            maxNumber: 50,
            preferredOperations: ['addition', 'subtraction', 'multiplication_simple', 'time_hours'],
            attentionSpan: 600, // 10 minutes
            visualComplexity: 'detailed'
        },
        '6-7': {
            name: 'Advanced Learners',
            maxNumber: 100,
            preferredOperations: ['all'],
            attentionSpan: 900, // 15 minutes
            visualComplexity: 'complex'
        }
    }
};

// Complete Games Configuration
export const GAMES_CONFIG = {
    basicArithmetic: {
        id: 'basic-arithmetic',
        name: 'Number Magic',
        icon: '🧮',
        description: 'Master addition, subtraction, multiplication, and division through magical adventures!',
        
        operations: {
            addition: {
                name: 'Addition',
                symbol: '+',
                difficulties: {
                    beginner: { range: [1, 5], operands: 2 },
                    easy: { range: [1, 10], operands: 2 },
                    medium: { range: [1, 20], operands: 2 },
                    hard: { range: [1, 50], operands: 3 },
                    expert: { range: [1, 100], operands: 3 }
                }
            },
            subtraction: {
                name: 'Subtraction',
                symbol: '−',
                difficulties: {
                    beginner: { range: [1, 5], ensurePositive: true },
                    easy: { range: [1, 10], ensurePositive: true },
                    medium: { range: [1, 20], ensurePositive: true },
                    hard: { range: [1, 50], ensurePositive: false },
                    expert: { range: [1, 100], ensurePositive: false }
                }
            },
            multiplication: {
                name: 'Multiplication',
                symbol: '×',
                difficulties: {
                    beginner: { range: [1, 3], factors: [1, 5] },
                    easy: { range: [1, 5], factors: [1, 10] },
                    medium: { range: [1, 10], factors: [1, 10] },
                    hard: { range: [1, 12], factors: [1, 12] },
                    expert: { range: [1, 15], factors: [1, 15] }
                }
            },
            division: {
                name: 'Division',
                symbol: '÷',
                difficulties: {
                    beginner: { dividends: [2, 10], divisors: [2, 5], ensureEven: true },
                    easy: { dividends: [2, 20], divisors: [2, 5], ensureEven: true },
                    medium: { dividends: [2, 50], divisors: [2, 10], ensureEven: true },
                    hard: { dividends: [2, 100], divisors: [2, 12], ensureEven: false },
                    expert: { dividends: [2, 200], divisors: [2, 15], ensureEven: false }
                }
            }
        },
        
        visualTypes: ['objects', 'dots', 'fingers', 'blocks', 'animals', 'fruits'],
        maxQuestions: { guest: 10, authenticated: 100 },
        timePerQuestion: { easy: 60, medium: 45, hard: 30 }
    },

    numberSequences: {
        id: 'number-sequences',
        name: 'Pattern Quest',
        icon: '🔮',
        description: 'Discover magical number patterns and sequences!',
        
        sequenceTypes: {
            arithmetic: {
                name: 'Counting Patterns',
                difficulties: {
                    beginner: { start: [1, 5], step: [1, 2], length: 5 },
                    easy: { start: [1, 10], step: [1, 3], length: 6 },
                    medium: { start: [1, 20], step: [2, 5], length: 7 },
                    hard: { start: [1, 50], step: [3, 10], length: 8 },
                    expert: { start: [1, 100], step: [5, 15], length: 10 }
                }
            },
            geometric: {
                name: 'Multiplying Patterns',
                difficulties: {
                    beginner: { start: [1, 3], multiplier: [2], length: 4 },
                    easy: { start: [1, 5], multiplier: [2, 3], length: 5 },
                    medium: { start: [1, 10], multiplier: [2, 4], length: 6 },
                    hard: { start: [1, 15], multiplier: [2, 5], length: 7 },
                    expert: { start: [1, 20], multiplier: [3, 6], length: 8 }
                }
            },
            fibonacci: {
                name: 'Special Patterns',
                difficulties: {
                    beginner: { start: [1, 1], length: 5 },
                    easy: { start: [1, 2], length: 6 },
                    medium: { start: [2, 3], length: 7 },
                    hard: { start: [1, 5], length: 8 },
                    expert: { start: [3, 7], length: 9 }
                }
            }
        },
        
        maxQuestions: { guest: 0, authenticated: 50 }, // Guest mode excluded
        timePerQuestion: { easy: 90, medium: 75, hard: 60 }
    },

    timeClock: {
        id: 'time-clock',
        name: 'Time Wizard',
        icon: '🕐',
        description: 'Learn to read clocks and understand time like a wizard!',
        
        timeTypes: {
            digitalClock: {
                name: 'Digital Time',
                difficulties: {
                    beginner: { format: '12h', minutes: [0], showAMPM: true },
                    easy: { format: '12h', minutes: [0, 30], showAMPM: true },
                    medium: { format: '12h', minutes: [0, 15, 30, 45], showAMPM: true },
                    hard: { format: '12h', minutes: 'any', showAMPM: true },
                    expert: { format: '24h', minutes: 'any', showAMPM: false }
                }
            },
            analogClock: {
                name: 'Analog Clock',
                difficulties: {
                    beginner: { minutes: [0], showNumbers: true, showMinuteMarks: false },
                    easy: { minutes: [0, 30], showNumbers: true, showMinuteMarks: true },
                    medium: { minutes: [0, 15, 30, 45], showNumbers: true, showMinuteMarks: true },
                    hard: { minutes: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55], showNumbers: true, showMinuteMarks: true },
                    expert: { minutes: 'any', showNumbers: false, showMinuteMarks: true }
                }
            },
            timeComparison: {
                name: 'Time Comparison',
                difficulties: {
                    beginner: { hourDifference: 3, minuteDifference: 0 },
                    easy: { hourDifference: 2, minuteDifference: 30 },
                    medium: { hourDifference: 1, minuteDifference: 15 },
                    hard: { hourDifference: 0, minuteDifference: 10 },
                    expert: { hourDifference: 0, minuteDifference: 5 }
                }
            }
        },
        
        maxQuestions: { guest: 0, authenticated: 40 },
        timePerQuestion: { easy: 120, medium: 90, hard: 60 }
    },

    moneyMath: {
        id: 'money-math',
        name: 'Coin Counter',
        icon: '💰',
        description: 'Master money counting and making change with confidence!',
        
        currencies: {
            USD: {
                name: 'US Dollar',
                symbol: '$',
                coins: [
                    { name: 'penny', value: 1, symbol: '¢' },
                    { name: 'nickel', value: 5, symbol: '¢' },
                    { name: 'dime', value: 10, symbol: '¢' },
                    { name: 'quarter', value: 25, symbol: '¢' }
                ],
                bills: [
                    { name: 'one', value: 100, symbol: '$1' },
                    { name: 'five', value: 500, symbol: '$5' },
                    { name: 'ten', value: 1000, symbol: '$10' },
                    { name: 'twenty', value: 2000, symbol: '$20' }
                ]
            }
        },
        
        moneyTypes: {
            coinCounting: {
                name: 'Count Coins',
                difficulties: {
                    beginner: { maxValue: 25, coinTypes: ['penny', 'nickel'] },
                    easy: { maxValue: 50, coinTypes: ['penny', 'nickel', 'dime'] },
                    medium: { maxValue: 100, coinTypes: ['penny', 'nickel', 'dime', 'quarter'] },
                    hard: { maxValue: 200, coinTypes: 'all', includeMultiples: true },
                    expert: { maxValue: 500, coinTypes: 'all', includeMultiples: true }
                }
            },
            makeChange: {
                name: 'Make Change',
                difficulties: {
                    beginner: { purchases: [5, 25], payments: [25, 50], exactChange: false },
                    easy: { purchases: [10, 50], payments: [50, 100], exactChange: false },
                    medium: { purchases: [25, 100], payments: [100, 200], exactChange: false },
                    hard: { purchases: [50, 200], payments: [100, 500], exactChange: true },
                    expert: { purchases: [100, 500], payments: [200, 1000], exactChange: true }
                }
            }
        },
        
        maxQuestions: { guest: 0, authenticated: 30 },
        timePerQuestion: { easy: 150, medium: 120, hard: 90 }
    }
};

// AI Learning System Configuration
export const AI_CONFIG = {
    adaptiveDifficulty: {
        enabled: true,
        analysisWindow: 5, // Questions to analyze
        adjustmentThreshold: 0.7, // Accuracy threshold for adjustment
        maxDifficultyJump: 1, // Maximum difficulty levels to skip
        stabilityPeriod: 3, // Questions before considering next adjustment
        
        performanceBands: {
            struggling: { accuracy: [0, 0.6], adjustment: -1 },
            learning: { accuracy: [0.6, 0.8], adjustment: 0 },
            mastering: { accuracy: [0.8, 0.95], adjustment: 1 },
            mastered: { accuracy: [0.95, 1.0], adjustment: 2 }
        }
    },
    
    contextualFeedback: {
        enabled: true,
        personalityTypes: ['encouraging', 'scientific', 'playful', 'wise', 'adventurous'],
        
        phraseCategories: {
            celebration: 1000, // Number of unique celebration phrases
            encouragement: 1000,
            guidance: 1000,
            curiosity: 1000,
            motivation: 1000,
            achievement: 1000,
            persistence: 1000,
            discovery: 1000,
            progress: 1000,
            mastery: 1000
        },
        
        contextFactors: [
            'current_accuracy',
            'question_difficulty', 
            'time_taken',
            'recent_performance',
            'game_type',
            'age_group',
            'time_of_day',
            'session_length',
            'consecutive_correct',
            'improvement_trend'
        ]
    },
    
    masteryTracking: {
        enabled: true,
        
        skillCategories: {
            arithmetic: ['addition', 'subtraction', 'multiplication', 'division'],
            patterns: ['arithmetic_sequences', 'geometric_sequences', 'fibonacci'],
            time: ['digital_reading', 'analog_reading', 'time_comparison'],
            money: ['coin_counting', 'bill_counting', 'making_change']
        },
        
        masteryThresholds: {
            introduced: 0.5,   // 50% accuracy over 5 questions
            developing: 0.7,   // 70% accuracy over 10 questions  
            proficient: 0.85,  // 85% accuracy over 15 questions
            mastered: 0.95     // 95% accuracy over 20 questions
        },
        
        retentionTesting: {
            enabled: true,
            interval: 24 * 60 * 60 * 1000, // 24 hours
            decayFactor: 0.1, // 10% skill decay per day without practice
            reinforcementThreshold: 0.8 // Re-test if below 80%
        }
    }
};

// Supabase Integration Configuration
export const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key',
    
    features: {
        authentication: true,
        realtime: true,
        storage: true,
        analytics: true,
        offline: true
    },
    
    tables: {
        // User management
        profiles: 'user_profiles',
        children: 'child_profiles', 
        parents: 'parent_profiles',
        
        // Learning data
        sessions: 'learning_sessions',
        attempts: 'question_attempts',
        progress: 'skill_progress',
        achievements: 'user_achievements',
        
        // Analytics
        events: 'analytics_events',
        feedback: 'user_feedback'
    },
    
    policies: {
        childProfiles: 'parent_access_only',
        learningData: 'child_owner_only',
        parentData: 'parent_owner_only'
    },
    
    offlineSync: {
        enabled: true,
        batchSize: 50,
        maxRetries: 3,
        retryDelay: 5000, // 5 seconds
        syncInterval: 30000, // 30 seconds
        maxOfflineActions: 1000
    }
};

// UI/UX Configuration
export const UI_CONFIG = {
    theme: {
        name: 'dark_material_kids',
        mode: 'dark',
        
        colors: {
            // Base Material Dark colors optimized for children
            background: {
                primary: '#0a0a1f',      // Deep space blue
                secondary: '#151533',     // Darker space blue  
                tertiary: '#1f1f3d',     // Medium space blue
                surface: '#2a2a4a'       // Light space blue
            },
            
            // Soft, eye-friendly pastels
            accent: {
                purple: '#b19cd9',        // Soft lavender
                blue: '#87ceeb',          // Sky blue
                teal: '#7dd3fc',          // Bright cyan
                green: '#86efac',         // Mint green
                orange: '#fbbf24',        // Warm orange
                pink: '#f9a8d4',          // Soft pink
                yellow: '#fde047'         // Bright yellow
            },
            
            // Text optimized for readability
            text: {
                primary: '#f8fafc',       // Pure white
                secondary: '#e2e8f0',     // Light gray
                muted: '#cbd5e1',         // Medium gray  
                accent: '#b19cd9'         // Accent purple
            },
            
            // Status colors
            status: {
                success: '#86efac',       // Mint green
                warning: '#fbbf24',       // Warm orange
                error: '#fca5a5',         // Soft red
                info: '#87ceeb'           // Sky blue
            }
        },
        
        typography: {
            fontFamily: {
                primary: ['Comic Neue', 'Nunito', 'Arial', 'sans-serif'], // Dyslexia-friendly
                display: ['Fredoka One', 'Comic Neue', 'sans-serif'],     // Fun headers
                mono: ['JetBrains Mono', 'Consolas', 'monospace']
            },
            
            fontSize: {
                xs: '0.75rem',    // 12px
                sm: '0.875rem',   // 14px
                base: '1rem',     // 16px
                lg: '1.125rem',   // 18px
                xl: '1.25rem',    // 20px
                '2xl': '1.5rem',  // 24px
                '3xl': '1.875rem', // 30px
                '4xl': '2.25rem',  // 36px
                '5xl': '3rem',     // 48px
                '6xl': '4rem'      // 64px
            }
        },
        
        animations: {
            durations: {
                fast: '150ms',
                normal: '300ms',
                slow: '500ms',
                extra: '1000ms'
            },
            
            easings: {
                smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
                bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
                elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }
        }
    },
    
    accessibility: {
        wcag21AA: true,
        features: {
            highContrast: true,
            reducedMotion: true,
            largeText: true,
            keyboardNavigation: true,
            screenReader: true,
            focusIndicators: true
        },
        
        touchTargets: {
            minimum: '44px',
            recommended: '48px',
            spacing: '8px'
        }
    },
    
    responsive: {
        breakpoints: {
            mobile: '320px',
            tablet: '768px',
            desktop: '1024px',
            wide: '1440px'
        },
        
        containers: {
            mobile: '100%',
            tablet: '640px', 
            desktop: '768px',
            wide: '1024px'
        }
    }
};

// Performance & PWA Configuration
export const PERFORMANCE_CONFIG = {
    pwa: {
        enabled: true,
        
        manifest: {
            name: 'Kindergarten Math Adventure',
            shortName: 'Math Adventure',
            description: 'AI-powered learning games for young children',
            themeColor: '#b19cd9',
            backgroundColor: '#0a0a1f',
            display: 'standalone',
            orientation: 'portrait',
            startUrl: '/',
            
            icons: [
                { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
                { src: '/icons/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
            ]
        },
        
        serviceWorker: {
            enabled: true,
            scope: '/',
            strategies: {
                pages: 'NetworkFirst',
                assets: 'CacheFirst', 
                api: 'NetworkFirst',
                images: 'CacheFirst'
            }
        }
    },
    
    optimization: {
        lazyLoading: true,
        imageOptimization: true,
        bundleSplitting: true,
        preloading: ['critical-css', 'fonts'],
        
        caching: {
            staticAssets: 7 * 24 * 60 * 60 * 1000, // 7 days
            apiResponses: 5 * 60 * 1000,           // 5 minutes
            userData: 24 * 60 * 60 * 1000          // 24 hours
        }
    }
};

// Development & Testing Configuration
export const DEV_CONFIG = {
    debug: {
        enabled: false, // Set to true for debugging in browser
        logLevel: 'info',
        showPerformance: true,
        mockData: false
    },
    
    testing: {
        unit: {
            framework: 'vitest',
            coverage: 90,
            timeout: 5000
        },
        
        e2e: {
            framework: 'playwright',
            browsers: ['chromium', 'firefox', 'webkit'],
            timeout: 30000
        },
        
        accessibility: {
            framework: 'axe-core',
            standards: ['wcag2a', 'wcag2aa', 'wcag21aa']
        }
    }
};

// Export combined configuration
export const MASTER_CONFIG = {
    APP_META,
    USER_CONFIG,
    GAMES_CONFIG,
    AI_CONFIG,
    SUPABASE_CONFIG,
    UI_CONFIG,
    PERFORMANCE_CONFIG,
    DEV_CONFIG
};

export default MASTER_CONFIG;