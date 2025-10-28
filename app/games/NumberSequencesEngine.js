/**
 * Number Sequences Game Engine
 * Pattern Recognition, Counting Sequences, and Number Logic
 * Visual Pattern Learning with Age-Appropriate Challenges
 * Kindergarten Math Adventure v4
 */

import { GAMES_CONFIG, AI_CONFIG } from '../config/masterConfig.js';
import { AIPhrasingEngine } from '../ai/phraseEngine.js';

/**
 * Pattern Visual Renderer
 * Creates visual representations for number sequence patterns
 */
class PatternVisualRenderer {
    constructor() {
        this.patternTypes = {
            VISUAL_COUNTING: 'visualCounting',
            COLOR_PATTERNS: 'colorPatterns',
            SHAPE_SEQUENCES: 'shapeSequences',
            SIZE_PROGRESSION: 'sizeProgression',
            INTERACTIVE_BUILDER: 'interactiveBuilder'
        };
        
        this.visualThemes = {
            animals: { base: '🐱', variants: ['🐶', '🐰', '🐸', '🐧', '🦋'] },
            shapes: { base: '●', variants: ['▲', '■', '♦', '★', '♥'] },
            nature: { base: '🌸', variants: ['🌻', '🌷', '🌺', '🍀', '🌟'] },
            objects: { base: '🎈', variants: ['🎁', '🎨', '🎪', '🎯', '🎮'] }
        };
    }

    /**
     * Generate visual pattern representation
     */
    generatePatternVisual(sequence, patternType, visualTheme = 'shapes') {
        const theme = this.visualThemes[visualTheme] || this.visualThemes.shapes;
        
        switch (patternType) {
            case 'counting':
                return this.createCountingVisual(sequence, theme);
            case 'skip_counting':
                return this.createSkipCountingVisual(sequence, theme);
            case 'pattern_completion':
                return this.createPatternCompletionVisual(sequence, theme);
            case 'visual_pattern':
                return this.createVisualPatternSequence(sequence, theme);
            case 'interactive':
                return this.createInteractiveBuilder(sequence, theme);
            default:
                return this.createCountingVisual(sequence, theme);
        }
    }

    /**
     * Create counting sequence visual with objects
     */
    createCountingVisual(sequence, theme) {
        const visualElements = sequence.visible.map((num, index) => {
            return {
                position: index,
                number: num,
                objects: this.generateObjectGroup(num, theme.base),
                highlight: false,
                animationDelay: index * 200
            };
        });

        // Add missing number placeholder
        if (sequence.missing.length > 0) {
            const missingIndex = sequence.missing[0].position;
            visualElements.splice(missingIndex, 0, {
                position: missingIndex,
                number: '?',
                objects: this.generatePlaceholderGroup(theme.base),
                highlight: true,
                isMissing: true
            });
        }

        return {
            type: 'counting',
            elements: visualElements,
            pattern: sequence.pattern,
            theme: theme,
            instructions: 'Count the objects to find the missing number',
            accessibility: {
                description: this.generateCountingDescription(sequence),
                objectDescription: `Objects representing numbers in sequence`
            }
        };
    }

    /**
     * Create skip counting visual with groupings
     */
    createSkipCountingVisual(sequence, theme) {
        const step = sequence.pattern.rule.step;
        
        const visualElements = sequence.visible.map((num, index) => {
            return {
                position: index,
                number: num,
                groups: this.generateSkipCountingGroups(num, step, theme.base),
                highlight: false,
                skipValue: step
            };
        });

        return {
            type: 'skipCounting',
            elements: visualElements,
            step: step,
            pattern: sequence.pattern,
            theme: theme,
            instructions: `Count by ${step}s to find the pattern`,
            accessibility: {
                description: `Skip counting by ${step}: ${sequence.visible.join(', ')}, what comes next?`,
                groupDescription: `Groups of ${step} objects for each number`
            }
        };
    }

    /**
     * Create pattern completion visual with color/shape patterns
     */
    createPatternCompletionVisual(sequence, theme) {
        const patternLength = sequence.pattern.core?.length || 3;
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        
        const visualElements = [];
        
        sequence.visible.forEach((num, index) => {
            const patternPosition = index % patternLength;
            const color = colors[patternPosition % colors.length];
            const shape = theme.variants[patternPosition % theme.variants.length];
            
            visualElements.push({
                position: index,
                number: num,
                visual: shape,
                color: color,
                patternPosition: patternPosition,
                size: this.calculatePatternSize(num, sequence.pattern),
                highlight: false
            });
        });

        // Add missing element
        if (sequence.missing.length > 0) {
            const missingIndex = sequence.missing[0].position;
            const patternPosition = missingIndex % patternLength;
            
            visualElements.splice(missingIndex, 0, {
                position: missingIndex,
                number: '?',
                visual: '?',
                color: colors[patternPosition % colors.length],
                patternPosition: patternPosition,
                size: 'medium',
                highlight: true,
                isMissing: true
            });
        }

        return {
            type: 'patternCompletion',
            elements: visualElements,
            patternLength: patternLength,
            corePattern: sequence.pattern.core,
            theme: theme,
            instructions: 'Look for the repeating pattern',
            accessibility: {
                description: this.generatePatternDescription(sequence),
                patternDescription: 'Visual pattern with colors and shapes'
            }
        };
    }

    /**
     * Create interactive pattern builder
     */
    createInteractiveBuilder(sequence, theme) {
        const availableNumbers = this.generateNumberOptions(sequence);
        
        return {
            type: 'interactive',
            sequence: sequence.visible,
            missing: sequence.missing,
            options: availableNumbers.map(num => ({
                number: num,
                visual: this.generateObjectGroup(num, theme.base),
                draggable: true
            })),
            dropZones: sequence.missing.map(missing => ({
                position: missing.position,
                accepts: [missing.value],
                placeholder: this.generatePlaceholderGroup(theme.base)
            })),
            theme: theme,
            instructions: 'Drag the correct numbers to complete the sequence',
            accessibility: {
                description: 'Interactive drag-and-drop sequence completion',
                instructions: 'Use arrow keys to navigate and space to select'
            }
        };
    }

    /**
     * Helper methods for visual generation
     */
    generateObjectGroup(count, baseObject) {
        if (count === 0) return [];
        
        const objects = [];
        const arrangement = this.getOptimalArrangement(count);
        
        for (let i = 0; i < count; i++) {
            objects.push({
                id: i,
                visual: baseObject,
                row: Math.floor(i / arrangement.itemsPerRow),
                col: i % arrangement.itemsPerRow,
                animationDelay: i * 50
            });
        }
        
        return {
            objects: objects,
            arrangement: arrangement,
            total: count
        };
    }

    generateSkipCountingGroups(total, step, baseObject) {
        const groupCount = Math.floor(total / step);
        const remainder = total % step;
        const groups = [];
        
        for (let g = 0; g < groupCount; g++) {
            groups.push({
                id: g,
                objects: this.generateObjectGroup(step, baseObject).objects,
                label: `Group ${g + 1}`
            });
        }
        
        if (remainder > 0) {
            groups.push({
                id: groupCount,
                objects: this.generateObjectGroup(remainder, baseObject).objects,
                label: 'Extra',
                isRemainder: true
            });
        }
        
        return groups;
    }

    generatePlaceholderGroup(baseObject) {
        return {
            placeholder: true,
            visual: '?',
            baseObject: baseObject,
            animationClass: 'pulse-placeholder'
        };
    }

    getOptimalArrangement(count) {
        if (count <= 5) return { itemsPerRow: count, rows: 1 };
        if (count <= 10) return { itemsPerRow: 5, rows: 2 };
        if (count <= 15) return { itemsPerRow: 5, rows: 3 };
        return { itemsPerRow: Math.ceil(Math.sqrt(count)), rows: Math.ceil(count / Math.ceil(Math.sqrt(count))) };
    }

    calculatePatternSize(number, pattern) {
        if (pattern.type === 'increasing') {
            if (number <= 3) return 'small';
            if (number <= 7) return 'medium';
            return 'large';
        }
        return 'medium';
    }

    generateNumberOptions(sequence) {
        const correctAnswer = sequence.missing[0]?.value;
        const options = [correctAnswer];
        
        // Add distractors
        const range = Math.max(...sequence.visible) - Math.min(...sequence.visible);
        
        for (let i = 0; i < 3; i++) {
            let distractor;
            do {
                distractor = correctAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
            } while (options.includes(distractor) || distractor < 0);
            
            if (distractor >= 0 && distractor <= 20) {
                options.push(distractor);
            }
        }
        
        // Shuffle options
        return options.sort(() => Math.random() - 0.5);
    }

    generateCountingDescription(sequence) {
        return `Counting sequence: ${sequence.visible.join(', ')}, what number comes next?`;
    }

    generatePatternDescription(sequence) {
        const rule = sequence.pattern.rule;
        if (rule.type === 'add') {
            return `Each number increases by ${rule.step}`;
        } else if (rule.type === 'subtract') {
            return `Each number decreases by ${rule.step}`;
        }
        return 'Look for the pattern in the sequence';
    }
}

/**
 * Number Sequences Game Engine
 * Handles pattern generation, recognition, and progression
 */
export class NumberSequencesEngine {
    constructor(userManager, ageGroup = '5-6') {
        this.userManager = userManager;
        this.ageGroup = ageGroup;
        this.config = GAMES_CONFIG.numberSequences;
        this.aiEngine = new AIPhrasingEngine();
        this.visualRenderer = new PatternVisualRenderer();
        
        this.currentSession = {
            questionsAsked: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            currentStreak: 0,
            longestStreak: 0,
            startTime: null,
            problems: [],
            difficulty: this.getInitialDifficulty(),
            visualMode: 'auto'
        };
        
        this.masteryTracker = {
            counting: { attempts: 0, successes: 0, level: 1 },
            skip_counting: { attempts: 0, successes: 0, level: 1 },
            pattern_recognition: { attempts: 0, successes: 0, level: 1 },
            sequence_building: { attempts: 0, successes: 0, level: 1 }
        };

        this.patternTypes = [
            'simple_counting', 'skip_counting', 'pattern_completion', 
            'missing_number', 'sequence_extension', 'visual_patterns'
        ];

        this.setupEventListeners();
    }

    /**
     * Initialize the game engine
     */
    async init() {
        console.log('🔧 Initializing Number Sequences Engine...');
        
        try {
            await this.loadMasteryProgress();
            await this.aiEngine.init();
            this.setupAgeConfiguration();
            
            console.log('✅ Number Sequences Engine initialized');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Number Sequences Engine:', error);
            return false;
        }
    }

    /**
     * Start a new game session
     */
    startSession(options = {}) {
        const {
            maxQuestions = this.getMaxQuestions(),
            focusPattern = null,
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
            focusPattern: focusPattern,
            problems: [],
            difficulty: difficulty || this.getInitialDifficulty(),
            visualMode: visualMode
        };

        this.emitGameEvent('sessionStarted', {
            session: this.currentSession,
            ageGroup: this.ageGroup
        });

        console.log('🎮 Number Sequences session started');
        return this.generateNextProblem();
    }

    /**
     * Generate next sequence problem
     */
    generateNextProblem() {
        if (this.isSessionComplete()) {
            return this.endSession();
        }

        const patternType = this.selectPatternType();
        const sequence = this.generateSequence(patternType);
        const visual = this.visualRenderer.generatePatternVisual(
            sequence, 
            patternType, 
            this.selectVisualTheme()
        );
        
        const questionData = {
            id: `seq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            sequence: sequence,
            visual: visual,
            patternType: patternType,
            timestamp: Date.now(),
            difficulty: this.currentSession.difficulty,
            expectedAnswerTime: this.getExpectedAnswerTime(sequence),
            hints: this.generateHints(sequence, patternType),
            encouragement: this.aiEngine.generatePhrase('pre_question', {
                gameType: 'sequences',
                patternType: patternType,
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
     * Generate number sequence based on pattern type
     */
    generateSequence(patternType) {
        const difficulty = this.currentSession.difficulty;
        const ranges = this.config.difficulty[difficulty];
        
        switch (patternType) {
            case 'simple_counting':
                return this.generateSimpleCounting(ranges);
            case 'skip_counting':
                return this.generateSkipCounting(ranges);
            case 'pattern_completion':
                return this.generatePatternCompletion(ranges);
            case 'missing_number':
                return this.generateMissingNumber(ranges);
            case 'sequence_extension':
                return this.generateSequenceExtension(ranges);
            case 'visual_patterns':
                return this.generateVisualPattern(ranges);
            default:
                return this.generateSimpleCounting(ranges);
        }
    }

    /**
     * Generate simple counting sequence (1, 2, 3, ?, 5)
     */
    generateSimpleCounting(ranges) {
        const start = this.randomInRange(ranges.countingStart);
        const length = this.randomInRange(ranges.sequenceLength);
        const missingPosition = Math.floor(Math.random() * length);
        
        const fullSequence = [];
        for (let i = 0; i < length; i++) {
            fullSequence.push(start + i);
        }
        
        const visibleSequence = [...fullSequence];
        const missingValue = visibleSequence[missingPosition];
        visibleSequence.splice(missingPosition, 1);
        
        return {
            type: 'simple_counting',
            visible: visibleSequence,
            missing: [{
                position: missingPosition,
                value: missingValue
            }],
            pattern: {
                type: 'linear',
                rule: { type: 'add', step: 1 },
                start: start,
                length: length
            },
            difficulty: this.currentSession.difficulty
        };
    }

    /**
     * Generate skip counting sequence (2, 4, 6, ?, 10)
     */
    generateSkipCounting(ranges) {
        const possibleSteps = ranges.skipCounting.steps;
        const step = possibleSteps[Math.floor(Math.random() * possibleSteps.length)];
        const start = this.randomInRange(ranges.skipCounting.start);
        const length = this.randomInRange(ranges.sequenceLength);
        
        const fullSequence = [];
        for (let i = 0; i < length; i++) {
            fullSequence.push(start + (i * step));
        }
        
        const missingPosition = Math.floor(Math.random() * length);
        const visibleSequence = [...fullSequence];
        const missingValue = visibleSequence[missingPosition];
        visibleSequence.splice(missingPosition, 1);
        
        return {
            type: 'skip_counting',
            visible: visibleSequence,
            missing: [{
                position: missingPosition,
                value: missingValue
            }],
            pattern: {
                type: 'arithmetic',
                rule: { type: 'add', step: step },
                start: start,
                length: length
            },
            difficulty: this.currentSession.difficulty
        };
    }

    /**
     * Generate pattern completion with repeating elements
     */
    generatePatternCompletion(ranges) {
        const corePatterns = [
            [1, 2, 3],
            [1, 2, 1],
            [1, 3, 2],
            [2, 4, 6],
            [1, 1, 2],
            [3, 1, 4]
        ];
        
        const corePattern = corePatterns[Math.floor(Math.random() * corePatterns.length)];
        const repeats = Math.floor(this.randomInRange(ranges.sequenceLength) / corePattern.length) + 1;
        
        const fullSequence = [];
        for (let r = 0; r < repeats; r++) {
            fullSequence.push(...corePattern);
        }
        
        // Trim to desired length
        const desiredLength = this.randomInRange(ranges.sequenceLength);
        fullSequence.splice(desiredLength);
        
        const missingPosition = Math.floor(Math.random() * fullSequence.length);
        const visibleSequence = [...fullSequence];
        const missingValue = visibleSequence[missingPosition];
        visibleSequence.splice(missingPosition, 1);
        
        return {
            type: 'pattern_completion',
            visible: visibleSequence,
            missing: [{
                position: missingPosition,
                value: missingValue
            }],
            pattern: {
                type: 'repeating',
                core: corePattern,
                repeats: repeats,
                rule: { type: 'pattern', pattern: corePattern }
            },
            difficulty: this.currentSession.difficulty
        };
    }

    /**
     * Generate missing number in sequence
     */
    generateMissingNumber(ranges) {
        // Similar to simple counting but can have different patterns
        const patterns = [
            { type: 'add', step: 1 },
            { type: 'add', step: 2 },
            { type: 'subtract', step: 1 }
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const start = this.randomInRange(ranges.countingStart);
        const length = this.randomInRange(ranges.sequenceLength);
        
        const fullSequence = [];
        let current = start;
        
        for (let i = 0; i < length; i++) {
            fullSequence.push(current);
            current += pattern.type === 'add' ? pattern.step : -pattern.step;
        }
        
        const missingPosition = Math.floor(Math.random() * length);
        const visibleSequence = [...fullSequence];
        const missingValue = visibleSequence[missingPosition];
        visibleSequence.splice(missingPosition, 1);
        
        return {
            type: 'missing_number',
            visible: visibleSequence,
            missing: [{
                position: missingPosition,
                value: missingValue
            }],
            pattern: {
                type: 'arithmetic',
                rule: pattern,
                start: start,
                length: length
            },
            difficulty: this.currentSession.difficulty
        };
    }

    /**
     * Generate sequence extension (what comes next?)
     */
    generateSequenceExtension(ranges) {
        const patterns = [
            { type: 'add', step: 1 },
            { type: 'add', step: 2 },
            { type: 'add', step: 5 },
            { type: 'multiply', step: 2 }
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const start = this.randomInRange(ranges.countingStart);
        const visibleLength = 4; // Show 4 numbers, ask for 5th
        
        const sequence = [start];
        let current = start;
        
        for (let i = 1; i < visibleLength + 1; i++) {
            switch (pattern.type) {
                case 'add':
                    current += pattern.step;
                    break;
                case 'subtract':
                    current -= pattern.step;
                    break;
                case 'multiply':
                    current *= pattern.step;
                    break;
            }
            sequence.push(current);
        }
        
        const visible = sequence.slice(0, visibleLength);
        const nextValue = sequence[visibleLength];
        
        return {
            type: 'sequence_extension',
            visible: visible,
            missing: [{
                position: visibleLength,
                value: nextValue
            }],
            pattern: {
                type: 'arithmetic',
                rule: pattern,
                start: start,
                length: visibleLength + 1
            },
            difficulty: this.currentSession.difficulty
        };
    }

    /**
     * Generate visual pattern sequence
     */
    generateVisualPattern(ranges) {
        // Create patterns based on visual properties
        const visualPatterns = [
            { size: ['small', 'big', 'small'], numbers: [1, 3, 1] },
            { color: ['red', 'blue', 'red'], numbers: [2, 4, 2] },
            { count: [1, 2, 3, 1], numbers: [1, 2, 3, 1] }
        ];
        
        const visualPattern = visualPatterns[Math.floor(Math.random() * visualPatterns.length)];
        const repeats = 2;
        
        const sequence = [];
        for (let r = 0; r < repeats; r++) {
            sequence.push(...visualPattern.numbers);
        }
        
        const missingPosition = Math.floor(Math.random() * sequence.length);
        const visibleSequence = [...sequence];
        const missingValue = visibleSequence[missingPosition];
        visibleSequence.splice(missingPosition, 1);
        
        return {
            type: 'visual_patterns',
            visible: visibleSequence,
            missing: [{
                position: missingPosition,
                value: missingValue
            }],
            pattern: {
                type: 'visual',
                core: visualPattern.numbers,
                visualProperty: Object.keys(visualPattern)[0],
                rule: { type: 'visual_pattern', pattern: visualPattern }
            },
            difficulty: this.currentSession.difficulty
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

        const correctAnswer = problem.sequence.missing[0].value;
        const isCorrect = userAnswer === correctAnswer;
        const response = this.processAnswer(problem, isCorrect, timeTaken, userAnswer);
        
        // Update mastery tracking
        this.updateMastery(problem.patternType, isCorrect);
        
        // Adjust difficulty
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
     * Process answer and generate response
     */
    processAnswer(problem, isCorrect, timeTaken, userAnswer) {
        const expectedTime = problem.expectedAnswerTime;
        const wasQuick = timeTaken < expectedTime * 0.8;
        
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
                    gameType: 'sequences',
                    patternType: problem.patternType,
                    streak: this.currentSession.currentStreak,
                    wasQuick: wasQuick,
                    difficulty: problem.difficulty
                }),
                celebration: this.getCelebrationLevel(),
                patternExplanation: this.generatePatternExplanation(problem.sequence, true),
                nextAction: 'continue'
            };
        } else {
            this.currentSession.incorrectAnswers++;
            this.currentSession.currentStreak = 0;
            
            const correctAnswer = problem.sequence.missing[0].value;
            
            return {
                correct: false,
                message: this.aiEngine.generatePhrase('incorrect_answer', {
                    gameType: 'sequences',
                    patternType: problem.patternType,
                    correctAnswer: correctAnswer,
                    userAnswer: userAnswer
                }),
                correctAnswer: correctAnswer,
                patternExplanation: this.generatePatternExplanation(problem.sequence, false),
                visualExplanation: this.generateVisualExplanation(problem),
                hints: this.generateDetailedHints(problem),
                nextAction: this.shouldOfferRetry() ? 'retry' : 'continue'
            };
        }
    }

    /**
     * Generate hints for sequence problems
     */
    generateHints(sequence, patternType) {
        const hints = [];
        
        switch (patternType) {
            case 'simple_counting':
                hints.push('Count up by 1 from each number to the next');
                hints.push('What number comes between the others?');
                break;
                
            case 'skip_counting':
                const step = sequence.pattern.rule.step;
                hints.push(`Count by ${step}s: add ${step} each time`);
                hints.push('Look at the difference between numbers');
                break;
                
            case 'pattern_completion':
                hints.push('Look for a repeating pattern');
                hints.push('What group of numbers keeps repeating?');
                break;
                
            case 'sequence_extension':
                hints.push('What rule makes each number from the last one?');
                hints.push('Look at how the numbers are changing');
                break;
                
            case 'visual_patterns':
                hints.push('Look at the sizes and colors of the objects');
                hints.push('What visual pattern repeats?');
                break;
        }
        
        hints.push('Use the visual objects to help you count');
        return hints;
    }

    /**
     * Generate detailed explanation of the pattern
     */
    generatePatternExplanation(sequence, wasCorrect) {
        const pattern = sequence.pattern;
        
        switch (pattern.type) {
            case 'linear':
                return `This is a counting sequence. Each number goes up by 1: ${sequence.visible.join(' → ')} → ${sequence.missing[0].value}`;
                
            case 'arithmetic':
                const step = pattern.rule.step;
                const operation = pattern.rule.type === 'add' ? 'add' : 'subtract';
                return `Each number ${operation}s ${step}: ${sequence.visible.join(` ${operation === 'add' ? '+' : '-'}${step} → `)} ${operation === 'add' ? '+' : '-'}${step} → ${sequence.missing[0].value}`;
                
            case 'repeating':
                const core = pattern.core.join(', ');
                return `The pattern "${core}" repeats. The missing number continues this pattern.`;
                
            case 'visual':
                return `This is a visual pattern based on ${pattern.visualProperty}. Look for what repeats!`;
                
            default:
                return 'Look for how the numbers change from one to the next.';
        }
    }

    /**
     * Generate visual explanation for incorrect answers
     */
    generateVisualExplanation(problem) {
        // Create a step-by-step visual showing the pattern
        return this.visualRenderer.generatePatternVisual(
            {
                ...problem.sequence,
                showSolution: true,
                highlightPattern: true
            },
            'explanation',
            'shapes'
        );
    }

    /**
     * Helper methods
     */
    selectPatternType() {
        if (this.currentSession.focusPattern) {
            return this.currentSession.focusPattern;
        }
        
        const availableTypes = this.getAvailablePatternTypes();
        const weights = this.calculatePatternWeights(availableTypes);
        
        return this.weightedRandomSelect(availableTypes, weights);
    }

    getAvailablePatternTypes() {
        const ageConfig = this.config.ageGroups[this.ageGroup];
        const difficulty = this.currentSession.difficulty;
        
        return ageConfig.patternTypes.filter(type => 
            this.config.difficulty[difficulty].patternTypes.includes(type)
        );
    }

    calculatePatternWeights(patternTypes) {
        return patternTypes.map(type => {
            const mastery = this.masteryTracker[type] || { attempts: 0, successes: 0 };
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
        
        return items[0];
    }

    selectVisualTheme() {
        const themes = ['animals', 'shapes', 'nature', 'objects'];
        return themes[Math.floor(Math.random() * themes.length)];
    }

    randomInRange(range) {
        return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }

    /**
     * Difficulty and progression management
     */
    getInitialDifficulty() {
        const ageConfig = this.config.ageGroups[this.ageGroup];
        return ageConfig?.defaultDifficulty || 'beginner';
    }

    adjustDifficulty() {
        const recentProblems = this.currentSession.problems.slice(-5);
        if (recentProblems.length < 3) return;
        
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
            console.log('📈 Sequences difficulty increased to:', this.currentSession.difficulty);
        }
    }

    decreaseDifficulty() {
        const difficulties = Object.keys(this.config.difficulty);
        const currentIndex = difficulties.indexOf(this.currentSession.difficulty);
        
        if (currentIndex > 0) {
            this.currentSession.difficulty = difficulties[currentIndex - 1];
            console.log('📉 Sequences difficulty decreased to:', this.currentSession.difficulty);
        }
    }

    updateMastery(patternType, correct) {
        if (!this.masteryTracker[patternType]) {
            this.masteryTracker[patternType] = { attempts: 0, successes: 0, level: 1 };
        }
        
        this.masteryTracker[patternType].attempts++;
        if (correct) {
            this.masteryTracker[patternType].successes++;
        }
        
        // Update mastery level
        const mastery = this.masteryTracker[patternType];
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
            gameType: 'number-sequences'
        };

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

    getExpectedAnswerTime(sequence) {
        const baseTimes = {
            beginner: 20000,    // 20 seconds
            easy: 15000,        // 15 seconds
            medium: 12000,      // 12 seconds
            challenging: 10000  // 10 seconds
        };
        
        return baseTimes[sequence.difficulty] || 15000;
    }

    getCelebrationLevel() {
        if (this.currentSession.currentStreak >= 5) return 'amazing';
        if (this.currentSession.currentStreak >= 3) return 'great';
        return 'good';
    }

    shouldOfferRetry() {
        return this.currentSession.incorrectAnswers < 2;
    }

    generateSessionCelebration(results) {
        return this.aiEngine.generatePhrase('session_complete', {
            gameType: 'sequences',
            accuracy: results.accuracy,
            questionsAnswered: results.questionsAnswered,
            streak: results.longestStreak
        });
    }

    generateRecommendations(results) {
        const recommendations = [];
        
        Object.entries(this.masteryTracker).forEach(([pattern, data]) => {
            const rate = data.attempts > 0 ? data.successes / data.attempts : 0;
            if (rate < 0.6 && data.attempts >= 3) {
                recommendations.push(`Practice more ${pattern.replace('_', ' ')} patterns`);
            }
        });
        
        if (results.accuracy >= 0.9) {
            recommendations.push('Try more challenging sequence types');
        } else if (results.accuracy < 0.5) {
            recommendations.push('Focus on counting and simple patterns');
        }
        
        return recommendations;
    }

    generateDetailedHints(problem) {
        return this.generateHints(problem.sequence, problem.patternType);
    }

    /**
     * Configuration and setup
     */
    setupAgeConfiguration() {
        const ageConfig = this.config.ageGroups[this.ageGroup];
        if (!ageConfig) {
            console.warn('⚠️ Age group not found:', this.ageGroup);
            this.ageGroup = '5-6';
        }
    }

    async loadMasteryProgress() {
        if (!this.userManager.isGuest && this.userManager.currentUser.gameProgress) {
            const saved = this.userManager.currentUser.gameProgress.numberSequences;
            if (saved?.mastery) {
                this.masteryTracker = { ...this.masteryTracker, ...saved.mastery };
            }
        }
    }

    setupEventListeners() {
        window.addEventListener('user_progressUpdated', (event) => {
            // Handle user progress updates
        });
    }

    emitGameEvent(eventName, data) {
        const event = new CustomEvent(`game_${eventName}`, {
            detail: {
                gameType: 'number-sequences',
                ageGroup: this.ageGroup,
                ...data
            }
        });
        window.dispatchEvent(event);
    }
}

export default NumberSequencesEngine;