/**
 * Number Magic Game
 * Addition, subtraction, and counting adventures
 * Kindergarten Math Adventure v3
 */

import { BaseGame } from './BaseGame.js';
import { APP_CONFIG } from '../config.js';

/**
 * Number Magic Game Class
 * Focuses on basic arithmetic and number sense
 */
export class NumberMagicGame extends BaseGame {
    constructor(userManager, aiEngine) {
        super('number-magic', userManager, aiEngine);
        
        // Game-specific state
        this.currentOperation = 'addition';
        this.visualType = 'objects';
        this.showWorkingOut = true;
        this.enableHints = true;
        
        // Question types for this difficulty
        this.availableQuestionTypes = [];
        
        this.initializeNumberMagic();
    }

    /**
     * Initialize Number Magic specific features
     */
    initializeNumberMagic() {
        console.log('[NumberMagic] Initializing Number Magic game');
        
        // Set initial visual preferences based on age group
        this.setAgeAppropriateSettings();
    }

    /**
     * Set age-appropriate settings
     */
    setAgeAppropriateSettings() {
        const ageSettings = {
            '3-4': {
                operations: ['counting', 'simple_addition'],
                visualTypes: ['objects', 'fingers'],
                maxNumber: 5,
                showWorkingOut: true,
                enableHints: true
            },
            '4-5': {
                operations: ['counting', 'addition', 'simple_subtraction'],
                visualTypes: ['objects', 'dots', 'fingers'],
                maxNumber: 10,
                showWorkingOut: true,
                enableHints: true
            },
            '5-6': {
                operations: ['addition', 'subtraction', 'mixed'],
                visualTypes: ['dots', 'blocks', 'numbers'],
                maxNumber: 20,
                showWorkingOut: false,
                enableHints: true
            }
        };
        
        const settings = ageSettings[this.ageGroup] || ageSettings['4-5'];
        this.availableOperations = settings.operations;
        this.availableVisualTypes = settings.visualTypes;
        this.showWorkingOut = settings.showWorkingOut;
        this.enableHints = settings.enableHints;
    }

    /**
     * Generate next question based on difficulty and age group
     */
    async nextQuestion() {
        if (!this.isActive || this.isPaused) return;
        
        const params = this.getDifficultyParameters();
        const questionType = this.selectQuestionType();
        
        let question;
        
        switch (questionType) {
            case 'counting':
                question = this.generateCountingQuestion(params);
                break;
            case 'addition':
            case 'simple_addition':
                question = this.generateAdditionQuestion(params);
                break;
            case 'subtraction':
            case 'simple_subtraction':
                question = this.generateSubtractionQuestion(params);
                break;
            case 'mixed':
                question = this.generateMixedQuestion(params);
                break;
            default:
                question = this.generateCountingQuestion(params);
        }
        
        this.currentQuestion = question;
        this.questionStartTime = new Date();
        
        console.log('[NumberMagic] Generated question:', question);
        
        // Emit question event
        this.emitEvent('questionGenerated', {
            question: this.currentQuestion,
            difficulty: this.currentDifficulty,
            questionNumber: this.questionsAnswered + 1
        });
    }

    /**
     * Select appropriate question type based on current state
     */
    selectQuestionType() {
        // Weight question types based on recent performance
        let availableTypes = [...this.availableOperations];
        
        // If AI suggests focusing on specific operations, weight accordingly
        if (this.aiEngine && !this.userManager.isGuest) {
            const insights = this.aiEngine.getLearningInsights();
            if (insights.improvements && insights.improvements.length > 0) {
                // Focus on areas needing improvement
                const needsWork = insights.improvements[0];
                if (needsWork.includes('addition')) {
                    availableTypes = availableTypes.filter(t => t.includes('addition'));
                } else if (needsWork.includes('subtraction')) {
                    availableTypes = availableTypes.filter(t => t.includes('subtraction'));
                }
            }
        }
        
        // Random selection from available types
        return availableTypes[Math.floor(Math.random() * availableTypes.length)];
    }

    /**
     * Generate counting question
     */
    generateCountingQuestion(params) {
        const maxNumber = Math.min(params.maxNumber || 10, this.ageGroup === '3-4' ? 5 : 10);
        const targetNumber = Math.floor(Math.random() * maxNumber) + 1;
        
        // Create visual representation
        const visual = this.generateVisualRepresentation(
            targetNumber, 
            this.selectVisualType()
        );
        
        // Generate wrong answers
        const wrongAnswers = this.generateWrongAnswers(targetNumber, 'counting', maxNumber);
        
        const question = {
            id: `counting_${Date.now()}`,
            type: 'counting',
            concept: 'counting',
            difficulty: this.currentDifficulty,
            operation: 'count',
            text: `How many ${this.getObjectName(visual)} can you count?`,
            visual: visual,
            correctAnswer: targetNumber,
            options: this.shuffleOptions([targetNumber, ...wrongAnswers]),
            hint: this.enableHints ? `Count each ${this.getObjectName(visual)} one by one!` : null,
            workingOut: this.showWorkingOut ? this.generateCountingWorkingOut(targetNumber) : null,
            timeLimit: this.getTimeLimit('counting'),
            points: this.calculatePoints('counting', this.currentDifficulty)
        };
        
        return question;
    }

    /**
     * Generate addition question
     */
    generateAdditionQuestion(params) {
        const maxNumber = params.maxNumber || 10;
        const maxSum = Math.min(maxNumber, this.currentDifficulty <= 2 ? 10 : 20);
        
        // Generate numbers that sum to reasonable total
        let num1, num2;
        
        if (this.ageGroup === '3-4') {
            // Very simple addition for youngest
            num1 = Math.floor(Math.random() * 3) + 1; // 1-3
            num2 = Math.floor(Math.random() * 3) + 1; // 1-3
        } else {
            num1 = Math.floor(Math.random() * Math.floor(maxSum / 2)) + 1;
            num2 = Math.floor(Math.random() * (maxSum - num1)) + 1;
        }
        
        const sum = num1 + num2;
        
        // Create visual representations
        const visual1 = this.generateVisualRepresentation(num1, this.selectVisualType());
        const visual2 = this.generateVisualRepresentation(num2, this.selectVisualType());
        
        // Generate wrong answers
        const wrongAnswers = this.generateWrongAnswers(sum, 'addition', maxSum);
        
        const question = {
            id: `addition_${Date.now()}`,
            type: 'addition',
            concept: 'addition',
            difficulty: this.currentDifficulty,
            operation: 'add',
            text: `What is ${num1} + ${num2}?`,
            equation: `${num1} + ${num2} = ?`,
            visual: {
                type: 'addition',
                operand1: visual1,
                operand2: visual2,
                operator: '+'
            },
            correctAnswer: sum,
            options: this.shuffleOptions([sum, ...wrongAnswers]),
            hint: this.enableHints ? `Count all the ${this.getObjectName(visual1)} together!` : null,
            workingOut: this.showWorkingOut ? this.generateAdditionWorkingOut(num1, num2, sum) : null,
            timeLimit: this.getTimeLimit('addition'),
            points: this.calculatePoints('addition', this.currentDifficulty),
            numbers: { num1, num2, sum }
        };
        
        return question;
    }

    /**
     * Generate subtraction question
     */
    generateSubtractionQuestion(params) {
        const maxNumber = params.maxNumber || 10;
        
        // Start with a number and subtract from it
        let startNum, subtractNum;
        
        if (this.ageGroup === '3-4') {
            startNum = Math.floor(Math.random() * 4) + 2; // 2-5
            subtractNum = Math.floor(Math.random() * (startNum - 1)) + 1; // 1 to startNum-1
        } else {
            startNum = Math.floor(Math.random() * (maxNumber - 1)) + 2;
            subtractNum = Math.floor(Math.random() * (startNum - 1)) + 1;
        }
        
        const result = startNum - subtractNum;
        
        // Create visual representation
        const visual = this.generateSubtractionVisual(startNum, subtractNum);
        
        // Generate wrong answers
        const wrongAnswers = this.generateWrongAnswers(result, 'subtraction', startNum);
        
        const question = {
            id: `subtraction_${Date.now()}`,
            type: 'subtraction',
            concept: 'subtraction',
            difficulty: this.currentDifficulty,
            operation: 'subtract',
            text: `What is ${startNum} - ${subtractNum}?`,
            equation: `${startNum} - ${subtractNum} = ?`,
            visual: visual,
            correctAnswer: result,
            options: this.shuffleOptions([result, ...wrongAnswers]),
            hint: this.enableHints ? `Take away ${subtractNum} from ${startNum}!` : null,
            workingOut: this.showWorkingOut ? this.generateSubtractionWorkingOut(startNum, subtractNum, result) : null,
            timeLimit: this.getTimeLimit('subtraction'),
            points: this.calculatePoints('subtraction', this.currentDifficulty),
            numbers: { startNum, subtractNum, result }
        };
        
        return question;
    }

    /**
     * Generate mixed operation question
     */
    generateMixedQuestion(params) {
        // Randomly choose between addition and subtraction
        const operations = ['addition', 'subtraction'];
        const selectedOp = operations[Math.floor(Math.random() * operations.length)];
        
        if (selectedOp === 'addition') {
            return this.generateAdditionQuestion(params);
        } else {
            return this.generateSubtractionQuestion(params);
        }
    }

    /**
     * Generate subtraction visual representation
     */
    generateSubtractionVisual(startNum, subtractNum) {
        const visual = this.generateVisualRepresentation(startNum, this.selectVisualType());
        
        // Mark items to be removed
        const itemsToRemove = [];
        for (let i = 0; i < subtractNum; i++) {
            itemsToRemove.push(visual.items[i].id);
        }
        
        return {
            type: 'subtraction',
            totalItems: visual,
            itemsToRemove: itemsToRemove,
            operator: '-'
        };
    }

    /**
     * Select visual type based on preferences and age
     */
    selectVisualType() {
        const availableTypes = this.availableVisualTypes || ['objects', 'dots'];
        return availableTypes[Math.floor(Math.random() * availableTypes.length)];
    }

    /**
     * Get object name for visual representation
     */
    getObjectName(visual) {
        if (visual.type === 'objects' && visual.items.length > 0) {
            const emoji = visual.items[0].emoji;
            const emojiNames = {
                '🍎': 'apple', '🌟': 'star', '🎈': 'balloon',
                '🧸': 'teddy bear', '🚗': 'car', '🎯': 'target',
                '🎨': 'paint brush', '⚽': 'ball'
            };
            return emojiNames[emoji] || 'item';
        }
        return visual.type === 'dots' ? 'dot' : 'item';
    }

    /**
     * Generate wrong answers for multiple choice
     */
    generateWrongAnswers(correctAnswer, operation, maxPossible) {
        const wrongAnswers = new Set();
        
        // Common mistake patterns
        if (operation === 'addition') {
            // Off by one errors
            if (correctAnswer > 1) wrongAnswers.add(correctAnswer - 1);
            if (correctAnswer < maxPossible) wrongAnswers.add(correctAnswer + 1);
            
            // Common counting errors
            if (correctAnswer > 2) wrongAnswers.add(correctAnswer - 2);
            if (correctAnswer + 2 <= maxPossible) wrongAnswers.add(correctAnswer + 2);
            
        } else if (operation === 'subtraction') {
            // Addition instead of subtraction
            wrongAnswers.add(correctAnswer + 2); // Common error
            
            // Off by one
            if (correctAnswer > 0) wrongAnswers.add(correctAnswer - 1);
            wrongAnswers.add(correctAnswer + 1);
            
        } else if (operation === 'counting') {
            // Off by one errors are most common
            if (correctAnswer > 1) wrongAnswers.add(correctAnswer - 1);
            wrongAnswers.add(correctAnswer + 1);
            if (correctAnswer > 2) wrongAnswers.add(correctAnswer - 2);
        }
        
        // Fill with random numbers if needed
        while (wrongAnswers.size < 3) {
            const randomWrong = Math.floor(Math.random() * maxPossible) + 1;
            if (randomWrong !== correctAnswer) {
                wrongAnswers.add(randomWrong);
            }
        }
        
        return Array.from(wrongAnswers).slice(0, 3);
    }

    /**
     * Shuffle answer options
     */
    shuffleOptions(options) {
        const shuffled = [...options];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Generate working out explanation for counting
     */
    generateCountingWorkingOut(number) {
        const steps = [];
        for (let i = 1; i <= number; i++) {
            steps.push(`${i}...`);
        }
        steps.push(`Total: ${number}`);
        return {
            type: 'counting',
            steps: steps,
            explanation: `Count each item: ${steps.slice(0, -1).join(' ')} = ${number}`
        };
    }

    /**
     * Generate working out explanation for addition
     */
    generateAdditionWorkingOut(num1, num2, sum) {
        return {
            type: 'addition',
            steps: [
                `Start with ${num1}`,
                `Add ${num2} more`,
                `${num1} + ${num2} = ${sum}`
            ],
            explanation: `We have ${num1}, then we add ${num2} more to get ${sum} in total.`
        };
    }

    /**
     * Generate working out explanation for subtraction
     */
    generateSubtractionWorkingOut(startNum, subtractNum, result) {
        return {
            type: 'subtraction',
            steps: [
                `Start with ${startNum}`,
                `Take away ${subtractNum}`,
                `${startNum} - ${subtractNum} = ${result}`
            ],
            explanation: `We had ${startNum}, then we took away ${subtractNum}, leaving us with ${result}.`
        };
    }

    /**
     * Get time limit based on question type and difficulty
     */
    getTimeLimit(questionType) {
        const baseTimes = {
            counting: 15000,  // 15 seconds
            addition: 20000,  // 20 seconds
            subtraction: 25000 // 25 seconds
        };
        
        const baseTime = baseTimes[questionType] || 20000;
        
        // Adjust for difficulty
        const difficultyMultiplier = 1 + (this.currentDifficulty - 1) * 0.2;
        
        // Adjust for age group
        const ageMultiplier = {
            '3-4': 1.5,
            '4-5': 1.2,
            '5-6': 1.0
        };
        
        return Math.round(baseTime * difficultyMultiplier * (ageMultiplier[this.ageGroup] || 1.2));
    }

    /**
     * Calculate points for correct answers
     */
    calculatePoints(questionType, difficulty) {
        const basePoints = {
            counting: 10,
            addition: 15,
            subtraction: 20
        };
        
        const base = basePoints[questionType] || 10;
        const difficultyBonus = (difficulty - 1) * 5;
        
        return base + difficultyBonus;
    }

    /**
     * Override difficulty parameters for Number Magic
     */
    getDifficultyParameters() {
        const baseParams = super.getDifficultyParameters();
        
        // Number Magic specific adjustments
        const numberMagicParams = {
            1: { maxNumber: 5, operations: ['counting', 'simple_addition'] },
            2: { maxNumber: 10, operations: ['counting', 'addition', 'simple_subtraction'] },
            3: { maxNumber: 15, operations: ['addition', 'subtraction'] },
            4: { maxNumber: 20, operations: ['addition', 'subtraction', 'mixed'] },
            5: { maxNumber: 30, operations: ['mixed', 'word_problems'] }
        };
        
        return {
            ...baseParams,
            ...numberMagicParams[this.currentDifficulty]
        };
    }

    /**
     * Get game-specific help text
     */
    getHelpText() {
        return {
            title: 'Number Magic Help',
            instructions: [
                '🧮 Count the objects you see',
                '➕ Add numbers together',
                '➖ Take away to subtract',
                '👆 Use your fingers to help count',
                '🎯 Try your best - every attempt helps you learn!'
            ],
            tips: {
                '3-4': [
                    'Count each item by pointing at it',
                    'Use your fingers to help',
                    'Take your time - there\'s no rush!'
                ],
                '4-5': [
                    'Count carefully from left to right',
                    'For adding, count all items together',
                    'For taking away, cross out items'
                ],
                '5-6': [
                    'Look for patterns in numbers',
                    'Break big numbers into smaller parts',
                    'Check your answer by counting again'
                ]
            }
        };
    }

    /**
     * Get achievement criteria for Number Magic
     */
    getAchievementCriteria() {
        return {
            'counting_master': {
                name: 'Counting Master',
                description: 'Count 20 groups correctly',
                icon: '🧮',
                target: 20,
                type: 'counting_correct'
            },
            'addition_wizard': {
                name: 'Addition Wizard',
                description: 'Solve 15 addition problems',
                icon: '➕',
                target: 15,
                type: 'addition_correct'
            },
            'subtraction_hero': {
                name: 'Subtraction Hero',
                description: 'Master 10 subtraction problems',
                icon: '➖',
                target: 10,
                type: 'subtraction_correct'
            },
            'speed_demon': {
                name: 'Speed Demon',
                description: 'Answer 5 questions in under 10 seconds each',
                icon: '⚡',
                target: 5,
                type: 'fast_answers'
            },
            'perfect_streak': {
                name: 'Perfect Streak',
                description: 'Get 10 answers correct in a row',
                icon: '🎯',
                target: 10,
                type: 'streak'
            }
        };
    }
}

export default NumberMagicGame;