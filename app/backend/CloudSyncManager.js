/**
 * CloudSyncManager.js - Cloud data synchronization
 * Syncs user progress, settings, and achievements to Supabase
 */

import { supabaseClient } from './SupabaseClient.js';
import { TABLES } from '../config/supabase.config.js';

export class CloudSyncManager {
    constructor(authManager) {
        this.authManager = authManager;
        this.supabase = null;
        this.syncInProgress = false;
        this.lastSyncTime = null;
        this.autoSyncEnabled = true;
        this.syncInterval = null;
    }

    /**
     * Initialize cloud sync manager
     */
    async init() {
        this.supabase = supabaseClient.getClient();

        // Set up auto-sync (every 5 minutes)
        if (this.autoSyncEnabled) {
            this.startAutoSync(5 * 60 * 1000); // 5 minutes
        }

        console.log('✅ Cloud sync manager initialized');
    }

    /**
     * Start auto-sync
     */
    startAutoSync(interval) {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        this.syncInterval = setInterval(async () => {
            if (this.authManager.isAuthenticated() && !this.syncInProgress) {
                await this.syncAll();
            }
        }, interval);
    }

    /**
     * Stop auto-sync
     */
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    /**
     * Sync all data (upload local data to cloud)
     */
    async syncAll() {
        if (!this.authManager.isAuthenticated()) {
            console.log('⚠️ Cannot sync: User not authenticated');
            return { success: false, error: 'Not authenticated' };
        }

        if (this.syncInProgress) {
            console.log('⚠️ Sync already in progress');
            return { success: false, error: 'Sync in progress' };
        }

        this.syncInProgress = true;
        const user = this.authManager.getCurrentUser();

        try {
            // Sync user progress
            await this.syncUserProgress(user.id);

            // Sync settings
            await this.syncUserSettings(user.id);

            // Sync achievements
            await this.syncUserAchievements(user.id);

            // Sync game sessions
            await this.syncGameSessions(user.id);

            this.lastSyncTime = new Date();
            this.syncInProgress = false;

            console.log('✅ Cloud sync completed');
            return { success: true, syncTime: this.lastSyncTime };
        } catch (error) {
            console.error('❌ Cloud sync failed:', error);
            this.syncInProgress = false;
            return { success: false, error: error.message };
        }
    }

    /**
     * Sync user progress (stats, games played, accuracy, etc.)
     */
    async syncUserProgress(userId) {
        try {
            // Get local progress from localStorage
            const localProgress = this.getLocalProgress();

            if (!localProgress) return;

            // Upsert to database
            const { error } = await this.supabase
                .from(TABLES.USER_PROGRESS)
                .upsert({
                    user_id: userId,
                    total_games_played: localProgress.gamesPlayed || 0,
                    total_correct_answers: localProgress.correctAnswers || 0,
                    total_questions_answered: localProgress.questionsAnswered || 0,
                    overall_accuracy: localProgress.accuracy || 0,
                    total_time_spent: localProgress.timeSpent || 0,
                    best_streak: localProgress.bestStreak || 0,
                    current_streak: localProgress.currentStreak || 0,
                    level: localProgress.level || 1,
                    experience_points: localProgress.xp || 0,
                    last_played: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });

            if (error) throw error;

            console.log('✅ User progress synced');
        } catch (error) {
            console.error('❌ Failed to sync user progress:', error);
            throw error;
        }
    }

    /**
     * Sync user settings
     */
    async syncUserSettings(userId) {
        try {
            // Get local settings from localStorage
            const localSettings = this.getLocalSettings();

            if (!localSettings) return;

            // Upsert to database
            const { error } = await this.supabase
                .from(TABLES.USER_SETTINGS)
                .upsert({
                    user_id: userId,
                    sound_enabled: localSettings.sound_enabled ?? true,
                    music_enabled: localSettings.music_enabled ?? true,
                    vibration_enabled: localSettings.vibration_enabled ?? true,
                    hints_enabled: localSettings.hints_enabled ?? true,
                    confetti_enabled: localSettings.confetti_enabled ?? true,
                    age_group: localSettings.age_group || '4-5',
                    text_size: localSettings.text_size || 'medium',
                    high_contrast: localSettings.high_contrast ?? false,
                    reduced_motion: localSettings.reduced_motion ?? false,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });

            if (error) throw error;

            console.log('✅ User settings synced');
        } catch (error) {
            console.error('❌ Failed to sync user settings:', error);
            throw error;
        }
    }

    /**
     * Sync user achievements
     */
    async syncUserAchievements(userId) {
        try {
            // Get local achievements from localStorage
            const localAchievements = this.getLocalAchievements();

            if (!localAchievements || localAchievements.length === 0) return;

            // Prepare achievement records
            const achievementRecords = localAchievements.map(achievement => ({
                user_id: userId,
                achievement_id: achievement.id,
                achievement_name: achievement.name,
                unlocked_at: achievement.unlockedAt || new Date().toISOString(),
                progress: achievement.progress || 100
            }));

            // Upsert achievements
            const { error } = await this.supabase
                .from(TABLES.ACHIEVEMENTS)
                .upsert(achievementRecords, {
                    onConflict: 'user_id,achievement_id'
                });

            if (error) throw error;

            console.log(`✅ ${achievementRecords.length} achievements synced`);
        } catch (error) {
            console.error('❌ Failed to sync achievements:', error);
            throw error;
        }
    }

    /**
     * Sync game sessions
     */
    async syncGameSessions(userId) {
        try {
            // Get local game sessions from localStorage
            const localSessions = this.getLocalGameSessions();

            if (!localSessions || localSessions.length === 0) return;

            // Get sessions that haven't been synced yet
            const unsyncedSessions = localSessions.filter(session => !session.synced);

            if (unsyncedSessions.length === 0) return;

            // Prepare session records
            const sessionRecords = unsyncedSessions.map(session => ({
                user_id: userId,
                game_type: session.gameType,
                session_date: session.date,
                questions_answered: session.questionsAnswered || 0,
                correct_answers: session.correctAnswers || 0,
                accuracy: session.accuracy || 0,
                time_spent: session.timeSpent || 0,
                longest_streak: session.longestStreak || 0,
                hints_used: session.hintsUsed || 0,
                score: session.score || 0
            }));

            // Insert sessions
            const { data, error } = await this.supabase
                .from(TABLES.GAME_SESSIONS)
                .insert(sessionRecords)
                .select();

            if (error) throw error;

            // Mark sessions as synced in localStorage
            this.markSessionsAsSynced(unsyncedSessions);

            console.log(`✅ ${sessionRecords.length} game sessions synced`);
        } catch (error) {
            console.error('❌ Failed to sync game sessions:', error);
            throw error;
        }
    }

    /**
     * Download data from cloud (pull)
     */
    async downloadFromCloud(userId) {
        try {
            // Get cloud progress
            const { data: progress, error: progressError } = await this.supabase
                .from(TABLES.USER_PROGRESS)
                .select('*')
                .eq('user_id', userId)
                .single();

            if (progressError && progressError.code !== 'PGRST116') throw progressError;

            // Get cloud settings
            const { data: settings, error: settingsError } = await this.supabase
                .from(TABLES.USER_SETTINGS)
                .select('*')
                .eq('user_id', userId)
                .single();

            if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;

            // Get cloud achievements
            const { data: achievements, error: achievementsError } = await this.supabase
                .from(TABLES.ACHIEVEMENTS)
                .select('*')
                .eq('user_id', userId);

            if (achievementsError) throw achievementsError;

            // Merge with local data (cloud takes precedence if newer)
            this.mergeCloudData({
                progress,
                settings,
                achievements
            });

            console.log('✅ Cloud data downloaded and merged');
            return { success: true };
        } catch (error) {
            console.error('❌ Failed to download from cloud:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Merge cloud data with local data
     */
    mergeCloudData(cloudData) {
        const { progress, settings, achievements } = cloudData;

        // Merge progress
        if (progress) {
            const localProgress = this.getLocalProgress() || {};
            const merged = {
                gamesPlayed: Math.max(progress.total_games_played || 0, localProgress.gamesPlayed || 0),
                correctAnswers: Math.max(progress.total_correct_answers || 0, localProgress.correctAnswers || 0),
                questionsAnswered: Math.max(progress.total_questions_answered || 0, localProgress.questionsAnswered || 0),
                accuracy: Math.max(progress.overall_accuracy || 0, localProgress.accuracy || 0),
                timeSpent: Math.max(progress.total_time_spent || 0, localProgress.timeSpent || 0),
                bestStreak: Math.max(progress.best_streak || 0, localProgress.bestStreak || 0),
                currentStreak: progress.current_streak || localProgress.currentStreak || 0,
                level: Math.max(progress.level || 1, localProgress.level || 1),
                xp: Math.max(progress.experience_points || 0, localProgress.xp || 0)
            };
            localStorage.setItem('km-user-progress', JSON.stringify(merged));
        }

        // Merge settings (cloud takes precedence)
        if (settings) {
            localStorage.setItem('km-settings', JSON.stringify({
                sound_enabled: settings.sound_enabled,
                music_enabled: settings.music_enabled,
                vibration_enabled: settings.vibration_enabled,
                hints_enabled: settings.hints_enabled,
                confetti_enabled: settings.confetti_enabled,
                age_group: settings.age_group,
                text_size: settings.text_size,
                high_contrast: settings.high_contrast,
                reduced_motion: settings.reduced_motion
            }));
        }

        // Merge achievements
        if (achievements && achievements.length > 0) {
            const localAchievements = this.getLocalAchievements() || [];
            const achievementMap = new Map();

            // Add cloud achievements
            achievements.forEach(ach => {
                achievementMap.set(ach.achievement_id, {
                    id: ach.achievement_id,
                    name: ach.achievement_name,
                    unlockedAt: ach.unlocked_at,
                    progress: ach.progress
                });
            });

            // Add local achievements (if not in cloud)
            localAchievements.forEach(ach => {
                if (!achievementMap.has(ach.id)) {
                    achievementMap.set(ach.id, ach);
                }
            });

            localStorage.setItem('km-achievements', JSON.stringify(Array.from(achievementMap.values())));
        }
    }

    /**
     * Helper: Get local progress from localStorage
     */
    getLocalProgress() {
        const stored = localStorage.getItem('km-user-progress');
        return stored ? JSON.parse(stored) : null;
    }

    /**
     * Helper: Get local settings from localStorage
     */
    getLocalSettings() {
        const stored = localStorage.getItem('km-settings');
        return stored ? JSON.parse(stored) : null;
    }

    /**
     * Helper: Get local achievements from localStorage
     */
    getLocalAchievements() {
        const stored = localStorage.getItem('km-achievements');
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Helper: Get local game sessions from localStorage
     */
    getLocalGameSessions() {
        const stored = localStorage.getItem('km-game-sessions');
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Helper: Mark sessions as synced
     */
    markSessionsAsSynced(sessions) {
        const allSessions = this.getLocalGameSessions();
        sessions.forEach(session => {
            const index = allSessions.findIndex(s => s.date === session.date && s.gameType === session.gameType);
            if (index !== -1) {
                allSessions[index].synced = true;
            }
        });
        localStorage.setItem('km-game-sessions', JSON.stringify(allSessions));
    }

    /**
     * Get last sync time
     */
    getLastSyncTime() {
        return this.lastSyncTime;
    }

    /**
     * Force sync now
     */
    async forceSyncNow() {
        return await this.syncAll();
    }
}
