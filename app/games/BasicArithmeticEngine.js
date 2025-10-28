/**
 * Basic Arithmetic Game Engine
 * Addition, Subtraction, Multiplication, Division with Visual Learning
 * Adaptive Difficulty & Age-Appropriate Challenges
 * Kindergarten Math Adventure v4
 */

import { GAMES_CONFIG, AI_CONFIG } from '../config/masterConfig.js';
import { AIPhrasingEngine } from '../ai/phraseEngine.js';

/**
 * Visual Mathematics Representations
 * Interactive visual aids for learning arithmetic concepts
 */
class VisualMathRenderer {
    constructor() {
        this.visualTypes = {
            COUNTING: 'counting',
            GROUPING: 'grouping',
            NUMBER_LINE: 'numberLine',
            MANIPULATIVES: 'manipulatives',
            STORY_PROBLEMS: 'storyProblems'
        };
    }

    /**
     * Generate visual representation for arithmetic problem
     */
    generateVisual(problem, visualType = 'auto') {
        const { operation, num1, num2, result } = problem;
        
        if (visualType === 'auto') {
            visualType = this.selectOptimalVisual(problem);
        }

        switch (visualType) {
            case this.visualTypes.COUNTING:
                return this.createCountingVisual(problem);
            case this.visualTypes.GROUPING:
                return this.createGroupingVisual(problem);
            case this.visualTypes.NUMBER_LINE:
                return this.createNumberLineVisual(problem);
            case this.visualTypes.MANIPULATIVES:
                return this.createManipulativesVisual(problem);
            case this.visualTypes.STORY_PROBLEMS:
                return this.createStoryProblemVisual(problem);
            default:
                return this.createCountingVisual(problem);
        }
    }

    /**
     * Select optimal visual representation based on problem
     */
    selectOptimalVisual(problem) {
        const { operation, num1, num2 } = problem;
        const maxNum = Math.max(num1, num2);
        
        if (maxNum <= 5) return this.visualTypes.COUNTING;
        if (maxNum <= 10 && operation === 'addition') return this.visualTypes.NUMBER_LINE;
        if (operation === 'multiplication') return this.visualTypes.GROUPING;
        if (operation === 'division') return this.visualTypes.GROUPING;
        if (maxNum <= 20) return this.visualTypes.MANIPULATIVES;
        
        return this.visualTypes.STORY_PROBLEMS;
    }

    /**
     * Create counting dots visual (for small numbers)
     */
    createCountingVisual(problem) {
        const { operation, num1, num2, result } = problem;
        
        return {
            type: 'counting',
            elements: {
                dots1: this.generateDotArray(num1, 'blue'),
                dots2: operation !== 'subtraction' ? this.generateDotArray(num2, 'green') : null,
                operator: this.getOperatorSymbol(operation),
                resultDots: this.generateDotArray(result, 'purple'),
                animation: this.getCountingAnimation(operation)
            },
            accessibility: {
                description: this.generateAudioDescription(problem, 'counting'),
                instructions: 'Count the dots to solve the problem'
            }
        };
    }

    /**
     * Create grouping visual (for multiplication/division)
     */
    createGroupingVisual(problem) {
        const { operation, num1, num2, result } = problem;
        
        if (operation === 'multiplication') {
            return {
                type: 'grouping',
                elements: {
                    groups: this.generateGroupsArray(num1, num2),
                    groupLabel: `${num1} groups of ${num2}`,
                    totalItems: result,
                    animation: 'groupMultiplication'
                },
                accessibility: {
                    description: `${num1} groups with ${num2} items each makes ${result} total`,
                    instructions: 'Count the groups and items in each group'
                }
            };
        } else if (operation === 'division') {
            return {
                type: 'grouping',
                elements: {
                    totalItems: num1,
                    groups: num2,
                    itemsPerGroup: result,
                    distributionArray: this.generateDivisionGroups(num1, num2),
                    animation: 'groupDivision'
                },
                accessibility: {
                    description: `${num1} items split into ${num2} groups makes ${result} in each group`,
                    instructions: 'See how the items are divided equally among the groups'
                }
            };
        }
    }

    /**
     * Create number line visual (for addition/subtraction)
     */
    createNumberLineVisual(problem) {
        const { operation, num1, num2, result } = problem;
        const maxValue = Math.max(num1 + num2, num1, result) + 2;
        
        return {
            type: 'numberLine',
            elements: {
                range: { min: 0, max: maxValue },
                startPosition: num1,
                movement: operation === 'addition' ? num2 : -num2,
                endPosition: result,
                jumpAnimation: true,
                highlightedNumbers: [num1, result]
            },
            accessibility: {
                description: this.generateAudioDescription(problem, 'numberLine'),
                instructions: 'Follow the jumps on the number line'
            }
        };
    }

    /**
     * Create manipulatives visual (blocks, objects)
     */
    createManipulativesVisual(problem) {
        const { operation, num1, num2, result } = problem;
        
        return {
            type: 'manipulatives',
            elements: {
                objects: this.selectObjectTheme(problem),
                arrangement1: this.createObjectArrangement(num1),
                arrangement2: operation !== 'subtraction' ? this.createObjectArrangement(num2) : null,
                resultArrangement: this.createObjectArrangement(result),
                animation: this.getManipulativeAnimation(operation)
            },
            accessibility: {
                description: this.generateAudioDescription(problem, 'manipulatives'),
                instructions: 'Use the objects to help you solve the problem'
            }
        };
    }

    /**
     * Create story problem visual
     */
    createStoryProblemVisual(problem) {
        const { operation, num1, num2, result } = problem;
        const story = this.generateStoryContext(problem);
        
        return {
            type: 'storyProblem',
            elements: {
                story: story,
                characters: story.characters,
                scenario: story.scenario,
                illustration: story.illustration,
                problemText: story.problemText
            },
            accessibility: {
                description: story.audioNarration,
                instructions: 'Listen to the story and solve the problem'
            }
        };
    }

    /**
     * Helper methods for visual generation
     */
    generateDotArray(count, color = 'blue') {
        const dots = [];
        const maxPerRow = 5;
        
        for (let i = 0; i < count; i++) {
            dots.push({
                id: i,
                color: color,
                row: Math.floor(i / maxPerRow),
                col: i % maxPerRow,
                animationDelay: i * 100
            });
        }
        
        return {
            dots: dots,
            rows: Math.ceil(count / maxPerRow),
            total: count
        };
    }

    generateGroupsArray(groupCount, itemsPerGroup) {
        const groups = [];
        
        for (let g = 0; g < groupCount; g++) {
            const group = {
                id: g,
                items: []
            };
            
            for (let i = 0; i < itemsPerGroup; i++) {
                group.items.push({
                    id: `${g}-${i}`,
                    groupId: g,
                    position: i
                });
            }
            
            groups.push(group);
        }
        
        return groups;
    }

    generateDivisionGroups(total, groupCount) {
        const itemsPerGroup = Math.floor(total / groupCount);
        const remainder = total % groupCount;
        const groups = [];
        
        for (let g = 0; g < groupCount; g++) {
            const group = {
                id: g,
                items: itemsPerGroup + (g < remainder ? 1 : 0)
            };
            groups.push(group);
        }
        
        return groups;
    }

    createObjectArrangement(count) {
        // Create visual arrangement optimized for counting
        if (count <= 5) {
            return { type: 'line', count: count };
        } else if (count <= 10) {
            return { type: 'twoRows', topRow: 5, bottomRow: count - 5 };
        } else {
            const rows = Math.ceil(count / 5);
            return { type: 'grid', rows: rows, itemsPerRow: 5, total: count };
        }
    }

    selectObjectTheme(problem) {
        const themes = [
            { name: 'apples', emoji: '🍎', color: '#ff6b6b' },
            { name: 'stars', emoji: '⭐', color: '#ffd93d' },
            { name: 'blocks', emoji: '🧱', color: '#6c5ce7' },
            { name: 'flowers', emoji: '🌸', color: '#fd79a8' },
            { name: 'cars', emoji: '🚗', color: '#00b894' },
            { name: 'hearts', emoji: '💜', color: '#e84393' }
        ];
        
        // Select based on problem characteristics
        const index = (problem.num1 + problem.num2) % themes.length;
        return themes[index];
    }

    generateStoryContext(problem) {
        const { operation, num1, num2, result } = problem;
        
        const storyTemplates = {
            addition: [
                {
                    scenario: 'playground',
                    template: `There were ${num1} children playing. Then ${num2} more children joined them. How many children are playing now?`,
                    characters: ['children', 'playground'],
                    illustration: '🏰👫👭'
                },
                {
                    scenario: 'animals',
                    template: `${num1} puppies were in the park. ${num2} more puppies came to play. How many puppies are there altogether?`,
                    characters: ['puppies', 'park'],
                    illustration: '🐕🌳'
                }
            ],
            subtraction: [
                {
                    scenario: 'cookies',
                    template: `Mom baked ${num1} cookies. We ate ${num2} cookies. How many cookies are left?`,
                    characters: ['mom', 'cookies'],
                    illustration: '🍪👩‍🍳'
                }
            ],
            multiplication: [
                {
                    scenario: 'boxes',
                    template: `There are ${num1} boxes. Each box has ${num2} toys. How many toys are there in total?`,
                    characters: ['boxes', 'toys'],
                    illustration: '📦🧸'
                }
            ],
            division: [
                {
                    scenario: 'sharing',
                    template: `We have ${num1} candies to share equally among ${num2} friends. How many candies will each friend get?`,
                    characters: ['candies', 'friends'],
                    illustration: '🍬👫'
                }
            ]
        };
        
        const templates = storyTemplates[operation] || storyTemplates.addition;
        const story = templates[Math.floor(Math.random() * templates.length)];
        
        return {
            ...story,
            problemText: story.template,
            audioNarration: `Story problem: ${story.template} Take your time to think about it.`,
            answer: result
        };
    }

    getOperatorSymbol(operation) {
        const symbols = {
            addition: '+',
            subtraction: '−',
            multiplication: '×',
            division: '÷'
        };
        return symbols[operation] || '+';
    }

    getCountingAnimation(operation) {
        return {
            addition: 'slideInFromLeft',
            subtraction: 'fadeOut',
            multiplication: 'groupGlow',
            division: 'separateGroups'
        }[operation] || 'slideInFromLeft';
    }

    getManipulativeAnimation(operation) {
        return {
            addition: 'combineObjects',
            subtraction: 'removeObjects',
            multiplication: 'duplicateGroups',
            division: 'distributeObjects'
        }[operation] || 'combineObjects';
    }

    generateAudioDescription(problem, visualType) {
        const { operation, num1, num2, result } = problem;
        
        const descriptions = {
            counting: `${num1} ${operation === 'addition' ? 'plus' : 'minus'} ${num2} equals ${result}. Count the dots to see the answer.`,
            numberLine: `Start at ${num1} and ${operation === 'addition' ? 'jump forward' : 'jump backward'} ${num2} spaces to reach ${result}.`,
            manipulatives: `Use the objects to show ${num1} ${this.getOperatorSymbol(operation)} ${num2} equals ${result}.`
        };
        
        return descriptions[visualType] || descriptions.counting;
    }
}

/**
 * Basic Arithmetic Game Engine
 * Handles problem generation, difficulty adaptation, and learning progression
 */
export class BasicArithmeticEngine {
    constructor(userManager, ageGroup = '5-6') {
        this.userManager = userManager;
        this.ageGroup = ageGroup;
        this.config = GAMES_CONFIG.basicArithmetic;
        this.aiEngine = new AIPhrasingEngine();
        this.visualRenderer = new VisualMathRenderer();
        
        this.currentSession = {
            questionsAsked: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            currentStreak: 0,
            longestStreak: 0,
            startTime: null,
            problems: [],
            difficulty: this.getInitialDifficulty()
        };
        
        this.masteryTracker = {
            addition: { attempts: 0, successes: 0, level: 1 },
            subtraction: { attempts: 0, successes: 0, level: 1 },
            multiplication: { attempts: 0, successes: 0, level: 1 },
            division: { attempts: 0, successes: 0, level: 1 }
        };

        this.setupEventListeners();
    }

    /**
     * Initialize the game engine
     */
    async init() {
        console.log('🔧 Initializing Basic Arithmetic Engine...');
        
        try {
            // Load user's mastery data
            await this.loadMasteryProgress();
            
            // Initialize AI engine
            await this.aiEngine.init();
            
            // Setup age-appropriate configuration
            this.setupAgeConfiguration();
            
            console.log('✅ Basic Arithmetic Engine initialized');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Arithmetic Engine:', error);
            return false;
        }
    }

    /**
     * Start a new game session
     */
    startSession(options = {}) {
        const {
            maxQuestions = this.getMaxQuestions(),
            focusOperation = null,
            difficulty = null,
            visualMode = 'auto'
        } = options;

        this.currentSession = {
            questionsAsked: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            currentStreak: 0,
            longestStreak: 0,
            startTime: Date.now(),
            maxQuestions: maxQuestions,
            focusOperation: focusOperation,
            problems: [],
            difficulty: difficulty || this.getInitialDifficulty(),
            visualMode: visualMode
        };

        this.emitGameEvent('sessionStarted', {
            session: this.currentSession,
            ageGroup: this.ageGroup
        });

        console.log('🎮 Arithmetic session started:', this.currentSession);
        return this.generateNextProblem();
    }

    /**
     * Generate next arithmetic problem
     */
    generateNextProblem() {
        if (this.isSessionComplete()) {
            return this.endSession();
        }

        const operation = this.selectOperation();
        const problem = this.createProblem(operation);
        const visual = this.visualRenderer.generateVisual(problem, this.currentSession.visualMode);
        
        const questionData = {
            id: `prob_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            problem: problem,
            visual: visual,
            timestamp: Date.now(),
            difficulty: this.currentSession.difficulty,
            operation: operation,
            expectedAnswerTime: this.getExpectedAnswerTime(problem),
            hints: this.generateHints(problem),
            encouragement: this.aiEngine.generatePhrase('pre_question', {
                operation: operation,
                difficulty: this.currentSession.difficulty,
                streak: this.currentSession.currentStreak
            })
        };

        this.currentSession.problems.push(questionData);
        this.currentSession.questionsAsked++;

        this.emitGameEvent('problemGenerated', questionData);
        return questionData;
    }

    /**
     * Create arithmetic problem based on operation and difficulty
     */
    createProblem(operation) {
        const difficulty = this.currentSession.difficulty;
        const ranges = this.config.difficulty[difficulty].numberRanges[operation];
        
        let num1, num2, result;
        
        switch (operation) {
            case 'addition':
                num1 = this.randomInRange(ranges.num1);
                num2 = this.randomInRange(ranges.num2);
                result = num1 + num2;
                
                // Ensure result is within acceptable range for age group
                if (result > ranges.result.max) {
                    num2 = ranges.result.max - num1;
                    result = num1 + num2;
                }
                break;

            case 'subtraction':
                result = this.randomInRange(ranges.result);
                num2 = this.randomInRange(ranges.num2);
                num1 = result + num2;
                
                // Ensure num1 is reasonable
                if (num1 > ranges.num1.max) {
                    num1 = ranges.num1.max;
                    result = num1 - num2;
                }
                break;

            case 'multiplication':
                num1 = this.randomInRange(ranges.num1);
                num2 = this.randomInRange(ranges.num2);
                result = num1 * num2;
                break;

            case 'division':
                num2 = this.randomInRange(ranges.num2);
                result = this.randomInRange(ranges.result);
                num1 = num2 * result;
                break;
        }

        return {
            operation: operation,
            num1: num1,
            num2: num2,
            result: result,
            equation: this.formatEquation(operation, num1, num2),
            difficulty: difficulty
        };
    }

    /**
     * Process user's answer
     */
    submitAnswer(problemId, userAnswer, timeTaken) {
        const problem = this.currentSession.problems.find(p => p.id === problemId);
        if (!problem) {
            console.error('❌ Problem not found:', problemId);
            return null;
        }

        const isCorrect = userAnswer === problem.problem.result;
        const response = this.processAnswer(problem, isCorrect, timeTaken, userAnswer);
        
        // Update mastery tracking
        this.updateMastery(problem.operation, isCorrect);
        
        // Adjust difficulty if needed
        this.adjustDifficulty();
        
        this.emitGameEvent('answerSubmitted', {
            problem: problem,
            userAnswer: userAnswer,
            correct: isCorrect,
            response: response,
            timeTaken: timeTaken
        });

        return response;
    }

    /**
     * Process answer and generate appropriate response
     */
    processAnswer(problem, isCorrect, timeTaken, userAnswer) {
        const expectedTime = problem.expectedAnswerTime;
        const wasQuick = timeTaken < expectedTime * 0.8;
        const wasSlow = timeTaken > expectedTime * 1.5;
        
        if (isCorrect) {
            this.currentSession.correctAnswers++;
            this.currentSession.currentStreak++;
            this.currentSession.longestStreak = Math.max(
                this.currentSession.longestStreak, 
                this.currentSession.currentStreak
            );
            
            return {
                correct: true,
                message: this.aiEngine.generatePhrase('correct_answer', {
                    operation: problem.operation,
                    streak: this.currentSession.currentStreak,
                    wasQuick: wasQuick,
                    difficulty: problem.difficulty,
                    encouragementLevel: this.getEncouragementLevel()
                }),
                celebration: this.getCelebrationLevel(),
                showVisualExplanation: false,
                nextAction: 'continue'
            };
        } else {
            this.currentSession.incorrectAnswers++;
            this.currentSession.currentStreak = 0;
            
            return {
                correct: false,
                message: this.aiEngine.generatePhrase('incorrect_answer', {
                    operation: problem.operation,
                    correctAnswer: problem.problem.result,
                    userAnswer: userAnswer,
                    supportLevel: this.getSupportLevel(),
                    encouragementLevel: 'high'
                }),
                correctAnswer: problem.problem.result,
                explanation: this.generateExplanation(problem),
                visualExplanation: this.visualRenderer.generateVisual(problem.problem, 'counting'),
                hints: this.generateDetailedHints(problem),
                nextAction: this.shouldOfferRetry() ? 'retry' : 'continue'
            };
        }
    }

    /**
     * Generate hints for the problem
     */
    generateHints(problem) {
        const { operation, num1, num2 } = problem.problem;
        const hints = [];
        
        switch (operation) {
            case 'addition':
                hints.push(`Start with ${num1} and count up ${num2} more`);
                if (num2 <= 5) {
                    hints.push(`Use your fingers to count: ${num1} + ${num2}`);
                }
                hints.push('Try using the dots or objects to help you count');
                break;
                
            case 'subtraction':
                hints.push(`Start with ${num1} and take away ${num2}`);
                hints.push('Cross out items as you subtract them');
                break;
                
            case 'multiplication':
                hints.push(`Make ${num1} groups with ${num2} items in each group`);
                hints.push('Count all the items in all the groups');
                break;
                
            case 'division':
                hints.push(`Share ${num1} items equally into ${num2} groups`);
                hints.push('How many items will be in each group?');
                break;
        }
        
        return hints;
    }

    /**
     * Generate detailed explanation for incorrect answers
     */
    generateExplanation(problem) {
        const { operation, num1, num2, result } = problem.problem;
        
        const explanations = {
            addition: `Let's add step by step: ${num1} + ${num2}. Start with ${num1}, then count ${num2} more: ${this.generateCountingSequence(num1, num2, 'up')} = ${result}`,
            subtraction: `Let's subtract step by step: ${num1} - ${num2}. Start with ${num1}, then count ${num2} back: ${this.generateCountingSequence(num1, num2, 'down')} = ${result}`,
            multiplication: `Let's multiply: ${num1} × ${num2} means ${num1} groups of ${num2}. That's ${num2} + ${num2}${' + ' + num2.repeat(num1 - 2)} = ${result}`,
            division: `Let's divide: ${num1} ÷ ${num2} means sharing ${num1} equally into ${num2} groups. Each group gets ${result}.`
        };
        
        return explanations[operation] || explanations.addition;
    }

    /**
     * Helper methods
     */
    selectOperation() {
        if (this.currentSession.focusOperation) {
            return this.currentSession.focusOperation;
        }
        
        // Select based on mastery levels and age appropriateness
        const availableOps = this.getAvailableOperations();
        const weights = this.calculateOperationWeights(availableOps);
        
        return this.weightedRandomSelect(availableOps, weights);
    }

    getAvailableOperations() {
        const ageConfig = this.config.ageGroups[this.ageGroup];
        const difficulty = this.currentSession.difficulty;
        
        return ageConfig.operations.filter(op => 
            this.config.difficulty[difficulty].operations.includes(op)
        );
    }

    calculateOperationWeights(operations) {
        return operations.map(op => {
            const mastery = this.masteryTracker[op];
            const successRate = mastery.attempts > 0 ? mastery.successes / mastery.attempts : 0;
            
            // Lower success rate = higher weight (more practice needed)
            return Math.max(0.1, 1 - successRate);
        });
    }

    weightedRandomSelect(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        
        return items[0]; // Fallback
    }

    randomInRange(range) {
        return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }

    formatEquation(operation, num1, num2) {
        const symbols = {
            addition: '+',
            subtraction: '−',
            multiplication: '×',
            division: '÷'
        };
        
        return `${num1} ${symbols[operation]} ${num2} = ?`;
    }

    generateCountingSequence(start, count, direction) {
        const sequence = [start];
        let current = start;
        
        for (let i = 0; i < count; i++) {
            current += direction === 'up' ? 1 : -1;
            sequence.push(current);
        }
        
        return sequence.join(', ');
    }

    /**
     * Difficulty and mastery management
     */
    getInitialDifficulty() {
        const userLevel = this.userManager.currentUser?.stats?.level || 1;
        const ageConfig = this.config.ageGroups[this.ageGroup];
        
        return ageConfig.defaultDifficulty;
    }

    adjustDifficulty() {
        const recentProblems = this.currentSession.problems.slice(-5);
        const recentCorrect = recentProblems.filter(p => p.wasCorrect).length;
        const accuracy = recentCorrect / recentProblems.length;
        
        if (accuracy >= 0.8 && this.currentSession.currentStreak >= 3) {
            this.increaseDifficulty();
        } else if (accuracy <= 0.4) {
            this.decreaseDifficulty();
        }
    }

    increaseDifficulty() {
        const difficulties = Object.keys(this.config.difficulty);
        const currentIndex = difficulties.indexOf(this.currentSession.difficulty);
        
        if (currentIndex < difficulties.length - 1) {
            this.currentSession.difficulty = difficulties[currentIndex + 1];
            console.log('📈 Difficulty increased to:', this.currentSession.difficulty);
        }
    }

    decreaseDifficulty() {
        const difficulties = Object.keys(this.config.difficulty);
        const currentIndex = difficulties.indexOf(this.currentSession.difficulty);
        
        if (currentIndex > 0) {
            this.currentSession.difficulty = difficulties[currentIndex - 1];
            console.log('📉 Difficulty decreased to:', this.currentSession.difficulty);
        }
    }

    updateMastery(operation, correct) {
        this.masteryTracker[operation].attempts++;
        if (correct) {
            this.masteryTracker[operation].successes++;
        }
        
        // Update mastery level
        const mastery = this.masteryTracker[operation];
        const successRate = mastery.successes / mastery.attempts;
        
        if (successRate >= 0.8 && mastery.attempts >= 10) {
            mastery.level = Math.min(mastery.level + 1, 5);
        }
    }

    /**
     * Session management
     */
    isSessionComplete() {
        return this.currentSession.questionsAsked >= this.currentSession.maxQuestions;
    }

    endSession() {
        const sessionDuration = Date.now() - this.currentSession.startTime;
        const accuracy = this.currentSession.correctAnswers / this.currentSession.questionsAsked;
        
        const sessionResults = {
            questionsAnswered: this.currentSession.questionsAsked,
            correctAnswers: this.currentSession.correctAnswers,
            accuracy: accuracy,
            timeSpent: sessionDuration,
            longestStreak: this.currentSession.longestStreak,
            masteryProgress: this.masteryTracker,
            difficulty: this.currentSession.difficulty,
            gameType: 'basic-arithmetic'
        };

        // Update user progress
        this.userManager.updateProgress(sessionResults);
        
        this.emitGameEvent('sessionEnded', sessionResults);
        
        return {
            type: 'session_complete',
            results: sessionResults,
            celebration: this.generateSessionCelebration(sessionResults),
            recommendations: this.generateRecommendations(sessionResults)
        };
    }

    /**
     * Utility methods
     */
    getMaxQuestions() {
        if (this.userManager.canAccess('unlimited_questions')) {
            return this.config.ageGroups[this.ageGroup].maxQuestions;
        }
        return this.config.ageGroups[this.ageGroup].guestMaxQuestions || 5;
    }

    getExpectedAnswerTime(problem) {
        const baseTimes = {
            beginner: 15000,  // 15 seconds
            easy: 12000,      // 12 seconds
            medium: 10000,    // 10 seconds
            challenging: 8000  // 8 seconds
        };
        
        return baseTimes[problem.difficulty] || 12000;
    }

    getCelebrationLevel() {
        if (this.currentSession.currentStreak >= 5) return 'amazing';
        if (this.currentSession.currentStreak >= 3) return 'great';
        return 'good';
    }

    getEncouragementLevel() {
        const accuracy = this.currentSession.correctAnswers / this.currentSession.questionsAsked;
        if (accuracy >= 0.8) return 'high';
        if (accuracy >= 0.6) return 'medium';
        return 'supportive';
    }

    getSupportLevel() {
        const recent = this.currentSession.problems.slice(-3);
        const recentErrors = recent.filter(p => !p.wasCorrect).length;
        
        if (recentErrors >= 2) return 'high';
        return 'standard';
    }

    shouldOfferRetry() {
        return this.currentSession.incorrectAnswers < 2;
    }

    generateSessionCelebration(results) {
        return this.aiEngine.generatePhrase('session_complete', {
            accuracy: results.accuracy,
            questionsAnswered: results.questionsAnswered,
            streak: results.longestStreak,
            timeSpent: results.timeSpent
        });
    }

    generateRecommendations(results) {
        const recommendations = [];
        
        // Analyze performance by operation
        Object.entries(this.masteryTracker).forEach(([op, data]) => {
            const rate = data.attempts > 0 ? data.successes / data.attempts : 0;
            if (rate < 0.6 && data.attempts >= 3) {
                recommendations.push(`Practice more ${op} problems`);
            }
        });
        
        if (results.accuracy >= 0.9) {
            recommendations.push('Try a higher difficulty level');
        } else if (results.accuracy < 0.5) {
            recommendations.push('Take your time and use the visual aids');
        }
        
        return recommendations;
    }

    /**
     * Configuration setup
     */
    setupAgeConfiguration() {
        const ageConfig = this.config.ageGroups[this.ageGroup];
        if (!ageConfig) {
            console.warn('⚠️ Age group not found, using default:', this.ageGroup);
            this.ageGroup = '5-6';
        }
    }

    async loadMasteryProgress() {
        // Load from user's saved progress
        if (!this.userManager.isGuest && this.userManager.currentUser.gameProgress) {
            const saved = this.userManager.currentUser.gameProgress.basicArithmetic;
            if (saved?.mastery) {
                this.masteryTracker = { ...this.masteryTracker, ...saved.mastery };
            }
        }
    }

    /**
     * Event system
     */
    setupEventListeners() {
        // Listen for user events
        window.addEventListener('user_progressUpdated', (event) => {
            // Handle user progress updates
        });
    }

    emitGameEvent(eventName, data) {
        const event = new CustomEvent(`game_${eventName}`, {
            detail: {
                gameType: 'basic-arithmetic',
                ageGroup: this.ageGroup,
                ...data
            }
        });
        window.dispatchEvent(event);
    }
}

export default BasicArithmeticEngine;