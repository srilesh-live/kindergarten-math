/**
 * Clean Arithmetic Practice Game - Pure Tailwind Version
 * No CSS dependencies - uses only Tailwind classes
 */

class ArithmeticGame {
    constructor() {
        this.config = {
            operations: ['addition'],
            minOperand1: 1,
            maxOperand1: 10,
            minOperand2: 1,
            maxOperand2: 10,
            totalQuestions: 10
        };
        
        this.currentProblem = null;
        this.questionStats = {
            currentQuestion: 1,
            totalQuestions: 10,
            correctAnswers: 0,
            incorrectAnswers: 0
        };
        
        this.timer = {
            startTime: null,
            elapsedTime: 0,
            isRunning: false,
            intervalId: null
        };
        
        this.elements = {};
        this.init();
    }

    init() {
        this.initializeElements();
        this.bindEvents();
        this.generateNewProblem();
        this.startTimer();
        this.updateDisplay();
    }

    initializeElements() {
        // Math elements
        this.elements.operand1 = document.getElementById('operand1');
        this.elements.operand2 = document.getElementById('operand2');
        this.elements.operator = document.getElementById('operator');
        this.elements.answerInput = document.getElementById('answer-input');
        
        // UI elements
        this.elements.timerDisplay = document.getElementById('timer-display');
        this.elements.playPauseBtn = document.getElementById('play-pause-btn');
        this.elements.playPauseIcon = document.getElementById('play-pause-icon');
        this.elements.progressBar = document.getElementById('progress-bar');
        this.elements.progressText = document.getElementById('progress-text');
        this.elements.correctCount = document.getElementById('correct-count');
        this.elements.incorrectCount = document.getElementById('incorrect-count');
        
        // Modal elements
        this.elements.settingsBtn = document.getElementById('settings-btn');
        this.elements.settingsModal = document.getElementById('settings-modal');
        this.elements.settingsCloseBtn = document.getElementById('settings-close-btn');
        this.elements.settingsCancelBtn = document.getElementById('settings-cancel-btn');
        this.elements.settingsSaveBtn = document.getElementById('settings-save-btn');
        
        this.elements.exitBtn = document.getElementById('exit-btn');
        this.elements.exitModal = document.getElementById('exit-modal');
        this.elements.exitCancelBtn = document.getElementById('exit-cancel-btn');
        this.elements.exitConfirmBtn = document.getElementById('exit-confirm-btn');
    }

    bindEvents() {
        // Answer input
        this.elements.answerInput.addEventListener('input', (e) => this.handleAnswerInput(e));
        this.elements.answerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });

        // Timer controls
        this.elements.playPauseBtn.addEventListener('click', () => this.toggleTimer());

        // Settings modal
        this.elements.settingsBtn.addEventListener('click', () => this.showSettings());
        this.elements.settingsCloseBtn.addEventListener('click', () => this.hideSettings());
        this.elements.settingsCancelBtn.addEventListener('click', () => this.hideSettings());
        this.elements.settingsSaveBtn.addEventListener('click', () => this.saveSettings());

        // Exit modal
        this.elements.exitBtn.addEventListener('click', () => this.showExitConfirmation());
        this.elements.exitCancelBtn.addEventListener('click', () => this.hideExitConfirmation());
        this.elements.exitConfirmBtn.addEventListener('click', () => this.exitPractice());

        // Settings navigation
        document.querySelectorAll('.settings-nav-item').forEach(item => {
            item.addEventListener('click', () => this.switchSettingsSection(item));
        });

        // Operation buttons
        document.querySelectorAll('.operation-btn').forEach(btn => {
            btn.addEventListener('click', () => this.toggleOperation(btn));
        });

        // Close modals on backdrop click
        this.elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.settingsModal) this.hideSettings();
        });
        this.elements.exitModal.addEventListener('click', (e) => {
            if (e.target === this.elements.exitModal) this.hideExitConfirmation();
        });
    }

    generateNewProblem() {
        const operation = this.config.operations[Math.floor(Math.random() * this.config.operations.length)];
        const operand1 = Math.floor(Math.random() * (this.config.maxOperand1 - this.config.minOperand1 + 1)) + this.config.minOperand1;
        const operand2 = Math.floor(Math.random() * (this.config.maxOperand2 - this.config.minOperand2 + 1)) + this.config.minOperand2;
        
        let answer;
        let operatorSymbol;
        
        switch (operation) {
            case 'addition':
                answer = operand1 + operand2;
                operatorSymbol = '+';
                break;
            case 'subtraction':
                answer = operand1 - operand2;
                operatorSymbol = '−';
                break;
            case 'multiplication':
                answer = operand1 * operand2;
                operatorSymbol = '×';
                break;
            case 'division':
                answer = operand1 / operand2;
                operatorSymbol = '÷';
                break;
            default:
                answer = operand1 + operand2;
                operatorSymbol = '+';
        }
        
        this.currentProblem = {
            operand1,
            operand2,
            operation,
            answer,
            operatorSymbol
        };
        
        // Update display
        this.elements.operand1.textContent = operand1;
        this.elements.operand2.textContent = operand2;
        this.elements.operator.textContent = operatorSymbol;
        this.elements.answerInput.value = '';
        
        // Reset input styling
        this.setInputState('neutral');
    }

    handleAnswerInput(e) {
        const value = e.target.value;
        if (value !== '' && !isNaN(value)) {
            const userAnswer = parseInt(value);
            if (userAnswer === this.currentProblem.answer) {
                this.checkAnswer();
            }
        }
    }

    checkAnswer() {
        const userAnswer = parseInt(this.elements.answerInput.value);
        
        if (userAnswer === this.currentProblem.answer) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer();
        }
    }

    handleCorrectAnswer() {
        this.setInputState('correct');
        this.questionStats.correctAnswers++;
        
        setTimeout(() => {
            this.nextQuestion();
        }, 1000);
    }

    handleIncorrectAnswer() {
        this.setInputState('incorrect');
        this.questionStats.incorrectAnswers++;
        
        // Shake animation using Tailwind
        this.elements.answerInput.classList.add('animate-pulse');
        setTimeout(() => {
            this.elements.answerInput.classList.remove('animate-pulse');
            this.setInputState('neutral');
            this.elements.answerInput.value = '';
            this.elements.answerInput.focus();
        }, 1000);
    }

    setInputState(state) {
        const input = this.elements.answerInput;
        
        // Remove all state classes
        input.classList.remove(
            'border-app-border', 'bg-app-bg/50',
            'border-green-500', 'bg-green-500/20',
            'border-red-500', 'bg-red-500/20'
        );
        
        switch (state) {
            case 'neutral':
                input.classList.add('border-app-border', 'bg-app-bg/50');
                break;
            case 'correct':
                input.classList.add('border-green-500', 'bg-green-500/20');
                break;
            case 'incorrect':
                input.classList.add('border-red-500', 'bg-red-500/20');
                break;
        }
    }

    nextQuestion() {
        if (this.questionStats.currentQuestion >= this.questionStats.totalQuestions) {
            this.endPractice();
            return;
        }
        
        this.questionStats.currentQuestion++;
        this.generateNewProblem();
        this.updateDisplay();
        this.elements.answerInput.focus();
    }

    endPractice() {
        this.pauseTimer();
        // Show completion message or redirect
        alert(`Practice completed! Score: ${this.questionStats.correctAnswers}/${this.questionStats.totalQuestions}`);
        window.location.href = 'home.html';
    }

    updateDisplay() {
        // Update progress
        const progress = (this.questionStats.currentQuestion - 1) / this.questionStats.totalQuestions * 100;
        this.elements.progressBar.style.width = `${progress}%`;
        this.elements.progressText.textContent = `${this.questionStats.currentQuestion} of ${this.questionStats.totalQuestions}`;
        
        // Update counters
        this.elements.correctCount.textContent = this.questionStats.correctAnswers;
        this.elements.incorrectCount.textContent = this.questionStats.incorrectAnswers;
    }

    // Timer methods
    startTimer() {
        if (!this.timer.isRunning) {
            this.timer.startTime = Date.now() - this.timer.elapsedTime;
            this.timer.isRunning = true;
            this.timer.intervalId = setInterval(() => {
                this.updateTimerDisplay();
            }, 1000);
            this.elements.playPauseIcon.textContent = 'pause';
            this.elements.answerInput.disabled = false;
        }
    }

    pauseTimer() {
        if (this.timer.isRunning) {
            this.timer.isRunning = false;
            clearInterval(this.timer.intervalId);
            this.timer.elapsedTime = Date.now() - this.timer.startTime;
            this.elements.playPauseIcon.textContent = 'play_arrow';
            this.elements.answerInput.disabled = true;
        }
    }

    toggleTimer() {
        if (this.timer.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    updateTimerDisplay() {
        const elapsed = Date.now() - this.timer.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        this.elements.timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Modal methods
    showSettings() {
        this.elements.settingsModal.classList.remove('opacity-0', 'invisible');
        this.elements.settingsModal.querySelector('div').classList.remove('scale-90');
        this.elements.settingsModal.querySelector('div').classList.add('scale-100');
    }

    hideSettings() {
        this.elements.settingsModal.querySelector('div').classList.remove('scale-100');
        this.elements.settingsModal.querySelector('div').classList.add('scale-90');
        this.elements.settingsModal.classList.add('opacity-0', 'invisible');
    }

    showExitConfirmation() {
        this.elements.exitModal.classList.remove('opacity-0', 'invisible');
        this.elements.exitModal.querySelector('div').classList.remove('scale-90');
        this.elements.exitModal.querySelector('div').classList.add('scale-100');
    }

    hideExitConfirmation() {
        this.elements.exitModal.querySelector('div').classList.remove('scale-100');
        this.elements.exitModal.querySelector('div').classList.add('scale-90');
        this.elements.exitModal.classList.add('opacity-0', 'invisible');
    }

    exitPractice() {
        window.location.href = 'home.html';
    }

    // Settings methods
    switchSettingsSection(clickedItem) {
        // Remove active from all nav items
        document.querySelectorAll('.settings-nav-item').forEach(item => {
            item.classList.remove('active', 'bg-blue-600', 'text-white');
            item.classList.add('text-app-text-muted', 'hover:bg-app-surface-light', 'hover:text-app-text');
        });
        
        // Add active to clicked item
        clickedItem.classList.add('active', 'bg-blue-600', 'text-white');
        clickedItem.classList.remove('text-app-text-muted', 'hover:bg-app-surface-light', 'hover:text-app-text');
        
        // Hide all sections
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show selected section
        const sectionId = clickedItem.dataset.section + '-section';
        document.getElementById(sectionId).classList.remove('hidden');
    }

    toggleOperation(button) {
        const operation = button.dataset.operation;
        
        if (button.classList.contains('active')) {
            // Don't allow deselecting if it's the only active operation
            const activeOperations = document.querySelectorAll('.operation-btn.active');
            if (activeOperations.length <= 1) return;
            
            button.classList.remove('active', 'border-blue-500', 'text-blue-400');
            button.classList.add('border-app-border', 'text-app-text-muted');
        } else {
            button.classList.add('active', 'border-blue-500', 'text-blue-400');
            button.classList.remove('border-app-border', 'text-app-text-muted');
        }
    }

    saveSettings() {
        // Get selected operations
        const selectedOperations = Array.from(document.querySelectorAll('.operation-btn.active'))
            .map(btn => btn.dataset.operation);
        
        if (selectedOperations.length === 0) {
            alert('Please select at least one operation.');
            return;
        }
        
        // Update config
        this.config.operations = selectedOperations;
        this.config.totalQuestions = parseInt(document.getElementById('total-questions').value);
        this.config.minOperand1 = parseInt(document.getElementById('min-operand1').value);
        this.config.maxOperand1 = parseInt(document.getElementById('max-operand1').value);
        this.config.minOperand2 = parseInt(document.getElementById('min-operand2').value);
        this.config.maxOperand2 = parseInt(document.getElementById('max-operand2').value);
        
        // Update question stats
        this.questionStats.totalQuestions = this.config.totalQuestions;
        
        // Generate new problem and update display
        this.generateNewProblem();
        this.updateDisplay();
        
        this.hideSettings();
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new ArithmeticGame();
});