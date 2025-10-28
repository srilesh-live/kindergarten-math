/**
 * Supabase Database Integration
 * Handles user authentication, data storage, and analytics with offline support
 */

import { SUPABASE_CONFIG, DATABASE_SCHEMA, OFFLINE_CONFIG } from './config.js';

export class SupabaseManager {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.isOnline = navigator.onLine;
        this.offlineQueue = [];
        this.localStoragePrefix = 'kindergarten_math_';
        
        this.initializeClient();
        this.setupOfflineHandlers();
        this.initializeOfflineStorage();
    }

    /**
     * Initialize Supabase client
     */
    async initializeClient() {
        try {
            // Check if Supabase is available (will load from CDN)
            if (typeof window.supabase !== 'undefined') {
                this.supabase = window.supabase.createClient(
                    SUPABASE_CONFIG.url,
                    SUPABASE_CONFIG.anonKey,
                    {
                        auth: {
                            persistSession: true,
                            storageKey: `${this.localStoragePrefix}auth`,
                            storage: window.localStorage
                        },
                        realtime: {
                            params: {
                                eventsPerSecond: 2 // Limit for free tier
                            }
                        }
                    }
                );

                // Listen for auth state changes
                this.supabase.auth.onAuthStateChange((event, session) => {
                    this.handleAuthStateChange(event, session);
                });

                console.log('✅ Supabase client initialized');
            } else {
                console.warn('⚠️ Supabase client not available - running in offline mode');
                this.fallbackToOfflineMode();
            }
        } catch (error) {
            console.error('❌ Failed to initialize Supabase:', error);
            this.fallbackToOfflineMode();
        }
    }

    /**
     * Setup offline/online event handlers
     */
    setupOfflineHandlers() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Back online - syncing data...');
            this.syncOfflineQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📱 Offline mode activated');
        });
    }

    /**
     * Initialize offline storage structure
     */
    initializeOfflineStorage() {
        const offlineData = this.getOfflineData();
        
        if (!offlineData.users) {
            this.setOfflineData('users', {});
        }
        if (!offlineData.sessions) {
            this.setOfflineData('sessions', []);
        }
        if (!offlineData.attempts) {
            this.setOfflineData('attempts', []);
        }
    }

    /**
     * Handle authentication state changes
     */
    handleAuthStateChange(event, session) {
        if (event === 'SIGNED_IN') {
            this.currentUser = session.user;
            console.log('✅ User signed in:', this.currentUser.id);
            this.syncUserData();
        } else if (event === 'SIGNED_OUT') {
            this.currentUser = null;
            console.log('👋 User signed out');
        }
    }

    /**
     * Create anonymous user (for demo purposes)
     */
    async createAnonymousUser() {
        try {
            if (!this.supabase) {
                return this.createOfflineUser();
            }

            // Generate anonymous user data
            const anonymousData = {
                is_anonymous: true,
                age_group: 'kindergarten',
                created_at: new Date().toISOString(),
                settings: {
                    theme: 'dark_material',
                    sound_enabled: true,
                    difficulty_preference: 'adaptive'
                }
            };

            if (SUPABASE_CONFIG.enableAuth) {
                const { data, error } = await this.supabase.auth.signInAnonymously();
                if (error) throw error;
                
                // Store additional user data
                await this.updateUserProfile(anonymousData);
                return data.user;
            } else {
                // Create offline anonymous user
                return this.createOfflineUser(anonymousData);
            }
        } catch (error) {
            console.error('Failed to create anonymous user:', error);
            return this.createOfflineUser();
        }
    }

    /**
     * Create offline user for demo mode
     */
    createOfflineUser(userData = {}) {
        const offlineUser = {
            id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            is_anonymous: true,
            age_group: 'kindergarten',
            created_at: new Date().toISOString(),
            settings: {
                theme: 'dark_material',
                sound_enabled: true,
                difficulty_preference: 'adaptive'
            },
            ...userData
        };

        // Store in localStorage
        this.setOfflineData(`user_${offlineUser.id}`, offlineUser);
        this.currentUser = offlineUser;
        
        console.log('👤 Created offline user:', offlineUser.id);
        return offlineUser;
    }

    /**
     * Update user profile data
     */
    async updateUserProfile(profileData) {
        try {
            if (!this.currentUser) {
                throw new Error('No authenticated user');
            }

            if (!this.supabase || !this.isOnline) {
                return this.updateOfflineUserProfile(profileData);
            }

            const { data, error } = await this.supabase
                .from('users')
                .upsert({
                    id: this.currentUser.id,
                    ...profileData,
                    updated_at: new Date().toISOString()
                })
                .select();

            if (error) throw error;

            console.log('✅ User profile updated');
            return data[0];
        } catch (error) {
            console.error('Failed to update user profile:', error);
            return this.updateOfflineUserProfile(profileData);
        }
    }

    /**
     * Update offline user profile
     */
    updateOfflineUserProfile(profileData) {
        if (!this.currentUser) return null;

        const updatedUser = {
            ...this.currentUser,
            ...profileData,
            updated_at: new Date().toISOString()
        };

        this.setOfflineData(`user_${this.currentUser.id}`, updatedUser);
        this.currentUser = updatedUser;
        
        return updatedUser;
    }

    /**
     * Start learning session
     */
    async startLearningSession(gameType, difficulty) {
        try {
            if (!this.currentUser) {
                await this.createAnonymousUser();
            }

            const session = {
                id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                user_id: this.currentUser.id,
                game_type: gameType,
                difficulty_level: difficulty,
                started_at: new Date().toISOString(),
                questions_attempted: 0,
                questions_correct: 0,
                total_time_seconds: 0,
                is_completed: false
            };

            if (this.supabase && this.isOnline) {
                const { data, error } = await this.supabase
                    .from('learning_sessions')
                    .insert(session)
                    .select();

                if (error) throw error;
                console.log('✅ Learning session started online');
                return data[0];
            } else {
                // Store offline
                const sessions = this.getOfflineData().sessions || [];
                sessions.push(session);
                this.setOfflineData('sessions', sessions);
                
                console.log('📱 Learning session started offline');
                return session;
            }
        } catch (error) {
            console.error('Failed to start learning session:', error);
            // Fallback to offline mode
            const session = {
                id: `offline_session_${Date.now()}`,
                user_id: this.currentUser?.id || 'anonymous',
                game_type: gameType,
                difficulty_level: difficulty,
                started_at: new Date().toISOString(),
                questions_attempted: 0,
                questions_correct: 0,
                total_time_seconds: 0,
                is_completed: false
            };
            
            const sessions = this.getOfflineData().sessions || [];
            sessions.push(session);
            this.setOfflineData('sessions', sessions);
            
            return session;
        }
    }

    /**
     * Record question attempt
     */
    async recordQuestionAttempt(sessionId, questionData, userAnswer, isCorrect, timeSpent) {
        const attempt = {
            id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            session_id: sessionId,
            question_type: questionData.type,
            question_data: questionData,
            user_answer: userAnswer,
            correct_answer: questionData.correctAnswer,
            is_correct: isCorrect,
            time_spent_seconds: timeSpent,
            created_at: new Date().toISOString(),
            difficulty_level: questionData.difficulty || 'medium'
        };

        try {
            if (this.supabase && this.isOnline) {
                const { data, error } = await this.supabase
                    .from('question_attempts')
                    .insert(attempt)
                    .select();

                if (error) throw error;
                
                // Update session statistics
                await this.updateSessionStats(sessionId, isCorrect, timeSpent);
                
                return data[0];
            } else {
                // Store offline
                const attempts = this.getOfflineData().attempts || [];
                attempts.push(attempt);
                this.setOfflineData('attempts', attempts);
                
                // Update offline session stats
                this.updateOfflineSessionStats(sessionId, isCorrect, timeSpent);
                
                return attempt;
            }
        } catch (error) {
            console.error('Failed to record question attempt:', error);
            
            // Fallback to offline storage
            const attempts = this.getOfflineData().attempts || [];
            attempts.push(attempt);
            this.setOfflineData('attempts', attempts);
            
            return attempt;
        }
    }

    /**
     * Update session statistics
     */
    async updateSessionStats(sessionId, isCorrect, timeSpent) {
        try {
            if (this.supabase && this.isOnline) {
                const { data, error } = await this.supabase
                    .rpc('update_session_stats', {
                        session_id: sessionId,
                        is_correct: isCorrect,
                        time_spent: timeSpent
                    });

                if (error) throw error;
                return data;
            } else {
                return this.updateOfflineSessionStats(sessionId, isCorrect, timeSpent);
            }
        } catch (error) {
            console.error('Failed to update session stats:', error);
            return this.updateOfflineSessionStats(sessionId, isCorrect, timeSpent);
        }
    }

    /**
     * Update offline session statistics
     */
    updateOfflineSessionStats(sessionId, isCorrect, timeSpent) {
        const sessions = this.getOfflineData().sessions || [];
        const sessionIndex = sessions.findIndex(s => s.id === sessionId);
        
        if (sessionIndex >= 0) {
            sessions[sessionIndex].questions_attempted += 1;
            if (isCorrect) {
                sessions[sessionIndex].questions_correct += 1;
            }
            sessions[sessionIndex].total_time_seconds += timeSpent;
            
            this.setOfflineData('sessions', sessions);
            return sessions[sessionIndex];
        }
        
        return null;
    }

    /**
     * Complete learning session
     */
    async completeLearningSession(sessionId, finalStats = {}) {
        try {
            const completionData = {
                is_completed: true,
                completed_at: new Date().toISOString(),
                ...finalStats
            };

            if (this.supabase && this.isOnline) {
                const { data, error } = await this.supabase
                    .from('learning_sessions')
                    .update(completionData)
                    .eq('id', sessionId)
                    .select();

                if (error) throw error;
                return data[0];
            } else {
                // Update offline session
                const sessions = this.getOfflineData().sessions || [];
                const sessionIndex = sessions.findIndex(s => s.id === sessionId);
                
                if (sessionIndex >= 0) {
                    sessions[sessionIndex] = { ...sessions[sessionIndex], ...completionData };
                    this.setOfflineData('sessions', sessions);
                    return sessions[sessionIndex];
                }
            }
        } catch (error) {
            console.error('Failed to complete learning session:', error);
            return null;
        }
    }

    /**
     * Get user analytics and progress
     */
    async getUserAnalytics(timeRange = '7d') {
        try {
            if (this.supabase && this.isOnline) {
                const { data, error } = await this.supabase
                    .rpc('get_user_analytics', {
                        user_id: this.currentUser?.id,
                        time_range: timeRange
                    });

                if (error) throw error;
                return data;
            } else {
                return this.getOfflineAnalytics(timeRange);
            }
        } catch (error) {
            console.error('Failed to get user analytics:', error);
            return this.getOfflineAnalytics(timeRange);
        }
    }

    /**
     * Generate offline analytics from local data
     */
    getOfflineAnalytics(timeRange) {
        const sessions = this.getOfflineData().sessions || [];
        const attempts = this.getOfflineData().attempts || [];
        
        // Filter by time range
        const cutoffDate = new Date();
        if (timeRange === '7d') cutoffDate.setDate(cutoffDate.getDate() - 7);
        else if (timeRange === '30d') cutoffDate.setDate(cutoffDate.getDate() - 30);
        
        const recentSessions = sessions.filter(s => 
            new Date(s.started_at) >= cutoffDate
        );
        
        const recentAttempts = attempts.filter(a => 
            new Date(a.created_at) >= cutoffDate
        );

        // Calculate analytics
        const totalQuestions = recentAttempts.length;
        const correctAnswers = recentAttempts.filter(a => a.is_correct).length;
        const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
        
        const totalTime = recentSessions.reduce((sum, s) => sum + (s.total_time_seconds || 0), 0);
        const avgTimePerQuestion = totalQuestions > 0 ? totalTime / totalQuestions : 0;

        // Game type breakdown
        const gameTypeStats = {};
        recentSessions.forEach(session => {
            const gameType = session.game_type;
            if (!gameTypeStats[gameType]) {
                gameTypeStats[gameType] = { sessions: 0, questions: 0, correct: 0 };
            }
            gameTypeStats[gameType].sessions += 1;
        });

        recentAttempts.forEach(attempt => {
            const session = sessions.find(s => s.id === attempt.session_id);
            if (session) {
                const gameType = session.game_type;
                if (gameTypeStats[gameType]) {
                    gameTypeStats[gameType].questions += 1;
                    if (attempt.is_correct) {
                        gameTypeStats[gameType].correct += 1;
                    }
                }
            }
        });

        return {
            total_sessions: recentSessions.length,
            total_questions: totalQuestions,
            correct_answers: correctAnswers,
            accuracy_percentage: Math.round(accuracy * 100),
            total_time_minutes: Math.round(totalTime / 60),
            avg_time_per_question: Math.round(avgTimePerQuestion),
            game_type_stats: gameTypeStats,
            improvement_trend: this.calculateImprovementTrend(recentAttempts),
            strengths: this.identifyStrengths(gameTypeStats),
            areas_for_improvement: this.identifyWeakAreas(gameTypeStats)
        };
    }

    /**
     * Calculate improvement trend from attempts
     */
    calculateImprovementTrend(attempts) {
        if (attempts.length < 5) return 'insufficient_data';
        
        // Split attempts into first and second half
        const midPoint = Math.floor(attempts.length / 2);
        const firstHalf = attempts.slice(0, midPoint);
        const secondHalf = attempts.slice(midPoint);
        
        const firstAccuracy = firstHalf.filter(a => a.is_correct).length / firstHalf.length;
        const secondAccuracy = secondHalf.filter(a => a.is_correct).length / secondHalf.length;
        
        if (secondAccuracy > firstAccuracy + 0.1) return 'improving';
        if (secondAccuracy < firstAccuracy - 0.1) return 'declining';
        return 'stable';
    }

    /**
     * Identify user's strongest areas
     */
    identifyStrengths(gameTypeStats) {
        return Object.entries(gameTypeStats)
            .filter(([_, stats]) => stats.questions > 0)
            .filter(([_, stats]) => (stats.correct / stats.questions) >= 0.8)
            .map(([gameType, _]) => gameType)
            .slice(0, 3);
    }

    /**
     * Identify areas needing improvement
     */
    identifyWeakAreas(gameTypeStats) {
        return Object.entries(gameTypeStats)
            .filter(([_, stats]) => stats.questions > 0)
            .filter(([_, stats]) => (stats.correct / stats.questions) < 0.6)
            .map(([gameType, _]) => gameType)
            .slice(0, 3);
    }

    /**
     * Offline data management
     */
    getOfflineData() {
        try {
            const data = localStorage.getItem(`${this.localStoragePrefix}offline_data`);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Failed to get offline data:', error);
            return {};
        }
    }

    setOfflineData(key, value) {
        try {
            const data = this.getOfflineData();
            data[key] = value;
            localStorage.setItem(`${this.localStoragePrefix}offline_data`, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to set offline data:', error);
        }
    }

    /**
     * Sync offline queue when back online
     */
    async syncOfflineQueue() {
        if (!this.supabase || this.offlineQueue.length === 0) return;

        console.log(`🔄 Syncing ${this.offlineQueue.length} offline actions...`);
        
        for (const action of this.offlineQueue) {
            try {
                await this.executeQueuedAction(action);
            } catch (error) {
                console.error('Failed to sync action:', action, error);
            }
        }
        
        this.offlineQueue = [];
        console.log('✅ Offline queue synced');
    }

    /**
     * Execute queued offline action
     */
    async executeQueuedAction(action) {
        switch (action.type) {
            case 'insert':
                return await this.supabase
                    .from(action.table)
                    .insert(action.data);
            
            case 'update':
                return await this.supabase
                    .from(action.table)
                    .update(action.data)
                    .eq('id', action.id);
            
            default:
                console.warn('Unknown action type:', action.type);
        }
    }

    /**
     * Fallback to offline mode
     */
    fallbackToOfflineMode() {
        console.log('📱 Running in offline mode');
        this.isOnline = false;
        
        // Create a mock user for demo purposes
        this.createAnonymousUser();
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
     * Sign out user
     */
    async signOut() {
        try {
            if (this.supabase) {
                await this.supabase.auth.signOut();
            }
            this.currentUser = null;
            console.log('👋 User signed out');
        } catch (error) {
            console.error('Failed to sign out:', error);
            this.currentUser = null;
        }
    }
}

export default SupabaseManager;