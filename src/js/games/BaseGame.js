/**
 * Base Game Engine
 * Foundation class for all math games
 * Kindergarten Math Adventure v3
 */

import { APP_CONFIG } from '../config.js';

/**
 * Abstract Base Game Class
 * Provides common functionality for all games
 */
export class BaseGame {
    constructor(gameId, userManager, aiEngine) {
        if (this.constructor === BaseGame) {
            throw new Error('BaseGame is abstract and cannot be instantiated directly');
        }

        this.gameId = gameId;
        this.userManager = userManager;
        this.aiEngine = aiEngine;
        
        // Game state
        this.currentQuestion = null;
        this.currentDifficulty = 1;
        this.questionsAnswered = 0;
        this.correctAnswers = 0;
        this.isActive = false;
        this.isPaused = false;
        this.startTime = null;
        this.questionStartTime = null;
        
        // Game configuration
        this.config = APP_CONFIG.GAMES[gameId] || {};
        this.ageGroup = this.userManager.user?.preferences?.ageGroup || '3-4';
        this.maxQuestions = this.userManager.getMaxQuestions();
        
        // Event listeners
        this.eventListeners = new Map();
        
        this.init();
    }

    /**
     * Initialize the game
     * Override in subclasses
     */
    init() {
        console.log(`[${this.gameId}] Game initialized`);
        this.setupEventListeners();
    }

    /**
     * Set up common event listeners
     */
    setupEventListeners() {
        // Listen for visibility changes (tab switching)
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Listen for user changes
        window.addEventListener('userAuthChange', this.handleUserChange.bind(this));
    }

    /**
     * Start the game
     */
    async startGame(ageGroup = null) {
        if (this.isActive) {
            console.warn(`[${this.gameId}] Game already active`);
            return;
        }

        this.ageGroup = ageGroup || this.ageGroup;
        this.isActive = true;
        this.isPaused = false;
        this.startTime = new Date();
        this.questionsAnswered = 0;
        this.correctAnswers = 0;
        
        // Determine starting difficulty
        this.currentDifficulty = this.getStartingDifficulty();
        
        console.log(`[${this.gameId}] Game started for age group: ${this.ageGroup}`);
        
        // Emit game start event
        this.emitEvent('gameStart', {
            gameId: this.gameId,
            ageGroup: this.ageGroup,
            difficulty: this.currentDifficulty
        });
        
        // Generate first question
        await this.nextQuestion();
    }

    /**
     * Pause the game
     */
    pauseGame() {
        if (!this.isActive || this.isPaused) return;
        
        this.isPaused = true;
        console.log(`[${this.gameId}] Game paused`);
        
        this.emitEvent('gamePause', {
            gameId: this.gameId,
            questionsAnswered: this.questionsAnswered,
            correctAnswers: this.correctAnswers
        });
    }

    /**
     * Resume the game
     */
    resumeGame() {
        if (!this.isActive || !this.isPaused) return;
        
        this.isPaused = false;
        this.questionStartTime = new Date(); // Reset question timer
        console.log(`[${this.gameId}] Game resumed`);
        
        this.emitEvent('gameResume', {
            gameId: this.gameId
        });
    }

    /**
     * End the game
     */
    endGame(reason = 'completed') {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.isPaused = false;
        
        const endTime = new Date();
        const totalTime = endTime - this.startTime;
        const accuracy = this.questionsAnswered > 0 ? (this.correctAnswers / this.questionsAnswered) * 100 : 0;
        
        const gameStats = {
            gameId: this.gameId,
            ageGroup: this.ageGroup,
            questionsAnswered: this.questionsAnswered,
            correctAnswers: this.correctAnswers,
            accuracy: Math.round(accuracy),
            totalTime: Math.round(totalTime / 1000), // seconds
            reason,
            completedAt: endTime.toISOString()
        };
        
        console.log(`[${this.gameId}] Game ended:`, gameStats);
        
        // Update progress
        this.updateProgress(gameStats);
        
        // Emit game end event
        this.emitEvent('gameEnd', gameStats);
        
        return gameStats;
    }

    /**
     * Generate next question
     * Must be implemented by subclasses
     */
    async nextQuestion() {
        throw new Error('nextQuestion() must be implemented by subclasses');
    }

    /**
     * Process user answer
     */
    async processAnswer(userAnswer) {
        if (!this.isActive || this.isPaused || !this.currentQuestion) {
            console.warn(`[${this.gameId}] Cannot process answer - game not active`);
            return;
        }

        const responseTime = new Date() - this.questionStartTime;
        
        // Let AI analyze the answer
        const analysis = this.aiEngine.analyzeAnswer(
            this.currentQuestion,
            userAnswer,
            responseTime,
            this.gameId
        );
        
        // Update game state
        this.questionsAnswered++;
        if (analysis.isCorrect) {
            this.correctAnswers++;
        }
        
        // Adjust difficulty for next question
        if (analysis.difficultyAdjustment) {
            this.currentDifficulty = Math.max(1, Math.min(5, 
                this.currentDifficulty + analysis.difficultyAdjustment.change
            ));
        }
        
        console.log(`[${this.gameId}] Answer processed:`, {
            correct: analysis.isCorrect,
            responseTime,
            newDifficulty: this.currentDifficulty
        });
        
        // Emit answer event
        this.emitEvent('answerProcessed', {
            question: this.currentQuestion,
            userAnswer,
            analysis,
            questionsAnswered: this.questionsAnswered,
            correctAnswers: this.correctAnswers
        });
        
        // Check if game should end
        if (this.shouldEndGame()) {
            this.endGame('completed');
        } else {
            // Small delay before next question for feedback
            setTimeout(() => {
                if (this.isActive && !this.isPaused) {
                    this.nextQuestion();
                }
            }, 2000);
        }
        
        return analysis;
    }

    /**
     * Check if game should end
     */
    shouldEndGame() {
        // End if max questions reached (for guests)
        if (this.maxQuestions > 0 && this.questionsAnswered >= this.maxQuestions) {
            return true;
        }
        
        // End after reasonable number of questions for authenticated users
        if (this.maxQuestions === -1 && this.questionsAnswered >= 20) {
            return true;
        }
        
        return false;
    }

    /**
     * Get starting difficulty based on user data
     */
    getStartingDifficulty() {
        const userPreferences = this.userManager.user?.preferences;
        
        // Check AI engine for concept performance
        if (this.aiEngine && !this.userManager.isGuest) {
            const conceptPerformance = this.aiEngine.getConceptPerformance(this.gameId);
            if (conceptPerformance) {
                if (conceptPerformance.masteryLevel > 0.8) return 3;
                if (conceptPerformance.masteryLevel > 0.6) return 2;
                return 1;
            }
        }
        
        // Base on age group
        const ageGroupDifficulty = {
            '3-4': 1,
            '4-5': 1,
            '5-6': 2
        };
        
        return ageGroupDifficulty[this.ageGroup] || 1;
    }

    /**
     * Generate difficulty-appropriate parameters
     */
    getDifficultyParameters() {
        const baseParams = this.config.DIFFICULTY_LEVELS?.[this.currentDifficulty] || 
                          this.config.DIFFICULTY_LEVELS?.[1] || {};
        
        // Adjust for age group
        const ageAdjustments = {
            '3-4': { maxNumber: Math.min(baseParams.maxNumber || 5, 5) },
            '4-5': { maxNumber: Math.min(baseParams.maxNumber || 10, 10) },
            '5-6': { maxNumber: baseParams.maxNumber || 20 }
        };
        
        return {
            ...baseParams,
            ...ageAdjustments[this.ageGroup]
        };
    }

    /**
     * Generate visual representations for numbers
     */
    generateVisualRepresentation(number, type = 'dots') {
        const representations = {
            dots: this.generateDots(number),
            objects: this.generateObjects(number),
            fingers: this.generateFingers(number),
            blocks: this.generateBlocks(number)
        };
        
        return representations[type] || representations.dots;
    }

    /**
     * Generate dot representation
     */
    generateDots(number) {
        const colors = ['#ff6b9d', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
        const dots = [];
        
        for (let i = 0; i < number; i++) {
            dots.push({
                id: i,
                color: colors[i % colors.length],
                size: 'medium'
            });
        }
        
        return {
            type: 'dots',
            items: dots,
            arrangement: this.getOptimalArrangement(number)
        };
    }

    /**
     * Generate object representation
     */
    generateObjects(number) {
        const objects = ['🍎', '🌟', '🎈', '🧸', '🚗', '🎯', '🎨', '⚽'];
        const items = [];
        
        const objectType = objects[Math.floor(Math.random() * objects.length)];
        
        for (let i = 0; i < number; i++) {
            items.push({
                id: i,
                emoji: objectType,
                size: 'large'
            });
        }
        
        return {
            type: 'objects',
            items,
            arrangement: this.getOptimalArrangement(number)
        };
    }

    /**
     * Generate finger representation
     */
    generateFingers(number) {
        if (number > 10) return this.generateDots(number);
        
        const items = [];
        for (let i = 0; i < number; i++) {
            items.push({
                id: i,
                type: 'finger',
                hand: i < 5 ? 'left' : 'right',
                finger: i % 5
            });
        }
        
        return {
            type: 'fingers',
            items,
            arrangement: 'hands'
        };
    }

    /**
     * Generate block representation
     */
    generateBlocks(number) {
        const items = [];
        const colors = ['#ff6b9d', '#4ecdc4', '#45b7d1', '#96ceb4'];
        
        for (let i = 0; i < number; i++) {
            items.push({
                id: i,
                color: colors[i % colors.length],
                type: 'block'
            });
        }
        
        return {
            type: 'blocks',
            items,
            arrangement: this.getOptimalArrangement(number)
        };
    }

    /**
     * Get optimal arrangement for visual items
     */
    getOptimalArrangement(number) {
        if (number <= 3) return 'line';
        if (number <= 4) return 'square';
        if (number <= 6) return 'rectangle';
        if (number <= 9) return 'grid';
        return 'scattered';
    }

    /**
     * Update progress tracking
     */
    updateProgress(gameStats) {
        const progressData = {
            lastPlayed: new Date().toISOString(),
            totalSessions: 1,
            totalQuestions: gameStats.questionsAnswered,
            totalCorrect: gameStats.correctAnswers,
            bestAccuracy: gameStats.accuracy,
            totalPlayTime: gameStats.totalTime,
            averageAccuracy: gameStats.accuracy,
            difficultyReached: this.currentDifficulty,
            ageGroupPlayed: this.ageGroup
        };
        
        // Load existing progress
        const existingProgress = this.userManager.user?.progress?.[this.gameId] || {};
        
        // Merge with existing data
        const updatedProgress = {
            ...existingProgress,
            lastPlayed: progressData.lastPlayed,
            totalSessions: (existingProgress.totalSessions || 0) + 1,
            totalQuestions: (existingProgress.totalQuestions || 0) + progressData.totalQuestions,
            totalCorrect: (existingProgress.totalCorrect || 0) + progressData.totalCorrect,
            bestAccuracy: Math.max(existingProgress.bestAccuracy || 0, progressData.bestAccuracy),
            totalPlayTime: (existingProgress.totalPlayTime || 0) + progressData.totalPlayTime,
            difficultyReached: Math.max(existingProgress.difficultyReached || 1, progressData.difficultyReached),
            ageGroupPlayed: progressData.ageGroupPlayed
        };
        
        // Calculate average accuracy
        updatedProgress.averageAccuracy = Math.round(
            (updatedProgress.totalCorrect / updatedProgress.totalQuestions) * 100
        );
        
        // Update in user manager
        this.userManager.updateProgress(this.gameId, updatedProgress);
    }

    /**
     * Handle visibility change (tab switching)
     */
    handleVisibilityChange() {
        if (document.hidden && this.isActive && !this.isPaused) {
            this.pauseGame();
        }
    }

    /**
     * Handle user changes
     */
    handleUserChange(event) {
        const { user } = event.detail;
        this.ageGroup = user.preferences?.ageGroup || '3-4';
        this.maxQuestions = this.userManager.getMaxQuestions();
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
                    console.error(`[${this.gameId}] Event callback error:`, error);
                }
            });
        }
        
        // Also emit as custom DOM event
        window.dispatchEvent(new CustomEvent(`game-${eventType}`, {
            detail: { gameId: this.gameId, ...data }
        }));
    }

    /**
     * Cleanup
     */
    destroy() {
        this.isActive = false;
        this.isPaused = false;
        this.eventListeners.clear();
        
        // Remove DOM event listeners
        document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        window.removeEventListener('userAuthChange', this.handleUserChange.bind(this));
        
        console.log(`[${this.gameId}] Game destroyed`);
    }

    /**
     * Get game status
     */
    getStatus() {
        return {
            gameId: this.gameId,
            isActive: this.isActive,
            isPaused: this.isPaused,
            currentDifficulty: this.currentDifficulty,
            questionsAnswered: this.questionsAnswered,
            correctAnswers: this.correctAnswers,
            accuracy: this.questionsAnswered > 0 ? 
                Math.round((this.correctAnswers / this.questionsAnswered) * 100) : 0,
            currentQuestion: this.currentQuestion,
            ageGroup: this.ageGroup
        };
    }
}

export default BaseGame;