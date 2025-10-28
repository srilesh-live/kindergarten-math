/**
 * Main Application Controller
 * Kindergarten Math Adventure v4 - Complete Application Flow
 * Manages all screens, navigation, and game sessions
 */

import UserManager from './user/UserManager.js';
import BasicArithmeticEngine from './games/BasicArithmeticEngine.js';
import NumberSequencesEngine from './games/NumberSequencesEngine.js';
import TimeClockEngine from './games/TimeClockEngine.js';
import MoneyMathEngine from './games/MoneyMathEngine.js';
import { Button, Card, Modal, GameCard, showToast, showLoading } from './ui/components.js';
import { GAMES_CONFIG } from './config/masterConfig.js';
import { GameRendererFactory } from './ui/gameRenderers.js';
import PWAHelper from './pwa/PWAHelper.js';
import AchievementsManager from './features/AchievementsManager.js';
import SettingsManager from './features/SettingsManager.js';
import SoundManager from './features/SoundManager.js';
import ParentalDashboard from './features/ParentalDashboard.js';
import DailyChallengesManager from './features/DailyChallengesManager.js';
import HintsManager from './features/HintsManager.js';
import ConfettiAnimation from './features/ConfettiAnimation.js';
import { AriaAnnouncer } from './features/AriaAnnouncer.js';
import { KeyboardNavigationManager } from './features/KeyboardNavigationManager.js';
import { AuthManager } from './backend/AuthManager.js';
import { CloudSyncManager } from './backend/CloudSyncManager.js';
import { LeaderboardManager } from './backend/LeaderboardManager.js';

/**
 * Application States
 */
const APP_STATES = {
    LOADING: 'loading',
    WELCOME: 'welcome',
    AUTHENTICATION: 'authentication',
    GAME_SELECTION: 'game_selection',
    GAME_CONFIG: 'game_config',
    PLAYING: 'playing',
    RESULTS: 'results',
    SETTINGS: 'settings',
    PROFILE: 'profile',
    DASHBOARD: 'dashboard'
};

/**
 * Main Application Class
 */
export class KindergartenMathApp {
    constructor() {
        this.state = APP_STATES.LOADING;
        this.userManager = null;
        this.pwaHelper = null;
        this.achievementsManager = null;
        this.settingsManager = null;
        this.soundManager = null;
        this.parentalDashboard = null;
        this.dailyChallengesManager = null;
        this.hintsManager = null;
        this.confettiAnimation = null;
        this.ariaAnnouncer = null;
        this.keyboardNavigation = null;
        this.authManager = null;
        this.cloudSyncManager = null;
        this.leaderboardManager = null;
        this.currentGame = null;
        this.currentGameEngine = null;
        this.currentProblem = null;
        this.currentRenderer = null;
        
        // Game engines
        this.gameEngines = {
            'basic-arithmetic': null,
            'number-sequences': null,
            'time-clock': null,
            'money-math': null
        };

        this.answerStartTime = null;
        this.sessionProblems = [];
        
        // DOM elements
        this.appContainer = null;
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('🚀 Initializing Kindergarten Math Adventure...');
        
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize PWA features
            this.pwaHelper = new PWAHelper();
            await this.pwaHelper.init();
            
            // Initialize settings manager
            this.settingsManager = new SettingsManager();
            await this.settingsManager.applySettings();
            
            // Initialize sound manager
            this.soundManager = new SoundManager(this.settingsManager);
            
            // Initialize user manager
            this.userManager = new UserManager();
            await this.userManager.init();
            
            // Initialize achievements manager
            this.achievementsManager = new AchievementsManager(this.userManager);
            
            // Initialize parental dashboard
            this.parentalDashboard = new ParentalDashboard(this.userManager);
            
            // Initialize daily challenges
            this.dailyChallengesManager = new DailyChallengesManager(this.userManager);
            
            // Initialize hints manager
            this.hintsManager = new HintsManager();
            
            // Initialize confetti animation
            this.confettiAnimation = new ConfettiAnimation();
            
            // Initialize ARIA announcer
            this.ariaAnnouncer = new AriaAnnouncer();
            
            // Initialize keyboard navigation
            this.keyboardNavigation = new KeyboardNavigationManager(this);
            
            // Initialize backend services (optional - check if enabled)
            await this.initializeBackendServices();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize app container
            this.appContainer = document.getElementById('app');
            if (!this.appContainer) {
                this.appContainer = document.createElement('div');
                this.appContainer.id = 'app';
                document.body.appendChild(this.appContainer);
            }
            
            // Check if user is authenticated
            if (this.userManager.isGuest) {
                this.showWelcomeScreen();
            } else {
                this.showGameSelection();
            }
            
            // Hide the initial loading screen from index.html and show app
            const indexLoadingScreen = document.getElementById('loading-screen');
            if (indexLoadingScreen) {
                indexLoadingScreen.classList.add('hidden');
                indexLoadingScreen.style.display = 'none';
            }
            
            // Ensure app container is visible
            if (this.appContainer) {
                this.appContainer.classList.remove('hidden');
                this.appContainer.style.display = 'block';
            }
            
            console.log('✅ Application initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.showError('Failed to start application. Please refresh the page.');
        }
    }

    /**
     * Initialize backend services (Supabase)
     */
    async initializeBackendServices() {
        try {
            // Cloud sync is always enabled in this version
            // Set to false to disable backend features
            const enableCloudSync = true;
            
            if (!enableCloudSync) {
                console.log('ℹ️ Cloud services disabled - running in offline mode');
                return;
            }

            // Initialize authentication manager
            this.authManager = new AuthManager();
            await this.authManager.init();

            // Listen for auth state changes
            this.authManager.onAuthStateChange(async (event, session) => {
                console.log('Auth event:', event);
                
                if (event === 'SIGNED_IN' && session) {
                    // User signed in - sync data
                    if (this.cloudSyncManager) {
                        await this.cloudSyncManager.downloadFromCloud(session.user.id);
                        await this.cloudSyncManager.syncAll();
                    }
                    
                    // Update leaderboard
                    if (this.leaderboardManager && this.userManager) {
                        const stats = this.userManager.currentUser?.getStats();
                        if (stats) {
                            await this.leaderboardManager.updateLeaderboardEntry(session.user.id, stats);
                        }
                    }
                    
                    showToast('✅ Signed in successfully!', 'success');
                }
                
                if (event === 'SIGNED_OUT') {
                    // User signed out
                    showToast('👋 Signed out', 'info');
                }
            });

            // Initialize cloud sync manager
            this.cloudSyncManager = new CloudSyncManager(this.authManager);
            await this.cloudSyncManager.init();

            // Initialize leaderboard manager
            this.leaderboardManager = new LeaderboardManager(this.authManager);
            await this.leaderboardManager.init();

            // If user is already authenticated, sync data
            if (this.authManager.isAuthenticated()) {
                const user = this.authManager.getCurrentUser();
                await this.cloudSyncManager.downloadFromCloud(user.id);
            }

            console.log('✅ Backend services initialized');

            // Make managers globally available for testing
            if (window) {
                window.authManager = this.authManager;
                window.cloudSyncManager = this.cloudSyncManager;
                window.leaderboardManager = this.leaderboardManager;
            }
        } catch (error) {
            console.warn('⚠️ Backend services initialization failed (continuing in offline mode):', error);
            // App continues to work without backend
        }
    }

    /**
     * Setup application event listeners
     */
    setupEventListeners() {
        // Global click sound for buttons
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button, .km-answer-btn, .km-game-card');
            if (button && this.soundManager) {
                this.soundManager.playClick();
                this.soundManager.resume();
            }
        });
        
        // Settings change listener
        window.addEventListener('settings:changed', () => {
            if (this.soundManager) {
                this.soundManager.updateVolume();
            }
        });
        
        // User events
        window.addEventListener('user_userReady', (e) => {
            console.log('User ready:', e.detail);
        });

        window.addEventListener('user_userAuthenticated', (e) => {
            console.log('User authenticated:', e.detail);
            this.showGameSelection();
        });

        window.addEventListener('user_userSignedOut', (e) => {
            console.log('User signed out');
            this.showWelcomeScreen();
        });

        // Game events
        window.addEventListener('game_sessionStarted', (e) => {
            console.log('Game session started:', e.detail);
        });

        window.addEventListener('game_sessionEnded', (e) => {
            console.log('Game session ended:', e.detail);
            this.showResults(e.detail.results);
        });

        window.addEventListener('game_problemGenerated', (e) => {
            this.currentProblem = e.detail;
            this.answerStartTime = Date.now();
        });

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        this.state = APP_STATES.LOADING;
        
        if (this.appContainer) {
            this.appContainer.innerHTML = `
                <div class="km-loading-screen">
                    <div class="km-loading-animation">🎓</div>
                    <h1 class="km-loading-title">Kindergarten Math Adventure</h1>
                    <p class="km-loading-text">Loading your personalized learning experience...</p>
                </div>
            `;
        }
    }

    /**
     * Show welcome screen with guest/sign-in options
     */
    showWelcomeScreen() {
        this.state = APP_STATES.WELCOME;
        
        this.appContainer.innerHTML = `
            <div class="km-welcome-screen">
                <div class="km-welcome-content">
                    <div class="km-welcome-icon">🎓</div>
                    <h1 class="km-welcome-title">Kindergarten Math Adventure</h1>
                    <p class="km-welcome-subtitle">Fun & Interactive Learning for Young Minds</p>
                    
                    <div class="km-welcome-features">
                        <div class="km-feature">
                            <span class="km-feature-icon">🎮</span>
                            <span class="km-feature-text">4 Exciting Games</span>
                        </div>
                        <div class="km-feature">
                            <span class="km-feature-icon">🤖</span>
                            <span class="km-feature-text">AI-Powered Learning</span>
                        </div>
                        <div class="km-feature">
                            <span class="km-feature-icon">📊</span>
                            <span class="km-feature-text">Track Progress</span>
                        </div>
                        <div class="km-feature">
                            <span class="km-feature-icon">🌙</span>
                            <span class="km-feature-text">Eye-Friendly Design</span>
                        </div>
                    </div>
                    
                    <div class="km-welcome-actions">
                        <button class="km-button km-button--primary km-button--large" id="guestBtn">
                            <span>🎮</span>
                            <span>Play as Guest</span>
                        </button>
                        <button class="km-button km-button--secondary km-button--large" id="signInBtn">
                            <span>🔐</span>
                            <span>Sign In / Sign Up</span>
                        </button>
                    </div>
                    
                    <p class="km-welcome-note">
                        <strong>Guest Mode:</strong> Try Basic Arithmetic (10 questions max)<br>
                        <strong>Full Access:</strong> All games, unlimited questions, AI personalization
                    </p>
                </div>
            </div>
        `;

        // Attach event listeners
        document.getElementById('guestBtn').addEventListener('click', () => {
            this.continueAsGuest();
        });

        document.getElementById('signInBtn').addEventListener('click', () => {
            this.showAuthenticationScreen();
        });
    }

    /**
     * Continue as guest user
     */
    continueAsGuest() {
        showToast('Welcome, Guest! You can try Basic Arithmetic.', 'info');
        this.showGameSelection();
    }

    /**
     * Show authentication screen
     */
    showAuthenticationScreen() {
        this.state = APP_STATES.AUTHENTICATION;
        
        const modal = new Modal({
            title: 'Sign In / Sign Up',
            content: `
                <div class="km-auth-container">
                    <div class="km-auth-tabs">
                        <button class="km-auth-tab km-auth-tab--active" data-tab="signin">Sign In</button>
                        <button class="km-auth-tab" data-tab="signup">Sign Up</button>
                    </div>
                    
                    <div class="km-auth-form" id="signinForm">
                        <div class="km-form-group">
                            <label>Email</label>
                            <input type="email" class="km-input__field" id="signinEmail" placeholder="your@email.com" required>
                        </div>
                        <div class="km-form-group">
                            <label>Password</label>
                            <input type="password" class="km-input__field" id="signinPassword" placeholder="Your password" required>
                        </div>
                        <button class="km-button km-button--primary km-button--full-width" id="signinSubmit">
                            Sign In
                        </button>
                    </div>
                    
                    <div class="km-auth-form" id="signupForm" style="display:none;">
                        <div class="km-form-group">
                            <label>Parent Name</label>
                            <input type="text" class="km-input__field" id="parentName" placeholder="Your name" required>
                        </div>
                        <div class="km-form-group">
                            <label>Email</label>
                            <input type="email" class="km-input__field" id="signupEmail" placeholder="your@email.com" required>
                        </div>
                        <div class="km-form-group">
                            <label>Password</label>
                            <input type="password" class="km-input__field" id="signupPassword" placeholder="Choose a password" required>
                        </div>
                        <div class="km-form-group">
                            <label>Child's Name</label>
                            <input type="text" class="km-input__field" id="childName" placeholder="Child's name" required>
                        </div>
                        <div class="km-form-group">
                            <label>Child's Age</label>
                            <select class="km-input__field" id="childAge">
                                <option value="3">3 years</option>
                                <option value="4">4 years</option>
                                <option value="5" selected>5 years</option>
                                <option value="6">6 years</option>
                                <option value="7">7 years</option>
                            </select>
                        </div>
                        <button class="km-button km-button--primary km-button--full-width" id="signupSubmit">
                            Create Account
                        </button>
                    </div>
                </div>
            `,
            onClose: () => {
                this.showWelcomeScreen();
            }
        });

        modal.open();

        // Tab switching
        const tabs = modal.element.querySelectorAll('.km-auth-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('km-auth-tab--active'));
                tab.classList.add('km-auth-tab--active');
                
                const tabName = tab.dataset.tab;
                modal.element.querySelector('#signinForm').style.display = 
                    tabName === 'signin' ? 'block' : 'none';
                modal.element.querySelector('#signupForm').style.display = 
                    tabName === 'signup' ? 'block' : 'none';
            });
        });

        // Sign in handler
        modal.element.querySelector('#signinSubmit').addEventListener('click', async () => {
            const email = modal.element.querySelector('#signinEmail').value;
            const password = modal.element.querySelector('#signinPassword').value;
            
            if (!email || !password) {
                showToast('Please fill in all fields', 'error');
                return;
            }

            const loader = showLoading('Signing in...');
            
            const result = await this.userManager.signIn({ email, password });
            
            loader.hide();
            
            if (result.success) {
                showToast('Welcome back!', 'success');
                modal.close();
                this.showGameSelection();
            } else {
                showToast(result.error || 'Sign in failed', 'error');
            }
        });

        // Sign up handler
        modal.element.querySelector('#signupSubmit').addEventListener('click', async () => {
            const parentName = modal.element.querySelector('#parentName').value;
            const email = modal.element.querySelector('#signupEmail').value;
            const password = modal.element.querySelector('#signupPassword').value;
            const childName = modal.element.querySelector('#childName').value;
            const childAge = parseInt(modal.element.querySelector('#childAge').value);
            
            if (!parentName || !email || !password || !childName) {
                showToast('Please fill in all fields', 'error');
                return;
            }

            const loader = showLoading('Creating account...');
            
            const result = await this.userManager.signUp({
                email,
                password,
                parentName,
                childName,
                childAge
            });
            
            loader.hide();
            
            if (result.success) {
                showToast('Account created successfully!', 'success');
                modal.close();
                this.showGameSelection();
            } else {
                showToast(result.error || 'Sign up failed', 'error');
            }
        });
    }

    /**
     * Show game selection screen
     */
    showGameSelection() {
        this.state = APP_STATES.GAME_SELECTION;
        
        const games = [
            {
                id: 'basic-arithmetic',
                name: 'Basic Arithmetic',
                description: 'Addition, Subtraction, Multiplication & Division',
                icon: '🔢',
                config: GAMES_CONFIG.basicArithmetic
            },
            {
                id: 'number-sequences',
                name: 'Number Sequences',
                description: 'Pattern Recognition & Counting',
                icon: '🔄',
                config: GAMES_CONFIG.numberSequences
            },
            {
                id: 'time-clock',
                name: 'Time & Clock',
                description: 'Learn to tell time and understand clocks',
                icon: '🕐',
                config: GAMES_CONFIG.timeClock
            },
            {
                id: 'money-math',
                name: 'Money Math',
                description: 'Coin counting, change making & prices',
                icon: '💰',
                config: GAMES_CONFIG.moneyMath
            }
        ];

        const userProgress = this.userManager.currentUser?.gameProgress || {};
        
        this.appContainer.innerHTML = `
            <div class="km-game-selection">
                <header class="km-header">
                    <div class="km-header-content">
                        <h1 class="km-header-title">
                            <span class="km-header-icon">🎓</span>
                            Math Adventure
                        </h1>
                        <div class="km-header-user">
                            <span class="km-user-name">${this.userManager.currentUser.name}</span>
                            ${!this.userManager.isGuest ? `
                                <button class="km-button km-button--text km-button--small" id="dashboardBtn">
                                    📊 Dashboard
                                </button>
                            ` : ''}
                            <button class="km-button km-button--text km-button--small" id="settingsBtn">
                                ⚙️ Settings
                            </button>
                            ${!this.userManager.isGuest ? `
                                <button class="km-button km-button--text km-button--small" id="signOutBtn">
                                    🚪 Sign Out
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </header>
                
                <main class="km-main-content">
                    ${!this.userManager.isGuest ? this.dailyChallengesManager.getChallengesHTML() : ''}
                    <div class="km-game-grid" id="gameGrid"></div>
                </main>
            </div>
        `;

        const gameGrid = document.getElementById('gameGrid');
        
        games.forEach(game => {
            const isLocked = this.userManager.isGuest && game.id !== 'basic-arithmetic';
            const progress = userProgress[game.id]?.completion || 0;
            
            const gameCard = new GameCard({
                game: game,
                locked: isLocked,
                progress: progress,
                onSelect: (selectedGame) => {
                    if (!isLocked) {
                        this.selectGame(selectedGame);
                    } else {
                        showToast('Sign in to unlock all games!', 'info');
                    }
                }
            });
            
            gameCard.mount(gameGrid);
        });

        // Attach header button listeners
        document.getElementById('dashboardBtn')?.addEventListener('click', () => {
            this.showParentalDashboard();
        });
        
        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            this.showSettings();
        });

        document.getElementById('signOutBtn')?.addEventListener('click', async () => {
            await this.userManager.signOut();
        });
    }

    /**
     * Select a game and show configuration
     */
    selectGame(game) {
        console.log('🎮 Game selected:', game.id, game.name);
        this.currentGame = game;
        this.showGameConfig(game);
    }

    /**
     * Show game configuration screen
     */
    showGameConfig(game) {
        console.log('⚙️ Showing game config for:', game.name);
        this.state = APP_STATES.GAME_CONFIG;
        
        const ageGroups = Object.keys(game.config.ageGroups);
        const difficulties = Object.keys(game.config.difficulty);
        const maxQuestions = this.userManager.canAccess('unlimited_questions') ? 50 : 10;
        
        this.appContainer.innerHTML = `
            <div class="km-game-config">
                <header class="km-header">
                    <button class="km-button km-button--text" id="backBtn">
                        ← Back to Games
                    </button>
                    <h1 class="km-header-title">${game.icon} ${game.name}</h1>
                </header>
                
                <main class="km-config-content">
                    <div class="km-config-card">
                        <h2 class="km-config-section-title">Game Settings</h2>
                        
                        <div class="km-form-group">
                            <label class="km-form-label">Age Group</label>
                            <select class="km-input__field" id="ageGroup">
                                ${ageGroups.map(age => `
                                    <option value="${age}" ${age === '5-6' ? 'selected' : ''}>
                                        ${age} years
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="km-form-group">
                            <label class="km-form-label">Number of Questions</label>
                            <input type="number" 
                                   class="km-input__field" 
                                   id="numQuestions" 
                                   min="5" 
                                   max="${maxQuestions}" 
                                   value="10">
                            <small class="km-form-hint">
                                ${this.userManager.isGuest ? 'Guest limit: 10 questions' : `Up to ${maxQuestions} questions`}
                            </small>
                        </div>
                        
                        <div class="km-form-group">
                            <label class="km-form-label">Starting Difficulty</label>
                            <select class="km-input__field" id="difficulty">
                                ${difficulties.map(diff => `
                                    <option value="${diff}" ${diff === 'easy' ? 'selected' : ''}>
                                        ${diff.charAt(0).toUpperCase() + diff.slice(1)}
                                    </option>
                                `).join('')}
                            </select>
                            <small class="km-form-hint">Difficulty adjusts automatically based on performance</small>
                        </div>
                        
                        <button class="km-button km-button--primary km-button--large km-button--full-width" id="startGameBtn">
                            <span>🎮</span>
                            <span>Start Game</span>
                        </button>
                    </div>
                </main>
            </div>
        `;

        document.getElementById('backBtn').addEventListener('click', () => {
            this.showGameSelection();
        });

        document.getElementById('startGameBtn').addEventListener('click', () => {
            const config = {
                ageGroup: document.getElementById('ageGroup').value,
                maxQuestions: parseInt(document.getElementById('numQuestions').value),
                difficulty: document.getElementById('difficulty').value
            };
            
            this.startGame(game, config);
        });
    }

    /**
     * Start the game with configured settings
     */
    async startGame(game, config) {
        const loader = showLoading('Starting game...');
        
        try {
            // Initialize game engine
            let engine;
            
            switch (game.id) {
                case 'basic-arithmetic':
                    engine = new BasicArithmeticEngine(this.userManager, config.ageGroup);
                    break;
                case 'number-sequences':
                    engine = new NumberSequencesEngine(this.userManager, config.ageGroup);
                    break;
                case 'time-clock':
                    engine = new TimeClockEngine(this.userManager, config.ageGroup);
                    break;
                case 'money-math':
                    engine = new MoneyMathEngine(this.userManager, config.ageGroup);
                    break;
            }
            
            await engine.init();
            this.currentGameEngine = engine;
            
            // Initialize session hints counter
            this.sessionHintsUsed = 0;
            this.currentProblemHints = 0;
            
            // Start game session
            const firstProblem = engine.startSession({
                maxQuestions: config.maxQuestions,
                difficulty: config.difficulty
            });
            
            loader.hide();
            
            this.showGamePlay(firstProblem);
            
        } catch (error) {
            loader.hide();
            console.error('Failed to start game:', error);
            showToast('Failed to start game. Please try again.', 'error');
        }
    }

    /**
     * Show game play screen
     */
    showGamePlay(problem) {
        this.state = APP_STATES.PLAYING;
        
        // Setup hints for this problem
        if (this.hintsManager && this.settingsManager?.getSetting('hints_enabled') !== false) {
            this.hintsManager.setupHints(this.currentGame.id, problem);
        }
        
        // This will be implemented with specific game renderers
        // For now, show a placeholder
        this.appContainer.innerHTML = `
            <div class="km-gameplay">
                <header class="km-game-header">
                    <div class="km-game-progress">
                        Question ${this.currentGameEngine.currentSession.questionsAsked} of ${this.currentGameEngine.currentSession.maxQuestions}
                    </div>
                    <div class="km-game-actions">
                        ${this.hintsManager && this.settingsManager?.getSetting('hints_enabled') !== false ? `
                            <button class="km-button km-button--outlined km-button--small km-hint-btn" id="hintBtn">
                                💡 Hint
                                ${this.hintsManager.hasMoreHints() ? `<span class="hint-count">${this.hintsManager.getTotalHints() - this.hintsManager.getHintsShownCount()}</span>` : ''}
                            </button>
                        ` : ''}
                        <button class="km-button km-button--text km-button--small" id="quitBtn">
                            Exit Game
                        </button>
                    </div>
                </header>
                
                <main class="km-game-content">
                    <div class="km-problem-display" id="problemDisplay">
                        <!-- Problem will be rendered here -->
                    </div>
                    
                    <div class="km-answer-section" id="answerSection">
                        <!-- Answer input will be rendered here -->
                    </div>
                    
                    <div id="hintContainer"></div>
                </main>
            </div>
        `;

        document.getElementById('quitBtn').addEventListener('click', () => {
            this.confirmQuitGame();
        });
        
        // Setup hint button
        const hintBtn = document.getElementById('hintBtn');
        if (hintBtn && this.hintsManager) {
            hintBtn.addEventListener('click', () => {
                this.showNextHint();
            });
        }
        
        // Render the specific problem
        this.renderProblem(problem);
    }

    /**
     * Render problem based on game type
     */
    renderProblem(problem) {
        console.log('Rendering problem:', problem);
        
        // Create renderer if not exists
        if (!this.currentRenderer) {
            this.currentRenderer = GameRendererFactory.create(
                this.currentGame.id, 
                '#problemDisplay'
            );
        }

        // Get visual data from the game engine
        let visualData = null;
        if (problem.visualType && this.currentGameEngine) {
            // Each game engine has a visualRenderer property
            if (this.currentGameEngine.visualRenderer) {
                const visualMethod = `create${problem.visualType.charAt(0).toUpperCase() + problem.visualType.slice(1)}Visual`;
                if (typeof this.currentGameEngine.visualRenderer[visualMethod] === 'function') {
                    visualData = this.currentGameEngine.visualRenderer[visualMethod](problem);
                }
            }
        }

        // Render the problem
        this.currentRenderer.render(problem, visualData);
        
        // Announce question for screen readers
        if (this.ariaAnnouncer && this.currentGameEngine) {
            const session = this.currentGameEngine.currentSession;
            this.ariaAnnouncer.announceQuestion(
                session.questionsAsked,
                session.maxQuestions,
                problem.question
            );
        }
        
        // Reset hints for new problem
        this.currentProblemHints = 0; // Reset hint counter for new problem
        if (this.hintsManager) {
            this.hintsManager.setupHints(this.currentGame.id, problem);
            // Update hint button state
            const hintBtn = document.getElementById('hintBtn');
            if (hintBtn) {
                hintBtn.disabled = false;
                const countSpan = hintBtn.querySelector('.hint-count');
                if (countSpan) {
                    countSpan.textContent = this.hintsManager.getTotalHints();
                }
            }
        }

        // Attach answer handlers
        const answerButtons = document.querySelectorAll('.km-answer-btn');
        answerButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedAnswer = btn.getAttribute('data-answer');
                this.handleAnswer(selectedAnswer);
            });
        });

        // Start answer timer
        this.answerStartTime = Date.now();
    }

    /**
     * Handle answer submission
     */
    handleAnswer(answer) {
        const timeSpent = Date.now() - this.answerStartTime;
        
        // Resume audio context on user interaction
        if (this.soundManager) {
            this.soundManager.resume();
        }
        
        // Disable all answer buttons
        const answerButtons = document.querySelectorAll('.km-answer-btn');
        answerButtons.forEach(btn => btn.disabled = true);

        // Submit answer to game engine
        const result = this.currentGameEngine.submitAnswer(answer, timeSpent);

        // Show feedback
        if (result.correct) {
            showToast(result.phrase || '🌟 Excellent!', 'success');
            
            // Announce for screen readers
            if (this.ariaAnnouncer) {
                this.ariaAnnouncer.announceFeedback(true);
            }
            
            // Play success sound
            if (this.soundManager) {
                this.soundManager.playSuccess();
                this.soundManager.vibrate([50]);
            }
            
            // Highlight correct answer
            answerButtons.forEach(btn => {
                if (btn.getAttribute('data-answer') === answer) {
                    btn.classList.add('km-answer-correct');
                }
            });
        } else {
            showToast(result.phrase || '💪 Try again! You can do it!', 'error');
            
            // Announce for screen readers
            if (this.ariaAnnouncer) {
                this.ariaAnnouncer.announceFeedback(false, result.correctAnswer);
            }
            
            // Play error sound
            if (this.soundManager) {
                this.soundManager.playError();
                this.soundManager.vibrate([100, 50, 100]);
            }
            
            // Highlight incorrect answer
            answerButtons.forEach(btn => {
                if (btn.getAttribute('data-answer') === answer) {
                    btn.classList.add('km-answer-incorrect');
                }
                // Also highlight correct answer
                if (btn.getAttribute('data-answer') === String(result.correctAnswer)) {
                    btn.classList.add('km-answer-correct');
                }
            });
        }

        // Update progress
        this.updateGameProgress();

        // Continue to next question after delay
        setTimeout(() => {
            if (result.sessionComplete) {
                // Play celebration for session complete
                if (this.soundManager) {
                    this.soundManager.playCelebration();
                }
                // Show results
                const sessionResults = this.currentGameEngine.getSessionResults();
                this.showResults(sessionResults);
            } else {
                // Get next problem
                const nextProblem = this.currentGameEngine.getNextProblem();
                this.showGamePlay(nextProblem);
            }
        }, 2000);
    }

    /**
     * Update game progress display
     */
    updateGameProgress() {
        const session = this.currentGameEngine.currentSession;
        
        // Update question counter
        const progressText = document.querySelector('#game-progress');
        if (progressText) {
            progressText.textContent = `Question ${session.questionsAsked} of ${session.maxQuestions}`;
        }

        // Update progress bar
        const progressFill = document.getElementById('game-progress-fill');
        if (progressFill) {
            const percentage = (session.questionsAsked / session.maxQuestions) * 100;
            progressFill.style.width = `${percentage}%`;
        }

        // Update accuracy
        const accuracyDisplay = document.getElementById('accuracy-display');
        if (accuracyDisplay && session.questionsAsked > 0) {
            const accuracy = Math.round((session.correctAnswers / session.questionsAsked) * 100);
            accuracyDisplay.textContent = `Accuracy: ${accuracy}%`;
        }
    }

    /**
     * Show next hint for current problem
     */
    showNextHint() {
        if (!this.hintsManager) return;

        const hintText = this.hintsManager.getNextHint();
        if (!hintText) return;

        // Track hints used for current problem
        if (!this.currentProblemHints) {
            this.currentProblemHints = 0;
        }
        this.currentProblemHints++;

        // Track session-wide hints
        if (!this.sessionHintsUsed) {
            this.sessionHintsUsed = 0;
        }
        this.sessionHintsUsed++;

        // Display the hint
        const hintContainer = document.getElementById('hintContainer');
        if (hintContainer) {
            this.hintsManager.showHint(hintText, hintContainer);
        }

        // Update hint button state
        const hintBtn = document.getElementById('hintBtn');
        if (hintBtn) {
            const countSpan = hintBtn.querySelector('.hint-count');
            const remaining = this.hintsManager.getTotalHints() - this.hintsManager.getHintsShownCount();
            
            if (countSpan) {
                countSpan.textContent = remaining;
            }

            // Disable button if no more hints
            if (!this.hintsManager.hasMoreHints()) {
                hintBtn.disabled = true;
            }
            
            // Announce hint for screen readers
            if (this.ariaAnnouncer) {
                this.ariaAnnouncer.announceHint(hintText, remaining);
            }
        }

        // Play sound effect
        if (this.soundManager) {
            this.soundManager.playClick();
        }
    }

    /**
     * Show results screen
     */
    showResults(results) {
        this.state = APP_STATES.RESULTS;
        
        const accuracy = Math.round(results.accuracy * 100);
        const duration = Math.round(results.timeSpent / 1000);
        
        // Announce results for screen readers
        if (this.ariaAnnouncer) {
            this.ariaAnnouncer.announceResults(
                results.correctAnswers,
                results.problems.length,
                accuracy
            );
        }
        
        // Trigger confetti for great performance
        if (this.confettiAnimation) {
            if (accuracy === 100) {
                // Perfect score - spectacular celebration
                this.confettiAnimation.perfectScore();
            } else if (accuracy >= 90) {
                // Excellent - multi-burst
                setTimeout(() => this.confettiAnimation.celebrate({ type: 'multi', count: 40 }), 500);
            } else if (accuracy >= 80) {
                // Good - single burst
                setTimeout(() => this.confettiAnimation.burst({ count: 30 }), 500);
            }
        }
        
        // Update daily challenges
        if (this.dailyChallengesManager && !this.userManager.isGuest) {
            const sessionData = {
                gameType: this.currentGame.id,
                correctAnswers: results.correctAnswers,
                totalQuestions: results.problems.length,
                accuracy: accuracy,
                currentStreak: results.longestStreak,
                answerTimes: results.problems.map(p => p.timeSpent)
            };
            
            const completedChallenges = this.dailyChallengesManager.updateProgress(sessionData);
            
            // Show celebration for completed challenges
            if (completedChallenges && completedChallenges.length > 0 && this.confettiAnimation) {
                setTimeout(() => {
                    this.confettiAnimation.achievementCelebration('gold');
                    showToast(`🎉 Daily Challenge Complete! +${completedChallenges[0].reward} points`, 'success');
                    
                    // Announce for screen readers
                    if (this.ariaAnnouncer) {
                        this.ariaAnnouncer.announceDailyChallenge(
                            completedChallenges[0].name,
                            completedChallenges[0].reward
                        );
                    }
                }, 2000);
            }
        }
        
        // Check for new achievements
        if (this.achievementsManager && this.userManager && !this.userManager.isGuest) {
            const stats = this.userManager.currentUser.getStats();
            const newAchievements = this.achievementsManager.checkAchievements(stats);
            
            // Show achievement notifications
            if (newAchievements && newAchievements.length > 0) {
                setTimeout(() => {
                    newAchievements.forEach((achievement, index) => {
                        setTimeout(() => {
                            this.achievementsManager.showAchievementNotification(achievement);
                            
                            // Announce for screen readers
                            if (this.ariaAnnouncer) {
                                this.ariaAnnouncer.announceAchievement(
                                    achievement.name,
                                    achievement.description
                                );
                            }
                            
                            // Confetti for each achievement
                            if (this.confettiAnimation) {
                                this.confettiAnimation.achievementCelebration('gold');
                            }
                        }, index * 6000); // Stagger by 6 seconds
                    });
                }, 1500); // Show after results screen appears
            }
        }
        
        this.appContainer.innerHTML = `
            <div class="km-results">
                <div class="km-results-content">
                    <div class="km-results-header">
                        <div class="km-results-icon">${accuracy >= 80 ? '🌟' : accuracy >= 60 ? '👍' : '💪'}</div>
                        <h1 class="km-results-title">${accuracy >= 80 ? 'Excellent Work!' : accuracy >= 60 ? 'Good Job!' : 'Keep Practicing!'}</h1>
                    </div>
                    
                    <div class="km-results-stats">
                        <div class="km-stat-card">
                            <div class="km-stat-value">${results.correctAnswers}</div>
                            <div class="km-stat-label">Correct</div>
                        </div>
                        <div class="km-stat-card">
                            <div class="km-stat-value">${accuracy}%</div>
                            <div class="km-stat-label">Accuracy</div>
                        </div>
                        <div class="km-stat-card">
                            <div class="km-stat-value">${results.longestStreak}</div>
                            <div class="km-stat-label">Best Streak</div>
                        </div>
                        <div class="km-stat-card">
                            <div class="km-stat-value">${duration}s</div>
                            <div class="km-stat-label">Time</div>
                        </div>
                    </div>
                    
                    ${this.sessionHintsUsed > 0 ? `
                    <div class="km-results-hints">
                        <div class="km-hint-usage">
                            💡 Hints Used: ${this.sessionHintsUsed}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="km-results-actions">
                        <button class="km-button km-button--primary km-button--large" id="playAgainBtn">
                            🎮 Play Again
                        </button>
                        <button class="km-button km-button--secondary km-button--large" id="backToGamesBtn">
                            🏠 Back to Games
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.showGameConfig(this.currentGame);
        });

        document.getElementById('backToGamesBtn').addEventListener('click', () => {
            this.showGameSelection();
        });
    }

    /**
     * Show parental dashboard
     */
    showParentalDashboard() {
        this.state = APP_STATES.DASHBOARD;
        
        if (!this.parentalDashboard) {
            showToast('Dashboard is not available', 'error');
            return;
        }
        
        const dashboardHTML = this.parentalDashboard.getDashboardHTML();
        this.appContainer.innerHTML = dashboardHTML;
        
        // Attach event listeners
        document.getElementById('backBtn')?.addEventListener('click', () => {
            this.showGameSelection();
        });
        
        document.getElementById('exportReportBtn')?.addEventListener('click', () => {
            this.parentalDashboard.exportReport();
            showToast('Report exported successfully!', 'success');
        });
        
        document.getElementById('printReportBtn')?.addEventListener('click', () => {
            this.parentalDashboard.printReport();
        });
        
        document.getElementById('shareReportBtn')?.addEventListener('click', async () => {
            const success = await this.parentalDashboard.shareReport();
            if (success) {
                showToast('Report shared successfully!', 'success');
            }
        });
        
        document.getElementById('signInFromDashboard')?.addEventListener('click', () => {
            this.showAuthentication();
        });
    }

    /**
     * Show settings
     */
    showSettings() {
        this.state = APP_STATES.SETTINGS;
        
        if (!this.settingsManager) {
            showToast('Settings are not available', 'error');
            return;
        }
        
        const settingsUI = this.settingsManager.getSettingsUI();
        
        let settingsHTML = `
            <div class="km-settings">
                <header class="km-header">
                    <button class="km-button km-button--text" id="backBtn">← Back</button>
                    <h1 class="km-header-title">⚙️ Settings</h1>
                    <div style="width: 60px;"></div>
                </header>
                
                <div class="km-settings-content">
        `;
        
        // Render each settings section
        settingsUI.forEach(section => {
            settingsHTML += `
                <div class="settings-group">
                    <h2 class="settings-title">
                        <span>${section.icon}</span>
                        ${section.title}
                    </h2>
            `;
            
            section.settings.forEach(setting => {
                const currentValue = this.settingsManager.getSetting(setting.key);
                
                settingsHTML += `<div class="settings-item">`;
                settingsHTML += `<div class="settings-label">${setting.label}</div>`;
                settingsHTML += `<div class="settings-control">`;
                
                if (setting.type === 'toggle') {
                    settingsHTML += `
                        <button class="toggle-switch ${currentValue ? 'checked' : ''}" 
                                data-key="${setting.key}" 
                                data-type="toggle">
                            <div class="toggle-thumb"></div>
                        </button>
                    `;
                } else if (setting.type === 'select') {
                    settingsHTML += `<select class="form-select" data-key="${setting.key}" data-type="select">`;
                    setting.options.forEach(option => {
                        settingsHTML += `<option value="${option.value}" ${currentValue === option.value ? 'selected' : ''}>${option.label}</option>`;
                    });
                    settingsHTML += `</select>`;
                } else if (setting.type === 'number') {
                    settingsHTML += `
                        <input type="number" 
                               class="form-select" 
                               value="${currentValue}" 
                               min="${setting.min || 0}" 
                               max="${setting.max || 100}" 
                               step="${setting.step || 1}"
                               data-key="${setting.key}" 
                               data-type="number">
                    `;
                }
                
                settingsHTML += `</div></div>`;
            });
            
            settingsHTML += `</div>`;
        });
        
        settingsHTML += `
                    <div class="settings-group">
                        <h2 class="settings-title">
                            <span>📦</span>
                            Data Management
                        </h2>
                        <div class="km-button-group">
                            <button class="km-button km-button--secondary" id="exportSettingsBtn">
                                Export Settings
                            </button>
                            <button class="km-button km-button--secondary" id="importSettingsBtn">
                                Import Settings
                            </button>
                            <button class="km-button km-button--danger" id="resetSettingsBtn">
                                Reset to Defaults
                            </button>
                        </div>
                        <input type="file" id="importSettingsFile" accept=".json" style="display: none;">
                    </div>
                </div>
            </div>
        `;
        
        this.appContainer.innerHTML = settingsHTML;
        
        // Event listeners
        document.getElementById('backBtn').addEventListener('click', () => {
            this.showGameSelection();
        });
        
        // Toggle switches
        document.querySelectorAll('.toggle-switch').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const key = toggle.getAttribute('data-key');
                const currentValue = this.settingsManager.getSetting(key);
                const newValue = !currentValue;
                
                // Check if requires parental permission
                if (this.settingsManager.requiresParentalPermission(key)) {
                    const pin = prompt('Enter parental PIN:');
                    if (!this.settingsManager.verifyParentalPin(pin)) {
                        showToast('Incorrect PIN', 'error');
                        return;
                    }
                }
                
                this.settingsManager.updateSetting(key, newValue);
                toggle.classList.toggle('checked', newValue);
                showToast('Setting updated', 'success');
            });
        });
        
        // Select and number inputs
        document.querySelectorAll('.form-select').forEach(input => {
            input.addEventListener('change', () => {
                const key = input.getAttribute('data-key');
                const type = input.getAttribute('data-type');
                let value = input.value;
                
                if (type === 'number') {
                    value = parseInt(value);
                }
                
                if (this.settingsManager.requiresParentalPermission(key)) {
                    const pin = prompt('Enter parental PIN:');
                    if (!this.settingsManager.verifyParentalPin(pin)) {
                        showToast('Incorrect PIN', 'error');
                        // Reset to previous value
                        input.value = this.settingsManager.getSetting(key);
                        return;
                    }
                }
                
                this.settingsManager.updateSetting(key, value);
                showToast('Setting updated', 'success');
            });
        });
        
        // Export settings
        document.getElementById('exportSettingsBtn').addEventListener('click', () => {
            this.settingsManager.exportSettings();
            showToast('Settings exported', 'success');
        });
        
        // Import settings
        document.getElementById('importSettingsBtn').addEventListener('click', () => {
            document.getElementById('importSettingsFile').click();
        });
        
        document.getElementById('importSettingsFile').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    await this.settingsManager.importSettings(file);
                    showToast('Settings imported successfully', 'success');
                    // Refresh settings display
                    this.showSettings();
                } catch (error) {
                    showToast('Failed to import settings: ' + error.message, 'error');
                }
            }
        });
        
        // Reset settings
        document.getElementById('resetSettingsBtn').addEventListener('click', () => {
            const modal = new Modal({
                title: 'Reset Settings?',
                content: '<p>This will reset all settings to their default values. This action cannot be undone.</p>',
                actions: [
                    {
                        text: 'Cancel',
                        variant: 'text',
                        close: true
                    },
                    {
                        text: 'Reset',
                        variant: 'danger',
                        onClick: () => {
                            this.settingsManager.resetToDefaults();
                            showToast('Settings reset to defaults', 'success');
                            this.showSettings();
                        }
                    }
                ]
            });
            modal.open();
        });
    }

    /**
     * Confirm quit game
     */
    confirmQuitGame() {
        const modal = new Modal({
            title: 'Quit Game?',
            content: '<p>Are you sure you want to quit? Your progress will be lost.</p>',
            actions: [
                {
                    text: 'Continue Playing',
                    variant: 'primary',
                    close: true
                },
                {
                    text: 'Quit',
                    variant: 'text',
                    onClick: () => {
                        this.showGameSelection();
                    }
                }
            ]
        });
        
        modal.open();
    }

    /**
     * Handle escape key
     */
    handleEscapeKey() {
        if (this.state === APP_STATES.PLAYING) {
            this.confirmQuitGame();
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        showToast(message, 'error', 5000);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mathApp = new KindergartenMathApp();
        window.mathApp.init();
    });
} else {
    window.mathApp = new KindergartenMathApp();
    window.mathApp.init();
}

export default KindergartenMathApp;