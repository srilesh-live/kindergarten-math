// Number Sequences Game Logic
class SequenceGame {
    constructor() {
        this.currentSequence = null;
        this.currentQuestion = 0;
        this.totalQuestions = 10;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.startTime = null;
        this.isPaused = false;
        this.incorrectProblems = [];
        this.questionStartTime = null;
        this.userAnswers = {}; // Track answers for multiple missing numbers
        this.answeredPositions = new Set(); // Track which positions have been answered
        
        // Settings
        this.settings = {
            soundEnabled: true,
            minRange: 1,
            maxRange: 20,
            minStep: 1,
            maxStep: 5,
            sequenceLength: 10, // Fixed to 10 numbers
            sequenceType: 'counting' // 'counting', 'skip-counting', 'countdown', 'mixed'
        };
        
        // Audio contexts for sounds
        this.audioContext = null;
        this.initAudio();
        
        // Initialize game
        this.init();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
            this.settings.soundEnabled = false;
        }
    }
    
    playBeep(frequency = 880, duration = 200, type = 'success') {
        if (!this.settings.soundEnabled || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            if (type === 'success') {
                // Success: Pleasant ascending tone
                oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
                oscillator.frequency.exponentialRampToValueAtTime(783.99, this.audioContext.currentTime + duration / 1000); // G5
            } else {
                // Error: Lower descending tone
                oscillator.frequency.setValueAtTime(349.23, this.audioContext.currentTime); // F4
                oscillator.frequency.exponentialRampToValueAtTime(261.63, this.audioContext.currentTime + duration / 1000); // C4
            }
            
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
        } catch (e) {
            console.error('Error playing sound:', e);
        }
    }
    
    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.startNewGame();
    }
    
    setupEventListeners() {
        // Settings modal
        document.getElementById('settings-btn').addEventListener('click', () => this.openSettings());
        document.getElementById('settings-close-btn').addEventListener('click', () => this.closeSettings());
        document.getElementById('settings-cancel-btn').addEventListener('click', () => this.closeSettings());
        document.getElementById('settings-save-btn').addEventListener('click', () => this.saveSettings());
        
        // Settings navigation
        document.querySelectorAll('.settings-nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.switchSettingsSection(e.target.dataset.section));
        });
        
        // Sequence type selection
        document.querySelectorAll('.sequence-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectSequenceType(e.currentTarget));
        });
        
        // Exit modal
        document.getElementById('exit-btn').addEventListener('click', () => this.showExitModal());
        document.getElementById('exit-cancel-btn').addEventListener('click', () => this.hideExitModal());
        document.getElementById('exit-confirm-btn').addEventListener('click', () => this.exitGame());
        
        // Play/Pause
        document.getElementById('play-pause-btn').addEventListener('click', () => this.togglePause());
        
        // Answer inputs will be set up dynamically in displaySequence()
        
        // Statistics modal
        document.getElementById('stats-practice-again').addEventListener('click', () => this.startNewGame());
        document.getElementById('stats-home').addEventListener('click', () => window.location.href = 'home.html');
        
        // Close modals on backdrop click
        document.getElementById('settings-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeSettings();
        });
        document.getElementById('exit-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.hideExitModal();
        });
        document.getElementById('statistics-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeStatistics();
        });
    }
    
    generateSequence() {
        const length = this.settings.sequenceLength; // Always 10
        const min = this.settings.minRange;
        const max = this.settings.maxRange;
        const minStep = this.settings.minStep;
        const maxStep = this.settings.maxStep;
        
        let sequenceType = this.settings.sequenceType;
        if (sequenceType === 'mixed') {
            const types = ['counting', 'skip-counting', 'countdown'];
            sequenceType = types[Math.floor(Math.random() * types.length)];
        }
        
        let sequence = [];
        let step = minStep + Math.floor(Math.random() * (maxStep - minStep + 1));
        let start;
        
        switch (sequenceType) {
            case 'counting':
                step = 1; // Always use step of 1 for basic counting
                start = min + Math.floor(Math.random() * (max - min + 1));
                for (let i = 0; i < length; i++) {
                    sequence.push(start + i * step);
                }
                break;
                
            case 'skip-counting':
                start = min + Math.floor(Math.random() * (max - min + 1));
                for (let i = 0; i < length; i++) {
                    sequence.push(start + i * step);
                }
                break;
                
            case 'countdown':
                step = 1; // Always use step of 1 for basic countdown
                start = Math.max(min + (length - 1), max - Math.floor(Math.random() * (max - min + 1)));
                for (let i = 0; i < length; i++) {
                    sequence.push(start - i * step);
                }
                break;
        }
        
        // Generate multiple missing indices (1-3 missing numbers)
        const numMissing = Math.random() < 0.6 ? 1 : (Math.random() < 0.8 ? 2 : 3);
        let missingIndices = [];
        
        // Ensure we don't pick consecutive indices to avoid confusion
        while (missingIndices.length < numMissing) {
            const candidate = Math.floor(Math.random() * length);
            const isValid = !missingIndices.some(existing => Math.abs(existing - candidate) < 2);
            if (isValid && !missingIndices.includes(candidate)) {
                missingIndices.push(candidate);
            }
        }
        
        missingIndices.sort((a, b) => a - b);
        
        const correctAnswers = {};
        missingIndices.forEach(index => {
            correctAnswers[index] = sequence[index];
        });
        
        return {
            sequence,
            missingIndices,
            correctAnswers,
            type: sequenceType,
            step
        };
    }
    

    
    displaySequence() {
        const sequence = this.currentSequence.sequence;
        const missingIndices = this.currentSequence.missingIndices;
        
        // Clear existing sequence displays
        for (let i = 1; i <= 10; i++) {
            const element = document.getElementById(`seq-${i}`);
            if (element) {
                element.style.display = 'flex';
            }
        }
        
        // Display current sequence
        sequence.forEach((num, index) => {
            const element = document.getElementById(`seq-${index + 1}`);
            if (element) {
                if (missingIndices.includes(index)) {
                    element.className = 'sequence-missing bg-yellow-600/20 border-2 border-yellow-500/60 rounded-xl w-16 h-16 flex items-center justify-center';
                    element.innerHTML = `
                        <input 
                            type="number" 
                            data-index="${index}"
                            class="answer-input w-12 text-2xl md:text-3xl font-bold text-center leading-none bg-transparent border-0 text-app-text focus:outline-none caret-yellow-400"
                        >
                    `;
                } else {
                    element.className = 'sequence-number bg-app-bg/50 border-2 border-app-border rounded-xl w-16 h-16 flex items-center justify-center';
                    element.textContent = num;
                }
            }
        });
        
        // Re-attach event listeners to all inputs
        document.querySelectorAll('.answer-input').forEach(input => {
            input.addEventListener('input', (e) => this.handleAnswerInput(e));
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === 'Tab') {
                    this.handleInputNavigation(e);
                }
            });
            input.addEventListener('blur', (e) => this.validateInput(e));
        });
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = document.querySelector('.answer-input');
            if (firstInput) firstInput.focus();
        }, 100);
    }
    
    handleAnswerInput(e) {
        const input = e.target.value;
        const index = parseInt(e.target.dataset.index);
        
        if (input === '') {
            delete this.userAnswers[index];
            this.answeredPositions.delete(index);
            return;
        }
        
        const userAnswer = parseInt(input);
        const correctAnswer = this.currentSequence.correctAnswers[index];
        
        // Store the user's answer
        this.userAnswers[index] = userAnswer;
        
        if (userAnswer === correctAnswer) {
            this.handleCorrectInput(e.target, index);
        } else if (input.length >= correctAnswer.toString().length) {
            this.handleIncorrectInput(e.target, index, userAnswer);
        }
    }
    
    handleInputNavigation(e) {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            const currentInput = e.target;
            const allInputs = Array.from(document.querySelectorAll('.answer-input'));
            const currentIndex = allInputs.indexOf(currentInput);
            
            // Move to next input or check if all are complete
            if (currentIndex < allInputs.length - 1) {
                allInputs[currentIndex + 1].focus();
            } else {
                this.checkAllAnswers();
            }
        }
    }
    
    validateInput(e) {
        const index = parseInt(e.target.dataset.index);
        const input = e.target.value;
        
        if (input !== '' && !this.answeredPositions.has(index)) {
            const userAnswer = parseInt(input);
            const correctAnswer = this.currentSequence.correctAnswers[index];
            
            if (userAnswer === correctAnswer) {
                this.answeredPositions.add(index);
                this.markInputCorrect(e.target);
            } else {
                this.markInputIncorrect(e.target, correctAnswer);
            }
            
            // Check if all positions are answered
            setTimeout(() => this.checkAllAnswers(), 100);
        }
    }
    
    handleCorrectInput(inputElement, index) {
        this.answeredPositions.add(index);
        this.markInputCorrect(inputElement);
    }
    
    handleIncorrectInput(inputElement, index, userAnswer) {
        const correctAnswer = this.currentSequence.correctAnswers[index];
        this.markInputIncorrect(inputElement, correctAnswer);
    }
    
    markInputCorrect(inputElement) {
        const container = inputElement.parentElement;
        container.className = 'sequence-correct bg-green-600/20 border-2 border-green-500 rounded-xl w-20 h-20 flex items-center justify-center';
        inputElement.classList.add('text-green-400');
        inputElement.disabled = true;
    }
    
    markInputIncorrect(inputElement, correctAnswer) {
        const container = inputElement.parentElement;
        container.className = 'sequence-incorrect bg-red-600/20 border-2 border-red-500 rounded-xl w-20 h-20 flex items-center justify-center';
        inputElement.classList.add('text-red-400');
        
        // Show correct answer after brief delay
        setTimeout(() => {
            inputElement.value = correctAnswer;
            inputElement.classList.remove('text-red-400');
            inputElement.classList.add('text-orange-400');
            inputElement.disabled = true;
        }, 1000);
    }
    
    checkAllAnswers() {
        const missingIndices = this.currentSequence.missingIndices;
        const allInputs = document.querySelectorAll('.answer-input');
        const filledInputs = Array.from(allInputs).filter(input => input.value !== '');
        
        // Only proceed if all missing positions have been attempted
        if (filledInputs.length < missingIndices.length) {
            return; // Still waiting for more answers
        }
        
        // Check if all answers are correct
        let allCorrect = true;
        let hasIncorrect = false;
        
        missingIndices.forEach(index => {
            const userAnswer = this.userAnswers[index];
            const correctAnswer = this.currentSequence.correctAnswers[index];
            
            if (userAnswer !== correctAnswer) {
                allCorrect = false;
                hasIncorrect = true;
            }
        });
        
        // Play appropriate sound
        if (allCorrect) {
            this.playBeep(880, 300, 'success');
            this.correctAnswers++;
        } else {
            this.playBeep(440, 400, 'error');
            this.incorrectAnswers++;
            
            // Track incorrect sequence
            this.incorrectProblems.push({
                sequence: [...this.currentSequence.sequence],
                missingIndices: [...this.currentSequence.missingIndices],
                correctAnswers: {...this.currentSequence.correctAnswers},
                userAnswers: {...this.userAnswers},
                type: this.currentSequence.type,
                step: this.currentSequence.step
            });
        }
        
        this.updateScore();
        
        // Proceed to next question after delay
        setTimeout(() => {
            this.nextQuestion();
        }, allCorrect ? 1000 : 2500);
    }
    

    
    nextQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion >= this.totalQuestions) {
            this.endGame();
        } else {
            // Reset answer tracking
            this.userAnswers = {};
            this.answeredPositions = new Set();
            
            this.currentSequence = this.generateSequence();
            this.displaySequence();
            this.updateProgress();
            this.questionStartTime = Date.now();
        }
    }
    
    updateScore() {
        document.getElementById('correct-count').textContent = this.correctAnswers;
        document.getElementById('incorrect-count').textContent = this.incorrectAnswers;
    }
    
    updateProgress() {
        const progress = (this.currentQuestion / this.totalQuestions) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = `${this.currentQuestion + 1} of ${this.totalQuestions}`;
    }
    
    updateTimer() {
        if (this.isPaused || !this.startTime) return;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        document.getElementById('timer-display').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    startNewGame() {
        this.currentQuestion = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.incorrectProblems = [];
        this.userAnswers = {};
        this.answeredPositions = new Set();
        this.startTime = Date.now();
        this.questionStartTime = Date.now();
        this.isPaused = false;
        
        // Hide statistics modal if open
        this.closeStatistics();
        
        // Reset UI
        this.updateScore();
        this.updateProgress();
        
        // Start timer
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        
        // Generate first sequence
        this.currentSequence = this.generateSequence();
        this.displaySequence();
        
        // Update play/pause button
        document.getElementById('play-pause-icon').textContent = 'pause';
    }
    
    endGame() {
        clearInterval(this.timerInterval);
        
        const totalTime = Math.floor((Date.now() - this.startTime) / 1000);
        const avgTime = Math.floor(totalTime / this.totalQuestions);
        const accuracy = Math.round((this.correctAnswers / this.totalQuestions) * 100);
        
        // Update statistics
        document.getElementById('stats-total').textContent = this.totalQuestions;
        document.getElementById('stats-correct').textContent = this.correctAnswers;
        document.getElementById('stats-incorrect').textContent = this.incorrectAnswers;
        document.getElementById('stats-accuracy').textContent = `${accuracy}%`;
        
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        document.getElementById('stats-time').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const avgMinutes = Math.floor(avgTime / 60);
        const avgSeconds = avgTime % 60;
        document.getElementById('stats-avg-time').textContent = 
            `${avgMinutes.toString().padStart(2, '0')}:${avgSeconds.toString().padStart(2, '0')}`;
        
        // Show incorrect answers or perfect score
        if (this.incorrectProblems.length > 0) {
            this.displayIncorrectAnswers();
            document.getElementById('incorrect-section').classList.remove('hidden');
            document.getElementById('perfect-score').classList.add('hidden');
        } else {
            document.getElementById('incorrect-section').classList.add('hidden');
            document.getElementById('perfect-score').classList.remove('hidden');
        }
        
        // Show statistics modal
        this.showStatistics();
    }
    
    displayIncorrectAnswers() {
        const incorrectList = document.getElementById('incorrect-list');
        incorrectList.innerHTML = '';
        
        this.incorrectProblems.forEach((problem, index) => {
            const div = document.createElement('div');
            div.className = 'bg-app-bg rounded-xl p-4 border border-red-500/30';
            
            const sequenceDisplay = problem.sequence.map((num, i) => {
                if (problem.missingIndices && problem.missingIndices.includes(i)) {
                    const userAnswer = problem.userAnswers[i] || '?';
                    return `<span class="text-red-400 font-bold">${userAnswer}</span>`;
                } else if (problem.missingIndex !== undefined && i === problem.missingIndex) {
                    // Handle old format for backward compatibility
                    return `<span class="text-red-400 font-bold">${problem.userAnswer}</span>`;
                }
                return num;
            }).join(', ');
            
            const correctSequence = problem.sequence.map((num, i) => {
                if (problem.missingIndices && problem.missingIndices.includes(i)) {
                    const correctAnswer = problem.correctAnswers[i];
                    return `<span class="text-green-400 font-bold">${correctAnswer}</span>`;
                } else if (problem.missingIndex !== undefined && i === problem.missingIndex) {
                    // Handle old format for backward compatibility
                    return `<span class="text-green-400 font-bold">${problem.correctAnswer}</span>`;
                }
                return num;
            }).join(', ');
            
            const missingCount = problem.missingIndices ? problem.missingIndices.length : 1;
            const typeLabel = `${problem.type} (${missingCount} missing)`;
            
            div.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <span class="text-app-text font-medium">Sequence ${index + 1}</span>
                    <span class="text-xs text-app-text-muted px-2 py-1 bg-app-surface rounded">${typeLabel}</span>
                </div>
                <div class="text-sm text-app-text-muted mb-1">Your answer: ${sequenceDisplay}</div>
                <div class="text-sm text-green-400">Correct answer: ${correctSequence}</div>
            `;
            
            incorrectList.appendChild(div);
        });
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const icon = document.getElementById('play-pause-icon');
        
        if (this.isPaused) {
            icon.textContent = 'play_arrow';
            clearInterval(this.timerInterval);
        } else {
            icon.textContent = 'pause';
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        }
    }
    
    // Settings Management
    openSettings() {
        const modal = document.getElementById('settings-modal');
        modal.classList.remove('opacity-0', 'invisible');
        modal.querySelector('.transform').classList.remove('scale-90');
        
        // Populate current settings
        document.getElementById('total-questions').value = this.totalQuestions;
        document.getElementById('min-range').value = this.settings.minRange;
        document.getElementById('max-range').value = this.settings.maxRange;
        document.getElementById('min-step').value = this.settings.minStep;
        document.getElementById('max-step').value = this.settings.maxStep;
        
        // Update sequence type selection
        document.querySelectorAll('.sequence-type-btn').forEach(btn => {
            btn.classList.remove('active', 'border-green-500', 'text-green-400');
            btn.classList.add('border-app-border', 'text-app-text-muted');
            
            if (btn.dataset.type === this.settings.sequenceType) {
                btn.classList.add('active', 'border-green-500');
                btn.querySelector('h4').classList.add('text-green-400');
            }
        });
    }
    
    closeSettings() {
        const modal = document.getElementById('settings-modal');
        modal.classList.add('opacity-0', 'invisible');
        modal.querySelector('.transform').classList.add('scale-90');
    }
    
    switchSettingsSection(section) {
        // Update navigation
        document.querySelectorAll('.settings-nav-item').forEach(item => {
            item.classList.remove('active', 'bg-app-surface-light', 'text-app-text');
            item.classList.add('text-app-text-muted');
        });
        
        document.querySelector(`[data-section="${section}"]`).classList.add('active', 'bg-app-surface-light', 'text-app-text');
        
        // Update content
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        document.getElementById(`${section}-section`).classList.remove('hidden');
    }
    
    selectSequenceType(btn) {
        document.querySelectorAll('.sequence-type-btn').forEach(b => {
            b.classList.remove('active', 'border-green-500');
            b.classList.add('border-app-border');
            b.querySelector('h4').classList.remove('text-green-400');
            b.querySelector('h4').classList.add('text-app-text-muted');
        });
        
        btn.classList.add('active', 'border-green-500');
        btn.classList.remove('border-app-border');
        btn.querySelector('h4').classList.add('text-green-400');
        btn.querySelector('h4').classList.remove('text-app-text-muted');
    }
    
    saveSettings() {
        // Get values from form
        this.totalQuestions = parseInt(document.getElementById('total-questions').value);
        this.settings.minRange = parseInt(document.getElementById('min-range').value);
        this.settings.maxRange = parseInt(document.getElementById('max-range').value);
        this.settings.minStep = parseInt(document.getElementById('min-step').value);
        this.settings.maxStep = parseInt(document.getElementById('max-step').value);
        
        // Get selected sequence type
        const activeType = document.querySelector('.sequence-type-btn.active');
        if (activeType) {
            this.settings.sequenceType = activeType.dataset.type;
        }
        
        // Save to localStorage
        localStorage.setItem('sequenceGameSettings', JSON.stringify(this.settings));
        
        this.closeSettings();
    }
    
    loadSettings() {
        const saved = localStorage.getItem('sequenceGameSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }
    
    // Modal Management
    showExitModal() {
        const modal = document.getElementById('exit-modal');
        modal.classList.remove('opacity-0', 'invisible');
        modal.querySelector('.transform').classList.remove('scale-90');
    }
    
    hideExitModal() {
        const modal = document.getElementById('exit-modal');
        modal.classList.add('opacity-0', 'invisible');
        modal.querySelector('.transform').classList.add('scale-90');
    }
    
    exitGame() {
        window.location.href = 'home.html';
    }
    
    showStatistics() {
        const modal = document.getElementById('statistics-modal');
        modal.classList.remove('opacity-0', 'invisible');
        modal.querySelector('.transform').classList.remove('scale-90');
    }
    
    closeStatistics() {
        const modal = document.getElementById('statistics-modal');
        modal.classList.add('opacity-0', 'invisible');
        modal.querySelector('.transform').classList.add('scale-90');
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sequenceGame = new SequenceGame();
});

// Handle page visibility change to pause/resume
document.addEventListener('visibilitychange', () => {
    if (window.sequenceGame) {
        if (document.hidden && !window.sequenceGame.isPaused) {
            window.sequenceGame.togglePause();
        }
    }
});