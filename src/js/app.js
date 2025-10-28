/**
 * Kindergarten Math Adventure - Main Application
 * Version 3 - Complete Rewrite with AI-Powered Learning
 * 
 * Entry point for the application
 */

import { APP_CONFIG, UI_CONFIG } from './config.js';
import { UserManager } from './userManager.js';
import { AILearningEngine } from './aiLearningEngine.js';
import { GameManager } from './gameManager.js';

/**
 * Main Application Class
 * Coordinates all systems and manages UI
 */
class KindergartenMathApp {
    constructor() {
        // Core systems
        this.userManager = null;
        this.aiEngine = null;
        this.gameManager = null;
        
        // UI state
        this.currentScreen = 'loading';
        this.selectedAgeGroup = null;
        this.isInitialized = false;
        
        // DOM references (will be set after DOM loads)
        this.elements = {};
        
        console.log('[App] Kindergarten Math Adventure v3 initializing...');
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('[App] Starting application initialization');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Cache DOM elements
            this.cacheElements();
            
            // Initialize core systems
            await this.initializeSystems();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Apply initial preferences
            this.applyUserPreferences();
            
            // Hide loading screen and show app
            this.showApp();
            
            this.isInitialized = true;
            console.log('[App] Application initialized successfully');
            
        } catch (error) {
            console.error('[App] Initialization failed:', error);
            this.showErrorState(error);
        }
    }

    /**
     * Cache frequently used DOM elements
     */
    cacheElements() {
        const elementIds = [
            'loading-screen', 'app', 'offline-banner',
            'welcome-screen', 'game-selection-screen', 'game-screen', 
            'results-screen', 'settings-screen',
            'user-greeting', 'user-avatar', 'network-status', 'network-icon',
            'get-started-btn', 'settings-btn', 'user-menu-btn',
            'available-games', 'locked-games', 'locked-games-grid',
            'show-signin-btn', 'progress-overview', 'progress-stats',
            'game-title', 'game-progress', 'game-progress-fill', 
            'accuracy-display', 'question-container', 'question-text',
            'question-visual', 'answer-options', 'hint-btn',
            'ai-feedback-panel', 'ai-message', 'ai-encouragement',
            'pause-game-btn', 'quit-game-btn', 'pause-modal',
            'resume-game-btn', 'quit-to-games-btn',
            'results-emoji', 'results-title', 'results-message',
            'results-stats', 'achievements-section', 'achievements-list',
            'learning-insights', 'insights-content',
            'play-again-btn', 'try-different-game-btn', 'back-to-games-btn',
            'signin-modal', 'demo-signin-btn',
            'close-settings-btn', 'age-group-select',
            'sound-toggle', 'animations-toggle', 'hints-toggle',
            'high-contrast-toggle', 'reduced-motion-toggle', 'font-size-select'
        ];
        
        this.elements = {};
        elementIds.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
        
        // Cache age group buttons
        this.elements.ageGroupBtns = document.querySelectorAll('.age-group-btn');
        
        // Cache modal close buttons
        this.elements.modalCloseBtns = document.querySelectorAll('.modal-close');
        
        console.log('[App] DOM elements cached');
    }

    /**
     * Initialize core systems
     */
    async initializeSystems() {
        console.log('[App] Initializing core systems...');
        
        // Initialize User Manager
        this.userManager = new UserManager();
        await this.userManager.init();
        
        // Initialize AI Learning Engine
        this.aiEngine = new AILearningEngine(this.userManager);
        
        // Initialize Game Manager
        this.gameManager = new GameManager(this.userManager, this.aiEngine);
        
        console.log('[App] Core systems initialized');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        console.log('[App] Setting up event listeners...');
        
        // System events
        window.addEventListener('userAuthChange', this.handleUserChange.bind(this));
        window.addEventListener('userNetworkChange', this.handleNetworkChange.bind(this));
        
        // Game events
        window.addEventListener('gameManager-gameManagerStart', this.handleGameStart.bind(this));
        window.addEventListener('gameManager-gameManagerStop', this.handleGameEnd.bind(this));
        window.addEventListener('game-questionGenerated', this.handleQuestionGenerated.bind(this));
        window.addEventListener('game-answerProcessed', this.handleAnswerProcessed.bind(this));
        
        // Navigation events
        this.elements.getStartedBtn?.addEventListener('click', this.handleGetStarted.bind(this));
        this.elements.settingsBtn?.addEventListener('click', () => this.showScreen('settings'));
        this.elements.userMenuBtn?.addEventListener('click', this.handleUserMenu.bind(this));
        this.elements.closeSettingsBtn?.addEventListener('click', () => this.showScreen('game-selection'));
        
        // Age group selection
        this.elements.ageGroupBtns?.forEach(btn => {
            btn.addEventListener('click', this.handleAgeGroupSelect.bind(this));
        });
        
        // Game control events
        this.elements.pauseGameBtn?.addEventListener('click', this.handlePauseGame.bind(this));
        this.elements.quitGameBtn?.addEventListener('click', this.handleQuitGame.bind(this));
        this.elements.resumeGameBtn?.addEventListener('click', this.handleResumeGame.bind(this));
        this.elements.quitToGamesBtn?.addEventListener('click', this.handleQuitToGames.bind(this));
        this.elements.hintBtn?.addEventListener('click', this.handleHint.bind(this));
        
        // Results screen events
        this.elements.playAgainBtn?.addEventListener('click', this.handlePlayAgain.bind(this));
        this.elements.tryDifferentGameBtn?.addEventListener('click', () => this.showScreen('game-selection'));
        this.elements.backToGamesBtn?.addEventListener('click', () => this.showScreen('game-selection'));
        
        // Authentication events
        this.elements.showSigninBtn?.addEventListener('click', this.showSignInModal.bind(this));
        this.elements.demoSigninBtn?.addEventListener('click', this.handleDemoSignIn.bind(this));
        
        // Settings events
        this.elements.ageGroupSelect?.addEventListener('change', this.handleAgeGroupChange.bind(this));
        this.setupToggleListeners();
        
        // Modal events
        this.elements.modalCloseBtns?.forEach(btn => {
            btn.addEventListener('click', this.closeModals.bind(this));
        });
        
        // Keyboard accessibility
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Visibility change (tab switching)
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        console.log('[App] Event listeners set up');
    }

    /**
     * Set up toggle switch listeners
     */
    setupToggleListeners() {
        const toggles = [
            'sound-toggle', 'animations-toggle', 'hints-toggle',
            'high-contrast-toggle', 'reduced-motion-toggle'
        ];
        
        toggles.forEach(toggleId => {
            const toggle = this.elements[toggleId.replace('-', '')];
            if (toggle) {
                toggle.addEventListener('click', () => this.handleToggle(toggleId));
            }
        });
    }

    /**
     * Handle user authentication changes
     */
    handleUserChange(event) {
        const { user, isGuest } = event.detail;
        console.log('[App] User changed:', user.name, 'Guest:', isGuest);
        
        // Update UI based on user type
        this.updateUserUI(user, isGuest);
        
        // Refresh available games
        this.updateGamesList();
        
        // Update progress display
        this.updateProgressOverview();
    }

    /**
     * Update UI for current user
     */
    updateUserUI(user, isGuest) {
        // Update greeting
        const greeting = isGuest ? 
            `Welcome, ${user.name}! 👶` : 
            `Hi there, ${user.name}! 🌟`;
        
        if (this.elements.userGreeting) {
            this.elements.userGreeting.textContent = greeting;
        }
        
        // Update avatar
        if (this.elements.userAvatar) {
            this.elements.userAvatar.textContent = user.avatar || '👶';
        }
        
        // Update settings age group
        if (this.elements.ageGroupSelect && user.preferences?.ageGroup) {
            this.elements.ageGroupSelect.value = user.preferences.ageGroup;
        }
        
        // Show/hide guest-specific elements
        const guestElements = document.querySelectorAll('[data-guest-only]');
        const authElements = document.querySelectorAll('[data-auth-only]');
        
        guestElements.forEach(el => el.style.display = isGuest ? '' : 'none');
        authElements.forEach(el => el.style.display = isGuest ? 'none' : '');
        
        console.log('[App] User UI updated');
    }

    /**
     * Handle network status changes
     */
    handleNetworkChange(event) {
        const { isOnline, offlineMode } = event.detail;
        console.log('[App] Network changed:', isOnline ? 'online' : 'offline');
        
        // Update network status indicator
        if (this.elements.networkStatus) {
            this.elements.networkStatus.style.display = offlineMode ? 'flex' : 'none';
            if (this.elements.networkIcon) {
                this.elements.networkIcon.textContent = isOnline ? '📶' : '📵';
            }
        }
        
        // Show/hide offline banner
        if (this.elements.offlineBanner) {
            this.elements.offlineBanner.classList.toggle('show', offlineMode);
        }
    }

    /**
     * Handle age group selection
     */
    handleAgeGroupSelect(event) {
        const ageGroup = event.target.dataset.age;
        if (!ageGroup) return;
        
        console.log('[App] Age group selected:', ageGroup);
        
        // Update visual selection
        this.elements.ageGroupBtns?.forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.age === ageGroup);
        });
        
        this.selectedAgeGroup = ageGroup;
        
        // Enable get started button
        if (this.elements.getStartedBtn) {
            this.elements.getStartedBtn.disabled = false;
        }
        
        // Update user preferences
        if (this.userManager.user) {
            this.userManager.user.preferences = {
                ...this.userManager.user.preferences,
                ageGroup: ageGroup
            };
            this.userManager.saveUserSession();
        }
    }

    /**
     * Handle get started button
     */
    handleGetStarted() {
        if (!this.selectedAgeGroup) return;
        
        console.log('[App] Getting started with age group:', this.selectedAgeGroup);
        this.showScreen('game-selection');
    }

    /**
     * Update games list
     */
    updateGamesList() {
        const availableGames = this.gameManager.getAvailableGames();
        const unavailableGames = this.gameManager.getUnavailableGames();
        
        // Clear existing games
        if (this.elements.availableGames) {
            this.elements.availableGames.innerHTML = '';
        }
        if (this.elements.lockedGamesGrid) {
            this.elements.lockedGamesGrid.innerHTML = '';
        }
        
        // Populate available games
        availableGames.forEach(game => {
            const gameElement = this.createGameCard(game, true);
            this.elements.availableGames?.appendChild(gameElement);
        });
        
        // Populate unavailable games
        if (unavailableGames.length > 0) {
            this.elements.lockedGames?.classList.remove('hidden');
            unavailableGames.forEach(game => {
                const gameElement = this.createGameCard(game, false);
                this.elements.lockedGamesGrid?.appendChild(gameElement);
            });
        } else {
            this.elements.lockedGames?.classList.add('hidden');
        }
        
        console.log('[App] Games list updated:', availableGames.length, 'available');
    }

    /**
     * Create game card element
     */
    createGameCard(game, isAvailable) {
        const card = document.createElement('div');
        card.className = `game-card ${isAvailable ? 'available' : 'locked'}`;
        
        const progress = game.progress || {};
        const accuracy = progress.averageAccuracy || 0;
        const sessions = progress.totalSessions || 0;
        
        card.innerHTML = `
            <div class="game-icon">${game.icon}</div>
            <h3 class="game-title">${game.name}</h3>
            <p class="game-description">${game.description}</p>
            ${isAvailable && sessions > 0 ? `
                <div class="text-xs text-text-muted mb-3">
                    Played ${sessions} time${sessions !== 1 ? 's' : ''} • ${accuracy}% accuracy
                </div>
            ` : ''}
            <button class="btn ${isAvailable ? 'btn-primary' : 'btn-disabled'} w-full"
                    ${isAvailable ? `onclick="app.startGame('${game.id}')"` : 'disabled'}>
                ${isAvailable ? '🚀 Play Now' : '🔒 Locked'}
            </button>
        `;
        
        return card;
    }

    /**
     * Start a game
     */
    async startGame(gameId) {
        try {
            console.log('[App] Starting game:', gameId);
            
            await this.gameManager.startGame(gameId, this.selectedAgeGroup);
            this.showScreen('game');
            
        } catch (error) {
            console.error('[App] Failed to start game:', error);
            this.showError('Failed to start game. Please try again.');
        }
    }

    /**
     * Handle game start
     */
    handleGameStart(event) {
        const { gameId, ageGroup } = event.detail;
        console.log('[App] Game started:', gameId);
        
        // Update game title
        const gameConfig = APP_CONFIG.GAMES[gameId];
        if (this.elements.gameTitle && gameConfig) {
            this.elements.gameTitle.textContent = gameConfig.NAME;
        }
        
        // Reset UI elements
        this.resetGameUI();
    }

    /**
     * Reset game UI elements
     */
    resetGameUI() {
        // Reset progress
        if (this.elements.gameProgressFill) {
            this.elements.gameProgressFill.style.width = '0%';
        }
        
        if (this.elements.accuracyDisplay) {
            this.elements.accuracyDisplay.textContent = 'Accuracy: 100%';
        }
        
        // Clear question area
        if (this.elements.questionText) {
            this.elements.questionText.textContent = 'Loading question...';
        }
        
        if (this.elements.questionVisual) {
            this.elements.questionVisual.innerHTML = '';
        }
        
        if (this.elements.answerOptions) {
            this.elements.answerOptions.innerHTML = '';
        }
        
        // Hide feedback and hint
        this.elements.aiFeedbackPanel?.classList.add('hidden');
        this.elements.hintBtn?.classList.add('hidden');
    }

    /**
     * Handle question generated
     */
    handleQuestionGenerated(event) {
        const { question, questionNumber } = event.detail;
        console.log('[App] Question generated:', question.id);
        
        // Update progress
        const gameStatus = this.gameManager.getCurrentGameStatus();
        const progress = (questionNumber / (gameStatus.maxQuestions || 20)) * 100;
        
        if (this.elements.gameProgressFill) {
            this.elements.gameProgressFill.style.width = `${progress}%`;
        }
        
        if (this.elements.gameProgress) {
            this.elements.gameProgress.textContent = `Question ${questionNumber}`;
        }
        
        // Display question
        this.displayQuestion(question);
    }

    /**
     * Display question in UI
     */
    displayQuestion(question) {
        // Update question text
        if (this.elements.questionText) {
            this.elements.questionText.textContent = question.text;
        }
        
        // Display visual representation
        if (this.elements.questionVisual) {
            this.elements.questionVisual.innerHTML = this.createVisualHTML(question.visual);
        }
        
        // Display answer options
        if (this.elements.answerOptions) {
            this.elements.answerOptions.innerHTML = '';
            question.options.forEach((option, index) => {
                const button = document.createElement('button');
                button.className = 'answer-option';
                button.textContent = option;
                button.setAttribute('aria-label', `Answer option: ${option}`);
                button.addEventListener('click', () => this.selectAnswer(option));
                this.elements.answerOptions.appendChild(button);
            });
        }
        
        // Show hint button if available
        if (question.hint && this.elements.hintBtn) {
            this.elements.hintBtn.classList.remove('hidden');
            this.elements.hintBtn.onclick = () => this.showHint(question.hint);
        }
        
        // Hide feedback panel
        this.elements.aiFeedbackPanel?.classList.add('hidden');
    }

    /**
     * Create HTML for visual representation
     */
    createVisualHTML(visual) {
        if (!visual) return '';
        
        let html = '<div class="math-visual">';
        
        if (visual.type === 'addition') {
            // Addition visual with two operands
            html += this.createItemsHTML(visual.operand1);
            html += '<div class="math-operator">+</div>';
            html += this.createItemsHTML(visual.operand2);
        } else if (visual.type === 'subtraction') {
            // Subtraction visual with items to remove
            html += this.createSubtractionHTML(visual);
        } else {
            // Simple counting visual
            html += this.createItemsHTML(visual);
        }
        
        html += '</div>';
        return html;
    }

    /**
     * Create HTML for visual items
     */
    createItemsHTML(visual) {
        if (!visual || !visual.items) return '';
        
        let html = '<div class="flex flex-wrap justify-center gap-2">';
        
        visual.items.forEach(item => {
            if (visual.type === 'objects') {
                html += `<div class="math-item bg-pastel-purple" style="font-size: 2rem;">${item.emoji}</div>`;
            } else if (visual.type === 'dots') {
                html += `<div class="math-item" style="background-color: ${item.color}"></div>`;
            } else if (visual.type === 'fingers') {
                html += `<div class="math-item bg-pastel-pink">👆</div>`;
            } else {
                html += `<div class="math-item bg-pastel-blue">${item.id + 1}</div>`;
            }
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Create HTML for subtraction visual
     */
    createSubtractionHTML(visual) {
        let html = '<div class="flex flex-wrap justify-center gap-2">';
        
        visual.totalItems.items.forEach(item => {
            const isRemoved = visual.itemsToRemove.includes(item.id);
            const classes = isRemoved ? 'math-item opacity-30 line-through' : 'math-item';
            const style = isRemoved ? 'text-decoration: line-through;' : '';
            
            if (visual.totalItems.type === 'objects') {
                html += `<div class="${classes} bg-pastel-purple" style="font-size: 2rem; ${style}">${item.emoji}</div>`;
            } else {
                html += `<div class="${classes}" style="background-color: ${item.color}; ${style}"></div>`;
            }
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Handle answer selection
     */
    async selectAnswer(answer) {
        try {
            console.log('[App] Answer selected:', answer);
            
            // Disable answer buttons
            const answerButtons = document.querySelectorAll('.answer-option');
            answerButtons.forEach(btn => {
                btn.disabled = true;
                if (btn.textContent == answer) {
                    btn.classList.add('selected');
                }
            });
            
            // Process answer through game manager
            const result = await this.gameManager.processAnswer(answer);
            
            // Show feedback
            this.showAnswerFeedback(result);
            
        } catch (error) {
            console.error('[App] Failed to process answer:', error);
            this.showError('Failed to process answer. Please try again.');
        }
    }

    /**
     * Show feedback for answer
     */
    showAnswerFeedback(result) {
        // Update answer buttons to show correct/incorrect
        const answerButtons = document.querySelectorAll('.answer-option');
        answerButtons.forEach(btn => {
            if (btn.textContent == result.analysis.correctAnswer) {
                btn.classList.add('correct');
            } else if (btn.classList.contains('selected') && !result.isCorrect) {
                btn.classList.add('incorrect');
            }
        });
        
        // Show AI feedback
        if (result.feedback && this.elements.aiFeedbackPanel) {
            this.elements.aiFeedbackPanel.classList.remove('hidden');
            
            if (this.elements.aiMessage) {
                this.elements.aiMessage.textContent = result.feedback.message;
            }
            
            if (result.feedback.encouragement && this.elements.aiEncouragement) {
                this.elements.aiEncouragement.textContent = result.feedback.encouragement;
                this.elements.aiEncouragement.classList.remove('hidden');
            }
        }
        
        // Update accuracy display
        const gameStatus = this.gameManager.getCurrentGameStatus();
        if (this.elements.accuracyDisplay && gameStatus) {
            this.elements.accuracyDisplay.textContent = `Accuracy: ${gameStatus.accuracy}%`;
        }
    }

    /**
     * Handle answer processed
     */
    handleAnswerProcessed(event) {
        const { analysis, questionsAnswered, correctAnswers } = event.detail;
        console.log('[App] Answer processed:', analysis.isCorrect ? 'correct' : 'incorrect');
        
        // Additional processing can be done here
    }

    /**
     * Handle game end
     */
    handleGameEnd(event) {
        const { stats, reason } = event.detail;
        console.log('[App] Game ended:', reason, stats);
        
        // Show results screen
        this.showGameResults(stats);
        this.showScreen('results');
    }

    /**
     * Show game results
     */
    showGameResults(stats) {
        // Set results emoji and title based on performance
        let emoji = '🎉';
        let title = 'Fantastic Work!';
        let message = 'You\'re getting better at math every day!';
        
        if (stats.accuracy >= 90) {
            emoji = '🌟';
            title = 'Amazing Performance!';
            message = 'You\'re a math superstar!';
        } else if (stats.accuracy >= 70) {
            emoji = '🎯';
            title = 'Great Job!';
            message = 'You\'re really improving!';
        } else if (stats.accuracy >= 50) {
            emoji = '💪';
            title = 'Keep Trying!';
            message = 'Every mistake helps you learn!';
        } else {
            emoji = '🌱';
            title = 'Learning and Growing!';
            message = 'Practice makes perfect!';
        }
        
        if (this.elements.resultsEmoji) {
            this.elements.resultsEmoji.textContent = emoji;
        }
        if (this.elements.resultsTitle) {
            this.elements.resultsTitle.textContent = title;
        }
        if (this.elements.resultsMessage) {
            this.elements.resultsMessage.textContent = message;
        }
        
        // Show statistics
        if (this.elements.resultsStats) {
            this.elements.resultsStats.innerHTML = `
                <div class="stat-card">
                    <div class="stat-number">${stats.questionsAnswered}</div>
                    <div class="stat-label">Questions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.correctAnswers}</div>
                    <div class="stat-label">Correct</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.accuracy}%</div>
                    <div class="stat-label">Accuracy</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${Math.round(stats.totalTime / 60)}</div>
                    <div class="stat-label">Minutes</div>
                </div>
            `;
        }
        
        // Show learning insights for authenticated users
        if (!this.userManager.isGuest && this.elements.learningInsights) {
            const insights = this.aiEngine.getLearningInsights();
            this.displayLearningInsights(insights);
        }
    }

    /**
     * Display learning insights
     */
    displayLearningInsights(insights) {
        if (!this.elements.insightsContent) return;
        
        let html = '';
        
        if (insights.strengths && insights.strengths.length > 0) {
            html += `<p class="text-accent-green mb-2">💪 Strong in: ${insights.strengths.join(', ')}</p>`;
        }
        
        if (insights.improvements && insights.improvements.length > 0) {
            html += `<p class="text-accent-orange mb-2">🎯 Focus on: ${insights.improvements.join(', ')}</p>`;
        }
        
        if (insights.recommendations && insights.recommendations.length > 0) {
            html += `<p class="text-accent-blue">💡 ${insights.recommendations[0]}</p>`;
        }
        
        if (html) {
            this.elements.insightsContent.innerHTML = html;
            this.elements.learningInsights.classList.remove('hidden');
        }
    }

    /**
     * Handle pause game
     */
    handlePauseGame() {
        this.gameManager.pauseCurrentGame();
        this.showModal('pause-modal');
    }

    /**
     * Handle quit game
     */
    handleQuitGame() {
        this.showModal('pause-modal');
    }

    /**
     * Handle resume game
     */
    handleResumeGame() {
        this.gameManager.resumeCurrentGame();
        this.closeModals();
    }

    /**
     * Handle quit to games
     */
    handleQuitToGames() {
        this.gameManager.stopCurrentGame('user_quit');
        this.closeModals();
        this.showScreen('game-selection');
    }

    /**
     * Handle play again
     */
    handlePlayAgain() {
        const gameStatus = this.gameManager.getCurrentGameStatus();
        if (gameStatus.gameId) {
            this.startGame(gameStatus.gameId);
        }
    }

    /**
     * Handle hint request
     */
    handleHint() {
        // This would show the current question's hint
        const gameStatus = this.gameManager.getCurrentGameStatus();
        if (gameStatus.currentQuestion && gameStatus.currentQuestion.hint) {
            this.showHint(gameStatus.currentQuestion.hint);
        }
    }

    /**
     * Show hint
     */
    showHint(hint) {
        if (this.elements.aiFeedbackPanel && this.elements.aiMessage) {
            this.elements.aiMessage.textContent = `💡 ${hint}`;
            this.elements.aiFeedbackPanel.classList.remove('hidden');
        }
    }

    /**
     * Handle user menu
     */
    handleUserMenu() {
        // Toggle between sign in and user options
        if (this.userManager.isGuest) {
            this.showSignInModal();
        } else {
            // Show user options (sign out, etc.)
            this.showUserMenu();
        }
    }

    /**
     * Show sign in modal
     */
    showSignInModal() {
        this.showModal('signin-modal');
    }

    /**
     * Handle demo sign in (for development)
     */
    handleDemoSignIn() {
        // This is a placeholder for development
        console.log('[App] Demo sign in (development mode)');
        this.closeModals();
        // In production, this would integrate with Supabase authentication
    }

    /**
     * Handle age group change in settings
     */
    handleAgeGroupChange(event) {
        const ageGroup = event.target.value;
        this.selectedAgeGroup = ageGroup;
        
        // Update user preferences
        if (this.userManager.user) {
            this.userManager.user.preferences = {
                ...this.userManager.user.preferences,
                ageGroup: ageGroup
            };
            this.userManager.saveUserSession();
        }
        
        console.log('[App] Age group changed to:', ageGroup);
    }

    /**
     * Handle toggle switches
     */
    handleToggle(toggleId) {
        const toggle = this.elements[toggleId.replace('-', '')];
        if (!toggle) return;
        
        const isChecked = toggle.classList.contains('checked');
        toggle.classList.toggle('checked');
        toggle.setAttribute('aria-checked', !isChecked);
        
        // Handle specific toggle actions
        switch (toggleId) {
            case 'high-contrast-toggle':
                document.body.classList.toggle('high-contrast', !isChecked);
                break;
            case 'reduced-motion-toggle':
                document.body.classList.toggle('reduce-motion', !isChecked);
                break;
        }
        
        console.log(`[App] Toggle ${toggleId} changed to:`, !isChecked);
    }

    /**
     * Apply user preferences
     */
    applyUserPreferences() {
        const preferences = this.userManager.user?.preferences;
        if (!preferences) return;
        
        // Apply age group
        if (preferences.ageGroup) {
            this.selectedAgeGroup = preferences.ageGroup;
            this.elements.ageGroupBtns?.forEach(btn => {
                btn.classList.toggle('selected', btn.dataset.age === preferences.ageGroup);
            });
        }
        
        // Apply other preferences
        if (preferences.highContrast) {
            document.body.classList.add('high-contrast');
        }
        
        if (preferences.reducedMotion) {
            document.body.classList.add('reduce-motion');
        }
    }

    /**
     * Update progress overview
     */
    updateProgressOverview() {
        if (this.userManager.isGuest) {
            this.elements.progressOverview?.classList.add('hidden');
            return;
        }
        
        const stats = this.gameManager.getLearningStatistics();
        
        if (stats.totalGamesPlayed > 0 && this.elements.progressStats) {
            this.elements.progressStats.innerHTML = `
                <div class="stat-card">
                    <div class="stat-number">${stats.totalGamesPlayed}</div>
                    <div class="stat-label">Games Played</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.totalQuestionsAnswered}</div>
                    <div class="stat-label">Questions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.overallAccuracy}%</div>
                    <div class="stat-label">Overall Accuracy</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${Math.round(stats.playTime / 60)}</div>
                    <div class="stat-label">Minutes Played</div>
                </div>
            `;
            this.elements.progressOverview?.classList.remove('hidden');
        } else {
            this.elements.progressOverview?.classList.add('hidden');
        }
    }

    /**
     * Screen management
     */
    showScreen(screenName) {
        console.log(`[App] Showing screen: ${screenName}`);
        
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
            
            // Update content when showing specific screens
            if (screenName === 'game-selection') {
                this.updateGamesList();
                this.updateProgressOverview();
            }
        }
    }

    /**
     * Modal management
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');
        }
    }

    closeModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
        });
    }

    /**
     * Show app (hide loading screen)
     */
    showApp() {
        setTimeout(() => {
            this.elements.loadingScreen?.classList.add('hidden');
            this.elements.app?.classList.remove('hidden');
            
            // Show welcome screen initially
            this.showScreen('welcome');
            
            console.log('[App] App UI shown');
        }, 1500); // Allow loading animation to complete
    }

    /**
     * Error handling
     */
    showError(message) {
        console.error('[App] Error:', message);
        // In production, this would show a proper error modal
        alert(message);
    }

    showErrorState(error) {
        console.error('[App] Critical error:', error);
        
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.innerHTML = `
                <div class="loading-content text-center">
                    <div class="text-6xl mb-6">❌</div>
                    <h1 class="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
                    <p class="text-base mb-6">We're having trouble starting the app. Please refresh the page to try again.</p>
                    <button onclick="window.location.reload()" class="btn btn-primary">
                        🔄 Refresh Page
                    </button>
                </div>
            `;
        }
    }

    /**
     * Keyboard handling for accessibility
     */
    handleKeydown(event) {
        // ESC key closes modals
        if (event.key === 'Escape') {
            this.closeModals();
        }
        
        // Space or Enter on buttons
        if ((event.key === ' ' || event.key === 'Enter') && event.target.classList.contains('answer-option')) {
            event.preventDefault();
            event.target.click();
        }
    }

    /**
     * Handle visibility changes (tab switching)
     */
    handleVisibilityChange() {
        if (document.hidden && this.currentScreen === 'game') {
            // Auto-pause game when tab is hidden
            this.gameManager.pauseCurrentGame();
        }
    }
}

// Initialize application when DOM is loaded
const app = new KindergartenMathApp();

// Make app globally available for inline event handlers
window.app = app;

// Start initialization
app.init().catch(error => {
    console.error('[App] Failed to initialize:', error);
});

console.log('[App] Application script loaded');