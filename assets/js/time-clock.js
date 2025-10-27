// Time & Clock Game Logic
class TimeClockGame {
    constructor() {
        this.currentQuestion = null;
        this.currentQuestionIndex = 0;
        this.totalQuestions = 10;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.startTime = null;
        this.isPaused = false;
        this.incorrectProblems = [];
        this.questionStartTime = null;
        this.isDragging = false;
        this.dragType = null;
        
        // Settings
        this.settings = {
            soundEnabled: true,
            timeFormat: 'half-hour', // 'hour', 'half-hour', 'quarter', 'five-minute', 'minute'
            minHour: 1,
            maxHour: 12,
            exerciseType: 'read-analog', // 'read-analog', 'set-analog', 'digital-analog', 'mixed'
            clockDifficulty: 'easy' // 'easy', 'medium', 'hard'
        };
        
        // Audio context for sounds
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
        
        // Exercise type selection
        document.querySelectorAll('.exercise-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectExerciseType(e.currentTarget));
        });
        
        // Exit modal
        document.getElementById('exit-btn').addEventListener('click', () => this.showExitModal());
        document.getElementById('exit-cancel-btn').addEventListener('click', () => this.hideExitModal());
        document.getElementById('exit-confirm-btn').addEventListener('click', () => this.exitGame());
        
        // Play/Pause
        document.getElementById('play-pause-btn').addEventListener('click', () => this.togglePause());
        
        // Multiple choice buttons
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleMultipleChoice(e.currentTarget));
        });
        
        // Time input
        document.getElementById('submit-time-btn').addEventListener('click', () => this.handleTimeInput());
        document.getElementById('hour-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleTimeInput();
        });
        document.getElementById('minute-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleTimeInput();
        });
        
        // Clock setting
        document.getElementById('submit-clock-btn').addEventListener('click', () => this.handleClockSetting());
        
        // Clock hand dragging
        this.setupClockDragging();
        
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
    
    updateClockDifficulty() {
        const difficulty = this.settings.clockDifficulty;
        const majorNumbers = document.getElementById('major-numbers');
        const minorNumbers = document.getElementById('minor-numbers');
        const minuteMarkers = document.getElementById('minute-markers');
        
        switch (difficulty) {
            case 'easy':
                // Show all numbers, hide markers
                majorNumbers.style.display = '';
                minorNumbers.style.display = '';
                minuteMarkers.style.display = 'none';
                break;
            case 'medium':
                // Show only major numbers (12, 3, 6, 9), hide markers
                majorNumbers.style.display = '';
                minorNumbers.style.display = 'none';
                minuteMarkers.style.display = 'none';
                break;
            case 'hard':
                // Hide all numbers, show only 5-minute markers
                majorNumbers.style.display = 'none';
                minorNumbers.style.display = 'none';
                minuteMarkers.style.display = '';
                break;
        }
    }
    
    setupClockDragging() {
        const hourHand = document.getElementById('hour-hand');
        const minuteHand = document.getElementById('minute-hand');
        const clock = document.getElementById('analog-clock');
        
        // Mouse events
        hourHand.addEventListener('mousedown', (e) => this.startDrag(e, 'hour'));
        minuteHand.addEventListener('mousedown', (e) => this.startDrag(e, 'minute'));
        
        document.addEventListener('mousemove', (e) => this.onDrag(e));
        document.addEventListener('mouseup', () => this.endDrag());
        
        // Touch events for mobile
        hourHand.addEventListener('touchstart', (e) => this.startDrag(e, 'hour'));
        minuteHand.addEventListener('touchstart', (e) => this.startDrag(e, 'minute'));
        
        document.addEventListener('touchmove', (e) => this.onDrag(e));
        document.addEventListener('touchend', () => this.endDrag());
    }
    
    startDrag(e, handType) {
        if (this.settings.exerciseType !== 'set-analog' && this.currentQuestion?.type !== 'set-analog') return;
        
        e.preventDefault();
        this.isDragging = true;
        this.dragType = handType;
        
        const hand = document.getElementById(`${handType}-hand`);
        hand.style.cursor = 'grabbing';
    }
    
    onDrag(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        const clock = document.getElementById('analog-clock');
        const rect = clock.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        const angle = Math.atan2(clientY - centerY, clientX - centerX);
        let degrees = (angle * 180 / Math.PI + 90) % 360;
        if (degrees < 0) degrees += 360;
        
        const hand = document.getElementById(`${this.dragType}-hand`);
        hand.style.transform = `rotate(${degrees}deg)`;
        
        // Store the angle for checking
        if (this.dragType === 'hour') {
            this.currentHourAngle = degrees;
        } else {
            this.currentMinuteAngle = degrees;
        }
    }
    
    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        const hand = document.getElementById(`${this.dragType}-hand`);
        hand.style.cursor = 'grab';
        this.dragType = null;
    }
    
    generateTime() {
        const minHour = this.settings.minHour;
        const maxHour = this.settings.maxHour;
        
        let hour = minHour + Math.floor(Math.random() * (maxHour - minHour + 1));
        let minute = 0;
        
        switch (this.settings.timeFormat) {
            case 'hour':
                minute = 0;
                break;
            case 'half-hour':
                minute = Math.random() < 0.5 ? 0 : 30;
                break;
            case 'quarter':
                const quarters = [0, 15, 30, 45];
                minute = quarters[Math.floor(Math.random() * quarters.length)];
                break;
            case 'five-minute':
                minute = Math.floor(Math.random() * 12) * 5;
                break;
            case 'minute':
                minute = Math.floor(Math.random() * 60);
                break;
        }
        
        return { hour, minute };
    }
    
    generateQuestion() {
        let exerciseType = this.settings.exerciseType;
        if (exerciseType === 'mixed') {
            const types = ['read-analog', 'set-analog', 'digital-analog'];
            exerciseType = types[Math.floor(Math.random() * types.length)];
        }
        
        const time = this.generateTime();
        
        const question = {
            type: exerciseType,
            correctTime: time,
            choices: []
        };
        
        if (exerciseType === 'read-analog' || exerciseType === 'digital-analog') {
            question.choices = this.generateChoices(time);
        }
        
        return question;
    }
    
    generateChoices(correctTime) {
        const choices = [this.formatTime(correctTime)];
        
        // Generate 3 wrong choices
        while (choices.length < 4) {
            const wrongTime = this.generateTime();
            const formattedTime = this.formatTime(wrongTime);
            
            if (!choices.includes(formattedTime)) {
                choices.push(formattedTime);
            }
        }
        
        // Shuffle choices
        for (let i = choices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [choices[i], choices[j]] = [choices[j], choices[i]];
        }
        
        return choices;
    }
    
    formatTime(time) {
        const hour = time.hour;
        const minute = time.minute.toString().padStart(2, '0');
        return `${hour}:${minute}`;
    }
    
    displayQuestion() {
        const question = this.currentQuestion;
        
        // Hide all sections first
        document.getElementById('multiple-choice-section').classList.add('hidden');
        document.getElementById('time-input-section').classList.add('hidden');
        document.getElementById('clock-setting-section').classList.add('hidden');
        document.getElementById('digital-time-display').classList.add('hidden');
        
        // Reset choice buttons
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.classList.remove('border-green-500', 'bg-green-500/20', 'border-red-500', 'bg-red-500/20');
            btn.classList.add('border-app-border');
            btn.disabled = false;
        });
        
        switch (question.type) {
            case 'read-analog':
                this.displayAnalogClock(question.correctTime);
                this.showMultipleChoice(question.choices);
                document.getElementById('question-title').textContent = 'What time is shown?';
                break;
                
            case 'set-analog':
                document.getElementById('question-title').textContent = `Set the clock to ${this.formatTime(question.correctTime)}`;
                this.showClockSetting();
                this.resetClockHands();
                break;
                
            case 'digital-analog':
                document.getElementById('question-title').textContent = 'Which clock shows this time?';
                this.showDigitalTime(question.correctTime);
                this.showMultipleChoiceClocks(question.choices);
                break;
        }
    }
    
    displayAnalogClock(time) {
        const hourAngle = ((time.hour % 12) * 30) + (time.minute * 0.5); // 30 degrees per hour + minute adjustment
        const minuteAngle = time.minute * 6; // 6 degrees per minute
        
        document.getElementById('hour-hand').style.transform = `rotate(${hourAngle}deg)`;
        document.getElementById('minute-hand').style.transform = `rotate(${minuteAngle}deg)`;
    }
    
    resetClockHands() {
        document.getElementById('hour-hand').style.transform = 'rotate(0deg)';
        document.getElementById('minute-hand').style.transform = 'rotate(0deg)';
        this.currentHourAngle = 0;
        this.currentMinuteAngle = 0;
    }
    
    showMultipleChoice(choices) {
        document.getElementById('multiple-choice-section').classList.remove('hidden');
        const buttons = document.querySelectorAll('.choice-btn span');
        buttons.forEach((span, index) => {
            span.textContent = choices[index] || '';
        });
    }
    
    showMultipleChoiceClocks(choices) {
        // For now, show as text choices - could be enhanced to show mini clocks
        this.showMultipleChoice(choices);
    }
    
    showDigitalTime(time) {
        document.getElementById('digital-time-display').classList.remove('hidden');
        document.getElementById('digital-time').textContent = this.formatTime(time);
    }
    
    showTimeInput() {
        document.getElementById('time-input-section').classList.remove('hidden');
        document.getElementById('hour-input').value = '';
        document.getElementById('minute-input').value = '';
        document.getElementById('hour-input').focus();
    }
    
    showClockSetting() {
        document.getElementById('clock-setting-section').classList.remove('hidden');
        // Enable hand dragging
        const hourHand = document.getElementById('hour-hand');
        const minuteHand = document.getElementById('minute-hand');
        hourHand.style.cursor = 'grab';
        minuteHand.style.cursor = 'grab';
    }
    
    handleMultipleChoice(button) {
        const selectedText = button.querySelector('span').textContent;
        const correctText = this.formatTime(this.currentQuestion.correctTime);
        
        document.querySelectorAll('.choice-btn').forEach(btn => btn.disabled = true);
        
        if (selectedText === correctText) {
            button.classList.remove('border-app-border');
            button.classList.add('border-green-500', 'bg-green-500/20');
            this.handleCorrectAnswer();
        } else {
            button.classList.remove('border-app-border');
            button.classList.add('border-red-500', 'bg-red-500/20');
            
            // Highlight correct answer
            document.querySelectorAll('.choice-btn').forEach(btn => {
                if (btn.querySelector('span').textContent === correctText) {
                    btn.classList.remove('border-app-border');
                    btn.classList.add('border-green-500', 'bg-green-500/20');
                }
            });
            
            this.handleIncorrectAnswer(selectedText);
        }
    }
    
    handleTimeInput() {
        const hourInput = document.getElementById('hour-input').value;
        const minuteInput = document.getElementById('minute-input').value;
        
        if (!hourInput || !minuteInput) return;
        
        const userTime = {
            hour: parseInt(hourInput),
            minute: parseInt(minuteInput)
        };
        
        const correctTime = this.currentQuestion.correctTime;
        
        if (userTime.hour === correctTime.hour && userTime.minute === correctTime.minute) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer(this.formatTime(userTime));
        }
    }
    
    handleClockSetting() {
        const hourAngle = this.currentHourAngle || 0;
        const minuteAngle = this.currentMinuteAngle || 0;
        
        // Convert angles back to time
        const userHour = Math.round((hourAngle / 30) % 12) || 12;
        const userMinute = Math.round(minuteAngle / 6) % 60;
        
        const correctTime = this.currentQuestion.correctTime;
        
        // Allow some tolerance for hand placement (±15 minutes for minute hand, ±30 minutes for hour hand)
        const minuteTolerance = 15;
        const hourTolerance = 0.5; // Half hour tolerance for hour hand
        
        const minuteCorrect = Math.abs(userMinute - correctTime.minute) <= minuteTolerance ||
                             Math.abs(userMinute - correctTime.minute) >= (60 - minuteTolerance);
        
        let adjustedUserHour = userHour;
        if (userHour === 12) adjustedUserHour = 0;
        let adjustedCorrectHour = correctTime.hour;
        if (correctTime.hour === 12) adjustedCorrectHour = 0;
        
        const hourCorrect = Math.abs(adjustedUserHour - adjustedCorrectHour) <= hourTolerance;
        
        if (hourCorrect && minuteCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer(`${userHour}:${userMinute.toString().padStart(2, '0')}`);
        }
    }
    
    handleCorrectAnswer() {
        this.playBeep(880, 300, 'success');
        this.correctAnswers++;
        this.updateScore();
        
        setTimeout(() => {
            this.nextQuestion();
        }, 1500);
    }
    
    handleIncorrectAnswer(userAnswer) {
        this.playBeep(440, 400, 'error');
        this.incorrectAnswers++;
        
        // Track incorrect answer
        this.incorrectProblems.push({
            type: this.currentQuestion.type,
            correctTime: this.currentQuestion.correctTime,
            correctAnswer: this.formatTime(this.currentQuestion.correctTime),
            userAnswer: userAnswer,
            questionIndex: this.currentQuestionIndex
        });
        
        this.updateScore();
        
        setTimeout(() => {
            this.nextQuestion();
        }, 2500);
    }
    
    nextQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex >= this.totalQuestions) {
            this.endGame();
        } else {
            this.currentQuestion = this.generateQuestion();
            this.displayQuestion();
            this.updateProgress();
            this.questionStartTime = Date.now();
        }
    }
    
    updateScore() {
        document.getElementById('correct-count').textContent = this.correctAnswers;
        document.getElementById('incorrect-count').textContent = this.incorrectAnswers;
    }
    
    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = `${this.currentQuestionIndex + 1} of ${this.totalQuestions}`;
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
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.incorrectProblems = [];
        this.startTime = Date.now();
        this.questionStartTime = Date.now();
        this.isPaused = false;
        
        // Hide statistics modal if open
        this.closeStatistics();
        
        // Update clock display based on difficulty
        this.updateClockDifficulty();
        
        // Reset UI
        this.updateScore();
        this.updateProgress();
        
        // Start timer
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        
        // Generate first question
        this.currentQuestion = this.generateQuestion();
        this.displayQuestion();
        
        // Update play/pause button
        document.getElementById('play-pause-icon').textContent = 'pause';
    }
    
    endGame() {
        clearInterval(this.timerInterval);
        
        const totalTime = Math.floor((Date.now() - this.startTime) / 1000);
        const avgTime = Math.floor(totalTime / this.totalQuestions);
        const accuracy = Math.round((this.correctAnswers / this.totalQuestions) * 100);

        // Prepare statistics data
        const statisticsData = {
            gameType: 'Time & Clock',
            totalQuestions: this.totalQuestions,
            correctAnswers: this.correctAnswers,
            incorrectAnswers: this.incorrectAnswers,
            totalTime: totalTime,
            averageTime: avgTime,
            accuracy: accuracy,
            incorrectProblems: this.incorrectProblems
        };

        // Save statistics to localStorage
        localStorage.setItem('gameStatistics', JSON.stringify(statisticsData));

        // Navigate to statistics page
        window.location.href = 'statistics.html';
    }
    
    displayIncorrectAnswers() {
        const incorrectList = document.getElementById('incorrect-list');
        incorrectList.innerHTML = '';
        
        this.incorrectProblems.forEach((problem, index) => {
            const div = document.createElement('div');
            div.className = 'bg-app-bg rounded-xl p-4 border border-red-500/30';
            
            const typeLabel = {
                'read-analog': 'Read Clock',
                'set-analog': 'Set Clock',
                'digital-analog': 'Digital to Analog'
            }[problem.type] || problem.type;
            
            div.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <span class="text-app-text font-medium">Question ${problem.questionIndex + 1}</span>
                    <span class="text-xs text-app-text-muted px-2 py-1 bg-app-surface rounded">${typeLabel}</span>
                </div>
                <div class="text-sm text-app-text-muted mb-1">Your answer: <span class="text-red-400">${problem.userAnswer}</span></div>
                <div class="text-sm text-green-400">Correct answer: ${problem.correctAnswer}</div>
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
        document.getElementById('time-format').value = this.settings.timeFormat;
        document.getElementById('min-hour').value = this.settings.minHour;
        document.getElementById('max-hour').value = this.settings.maxHour;
        
        // Set clock difficulty radio button
        document.querySelector(`input[name="clock-difficulty"][value="${this.settings.clockDifficulty}"]`).checked = true;
        
        // Update exercise type selection
        document.querySelectorAll('.exercise-type-btn').forEach(btn => {
            btn.classList.remove('active', 'border-purple-500');
            btn.classList.add('border-app-border');
            btn.querySelector('h4').classList.remove('text-purple-400');
            btn.querySelector('h4').classList.add('text-app-text-muted');
            
            if (btn.dataset.type === this.settings.exerciseType) {
                btn.classList.add('active', 'border-purple-500');
                btn.classList.remove('border-app-border');
                btn.querySelector('h4').classList.add('text-purple-400');
                btn.querySelector('h4').classList.remove('text-app-text-muted');
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
    
    selectExerciseType(btn) {
        document.querySelectorAll('.exercise-type-btn').forEach(b => {
            b.classList.remove('active', 'border-purple-500');
            b.classList.add('border-app-border');
            b.querySelector('h4').classList.remove('text-purple-400');
            b.querySelector('h4').classList.add('text-app-text-muted');
        });
        
        btn.classList.add('active', 'border-purple-500');
        btn.classList.remove('border-app-border');
        btn.querySelector('h4').classList.add('text-purple-400');
        btn.querySelector('h4').classList.remove('text-app-text-muted');
    }
    
    saveSettings() {
        // Get values from form
        this.totalQuestions = parseInt(document.getElementById('total-questions').value);
        this.settings.timeFormat = document.getElementById('time-format').value;
        this.settings.minHour = parseInt(document.getElementById('min-hour').value);
        this.settings.maxHour = parseInt(document.getElementById('max-hour').value);
        
        // Get clock difficulty
        const clockDifficulty = document.querySelector('input[name="clock-difficulty"]:checked');
        if (clockDifficulty) {
            this.settings.clockDifficulty = clockDifficulty.value;
        }
        
        // Get selected exercise type
        const activeType = document.querySelector('.exercise-type-btn.active');
        if (activeType) {
            this.settings.exerciseType = activeType.dataset.type;
        }
        
        // Update clock display immediately
        this.updateClockDifficulty();
        
        // Save to localStorage
        localStorage.setItem('timeClockGameSettings', JSON.stringify(this.settings));
        
        this.closeSettings();
    }
    
    loadSettings() {
        const saved = localStorage.getItem('timeClockGameSettings');
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
    window.timeClockGame = new TimeClockGame();
});

// Handle page visibility change to pause/resume
document.addEventListener('visibilitychange', () => {
    if (window.timeClockGame) {
        if (document.hidden && !window.timeClockGame.isPaused) {
            window.timeClockGame.togglePause();
        }
    }
});