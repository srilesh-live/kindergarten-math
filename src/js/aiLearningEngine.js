/**
 * AI Learning Engine
 * Adaptive difficulty system with contextual phrase generation
 * Kindergarten Math Adventure v3
 */

import { AI_CONFIG, APP_CONFIG, STORAGE_CONFIG } from './config.js';

/**
 * AI Learning Engine Class
 * Manages adaptive difficulty, performance analysis, and personalized feedback
 */
export class AILearningEngine {
    constructor(userManager) {
        this.userManager = userManager;
        this.performanceData = new Map();
        this.difficultyAdjustments = new Map();
        this.learningPatterns = new Map();
        this.feedbackHistory = [];
        this.sessionData = {
            startTime: null,
            questionsAnswered: 0,
            correctAnswers: 0,
            averageResponseTime: 0,
            streakCount: 0,
            mistakePatterns: [],
            encouragementLevel: 'neutral'
        };

        this.init();
    }

    /**
     * Initialize the AI Learning Engine
     */
    init() {
        console.log('[AILearningEngine] Initializing AI Learning Engine');
        
        // Load existing performance data
        this.loadPerformanceData();
        
        // Listen for user changes
        window.addEventListener('userAuthChange', this.handleUserChange.bind(this));
        
        // Start new session
        this.startNewSession();
    }

    /**
     * Handle user authentication changes
     */
    handleUserChange(event) {
        const { user, isGuest } = event.detail;
        console.log('[AILearningEngine] User changed:', user.name, 'Guest:', isGuest);
        
        // Clear session data for new user
        this.startNewSession();
        
        // Load user-specific performance data
        this.loadPerformanceData();
    }

    /**
     * Start a new learning session
     */
    startNewSession() {
        this.sessionData = {
            startTime: new Date(),
            questionsAnswered: 0,
            correctAnswers: 0,
            averageResponseTime: 0,
            streakCount: 0,
            mistakePatterns: [],
            encouragementLevel: 'neutral',
            gameId: null,
            ageGroup: null
        };
        
        console.log('[AILearningEngine] New session started');
    }

    /**
     * Analyze answer and provide feedback
     */
    analyzeAnswer(questionData, userAnswer, responseTime, gameId) {
        const isCorrect = this.validateAnswer(questionData, userAnswer);
        const analysis = this.performDetailedAnalysis(questionData, userAnswer, responseTime, isCorrect);
        
        // Update session data
        this.updateSessionData(analysis, gameId);
        
        // Store performance data
        this.storePerformanceData(questionData, analysis);
        
        // Generate personalized feedback
        const feedback = this.generateFeedback(analysis);
        
        // Adjust difficulty for next question
        const difficultyAdjustment = this.calculateDifficultyAdjustment(analysis);
        
        console.log('[AILearningEngine] Answer analyzed:', {
            correct: isCorrect,
            responseTime,
            difficulty: difficultyAdjustment
        });

        return {
            isCorrect,
            feedback,
            analysis,
            difficultyAdjustment,
            encouragement: this.getEncouragementLevel()
        };
    }

    /**
     * Validate user answer against correct answer
     */
    validateAnswer(questionData, userAnswer) {
        if (Array.isArray(questionData.correctAnswer)) {
            return questionData.correctAnswer.includes(userAnswer);
        }
        
        return questionData.correctAnswer === userAnswer;
    }

    /**
     * Perform detailed answer analysis
     */
    performDetailedAnalysis(questionData, userAnswer, responseTime, isCorrect) {
        const analysis = {
            isCorrect,
            responseTime,
            questionType: questionData.type,
            difficulty: questionData.difficulty,
            concept: questionData.concept,
            timestamp: new Date().toISOString()
        };

        // Response time analysis
        analysis.responseSpeed = this.categorizeResponseTime(responseTime, questionData.difficulty);
        
        // Error pattern analysis
        if (!isCorrect) {
            analysis.errorType = this.categorizeError(questionData, userAnswer);
            analysis.conceptualGap = this.identifyConceptualGap(questionData, userAnswer);
        }

        // Confidence analysis (based on response time and accuracy)
        analysis.confidence = this.calculateConfidence(responseTime, isCorrect, questionData.difficulty);

        return analysis;
    }

    /**
     * Update session tracking data
     */
    updateSessionData(analysis, gameId) {
        this.sessionData.gameId = gameId;
        this.sessionData.questionsAnswered++;
        
        if (analysis.isCorrect) {
            this.sessionData.correctAnswers++;
            this.sessionData.streakCount++;
        } else {
            this.sessionData.streakCount = 0;
            this.sessionData.mistakePatterns.push({
                concept: analysis.concept,
                errorType: analysis.errorType,
                timestamp: analysis.timestamp
            });
        }

        // Update average response time
        const totalResponseTime = this.sessionData.averageResponseTime * (this.sessionData.questionsAnswered - 1) + analysis.responseTime;
        this.sessionData.averageResponseTime = totalResponseTime / this.sessionData.questionsAnswered;

        // Update encouragement level
        this.updateEncouragementLevel(analysis);
    }

    /**
     * Store performance data for learning
     */
    storePerformanceData(questionData, analysis) {
        const concept = questionData.concept;
        
        if (!this.performanceData.has(concept)) {
            this.performanceData.set(concept, {
                totalAttempts: 0,
                correctAttempts: 0,
                averageResponseTime: 0,
                difficultyHistory: [],
                errorPatterns: [],
                lastPracticed: null,
                masteryLevel: 0
            });
        }

        const conceptData = this.performanceData.get(concept);
        conceptData.totalAttempts++;
        conceptData.lastPracticed = new Date().toISOString();
        
        if (analysis.isCorrect) {
            conceptData.correctAttempts++;
        } else {
            conceptData.errorPatterns.push(analysis.errorType);
        }

        // Update average response time
        conceptData.averageResponseTime = (
            (conceptData.averageResponseTime * (conceptData.totalAttempts - 1)) + 
            analysis.responseTime
        ) / conceptData.totalAttempts;

        // Track difficulty progression
        conceptData.difficultyHistory.push({
            difficulty: questionData.difficulty,
            success: analysis.isCorrect,
            timestamp: analysis.timestamp
        });

        // Calculate mastery level (0-1 scale)
        conceptData.masteryLevel = this.calculateMasteryLevel(conceptData);

        // Save to storage
        this.savePerformanceData();
    }

    /**
     * Generate personalized feedback
     */
    generateFeedback(analysis) {
        const isGuest = this.userManager.isGuest;
        const hasAIPersonalization = this.userManager.hasFeatureAccess('aiPersonalization');

        let feedback = {
            message: '',
            tone: 'neutral',
            suggestion: '',
            encouragement: '',
            visualAid: null
        };

        if (analysis.isCorrect) {
            feedback = this.generatePositiveFeedback(analysis, hasAIPersonalization);
        } else {
            feedback = this.generateCorrectiveFeedback(analysis, hasAIPersonalization);
        }

        // For guest users, use simpler, generic feedback
        if (isGuest || !hasAIPersonalization) {
            feedback = this.simplifyFeedbackForGuests(feedback, analysis.isCorrect);
        }

        this.feedbackHistory.push({
            ...feedback,
            timestamp: new Date().toISOString(),
            sessionContext: { ...this.sessionData }
        });

        return feedback;
    }

    /**
     * Generate positive feedback for correct answers
     */
    generatePositiveFeedback(analysis, personalized = true) {
        const encouragementPhrases = personalized ? 
            AI_CONFIG.PHRASES.ENCOURAGEMENT.PERSONALIZED : 
            AI_CONFIG.PHRASES.ENCOURAGEMENT.GENERIC;

        const responseSpeedPhrases = AI_CONFIG.PHRASES.RESPONSE_SPEED[analysis.responseSpeed.toUpperCase()] || 
            AI_CONFIG.PHRASES.RESPONSE_SPEED.NORMAL;

        let message = this.selectRandomPhrase(encouragementPhrases.CORRECT);
        let encouragement = '';

        // Add response speed feedback
        if (analysis.responseSpeed === 'fast') {
            encouragement = this.selectRandomPhrase(responseSpeedPhrases);
        }

        // Add streak recognition
        if (this.sessionData.streakCount >= 3) {
            const streakPhrases = personalized ? 
                AI_CONFIG.PHRASES.ENCOURAGEMENT.PERSONALIZED.STREAK :
                AI_CONFIG.PHRASES.ENCOURAGEMENT.GENERIC.STREAK;
            encouragement = this.selectRandomPhrase(streakPhrases);
        }

        return {
            message,
            tone: 'positive',
            suggestion: '',
            encouragement,
            visualAid: this.getVisualAid('success', analysis.concept)
        };
    }

    /**
     * Generate corrective feedback for incorrect answers
     */
    generateCorrectiveFeedback(analysis, personalized = true) {
        const encouragementPhrases = personalized ? 
            AI_CONFIG.PHRASES.ENCOURAGEMENT.PERSONALIZED : 
            AI_CONFIG.PHRASES.ENCOURAGEMENT.GENERIC;

        let message = this.selectRandomPhrase(encouragementPhrases.INCORRECT);
        let suggestion = '';

        // Provide specific guidance based on error type
        if (analysis.errorType && AI_CONFIG.ERROR_GUIDANCE[analysis.errorType]) {
            suggestion = this.selectRandomPhrase(AI_CONFIG.ERROR_GUIDANCE[analysis.errorType]);
        }

        // Adjust tone based on encouragement level
        const tone = this.sessionData.encouragementLevel === 'high' ? 'supportive' : 'gentle';

        return {
            message,
            tone,
            suggestion,
            encouragement: this.selectRandomPhrase(encouragementPhrases.MOTIVATION),
            visualAid: this.getVisualAid('hint', analysis.concept)
        };
    }

    /**
     * Simplify feedback for guest users
     */
    simplifyFeedbackForGuests(feedback, isCorrect) {
        const simplePhrases = isCorrect ? 
            ['Great job!', 'Excellent!', 'Well done!', 'Perfect!'] :
            ['Try again!', 'Almost there!', 'Keep trying!', 'You can do it!'];

        return {
            message: this.selectRandomPhrase(simplePhrases),
            tone: isCorrect ? 'positive' : 'encouraging',
            suggestion: isCorrect ? '' : 'Think about it step by step.',
            encouragement: '',
            visualAid: null
        };
    }

    /**
     * Calculate difficulty adjustment for next question
     */
    calculateDifficultyAdjustment(analysis) {
        const currentAccuracy = this.sessionData.correctAnswers / this.sessionData.questionsAnswered;
        const conceptPerformance = this.getConceptPerformance(analysis.concept);
        
        let adjustment = {
            change: 0, // -2 to +2 scale
            reason: '',
            targetDifficulty: analysis.difficulty
        };

        // Base adjustment on recent performance
        if (this.sessionData.streakCount >= 3 && currentAccuracy > 0.8) {
            adjustment.change = 1;
            adjustment.reason = 'consistent_success';
        } else if (this.sessionData.streakCount === 0 && currentAccuracy < 0.5) {
            adjustment.change = -1;
            adjustment.reason = 'struggling_pattern';
        }

        // Consider response time
        if (analysis.responseSpeed === 'fast' && analysis.isCorrect) {
            adjustment.change += 0.5;
            adjustment.reason += '_fast_response';
        } else if (analysis.responseSpeed === 'slow') {
            adjustment.change -= 0.5;
            adjustment.reason += '_slow_response';
        }

        // Consider concept mastery
        if (conceptPerformance && conceptPerformance.masteryLevel > 0.8) {
            adjustment.change += 0.5;
            adjustment.reason += '_concept_mastery';
        } else if (conceptPerformance && conceptPerformance.masteryLevel < 0.3) {
            adjustment.change -= 0.5;
            adjustment.reason += '_concept_struggle';
        }

        // Ensure adjustment stays within bounds
        adjustment.change = Math.max(-2, Math.min(2, adjustment.change));
        adjustment.targetDifficulty = Math.max(1, Math.min(5, analysis.difficulty + adjustment.change));

        return adjustment;
    }

    /**
     * Categorize response time
     */
    categorizeResponseTime(responseTime, difficulty) {
        const thresholds = AI_CONFIG.ANALYSIS.RESPONSE_TIME_THRESHOLDS;
        const difficultyMultiplier = 1 + (difficulty - 1) * 0.3; // Adjust for difficulty
        
        if (responseTime < thresholds.FAST * difficultyMultiplier) {
            return 'fast';
        } else if (responseTime < thresholds.NORMAL * difficultyMultiplier) {
            return 'normal';
        } else if (responseTime < thresholds.SLOW * difficultyMultiplier) {
            return 'slow';
        } else {
            return 'very_slow';
        }
    }

    /**
     * Categorize error type
     */
    categorizeError(questionData, userAnswer) {
        const correctAnswer = questionData.correctAnswer;
        
        // Numerical errors
        if (typeof correctAnswer === 'number' && typeof userAnswer === 'number') {
            const diff = Math.abs(correctAnswer - userAnswer);
            
            if (diff === 1) return 'off_by_one';
            if (diff <= correctAnswer * 0.1) return 'close_approximation';
            if (userAnswer === correctAnswer * 10 || userAnswer === correctAnswer / 10) return 'decimal_place';
            if (diff > correctAnswer) return 'overestimation';
            return 'underestimation';
        }

        // Pattern-based errors
        if (questionData.type === 'pattern') {
            return 'pattern_misunderstanding';
        }

        // Time-based errors
        if (questionData.type === 'time') {
            return 'time_concept_gap';
        }

        return 'conceptual_misunderstanding';
    }

    /**
     * Identify conceptual gaps
     */
    identifyConceptualGap(questionData, userAnswer) {
        // This would normally use more sophisticated analysis
        // For now, map to basic concept areas
        const conceptMap = {
            'addition': ['number_sense', 'counting'],
            'subtraction': ['number_sense', 'inverse_operations'],
            'counting': ['number_sequence', 'one_to_one_correspondence'],
            'shapes': ['spatial_awareness', 'attribute_recognition'],
            'patterns': ['sequence_recognition', 'logical_reasoning'],
            'time': ['temporal_concepts', 'number_application']
        };

        return conceptMap[questionData.concept] || ['basic_understanding'];
    }

    /**
     * Calculate confidence score
     */
    calculateConfidence(responseTime, isCorrect, difficulty) {
        let confidence = 0.5; // Base confidence

        if (isCorrect) {
            confidence += 0.3;
            
            // Faster responses indicate higher confidence
            if (responseTime < 3000) confidence += 0.2;
            else if (responseTime < 5000) confidence += 0.1;
        } else {
            confidence -= 0.3;
        }

        // Adjust for difficulty
        const difficultyFactor = (6 - difficulty) / 10; // Easier questions should have higher confidence when correct
        confidence += difficultyFactor * 0.1;

        return Math.max(0, Math.min(1, confidence));
    }

    /**
     * Update encouragement level based on performance
     */
    updateEncouragementLevel(analysis) {
        const accuracy = this.sessionData.correctAnswers / this.sessionData.questionsAnswered;
        
        if (accuracy > 0.8 && this.sessionData.streakCount >= 2) {
            this.sessionData.encouragementLevel = 'low'; // Student is doing well, less encouragement needed
        } else if (accuracy < 0.4 || this.sessionData.streakCount === 0) {
            this.sessionData.encouragementLevel = 'high'; // Student needs more support
        } else {
            this.sessionData.encouragementLevel = 'normal';
        }
    }

    /**
     * Calculate mastery level for a concept
     */
    calculateMasteryLevel(conceptData) {
        if (conceptData.totalAttempts === 0) return 0;

        const accuracy = conceptData.correctAttempts / conceptData.totalAttempts;
        const attemptFactor = Math.min(conceptData.totalAttempts / 10, 1); // Consider number of attempts
        const recencyFactor = this.calculateRecencyFactor(conceptData.lastPracticed);
        
        return accuracy * attemptFactor * recencyFactor;
    }

    /**
     * Calculate recency factor (how recently was this practiced)
     */
    calculateRecencyFactor(lastPracticed) {
        if (!lastPracticed) return 0.5;
        
        const daysSince = (new Date() - new Date(lastPracticed)) / (1000 * 60 * 60 * 24);
        
        if (daysSince < 1) return 1.0;
        if (daysSince < 7) return 0.9;
        if (daysSince < 30) return 0.7;
        return 0.5;
    }

    /**
     * Get concept performance data
     */
    getConceptPerformance(concept) {
        return this.performanceData.get(concept) || null;
    }

    /**
     * Get encouragement level
     */
    getEncouragementLevel() {
        return this.sessionData.encouragementLevel;
    }

    /**
     * Get visual aid for feedback
     */
    getVisualAid(type, concept) {
        const visualAids = {
            success: {
                addition: '✨ Great counting!',
                subtraction: '🎯 Perfect!',
                patterns: '🧩 Pattern master!',
                shapes: '🔷 Shape expert!',
                time: '🕐 Time wizard!'
            },
            hint: {
                addition: '👆 Try counting with your fingers',
                subtraction: '➖ Think about taking away',
                patterns: '🔍 Look for what repeats',
                shapes: '👀 Look at the corners and sides',
                time: '🕐 Think about the clock hands'
            }
        };

        return visualAids[type]?.[concept] || null;
    }

    /**
     * Select random phrase from array
     */
    selectRandomPhrase(phrases) {
        if (!Array.isArray(phrases) || phrases.length === 0) {
            return 'Keep going!';
        }
        return phrases[Math.floor(Math.random() * phrases.length)];
    }

    /**
     * Load performance data from storage
     */
    loadPerformanceData() {
        try {
            const userId = this.userManager.user?.id || 'guest';
            const storageKey = `${STORAGE_CONFIG.KEYS.PERFORMANCE}_${userId}`;
            const savedData = localStorage.getItem(storageKey);
            
            if (savedData) {
                const parsed = JSON.parse(savedData);
                this.performanceData = new Map(parsed.performanceData || []);
                this.learningPatterns = new Map(parsed.learningPatterns || []);
                console.log('[AILearningEngine] Performance data loaded');
            }
        } catch (error) {
            console.error('[AILearningEngine] Failed to load performance data:', error);
        }
    }

    /**
     * Save performance data to storage
     */
    savePerformanceData() {
        try {
            const userId = this.userManager.user?.id || 'guest';
            const storageKey = `${STORAGE_CONFIG.KEYS.PERFORMANCE}_${userId}`;
            
            const dataToSave = {
                performanceData: Array.from(this.performanceData.entries()),
                learningPatterns: Array.from(this.learningPatterns.entries()),
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        } catch (error) {
            console.error('[AILearningEngine] Failed to save performance data:', error);
        }
    }

    /**
     * Get session summary
     */
    getSessionSummary() {
        const accuracy = this.sessionData.questionsAnswered > 0 ? 
            (this.sessionData.correctAnswers / this.sessionData.questionsAnswered) * 100 : 0;
        
        const duration = this.sessionData.startTime ? 
            new Date() - this.sessionData.startTime : 0;

        return {
            questionsAnswered: this.sessionData.questionsAnswered,
            correctAnswers: this.sessionData.correctAnswers,
            accuracy: Math.round(accuracy),
            averageResponseTime: Math.round(this.sessionData.averageResponseTime),
            streakCount: this.sessionData.streakCount,
            duration: Math.round(duration / 1000), // seconds
            encouragementLevel: this.sessionData.encouragementLevel,
            mistakePatterns: this.sessionData.mistakePatterns
        };
    }

    /**
     * Reset session data
     */
    resetSession() {
        this.startNewSession();
    }

    /**
     * Get learning insights for authenticated users
     */
    getLearningInsights() {
        if (this.userManager.isGuest) {
            return { message: 'Sign in to track your learning progress!' };
        }

        const insights = {
            strengths: [],
            improvements: [],
            recommendations: [],
            overallProgress: 0
        };

        // Analyze performance data to generate insights
        for (const [concept, data] of this.performanceData.entries()) {
            if (data.masteryLevel > 0.8) {
                insights.strengths.push(concept);
            } else if (data.masteryLevel < 0.4) {
                insights.improvements.push(concept);
            }
        }

        // Generate recommendations
        if (insights.improvements.length > 0) {
            insights.recommendations.push(`Focus on ${insights.improvements[0]} for better understanding`);
        }

        if (insights.strengths.length > 0) {
            insights.recommendations.push(`Great progress in ${insights.strengths[0]}! Try harder challenges`);
        }

        // Calculate overall progress
        let totalMastery = 0;
        let conceptCount = 0;
        for (const data of this.performanceData.values()) {
            totalMastery += data.masteryLevel;
            conceptCount++;
        }
        insights.overallProgress = conceptCount > 0 ? (totalMastery / conceptCount) * 100 : 0;

        return insights;
    }
}

// No default export needed - class is already exported at declaration