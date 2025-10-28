/**
 * Money Math Game Engine
 * Coin Counting, Change Making, Price Calculations
 * Interactive Currency Learning with Real-World Scenarios
 * Kindergarten Math Adventure v4
 */

import { GAMES_CONFIG, AI_CONFIG } from '../config/masterConfig.js';
import { AIPhrasingEngine } from '../ai/phraseEngine.js';

/**
 * Money Visual Renderer
 * Creates interactive currency representations with coins and bills
 */
class MoneyVisualRenderer {
    constructor() {
        this.currency = {
            USD: {
                symbol: '$',
                coins: [
                    { value: 0.01, name: 'penny', color: '#cd7f32', emoji: '🪙', label: '1¢' },
                    { value: 0.05, name: 'nickel', color: '#c0c0c0', emoji: '🪙', label: '5¢' },
                    { value: 0.10, name: 'dime', color: '#c0c0c0', emoji: '🪙', label: '10¢' },
                    { value: 0.25, name: 'quarter', color: '#c0c0c0', emoji: '🪙', label: '25¢' }
                ],
                bills: [
                    { value: 1, name: 'one dollar', color: '#85bb65', emoji: '💵', label: '$1' },
                    { value: 5, name: 'five dollars', color: '#85bb65', emoji: '💵', label: '$5' },
                    { value: 10, name: 'ten dollars', color: '#85bb65', emoji: '💵', label: '$10' }
                ]
            }
        };

        this.visualStyles = {
            realistic: 'realistic',
            simplified: 'simplified',
            cartoon: 'cartoon',
            interactive: 'interactive'
        };

        this.currentCurrency = this.currency.USD;
    }

    /**
     * Generate money visual based on question type
     */
    generateMoneyVisual(moneyData, questionType, visualStyle = 'simplified') {
        switch (questionType) {
            case 'coin_counting':
                return this.createCoinCountingVisual(moneyData, visualStyle);
            case 'coin_values':
                return this.createCoinValueVisual(moneyData, visualStyle);
            case 'making_change':
                return this.createChangeVisual(moneyData, visualStyle);
            case 'price_comparison':
                return this.createPriceComparisonVisual(moneyData, visualStyle);
            case 'shopping':
                return this.createShoppingVisual(moneyData, visualStyle);
            case 'coin_combinations':
                return this.createCombinationsVisual(moneyData, visualStyle);
            default:
                return this.createCoinCountingVisual(moneyData, visualStyle);
        }
    }

    /**
     * Create coin counting visual
     */
    createCoinCountingVisual(moneyData, visualStyle) {
        const { coins, total } = moneyData;
        
        return {
            type: 'coin_counting',
            coins: this.generateCoinDisplay(coins, visualStyle),
            total: total,
            instructions: 'Count the coins to find the total value',
            groupedView: this.groupCoinsByType(coins),
            accessibility: {
                description: this.generateCoinDescription(coins, total),
                instructions: 'Count each type of coin and add them together'
            },
            interactiveElements: {
                draggable: false,
                clickable: true,
                groupable: true
            }
        };
    }

    /**
     * Create coin value identification visual
     */
    createCoinValueVisual(moneyData, visualStyle) {
        const { targetCoin, options } = moneyData;
        
        return {
            type: 'coin_values',
            targetCoin: this.generateSingleCoin(targetCoin, visualStyle, true),
            options: options.map(opt => ({
                value: opt,
                display: this.formatMoney(opt)
            })),
            instructions: `How much is this ${targetCoin.name} worth?`,
            accessibility: {
                description: `Identify the value of a ${targetCoin.name}`,
                instructions: 'Select the correct value for this coin'
            }
        };
    }

    /**
     * Create making change visual
     */
    createChangeVisual(moneyData, visualStyle) {
        const { price, payment, change, item } = moneyData;
        
        return {
            type: 'making_change',
            item: {
                name: item.name,
                illustration: item.illustration,
                price: price,
                priceDisplay: this.formatMoney(price)
            },
            payment: {
                amount: payment,
                display: this.formatMoney(payment),
                coins: this.generateCoinDisplay(this.getOptimalCoins(payment), visualStyle)
            },
            change: {
                amount: change,
                display: this.formatMoney(change),
                coins: change > 0 ? this.generateCoinDisplay(this.getOptimalCoins(change), visualStyle) : null
            },
            instructions: `How much change from ${this.formatMoney(payment)}?`,
            calculation: {
                price: this.formatMoney(price),
                payment: this.formatMoney(payment),
                change: this.formatMoney(change)
            },
            accessibility: {
                description: `Calculate change: Paid ${this.formatMoney(payment)} for item costing ${this.formatMoney(price)}`,
                instructions: 'Subtract the price from the payment to find the change'
            }
        };
    }

    /**
     * Create price comparison visual
     */
    createPriceComparisonVisual(moneyData, visualStyle) {
        const { items, comparison } = moneyData;
        
        return {
            type: 'price_comparison',
            items: items.map(item => ({
                name: item.name,
                illustration: item.illustration,
                price: item.price,
                priceDisplay: this.formatMoney(item.price),
                coins: this.generateCoinDisplay(this.getOptimalCoins(item.price), visualStyle)
            })),
            comparison: comparison,
            instructions: `Which item costs ${comparison.type === 'more' ? 'more' : 'less'}?`,
            accessibility: {
                description: `Compare prices: ${items.map(i => `${i.name} costs ${this.formatMoney(i.price)}`).join(' and ')}`,
                instructions: 'Look at the prices to find which item costs more or less'
            }
        };
    }

    /**
     * Create shopping scenario visual
     */
    createShoppingVisual(moneyData, visualStyle) {
        const { items, budget, total, canAfford } = moneyData;
        
        return {
            type: 'shopping',
            items: items.map(item => ({
                name: item.name,
                illustration: item.illustration,
                price: item.price,
                priceDisplay: this.formatMoney(item.price),
                quantity: item.quantity || 1
            })),
            budget: {
                amount: budget,
                display: this.formatMoney(budget),
                coins: this.generateCoinDisplay(this.getOptimalCoins(budget), visualStyle)
            },
            total: {
                amount: total,
                display: this.formatMoney(total)
            },
            canAfford: canAfford,
            instructions: canAfford 
                ? `Do you have enough money to buy these items?`
                : `Can you afford all these items with ${this.formatMoney(budget)}?`,
            calculation: {
                budget: this.formatMoney(budget),
                total: this.formatMoney(total),
                remaining: this.formatMoney(Math.max(0, budget - total))
            },
            accessibility: {
                description: `Shopping scenario: ${items.length} items totaling ${this.formatMoney(total)} with budget of ${this.formatMoney(budget)}`,
                instructions: 'Add up the item prices and compare to your budget'
            }
        };
    }

    /**
     * Create coin combinations visual
     */
    createCombinationsVisual(moneyData, visualStyle) {
        const { targetAmount, combinations, correctCombination } = moneyData;
        
        return {
            type: 'coin_combinations',
            targetAmount: {
                amount: targetAmount,
                display: this.formatMoney(targetAmount)
            },
            combinations: combinations.map(combo => ({
                coins: this.generateCoinDisplay(combo.coins, visualStyle),
                total: combo.total,
                isCorrect: combo === correctCombination
            })),
            instructions: `Which coins make ${this.formatMoney(targetAmount)}?`,
            accessibility: {
                description: `Find the correct combination of coins that equals ${this.formatMoney(targetAmount)}`,
                instructions: 'Count the value of each coin group to find the correct total'
            }
        };
    }

    /**
     * Generate coin display
     */
    generateCoinDisplay(coins, visualStyle) {
        return coins.map((coin, index) => {
            const coinDef = this.findCoinDefinition(coin.value);
            
            return {
                id: `coin_${index}`,
                value: coin.value,
                name: coinDef.name,
                label: coinDef.label,
                color: coinDef.color,
                emoji: coinDef.emoji,
                size: this.getCoinSize(coin.value),
                position: this.getCoinPosition(index, coins.length),
                style: visualStyle,
                animationDelay: index * 100,
                interactive: {
                    draggable: false,
                    clickable: true,
                    stackable: true
                }
            };
        });
    }

    /**
     * Generate single coin visual
     */
    generateSingleCoin(coinDef, visualStyle, enlarged = false) {
        return {
            value: coinDef.value,
            name: coinDef.name,
            label: coinDef.label,
            color: coinDef.color,
            emoji: coinDef.emoji,
            size: enlarged ? 'large' : 'medium',
            style: visualStyle,
            details: {
                showLabel: true,
                showValue: false, // Hidden for question
                showName: true
            }
        };
    }

    /**
     * Group coins by type for easier counting
     */
    groupCoinsByType(coins) {
        const groups = {};
        
        coins.forEach(coin => {
            const key = coin.value;
            if (!groups[key]) {
                const coinDef = this.findCoinDefinition(key);
                groups[key] = {
                    coinType: coinDef,
                    count: 0,
                    total: 0,
                    coins: []
                };
            }
            groups[key].count++;
            groups[key].total += coin.value;
            groups[key].coins.push(coin);
        });

        // Convert to array and sort by value
        return Object.values(groups).sort((a, b) => b.coinType.value - a.coinType.value);
    }

    /**
     * Get optimal coin combination for an amount
     */
    getOptimalCoins(amount) {
        const cents = Math.round(amount * 100);
        const coins = [];
        let remaining = cents;

        // Greedy algorithm: use largest coins first
        const coinValues = [25, 10, 5, 1]; // quarters, dimes, nickels, pennies
        
        coinValues.forEach(coinValue => {
            while (remaining >= coinValue) {
                coins.push({ value: coinValue / 100 });
                remaining -= coinValue;
            }
        });

        return coins;
    }

    /**
     * Helper methods
     */
    findCoinDefinition(value) {
        const coin = this.currentCurrency.coins.find(c => Math.abs(c.value - value) < 0.001);
        if (!coin) {
            // Check bills
            return this.currentCurrency.bills.find(b => Math.abs(b.value - value) < 0.001) || 
                   this.currentCurrency.coins[0]; // Default to penny
        }
        return coin;
    }

    getCoinSize(value) {
        // Real coin sizes (relative)
        const sizes = {
            0.01: 'small',      // penny
            0.05: 'medium',     // nickel (larger than penny)
            0.10: 'small',      // dime (smallest)
            0.25: 'large'       // quarter (largest)
        };
        return sizes[value] || 'medium';
    }

    getCoinPosition(index, total) {
        const maxPerRow = 5;
        return {
            row: Math.floor(index / maxPerRow),
            col: index % maxPerRow,
            index: index
        };
    }

    formatMoney(amount) {
        return `${this.currentCurrency.symbol}${amount.toFixed(2)}`;
    }

    generateCoinDescription(coins, total) {
        const groups = this.groupCoinsByType(coins);
        const parts = groups.map(g => 
            `${g.count} ${g.coinType.name}${g.count > 1 ? 's' : ''} (${this.formatMoney(g.total)})`
        );
        
        return `Coins: ${parts.join(', ')}. Total: ${this.formatMoney(total)}`;
    }
}

/**
 * Money Math Game Engine
 * Handles currency learning activities and real-world money scenarios
 */
export class MoneyMathEngine {
    constructor(userManager, ageGroup = '5-6') {
        this.userManager = userManager;
        this.ageGroup = ageGroup;
        this.config = GAMES_CONFIG.moneyMath;
        this.aiEngine = new AIPhrasingEngine();
        this.visualRenderer = new MoneyVisualRenderer();
        
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
            coin_recognition: { attempts: 0, successes: 0, level: 1 },
            coin_counting: { attempts: 0, successes: 0, level: 1 },
            making_change: { attempts: 0, successes: 0, level: 1 },
            price_comparison: { attempts: 0, successes: 0, level: 1 },
            money_addition: { attempts: 0, successes: 0, level: 1 },
            real_world_scenarios: { attempts: 0, successes: 0, level: 1 }
        };

        this.questionTypes = [
            'coin_counting', 'coin_values', 'making_change', 
            'price_comparison', 'shopping', 'coin_combinations'
        ];

        this.shopItems = [
            { name: 'apple', illustration: '🍎', priceRange: [0.25, 1.00] },
            { name: 'banana', illustration: '🍌', priceRange: [0.15, 0.75] },
            { name: 'candy', illustration: '🍬', priceRange: [0.10, 0.50] },
            { name: 'toy car', illustration: '🚗', priceRange: [1.00, 5.00] },
            { name: 'pencil', illustration: '✏️', priceRange: [0.25, 1.00] },
            { name: 'eraser', illustration: '🧽', priceRange: [0.10, 0.75] },
            { name: 'sticker', illustration: '⭐', priceRange: [0.25, 1.00] },
            { name: 'cookie', illustration: '🍪', priceRange: [0.50, 2.00] },
            { name: 'juice box', illustration: '🧃', priceRange: [0.75, 2.00] },
            { name: 'ball', illustration: '⚽', priceRange: [2.00, 5.00] }
        ];

        this.setupEventListeners();
    }

    /**
     * Initialize the game engine
     */
    async init() {
        console.log('🔧 Initializing Money Math Engine...');
        
        try {
            await this.loadMasteryProgress();
            await this.aiEngine.init();
            this.setupAgeConfiguration();
            
            console.log('✅ Money Math Engine initialized');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Money Math Engine:', error);
            return false;
        }
    }

    /**
     * Start a new game session
     */
    startSession(options = {}) {
        const {
            maxQuestions = this.getMaxQuestions(),
            focusType = null,
            difficulty = null,
            visualStyle = 'simplified'
        } = options;

        this.currentSession = {
            questionsAsked: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            currentStreak: 0,
            longestStreak: 0,
            startTime: Date.now(),
            maxQuestions: maxQuestions,
            focusType: focusType,
            problems: [],
            difficulty: difficulty || this.getInitialDifficulty(),
            visualStyle: visualStyle
        };

        this.emitGameEvent('sessionStarted', {
            session: this.currentSession,
            ageGroup: this.ageGroup
        });

        console.log('💰 Money Math session started');
        return this.generateNextProblem();
    }

    /**
     * Generate next money problem
     */
    generateNextProblem() {
        if (this.isSessionComplete()) {
            return this.endSession();
        }

        const questionType = this.selectQuestionType();
        const moneyData = this.generateMoneyData(questionType);
        const visual = this.visualRenderer.generateMoneyVisual(
            moneyData, 
            questionType, 
            this.currentSession.visualStyle
        );
        
        const questionData = {
            id: `money_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            moneyData: moneyData,
            visual: visual,
            questionType: questionType,
            timestamp: Date.now(),
            difficulty: this.currentSession.difficulty,
            expectedAnswerTime: this.getExpectedAnswerTime(questionType),
            hints: this.generateHints(questionType, moneyData),
            encouragement: this.aiEngine.generatePhrase('pre_question', {
                gameType: 'money',
                questionType: questionType,
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
     * Generate money data based on question type
     */
    generateMoneyData(questionType) {
        const difficulty = this.currentSession.difficulty;
        const ranges = this.config.difficulty[difficulty];
        
        switch (questionType) {
            case 'coin_counting':
                return this.generateCoinCountingData(ranges);
            case 'coin_values':
                return this.generateCoinValueData(ranges);
            case 'making_change':
                return this.generateMakingChangeData(ranges);
            case 'price_comparison':
                return this.generatePriceComparisonData(ranges);
            case 'shopping':
                return this.generateShoppingData(ranges);
            case 'coin_combinations':
                return this.generateCombinationsData(ranges);
            default:
                return this.generateCoinCountingData(ranges);
        }
    }

    /**
     * Generate coin counting problem
     */
    generateCoinCountingData(ranges) {
        const coinTypes = ranges.coinTypes;
        const numCoins = this.randomInRange(ranges.coinCount);
        const coins = [];
        
        for (let i = 0; i < numCoins; i++) {
            const coinType = coinTypes[Math.floor(Math.random() * coinTypes.length)];
            coins.push({ value: coinType });
        }
        
        const total = coins.reduce((sum, coin) => sum + coin.value, 0);
        
        return {
            coins: coins,
            total: total,
            correctAnswer: total,
            options: this.generateMoneyOptions(total, 4)
        };
    }

    /**
     * Generate coin value identification problem
     */
    generateCoinValueData(ranges) {
        const coinTypes = ranges.coinTypes;
        const targetCoin = this.visualRenderer.findCoinDefinition(
            coinTypes[Math.floor(Math.random() * coinTypes.length)]
        );
        
        return {
            targetCoin: targetCoin,
            correctAnswer: targetCoin.value,
            options: this.shuffleArray([
                targetCoin.value,
                ...ranges.coinTypes.filter(v => v !== targetCoin.value).slice(0, 3)
            ])
        };
    }

    /**
     * Generate making change problem
     */
    generateMakingChangeData(ranges) {
        const item = this.selectRandomItem();
        const price = this.roundToNearestCent(
            this.randomInRange({ min: item.priceRange[0], max: item.priceRange[1] })
        );
        
        // Payment should be more than price
        const paymentOptions = ranges.payments || [0.50, 1.00, 2.00, 5.00];
        const payment = paymentOptions.find(p => p > price) || paymentOptions[paymentOptions.length - 1];
        
        const change = this.roundToNearestCent(payment - price);
        
        return {
            item: item,
            price: price,
            payment: payment,
            change: change,
            correctAnswer: change,
            options: this.generateMoneyOptions(change, 4)
        };
    }

    /**
     * Generate price comparison problem
     */
    generatePriceComparisonData(ranges) {
        const item1 = this.selectRandomItem();
        let item2 = this.selectRandomItem();
        
        // Ensure different items
        while (item2.name === item1.name) {
            item2 = this.selectRandomItem();
        }
        
        const price1 = this.roundToNearestCent(
            this.randomInRange({ min: item1.priceRange[0], max: item1.priceRange[1] })
        );
        
        let price2 = this.roundToNearestCent(
            this.randomInRange({ min: item2.priceRange[0], max: item2.priceRange[1] })
        );
        
        // Ensure prices are different
        while (Math.abs(price1 - price2) < 0.10) {
            price2 = this.roundToNearestCent(
                this.randomInRange({ min: item2.priceRange[0], max: item2.priceRange[1] })
            );
        }
        
        const items = [
            { ...item1, price: price1 },
            { ...item2, price: price2 }
        ];
        
        const comparisonType = Math.random() > 0.5 ? 'more' : 'less';
        const correctIndex = comparisonType === 'more' 
            ? (price1 > price2 ? 0 : 1)
            : (price1 < price2 ? 0 : 1);
        
        return {
            items: items,
            comparison: {
                type: comparisonType,
                correctIndex: correctIndex
            },
            correctAnswer: items[correctIndex].name,
            options: items.map(i => i.name)
        };
    }

    /**
     * Generate shopping scenario problem
     */
    generateShoppingData(ranges) {
        const numItems = this.randomInRange(ranges.itemCount || { min: 2, max: 3 });
        const items = [];
        
        for (let i = 0; i < numItems; i++) {
            const item = this.selectRandomItem();
            const price = this.roundToNearestCent(
                this.randomInRange({ min: item.priceRange[0], max: item.priceRange[1] })
            );
            items.push({ ...item, price: price, quantity: 1 });
        }
        
        const total = this.roundToNearestCent(
            items.reduce((sum, item) => sum + item.price, 0)
        );
        
        // Budget should sometimes be enough, sometimes not
        const budgetOptions = [1.00, 2.00, 3.00, 5.00, 10.00];
        const shouldAfford = Math.random() > 0.3; // 70% can afford
        
        let budget;
        if (shouldAfford) {
            budget = budgetOptions.find(b => b >= total) || budgetOptions[budgetOptions.length - 1];
        } else {
            budget = budgetOptions.find(b => b < total) || budgetOptions[0];
        }
        
        const canAfford = budget >= total;
        
        return {
            items: items,
            budget: budget,
            total: total,
            canAfford: canAfford,
            correctAnswer: canAfford ? 'yes' : 'no',
            options: ['yes', 'no']
        };
    }

    /**
     * Generate coin combinations problem
     */
    generateCombinationsData(ranges) {
        const targetAmount = this.roundToNearestCent(
            this.randomInRange({ min: 0.10, max: 1.00 })
        );
        
        // Generate correct combination
        const correctCoins = this.visualRenderer.getOptimalCoins(targetAmount);
        
        // Generate incorrect combinations
        const combinations = [{ coins: correctCoins, total: targetAmount }];
        
        // Add 3 wrong combinations
        for (let i = 0; i < 3; i++) {
            const wrongAmount = targetAmount + (Math.random() > 0.5 ? 0.05 : -0.05) * (i + 1);
            const wrongCoins = this.visualRenderer.getOptimalCoins(Math.max(0.01, wrongAmount));
            combinations.push({ 
                coins: wrongCoins, 
                total: this.roundToNearestCent(wrongCoins.reduce((sum, c) => sum + c.value, 0))
            });
        }
        
        const shuffledCombinations = this.shuffleArray(combinations);
        
        return {
            targetAmount: targetAmount,
            combinations: shuffledCombinations,
            correctCombination: combinations[0],
            correctAnswer: shuffledCombinations.indexOf(combinations[0]),
            options: shuffledCombinations.map((_, index) => index)
        };
    }

    /**
     * Process user's answer
     */
    submitAnswer(problemId, userAnswer, timeTaken, answerData = {}) {
        const problem = this.currentSession.problems.find(p => p.id === problemId);
        if (!problem) {
            console.error('❌ Problem not found:', problemId);
            return null;
        }

        const isCorrect = this.checkAnswer(problem, userAnswer, answerData);
        const response = this.processAnswer(problem, isCorrect, timeTaken, userAnswer);
        
        // Update mastery tracking
        this.updateMastery(problem.questionType, isCorrect);
        
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
     * Check if user's answer is correct
     */
    checkAnswer(problem, userAnswer, answerData) {
        const { questionType, moneyData } = problem;
        const correctAnswer = moneyData.correctAnswer;
        
        switch (questionType) {
            case 'coin_counting':
            case 'coin_values':
            case 'making_change':
                // Allow small rounding errors
                return Math.abs(parseFloat(userAnswer) - correctAnswer) < 0.01;
                
            case 'price_comparison':
            case 'shopping':
                return userAnswer.toLowerCase() === correctAnswer.toLowerCase();
                
            case 'coin_combinations':
                return parseInt(userAnswer) === correctAnswer;
                
            default:
                return userAnswer === correctAnswer;
        }
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
                    gameType: 'money',
                    questionType: problem.questionType,
                    streak: this.currentSession.currentStreak,
                    wasQuick: wasQuick,
                    difficulty: problem.difficulty
                }),
                celebration: this.getCelebrationLevel(),
                moneyExplanation: this.generateMoneyExplanation(problem.moneyData, true),
                nextAction: 'continue'
            };
        } else {
            this.currentSession.incorrectAnswers++;
            this.currentSession.currentStreak = 0;
            
            return {
                correct: false,
                message: this.aiEngine.generatePhrase('incorrect_answer', {
                    gameType: 'money',
                    questionType: problem.questionType,
                    correctAnswer: this.formatCorrectAnswer(problem.moneyData),
                    userAnswer: userAnswer
                }),
                correctAnswer: this.formatCorrectAnswer(problem.moneyData),
                moneyExplanation: this.generateMoneyExplanation(problem.moneyData, false),
                visualExplanation: this.generateVisualExplanation(problem),
                hints: this.generateDetailedHints(problem),
                nextAction: this.shouldOfferRetry() ? 'retry' : 'continue'
            };
        }
    }

    /**
     * Generate hints for money problems
     */
    generateHints(questionType, moneyData) {
        const hints = [];
        
        switch (questionType) {
            case 'coin_counting':
                hints.push('Group the same coins together to count them easier');
                hints.push('Quarters = 25¢, Dimes = 10¢, Nickels = 5¢, Pennies = 1¢');
                hints.push('Start with the biggest coins and add up their values');
                break;
                
            case 'coin_values':
                hints.push('Look at the size and color of the coin');
                hints.push('Each coin has a different value');
                break;
                
            case 'making_change':
                hints.push(`Subtract the price from what you paid: ${this.visualRenderer.formatMoney(moneyData.payment)} - ${this.visualRenderer.formatMoney(moneyData.price)}`);
                hints.push('Count up from the price to the payment amount');
                break;
                
            case 'price_comparison':
                hints.push('Compare the dollar amounts first, then the cents');
                hints.push('The item with the bigger number costs more');
                break;
                
            case 'shopping':
                hints.push('Add up all the prices of the items you want to buy');
                hints.push('Compare the total to how much money you have');
                break;
                
            case 'coin_combinations':
                hints.push('Count the value of each group of coins');
                hints.push('Find which group adds up to the correct amount');
                break;
        }
        
        hints.push('Use your fingers to help you count');
        return hints;
    }

    /**
     * Generate explanation for money concepts
     */
    generateMoneyExplanation(moneyData, wasCorrect) {
        const { questionType } = moneyData;
        
        switch (questionType) {
            case 'coin_counting':
                const groups = this.visualRenderer.groupCoinsByType(moneyData.coins);
                const explanation = groups.map(g => 
                    `${g.count} ${g.coinType.name}${g.count > 1 ? 's' : ''} = ${this.visualRenderer.formatMoney(g.total)}`
                ).join(', ');
                return `${explanation}. Total: ${this.visualRenderer.formatMoney(moneyData.total)}`;
                
            case 'making_change':
                return `You paid ${this.visualRenderer.formatMoney(moneyData.payment)} for an item costing ${this.visualRenderer.formatMoney(moneyData.price)}. Your change is ${this.visualRenderer.formatMoney(moneyData.change)}.`;
                
            case 'shopping':
                const itemPrices = moneyData.items.map(i => this.visualRenderer.formatMoney(i.price)).join(' + ');
                return `Items cost: ${itemPrices} = ${this.visualRenderer.formatMoney(moneyData.total)}. You have ${this.visualRenderer.formatMoney(moneyData.budget)}. ${moneyData.canAfford ? 'You can afford it!' : 'Not enough money.'}`;
                
            default:
                return 'Look at the coins and their values to solve the problem.';
        }
    }

    /**
     * Helper methods
     */
    selectQuestionType() {
        if (this.currentSession.focusType) {
            return this.currentSession.focusType;
        }
        
        const availableTypes = this.getAvailableQuestionTypes();
        const weights = this.calculateTypeWeights(availableTypes);
        
        return this.weightedRandomSelect(availableTypes, weights);
    }

    getAvailableQuestionTypes() {
        const ageConfig = this.config.ageGroups[this.ageGroup];
        const difficulty = this.currentSession.difficulty;
        
        return ageConfig.questionTypes.filter(type => 
            this.config.difficulty[difficulty].questionTypes.includes(type)
        );
    }

    calculateTypeWeights(questionTypes) {
        return questionTypes.map(type => {
            const mastery = this.masteryTracker[type.replace('-', '_')] || { attempts: 0, successes: 0 };
            const successRate = mastery.attempts > 0 ? mastery.successes / mastery.attempts : 0;
            
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

    selectRandomItem() {
        return { ...this.shopItems[Math.floor(Math.random() * this.shopItems.length)] };
    }

    randomInRange(range) {
        return Math.random() * (range.max - range.min) + range.min;
    }

    roundToNearestCent(value) {
        return Math.round(value * 100) / 100;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    generateMoneyOptions(correctAmount, numOptions) {
        const options = [correctAmount];
        
        // Generate distractors
        const variations = [0.05, 0.10, 0.25, -0.05, -0.10];
        
        variations.forEach(variation => {
            if (options.length < numOptions) {
                const distractor = this.roundToNearestCent(correctAmount + variation);
                if (distractor > 0 && !options.includes(distractor)) {
                    options.push(distractor);
                }
            }
        });
        
        return this.shuffleArray(options);
    }

    formatCorrectAnswer(moneyData) {
        const answer = moneyData.correctAnswer;
        
        if (typeof answer === 'number') {
            return this.visualRenderer.formatMoney(answer);
        }
        
        return answer;
    }

    generateVisualExplanation(problem) {
        return this.visualRenderer.generateMoneyVisual(
            {
                ...problem.moneyData,
                showSolution: true,
                highlightCorrect: true
            },
            problem.questionType,
            'simplified'
        );
    }

    generateDetailedHints(problem) {
        return this.generateHints(problem.questionType, problem.moneyData);
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
            console.log('📈 Money Math difficulty increased to:', this.currentSession.difficulty);
        }
    }

    decreaseDifficulty() {
        const difficulties = Object.keys(this.config.difficulty);
        const currentIndex = difficulties.indexOf(this.currentSession.difficulty);
        
        if (currentIndex > 0) {
            this.currentSession.difficulty = difficulties[currentIndex - 1];
            console.log('📉 Money Math difficulty decreased to:', this.currentSession.difficulty);
        }
    }

    updateMastery(questionType, correct) {
        const masteryKey = questionType.replace('-', '_');
        
        if (!this.masteryTracker[masteryKey]) {
            this.masteryTracker[masteryKey] = { attempts: 0, successes: 0, level: 1 };
        }
        
        this.masteryTracker[masteryKey].attempts++;
        if (correct) {
            this.masteryTracker[masteryKey].successes++;
        }
        
        const mastery = this.masteryTracker[masteryKey];
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
            gameType: 'money-math'
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

    getExpectedAnswerTime(questionType) {
        const baseTimes = {
            coin_counting: 15000,
            coin_values: 8000,
            making_change: 20000,
            price_comparison: 12000,
            shopping: 25000,
            coin_combinations: 18000
        };
        
        return baseTimes[questionType] || 15000;
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
            gameType: 'money',
            accuracy: results.accuracy,
            questionsAnswered: results.questionsAnswered,
            streak: results.longestStreak
        });
    }

    generateRecommendations(results) {
        const recommendations = [];
        
        Object.entries(this.masteryTracker).forEach(([skill, data]) => {
            const rate = data.attempts > 0 ? data.successes / data.attempts : 0;
            if (rate < 0.6 && data.attempts >= 3) {
                recommendations.push(`Practice ${skill.replace('_', ' ')} more`);
            }
        });
        
        if (results.accuracy >= 0.9) {
            recommendations.push('Try more advanced money concepts');
        } else if (results.accuracy < 0.5) {
            recommendations.push('Focus on basic coin recognition first');
        }
        
        return recommendations;
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
            const saved = this.userManager.currentUser.gameProgress.moneyMath;
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
                gameType: 'money-math',
                ageGroup: this.ageGroup,
                ...data
            }
        });
        window.dispatchEvent(event);
    }
}

export default MoneyMathEngine;