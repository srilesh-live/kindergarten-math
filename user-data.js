/**
 * User Data Manager
 * Handles saving and loading user progress and statistics
 */

class UserDataManager {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.initializeSupabase();
    }

    /**
     * Initialize Supabase connection
     */
    async initializeSupabase() {
        // Wait for auth manager to initialize Supabase
        const checkSupabase = () => {
            if (window.authManager && window.authManager.supabase) {
                this.supabase = window.authManager.supabase;
                this.bindAuthEvents();
                return true;
            }
            return false;
        };

        if (!checkSupabase()) {
            // Wait up to 5 seconds for Supabase to initialize
            let attempts = 0;
            const interval = setInterval(() => {
                if (checkSupabase() || attempts > 50) {
                    clearInterval(interval);
                }
                attempts++;
            }, 100);
        }
    }

    /**
     * Listen for authentication state changes
     */
    bindAuthEvents() {
        if (this.supabase) {
            this.supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    this.currentUser = session?.user;
                    this.loadUserProgress();
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.clearLocalProgress();
                }
            });
        }
    }

    /**
     * Save game session to database
     */
    async saveGameSession(sessionData) {
        if (!this.currentUser || !this.supabase) {
            // Save to localStorage for guest users
            this.saveToLocalStorage('currentSession', sessionData);
            return;
        }

        try {
            const { data, error } = await this.supabase
                .from('game_sessions')
                .insert([{
                    user_id: this.currentUser.id,
                    questions_answered: sessionData.questionsAnswered || 0,
                    correct_answers: sessionData.correctAnswers || 0,
                    mistakes_made: sessionData.mistakesMade || 0,
                    session_duration: sessionData.sessionDuration || 0,
                    operation_types: JSON.stringify(sessionData.operations || []),
                    difficulty_level: sessionData.difficulty || 'medium'
                }]);

            if (error) {
                console.error('Failed to save session:', error);
                // Fallback to localStorage
                this.saveToLocalStorage('currentSession', sessionData);
            } else {
                console.log('Session saved successfully');
            }
        } catch (error) {
            console.error('Error saving session:', error);
            this.saveToLocalStorage('currentSession', sessionData);
        }
    }

    /**
     * Load user progress and statistics
     */
    async loadUserProgress() {
        if (!this.currentUser || !this.supabase) return null;

        try {
            // Load recent sessions
            const { data: sessions, error } = await this.supabase
                .from('game_sessions')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error('Failed to load user progress:', error);
                return this.loadFromLocalStorage('userProgress');
            }

            const progress = {
                totalSessions: sessions.length,
                totalQuestions: sessions.reduce((sum, s) => sum + (s.questions_answered || 0), 0),
                totalCorrect: sessions.reduce((sum, s) => sum + (s.correct_answers || 0), 0),
                totalMistakes: sessions.reduce((sum, s) => sum + (s.mistakes_made || 0), 0),
                averageAccuracy: 0,
                recentSessions: sessions.slice(0, 5),
                bestSession: null
            };

            if (progress.totalQuestions > 0) {
                progress.averageAccuracy = (progress.totalCorrect / progress.totalQuestions) * 100;
            }

            // Find best session (highest accuracy)
            progress.bestSession = sessions.reduce((best, current) => {
                const currentAccuracy = current.questions_answered > 0 
                    ? (current.correct_answers / current.questions_answered) * 100 
                    : 0;
                const bestAccuracy = best && best.questions_answered > 0 
                    ? (best.correct_answers / best.questions_answered) * 100 
                    : 0;
                
                return currentAccuracy > bestAccuracy ? current : best;
            }, null);

            // Save to localStorage as backup
            this.saveToLocalStorage('userProgress', progress);

            return progress;
        } catch (error) {
            console.error('Error loading user progress:', error);
            return this.loadFromLocalStorage('userProgress');
        }
    }

    /**
     * Save user preferences
     */
    async saveUserPreferences(preferences) {
        if (!this.currentUser || !this.supabase) {
            this.saveToLocalStorage('userPreferences', preferences);
            return;
        }

        try {
            const { data, error } = await this.supabase
                .from('user_preferences')
                .upsert([{
                    user_id: this.currentUser.id,
                    theme: preferences.theme || 'light',
                    sound_enabled: preferences.soundEnabled || true,
                    difficulty_preference: preferences.difficulty || 'medium',
                    operation_preferences: JSON.stringify(preferences.operations || ['addition']),
                    range_preferences: JSON.stringify(preferences.ranges || {}),
                    updated_at: new Date().toISOString()
                }]);

            if (error) {
                console.error('Failed to save preferences:', error);
                this.saveToLocalStorage('userPreferences', preferences);
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
            this.saveToLocalStorage('userPreferences', preferences);
        }
    }

    /**
     * Load user preferences
     */
    async loadUserPreferences() {
        if (!this.currentUser || !this.supabase) {
            return this.loadFromLocalStorage('userPreferences') || this.getDefaultPreferences();
        }

        try {
            const { data, error } = await this.supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .single();

            if (error || !data) {
                return this.loadFromLocalStorage('userPreferences') || this.getDefaultPreferences();
            }

            const preferences = {
                theme: data.theme,
                soundEnabled: data.sound_enabled,
                difficulty: data.difficulty_preference,
                operations: JSON.parse(data.operation_preferences || '["addition"]'),
                ranges: JSON.parse(data.range_preferences || '{}')
            };

            this.saveToLocalStorage('userPreferences', preferences);
            return preferences;
        } catch (error) {
            console.error('Error loading preferences:', error);
            return this.loadFromLocalStorage('userPreferences') || this.getDefaultPreferences();
        }
    }

    /**
     * Get default preferences
     */
    getDefaultPreferences() {
        return {
            theme: 'light',
            soundEnabled: true,
            difficulty: 'medium',
            operations: ['addition'],
            ranges: {
                operand1: { min: 1, max: 10 },
                operand2: { min: 1, max: 10 }
            }
        };
    }

    /**
     * Save data to localStorage
     */
    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(`mathGame_${key}`, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    /**
     * Load data from localStorage
     */
    loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(`mathGame_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return null;
        }
    }

    /**
     * Clear local progress data
     */
    clearLocalProgress() {
        const keys = ['currentSession', 'userProgress', 'userPreferences'];
        keys.forEach(key => {
            try {
                localStorage.removeItem(`mathGame_${key}`);
            } catch (error) {
                console.error('Failed to clear localStorage:', error);
            }
        });
    }

    /**
     * Export user data
     */
    async exportUserData() {
        const progress = await this.loadUserProgress();
        const preferences = await this.loadUserPreferences();
        
        return {
            progress,
            preferences,
            exportDate: new Date().toISOString(),
            userId: this.currentUser?.id
        };
    }

    /**
     * Get user statistics summary
     */
    async getUserStatsSummary() {
        const progress = await this.loadUserProgress();
        if (!progress) return null;

        return {
            totalSessions: progress.totalSessions,
            totalQuestions: progress.totalQuestions,
            averageAccuracy: Math.round(progress.averageAccuracy),
            bestAccuracy: progress.bestSession ? 
                Math.round((progress.bestSession.correct_answers / progress.bestSession.questions_answered) * 100) : 0,
            totalPlayTime: progress.recentSessions?.reduce((sum, s) => sum + (s.session_duration || 0), 0) || 0
        };
    }
}

// Initialize data manager
document.addEventListener('DOMContentLoaded', () => {
    window.userDataManager = new UserDataManager();
});