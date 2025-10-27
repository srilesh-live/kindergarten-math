/**
 * Kindergarten Math Game
 * A web application for kindergarten students to practice basic arithmetic
 */

class MathGame {
    constructor() {
        // Default configuration
        this.config = {
            operations: ['addition'],
            minOperand1: 1,
            maxOperand1: 10,
            minOperand2: 1,
            maxOperand2: 10,
            totalQuestions: 10
        };
        
        this.currentProblem = null;
        this.elements = {};
        this.mistakes = [];
        this.mistakePatterns = new Map(); // Cache for mistake patterns
        this.showingCorrectFeedback = false; // Flag to preserve correct answer visual feedback
        
        // Question tracking
        this.questionStats = {
            currentQuestion: 1,
            totalQuestions: 10,
            correctAnswers: 0,
            incorrectAnswers: 0,
            questionsAnswered: [],
            sessionStartTime: null,
            sessionEndTime: null
        };
        
        // Timer properties
        this.timer = {
            startTime: null,
            elapsedTime: 0,
            isRunning: false,
            intervalId: null
        };
        
        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            await this.loadSettings();
            await this.loadTheme();
            await this.loadMistakePatterns();
            this.initializeElements();
            this.initializeStatusBar();
            this.bindEvents();
            this.resetQuestionStats();
            this.generateNewProblem();
            this.startTimer();
            
            console.log('Math game initialized successfully');
        } catch (error) {
            console.error('Failed to initialize math game:', error);
        }
    }

    /**
     * Start the timer
     */
    startTimer() {
        if (!this.timer.isRunning) {
            this.timer.startTime = Date.now() - this.timer.elapsedTime;
            this.timer.isRunning = true;
            this.timer.intervalId = setInterval(() => {
                this.updateTimerDisplay();
            }, 1000);
            this.updatePlayPauseIcon('pause');
            this.enableInput();
        }
    }

    /**
     * Pause the timer
     */
    pauseTimer() {
        if (this.timer.isRunning) {
            this.timer.isRunning = false;
            clearInterval(this.timer.intervalId);
            this.timer.elapsedTime = Date.now() - this.timer.startTime;
            this.updatePlayPauseIcon('play_arrow');
            this.disableInput();
        }
    }

    /**
     * Toggle timer between play and pause
     */
    toggleTimer() {
        if (this.timer.isRunning) {
            this.pauseTimer();
            this.disableInput();
            this.updatePlayPauseIcon('play_arrow');
        } else {
            this.startTimer();
            this.enableInput();
            this.updatePlayPauseIcon('pause');
        }
    }

    /**
     * Update the timer display
     */
    updateTimerDisplay() {
        if (this.timer.isRunning) {
            this.timer.elapsedTime = Date.now() - this.timer.startTime;
        }
        
        const totalSeconds = Math.floor(this.timer.elapsedTime / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        if (this.elements.timerDisplay) {
            this.elements.timerDisplay.textContent = display;
        }
    }

    /**
     * Update the play/pause button icon
     */
    updatePlayPauseIcon(iconName) {
        if (this.elements.playPauseIcon) {
            this.elements.playPauseIcon.textContent = iconName;
        }
    }

    /**
     * Disable input field when timer is paused
     */
    disableInput() {
        if (this.elements.answerInput) {
            this.elements.answerInput.disabled = true;
            this.elements.answerInput.style.opacity = '0.5';
        }
    }

    /**
     * Enable input field when timer is running
     */
    enableInput() {
        if (this.elements.answerInput) {
            this.elements.answerInput.disabled = false;
            this.elements.answerInput.style.opacity = '1';
            this.elements.answerInput.focus();
        }
    }

    /**
     * Stop the current session and go to statistics
     */
    stopSession() {
        this.pauseTimer();
        this.completeSession();
    }

    /**
     * Restart the current session
     */
    restartSession() {
        // Reset timer
        this.timer.elapsedTime = 0;
        this.timer.isRunning = false;
        clearInterval(this.timer.intervalId);
        this.updateTimerDisplay();
        
        // Reset session data
        this.resetQuestionStats();
        this.clearAllMistakes();
        
        // Start new session
        this.startTimer();
        this.enableInput();
        this.updatePlayPauseIcon('pause');
        this.generateNewProblem();
    }

    /**
     * Enable input when timer is running
     */
    enableInput() {
        if (this.elements.answerInput) {
            this.elements.answerInput.disabled = false;
            this.elements.answerInput.placeholder = '';
        }
    }

    /**
     * Disable input when timer is paused
     */
    disableInput() {
        if (this.elements.answerInput) {
            this.elements.answerInput.disabled = true;
            this.elements.answerInput.placeholder = 'Timer paused - click play to continue';
        }
    }

    /**
     * Reset timer (when navigating to Arithmetic)
     */
    resetTimer() {
        this.pauseTimer();
        this.timer.elapsedTime = 0;
        this.timer.startTime = null;
        this.updateTimerDisplay();
        this.startTimer();
    }

    /**
     * Cache DOM elements for better performance
     */
    initializeElements() {
        const elements = {
            operand1: 'operand1',
            operand2: 'operand2',
            operation: 'operation',
            answerInput: 'answer-input',
            feedback: 'feedback',
            configPanel: 'config-panel',
            settingsBtn: 'settings-btn',
            themeIcon: 'theme-icon',
            pageTitle: 'page-title',
            minOperand1: 'min-operand1',
            maxOperand1: 'max-operand1',
            minOperand2: 'min-operand2',
            timerDisplay: 'timer-display',
            playPauseBtn: 'play-pause-btn',
            playPauseIcon: 'play-pause-icon',
            stopBtn: 'stop-btn',
            restartBtn: 'restart-btn',
            counterDisplay: 'counter-display',
            totalQuestions: 'total-questions',
            maxOperand2: 'max-operand2'
        };

        // Cache all elements
        for (const [key, id] of Object.entries(elements)) {
            this.elements[key] = document.getElementById(id);
            if (!this.elements[key]) {
                console.warn(`Element with ID '${id}' not found`);
            }
        }
    }

    /**
     * Initialize status bar with current session information
     */
    initializeStatusBar() {
        // Set login time to current timestamp
        const now = new Date();
        const loginTimeElement = document.getElementById('login-time');
        if (loginTimeElement) {
            loginTimeElement.textContent = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        }

        // Set current page (will be updated when navigation is implemented)
        const currentPageElement = document.getElementById('current-page');
        if (currentPageElement) {
            currentPageElement.textContent = 'Arithmetic';
        }

        // User name will be set when user functionality is implemented
        // For now it shows "Guest User" as set in HTML
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Input validation and answer checking
        this.elements.answerInput?.addEventListener('input', this.handleAnswerInput.bind(this));
        this.elements.answerInput?.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Settings panel
        this.elements.settingsBtn?.addEventListener('click', this.handleSettingsClick.bind(this));
        
        // Clear mistakes button
        this.elements.clearMistakesBtn?.addEventListener('click', this.clearAllMistakes.bind(this));
        
        // Timer controls
        this.elements.playPauseBtn?.addEventListener('click', this.toggleTimer.bind(this));
        this.elements.stopBtn?.addEventListener('click', this.stopSession.bind(this));
        this.elements.restartBtn?.addEventListener('click', this.restartSession.bind(this));
        
        // Menu button
        document.getElementById('menu-btn')?.addEventListener('click', (e) => this.toggleMenu(e));
        
        // Configuration panel events
        this.bindConfigEvents();
        
        // Navigation events
        this.bindNavigationEvents();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));
    }

    /**
     * Bind configuration panel events
     */
    bindConfigEvents() {
        // Save and Cancel buttons
        const saveBtn = document.getElementById('save-settings');
        const cancelBtn = document.getElementById('cancel-settings');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', this.saveSettings.bind(this));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', this.cancelSettings.bind(this));
        }

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        }

        // Auto-apply on input changes
        this.bindAutoApplyEvents();

        // Prevent closing config when clicking outside - user must use Save/Cancel
        this.elements.configPanel?.addEventListener('click', (e) => {
            // Only allow interactions within the settings container
            const settingsContainer = e.target.closest('.settings-container');
            if (!settingsContainer && e.target === this.elements.configPanel) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }

    /**
     * Bind navigation events
     */
    bindNavigationEvents() {
        const arithmeticPage = document.getElementById('arithmetic-page');
        if (arithmeticPage) {
            arithmeticPage.addEventListener('click', (e) => {
                e.preventDefault();
                this.showArithmeticPage();
            });
        }
    }

    /**
     * Handle answer input with debouncing
     */
    handleAnswerInput(e) {
        // Clear any existing timeouts
        if (this.inputTimeout) {
            clearTimeout(this.inputTimeout);
        }
        if (this.clearInputTimeout) {
            clearTimeout(this.clearInputTimeout);
        }
        
        // For number inputs, handle validation carefully
        let value = e.target.value;
        
        // Remove any non-numeric characters (except minus for negative numbers if needed)
        // For kindergarten math, we typically only need positive integers
        value = value.replace(/[^0-9]/g, '');
        
        // Limit to reasonable length (4 digits should be enough for kindergarten math)
        if (value.length > 4) {
            value = value.substring(0, 4);
        }
        
        // Update the input value if it was changed
        if (value !== e.target.value) {
            e.target.value = value;
        }
        
        // Debounce the answer checking
        this.inputTimeout = setTimeout(() => {
            this.checkAnswer();
        }, 100);
    }

    /**
     * Handle keydown events for better UX
     */
    handleKeydown(e) {
        // Allow: backspace, delete, tab, escape, enter
        const allowedKeys = [8, 9, 27, 13, 46];
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        const ctrlKeys = [65, 67, 86, 88];
        
        if (allowedKeys.includes(e.keyCode) || 
            (e.ctrlKey && ctrlKeys.includes(e.keyCode)) ||
            // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39) ||
            // Allow: number keys (0-9)
            (e.keyCode >= 48 && e.keyCode <= 57) ||
            // Allow: numpad (0-9)
            (e.keyCode >= 96 && e.keyCode <= 105)) {
            return;
        }
        
        // Ensure that it's not a number and stop the keypress
        e.preventDefault();
    }

    /**
     * Handle global keyboard shortcuts
     */
    handleGlobalKeydown(e) {
        // Escape key closes config panel with auto-apply
        if (e.keyCode === 27 && this.isConfigVisible()) {
            this.closeConfigWithApply();
        }
        
        // Ctrl/Cmd + comma opens settings
        if ((e.ctrlKey || e.metaKey) && e.keyCode === 188) {
            e.preventDefault();
            this.showConfig();
        }
    }

    /**
     * Handle settings button click
     */
    handleSettingsClick(e) {
        e.preventDefault();
        this.showConfig();
    }

    /**
     * Generate a new math problem based on current configuration
     */
    generateNewProblem() {
        if (!this.config.operations.length) {
            console.error('No operations configured');
            return;
        }

        // Use prioritized problem generation
        this.currentProblem = this.getPrioritizedProblem();
        this.displayProblem();
    }

    /**
     * Generate a random problem (original logic)
     */
    generateRandomProblem() {
        const operation = this.getRandomOperation();
        let operand1 = this.getRandomNumber1();
        let operand2 = this.getRandomNumber2();
        let answer, symbol;

        switch (operation) {
            case 'addition':
                answer = operand1 + operand2;
                symbol = '+';
                break;
                
            case 'subtraction':
                // Ensure no negative results
                if (operand1 < operand2) {
                    [operand1, operand2] = [operand2, operand1];
                }
                answer = operand1 - operand2;
                symbol = '−';
                break;
                
            case 'multiplication':
                answer = operand1 * operand2;
                symbol = '×';
                break;
                
            case 'division':
                // Ensure no remainders
                answer = operand2;
                operand1 = operand2 * this.getRandomNumber1();
                symbol = '÷';
                break;
                
            default:
                console.error('Unknown operation:', operation);
                return this.generateRandomProblem();
        }

        return { operand1, operand2, operation, answer, symbol };
    }

    /**
     * Display the current problem in the UI
     */
    displayProblem() {
        if (!this.currentProblem) return;

        const { operand1, operand2, symbol } = this.currentProblem;
        
        // Update problem display
        if (this.elements.operand1) this.elements.operand1.textContent = operand1;
        if (this.elements.operand2) this.elements.operand2.textContent = operand2;
        if (this.elements.operation) this.elements.operation.textContent = symbol;
        
        // Reset input and feedback (but preserve visual feedback timing)
        this.resetAnswerInput();
        
        // Focus on input for better UX
        this.elements.answerInput?.focus();
    }

    /**
     * Reset answer input to initial state
     */
    resetAnswerInput() {
        // Clear any pending clear timeout
        if (this.clearInputTimeout) {
            clearTimeout(this.clearInputTimeout);
        }
        
        if (this.elements.answerInput) {
            this.elements.answerInput.value = '';
            // Only reset visual state if we're not showing correct answer feedback
            if (!this.showingCorrectFeedback) {
                this.elements.answerInput.className = 'answer-input';
            }
        }
    }

    /**
     * Check the user's answer
     */
    checkAnswer() {
        if (!this.currentProblem || !this.elements.answerInput) return;

        const userInput = this.elements.answerInput.value.trim();
        
        // For number inputs, handle both string and numeric values
        let userAnswer;
        if (this.elements.answerInput.type === 'number') {
            // Number inputs return empty string when invalid, valueAsNumber returns NaN
            userAnswer = this.elements.answerInput.valueAsNumber;
        } else {
            userAnswer = parseInt(userInput);
        }
        
        const correctAnswer = this.currentProblem.answer;
        
        // Handle empty input or invalid numbers
        if (!userInput || isNaN(userAnswer) || userAnswer < 0) {
            this.setAnswerState('neutral');
            return;
        }

        // Check if answer is correct
        if (userAnswer === correctAnswer) {
            this.setAnswerState('correct');
            this.recordCorrectAnswer();
            
            // Set flag to preserve visual feedback
            this.showingCorrectFeedback = true;
            
            // Clear the flag and advance after showing feedback
            setTimeout(() => {
                this.showingCorrectFeedback = false;
                this.advanceToNextQuestion();
            }, 1000);
        } else {
            // Smart validation for multi-digit answers
            const correctAnswerStr = correctAnswer.toString();
            const userAnswerStr = userAnswer.toString();
            
            // If user's input could still be building up to correct answer
            if (correctAnswerStr.startsWith(userAnswerStr) && userAnswerStr.length < correctAnswerStr.length) {
                this.setAnswerState('neutral');
            } else {
                this.setAnswerState('incorrect');
                this.playErrorSound();
                this.addMistake(userAnswer);
                this.recordIncorrectAnswer(userAnswer);
                // Progress immediately to next question
                setTimeout(() => {
                    this.advanceToNextQuestion();
                }, 1000); // Brief delay to show incorrect state
            }
        }
    }

    /**
     * Set the visual state of the answer input
     */
    setAnswerState(state) {
        if (!this.elements.answerInput) return;

        const states = {
            neutral: {
                inputClass: 'answer-input'
            },
            correct: {
                inputClass: 'answer-input correct'
            },
            incorrect: {
                inputClass: 'answer-input incorrect'
            }
        };

        const stateConfig = states[state];
        if (stateConfig) {
            this.elements.answerInput.className = stateConfig.inputClass;
        }
    }

    /**
     * Schedule the next problem after a delay (deprecated - now handled inline)
     */

    /**
     * Schedule clearing the input field after incorrect answer (2 seconds)
     */
    scheduleClearInput() {
        // Clear any existing clear timeout
        if (this.clearInputTimeout) {
            clearTimeout(this.clearInputTimeout);
        }
        
        // Set new timeout to clear input after 1 second
        this.clearInputTimeout = setTimeout(() => {
            if (this.elements.answerInput) {
                this.elements.answerInput.value = '';
                this.setAnswerState('neutral');
            }
        }, 1000);
    }

    /**
     * Play error sound for incorrect answers
     */
    playErrorSound() {
        try {
            // Create audio context
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            // Configure oscillator
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.type = 'square';
            
            // Configure gain (volume)
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Play sound
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            
        } catch (error) {
            console.log('Audio not available:', error.message);
        }
    }

    /**
     * Get random operation from configured operations
     */
    getRandomOperation() {
        const operations = this.config.operations;
        return operations[Math.floor(Math.random() * operations.length)];
    }

    /**
     * Generate a random number for the first operand
     */
    getRandomNumber1() {
        const min = this.config.minOperand1;
        const max = this.config.maxOperand1;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Generate a random number for the second operand
     */
    getRandomNumber2() {
        const min = this.config.minOperand2;
        const max = this.config.maxOperand2;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Get random number within configured range (legacy method)
     */
    getRandomNumber() {
        // Use first operand range as fallback
        return this.getRandomNumber1();
    }

    /**
     * Show configuration panel
     */
    showConfig() {
        this.loadCurrentConfigToForm();
        if (this.elements.configPanel) {
            this.elements.configPanel.style.display = 'block';
            
            // Focus first input for accessibility
            const firstInput = this.elements.configPanel.querySelector('input, button');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    /**
     * Hide configuration panel
     */
    hideConfig() {
        if (this.elements.configPanel) {
            this.elements.configPanel.style.display = 'none';
            // Return focus to answer input
            this.elements.answerInput?.focus();
        }
    }

    /**
     * Close configuration panel and apply settings automatically
     */
    closeConfigWithApply() {
        this.applySettingsAutomatic();
        this.hideConfig();
    }

    /**
     * Save settings and close configuration panel
     */
    saveSettings() {
        this.applySettingsAutomatic();
        this.hideConfig();
    }

    /**
     * Cancel settings changes and close configuration panel
     */
    cancelSettings() {
        // Reload the current config to form without applying changes
        this.loadCurrentConfigToForm();
        this.hideConfig();
    }

    /**
     * Bind auto-apply events to form elements
     */
    bindAutoApplyEvents() {
        // Auto-apply when operations change
        const operationBtns = document.querySelectorAll('.op-btn');
        operationBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Toggle active state
                btn.classList.toggle('active');
                
                // Ensure at least one operation is selected
                const activeOps = document.querySelectorAll('.op-btn.active');
                if (activeOps.length === 0) {
                    btn.classList.add('active'); // Prevent unchecking the last operation
                }
            });
        });

        // Auto-apply when number range changes
        const numberInputs = ['min-operand1', 'max-operand1', 'min-operand2', 'max-operand2', 'total-questions'];
        numberInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', this.validateNumberRange.bind(this));
                input.addEventListener('blur', this.validateNumberRange.bind(this));
                input.addEventListener('input', this.validateTextInput.bind(this));
            }
        });
    }

    /**
     * Validate text input to ensure it contains only numbers
     */
    validateTextInput(event) {
        const input = event.target;
        let value = input.value;
        
        // Remove any non-digit characters
        value = value.replace(/[^0-9]/g, '');
        
        // Limit to reasonable range based on input type
        const numValue = parseInt(value);
        if (input.id === 'total-questions') {
            if (numValue > 100) {
                value = '100';
            }
        } else {
            if (numValue > 100) {
                value = '100';
            }
        }
        
        if (value === '') {
            // Allow empty for now, will be handled on blur
            return;
        }
        
        input.value = value;
    }

    /**
     * Validate number range inputs
     */
    validateNumberRange() {
        // Validate first operand range
        const minOperand1 = document.getElementById('min-operand1');
        const maxOperand1 = document.getElementById('max-operand1');
        
        if (minOperand1 && maxOperand1) {
            // Handle empty values with defaults
            if (minOperand1.value === '') minOperand1.value = '1';
            if (maxOperand1.value === '') maxOperand1.value = '10';
            
            let minVal1 = parseInt(minOperand1.value) || 1;
            let maxVal1 = parseInt(maxOperand1.value) || 10;

            // Ensure valid range
            if (minVal1 >= maxVal1) {
                if (minOperand1 === document.activeElement) {
                    maxOperand1.value = (minVal1 + 1).toString();
                } else {
                    minOperand1.value = (maxVal1 - 1).toString();
                }
            }

            // Ensure within bounds
            if (minVal1 < 1) minOperand1.value = '1';
            if (maxVal1 > 100) maxOperand1.value = '100';
        }
        
        // Validate second operand range
        const minOperand2 = document.getElementById('min-operand2');
        const maxOperand2 = document.getElementById('max-operand2');
        
        if (minOperand2 && maxOperand2) {
            // Handle empty values with defaults
            if (minOperand2.value === '') minOperand2.value = '1';
            if (maxOperand2.value === '') maxOperand2.value = '10';
            
            let minVal2 = parseInt(minOperand2.value) || 1;
            let maxVal2 = parseInt(maxOperand2.value) || 10;

            // Ensure valid range
            if (minVal2 >= maxVal2) {
                if (minOperand2 === document.activeElement) {
                    maxOperand2.value = (minVal2 + 1).toString();
                } else {
                    minOperand2.value = (maxVal2 - 1).toString();
                }
            }

            // Ensure within bounds
            if (minVal2 < 1) minOperand2.value = '1';
            if (maxVal2 > 100) maxOperand2.value = '100';
        }
        
        // Validate total questions
        const totalQuestionsInput = document.getElementById('total-questions');
        if (totalQuestionsInput) {
            if (totalQuestionsInput.value === '') totalQuestionsInput.value = '10';
            
            let totalQuestions = parseInt(totalQuestionsInput.value) || 10;
            
            // Ensure within bounds (10-100)
            if (totalQuestions < 10) totalQuestionsInput.value = '10';
            if (totalQuestions > 100) totalQuestionsInput.value = '100';
        }
        
        // Apply changes immediately
        this.applyConfigChanges();
    }

    /**
     * Apply configuration changes automatically
     */
    applyConfigChanges() {
        try {
            // Get current form values
            const minOperand1Input = document.getElementById('min-operand1');
            const maxOperand1Input = document.getElementById('max-operand1');
            const minOperand2Input = document.getElementById('min-operand2');
            const maxOperand2Input = document.getElementById('max-operand2');
            const totalQuestionsInput = document.getElementById('total-questions');

            if (minOperand1Input && maxOperand1Input && minOperand2Input && maxOperand2Input && totalQuestionsInput) {
                const minOperand1 = parseInt(minOperand1Input.value) || 1;
                const maxOperand1 = parseInt(maxOperand1Input.value) || 10;
                const minOperand2 = parseInt(minOperand2Input.value) || 1;
                const maxOperand2 = parseInt(maxOperand2Input.value) || 10;
                const totalQuestions = parseInt(totalQuestionsInput.value) || 10;

                // Update config silently
                this.config.minOperand1 = minOperand1;
                this.config.maxOperand1 = maxOperand1;
                this.config.minOperand2 = minOperand2;
                this.config.maxOperand2 = maxOperand2;
                this.config.totalQuestions = totalQuestions;
                
                // Update question stats if totalQuestions changed
                if (this.questionStats.totalQuestions !== totalQuestions) {
                    this.resetQuestionStats();
                    this.questionStats.totalQuestions = totalQuestions;
                    this.updateCounterDisplay();
                }

                this.saveSettings();
            }
        } catch (error) {
            console.error('Failed to apply config changes:', error);
        }
    }

    /**
     * Reset question statistics
     */
    resetQuestionStats() {
        this.questionStats = {
            currentQuestion: 1,
            totalQuestions: this.config.totalQuestions || 10,
            correctAnswers: 0,
            incorrectAnswers: 0,
            questionsAnswered: [],
            sessionStartTime: new Date(),
            sessionEndTime: null
        };
        this.updateCounterDisplay();
    }

    /**
     * Update the question counter display
     */
    updateCounterDisplay() {
        if (this.elements.counterDisplay) {
            this.elements.counterDisplay.textContent = 
                `${this.questionStats.currentQuestion}/${this.questionStats.totalQuestions}`;
        }
        
        // Update new progress elements
        this.updateProgressIndicators();
    }

    /**
     * Update the progress bar and text indicators
     */
    updateProgressIndicators() {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill) {
            const percentage = (this.questionStats.currentQuestion / this.questionStats.totalQuestions) * 100;
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `Question ${this.questionStats.currentQuestion} of ${this.questionStats.totalQuestions}`;
        }
    }

    /**
     * Record a correct answer
     */
    recordCorrectAnswer() {
        this.questionStats.correctAnswers++;
        this.questionStats.questionsAnswered.push({
            questionNumber: this.questionStats.currentQuestion,
            problem: { ...this.currentProblem },
            userAnswer: this.currentProblem.answer,
            isCorrect: true,
            timestamp: new Date()
        });
    }

    /**
     * Record an incorrect answer
     */
    recordIncorrectAnswer(userAnswer) {
        this.questionStats.incorrectAnswers++;
        this.questionStats.questionsAnswered.push({
            questionNumber: this.questionStats.currentQuestion,
            problem: { ...this.currentProblem },
            userAnswer: userAnswer,
            correctAnswer: this.currentProblem.answer,
            isCorrect: false,
            timestamp: new Date()
        });
    }

    /**
     * Advance to the next question or complete the session
     */
    advanceToNextQuestion() {
        if (this.questionStats.currentQuestion >= this.questionStats.totalQuestions) {
            this.completeSession();
        } else {
            this.questionStats.currentQuestion++;
            this.updateCounterDisplay();
            this.generateNewProblem();
        }
    }

    /**
     * Complete the question session and show statistics
     */
    completeSession() {
        this.questionStats.sessionEndTime = new Date();
        this.pauseTimer();
        this.showSessionStatistics();
    }

    /**
     * Show session statistics
     */
    showSessionStatistics() {
        const stats = this.questionStats;
        const totalQuestions = stats.totalQuestions;
        const correctAnswers = stats.correctAnswers;
        const incorrectAnswers = stats.incorrectAnswers;
        const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
        
        const sessionTime = stats.sessionEndTime - stats.sessionStartTime;
        const minutes = Math.floor(sessionTime / 60000);
        const seconds = Math.floor((sessionTime % 60000) / 1000);
        
        // Clear the problem display and show statistics
        this.displayStatistics(totalQuestions, correctAnswers, incorrectAnswers, accuracy, minutes, seconds);
    }

    /**
     * Display statistics in the main content area
     */
    displayStatistics(totalQuestions, correctAnswers, incorrectAnswers, accuracy, minutes, seconds) {
        const arithmeticContainer = document.querySelector('.arithmetic-container');
        if (!arithmeticContainer) return;

        // Generate mistakes card - only show if there are mistakes
        const mistakesCard = this.mistakes.length > 0 ? `
            <div class="mistakes-card">
                <div class="mistakes-content">${this.mistakes.map(mistake => 
                    `${mistake.problem} = <span style="color: #ff6b6b">${mistake.userAnswer}</span> → <span style="color: #51cf66">${mistake.correctAnswer}</span>`
                ).join('<br>')}</div>
            </div>
        ` : '';

        arithmeticContainer.innerHTML = `
            <div class="statistics-display">
                <button class="new-session-btn" onclick="window.mathGame.startNewSession()">Start New Session</button>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${totalQuestions}</div>
                        <div class="stat-label">Total Questions</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${correctAnswers}</div>
                        <div class="stat-label">Correct</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${incorrectAnswers}</div>
                        <div class="stat-label">Incorrect</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${minutes}:${seconds.toString().padStart(2, '0')}</div>
                        <div class="stat-label">Time</div>
                    </div>
                </div>
                <div class="mistakes-section">
                    ${mistakesCard}
                </div>
            </div>
        `;
    }

    /**
     * Start a new session
     */
    startNewSession() {
        // Restore the arithmetic container with new structure, preserving timer controls
        const arithmeticContainer = document.querySelector('.arithmetic-container');
        if (arithmeticContainer) {
            arithmeticContainer.innerHTML = `
                <!-- Timer Controls - Top Right -->
                <div class="timer-controls">
                    <div class="timer-display" id="timer-display">00:00</div>
                    <div class="timer-buttons">
                        <button class="timer-btn play-pause-btn" id="play-pause-btn" title="Pause" aria-label="Pause timer">
                            <span class="material-icons" id="play-pause-icon">pause</span>
                        </button>
                        <button class="timer-btn stop-btn" id="stop-btn" title="Stop" aria-label="Stop session">
                            <span class="material-icons">stop</span>
                        </button>
                        <button class="timer-btn restart-btn" id="restart-btn" title="Restart" aria-label="Restart session">
                            <span class="material-icons">replay</span>
                        </button>
                    </div>
                </div>
                
                <!-- Math Expression Grid -->
                <div class="math-expression" id="math-expression">
                    <div class="expression-row">
                        <span class="operand" id="operand1">5</span>
                        <span class="operation" id="operation">+</span>
                        <span class="operand" id="operand2">3</span>
                    </div>
                    <div class="equals-row">
                        <span class="equals">=</span>
                    </div>
                    <div class="answer-row">
                        <input 
                            type="number" 
                            id="answer-input" 
                            class="answer-input" 
                            min="0"
                            max="9999"
                            step="1"
                            autofocus
                            autocomplete="off"
                            placeholder="?"
                            aria-label="Enter your answer"
                        >
                    </div>
                </div>
                
                <!-- Progress Indicator -->
                <div class="progress-section">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill" style="width: 10%"></div>
                    </div>
                    <div class="progress-text" id="progress-text">Question 1 of 10</div>
                </div>
            `;
        }

        // Re-initialize elements
        this.initializeElements();
        this.bindAnswerInputEvents();
        
        // Reset and start new session
        this.resetQuestionStats();
        this.resetTimer();
        this.clearAllMistakes();
        this.generateNewProblem();
        this.startTimer();
    }

    /**
     * Bind events for answer input (used when recreating the input)
     */
    bindAnswerInputEvents() {
        this.elements.answerInput?.addEventListener('input', this.handleAnswerInput.bind(this));
        this.elements.answerInput?.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    /**
     * Check if config panel is visible
     */
    isConfigVisible() {
        return this.elements.configPanel && 
               this.elements.configPanel.style.display === 'block';
    }

    /**
     * Load current configuration into form
     */
    loadCurrentConfigToForm() {
        // Load operations
        const operations = ['addition', 'subtraction', 'multiplication', 'division'];
        operations.forEach(op => {
            const btn = document.querySelector(`[data-operation="${op}"]`);
            if (btn) {
                if (this.config.operations.includes(op)) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        });

        // Load operand ranges
        const minOperand1Input = document.getElementById('min-operand1');
        const maxOperand1Input = document.getElementById('max-operand1');
        const minOperand2Input = document.getElementById('min-operand2');
        const maxOperand2Input = document.getElementById('max-operand2');
        
        if (minOperand1Input) minOperand1Input.value = this.config.minOperand1;
        if (maxOperand1Input) maxOperand1Input.value = this.config.maxOperand1;
        if (minOperand2Input) minOperand2Input.value = this.config.minOperand2;
        if (maxOperand2Input) maxOperand2Input.value = this.config.maxOperand2;
        
        // Load total questions
        const totalQuestionsInput = document.getElementById('total-questions');
        if (totalQuestionsInput) totalQuestionsInput.value = this.config.totalQuestions || 10;
    }

    /**
     * Apply settings from configuration form
     */
    applySettings() {
        try {
            // Get selected operations
            const operations = [];
            const activeButtons = document.querySelectorAll('.op-btn.active');
            
            activeButtons.forEach(btn => {
                const operation = btn.getAttribute('data-operation');
                if (operation) {
                    operations.push(operation);
                }
            });

            // Validate operations
            if (operations.length === 0) {
                this.showAlert('Please select at least one operation!');
                return;
            }

            // Get operand ranges
            const minOperand1 = parseInt(document.getElementById('min-operand1')?.value) || 1;
            const maxOperand1 = parseInt(document.getElementById('max-operand1')?.value) || 10;
            const minOperand2 = parseInt(document.getElementById('min-operand2')?.value) || 1;
            const maxOperand2 = parseInt(document.getElementById('max-operand2')?.value) || 10;

            // Validate operand ranges
            if (minOperand1 >= maxOperand1) {
                this.showAlert('First operand: Maximum number must be greater than minimum number!');
                return;
            }
            
            if (minOperand2 >= maxOperand2) {
                this.showAlert('Second operand: Maximum number must be greater than minimum number!');
                return;
            }

            if (minOperand1 < 0 || maxOperand1 > 100 || minOperand2 < 0 || maxOperand2 > 100) {
                this.showAlert('Numbers must be between 0 and 100!');
                return;
            }

            // Get total questions
            const totalQuestionsInput = document.getElementById('total-questions');
            const totalQuestions = parseInt(totalQuestionsInput?.value) || 10;

            // Update configuration
            this.config.operations = operations;
            this.config.minOperand1 = minOperand1;
            this.config.maxOperand1 = maxOperand1;
            this.config.minOperand2 = minOperand2;
            this.config.maxOperand2 = maxOperand2;
            this.config.totalQuestions = totalQuestions;
            
            // Update question stats if totalQuestions changed
            if (this.questionStats.totalQuestions !== totalQuestions) {
                this.resetQuestionStats();
                this.questionStats.totalQuestions = totalQuestions;
                this.updateCounterDisplay();
            }

            // Save and apply changes
            this.saveSettings();
            this.hideConfig();
            this.generateNewProblem();
            
            console.log('Settings applied:', this.config);
            
        } catch (error) {
            console.error('Failed to apply settings:', error);
            this.showAlert('Failed to save settings. Please try again.');
        }
    }

    /**
     * Apply settings automatically without validation alerts
     */
    applySettingsAutomatic() {
        try {
            // Get selected operations
            const operations = [];
            const activeButtons = document.querySelectorAll('.op-btn.active');
            
            activeButtons.forEach(btn => {
                const operation = btn.getAttribute('data-operation');
                if (operation) {
                    operations.push(operation);
                }
            });

            // Ensure at least one operation is selected
            if (operations.length === 0) {
                const additionBtn = document.querySelector('[data-operation="addition"]');
                if (additionBtn) {
                    additionBtn.classList.add('active');
                    operations.push('addition');
                }
            }

            // Get operand ranges with automatic correction
            let minOperand1 = parseInt(document.getElementById('min-operand1')?.value) || 1;
            let maxOperand1 = parseInt(document.getElementById('max-operand1')?.value) || 10;
            let minOperand2 = parseInt(document.getElementById('min-operand2')?.value) || 1;
            let maxOperand2 = parseInt(document.getElementById('max-operand2')?.value) || 10;

            // Auto-correct invalid ranges for first operand
            if (minOperand1 >= maxOperand1) {
                maxOperand1 = minOperand1 + 1;
                document.getElementById('max-operand1').value = maxOperand1;
            }

            if (minOperand1 < 0) {
                minOperand1 = 0;
                document.getElementById('min-operand1').value = minOperand1;
            }

            if (maxOperand1 > 100) {
                maxOperand1 = 100;
                document.getElementById('max-operand1').value = maxOperand1;
            }

            // Auto-correct invalid ranges for second operand
            if (minOperand2 >= maxOperand2) {
                maxOperand2 = minOperand2 + 1;
                document.getElementById('max-operand2').value = maxOperand2;
            }

            if (minOperand2 < 0) {
                minOperand2 = 0;
                document.getElementById('min-operand2').value = minOperand2;
            }

            if (maxOperand2 > 100) {
                maxOperand2 = 100;
                document.getElementById('max-operand2').value = maxOperand2;
            }

            // Update configuration
            this.config.operations = operations;
            this.config.minOperand1 = minOperand1;
            this.config.maxOperand1 = maxOperand1;
            this.config.minOperand2 = minOperand2;
            this.config.maxOperand2 = maxOperand2;

            // Save changes
            this.saveSettings();
            this.generateNewProblem();
            
            console.log('Settings auto-applied:', this.config);
            
        } catch (error) {
            console.error('Failed to auto-apply settings:', error);
        }
    }

    /**
     * Show alert message (can be enhanced with custom modal)
     */
    showAlert(message, title = 'Notice') {
        return window.ModalSystem?.showAlert(message, title) || alert(message);
    }

    showConfirm(message, title = 'Confirm') {
        return window.ModalSystem?.showConfirm(message, title) || confirm(message);
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('mathGameConfig', JSON.stringify(this.config));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    /**
     * Load settings from localStorage
     */
    async loadSettings() {
        try {
            const saved = localStorage.getItem('mathGameConfig');
            if (saved) {
                const parsedConfig = JSON.parse(saved);
                this.config = { ...this.config, ...parsedConfig };
            }
            
            // Ensure totalQuestions is set
            if (!this.config.totalQuestions) {
                this.config.totalQuestions = 10;
            }
            
            // Update question stats with loaded config
            this.questionStats.totalQuestions = this.config.totalQuestions;
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        this.setTheme(newTheme);
        this.saveTheme(newTheme);
    }

    /**
     * Set theme and update UI
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeToggle(theme);
    }

    /**
     * Update theme toggle button appearance
     */
    updateThemeToggle(theme) {
        if (!this.elements.themeIcon) return;

        if (theme === 'dark') {
            this.elements.themeIcon.textContent = 'light_mode'; // Light mode icon for switching to light
            this.elements.themeIcon.title = 'Switch to Light Mode';
        } else {
            this.elements.themeIcon.textContent = 'dark_mode'; // Dark mode icon for switching to dark
            this.elements.themeIcon.title = 'Switch to Dark Mode';
        }
    }

    /**
     * Load theme from localStorage
     */
    async loadTheme() {
        try {
            const savedTheme = localStorage.getItem('mathGameTheme') || 'dark';
            
            // Set theme after DOM is ready
            setTimeout(() => {
                this.setTheme(savedTheme);
            }, 0);
            
        } catch (error) {
            console.error('Failed to load theme:', error);
        }
    }

    /**
     * Save theme to localStorage
     */
    saveTheme(theme) {
        try {
            localStorage.setItem('mathGameTheme', theme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    }

    /**
     * Load mistake patterns from localStorage
     */
    async loadMistakePatterns() {
        try {
            const saved = localStorage.getItem('mathGameMistakePatterns');
            if (saved) {
                const patterns = JSON.parse(saved);
                this.mistakePatterns = new Map(patterns);
            }
        } catch (error) {
            console.error('Failed to load mistake patterns:', error);
        }
    }

    /**
     * Save mistake patterns to localStorage
     */
    saveMistakePatterns() {
        try {
            const patterns = Array.from(this.mistakePatterns.entries());
            localStorage.setItem('mathGameMistakePatterns', JSON.stringify(patterns));
        } catch (error) {
            console.error('Failed to save mistake patterns:', error);
        }
    }

    /**
     * Record a mistake pattern for prioritization
     */
    recordMistakePattern(operand1, operand2, operation) {
        const key = `${operand1}-${operation}-${operand2}`;
        const current = this.mistakePatterns.get(key) || { 
            operand1, 
            operand2, 
            operation, 
            count: 0, 
            lastMistake: null 
        };
        
        current.count++;
        current.lastMistake = Date.now();
        
        this.mistakePatterns.set(key, current);
        this.saveMistakePatterns();
        
        console.log(`Recorded mistake: ${key}, count: ${current.count}`);
    }

    /**
     * Get prioritized problem based on mistake patterns
     */
    getPrioritizedProblem() {
        // 30% chance to show a mistake-prone problem
        if (Math.random() < 0.3 && this.mistakePatterns.size > 0) {
            return this.generateMistakeBasedProblem();
        }
        
        // 70% chance for regular random problem
        return this.generateRandomProblem();
    }

    /**
     * Generate problem based on mistake patterns
     */
    generateMistakeBasedProblem() {
        const patterns = Array.from(this.mistakePatterns.values())
            .filter(p => this.config.operations.includes(p.operation))
            .filter(p => p.operand1 >= this.config.minOperand1 && p.operand1 <= this.config.maxOperand1)
            .filter(p => p.operand2 >= this.config.minOperand2 && p.operand2 <= this.config.maxOperand2);
        
        if (patterns.length === 0) {
            return this.generateRandomProblem();
        }
        
        // Weight by mistake count and recency
        const weights = patterns.map(p => {
            const recencyWeight = Math.max(0.1, 1 - (Date.now() - p.lastMistake) / (7 * 24 * 60 * 60 * 1000)); // 7 days
            return p.count * recencyWeight;
        });
        
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < patterns.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                const pattern = patterns[i];
                return this.createProblemFromPattern(pattern);
            }
        }
        
        return this.generateRandomProblem();
    }

    /**
     * Create problem object from mistake pattern
     */
    createProblemFromPattern(pattern) {
        const { operand1, operand2, operation } = pattern;
        let answer, symbol;

        switch (operation) {
            case 'addition':
                answer = operand1 + operand2;
                symbol = '+';
                break;
            case 'subtraction':
                answer = operand1 - operand2;
                symbol = '−';
                break;
            case 'multiplication':
                answer = operand1 * operand2;
                symbol = '×';
                break;
            case 'division':
                answer = operand2;
                symbol = '÷';
                break;
            default:
                return this.generateRandomProblem();
        }

        return { operand1, operand2, operation, answer, symbol };
    }

    /**
     * Show arithmetic page (can be extended for multiple pages)
     */
    showArithmeticPage() {
        // Update navigation state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const arithmeticPage = document.getElementById('arithmetic-page');
        if (arithmeticPage) {
            arithmeticPage.classList.add('active');
        }
        
        // Update page title
        if (this.elements.pageTitle) {
            this.elements.pageTitle.textContent = 'Arithmetic';
        }
        
        // Reset and start timer
        this.resetTimer();
        
        // Generate new problem
        this.generateNewProblem();
    }

    /**
     * Add a mistake to the mistakes list
     */
    addMistake(userAnswer) {
        if (!this.currentProblem) return;
        
        // Record mistake pattern for prioritization
        this.recordMistakePattern(
            this.currentProblem.operand1,
            this.currentProblem.operand2,
            this.currentProblem.operation
        );
        
        const mistake = {
            problem: `${this.currentProblem.operand1} ${this.currentProblem.symbol} ${this.currentProblem.operand2}`,
            userAnswer: userAnswer,
            correctAnswer: this.currentProblem.answer,
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.mistakes.push(mistake);
        this.updateMistakesDisplay();
    }

    /**
     * Update the mistakes display - now simplified since we show mistakes only at the end
     */
    updateMistakesDisplay() {
        // Mistakes are now displayed only in the final statistics
        // No real-time display needed
    }

    /**
     * Clear all mistakes
     */
    clearAllMistakes() {
        this.mistakes = [];
        this.updateMistakesDisplay();
    }

    /**
     * Toggle left sidebar collapse state
     */
    /**
     * Toggle menu dropdown
     */
    toggleMenu(e) {
        e.stopPropagation();
        const dropdown = document.getElementById('menu-dropdown');
        if (dropdown) {
            const isVisible = dropdown.style.display === 'block';
            dropdown.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                // Close dropdown when clicking outside
                setTimeout(() => {
                    const clickHandler = () => {
                        dropdown.style.display = 'none';
                        document.removeEventListener('click', clickHandler);
                    };
                    document.addEventListener('click', clickHandler);
                }, 0);
            }
        }
    }

    /**
     * Get current application state for debugging
     */
    getState() {
        return {
            config: { ...this.config },
            currentProblem: { ...this.currentProblem },
            theme: document.documentElement.getAttribute('data-theme'),
            configVisible: this.isConfigVisible(),
            mistakePatterns: Array.from(this.mistakePatterns.entries())
        };
    }

    /**
     * Show mistake statistics (for debugging)
     */
    showMistakeStats() {
        console.log('=== Mistake Statistics ===');
        console.log(`Total patterns tracked: ${this.mistakePatterns.size}`);
        
        const sortedPatterns = Array.from(this.mistakePatterns.values())
            .sort((a, b) => b.count - a.count);
        
        sortedPatterns.slice(0, 10).forEach((pattern, index) => {
            console.log(`${index + 1}. ${pattern.operand1} ${this.getSymbolForOperation(pattern.operation)} ${pattern.operand2} - ${pattern.count} mistakes`);
        });
    }

    /**
     * Get symbol for operation
     */
    getSymbolForOperation(operation) {
        const symbols = {
            'addition': '+',
            'subtraction': '−',
            'multiplication': '×',
            'division': '÷'
        };
        return symbols[operation] || '?';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Create global instance for debugging
        window.mathGame = new MathGame();
    } catch (error) {
        console.error('Failed to start Math Game:', error);
    }
});