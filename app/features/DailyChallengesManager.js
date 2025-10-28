/**
 * Daily Challenges Manager
 * Seed-based random challenges that are the same for all users on a given day
 */

export default class DailyChallengesManager {
    constructor(userManager) {
        this.userManager = userManager;
        this.challenges = [];
        this.todaysChallenges = [];
        this.progress = {};
        this.storageKey = 'km_daily_challenges';
        this.init();
    }

    /**
     * Initialize challenges system
     */
    init() {
        this.loadProgress();
        this.generateDailyChallenges();
        this.checkMidnightReset();
    }

    /**
     * Get seed for today's date
     * @returns {number} Seed based on current date
     */
    getTodaySeed() {
        const now = new Date();
        const dateString = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
        
        // Simple hash function for date string
        let hash = 0;
        for (let i = 0; i < dateString.length; i++) {
            const char = dateString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Seeded random number generator
     * @param {number} seed - Seed value
     * @returns {Function} Random function
     */
    seededRandom(seed) {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }

    /**
     * Define all possible challenge types
     * @returns {Array} Challenge templates
     */
    getChallengeTemplates() {
        return [
            // Accuracy Challenges
            {
                id: 'accuracy_perfect',
                type: 'accuracy',
                name: 'Perfect Score',
                description: 'Get 100% accuracy on any game',
                icon: '🎯',
                difficulty: 'hard',
                target: 100,
                metric: 'accuracy',
                reward: 500
            },
            {
                id: 'accuracy_excellent',
                type: 'accuracy',
                name: 'Excellence',
                description: 'Get 90% or higher accuracy',
                icon: '⭐',
                difficulty: 'medium',
                target: 90,
                metric: 'accuracy',
                reward: 300
            },
            {
                id: 'accuracy_good',
                type: 'accuracy',
                name: 'Good Job',
                description: 'Get 80% or higher accuracy',
                icon: '👍',
                difficulty: 'easy',
                target: 80,
                metric: 'accuracy',
                reward: 150
            },
            
            // Volume Challenges
            {
                id: 'volume_century',
                type: 'volume',
                name: 'Century Club',
                description: 'Answer 100 questions today',
                icon: '💯',
                difficulty: 'hard',
                target: 100,
                metric: 'questions',
                reward: 400
            },
            {
                id: 'volume_fifty',
                type: 'volume',
                name: 'Half Century',
                description: 'Answer 50 questions today',
                icon: '🔢',
                difficulty: 'medium',
                target: 50,
                metric: 'questions',
                reward: 250
            },
            {
                id: 'volume_twenty',
                type: 'volume',
                name: 'Getting Started',
                description: 'Answer 20 questions today',
                icon: '📝',
                difficulty: 'easy',
                target: 20,
                metric: 'questions',
                reward: 100
            },
            
            // Speed Challenges
            {
                id: 'speed_lightning',
                type: 'speed',
                name: 'Lightning Fast',
                description: 'Answer 15 questions in under 5 seconds each',
                icon: '⚡',
                difficulty: 'hard',
                target: 15,
                metric: 'fast_answers',
                threshold: 5000,
                reward: 450
            },
            {
                id: 'speed_quick',
                type: 'speed',
                name: 'Quick Thinker',
                description: 'Answer 10 questions in under 8 seconds each',
                icon: '🚀',
                difficulty: 'medium',
                target: 10,
                metric: 'fast_answers',
                threshold: 8000,
                reward: 275
            },
            
            // Streak Challenges
            {
                id: 'streak_perfect',
                type: 'streak',
                name: 'Unstoppable',
                description: 'Get 20 correct answers in a row',
                icon: '🔥',
                difficulty: 'hard',
                target: 20,
                metric: 'streak',
                reward: 500
            },
            {
                id: 'streak_good',
                type: 'streak',
                name: 'On a Roll',
                description: 'Get 10 correct answers in a row',
                icon: '🎲',
                difficulty: 'medium',
                target: 10,
                metric: 'streak',
                reward: 300
            },
            {
                id: 'streak_starter',
                type: 'streak',
                name: 'Triple Threat',
                description: 'Get 5 correct answers in a row',
                icon: '🌟',
                difficulty: 'easy',
                target: 5,
                metric: 'streak',
                reward: 150
            },
            
            // Variety Challenges
            {
                id: 'variety_all',
                type: 'variety',
                name: 'Jack of All Trades',
                description: 'Play all 4 game types today',
                icon: '🎮',
                difficulty: 'medium',
                target: 4,
                metric: 'unique_games',
                reward: 350
            },
            {
                id: 'variety_three',
                type: 'variety',
                name: 'Triple Play',
                description: 'Play 3 different game types today',
                icon: '🎪',
                difficulty: 'easy',
                target: 3,
                metric: 'unique_games',
                reward: 200
            }
        ];
    }

    /**
     * Generate today's challenges using seed
     */
    generateDailyChallenges() {
        const seed = this.getTodaySeed();
        const random = this.seededRandom(seed);
        const templates = this.getChallengeTemplates();
        
        // Select 3 challenges: 1 easy, 1 medium, 1 hard
        const easyTemplates = templates.filter(t => t.difficulty === 'easy');
        const mediumTemplates = templates.filter(t => t.difficulty === 'medium');
        const hardTemplates = templates.filter(t => t.difficulty === 'hard');
        
        const selectedChallenges = [
            easyTemplates[Math.floor(random() * easyTemplates.length)],
            mediumTemplates[Math.floor(random() * mediumTemplates.length)],
            hardTemplates[Math.floor(random() * hardTemplates.length)]
        ];
        
        this.todaysChallenges = selectedChallenges.map(template => ({
            ...template,
            date: this.getDateString(),
            progress: 0,
            completed: false
        }));
        
        // Load saved progress for today
        const savedProgress = this.progress[this.getDateString()];
        if (savedProgress) {
            this.todaysChallenges.forEach((challenge, index) => {
                const saved = savedProgress.find(c => c.id === challenge.id);
                if (saved) {
                    challenge.progress = saved.progress || 0;
                    challenge.completed = saved.completed || false;
                }
            });
        }
    }

    /**
     * Get current date string
     * @returns {string} Date in YYYY-MM-DD format
     */
    getDateString() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    /**
     * Load progress from localStorage
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.progress = JSON.parse(saved);
                
                // Clean up old progress (keep last 7 days)
                const today = new Date();
                const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                
                Object.keys(this.progress).forEach(dateString => {
                    const date = new Date(dateString);
                    if (date < sevenDaysAgo) {
                        delete this.progress[dateString];
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load daily challenges progress:', error);
            this.progress = {};
        }
    }

    /**
     * Save progress to localStorage
     */
    saveProgress() {
        try {
            const dateString = this.getDateString();
            this.progress[dateString] = this.todaysChallenges.map(c => ({
                id: c.id,
                progress: c.progress,
                completed: c.completed
            }));
            
            localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
        } catch (error) {
            console.error('Failed to save daily challenges progress:', error);
        }
    }

    /**
     * Update challenge progress based on game session
     * @param {Object} sessionData - Game session data
     */
    updateProgress(sessionData) {
        const {
            gameType,
            correctAnswers,
            totalQuestions,
            accuracy,
            currentStreak,
            answerTimes
        } = sessionData;
        
        let updated = false;
        
        this.todaysChallenges.forEach(challenge => {
            if (challenge.completed) return;
            
            switch (challenge.type) {
                case 'accuracy':
                    if (accuracy >= challenge.target) {
                        challenge.completed = true;
                        challenge.progress = challenge.target;
                        updated = true;
                    }
                    break;
                
                case 'volume':
                    challenge.progress = (challenge.progress || 0) + totalQuestions;
                    if (challenge.progress >= challenge.target) {
                        challenge.completed = true;
                        challenge.progress = challenge.target;
                    }
                    updated = true;
                    break;
                
                case 'speed':
                    const fastAnswers = answerTimes?.filter(t => t <= challenge.threshold).length || 0;
                    challenge.progress = Math.max(challenge.progress || 0, fastAnswers);
                    if (challenge.progress >= challenge.target) {
                        challenge.completed = true;
                    }
                    updated = true;
                    break;
                
                case 'streak':
                    challenge.progress = Math.max(challenge.progress || 0, currentStreak || 0);
                    if (challenge.progress >= challenge.target) {
                        challenge.completed = true;
                    }
                    updated = true;
                    break;
                
                case 'variety':
                    const played = challenge.gamesPlayed || new Set();
                    played.add(gameType);
                    challenge.gamesPlayed = played;
                    challenge.progress = played.size;
                    if (challenge.progress >= challenge.target) {
                        challenge.completed = true;
                    }
                    updated = true;
                    break;
            }
        });
        
        if (updated) {
            this.saveProgress();
        }
        
        return this.todaysChallenges.filter(c => c.completed);
    }

    /**
     * Get today's challenges
     * @returns {Array} Today's challenges
     */
    getTodaysChallenges() {
        return this.todaysChallenges;
    }

    /**
     * Get completed challenges count
     * @returns {number} Number of completed challenges
     */
    getCompletedCount() {
        return this.todaysChallenges.filter(c => c.completed).length;
    }

    /**
     * Get total rewards earned today
     * @returns {number} Total reward points
     */
    getTotalRewards() {
        return this.todaysChallenges
            .filter(c => c.completed)
            .reduce((sum, c) => sum + c.reward, 0);
    }

    /**
     * Check if it's past midnight and reset if needed
     */
    checkMidnightReset() {
        const lastCheck = localStorage.getItem('km_last_challenge_check');
        const today = this.getDateString();
        
        if (lastCheck !== today) {
            localStorage.setItem('km_last_challenge_check', today);
            this.generateDailyChallenges();
        }
        
        // Check again at midnight
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const msUntilMidnight = tomorrow - now;
        
        setTimeout(() => {
            this.generateDailyChallenges();
            this.checkMidnightReset();
        }, msUntilMidnight);
    }

    /**
     * Get challenge UI HTML
     * @returns {string} HTML for challenges display
     */
    getChallengesHTML() {
        const completed = this.getCompletedCount();
        const total = this.todaysChallenges.length;
        
        return `
            <div class="daily-challenges">
                <div class="challenges-header">
                    <h3 class="challenges-title">
                        <span class="challenges-icon">📅</span>
                        Daily Challenges
                    </h3>
                    <div class="challenges-progress">
                        <span class="challenges-count">${completed}/${total}</span>
                        <span class="challenges-label">Completed</span>
                    </div>
                </div>
                
                <div class="challenges-list">
                    ${this.todaysChallenges.map(challenge => this.getChallengeItemHTML(challenge)).join('')}
                </div>
                
                ${completed > 0 ? `
                    <div class="challenges-rewards">
                        <span class="rewards-icon">🏆</span>
                        <span class="rewards-text">Earned Today: ${this.getTotalRewards()} points</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Get individual challenge item HTML
     * @param {Object} challenge - Challenge object
     * @returns {string} HTML for challenge item
     */
    getChallengeItemHTML(challenge) {
        const progressPercent = Math.min((challenge.progress / challenge.target) * 100, 100);
        const difficultyClass = `difficulty-${challenge.difficulty}`;
        
        return `
            <div class="challenge-item ${challenge.completed ? 'completed' : ''} ${difficultyClass}">
                <div class="challenge-icon">${challenge.icon}</div>
                <div class="challenge-content">
                    <div class="challenge-name">${challenge.name}</div>
                    <div class="challenge-description">${challenge.description}</div>
                    <div class="challenge-progress-bar">
                        <div class="challenge-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="challenge-stats">
                        <span class="challenge-progress-text">${challenge.progress}/${challenge.target}</span>
                        <span class="challenge-reward">+${challenge.reward} pts</span>
                    </div>
                </div>
                ${challenge.completed ? '<div class="challenge-check">✓</div>' : ''}
            </div>
        `;
    }
}
