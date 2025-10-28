/**
 * Main Application Controller
 * Orchestrates the entire kindergarten math learning experience
 */

import { APP_CONFIG } from './config.js';
import SupabaseManager from './supabase-manager.js';
import GameEngine from './game-engine.js';
import AIPhrasesEngine from './ai-phrases.js';

class KindergartenMathApp {
    constructor() {
        // Core systems
        this.supabase = new SupabaseManager();
        this.gameEngine = new GameEngine(this.supabase);
        this.aiPhrases = new AIPhrasesEngine();
        
        // Application state
        this.currentScreen = 'welcome';
        this.currentUser = null;
        this.currentGame = null;
        this.isGameActive = false;
        
        // UI elements
        this.elements = {};
        this.bindElements();
        
        // Initialize the application
        this.initialize();
    }

    /**
     * Bind DOM elements for easy access
     */
    bindElements() {
        this.elements = {
            // Screens
            loadingScreen: document.getElementById('loading-screen'),
            app: document.getElementById('app'),
            welcomeScreen: document.getElementById('welcome-screen'),
            gameScreen: document.getElementById('game-screen'),
            resultsScreen: document.getElementById('results-screen'),
            
            // Navigation
            backButton: document.getElementById('back-button'),
            navTitle: document.getElementById('nav-title'),
            settingsButton: document.getElementById('settings-button'),
            progressCircle: document.getElementById('progress-circle'),
            progressText: document.getElementById('progress-text'),
            
            // Welcome screen elements
            ageButtons: document.querySelectorAll('.age-button'),
            gamesGrid: document.getElementById('games-grid'),
            gameCards: document.querySelectorAll('.game-card'),
            statsPreview: document.getElementById('stats-preview'),
            aiWelcomeMessage: document.getElementById('ai-welcome-message'),
            
            // Game screen elements
            gameHeader: document.querySelector('.game-header'),
            currentGameName: document.getElementById('current-game-name'),
            questionsCount: document.getElementById('questions-count'),
            timeElapsed: document.getElementById('time-elapsed'),
            scoreDisplay: document.getElementById('score-display'),
            aiPanel: document.getElementById('ai-panel'),
            aiMessage: document.getElementById('ai-message'),
            questionText: document.getElementById('question-text'),
            questionVisual: document.getElementById('question-visual'),
            answerArea: document.getElementById('answer-area'),
            answerOptions: document.getElementById('answer-options'),
            numberInput: document.getElementById('number-input'),
            numberField: document.getElementById('number-field'),
            submitButton: document.getElementById('submit-answer'),
            gameProgress: document.getElementById('game-progress'),
            progressLabel: document.getElementById('progress-label'),
            
            // Results screen elements
            resultsIcon: document.getElementById('results-icon'),
            resultsTitle: document.getElementById('results-title'),
            resultsMessage: document.getElementById('results-message'),
            finalScore: document.getElementById('final-score'),
            correctAnswers: document.getElementById('correct-answers'),
            timeTaken: document.getElementById('time-taken'),
            accuracyPercent: document.getElementById('accuracy-percent'),
            strengthInsight: document.getElementById('strength-insight'),
            improvementInsight: document.getElementById('improvement-insight'),
            suggestionInsight: document.getElementById('suggestion-insight'),
            playAgainButton: document.getElementById('play-again-button'),
            tryDifferentGame: document.getElementById('try-different-game'),
            viewProgress: document.getElementById('view-progress'),
            
            // Settings modal
            settingsModal: document.getElementById('settings-modal'),
            closeSettings: document.getElementById('close-settings'),
            soundToggle: document.getElementById('sound-toggle'),
            difficultyPreference: document.getElementById('difficulty-preference'),
            encouragementLevel: document.getElementById('encouragement-level'),
            saveProgressToggle: document.getElementById('save-progress-toggle'),
            
            // Other elements
            offlineBanner: document.getElementById('offline-banner'),
            loadingBar: document.getElementById('loading-bar')
        };
    }

    /**
     * Initialize the application
     */
    async initialize() {
        console.log('🚀 Initializing Kindergarten Math Adventure');
        
        try {
            // Show loading screen with progress
            this.updateLoadingProgress(25, 'Setting up your learning companion...');
            
            // Initialize core systems
            await this.initializeCoreSystems();
            this.updateLoadingProgress(50, 'Preparing magical math adventures...');
            
            // Setup event listeners
            this.setupEventListeners();
            this.updateLoadingProgress(75, 'Creating personalized experience...');
            
            // Setup offline/online handlers
            this.setupConnectionHandlers();
            this.updateLoadingProgress(90, 'Almost ready for math magic...');
            
            // Initialize user session
            await this.initializeUserSession();
            this.updateLoadingProgress(100, 'Ready to explore numbers!');
            
            // Transition to main app
            setTimeout(() => {
                this.showApp();
            }, 1000);
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Initialize core systems
     */
    async initializeCoreSystems() {
        // Supabase is already initializing in the background
        await new Promise(resolve => setTimeout(resolve, 500)); // Give it time
        
        // Create initial user if needed
        if (!this.supabase.isAuthenticated()) {
            await this.supabase.createAnonymousUser();
        }
        
        this.currentUser = this.supabase.getCurrentUser();
        console.log('👤 User initialized:', this.currentUser?.id);
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Navigation
        this.elements.backButton?.addEventListener('click', () => this.goBack());
        this.elements.settingsButton?.addEventListener('click', () => this.openSettings());
        
        // Age selection
        this.elements.ageButtons.forEach(button => {
            button.addEventListener('click', (e) => this.selectAge(e.target.dataset.age));
        });
        
        // Game selection
        this.elements.gameCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const gameType = e.currentTarget.dataset.game;
                this.startGame(gameType);
            });
        });
        
        // Game controls
        this.elements.submitButton?.addEventListener('click', () => this.submitAnswer());
        this.elements.numberField?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitAnswer();
        });
        
        // Results screen
        this.elements.playAgainButton?.addEventListener('click', () => this.playAgain());
        this.elements.tryDifferentGame?.addEventListener('click', () => this.showWelcomeScreen());
        this.elements.viewProgress?.addEventListener('click', () => this.showProgressView());
        
        // Settings modal
        this.elements.closeSettings?.addEventListener('click', () => this.closeSettings());
        this.elements.settingsModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.settingsModal) this.closeSettings();
        });
        
        // Settings changes
        this.elements.soundToggle?.addEventListener('change', (e) => this.updateSetting('sound', e.target.checked));
        this.elements.difficultyPreference?.addEventListener('change', (e) => this.updateSetting('difficulty', e.target.value));
        this.elements.encouragementLevel?.addEventListener('change', (e) => this.updateSetting('encouragement', e.target.value));
        this.elements.saveProgressToggle?.addEventListener('change', (e) => this.updateSetting('saveProgress', e.target.checked));
    }

    /**
     * Setup connection handlers for offline/online functionality
     */
    setupConnectionHandlers() {
        window.addEventListener('online', () => {
            this.elements.offlineBanner?.classList.remove('show');
        });
        
        window.addEventListener('offline', () => {
            this.elements.offlineBanner?.classList.add('show');
        });
        
        // Initial state
        if (!navigator.onLine) {
            this.elements.offlineBanner?.classList.add('show');
        }
    }

    /**
     * Initialize user session and load preferences
     */
    async initializeUserSession() {
        if (this.currentUser) {
            // Initialize game engine with user profile
            await this.gameEngine.initialize(this.currentUser);
            
            // Load user analytics for stats preview
            try {
                const analytics = await this.supabase.getUserAnalytics('30d');
                this.updateStatsPreview(analytics);
            } catch (error) {
                console.warn('Failed to load analytics:', error);
            }
            
            // Set welcome message
            this.setWelcomeMessage();
        }
    }

    /**
     * Update loading progress
     */
    updateLoadingProgress(percent, message) {
        if (this.elements.loadingBar) {
            this.elements.loadingBar.style.width = `${percent}%`;
        }
        
        const subtitle = document.querySelector('.loading-subtitle');
        if (subtitle && message) {
            subtitle.textContent = message;
        }
    }

    /**
     * Show main app and hide loading screen
     */
    showApp() {
        this.elements.loadingScreen?.classList.add('hidden');
        this.elements.app?.classList.remove('hidden');
        this.showWelcomeScreen();
    }

    /**
     * Handle initialization errors
     */
    handleInitializationError(error) {
        console.error('Initialization error:', error);
        
        // Show error-friendly loading message
        const subtitle = document.querySelector('.loading-subtitle');
        if (subtitle) {
            subtitle.textContent = 'Starting in offline mode - all features available!';
        }
        
        // Still show the app after a delay
        setTimeout(() => {
            this.showApp();
        }, 2000);
    }

    /**
     * Navigation methods
     */
    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
        }
        
        // Update navigation
        this.updateNavigation();
    }

    showWelcomeScreen() {
        this.showScreen('welcome');
        this.elements.navTitle.textContent = 'Math Adventure';
    }

    showGameScreen() {
        this.showScreen('game');
        this.elements.navTitle.textContent = this.currentGame?.name || 'Playing';
    }

    showResultsScreen() {
        this.showScreen('results');
        this.elements.navTitle.textContent = 'Results';
    }

    updateNavigation() {
        // Show/hide back button
        const showBackButton = this.currentScreen !== 'welcome';
        this.elements.backButton.style.display = showBackButton ? 'flex' : 'none';
        
        // Update progress circle if in game
        if (this.currentScreen === 'game' && this.currentGame) {
            this.updateProgressCircle();
        }
    }

    goBack() {
        if (this.currentScreen === 'game') {
            if (this.isGameActive) {
                // Confirm before leaving active game
                if (confirm('Are you sure you want to quit this game? Your progress will be saved.')) {
                    this.endGame();
                    this.showWelcomeScreen();
                }
            } else {
                this.showWelcomeScreen();
            }
        } else if (this.currentScreen === 'results') {
            this.showWelcomeScreen();
        }
    }

    /**
     * Age selection handling
     */
    selectAge(age) {
        console.log(`👶 Age selected: ${age}`);
        
        // Update visual selection
        this.elements.ageButtons.forEach(button => {
            button.classList.toggle('selected', button.dataset.age === age);
        });
        
        // Update user profile
        if (this.currentUser) {
            this.supabase.updateUserProfile({ age_group: age });
            this.currentUser.age_group = age;
        }
        
        // Show games grid
        this.elements.gamesGrid.style.display = 'block';
        this.elements.statsPreview.style.display = 'block';
        
        // Scroll to games section
        this.elements.gamesGrid.scrollIntoView({ behavior: 'smooth' });
        
        // Update AI welcome message based on age
        this.updateWelcomeMessageForAge(age);
    }

    /**
     * Set personalized welcome message
     */
    setWelcomeMessage() {
        const timeOfDay = this.aiPhrases.getTimeOfDay();
        const context = {
            timeOfDay,
            isFirstTime: !this.currentUser?.last_login,
            personality: this.currentUser?.personality || 'magical'
        };
        
        const message = this.aiPhrases.generatePhrase('timeGreetings', {
            subcategory: timeOfDay,
            ...context
        });
        
        if (this.elements.aiWelcomeMessage) {
            this.elements.aiWelcomeMessage.textContent = message;
        }
    }

    /**
     * Update welcome message based on selected age
     */
    updateWelcomeMessageForAge(age) {
        let message = "Let's start your mathematical adventure! 🌟";
        
        switch (age) {
            case '3':
            case '4':
                message = "Perfect! We'll start with fun and easy number games! 🎈";
                break;
            case '5':
            case '6':
                message = "Great choice! Ready for some exciting math challenges! 🚀";
                break;
            case '7':
                message = "Awesome! You're ready for advanced mathematical adventures! ⚡";
                break;
        }
        
        if (this.elements.aiWelcomeMessage) {
            this.elements.aiWelcomeMessage.textContent = message;
        }
    }

    /**
     * Update stats preview with analytics data
     */
    updateStatsPreview(analytics) {
        if (analytics) {
            document.getElementById('total-questions').textContent = analytics.total_questions || 0;
            document.getElementById('accuracy-rate').textContent = `${analytics.accuracy_percentage || 0}%`;
            document.getElementById('learning-streak').textContent = analytics.daily_streak || 0;
        }
    }

    /**
     * Game management
     */
    async startGame(gameType) {
        console.log(`🎮 Starting ${gameType} game`);
        
        try {
            // Show game screen
            this.showGameScreen();
            
            // Start game engine
            const gameData = await this.gameEngine.startGame(gameType, 10);
            
            this.currentGame = {
                type: gameType,
                name: this.getGameName(gameType),
                session: gameData.session,
                data: gameData.game,
                startTime: Date.now()
            };
            
            this.isGameActive = true;
            
            // Update UI
            this.updateGameHeader();
            this.displayCurrentQuestion(gameData.question);
            
            // Start game timer
            this.startGameTimer();
            
        } catch (error) {
            console.error('Failed to start game:', error);
            this.showError('Failed to start game. Please try again.');
        }
    }

    /**
     * Update game header information
     */
    updateGameHeader() {
        if (this.currentGame) {
            this.elements.currentGameName.textContent = this.currentGame.name;
            this.updateQuestionsCount();
            this.updateScore();
        }
    }

    /**
     * Update questions counter
     */
    updateQuestionsCount() {
        const current = this.gameEngine.sessionStats.questionsAttempted + 1;
        const total = this.currentGame.data.targetQuestions;
        this.elements.questionsCount.textContent = `Question ${current} of ${total}`;
        
        // Update progress bar
        const progressPercent = ((current - 1) / total) * 100;
        this.elements.gameProgress.style.width = `${progressPercent}%`;
        
        if (current <= 3) {
            this.elements.progressLabel.textContent = 'Getting warmed up...';
        } else if (current <= 7) {
            this.elements.progressLabel.textContent = 'You\'re doing great!';
        } else {
            this.elements.progressLabel.textContent = 'Almost finished!';
        }
    }

    /**
     * Update score display
     */
    updateScore() {
        const score = this.gameEngine.sessionStats.questionsCorrect * 100;
        this.elements.scoreDisplay.textContent = `${score} points`;
    }

    /**
     * Start game timer
     */
    startGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        this.gameTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.currentGame.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            this.elements.timeElapsed.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    /**
     * Display current question
     */
    displayCurrentQuestion(question) {
        // Update AI message
        this.elements.aiMessage.textContent = question.encouragement;
        
        // Update question text
        this.elements.questionText.textContent = question.questionText;
        
        // Create visual elements
        this.createQuestionVisuals(question);
        
        // Setup answer interface
        this.setupAnswerInterface(question);
    }

    /**
     * Create visual elements for the question
     */
    createQuestionVisuals(question) {
        const visualContainer = this.elements.questionVisual;
        visualContainer.innerHTML = '';
        
        if (question.visualElements) {
            switch (question.visualElements.type) {
                case 'addition_visual':
                    this.createArithmeticVisual(visualContainer, question.visualElements);
                    break;
                case 'subtraction_visual':
                    this.createArithmeticVisual(visualContainer, question.visualElements);
                    break;
                case 'multiplication_visual':
                    this.createMultiplicationVisual(visualContainer, question.visualElements);
                    break;
                case 'analog_clock':
                    this.createClockVisual(visualContainer, question.visualElements);
                    break;
                default:
                    // Default visual for other question types
                    visualContainer.innerHTML = '<div class="question-placeholder">🔢</div>';
            }
        }
    }

    /**
     * Create arithmetic problem visuals
     */
    createArithmeticVisual(container, visualData) {
        const mathVisual = document.createElement('div');
        mathVisual.className = 'math-visual';
        
        visualData.items.forEach(item => {
            switch (item.type) {
                case 'group':
                    const group = document.createElement('div');
                    group.className = 'math-group';
                    
                    for (let i = 0; i < item.count; i++) {
                        const dot = document.createElement('div');
                        dot.className = 'math-item';
                        dot.style.background = `var(--pastel-${item.color})`;
                        
                        if (item.strikethrough && i >= (item.count - item.strikethrough)) {
                            dot.style.opacity = '0.3';
                            dot.style.textDecoration = 'line-through';
                        }
                        
                        group.appendChild(dot);
                    }
                    
                    mathVisual.appendChild(group);
                    break;
                    
                case 'operator':
                    const operator = document.createElement('div');
                    operator.className = 'math-operator';
                    operator.textContent = item.symbol;
                    mathVisual.appendChild(operator);
                    break;
                    
                case 'placeholder':
                    const placeholder = document.createElement('div');
                    placeholder.className = 'math-operator';
                    placeholder.textContent = item.text;
                    placeholder.style.color = 'var(--accent-purple)';
                    mathVisual.appendChild(placeholder);
                    break;
            }
        });
        
        container.appendChild(mathVisual);
    }

    /**
     * Create clock visual for time questions
     */
    createClockVisual(container, clockData) {
        const clockDiv = document.createElement('div');
        clockDiv.className = 'clock-visual';
        
        // Create clock face
        clockDiv.innerHTML = `
            <div class="clock-center"></div>
            <div class="clock-hand hour-hand" style="transform: rotate(${clockData.hourAngle}deg)"></div>
            <div class="clock-hand minute-hand" style="transform: rotate(${clockData.minuteAngle}deg)"></div>
        `;
        
        // Add clock numbers
        clockData.numbers.forEach((num, index) => {
            const number = document.createElement('div');
            number.className = 'clock-number';
            number.textContent = num;
            
            const angle = (index * 30) - 90; // Position around clock
            const radius = 85;
            const x = Math.cos(angle * Math.PI / 180) * radius;
            const y = Math.sin(angle * Math.PI / 180) * radius;
            
            number.style.left = `calc(50% + ${x}px - 10px)`;
            number.style.top = `calc(50% + ${y}px - 10px)`;
            
            clockDiv.appendChild(number);
        });
        
        container.appendChild(clockDiv);
    }

    /**
     * Setup answer interface based on question type
     */
    setupAnswerInterface(question) {
        // Clear previous answer interface
        this.elements.answerOptions.innerHTML = '';
        this.elements.numberInput.style.display = 'none';
        
        if (question.options) {
            // Multiple choice
            this.elements.answerOptions.style.display = 'grid';
            
            question.options.forEach(option => {
                const button = document.createElement('button');
                button.className = 'answer-option';
                button.textContent = option;
                button.addEventListener('click', () => this.selectAnswer(button, option));
                this.elements.answerOptions.appendChild(button);
            });
        } else {
            // Number input
            this.elements.numberInput.style.display = 'flex';
            this.elements.numberField.value = '';
            this.elements.numberField.focus();
        }
    }

    /**
     * Handle answer selection
     */
    selectAnswer(buttonElement, answer) {
        // Update visual selection
        document.querySelectorAll('.answer-option').forEach(btn => {
            btn.classList.remove('selected');
        });
        buttonElement.classList.add('selected');
        
        // Auto-submit after short delay
        setTimeout(() => {
            this.submitAnswer(answer);
        }, 500);
    }

    /**
     * Submit answer
     */
    async submitAnswer(answer) {
        if (!answer) {
            // Get answer from number input if not provided
            answer = this.elements.numberField.value;
            if (!answer) return;
        }
        
        try {
            // Disable interface during processing
            this.disableAnswerInterface();
            
            // Process answer through game engine
            const result = await this.gameEngine.processAnswer(answer);
            
            // Show feedback
            await this.showAnswerFeedback(result);
            
            // Update game state
            this.updateGameHeader();
            
            // Check if game is complete
            if (result.isGameComplete) {
                await this.completeGame();
            } else {
                // Show next question after delay
                setTimeout(() => {
                    this.displayCurrentQuestion(result.nextQuestion);
                }, 2000);
            }
            
        } catch (error) {
            console.error('Failed to process answer:', error);
            this.showError('Failed to process answer. Please try again.');
            this.enableAnswerInterface();
        }
    }

    /**
     * Show answer feedback with animations
     */
    async showAnswerFeedback(result) {
        // Update AI message with feedback
        this.elements.aiMessage.textContent = result.feedback;
        
        // Animate answer options
        const selectedOption = document.querySelector('.answer-option.selected');
        const allOptions = document.querySelectorAll('.answer-option');
        
        allOptions.forEach(option => {
            if (option.textContent == result.correctAnswer) {
                option.classList.add('correct');
            } else if (option.classList.contains('selected') && !result.isCorrect) {
                option.classList.add('incorrect');
            }
        });
        
        // Play sound effect if enabled
        if (this.getSetting('sound')) {
            this.playAnswerSound(result.isCorrect);
        }
        
        // Show explanation if incorrect
        if (!result.isCorrect && result.explanation) {
            setTimeout(() => {
                this.elements.aiMessage.textContent = result.explanation;
            }, 1500);
        }
        
        return new Promise(resolve => setTimeout(resolve, 2000));
    }

    /**
     * Complete game and show results
     */
    async completeGame() {
        console.log('🎉 Game completed!');
        
        try {
            this.isGameActive = false;
            
            // Stop game timer
            if (this.gameTimer) {
                clearInterval(this.gameTimer);
            }
            
            // Get final results from game engine
            const results = await this.gameEngine.completeGame();
            
            // Show results screen
            this.showResultsScreen();
            this.displayResults(results);
            
        } catch (error) {
            console.error('Failed to complete game:', error);
            this.showError('Failed to save results. Please try again.');
        }
    }

    /**
     * Display results on results screen
     */
    displayResults(results) {
        const stats = results.sessionStats;
        const insights = results.insights;
        
        // Update results display
        this.elements.finalScore.textContent = stats.questionsCorrect * 100;
        this.elements.correctAnswers.textContent = `${stats.questionsCorrect}/${stats.questionsAttempted}`;
        
        const minutes = Math.floor(stats.totalTime / 60);
        const seconds = Math.floor(stats.totalTime % 60);
        this.elements.timeTaken.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const accuracy = Math.round((stats.questionsCorrect / stats.questionsAttempted) * 100);
        this.elements.accuracyPercent.textContent = `${accuracy}%`;
        
        // Update AI insights
        this.elements.strengthInsight.textContent = insights.strength;
        this.elements.improvementInsight.textContent = insights.improvement;
        this.elements.suggestionInsight.textContent = insights.suggestion;
        
        // Set results icon and title based on performance
        if (accuracy >= 90) {
            this.elements.resultsIcon.textContent = '🏆';
            this.elements.resultsTitle.textContent = 'Outstanding!';
            this.elements.resultsMessage.textContent = 'You\'re a true math champion!';
        } else if (accuracy >= 75) {
            this.elements.resultsIcon.textContent = '⭐';
            this.elements.resultsTitle.textContent = 'Excellent Work!';
            this.elements.resultsMessage.textContent = 'You\'re getting really good at this!';
        } else if (accuracy >= 50) {
            this.elements.resultsIcon.textContent = '🌟';
            this.elements.resultsTitle.textContent = 'Great Effort!';
            this.elements.resultsMessage.textContent = 'You\'re learning and improving!';
        } else {
            this.elements.resultsIcon.textContent = '🎯';
            this.elements.resultsTitle.textContent = 'Keep Practicing!';
            this.elements.resultsMessage.textContent = 'Every attempt makes you stronger!';
        }
    }

    /**
     * Game action handlers
     */
    playAgain() {
        if (this.currentGame) {
            this.startGame(this.currentGame.type);
        }
    }

    endGame() {
        this.isGameActive = false;
        this.currentGame = null;
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
    }

    /**
     * Settings management
     */
    openSettings() {
        this.elements.settingsModal.classList.add('active');
        this.loadCurrentSettings();
    }

    closeSettings() {
        this.elements.settingsModal.classList.remove('active');
    }

    loadCurrentSettings() {
        const settings = this.currentUser?.settings || {};
        
        this.elements.soundToggle.checked = settings.sound_enabled !== false;
        this.elements.difficultyPreference.value = settings.difficulty_preference || 'adaptive';
        this.elements.encouragementLevel.value = settings.encouragement_level || 'medium';
        this.elements.saveProgressToggle.checked = settings.save_progress !== false;
    }

    async updateSetting(settingName, value) {
        if (!this.currentUser) return;
        
        const settings = { ...this.currentUser.settings };
        
        switch (settingName) {
            case 'sound':
                settings.sound_enabled = value;
                break;
            case 'difficulty':
                settings.difficulty_preference = value;
                break;
            case 'encouragement':
                settings.encouragement_level = value;
                break;
            case 'saveProgress':
                settings.save_progress = value;
                break;
        }
        
        try {
            await this.supabase.updateUserProfile({ settings });
            this.currentUser.settings = settings;
            console.log(`✅ Setting updated: ${settingName} = ${value}`);
        } catch (error) {
            console.error('Failed to update setting:', error);
        }
    }

    getSetting(settingName) {
        const settings = this.currentUser?.settings || {};
        
        switch (settingName) {
            case 'sound':
                return settings.sound_enabled !== false;
            case 'difficulty':
                return settings.difficulty_preference || 'adaptive';
            case 'encouragement':
                return settings.encouragement_level || 'medium';
            case 'saveProgress':
                return settings.save_progress !== false;
            default:
                return null;
        }
    }

    /**
     * Utility methods
     */
    getGameName(gameType) {
        const names = {
            arithmetic: 'Number Magic',
            time: 'Time Wizard',
            patterns: 'Pattern Quest',
            shapes: 'Shape Explorer'
        };
        return names[gameType] || gameType;
    }

    updateProgressCircle() {
        if (this.currentGame) {
            const progress = (this.gameEngine.sessionStats.questionsAttempted / this.currentGame.data.targetQuestions) * 100;
            const circumference = 100;
            const offset = circumference - (progress / 100) * circumference;
            
            this.elements.progressCircle.style.strokeDashoffset = offset;
            this.elements.progressText.textContent = `${Math.round(progress)}%`;
        }
    }

    disableAnswerInterface() {
        document.querySelectorAll('.answer-option').forEach(btn => {
            btn.disabled = true;
        });
        this.elements.submitButton.disabled = true;
        this.elements.numberField.disabled = true;
    }

    enableAnswerInterface() {
        document.querySelectorAll('.answer-option').forEach(btn => {
            btn.disabled = false;
        });
        this.elements.submitButton.disabled = false;
        this.elements.numberField.disabled = false;
    }

    showError(message) {
        console.error(message);
        // Could implement a toast notification here
        this.elements.aiMessage.textContent = `Oops! ${message}`;
    }

    playAnswerSound(isCorrect) {
        // Simple audio feedback using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (isCorrect) {
                // Happy ascending tone
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
            } else {
                // Gentle descending tone
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
            }
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.warn('Audio feedback not available:', error);
        }
    }

    showProgressView() {
        // This could open a detailed progress view
        console.log('📊 Progress view requested');
        // For now, just show an alert with basic progress
        alert('Progress tracking feature coming soon! 🚀');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 Initializing Kindergarten Math Adventure');
    window.mathApp = new KindergartenMathApp();
});

export default KindergartenMathApp;