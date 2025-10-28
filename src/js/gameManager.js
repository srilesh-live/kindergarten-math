/**
 * Game Manager
 * Coordinates all games and manages game state
 * Kindergarten Math Adventure v3
 */

import { NumberMagicGame } from './games/NumberMagicGame.js';
import { APP_CONFIG } from './config.js';

/**
 * Game Manager Class
 * Handles game selection, lifecycle, and coordination
 */
export class GameManager {
    constructor(userManager, aiEngine) {
        this.userManager = userManager;
        this.aiEngine = aiEngine;
        
        // Game instances
        this.games = new Map();
        this.currentGame = null;
        this.gameHistory = [];
        
        // Game registry
        this.gameRegistry = {
            'number-magic': NumberMagicGame
            // TODO: Add other games when implemented
            // 'time-wizard': TimeWizardGame,
            // 'pattern-quest': PatternQuestGame,
            // 'shape-explorer': ShapeExplorerGame
        };
        
        // Event listeners
        this.eventListeners = new Map();
        
        this.init();
    }

    /**
     * Initialize Game Manager
     */
    init() {
        console.log('[GameManager] Initializing Game Manager');
        
        // Listen for user changes
        window.addEventListener('userAuthChange', this.handleUserChange.bind(this));
        
        // Initialize available games based on user access
        this.initializeAvailableGames();
    }

    /**
     * Handle user authentication changes
     */
    handleUserChange(event) {
        const { user, isGuest } = event.detail;
        console.log('[GameManager] User changed, updating available games');
        
        // Stop current game if running
        if (this.currentGame) {
            this.stopCurrentGame('user_change');
        }
        
        // Reinitialize available games
        this.initializeAvailableGames();
    }

    /**
     * Initialize games available to current user
     */
    initializeAvailableGames() {
        const availableGameIds = this.userManager.getAvailableGames();
        
        console.log('[GameManager] Available games:', availableGameIds);
        
        // Clear existing game instances
        this.games.clear();
        
        // Initialize games that user has access to
        availableGameIds.forEach(gameId => {
            if (this.gameRegistry[gameId]) {
                const GameClass = this.gameRegistry[gameId];
                const gameInstance = new GameClass(this.userManager, this.aiEngine);
                this.games.set(gameId, gameInstance);
                
                // Set up game event listeners
                this.setupGameEventListeners(gameInstance);
                
                console.log(`[GameManager] Initialized ${gameId}`);
            }
        });
    }

    /**
     * Set up event listeners for a game instance
     */
    setupGameEventListeners(game) {
        // Listen to all game events
        const eventTypes = ['gameStart', 'gameEnd', 'gamePause', 'gameResume', 
                           'questionGenerated', 'answerProcessed'];
        
        eventTypes.forEach(eventType => {
            game.addEventListener(eventType, (data) => {
                this.handleGameEvent(eventType, data);
            });
        });
    }

    /**
     * Handle game events
     */
    handleGameEvent(eventType, data) {
        console.log(`[GameManager] Game event: ${eventType}`, data);
        
        // Update game history
        if (eventType === 'gameEnd') {
            this.gameHistory.push({
                gameId: data.gameId,
                stats: data,
                timestamp: new Date().toISOString()
            });
        }
        
        // Forward events to UI
        this.emitEvent(eventType, data);
    }

    /**
     * Get list of available games with metadata
     */
    getAvailableGames() {
        const availableGames = [];
        
        for (const [gameId, gameInstance] of this.games) {
            const gameConfig = APP_CONFIG.GAMES[gameId];
            if (gameConfig) {
                availableGames.push({
                    id: gameId,
                    name: gameConfig.NAME,
                    description: gameConfig.DESCRIPTION,
                    icon: gameConfig.ICON,
                    difficulty: gameConfig.DIFFICULTY_RANGE,
                    ageGroups: gameConfig.AGE_GROUPS,
                    concepts: gameConfig.CONCEPTS,
                    isAvailable: true,
                    progress: this.getUserProgress(gameId),
                    instance: gameInstance
                });
            }
        }
        
        return availableGames;
    }

    /**
     * Get unavailable games (for promotional purposes)
     */
    getUnavailableGames() {
        const unavailableGames = [];
        const userGames = this.userManager.getAvailableGames();
        
        Object.keys(APP_CONFIG.GAMES).forEach(gameId => {
            if (!userGames.includes(gameId)) {
                const gameConfig = APP_CONFIG.GAMES[gameId];
                unavailableGames.push({
                    id: gameId,
                    name: gameConfig.NAME,
                    description: gameConfig.DESCRIPTION,
                    icon: gameConfig.ICON,
                    difficulty: gameConfig.DIFFICULTY_RANGE,
                    ageGroups: gameConfig.AGE_GROUPS,
                    concepts: gameConfig.CONCEPTS,
                    isAvailable: false,
                    requiresSignIn: true
                });
            }
        });
        
        return unavailableGames;
    }

    /**
     * Start a specific game
     */
    async startGame(gameId, ageGroup = null) {
        console.log(`[GameManager] Starting game: ${gameId}`);
        
        // Stop current game if running
        if (this.currentGame) {
            await this.stopCurrentGame('new_game_started');
        }
        
        // Check if game is available
        if (!this.games.has(gameId)) {
            throw new Error(`Game ${gameId} is not available or not initialized`);
        }
        
        const game = this.games.get(gameId);
        this.currentGame = game;
        
        try {
            // Start the game
            await game.startGame(ageGroup);
            
            console.log(`[GameManager] Game ${gameId} started successfully`);
            
            // Emit manager event
            this.emitEvent('gameManagerStart', {
                gameId,
                ageGroup,
                userType: this.userManager.isGuest ? 'guest' : 'authenticated'
            });
            
            return { success: true, game };
            
        } catch (error) {
            console.error(`[GameManager] Failed to start game ${gameId}:`, error);
            this.currentGame = null;
            throw error;
        }
    }

    /**
     * Stop current game
     */
    async stopCurrentGame(reason = 'manual_stop') {
        if (!this.currentGame) return;
        
        console.log(`[GameManager] Stopping current game: ${reason}`);
        
        const gameId = this.currentGame.gameId;
        const gameStats = this.currentGame.endGame(reason);
        
        this.currentGame = null;
        
        // Emit manager event
        this.emitEvent('gameManagerStop', {
            gameId,
            reason,
            stats: gameStats
        });
        
        return gameStats;
    }

    /**
     * Pause current game
     */
    pauseCurrentGame() {
        if (this.currentGame && this.currentGame.isActive) {
            console.log('[GameManager] Pausing current game');
            this.currentGame.pauseGame();
            
            this.emitEvent('gameManagerPause', {
                gameId: this.currentGame.gameId
            });
        }
    }

    /**
     * Resume current game
     */
    resumeCurrentGame() {
        if (this.currentGame && this.currentGame.isActive && this.currentGame.isPaused) {
            console.log('[GameManager] Resuming current game');
            this.currentGame.resumeGame();
            
            this.emitEvent('gameManagerResume', {
                gameId: this.currentGame.gameId
            });
        }
    }

    /**
     * Process answer for current game
     */
    async processAnswer(userAnswer) {
        if (!this.currentGame || !this.currentGame.isActive) {
            throw new Error('No active game to process answer');
        }
        
        return await this.currentGame.processAnswer(userAnswer);
    }

    /**
     * Get current game status
     */
    getCurrentGameStatus() {
        if (!this.currentGame) {
            return { hasActiveGame: false };
        }
        
        return {
            hasActiveGame: true,
            ...this.currentGame.getStatus()
        };
    }

    /**
     * Get user progress for a specific game
     */
    getUserProgress(gameId) {
        const userProgress = this.userManager.user?.progress?.[gameId];
        
        if (!userProgress) {
            return {
                totalSessions: 0,
                totalQuestions: 0,
                totalCorrect: 0,
                averageAccuracy: 0,
                bestAccuracy: 0,
                difficultyReached: 1,
                lastPlayed: null
            };
        }
        
        return userProgress;
    }

    /**
     * Get overall learning statistics
     */
    getLearningStatistics() {
        const stats = {
            totalGamesPlayed: 0,
            totalQuestionsAnswered: 0,
            totalCorrectAnswers: 0,
            overallAccuracy: 0,
            favoriteGame: null,
            playTime: 0,
            gamesProgress: {}
        };
        
        if (!this.userManager.user?.progress) {
            return stats;
        }
        
        const userProgress = this.userManager.user.progress;
        let maxSessions = 0;
        
        // Aggregate statistics from all games
        Object.entries(userProgress).forEach(([gameId, progress]) => {
            stats.totalGamesPlayed += progress.totalSessions || 0;
            stats.totalQuestionsAnswered += progress.totalQuestions || 0;
            stats.totalCorrectAnswers += progress.totalCorrect || 0;
            stats.playTime += progress.totalPlayTime || 0;
            
            // Track favorite game (most played)
            if (progress.totalSessions > maxSessions) {
                maxSessions = progress.totalSessions;
                stats.favoriteGame = gameId;
            }
            
            stats.gamesProgress[gameId] = {
                accuracy: progress.averageAccuracy || 0,
                level: progress.difficultyReached || 1,
                sessions: progress.totalSessions || 0,
                lastPlayed: progress.lastPlayed
            };
        });
        
        // Calculate overall accuracy
        if (stats.totalQuestionsAnswered > 0) {
            stats.overallAccuracy = Math.round(
                (stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100
            );
        }
        
        return stats;
    }

    /**
     * Get learning recommendations
     */
    getLearningRecommendations() {
        const stats = this.getLearningStatistics();
        const recommendations = [];
        
        // Check if user should try new games
        const availableGames = this.getAvailableGames();
        const playedGames = Object.keys(stats.gamesProgress);
        
        if (playedGames.length < availableGames.length) {
            const unplayedGames = availableGames.filter(game => 
                !playedGames.includes(game.id)
            );
            if (unplayedGames.length > 0) {
                recommendations.push({
                    type: 'new_game',
                    title: 'Try Something New!',
                    description: `Explore ${unplayedGames[0].name} to learn new concepts`,
                    action: 'play_game',
                    gameId: unplayedGames[0].id,
                    priority: 'medium'
                });
            }
        }
        
        // Check for games that need more practice
        Object.entries(stats.gamesProgress).forEach(([gameId, progress]) => {
            if (progress.accuracy < 70 && progress.sessions > 2) {
                const gameConfig = APP_CONFIG.GAMES[gameId];
                recommendations.push({
                    type: 'practice_needed',
                    title: `Practice ${gameConfig?.NAME}`,
                    description: `Your accuracy is ${progress.accuracy}% - let's improve it!`,
                    action: 'play_game',
                    gameId: gameId,
                    priority: 'high'
                });
            }
        });
        
        // Check for advanced challenges
        Object.entries(stats.gamesProgress).forEach(([gameId, progress]) => {
            if (progress.accuracy > 85 && progress.level < 3) {
                const gameConfig = APP_CONFIG.GAMES[gameId];
                recommendations.push({
                    type: 'level_up',
                    title: `Level Up in ${gameConfig?.NAME}!`,
                    description: `You're doing great! Ready for harder challenges?`,
                    action: 'play_game',
                    gameId: gameId,
                    priority: 'low'
                });
            }
        });
        
        // Daily practice reminder
        const lastPlayed = this.getLastPlayedTime();
        const daysSinceLastPlay = lastPlayed ? 
            (new Date() - new Date(lastPlayed)) / (1000 * 60 * 60 * 24) : 999;
        
        if (daysSinceLastPlay > 1) {
            recommendations.push({
                type: 'daily_practice',
                title: 'Daily Practice',
                description: 'Keep your skills sharp with daily practice!',
                action: 'play_game',
                gameId: stats.favoriteGame || 'number-magic',
                priority: 'medium'
            });
        }
        
        return recommendations.sort((a, b) => {
            const priorities = { high: 3, medium: 2, low: 1 };
            return priorities[b.priority] - priorities[a.priority];
        });
    }

    /**
     * Get last played time across all games
     */
    getLastPlayedTime() {
        if (!this.userManager.user?.progress) return null;
        
        let lastPlayed = null;
        Object.values(this.userManager.user.progress).forEach(progress => {
            if (progress.lastPlayed) {
                if (!lastPlayed || new Date(progress.lastPlayed) > new Date(lastPlayed)) {
                    lastPlayed = progress.lastPlayed;
                }
            }
        });
        
        return lastPlayed;
    }

    /**
     * Get game help information
     */
    getGameHelp(gameId) {
        const game = this.games.get(gameId);
        if (game && typeof game.getHelpText === 'function') {
            return game.getHelpText();
        }
        
        // Fallback help
        const gameConfig = APP_CONFIG.GAMES[gameId];
        return {
            title: `${gameConfig?.NAME || gameId} Help`,
            instructions: [
                'Read each question carefully',
                'Look at the pictures to help you',
                'Choose the best answer',
                'Take your time and try your best!'
            ],
            tips: {
                '3-4': ['Use your fingers to count', 'Ask for help if needed'],
                '4-5': ['Think step by step', 'Check your answer'],
                '5-6': ['Look for patterns', 'Break problems into parts']
            }
        };
    }

    /**
     * Event system
     */
    addEventListener(eventType, callback) {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType).push(callback);
    }

    removeEventListener(eventType, callback) {
        if (this.eventListeners.has(eventType)) {
            const listeners = this.eventListeners.get(eventType);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    emitEvent(eventType, data) {
        if (this.eventListeners.has(eventType)) {
            this.eventListeners.get(eventType).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('[GameManager] Event callback error:', error);
                }
            });
        }
        
        // Also emit as custom DOM event
        window.dispatchEvent(new CustomEvent(`gameManager-${eventType}`, {
            detail: data
        }));
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        // Stop current game
        if (this.currentGame) {
            this.stopCurrentGame('manager_destroyed');
        }
        
        // Destroy all game instances
        this.games.forEach(game => {
            if (typeof game.destroy === 'function') {
                game.destroy();
            }
        });
        
        this.games.clear();
        this.eventListeners.clear();
        
        // Remove event listeners
        window.removeEventListener('userAuthChange', this.handleUserChange.bind(this));
        
        console.log('[GameManager] Game Manager destroyed');
    }
}

export default GameManager;