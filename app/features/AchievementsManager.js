/**
 * Achievements System
 * Tracks and awards achievements for learning milestones
 */

export class AchievementsManager {
    constructor(userManager) {
        this.userManager = userManager;
        this.achievements = this.initializeAchievements();
        this.unlockedAchievements = [];
    }

    /**
     * Initialize all available achievements
     */
    initializeAchievements() {
        return {
            // Streak Achievements
            'first_answer': {
                id: 'first_answer',
                name: 'First Step',
                description: 'Answer your first question',
                icon: '🎯',
                category: 'milestones',
                requirement: { type: 'questions_answered', count: 1 }
            },
            'streak_5': {
                id: 'streak_5',
                name: 'Hot Streak',
                description: 'Get 5 correct answers in a row',
                icon: '🔥',
                category: 'streaks',
                requirement: { type: 'streak', count: 5 }
            },
            'streak_10': {
                id: 'streak_10',
                name: 'On Fire!',
                description: 'Get 10 correct answers in a row',
                icon: '🚀',
                category: 'streaks',
                requirement: { type: 'streak', count: 10 }
            },
            'streak_20': {
                id: 'streak_20',
                name: 'Unstoppable',
                description: 'Get 20 correct answers in a row',
                icon: '⚡',
                category: 'streaks',
                requirement: { type: 'streak', count: 20 }
            },

            // Accuracy Achievements
            'perfect_session': {
                id: 'perfect_session',
                name: 'Perfect Score',
                description: 'Complete a session with 100% accuracy',
                icon: '💯',
                category: 'accuracy',
                requirement: { type: 'session_accuracy', percent: 100 }
            },
            'ace_10': {
                id: 'ace_10',
                name: 'Math Ace',
                description: 'Achieve 100% accuracy in 10 sessions',
                icon: '🏆',
                category: 'accuracy',
                requirement: { type: 'perfect_sessions', count: 10 }
            },

            // Volume Achievements
            'hundred_questions': {
                id: 'hundred_questions',
                name: 'Century',
                description: 'Answer 100 questions total',
                icon: '💯',
                category: 'volume',
                requirement: { type: 'questions_answered', count: 100 }
            },
            'five_hundred': {
                id: 'five_hundred',
                name: 'Math Marathon',
                description: 'Answer 500 questions total',
                icon: '🏃',
                category: 'volume',
                requirement: { type: 'questions_answered', count: 500 }
            },
            'thousand': {
                id: 'thousand',
                name: 'Math Master',
                description: 'Answer 1000 questions total',
                icon: '👑',
                category: 'volume',
                requirement: { type: 'questions_answered', count: 1000 }
            },

            // Game-Specific Achievements
            'arithmetic_master': {
                id: 'arithmetic_master',
                name: 'Arithmetic Expert',
                description: 'Complete 50 arithmetic sessions',
                icon: '🧮',
                category: 'games',
                requirement: { type: 'game_sessions', game: 'basic-arithmetic', count: 50 }
            },
            'pattern_pro': {
                id: 'pattern_pro',
                name: 'Pattern Pro',
                description: 'Complete 50 pattern sessions',
                icon: '🔄',
                category: 'games',
                requirement: { type: 'game_sessions', game: 'number-sequences', count: 50 }
            },
            'time_master': {
                id: 'time_master',
                name: 'Time Master',
                description: 'Complete 50 clock sessions',
                icon: '🕐',
                category: 'games',
                requirement: { type: 'game_sessions', game: 'time-clock', count: 50 }
            },
            'money_mogul': {
                id: 'money_mogul',
                name: 'Money Mogul',
                description: 'Complete 50 money math sessions',
                icon: '💰',
                category: 'games',
                requirement: { type: 'game_sessions', game: 'money-math', count: 50 }
            },
            'all_rounder': {
                id: 'all_rounder',
                name: 'All-Rounder',
                description: 'Complete at least 10 sessions in each game',
                icon: '⭐',
                category: 'games',
                requirement: { type: 'all_games', count: 10 }
            },

            // Speed Achievements
            'speed_demon': {
                id: 'speed_demon',
                name: 'Speed Demon',
                description: 'Answer 10 questions correctly under 5 seconds each',
                icon: '⚡',
                category: 'speed',
                requirement: { type: 'fast_answers', count: 10, time: 5000 }
            },

            // Difficulty Achievements
            'challenge_accepted': {
                id: 'challenge_accepted',
                name: 'Challenge Accepted',
                description: 'Complete a challenging difficulty session',
                icon: '🎯',
                category: 'difficulty',
                requirement: { type: 'difficulty_completed', level: 'challenging' }
            },

            // Consistency Achievements
            'daily_learner': {
                id: 'daily_learner',
                name: 'Daily Learner',
                description: 'Practice 3 days in a row',
                icon: '📅',
                category: 'consistency',
                requirement: { type: 'consecutive_days', count: 3 }
            },
            'weekly_warrior': {
                id: 'weekly_warrior',
                name: 'Weekly Warrior',
                description: 'Practice 7 days in a row',
                icon: '🗓️',
                category: 'consistency',
                requirement: { type: 'consecutive_days', count: 7 }
            },
            'month_master': {
                id: 'month_master',
                name: 'Month Master',
                description: 'Practice 30 days in a row',
                icon: '📆',
                category: 'consistency',
                requirement: { type: 'consecutive_days', count: 30 }
            }
        };
    }

    /**
     * Check for newly unlocked achievements
     */
    checkAchievements(stats) {
        const newlyUnlocked = [];

        for (const [id, achievement] of Object.entries(this.achievements)) {
            // Skip if already unlocked
            if (this.isUnlocked(id)) continue;

            // Check if requirement is met
            if (this.checkRequirement(achievement.requirement, stats)) {
                this.unlockAchievement(id);
                newlyUnlocked.push(achievement);
            }
        }

        return newlyUnlocked;
    }

    /**
     * Check if specific requirement is met
     */
    checkRequirement(requirement, stats) {
        switch (requirement.type) {
            case 'questions_answered':
                return stats.totalQuestions >= requirement.count;

            case 'streak':
                return stats.currentStreak >= requirement.count;

            case 'session_accuracy':
                return stats.lastSessionAccuracy >= requirement.percent;

            case 'perfect_sessions':
                return stats.perfectSessions >= requirement.count;

            case 'game_sessions':
                return (stats.gameSessions[requirement.game] || 0) >= requirement.count;

            case 'all_games':
                const games = ['basic-arithmetic', 'number-sequences', 'time-clock', 'money-math'];
                return games.every(game => (stats.gameSessions[game] || 0) >= requirement.count);

            case 'fast_answers':
                return stats.fastAnswers >= requirement.count;

            case 'difficulty_completed':
                return stats.difficultiesCompleted.includes(requirement.level);

            case 'consecutive_days':
                return stats.consecutiveDays >= requirement.count;

            default:
                return false;
        }
    }

    /**
     * Unlock an achievement
     */
    unlockAchievement(achievementId) {
        if (!this.isUnlocked(achievementId)) {
            this.unlockedAchievements.push({
                id: achievementId,
                unlockedAt: Date.now()
            });

            // Save to user progress
            if (this.userManager && !this.userManager.isGuest) {
                this.userManager.updateProgress({
                    achievements: this.unlockedAchievements
                });
            }

            console.log('🏆 Achievement unlocked:', achievementId);
        }
    }

    /**
     * Check if achievement is unlocked
     */
    isUnlocked(achievementId) {
        return this.unlockedAchievements.some(a => a.id === achievementId);
    }

    /**
     * Get all unlocked achievements
     */
    getUnlockedAchievements() {
        return this.unlockedAchievements.map(unlocked => ({
            ...this.achievements[unlocked.id],
            unlockedAt: unlocked.unlockedAt
        }));
    }

    /**
     * Get achievements by category
     */
    getAchievementsByCategory(category) {
        return Object.values(this.achievements).filter(a => a.category === category);
    }

    /**
     * Get achievement progress
     */
    getProgress() {
        const total = Object.keys(this.achievements).length;
        const unlocked = this.unlockedAchievements.length;
        return {
            total,
            unlocked,
            percentage: Math.round((unlocked / total) * 100)
        };
    }

    /**
     * Show achievement notification
     */
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-text">
                    <div class="achievement-title">Achievement Unlocked!</div>
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 5000);

        // Play celebration sound (if enabled)
        if (window.soundsEnabled) {
            this.playCelebrationSound();
        }
    }

    /**
     * Play celebration sound
     */
    playCelebrationSound() {
        // Simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
}

export default AchievementsManager;
