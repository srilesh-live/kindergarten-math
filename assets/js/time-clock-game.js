/**
 * Mobile Time & Clock Game
 * Interactive time-telling practice optimized for touch devices
 */

class MobileTimeClockGame {
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
        this.isDragging = false;
        this.dragHand = null;
        
        // Settings
        this.settings = {
            difficulty: 'medium',
            gameMode: 'read-clock', // 'read-clock', 'set-clock', 'digital-time'
            showNumbers: true,
            showMinutes: false
        };
        
        // Touch handling
        this.touchStartAngle = 0;
        this.touchStartRotation = 0;
        this.hapticEnabled = 'vibrate' in navigator;
        
        // Audio system
        this.audioContext = null;
        this.sounds = {};
        
        this.init();
    }
    
    async init() {
        console.log('🕐 Initializing Mobile Time & Clock Game');
        
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
            const saved = localStorage.getItem('time-clock-settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('time-clock-settings', JSON.stringify(this.settings));
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
        // Clock tick sound
        this.sounds.tick = this.createTone(800, 0.1, 'square');
        
        // Success sound
        this.sounds.correct = this.createTone(600, 0.3, 'sine');
        
        // Error sound
        this.sounds.incorrect = this.createTone(300, 0.4, 'sawtooth');
        
        // Complete sound
        this.sounds.complete = this.createTone(800, 0.5, 'sine');
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
        // Time input listeners
        const hourInput = document.getElementById('hour-input');
        const minuteInput = document.getElementById('minute-input');
        
        if (hourInput && minuteInput) {
            [hourInput, minuteInput].forEach(input => {
                input.addEventListener('input', this.handleTimeInputChange.bind(this));
                input.addEventListener('keypress', this.handleKeyPress.bind(this));
            });
        }
        
        // Clock hand drag listeners (touch and mouse)
        this.setupClockInteraction();
        
        // Settings modal listeners
        const settingsInputs = document.querySelectorAll('#settings-modal input');
        settingsInputs.forEach(input => {
            input.addEventListener('change', this.handleSettingsChange.bind(this));
        });
        
        // Mobile-specific events
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
    
    setupClockInteraction() {
        const hourHand = document.getElementById('hour-hand');
        const minuteHand = document.getElementById('minute-hand');
        const clockSvg = document.getElementById('analog-clock');
        
        if (!hourHand || !minuteHand || !clockSvg) return;
        
        // Touch events for mobile
        [hourHand, minuteHand].forEach(hand => {
            hand.addEventListener('touchstart', this.handleHandTouchStart.bind(this), { passive: false });
            hand.addEventListener('mousedown', this.handleHandMouseDown.bind(this));
        });
        
        // Global move and end events
        document.addEventListener('touchmove', this.handleHandTouchMove.bind(this), { passive: false });
        document.addEventListener('mousemove', this.handleHandMouseMove.bind(this));
        document.addEventListener('touchend', this.handleHandTouchEnd.bind(this));
        document.addEventListener('mouseup', this.handleHandMouseUp.bind(this));
    }
    
    handleHandTouchStart(event) {
        event.preventDefault();
        this.startHandDrag(event.target, event.touches[0]);
        this.playSound('tick');
        this.hapticFeedback(10);
    }
    
    handleHandMouseDown(event) {
        event.preventDefault();
        this.startHandDrag(event.target, event);
        this.playSound('tick');
    }
    
    startHandDrag(hand, pointer) {
        if (this.settings.gameMode !== 'set-clock') return;
        
        this.isDragging = true;
        this.dragHand = hand;
        
        const clockSvg = document.getElementById('analog-clock');
        const rect = clockSvg.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        this.touchStartAngle = Math.atan2(pointer.clientY - centerY, pointer.clientX - centerX);
        
        // Get current rotation
        const transform = hand.getAttribute('transform') || '';
        const rotateMatch = transform.match(/rotate\(([^)]+)\)/);
        this.touchStartRotation = rotateMatch ? parseFloat(rotateMatch[1]) : 0;
        
        hand.classList.add('dragging');
        document.body.style.cursor = 'grabbing';
    }
    
    handleHandTouchMove(event) {
        if (!this.isDragging) return;
        event.preventDefault();
        this.updateHandRotation(event.touches[0]);
    }
    
    handleHandMouseMove(event) {
        if (!this.isDragging) return;
        this.updateHandRotation(event);
    }
    
    updateHandRotation(pointer) {
        if (!this.dragHand) return;
        
        const clockSvg = document.getElementById('analog-clock');
        const rect = clockSvg.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const currentAngle = Math.atan2(pointer.clientY - centerY, pointer.clientX - centerX);
        const angleDiff = currentAngle - this.touchStartAngle;
        
        let newRotation = this.touchStartRotation + (angleDiff * 180 / Math.PI);
        
        // Normalize rotation
        newRotation = ((newRotation % 360) + 360) % 360;
        
        // Snap to increments based on hand type and difficulty
        if (this.dragHand.id === 'hour-hand') {
            // Hour hand snaps to 30-degree increments (12 hours)
            newRotation = Math.round(newRotation / 30) * 30;
        } else if (this.dragHand.id === 'minute-hand') {
            // Minute hand snaps based on difficulty
            let snapIncrement;
            switch (this.settings.difficulty) {
                case 'easy':
                    snapIncrement = 90; // 15-minute intervals
                    break;
                case 'medium':
                    snapIncrement = 30; // 5-minute intervals
                    break;
                case 'hard':
                    snapIncrement = 6; // 1-minute intervals
                    break;
                default:
                    snapIncrement = 30;
            }
            newRotation = Math.round(newRotation / snapIncrement) * snapIncrement;
        }
        
        this.dragHand.setAttribute('transform', `rotate(${newRotation} 120 120)`);
    }
    
    handleHandTouchEnd(event) {
        this.endHandDrag();
    }
    
    handleHandMouseUp(event) {
        this.endHandDrag();
    }
    
    endHandDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        
        if (this.dragHand) {
            this.dragHand.classList.remove('dragging');
            this.dragHand = null;
        }
        
        document.body.style.cursor = '';
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
    
    handleTimeInputChange() {
        const hourInput = document.getElementById('hour-input');
        const minuteInput = document.getElementById('minute-input');
        const submitBtn = document.getElementById('submit-time-btn');
        
        if (hourInput && minuteInput && submitBtn) {
            const hasValidInput = hourInput.value.trim() && minuteInput.value.trim();
            submitBtn.disabled = !hasValidInput;
        }
    }
    
    handleKeyPress(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.submitTime();
        }
    }
    
    handleSettingsChange(event) {
        const { name, type, value, checked } = event.target;
        
        if (name === 'difficulty') {
            this.settings.difficulty = value;
        } else if (name === 'game-mode') {
            this.settings.gameMode = value;
        } else if (type === 'checkbox') {
            if (event.target.id === 'show-numbers-toggle') {
                this.settings.showNumbers = checked;
            } else if (event.target.id === 'show-minutes-toggle') {
                this.settings.showMinutes = checked;
            }
        }
        
        // Update clock display immediately
        this.updateClockDisplay();
    }
    
    generateProblems() {
        this.problems = [];
        
        for (let i = 0; i < this.totalQuestions; i++) {
            const problem = this.generateProblem();
            this.problems.push(problem);
        }
    }
    
    generateProblem() {
        let hour, minute;
        
        // Generate time based on difficulty
        switch (this.settings.difficulty) {
            case 'easy':
                // Hour only (on the hour)
                hour = Math.floor(Math.random() * 12) + 1;
                minute = 0;
                break;
            case 'medium':
                // 15-minute intervals
                hour = Math.floor(Math.random() * 12) + 1;
                minute = Math.floor(Math.random() * 4) * 15;
                break;
            case 'hard':
                // 5-minute intervals
                hour = Math.floor(Math.random() * 12) + 1;
                minute = Math.floor(Math.random() * 12) * 5;
                break;
            default:
                hour = Math.floor(Math.random() * 12) + 1;
                minute = Math.floor(Math.random() * 4) * 15;
        }
        
        return {
            hour,
            minute,
            displayTime: this.formatTime(hour, minute),
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
        
        this.currentProblem = this.problems[this.currentQuestion];
        this.currentProblem.startTime = Date.now();
        
        // Update UI
        this.updateProgress();
        this.setupQuestionDisplay();
        
        // Focus appropriate input
        setTimeout(() => {
            this.focusInput();
        }, 300);
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
    
    setupQuestionDisplay() {
        const { hour, minute } = this.currentProblem;
        
        // Update clock display settings
        this.updateClockDisplay();
        
        // Setup based on game mode
        if (this.settings.gameMode === 'read-clock') {
            this.setupReadClockMode();
        } else if (this.settings.gameMode === 'set-clock') {
            this.setupSetClockMode();
        } else if (this.settings.gameMode === 'digital-time') {
            this.setupDigitalTimeMode();
        }
    }
    
    setupReadClockMode() {
        const { hour, minute } = this.currentProblem;
        
        // Show question text
        document.getElementById('question-text').textContent = 'What time is shown on the clock?';
        
        // Set clock hands
        this.setClockHands(hour, minute);
        
        // Show time input section
        document.getElementById('time-input-section').classList.remove('hidden');
        document.getElementById('digital-display-section').classList.add('hidden');
        document.getElementById('interactive-section').classList.add('hidden');
        
        // Clear inputs
        document.getElementById('hour-input').value = '';
        document.getElementById('minute-input').value = '';
        document.getElementById('submit-time-btn').disabled = true;
    }
    
    setupSetClockMode() {
        const { hour, minute } = this.currentProblem;
        
        // Show question text and target time
        document.getElementById('question-text').textContent = 'Set the clock to show the correct time:';
        document.getElementById('target-time').textContent = this.formatTime(hour, minute);
        
        // Reset clock hands to random position
        this.setClockHands(12, 0);
        
        // Show interactive section
        document.getElementById('time-input-section').classList.add('hidden');
        document.getElementById('digital-display-section').classList.add('hidden');
        document.getElementById('interactive-section').classList.remove('hidden');
    }
    
    setupDigitalTimeMode() {
        const { hour, minute } = this.currentProblem;
        
        // Show question text
        document.getElementById('question-text').textContent = 'Set the clock to match the digital time:';
        
        // Show digital time
        document.getElementById('digital-time').textContent = this.formatTime(hour, minute);
        
        // Reset clock hands
        this.setClockHands(12, 0);
        
        // Show sections
        document.getElementById('digital-display-section').classList.remove('hidden');
        document.getElementById('time-input-section').classList.add('hidden');
        document.getElementById('interactive-section').classList.remove('hidden');
    }
    
    updateClockDisplay() {
        const hourNumbers = document.getElementById('hour-numbers');
        const minuteMarkers = document.getElementById('minute-markers');
        
        if (hourNumbers) {
            hourNumbers.style.display = this.settings.showNumbers ? 'block' : 'none';
        }
        
        if (minuteMarkers) {
            if (this.settings.showMinutes) {
                this.generateMinuteMarkers();
                minuteMarkers.classList.remove('hidden');
            } else {
                minuteMarkers.classList.add('hidden');
            }
        }
    }
    
    generateMinuteMarkers() {
        const minuteMarkers = document.getElementById('minute-markers');
        if (!minuteMarkers) return;
        
        minuteMarkers.innerHTML = '';
        
        // Create 60 minute markers (excluding major hour positions)
        for (let i = 1; i < 60; i++) {
            if (i % 5 !== 0) { // Skip hour positions
                const angle = i * 6; // 6 degrees per minute
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', '120');
                line.setAttribute('y1', '20');
                line.setAttribute('x2', '120');
                line.setAttribute('y2', '28');
                line.setAttribute('transform', `rotate(${angle} 120 120)`);
                minuteMarkers.appendChild(line);
            }
        }
    }
    
    setClockHands(hour, minute) {
        const hourHand = document.getElementById('hour-hand');
        const minuteHand = document.getElementById('minute-hand');
        
        if (!hourHand || !minuteHand) return;
        
        // Calculate angles
        const minuteAngle = (minute * 6) - 90; // 6 degrees per minute, -90 for 12 o'clock start
        const hourAngle = ((hour % 12) * 30) + (minute * 0.5) - 90; // 30 degrees per hour + minute adjustment
        
        // Set transforms
        hourHand.setAttribute('transform', `rotate(${hourAngle} 120 120)`);
        minuteHand.setAttribute('transform', `rotate(${minuteAngle} 120 120)`);
    }
    
    focusInput() {
        if (this.settings.gameMode === 'read-clock') {
            const hourInput = document.getElementById('hour-input');
            if (hourInput) {
                hourInput.focus();
            }
        }
    }
    
    submitTime() {
        const hourInput = document.getElementById('hour-input');
        const minuteInput = document.getElementById('minute-input');
        
        if (!hourInput || !minuteInput || !hourInput.value.trim() || !minuteInput.value.trim()) {
            return;
        }
        
        const userHour = parseInt(hourInput.value);
        const userMinute = parseInt(minuteInput.value);
        
        // Validate input
        if (userHour < 1 || userHour > 12 || userMinute < 0 || userMinute > 59) {
            this.showValidationError();
            return;
        }
        
        this.checkAnswer(userHour, userMinute);
    }
    
    checkClockAnswer() {
        const hourHand = document.getElementById('hour-hand');
        const minuteHand = document.getElementById('minute-hand');
        
        if (!hourHand || !minuteHand) return;
        
        // Get hand rotations
        const hourTransform = hourHand.getAttribute('transform') || '';
        const minuteTransform = minuteHand.getAttribute('transform') || '';
        
        const hourMatch = hourTransform.match(/rotate\(([^)]+)\)/);
        const minuteMatch = minuteTransform.match(/rotate\(([^)]+)\)/);
        
        const hourAngle = hourMatch ? parseFloat(hourMatch[1]) : 0;
        const minuteAngle = minuteMatch ? parseFloat(minuteMatch[1]) : 0;
        
        // Convert angles to time
        const userMinute = Math.round(((minuteAngle + 90) % 360) / 6);
        const userHour = Math.round(((hourAngle + 90) % 360) / 30);
        
        // Normalize
        const normalizedHour = userHour === 0 ? 12 : userHour;
        const normalizedMinute = userMinute === 60 ? 0 : userMinute;
        
        this.checkAnswer(normalizedHour, normalizedMinute);
    }
    
    checkAnswer(userHour, userMinute) {
        const { hour, minute } = this.currentProblem;
        
        this.currentProblem.endTime = Date.now();
        this.currentProblem.userAnswer = { hour: userHour, minute: userMinute };
        this.currentProblem.attempts++;
        
        // Allow some tolerance for hour hand when minutes are involved
        let hourCorrect = userHour === hour;
        if (minute > 0 && Math.abs(userHour - hour) <= 1) {
            // Check if hour hand position makes sense with minutes
            const expectedHourPosition = hour + (minute / 60);
            const userHourPosition = userHour + (userMinute / 60);
            hourCorrect = Math.abs(expectedHourPosition - userHourPosition) < 0.5;
        }
        
        const isCorrect = hourCorrect && userMinute === minute;
        
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer();
        }
        
        // Record attempt
        this.gameData.push({
            questionNumber: this.currentQuestion + 1,
            targetTime: this.formatTime(hour, minute),
            userAnswer: this.formatTime(userHour, userMinute),
            isCorrect: isCorrect,
            timeSpent: this.currentProblem.endTime - this.currentProblem.startTime,
            attempts: this.currentProblem.attempts,
            gameMode: this.settings.gameMode
        });
    }
    
    handleCorrectAnswer() {
        this.correctAnswers++;
        this.playSound('correct');
        this.hapticFeedback(50);
        
        this.showFeedback(true);
        
        setTimeout(() => {
            this.nextQuestion();
        }, 1500);
    }
    
    handleIncorrectAnswer() {
        this.incorrectAnswers++;
        this.playSound('incorrect');
        this.hapticFeedback(100);
        
        this.showFeedback(false);
        
        setTimeout(() => {
            this.nextQuestion();
        }, 2500);
    }
    
    showFeedback(isCorrect) {
        const feedbackSection = document.getElementById('feedback-section');
        const feedbackContent = document.getElementById('feedback-content');
        
        if (!feedbackSection || !feedbackContent) return;
        
        let content;
        if (isCorrect) {
            const messages = [
                '🎉 Perfect time!', '⭐ Great job!', '🕐 Excellent!', 
                '👏 Well done!', '🎊 Amazing!', '💫 Fantastic!'
            ];
            content = `
                <div class="text-success-600">
                    <div class="text-4xl mb-2">${messages[Math.floor(Math.random() * messages.length)]}</div>
                    <p class="text-lg font-semibold">You got the time right!</p>
                </div>
            `;
        } else {
            const { hour, minute } = this.currentProblem;
            content = `
                <div class="text-error-500">
                    <div class="text-3xl mb-2">⏰ Try again!</div>
                    <p class="text-lg">The correct time was <span class="font-bold text-2xl">${this.formatTime(hour, minute)}</span></p>
                    <p class="text-sm text-gray-600 mt-2">Keep practicing - you're learning!</p>
                </div>
            `;
        }
        
        feedbackContent.innerHTML = content;
        feedbackSection.classList.remove('hidden');
        
        // Hide input sections
        document.getElementById('time-input-section').classList.add('hidden');
        document.getElementById('interactive-section').classList.add('hidden');
    }
    
    showValidationError() {
        // Show brief validation message
        const hourInput = document.getElementById('hour-input');
        const minuteInput = document.getElementById('minute-input');
        
        [hourInput, minuteInput].forEach(input => {
            if (input) {
                input.classList.add('border-red-500');
                setTimeout(() => {
                    input.classList.remove('border-red-500');
                }, 1000);
            }
        });
        
        this.hapticFeedback(200);
    }
    
    nextQuestion() {
        // Hide feedback
        document.getElementById('feedback-section').classList.add('hidden');
        
        this.currentQuestion++;
        this.showQuestion();
    }
    
    formatTime(hour, minute) {
        const h = hour === 0 ? 12 : hour;
        const m = minute.toString().padStart(2, '0');
        return `${h}:${m}`;
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
            game: 'time-clock',
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
        
        // Update game mode radio buttons
        document.querySelector(`input[name="game-mode"][value="${this.settings.gameMode}"]`).checked = true;
        
        // Update checkboxes
        document.getElementById('show-numbers-toggle').checked = this.settings.showNumbers;
        document.getElementById('show-minutes-toggle').checked = this.settings.showMinutes;
    }
}

// Global functions for HTML event handlers
function submitTime() {
    if (window.timeClockGame) {
        window.timeClockGame.submitTime();
    }
}

function checkClockAnswer() {
    if (window.timeClockGame) {
        window.timeClockGame.checkClockAnswer();
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
    if (window.timeClockGame) {
        window.timeClockGame.saveSettings();
        closeSettings();
        
        // Update display immediately
        window.timeClockGame.updateClockDisplay();
        
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
    window.timeClockGame = new MobileTimeClockGame();
});

// Handle page visibility for mobile optimization
document.addEventListener('visibilitychange', () => {
    if (window.timeClockGame) {
        window.timeClockGame.handleVisibilityChange();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileTimeClockGame;
}