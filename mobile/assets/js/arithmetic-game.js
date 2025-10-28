/**
 * Mobile Arithmetic Game
 * Touch-optimized math practice for kindergarten students
 */

class MobileArithmeticGame {
    constructor() {
        // Game state
        this.currentQuestion = 0;
        this.totalQuestions = 10;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.problems = [];
        this.gameData = [];
        this.startTime = null;
        
        // Settings
        this.settings = {
            difficulty: 'medium',
            operations: ['addition'],
            showVisualAids: true,
            inputMethod: 'keyboard'
        };
        
        // Audio system
        this.audioContext = null;
        this.sounds = {};
        
        // Touch feedback
        this.hapticEnabled = 'vibrate' in navigator;
        
        this.init();
    }
    
    async init() {
        console.log('🎮 Initializing Mobile Arithmetic Game');
        
        // Load settings
        this.loadSettings();
        
        // Initialize audio
        await this.initAudio();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Generate problems and start game
        this.generateProblems();
        this.startGame();
        
        // Update settings UI
        this.updateSettingsUI();
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('arithmetic-settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('arithmetic-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }
    
    async initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Preload sound effects
            await this.createSounds();
            
            // Resume audio context on first user interaction
            document.addEventListener('touchstart', () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }, { once: true });
            
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }
    
    async createSounds() {
        // Success sound (cheerful ding)
        this.sounds.correct = this.createTone(800, 0.2, 'sine');
        
        // Error sound (gentle buzz)
        this.sounds.incorrect = this.createTone(200, 0.3, 'sawtooth');
        
        // Completion sound (victory fanfare)
        this.sounds.complete = this.createTone(600, 0.5, 'sine');
    }
    
    createTone(frequency, duration, waveType = 'sine') {
        if (!this.audioContext) return null;
        
        return () => {
            try {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = waveType;
                
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            } catch (error) {
                console.warn('Sound playback failed:', error);
            }
        };
    }
    
    setupEventListeners() {
        // Answer input
        const answerInput = document.getElementById('answer-input');
        if (answerInput) {
            answerInput.addEventListener('input', this.handleInputChange.bind(this));
            answerInput.addEventListener('keypress', this.handleKeyPress.bind(this));
        }
        
        // Settings modal
        const settingsInputs = document.querySelectorAll('#settings-modal input');
        settingsInputs.forEach(input => {
            input.addEventListener('change', this.handleSettingsChange.bind(this));
        });
        
        // Mobile-specific events
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
    
    handleTouchStart(event) {
        // Provide haptic feedback for button taps
        if (event.target.tagName === 'BUTTON' && this.hapticEnabled) {
            navigator.vibrate(10);
        }
    }
    
    handleVisibilityChange() {
        // Pause audio when app goes to background
        if (document.hidden && this.audioContext) {
            this.audioContext.suspend();
        } else if (!document.hidden && this.audioContext) {
            this.audioContext.resume();
        }
    }
    
    handleInputChange(event) {
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.disabled = !event.target.value.trim();
        }
    }
    
    handleKeyPress(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.submitAnswer();
        }
    }
    
    handleSettingsChange(event) {
        const { name, type, value, checked } = event.target;
        
        if (name === 'difficulty') {
            this.settings.difficulty = value;
        } else if (name === 'input-method') {
            this.settings.inputMethod = value;
        } else if (type === 'checkbox') {
            if (event.target.id === 'addition-toggle') {
                if (checked) {
                    if (!this.settings.operations.includes('addition')) {
                        this.settings.operations.push('addition');
                    }
                } else {
                    this.settings.operations = this.settings.operations.filter(op => op !== 'addition');
                }
            } else if (event.target.id === 'subtraction-toggle') {
                if (checked) {
                    if (!this.settings.operations.includes('subtraction')) {
                        this.settings.operations.push('subtraction');
                    }
                } else {
                    this.settings.operations = this.settings.operations.filter(op => op !== 'subtraction');
                }
            } else if (event.target.id === 'visual-aids-toggle') {
                this.settings.showVisualAids = checked;
            }
        }
        
        // Ensure at least one operation is selected
        if (this.settings.operations.length === 0) {
            this.settings.operations = ['addition'];
            document.getElementById('addition-toggle').checked = true;
        }
    }
    
    generateProblems() {
        this.problems = [];
        
        for (let i = 0; i < this.totalQuestions; i++) {
            const operation = this.settings.operations[Math.floor(Math.random() * this.settings.operations.length)];
            const problem = this.generateProblem(operation);
            this.problems.push(problem);
        }
    }
    
    generateProblem(operation) {
        const ranges = {
            easy: { min: 1, max: 10 },
            medium: { min: 1, max: 20 },
            hard: { min: 1, max: 50 }
        };
        
        const range = ranges[this.settings.difficulty];
        let num1, num2, answer, display;
        
        if (operation === 'addition') {
            num1 = Math.floor(Math.random() * range.max) + range.min;
            num2 = Math.floor(Math.random() * range.max) + range.min;
            answer = num1 + num2;
            display = `${num1} + ${num2} = ?`;
        } else if (operation === 'subtraction') {
            // Ensure positive results
            const sum = Math.floor(Math.random() * range.max) + range.min;
            num2 = Math.floor(Math.random() * sum) + 1;
            num1 = sum;
            answer = num1 - num2;
            display = `${num1} − ${num2} = ?`;
        }
        
        return {
            num1,
            num2,
            operation,
            answer,
            display,
            startTime: null,
            endTime: null,
            userAnswer: null,
            attempts: 0
        };
    }
    
    startGame() {
        this.startTime = Date.now();
        this.currentQuestion = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.gameData = [];
        
        this.showQuestion();
    }
    
    showQuestion() {
        if (this.currentQuestion >= this.totalQuestions) {
            this.endGame();
            return;
        }
        
        const problem = this.problems[this.currentQuestion];
        problem.startTime = Date.now();
        
        // Update UI
        this.updateProgress();
        this.displayProblem(problem);
        this.setupInputMethod();
        
        // Focus input for keyboard method
        if (this.settings.inputMethod === 'keyboard') {
            setTimeout(() => {
                const input = document.getElementById('answer-input');
                if (input) {
                    input.focus();
                }
            }, 300);
        }
    }
    
    updateProgress() {
        const progressBar = document.getElementById('progress-bar');
        const questionCounter = document.getElementById('question-counter');
        const correctCounts = document.querySelectorAll('#correct-count, #mobile-correct-count');
        const incorrectCounts = document.querySelectorAll('#incorrect-count, #mobile-incorrect-count');
        
        if (progressBar) {
            const percentage = ((this.currentQuestion + 1) / this.totalQuestions) * 100;
            progressBar.style.width = `${percentage}%`;
        }
        
        if (questionCounter) {
            questionCounter.textContent = `Question ${this.currentQuestion + 1} of ${this.totalQuestions}`;
        }
        
        correctCounts.forEach(el => el.textContent = this.correctAnswers);
        incorrectCounts.forEach(el => el.textContent = this.incorrectAnswers);
    }
    
    displayProblem(problem) {
        const problemDisplay = document.getElementById('problem-display');
        const visualAids = document.getElementById('visual-aids');
        
        if (problemDisplay) {
            problemDisplay.textContent = problem.display;
            problemDisplay.className = 'text-4xl sm:text-6xl font-bold text-gray-900 animate-slide-down';
        }
        
        // Show visual aids if enabled
        if (visualAids && this.settings.showVisualAids && this.settings.difficulty === 'easy') {
            this.createVisualAids(problem, visualAids);
        } else if (visualAids) {
            visualAids.innerHTML = '';
        }
    }
    
    createVisualAids(problem, container) {
        container.innerHTML = '';
        
        // Only show visual aids for small numbers
        if (problem.num1 > 10 || problem.num2 > 10) return;
        
        const createDots = (count, color) => {
            const group = document.createElement('div');
            group.className = 'flex flex-wrap gap-1 justify-center max-w-32';
            
            for (let i = 0; i < count; i++) {
                const dot = document.createElement('div');
                dot.className = `w-4 h-4 ${color} rounded-full animate-scale-up`;
                dot.style.animationDelay = `${i * 0.1}s`;
                group.appendChild(dot);
            }
            return group;
        };
        
        const group1 = createDots(problem.num1, 'bg-blue-400');
        container.appendChild(group1);
        
        if (problem.operation === 'addition') {
            const plus = document.createElement('span');
            plus.className = 'text-2xl font-bold text-gray-600';
            plus.textContent = '+';
            container.appendChild(plus);
            
            const group2 = createDots(problem.num2, 'bg-green-400');
            container.appendChild(group2);
        } else if (problem.operation === 'subtraction') {
            const minus = document.createElement('span');
            minus.className = 'text-2xl font-bold text-gray-600';
            minus.textContent = '−';
            container.appendChild(minus);
            
            const group2 = createDots(problem.num2, 'bg-red-400');
            container.appendChild(group2);
        }
    }
    
    setupInputMethod() {
        const inputSection = document.getElementById('input-section');
        const choiceSection = document.getElementById('choice-section');
        
        if (this.settings.inputMethod === 'keyboard') {
            inputSection.classList.remove('hidden');
            choiceSection.classList.add('hidden');
            
            // Clear input
            const answerInput = document.getElementById('answer-input');
            if (answerInput) {
                answerInput.value = '';
                answerInput.disabled = false;
            }
            
            const submitBtn = document.getElementById('submit-btn');
            if (submitBtn) {
                submitBtn.disabled = true;
            }
        } else {
            inputSection.classList.add('hidden');
            choiceSection.classList.remove('hidden');
            
            this.createMultipleChoice();
        }
    }
    
    createMultipleChoice() {
        const choiceSection = document.getElementById('choice-section');
        const problem = this.problems[this.currentQuestion];
        const correctAnswer = problem.answer;
        
        // Generate options
        const options = new Set([correctAnswer]);
        
        while (options.size < 4) {
            let wrong;
            if (correctAnswer <= 5) {
                wrong = Math.max(0, correctAnswer + Math.floor(Math.random() * 6) - 3);
            } else {
                wrong = Math.max(0, correctAnswer + Math.floor(Math.random() * 10) - 5);
            }
            options.add(wrong);
        }
        
        const shuffled = Array.from(options).sort(() => Math.random() - 0.5);
        
        choiceSection.innerHTML = '';
        shuffled.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn bg-white border-2 border-gray-200 hover:border-primary-300 text-2xl font-bold py-6 rounded-2xl shadow-md hover:shadow-lg transition-all';
            button.textContent = option;
            button.onclick = () => this.selectMultipleChoice(option);
            
            choiceSection.appendChild(button);
        });
    }
    
    selectMultipleChoice(answer) {
        const buttons = document.querySelectorAll('.answer-btn');
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.classList.remove('hover:border-primary-300', 'hover:shadow-lg');
        });
        
        this.submitAnswer(answer);
    }
    
    submitAnswer(providedAnswer = null) {
        let userAnswer;
        
        if (providedAnswer !== null) {
            userAnswer = providedAnswer;
        } else {
            const answerInput = document.getElementById('answer-input');
            if (!answerInput || !answerInput.value.trim()) return;
            
            userAnswer = parseInt(answerInput.value);
            answerInput.disabled = true;
        }
        
        const problem = this.problems[this.currentQuestion];
        problem.endTime = Date.now();
        problem.userAnswer = userAnswer;
        problem.attempts++;
        
        const isCorrect = userAnswer === problem.answer;
        
        if (isCorrect) {
            this.handleCorrectAnswer(problem);
        } else {
            this.handleIncorrectAnswer(problem);
        }
        
        // Record attempt
        this.gameData.push({
            questionNumber: this.currentQuestion + 1,
            problem: problem.display,
            correctAnswer: problem.answer,
            userAnswer: userAnswer,
            isCorrect: isCorrect,
            timeSpent: problem.endTime - problem.startTime,
            attempts: problem.attempts
        });
    }
    
    handleCorrectAnswer(problem) {
        this.correctAnswers++;
        this.playSound('correct');
        this.hapticFeedback(50);
        
        this.showFeedback(true, problem);
        this.createCelebration();
        
        setTimeout(() => {
            this.nextQuestion();
        }, 1500);
    }
    
    handleIncorrectAnswer(problem) {
        this.incorrectAnswers++;
        this.playSound('incorrect');
        this.hapticFeedback(100);
        
        this.showFeedback(false, problem);
        
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }
    
    showFeedback(isCorrect, problem) {
        const feedbackSection = document.getElementById('feedback-section');
        const feedbackContent = document.getElementById('feedback-content');
        
        if (!feedbackSection || !feedbackContent) return;
        
        let content;
        if (isCorrect) {
            const messages = [
                '🎉 Excellent!', '⭐ Great job!', '🌟 Perfect!', 
                '👏 Well done!', '🎊 Amazing!', '💫 Fantastic!'
            ];
            content = `
                <div class="text-success-600">
                    <div class="text-4xl mb-2">${messages[Math.floor(Math.random() * messages.length)]}</div>
                    <p class="text-lg font-semibold">Correct answer!</p>
                </div>
            `;
        } else {
            content = `
                <div class="text-error-500">
                    <div class="text-3xl mb-2">😊 Keep trying!</div>
                    <p class="text-lg">The answer was <span class="font-bold text-2xl">${problem.answer}</span></p>
                    <p class="text-sm text-gray-600 mt-1">${problem.display.replace('?', problem.answer)}</p>
                </div>
            `;
        }
        
        feedbackContent.innerHTML = content;
        feedbackSection.classList.remove('hidden');
        
        // Hide input sections
        document.getElementById('input-section').classList.add('hidden');
        document.getElementById('choice-section').classList.add('hidden');
    }
    
    nextQuestion() {
        // Hide feedback
        document.getElementById('feedback-section').classList.add('hidden');
        
        this.currentQuestion++;
        this.showQuestion();
    }
    
    createCelebration() {
        const container = document.getElementById('celebration-container');
        if (!container) return;
        
        // Create confetti burst
        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            
            container.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }
    }
    
    playSound(soundName) {
        if (this.sounds[soundName] && typeof this.sounds[soundName] === 'function') {
            try {
                this.sounds[soundName]();
            } catch (error) {
                console.warn('Sound playback failed:', error);
            }
        }
    }
    
    hapticFeedback(duration = 50) {
        if (this.hapticEnabled) {
            try {
                navigator.vibrate(duration);
            } catch (error) {
                console.warn('Haptic feedback failed:', error);
            }
        }
    }
    
    endGame() {
        const endTime = Date.now();
        const totalTime = endTime - this.startTime;
        
        this.playSound('complete');
        this.hapticFeedback([100, 50, 100]);
        
        // Save game results
        const gameResults = {
            game: 'arithmetic',
            date: new Date().toISOString(),
            totalQuestions: this.totalQuestions,
            correctAnswers: this.correctAnswers,
            incorrectAnswers: this.incorrectAnswers,
            totalTime: totalTime,
            averageTime: totalTime / this.totalQuestions,
            problems: this.gameData,
            settings: { ...this.settings }
        };
        
        try {
            const allResults = JSON.parse(localStorage.getItem('game-results') || '[]');
            allResults.push(gameResults);
            localStorage.setItem('game-results', JSON.stringify(allResults));
        } catch (error) {
            console.warn('Failed to save game results:', error);
        }
        
        // Navigate to statistics page
        setTimeout(() => {
            window.location.href = 'statistics.html';
        }, 1000);
    }
    
    updateSettingsUI() {
        // Update difficulty radio buttons
        document.querySelector(`input[name="difficulty"][value="${this.settings.difficulty}"]`).checked = true;
        
        // Update operation checkboxes
        document.getElementById('addition-toggle').checked = this.settings.operations.includes('addition');
        document.getElementById('subtraction-toggle').checked = this.settings.operations.includes('subtraction');
        
        // Update other settings
        document.getElementById('visual-aids-toggle').checked = this.settings.showVisualAids;
        document.querySelector(`input[name="input-method"][value="${this.settings.inputMethod}"]`).checked = true;
    }
}

// Global functions for HTML event handlers
function submitAnswer() {
    if (window.arithmeticGame) {
        window.arithmeticGame.submitAnswer();
    }
}

function showSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('opacity-0', 'invisible');
        document.body.style.overflow = 'hidden';
    }
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.add('opacity-0', 'invisible');
        document.body.style.overflow = '';
    }
}

function saveSettings() {
    if (window.arithmeticGame) {
        window.arithmeticGame.saveSettings();
        closeSettings();
        
        // Show save confirmation
        const modal = document.getElementById('settings-modal');
        if (modal) {
            const content = modal.querySelector('.bg-white');
            content.classList.add('animate-pulse');
            setTimeout(() => content.classList.remove('animate-pulse'), 300);
        }
    }
}

function goHome() {
    window.location.href = 'index.html';
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.arithmeticGame = new MobileArithmeticGame();
});

// Handle page visibility for mobile optimization
document.addEventListener('visibilitychange', () => {
    if (window.arithmeticGame) {
        window.arithmeticGame.handleVisibilityChange();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileArithmeticGame;
}