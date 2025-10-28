/**
 * LeaderboardManager.js - Global and friend leaderboards
 * Manages rankings, scores, and leaderboard updates
 */

import { supabaseClient } from './SupabaseClient.js';
import { TABLES, CHANNELS } from '../config/supabase.config.js';

export class LeaderboardManager {
    constructor(authManager) {
        this.authManager = authManager;
        this.supabase = null;
        this.realtimeChannel = null;
        this.leaderboardCallbacks = [];
    }

    /**
     * Initialize leaderboard manager
     */
    async init() {
        this.supabase = supabaseClient.getClient();

        if (!this.supabase) {
            console.log('ℹ️ Leaderboard disabled (Supabase not available)');
            return;
        }

        // Subscribe to real-time leaderboard updates
        this.subscribeToUpdates();

        console.log('✅ Leaderboard manager initialized');
    }

    /**
     * Subscribe to real-time leaderboard updates
     */
    subscribeToUpdates() {
        if (!this.supabase) return;
        
        this.realtimeChannel = this.supabase
            .channel(CHANNELS.LEADERBOARD)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: TABLES.LEADERBOARD
                },
                (payload) => {
                    console.log('Leaderboard update:', payload);
                    this.notifyLeaderboardUpdate(payload);
                }
            )
            .subscribe();
    }

    /**
     * Update user's leaderboard entry
     */
    async updateLeaderboardEntry(userId, stats) {
        try {
            // Get user profile for display name
            const { data: profile } = await this.supabase
                .from(TABLES.USER_PROFILES)
                .select('display_name, avatar')
                .eq('user_id', userId)
                .single();

            // Calculate total score
            const totalScore = this.calculateTotalScore(stats);

            // Upsert leaderboard entry
            const { data, error } = await this.supabase
                .from(TABLES.LEADERBOARD)
                .upsert({
                    user_id: userId,
                    display_name: profile?.display_name || 'Anonymous',
                    avatar: profile?.avatar || '👶',
                    total_score: totalScore,
                    total_games: stats.gamesPlayed || 0,
                    accuracy: stats.accuracy || 0,
                    best_streak: stats.bestStreak || 0,
                    achievements_count: stats.achievementsCount || 0,
                    level: stats.level || 1,
                    experience_points: stats.xp || 0,
                    last_updated: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                })
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Leaderboard entry updated');
            return { success: true, entry: data };
        } catch (error) {
            console.error('❌ Failed to update leaderboard:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Calculate total score based on stats
     */
    calculateTotalScore(stats) {
        const {
            gamesPlayed = 0,
            correctAnswers = 0,
            accuracy = 0,
            bestStreak = 0,
            achievementsCount = 0,
            xp = 0
        } = stats;

        // Score formula: (games * 10) + (correct * 5) + (accuracy * 2) + (streak * 50) + (achievements * 100) + xp
        return (
            (gamesPlayed * 10) +
            (correctAnswers * 5) +
            (accuracy * 2) +
            (bestStreak * 50) +
            (achievementsCount * 100) +
            xp
        );
    }

    /**
     * Get global leaderboard (top 100)
     */
    async getGlobalLeaderboard(limit = 100, offset = 0) {
        try {
            const { data, error, count } = await this.supabase
                .from(TABLES.LEADERBOARD)
                .select('*', { count: 'exact' })
                .order('total_score', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            // Add rank to each entry
            const rankedData = data.map((entry, index) => ({
                ...entry,
                rank: offset + index + 1
            }));

            return {
                success: true,
                leaderboard: rankedData,
                total: count
            };
        } catch (error) {
            console.error('❌ Failed to get global leaderboard:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get user's rank and position
     */
    async getUserRank(userId) {
        try {
            // Get user's score
            const { data: userEntry, error: userError } = await this.supabase
                .from(TABLES.LEADERBOARD)
                .select('total_score')
                .eq('user_id', userId)
                .single();

            if (userError) throw userError;

            if (!userEntry) {
                return { success: true, rank: null };
            }

            // Count users with higher scores
            const { count, error: countError } = await this.supabase
                .from(TABLES.LEADERBOARD)
                .select('*', { count: 'exact', head: true })
                .gt('total_score', userEntry.total_score);

            if (countError) throw countError;

            const rank = count + 1;

            return { success: true, rank, totalScore: userEntry.total_score };
        } catch (error) {
            console.error('❌ Failed to get user rank:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get leaderboard filtered by age group
     */
    async getLeaderboardByAgeGroup(ageGroup, limit = 50) {
        try {
            // Join with user_profiles to filter by age_group
            const { data, error } = await this.supabase
                .from(TABLES.LEADERBOARD)
                .select(`
                    *,
                    user_profiles!inner(age_group)
                `)
                .eq('user_profiles.age_group', ageGroup)
                .order('total_score', { ascending: false })
                .limit(limit);

            if (error) throw error;

            // Add rank
            const rankedData = data.map((entry, index) => ({
                ...entry,
                rank: index + 1
            }));

            return { success: true, leaderboard: rankedData };
        } catch (error) {
            console.error('❌ Failed to get age group leaderboard:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get leaderboard for specific game type
     */
    async getGameTypeLeaderboard(gameType, limit = 50) {
        try {
            // Get best performers for specific game type
            const { data, error } = await this.supabase
                .rpc('get_game_type_leaderboard', {
                    game_type_param: gameType,
                    limit_param: limit
                });

            if (error) throw error;

            return { success: true, leaderboard: data };
        } catch (error) {
            console.error('❌ Failed to get game type leaderboard:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get leaderboard around user (show nearby players)
     */
    async getLeaderboardAroundUser(userId, range = 10) {
        try {
            // Get user's rank
            const rankResult = await this.getUserRank(userId);
            
            if (!rankResult.success || !rankResult.rank) {
                return { success: false, error: 'User not found in leaderboard' };
            }

            const userRank = rankResult.rank;

            // Get entries around user
            const startRank = Math.max(1, userRank - range);
            const endRank = userRank + range;

            const { data, error } = await this.supabase
                .from(TABLES.LEADERBOARD)
                .select('*')
                .order('total_score', { ascending: false })
                .range(startRank - 1, endRank - 1);

            if (error) throw error;

            // Add rank
            const rankedData = data.map((entry, index) => ({
                ...entry,
                rank: startRank + index
            }));

            return {
                success: true,
                leaderboard: rankedData,
                userRank
            };
        } catch (error) {
            console.error('❌ Failed to get leaderboard around user:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get top performers of the day
     */
    async getTodayTopPerformers(limit = 10) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data, error } = await this.supabase
                .from(TABLES.GAME_SESSIONS)
                .select(`
                    user_id,
                    user_profiles(display_name, avatar),
                    score,
                    accuracy,
                    session_date
                `)
                .gte('session_date', today.toISOString())
                .order('score', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return { success: true, topPerformers: data };
        } catch (error) {
            console.error('❌ Failed to get today top performers:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Register callback for leaderboard updates
     */
    onLeaderboardUpdate(callback) {
        this.leaderboardCallbacks.push(callback);

        // Return unsubscribe function
        return () => {
            this.leaderboardCallbacks = this.leaderboardCallbacks.filter(cb => cb !== callback);
        };
    }

    /**
     * Notify all listeners of leaderboard update
     */
    notifyLeaderboardUpdate(payload) {
        this.leaderboardCallbacks.forEach(callback => {
            callback(payload);
        });
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.realtimeChannel) {
            this.supabase.removeChannel(this.realtimeChannel);
        }
    }
}
