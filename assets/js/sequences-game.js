/**
 * Mobile Number Sequences Game
 * Pattern recognition and number sequence completion optimized for touch devices
 */

class MobileSequencesGame {
    constructor() {
        // Game state
        this.currentQuestion = 0;
        this.totalQuestions = 10;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.problems = [];
        this.gameData = [];
        this.startTime = null;
        
        // Current problem
        this.currentProblem = null;
        this.currentMissingPositions = [];
        this.answeredPositions = new Set();
        
        // Settings
        this.settings = {
            difficulty: 'medium',
            patternTypes: ['addition', 'skip-counting'],
            showHints: true,
            numberRange: '1-20'
        };
        
        // Audio system
        this.audioContext = null;
        this.sounds = {};
        
        // Touch feedback
        this.hapticEnabled = 'vibrate' in navigator;
        
        this.init();
    }
    
    async init() {
        console.log('🔢 Initializing Mobile Sequences Game');
        
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
            const saved = localStorage.getItem('sequences-settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('sequences-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }
    
    async initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create sound effects
            await this.createSounds();
            
            // Resume audio context on first interaction
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
        // Success sound
        this.sounds.correct = this.createTone(600, 0.3, 'sine');
        
        // Error sound
        this.sounds.incorrect = this.createTone(300, 0.4, 'sawtooth');
        
        // Complete sound
        this.sounds.complete = this.createTone(800, 0.5, 'sine');
        
        // Hint sound
        this.sounds.hint = this.createTone(400, 0.2, 'square');
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
                
                gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            } catch (error) {
                console.warn('Sound playback failed:', error);
            }
        };
    }
    
    setupEventListeners() {
        // Settings modal listeners
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
        if (document.hidden && this.audioContext) {
            this.audioContext.suspend();
        } else if (!document.hidden && this.audioContext) {
            this.audioContext.resume();
        }
    }
    
    handleSettingsChange(event) {
        const { name, type, value, checked } = event.target;
        
        if (name === 'difficulty') {
            this.settings.difficulty = value;
        } else if (name === 'number-range') {
            this.settings.numberRange = value;
        } else if (type === 'checkbox') {
            if (event.target.id === 'addition-patterns') {
                if (checked) {
                    if (!this.settings.patternTypes.includes('addition')) {
                        this.settings.patternTypes.push('addition');
                    }
                } else {
                    this.settings.patternTypes = this.settings.patternTypes.filter(p => p !== 'addition');
                }
            } else if (event.target.id === 'subtraction-patterns') {
                if (checked) {
                    if (!this.settings.patternTypes.includes('subtraction')) {
                        this.settings.patternTypes.push('subtraction');
                    }
                } else {
                    this.settings.patternTypes = this.settings.patternTypes.filter(p => p !== 'subtraction');
                }
            } else if (event.target.id === 'skip-counting') {
                if (checked) {
                    if (!this.settings.patternTypes.includes('skip-counting')) {
                        this.settings.patternTypes.push('skip-counting');
                    }
                } else {
                    this.settings.patternTypes = this.settings.patternTypes.filter(p => p !== 'skip-counting');
                }
            } else if (event.target.id === 'show-hints') {
                this.settings.showHints = checked;
            }
        }
        
        // Ensure at least one pattern type is selected
        if (this.settings.patternTypes.length === 0) {
            this.settings.patternTypes = ['addition'];
            document.getElementById('addition-patterns').checked = true;
        }
    }
    
    generateProblems() {
        this.problems = [];
        
        for (let i = 0; i < this.totalQuestions; i++) {
            const patternType = this.settings.patternTypes[Math.floor(Math.random() * this.settings.patternTypes.length)];
            const problem = this.generateProblem(patternType);
            this.problems.push(problem);
        }
    }
    
    generateProblem(patternType) {
        const ranges = {
            '1-20': { min: 1, max: 20 },
            '1-50': { min: 1, max: 50 },
            '1-100': { min: 1, max: 100 }
        };
        
        const range = ranges[this.settings.numberRange];
        let sequence = [];
        let pattern = {};
        let missingPositions = [];
        
        if (patternType === 'addition') {
            const start = Math.floor(Math.random() * (range.max / 2)) + range.min;
            const step = Math.floor(Math.random() * 5) + 1;
            
            for (let i = 0; i < 6; i++) {
                sequence.push(start + (i * step));
            }
            
            pattern = {
                type: 'addition',
                step: step,
                description: `Add ${step} each time`
            };
        } else if (patternType === 'subtraction') {
            const start = Math.floor(Math.random() * (range.max - 10)) + 10;
            const step = Math.floor(Math.random() * 3) + 1;
            
            for (let i = 0; i < 6; i++) {
                const value = start - (i * step);
                if (value < 0) break;
                sequence.push(value);
            }
            
            if (sequence.length < 4) {
                // Regenerate with smaller step
                return this.generateProblem(patternType);
            }
            
            pattern = {
                type: 'subtraction',
                step: step,
                description: `Subtract ${step} each time`
            };
        } else if (patternType === 'skip-counting') {
            const multiplier = Math.floor(Math.random() * 5) + 2;
            const start = multiplier;
            
            for (let i = 0; i < 6; i++) {
                const value = start + (i * multiplier);
                if (value > range.max) break;
                sequence.push(value);
            }
            
            if (sequence.length < 4) {
                // Regenerate with smaller multiplier
                return this.generateProblem(patternType);
            }
            
            pattern = {
                type: 'skip-counting',
                step: multiplier,
                description: `Count by ${multiplier}s`
            };
        }
        
        // Choose missing positions based on difficulty
        const numMissing = this.settings.difficulty === 'easy' ? 1 : 
                           this.settings.difficulty === 'medium' ? 2 : 3;
        
        while (missingPositions.length < numMissing && missingPositions.length < sequence.length - 2) {
            const pos = Math.floor(Math.random() * sequence.length);
            if (!missingPositions.includes(pos) && pos > 0 && pos < sequence.length - 1) {
                missingPositions.push(pos);
            }
        }
        
        missingPositions.sort((a, b) => a - b);
        
        return {
            sequence,
            pattern,
            missingPositions,
            startTime: null,
            endTime: null,
            userAnswers: {},
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
        
        this.currentProblem = this.problems[this.currentQuestion];
        this.currentProblem.startTime = Date.now();
        this.currentMissingPositions = [...this.currentProblem.missingPositions];
        this.answeredPositions = new Set();
        
        // Update UI
        this.updateProgress();
        this.displaySequence();
        this.setupInputs();
        
        // Hide hint initially
        document.getElementById('pattern-hint').classList.add('hidden');
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
    
    displaySequence() {
        const container = document.getElementById('sequence-container');
        const { sequence, missingPositions } = this.currentProblem;
        
        container.innerHTML = '';
        
        sequence.forEach((number, index) => {
            const numberDiv = document.createElement('div');
            numberDiv.className = 'sequence-number w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-xl sm:text-2xl font-bold rounded-2xl border-2 transition-all animate-sequence-reveal';
            numberDiv.style.animationDelay = `${index * 0.1}s`;
            
            if (missingPositions.includes(index)) {
                numberDiv.className += ' missing text-gray-500';
                numberDiv.textContent = '?';
                numberDiv.dataset.position = index;
            } else {
                numberDiv.className += ' filled text-white';
                numberDiv.textContent = number;
            }
            
            container.appendChild(numberDiv);
        });
    }
    
    setupInputs() {
        const { missingPositions } = this.currentProblem;
        
        if (missingPositions.length === 1) {
            // Single input mode
            document.getElementById('number-input-section').classList.remove('hidden');
            document.getElementById('multiple-input-section').classList.add('hidden');
            
            const answerInput = document.getElementById('answer-input');
            answerInput.value = '';
            answerInput.addEventListener('input', this.handleSingleInputChange.bind(this));
            answerInput.addEventListener('keypress', this.handleKeyPress.bind(this));
            
            setTimeout(() => answerInput.focus(), 300);
        } else {
            // Multiple inputs mode
            document.getElementById('number-input-section').classList.add('hidden');
            document.getElementById('multiple-input-section').classList.remove('hidden');
            
            this.createMultipleInputs();
        }
    }
    
    createMultipleInputs() {
        const container = document.getElementById('multiple-inputs');
        const { missingPositions } = this.currentProblem;
        
        container.innerHTML = '';
        
        missingPositions.forEach((position, index) => {
            const inputDiv = document.createElement('div');
            inputDiv.className = 'flex items-center space-x-2';
            
            inputDiv.innerHTML = `
                <label class="text-sm text-gray-600">Position ${position + 1}:</label>
                <input 
                    type="number" 
                    class="number-input w-16 h-12 text-xl font-bold text-center border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                    data-position="${position}"
                    placeholder="?"
                >
            `;
            
            const input = inputDiv.querySelector('input');
            input.addEventListener('input', (e) => this.handleMultipleInputChange(e, position));
            input.addEventListener('keypress', this.handleKeyPress.bind(this));
            
            container.appendChild(inputDiv);
        });
        
        // Focus first input
        setTimeout(() => {
            const firstInput = container.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 300);
    }
    
    handleSingleInputChange(event) {
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.disabled = !event.target.value.trim();
        }
    }
    
    handleMultipleInputChange(event, position) {
        const value = event.target.value.trim();
        
        if (value) {
            this.currentProblem.userAnswers[position] = parseInt(value);
            this.answeredPositions.add(position);
        } else {
            delete this.currentProblem.userAnswers[position];
            this.answeredPositions.delete(position);
        }
        
        // Enable submit button if all positions are filled
        const submitBtn = document.getElementById('submit-multiple-btn');
        if (submitBtn) {
            const allFilled = this.currentMissingPositions.every(pos => 
                this.answeredPositions.has(pos)
            );
            submitBtn.disabled = !allFilled;
        }
        
        // Auto-check if all answers are provided
        if (this.answeredPositions.size === this.currentMissingPositions.length) {
            setTimeout(() => this.submitMultipleAnswers(), 500);
        }
    }
    
    handleKeyPress(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (this.currentMissingPositions.length === 1) {
                this.submitAnswer();
            } else {
                this.submitMultipleAnswers();
            }
        }
    }
    
    submitAnswer() {
        const answerInput = document.getElementById('answer-input');
        if (!answerInput || !answerInput.value.trim()) return;
        
        const userAnswer = parseInt(answerInput.value);
        const position = this.currentMissingPositions[0];
        const correctAnswer = this.currentProblem.sequence[position];
        
        this.currentProblem.userAnswers[position] = userAnswer;
        this.currentProblem.attempts++;
        
        const isCorrect = userAnswer === correctAnswer;
        this.handleAnswer(isCorrect, { [position]: userAnswer });
    }
    
    submitMultipleAnswers() {
        const allAnswered = this.currentMissingPositions.every(pos => 
            this.answeredPositions.has(pos)
        );
        
        if (!allAnswered) return;
        
        this.currentProblem.attempts++;
        
        let allCorrect = true;
        const userAnswers = {};
        
        for (const position of this.currentMissingPositions) {
            const userAnswer = this.currentProblem.userAnswers[position];
            const correctAnswer = this.currentProblem.sequence[position];
            
            userAnswers[position] = userAnswer;
            
            if (userAnswer !== correctAnswer) {
                allCorrect = false;
            }
        }
        
        this.handleAnswer(allCorrect, userAnswers);
    }
    
    handleAnswer(isCorrect, userAnswers) {
        this.currentProblem.endTime = Date.now();
        
        if (isCorrect) {
            this.correctAnswers++;
            this.playSound('correct');
            this.hapticFeedback(50);
            this.showFeedback(true);
            this.createCelebration();
        } else {
            this.incorrectAnswers++;
            this.playSound('incorrect');
            this.hapticFeedback(100);
            this.showFeedback(false);
        }
        
        // Record attempt
        this.gameData.push({
            questionNumber: this.currentQuestion + 1,
            sequence: [...this.currentProblem.sequence],
            missingPositions: [...this.currentProblem.missingPositions],
            userAnswers: { ...userAnswers },
            correctAnswers: this.getCorrectAnswers(),
            isCorrect: isCorrect,
            timeSpent: this.currentProblem.endTime - this.currentProblem.startTime,
            attempts: this.currentProblem.attempts,
            pattern: this.currentProblem.pattern
        });
        
        setTimeout(() => {
            this.nextQuestion();
        }, isCorrect ? 1500 : 2500);
    }
    
    getCorrectAnswers() {
        const correct = {};
        for (const pos of this.currentProblem.missingPositions) {
            correct[pos] = this.currentProblem.sequence[pos];
        }
        return correct;
    }
    
    showFeedback(isCorrect) {
        const feedbackSection = document.getElementById('feedback-section');
        const feedbackContent = document.getElementById('feedback-content');
        
        if (!feedbackSection || !feedbackContent) return;
        
        let content;
        if (isCorrect) {
            const messages = [
                '🎉 Perfect pattern!', '⭐ Great job!', '🧠 Excellent thinking!', 
                '👏 Well done!', '🎊 Amazing!', '💡 Smart work!'
            ];
            content = `
                <div class="text-success-600">
                    <div class="text-4xl mb-2">${messages[Math.floor(Math.random() * messages.length)]}</div>
                    <p class="text-lg font-semibold">You found the pattern!</p>
                    <p class="text-sm text-gray-600 mt-2">${this.currentProblem.pattern.description}</p>
                </div>
            `;
        } else {
            const correctAnswers = this.getCorrectAnswers();
            const correctText = Object.entries(correctAnswers)
                .map(([pos, val]) => `Position ${parseInt(pos) + 1}: ${val}`)
                .join(', ');
            
            content = `
                <div class="text-error-500">
                    <div class="text-3xl mb-2">🤔 Try again!</div>
                    <p class="text-lg">The pattern was: <span class="font-bold">${this.currentProblem.pattern.description}</span></p>
                    <p class="text-sm text-gray-600 mt-2">Correct answers: ${correctText}</p>
                </div>
            `;
        }
        
        feedbackContent.innerHTML = content;
        feedbackSection.classList.remove('hidden');
        
        // Hide input sections
        document.getElementById('number-input-section').classList.add('hidden');
        document.getElementById('multiple-input-section').classList.add('hidden');
    }
    
    nextQuestion() {
        // Hide feedback
        document.getElementById('feedback-section').classList.add('hidden');
        
        this.currentQuestion++;
        this.showQuestion();
    }
    
    showHint() {
        if (!this.settings.showHints || !this.currentProblem) return;
        
        const hintSection = document.getElementById('pattern-hint');
        const hintText = document.getElementById('hint-text');
        
        if (hintText && hintSection) {
            hintText.textContent = this.currentProblem.pattern.description;
            hintSection.classList.remove('hidden');
            
            this.playSound('hint');
            this.hapticFeedback(30);
            
            // Auto-hide hint after a few seconds
            setTimeout(() => {
                hintSection.classList.add('hidden');
            }, 5000);
        }
    }
    
    createCelebration() {
        const container = document.getElementById('celebration-container');
        if (!container) return;
        
        // Create particle burst
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
            particle.style.setProperty('--random-x', (Math.random() - 0.5) * 200 + 'px');
            particle.style.setProperty('--random-y', -(Math.random() * 100 + 50) + 'px');
            
            container.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 2000);
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
            game: 'sequences',
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
        
        // Update number range radio buttons
        document.querySelector(`input[name="number-range"][value="${this.settings.numberRange}"]`).checked = true;
        
        // Update pattern type checkboxes
        document.getElementById('addition-patterns').checked = this.settings.patternTypes.includes('addition');
        document.getElementById('subtraction-patterns').checked = this.settings.patternTypes.includes('subtraction');
        document.getElementById('skip-counting').checked = this.settings.patternTypes.includes('skip-counting');
        
        // Update show hints checkbox
        document.getElementById('show-hints').checked = this.settings.showHints;
    }
}

// Global functions for HTML event handlers
function submitAnswer() {
    if (window.sequencesGame) {
        window.sequencesGame.submitAnswer();
    }
}

function submitMultipleAnswers() {
    if (window.sequencesGame) {
        window.sequencesGame.submitMultipleAnswers();
    }
}

function showHint() {
    if (window.sequencesGame) {
        window.sequencesGame.showHint();
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
    if (window.sequencesGame) {
        window.sequencesGame.saveSettings();
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
    window.sequencesGame = new MobileSequencesGame();
});

// Handle page visibility for mobile optimization
document.addEventListener('visibilitychange', () => {
    if (window.sequencesGame) {
        window.sequencesGame.handleVisibilityChange();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileSequencesGame;
}