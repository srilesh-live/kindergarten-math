/**
 * Game Engine - Handles all math problem generation and game logic
 * AI-adaptive difficulty with engaging visual elements
 */

import { APP_CONFIG } from './config.js';
import AIPhrasesEngine from './ai-phrases.js';

export class GameEngine {
    constructor(supabaseManager) {
        this.supabase = supabaseManager;
        this.aiPhrases = new AIPhrasesEngine();
        this.currentGame = null;
        this.currentSession = null;
        this.currentQuestion = null;
        this.questionStartTime = null;
        this.sessionStats = {
            questionsAttempted: 0,
            questionsCorrect: 0,
            totalTime: 0,
            currentStreak: 0,
            longestStreak: 0,
            averageTime: 0,
            difficultyLevel: 'medium'
        };
        this.userProfile = null;
        this.adaptiveDifficulty = new AdaptiveDifficultyEngine();
    }

    /**
     * Initialize game engine with user profile
     */
    async initialize(userProfile) {
        this.userProfile = userProfile;
        this.adaptiveDifficulty.initialize(userProfile);
        
        console.log('🎮 Game engine initialized for user:', userProfile.age_group);
    }

    /**
     * Start a new game session
     */
    async startGame(gameType, targetQuestions = 10) {
        try {
            console.log(`🎯 Starting ${gameType} game with ${targetQuestions} questions`);

            // Determine initial difficulty based on user profile and AI
            const initialDifficulty = this.adaptiveDifficulty.getInitialDifficulty(gameType);
            
            // Start learning session in database
            this.currentSession = await this.supabase.startLearningSession(gameType, initialDifficulty);
            
            // Initialize game state
            this.currentGame = {
                type: gameType,
                targetQuestions,
                currentQuestionIndex: 0,
                questions: [],
                difficulty: initialDifficulty
            };

            // Reset session stats
            this.sessionStats = {
                questionsAttempted: 0,
                questionsCorrect: 0,
                totalTime: 0,
                currentStreak: 0,
                longestStreak: 0,
                averageTime: 0,
                difficultyLevel: initialDifficulty
            };

            // Generate first question
            await this.generateNextQuestion();
            
            return {
                session: this.currentSession,
                game: this.currentGame,
                question: this.currentQuestion
            };

        } catch (error) {
            console.error('Failed to start game:', error);
            throw error;
        }
    }

    /**
     * Generate the next question based on current difficulty and game type
     */
    async generateNextQuestion() {
        const gameType = this.currentGame.type;
        const difficulty = this.sessionStats.difficultyLevel;
        
        console.log(`📝 Generating ${gameType} question at ${difficulty} difficulty`);

        let question;
        switch (gameType) {
            case 'arithmetic':
                question = this.generateArithmeticQuestion(difficulty);
                break;
            case 'time':
                question = this.generateTimeQuestion(difficulty);
                break;
            case 'patterns':
                question = this.generatePatternQuestion(difficulty);
                break;
            case 'shapes':
                question = this.generateShapeQuestion(difficulty);
                break;
            default:
                throw new Error(`Unknown game type: ${gameType}`);
        }

        // Add AI-generated encouragement phrase
        const encouragementContext = {
            difficulty,
            performance: this.getPerformanceLevel(),
            personality: this.userProfile?.personality || 'magical',
            streakCount: this.sessionStats.currentStreak,
            sessionProgress: this.currentGame.currentQuestionIndex / this.currentGame.targetQuestions
        };

        question.encouragement = this.aiPhrases.generatePhrase('encouragement', {
            subcategory: this.sessionStats.currentStreak > 2 ? 'progress' : 'starting',
            ...encouragementContext
        });

        this.currentQuestion = question;
        this.questionStartTime = Date.now();
        
        return question;
    }

    /**
     * Generate arithmetic questions (addition, subtraction, simple multiplication)
     */
    generateArithmeticQuestion(difficulty) {
        const operations = this.getOperationsForDifficulty(difficulty);
        const operation = operations[Math.floor(Math.random() * operations.length)];
        const numbers = this.getNumbersForDifficulty(difficulty, operation);
        
        let question, correctAnswer, visualElements;

        switch (operation) {
            case 'addition':
                question = `What is ${numbers.a} + ${numbers.b}?`;
                correctAnswer = numbers.a + numbers.b;
                visualElements = this.createAdditionVisual(numbers.a, numbers.b);
                break;
            
            case 'subtraction':
                // Ensure positive results for young learners
                const larger = Math.max(numbers.a, numbers.b);
                const smaller = Math.min(numbers.a, numbers.b);
                question = `What is ${larger} - ${smaller}?`;
                correctAnswer = larger - smaller;
                visualElements = this.createSubtractionVisual(larger, smaller);
                break;
            
            case 'multiplication':
                question = `What is ${numbers.a} × ${numbers.b}?`;
                correctAnswer = numbers.a * numbers.b;
                visualElements = this.createMultiplicationVisual(numbers.a, numbers.b);
                break;
        }

        // Generate multiple choice options
        const options = this.generateArithmeticOptions(correctAnswer, difficulty);

        return {
            type: 'arithmetic',
            subtype: operation,
            difficulty,
            questionText: question,
            correctAnswer,
            options,
            visualElements,
            hints: this.generateArithmeticHints(operation, numbers),
            explanation: this.generateArithmeticExplanation(operation, numbers, correctAnswer)
        };
    }

    /**
     * Generate time-telling questions
     */
    generateTimeQuestion(difficulty) {
        let hour, minute, questionText, correctAnswer, options, visualElements;

        switch (difficulty) {
            case 'easy':
                // Hour only (o'clock)
                hour = Math.floor(Math.random() * 12) + 1;
                minute = 0;
                questionText = `What time does this clock show?`;
                correctAnswer = `${hour}:00`;
                options = this.generateTimeOptions(hour, minute, 'hour');
                break;
            
            case 'medium':
                // Half hours
                hour = Math.floor(Math.random() * 12) + 1;
                minute = Math.random() < 0.5 ? 0 : 30;
                questionText = `What time does this clock show?`;
                correctAnswer = `${hour}:${minute.toString().padStart(2, '0')}`;
                options = this.generateTimeOptions(hour, minute, 'half-hour');
                break;
            
            case 'hard':
                // Quarter hours and 5-minute intervals
                hour = Math.floor(Math.random() * 12) + 1;
                const intervals = [0, 15, 30, 45];
                minute = intervals[Math.floor(Math.random() * intervals.length)];
                questionText = `What time does this clock show?`;
                correctAnswer = `${hour}:${minute.toString().padStart(2, '0')}`;
                options = this.generateTimeOptions(hour, minute, 'quarter-hour');
                break;
        }

        visualElements = this.createClockVisual(hour, minute);

        return {
            type: 'time',
            difficulty,
            questionText,
            correctAnswer,
            options,
            visualElements,
            hints: this.generateTimeHints(hour, minute),
            explanation: this.generateTimeExplanation(hour, minute)
        };
    }

    /**
     * Generate pattern sequence questions
     */
    generatePatternQuestion(difficulty) {
        const patternTypes = ['number', 'shape', 'color'];
        const patternType = patternTypes[Math.floor(Math.random() * patternTypes.length)];
        
        let sequence, correctAnswer, options, visualElements;

        switch (patternType) {
            case 'number':
                const numberPattern = this.generateNumberPattern(difficulty);
                sequence = numberPattern.sequence;
                correctAnswer = numberPattern.next;
                options = this.generatePatternOptions(correctAnswer, 'number');
                visualElements = this.createNumberPatternVisual(sequence);
                break;
            
            case 'shape':
                const shapePattern = this.generateShapePattern(difficulty);
                sequence = shapePattern.sequence;
                correctAnswer = shapePattern.next;
                options = this.generatePatternOptions(correctAnswer, 'shape');
                visualElements = this.createShapePatternVisual(sequence);
                break;
            
            case 'color':
                const colorPattern = this.generateColorPattern(difficulty);
                sequence = colorPattern.sequence;
                correctAnswer = colorPattern.next;
                options = this.generatePatternOptions(correctAnswer, 'color');
                visualElements = this.createColorPatternVisual(sequence);
                break;
        }

        return {
            type: 'patterns',
            subtype: patternType,
            difficulty,
            questionText: 'What comes next in this pattern?',
            correctAnswer,
            options,
            visualElements,
            sequence,
            hints: this.generatePatternHints(patternType, sequence),
            explanation: this.generatePatternExplanation(patternType, sequence, correctAnswer)
        };
    }

    /**
     * Generate shape recognition questions
     */
    generateShapeQuestion(difficulty) {
        const questionTypes = ['identify', 'count', 'sort'];
        const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        let questionText, correctAnswer, options, visualElements;

        switch (questionType) {
            case 'identify':
                const shapes = ['circle', 'square', 'triangle', 'rectangle', 'pentagon', 'hexagon'];
                const targetShape = shapes[Math.floor(Math.random() * (difficulty === 'easy' ? 4 : shapes.length))];
                questionText = `Which shape is a ${targetShape}?`;
                correctAnswer = targetShape;
                options = this.generateShapeOptions(targetShape, shapes);
                visualElements = this.createShapeIdentificationVisual(options);
                break;
            
            case 'count':
                const countShape = ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)];
                const count = difficulty === 'easy' ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 10) + 1;
                questionText = `How many ${countShape}s do you see?`;
                correctAnswer = count;
                options = this.generateCountOptions(count);
                visualElements = this.createShapeCountVisual(countShape, count);
                break;
            
            case 'sort':
                questionText = 'Which shapes are the same?';
                const sortData = this.generateShapeSortData(difficulty);
                correctAnswer = sortData.correct;
                options = sortData.options;
                visualElements = this.createShapeSortVisual(sortData.shapes);
                break;
        }

        return {
            type: 'shapes',
            subtype: questionType,
            difficulty,
            questionText,
            correctAnswer,
            options,
            visualElements,
            hints: this.generateShapeHints(questionType),
            explanation: this.generateShapeExplanation(questionType, correctAnswer)
        };
    }

    /**
     * Process user's answer and provide feedback
     */
    async processAnswer(userAnswer) {
        const timeSpent = (Date.now() - this.questionStartTime) / 1000;
        const isCorrect = this.checkAnswer(userAnswer, this.currentQuestion.correctAnswer);
        
        // Update session statistics
        this.sessionStats.questionsAttempted++;
        this.sessionStats.totalTime += timeSpent;
        this.sessionStats.averageTime = this.sessionStats.totalTime / this.sessionStats.questionsAttempted;
        
        if (isCorrect) {
            this.sessionStats.questionsCorrect++;
            this.sessionStats.currentStreak++;
            if (this.sessionStats.currentStreak > this.sessionStats.longestStreak) {
                this.sessionStats.longestStreak = this.sessionStats.currentStreak;
            }
        } else {
            this.sessionStats.currentStreak = 0;
        }

        // Record in database
        await this.supabase.recordQuestionAttempt(
            this.currentSession.id,
            this.currentQuestion,
            userAnswer,
            isCorrect,
            timeSpent
        );

        // Generate AI feedback
        const feedbackContext = {
            difficulty: this.currentQuestion.difficulty,
            performance: this.getPerformanceLevel(),
            personality: this.userProfile?.personality || 'magical',
            streakCount: this.sessionStats.currentStreak,
            isCorrect,
            timeSpent
        };

        let feedback;
        if (isCorrect) {
            feedback = this.aiPhrases.generatePhrase('celebration', {
                subcategory: this.sessionStats.currentStreak > 5 ? 'excellent' : 
                           this.sessionStats.currentStreak > 2 ? 'good' : 'correct',
                ...feedbackContext
            });
        } else {
            feedback = this.aiPhrases.generatePhrase('guidance', {
                subcategory: 'gentle_hints',
                ...feedbackContext
            });
        }

        // Update adaptive difficulty
        this.adaptiveDifficulty.recordAttempt(
            this.currentQuestion.type,
            this.currentQuestion.difficulty,
            isCorrect,
            timeSpent
        );

        // Adjust difficulty for next question
        const newDifficulty = this.adaptiveDifficulty.getNextDifficulty(
            this.currentQuestion.type,
            this.sessionStats
        );
        this.sessionStats.difficultyLevel = newDifficulty;

        // Advance to next question
        this.currentGame.currentQuestionIndex++;

        const result = {
            isCorrect,
            timeSpent,
            feedback,
            explanation: this.currentQuestion.explanation,
            correctAnswer: this.currentQuestion.correctAnswer,
            sessionStats: { ...this.sessionStats },
            isGameComplete: this.currentGame.currentQuestionIndex >= this.currentGame.targetQuestions,
            nextDifficulty: newDifficulty
        };

        // Generate next question if game continues
        if (!result.isGameComplete) {
            await this.generateNextQuestion();
            result.nextQuestion = this.currentQuestion;
        }

        return result;
    }

    /**
     * Complete the current game session
     */
    async completeGame() {
        const finalStats = {
            questions_attempted: this.sessionStats.questionsAttempted,
            questions_correct: this.sessionStats.questionsCorrect,
            total_time_seconds: Math.round(this.sessionStats.totalTime),
            longest_streak: this.sessionStats.longestStreak,
            final_difficulty: this.sessionStats.difficultyLevel
        };

        await this.supabase.completeLearningSession(this.currentSession.id, finalStats);

        // Generate AI insights and recommendations
        const analytics = await this.supabase.getUserAnalytics('7d');
        const insights = this.generateGameInsights(analytics, this.sessionStats);

        return {
            sessionStats: this.sessionStats,
            finalStats,
            insights,
            achievements: this.checkAchievements(this.sessionStats, analytics)
        };
    }

    /**
     * Generate insights based on performance
     */
    generateGameInsights(analytics, sessionStats) {
        const accuracy = sessionStats.questionsCorrect / sessionStats.questionsAttempted;
        
        let strengthInsight = "You're doing great!";
        let improvementInsight = "Keep practicing!";
        let suggestionInsight = "Try another game!";

        // Analyze strengths
        if (accuracy >= 0.9) {
            strengthInsight = "Amazing! You're a math superstar! 🌟";
        } else if (accuracy >= 0.75) {
            strengthInsight = "Excellent accuracy - you're really getting it! 💪";
        } else if (accuracy >= 0.6) {
            strengthInsight = "Good progress - you're learning fast! 📈";
        }

        // Suggest improvements
        if (sessionStats.averageTime > 30) {
            improvementInsight = "Try to trust your first instinct - you know more than you think! ⚡";
        } else if (accuracy < 0.6) {
            improvementInsight = "Take your time to think through each problem step by step! 🤔";
        } else {
            improvementInsight = "You're doing wonderfully - keep up the fantastic work! ✨";
        }

        // Game suggestions based on current performance
        const gameTypes = ['arithmetic', 'time', 'patterns', 'shapes'];
        const currentGame = this.currentGame.type;
        const otherGames = gameTypes.filter(g => g !== currentGame);
        const suggestedGame = otherGames[Math.floor(Math.random() * otherGames.length)];
        
        suggestionInsight = `Ready to explore ${this.getGameDisplayName(suggestedGame)}? 🎮`;

        return {
            strength: strengthInsight,
            improvement: improvementInsight,
            suggestion: suggestionInsight,
            recommendedDifficulty: this.adaptiveDifficulty.getRecommendedDifficulty()
        };
    }

    /**
     * Check for achievements and milestones
     */
    checkAchievements(sessionStats, analytics) {
        const achievements = [];

        // Perfect game achievement
        if (sessionStats.questionsCorrect === sessionStats.questionsAttempted && sessionStats.questionsAttempted >= 5) {
            achievements.push({
                type: 'perfect_game',
                title: 'Perfect Game! 🏆',
                description: 'You got every question right!',
                icon: '🎯'
            });
        }

        // Speed achievement
        if (sessionStats.averageTime < 15 && sessionStats.questionsCorrect / sessionStats.questionsAttempted >= 0.8) {
            achievements.push({
                type: 'speed_demon',
                title: 'Lightning Fast! ⚡',
                description: 'Quick and accurate - amazing!',
                icon: '🏃‍♀️'
            });
        }

        // Streak achievement
        if (sessionStats.longestStreak >= 5) {
            achievements.push({
                type: 'streak_master',
                title: 'Streak Master! 🔥',
                description: `${sessionStats.longestStreak} correct answers in a row!`,
                icon: '🔥'
            });
        }

        return achievements;
    }

    // Utility Methods

    /**
     * Check if user's answer matches correct answer
     */
    checkAnswer(userAnswer, correctAnswer) {
        // Handle different answer types
        if (typeof correctAnswer === 'number') {
            return parseFloat(userAnswer) === correctAnswer;
        }
        
        if (typeof correctAnswer === 'string') {
            return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
        }
        
        return userAnswer === correctAnswer;
    }

    /**
     * Get current performance level for AI phrase generation
     */
    getPerformanceLevel() {
        const accuracy = this.sessionStats.questionsAttempted > 0 ? 
            this.sessionStats.questionsCorrect / this.sessionStats.questionsAttempted : 0;
        
        if (accuracy >= 0.9) return 'excellent';
        if (accuracy >= 0.75) return 'good';
        if (accuracy >= 0.5) return 'improving';
        return 'struggling';
    }

    /**
     * Get operations based on difficulty level
     */
    getOperationsForDifficulty(difficulty) {
        switch (difficulty) {
            case 'easy':
                return ['addition'];
            case 'medium':
                return ['addition', 'subtraction'];
            case 'hard':
                return ['addition', 'subtraction', 'multiplication'];
            default:
                return ['addition'];
        }
    }

    /**
     * Get number ranges based on difficulty
     */
    getNumbersForDifficulty(difficulty, operation) {
        let maxA, maxB;
        
        switch (difficulty) {
            case 'easy':
                maxA = operation === 'multiplication' ? 3 : 5;
                maxB = operation === 'multiplication' ? 3 : 5;
                break;
            case 'medium':
                maxA = operation === 'multiplication' ? 5 : 10;
                maxB = operation === 'multiplication' ? 5 : 10;
                break;
            case 'hard':
                maxA = operation === 'multiplication' ? 8 : 20;
                maxB = operation === 'multiplication' ? 8 : 20;
                break;
            default:
                maxA = maxB = 5;
        }

        const a = Math.floor(Math.random() * maxA) + 1;
        const b = Math.floor(Math.random() * maxB) + 1;
        
        return { a, b };
    }

    /**
     * Generate multiple choice options for arithmetic questions
     */
    generateArithmeticOptions(correctAnswer, difficulty) {
        const options = [correctAnswer];
        const range = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 8;
        
        while (options.length < 4) {
            const variation = Math.floor(Math.random() * range * 2) - range;
            const option = correctAnswer + variation;
            
            if (option > 0 && option !== correctAnswer && !options.includes(option)) {
                options.push(option);
            }
        }
        
        // Shuffle options
        return options.sort(() => Math.random() - 0.5);
    }

    /**
     * Create visual elements for arithmetic problems
     */
    createAdditionVisual(a, b) {
        return {
            type: 'addition_visual',
            items: [
                { type: 'group', count: a, color: 'purple' },
                { type: 'operator', symbol: '+' },
                { type: 'group', count: b, color: 'blue' },
                { type: 'operator', symbol: '=' },
                { type: 'placeholder', text: '?' }
            ]
        };
    }

    createSubtractionVisual(larger, smaller) {
        return {
            type: 'subtraction_visual',
            items: [
                { type: 'group', count: larger, color: 'purple', strikethrough: smaller },
                { type: 'operator', symbol: '-' },
                { type: 'group', count: smaller, color: 'red' },
                { type: 'operator', symbol: '=' },
                { type: 'placeholder', text: '?' }
            ]
        };
    }

    createMultiplicationVisual(a, b) {
        return {
            type: 'multiplication_visual',
            items: [
                { type: 'grid', rows: a, cols: b, color: 'purple' },
                { type: 'expression', text: `${a} × ${b} = ?` }
            ]
        };
    }

    /**
     * Create clock visual for time questions
     */
    createClockVisual(hour, minute) {
        // Convert to 12-hour format
        const displayHour = hour > 12 ? hour - 12 : hour;
        
        // Calculate angles
        const hourAngle = (displayHour % 12) * 30 + (minute * 0.5); // 30° per hour + minute adjustment
        const minuteAngle = minute * 6; // 6° per minute

        return {
            type: 'analog_clock',
            hour: displayHour,
            minute: minute,
            hourAngle: hourAngle,
            minuteAngle: minuteAngle,
            numbers: [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        };
    }

    /**
     * Get display name for game types
     */
    getGameDisplayName(gameType) {
        const names = {
            arithmetic: 'Number Magic',
            time: 'Time Wizard',
            patterns: 'Pattern Quest',
            shapes: 'Shape Explorer'
        };
        return names[gameType] || gameType;
    }

    /**
     * Generate helpful hints for different problem types
     */
    generateArithmeticHints(operation, numbers) {
        switch (operation) {
            case 'addition':
                return [
                    `Try counting up from ${Math.max(numbers.a, numbers.b)}! 🔢`,
                    `Use your fingers or the dots to help count! ✋`,
                    `Think: ${numbers.a} and ${numbers.b} more makes...? 🤔`
                ];
            case 'subtraction':
                return [
                    `Start with ${Math.max(numbers.a, numbers.b)} and count backwards! ⬇️`,
                    `Think: what's left when you take away ${Math.min(numbers.a, numbers.b)}? 🤔`,
                    `Cover up some dots to see what remains! 👐`
                ];
            case 'multiplication':
                return [
                    `Count the dots in groups! 📊`,
                    `Think: ${numbers.a} groups of ${numbers.b}... 🤔`,
                    `Add ${numbers.a} to itself ${numbers.b} times! ➕`
                ];
            default:
                return ['Take your time and think it through! 🤔'];
        }
    }

    generateTimeHints(hour, minute) {
        const hints = ['The short hand points to the hour! ⏰'];
        
        if (minute === 0) {
            hints.push(`The long hand points straight up when it's o'clock! ⬆️`);
        } else if (minute === 30) {
            hints.push(`The long hand points down when it's half past! ⬇️`);
        } else {
            hints.push(`The long hand shows the minutes! 🕐`);
        }
        
        hints.push(`Count around the clock face to find the time! 🔄`);
        return hints;
    }

    generateArithmeticExplanation(operation, numbers, answer) {
        switch (operation) {
            case 'addition':
                return `${numbers.a} + ${numbers.b} = ${answer}. Great! When we add numbers together, we get a bigger number! 🌟`;
            case 'subtraction':
                return `${Math.max(numbers.a, numbers.b)} - ${Math.min(numbers.a, numbers.b)} = ${answer}. Perfect! Subtraction means taking away! 👍`;
            case 'multiplication':
                return `${numbers.a} × ${numbers.b} = ${answer}. Excellent! Multiplication is like adding groups together! 🎯`;
            default:
                return 'Great job solving that math problem! 🌟';
        }
    }

    generateTimeExplanation(hour, minute) {
        if (minute === 0) {
            return `It's ${hour} o'clock! The short hand points to ${hour} and the long hand points to 12! 🕐`;
        } else if (minute === 30) {
            return `It's ${hour}:30 (half past ${hour})! The short hand is between ${hour} and ${hour + 1}, and the long hand points to 6! 🕕`;
        } else {
            return `It's ${hour}:${minute.toString().padStart(2, '0')}! The short hand points near ${hour} and the long hand shows ${minute} minutes! ⏰`;
        }
    }
}

/**
 * Adaptive Difficulty Engine
 * Adjusts question difficulty based on user performance patterns
 */
class AdaptiveDifficultyEngine {
    constructor() {
        this.performanceHistory = new Map();
        this.difficultyLevels = ['easy', 'medium', 'hard'];
        this.userPreferences = null;
    }

    initialize(userProfile) {
        this.userPreferences = userProfile;
        
        // Set initial difficulty based on age group
        const ageGroup = userProfile.age_group;
        switch (ageGroup) {
            case '3':
            case '4':
                this.baseDifficulty = 'easy';
                break;
            case '5':
            case '6':
                this.baseDifficulty = 'medium';
                break;
            default:
                this.baseDifficulty = 'medium';
        }
    }

    getInitialDifficulty(gameType) {
        // Check user preference override
        if (this.userPreferences?.settings?.difficulty_preference === 'adaptive') {
            return this.baseDifficulty;
        } else {
            return this.userPreferences?.settings?.difficulty_preference || this.baseDifficulty;
        }
    }

    recordAttempt(gameType, difficulty, isCorrect, timeSpent) {
        if (!this.performanceHistory.has(gameType)) {
            this.performanceHistory.set(gameType, []);
        }

        const history = this.performanceHistory.get(gameType);
        history.push({
            difficulty,
            isCorrect,
            timeSpent,
            timestamp: Date.now()
        });

        // Keep only recent history (last 20 attempts)
        if (history.length > 20) {
            history.shift();
        }
    }

    getNextDifficulty(gameType, sessionStats) {
        // If not using adaptive difficulty, maintain current level
        if (this.userPreferences?.settings?.difficulty_preference !== 'adaptive') {
            return sessionStats.difficultyLevel;
        }

        const history = this.performanceHistory.get(gameType) || [];
        const recentHistory = history.slice(-5); // Look at last 5 attempts
        
        if (recentHistory.length < 3) {
            return sessionStats.difficultyLevel; // Not enough data
        }

        const recentAccuracy = recentHistory.filter(h => h.isCorrect).length / recentHistory.length;
        const recentAvgTime = recentHistory.reduce((sum, h) => sum + h.timeSpent, 0) / recentHistory.length;
        
        const currentDifficultyIndex = this.difficultyLevels.indexOf(sessionStats.difficultyLevel);
        
        // Increase difficulty if performing well
        if (recentAccuracy >= 0.8 && recentAvgTime < 20 && currentDifficultyIndex < 2) {
            return this.difficultyLevels[currentDifficultyIndex + 1];
        }
        
        // Decrease difficulty if struggling
        if (recentAccuracy <= 0.4 && currentDifficultyIndex > 0) {
            return this.difficultyLevels[currentDifficultyIndex - 1];
        }
        
        // Keep current difficulty
        return sessionStats.difficultyLevel;
    }

    getRecommendedDifficulty() {
        return this.baseDifficulty;
    }
}

export default GameEngine;