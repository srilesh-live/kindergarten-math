class StatisticsPage {
    constructor() {
        this.gameData = null;
        this.init();
    }

    init() {
        this.loadGameData();
        this.displayStatistics();
        this.setupEventListeners();
    }

    loadGameData() {
        // Get game data from localStorage
        const savedData = localStorage.getItem('gameStatistics');
        if (savedData) {
            this.gameData = JSON.parse(savedData);
        } else {
            // Fallback data if no statistics found
            this.gameData = {
                gameType: 'Unknown Game',
                totalQuestions: 10,
                correctAnswers: 0,
                incorrectAnswers: 10,
                totalTime: 0,
                averageTime: 0,
                incorrectProblems: []
            };
        }
    }

    displayStatistics() {
        if (!this.gameData) return;

        // Update game title
        document.getElementById('game-title').textContent = `Great job on your ${this.gameData.gameType} practice!`;

        // Update statistics
        document.getElementById('stats-total').textContent = this.gameData.totalQuestions;
        document.getElementById('stats-correct').textContent = this.gameData.correctAnswers;
        
        const accuracy = Math.round((this.gameData.correctAnswers / this.gameData.totalQuestions) * 100);
        document.getElementById('stats-accuracy').textContent = `${accuracy}%`;

        // Format and display time
        const minutes = Math.floor(this.gameData.totalTime / 60);
        const seconds = this.gameData.totalTime % 60;
        document.getElementById('stats-time').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Update performance message
        this.updatePerformanceMessage(accuracy);

        // Show incorrect problems or perfect score
        if (this.gameData.incorrectProblems && this.gameData.incorrectProblems.length > 0) {
            this.displayIncorrectProblems();
            document.getElementById('incorrect-section').classList.remove('hidden');
            document.getElementById('perfect-score').classList.add('hidden');
            // Show performance section for non-perfect scores
            document.getElementById('performance-section').classList.remove('hidden');
        } else {
            document.getElementById('incorrect-section').classList.add('hidden');
            document.getElementById('perfect-score').classList.remove('hidden');
            // Hide performance section when showing perfect score section
            document.getElementById('performance-section').classList.add('hidden');
        }
    }

    updatePerformanceMessage(accuracy) {
        const performanceIcon = document.getElementById('performance-icon');
        const performanceTitle = document.getElementById('performance-title');
        const performanceMessage = document.getElementById('performance-message');
        const performanceCard = document.getElementById('performance-card');

        if (accuracy === 100) {
            performanceIcon.textContent = 'emoji_events';
            performanceTitle.textContent = 'Perfect Score!';
            performanceMessage.textContent = 'Outstanding work! You answered every question correctly!';
            performanceCard.className = performanceCard.className.replace(/bg-app-surface\/50/, 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30');
        } else if (accuracy >= 90) {
            performanceIcon.textContent = 'star';
            performanceTitle.textContent = 'Excellent!';
            performanceMessage.textContent = 'Great job! You\'re doing fantastic!';
            performanceCard.className = performanceCard.className.replace(/bg-app-surface\/50/, 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30');
        } else if (accuracy >= 80) {
            performanceIcon.textContent = 'thumb_up';
            performanceTitle.textContent = 'Good Job!';
            performanceMessage.textContent = 'Nice work! Keep practicing to improve even more!';
        } else if (accuracy >= 60) {
            performanceIcon.textContent = 'trending_up';
            performanceTitle.textContent = 'Keep Going!';
            performanceMessage.textContent = 'You\'re making progress! Practice makes perfect!';
        } else {
            performanceIcon.textContent = 'school';
            performanceTitle.textContent = 'Keep Learning!';
            performanceMessage.textContent = 'Every mistake is a chance to learn. Try again!';
        }
    }

    displayIncorrectProblems() {
        const incorrectList = document.getElementById('incorrect-list');
        incorrectList.innerHTML = '';

        this.gameData.incorrectProblems.forEach((problem, index) => {
            const problemDiv = document.createElement('div');
            problemDiv.className = 'bg-app-bg/50 border border-red-500/30 rounded-xl p-4';
            
            let problemHTML = '';
            
            if (this.gameData.gameType === 'Time & Clock') {
                problemHTML = `
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <div class="text-app-text font-medium mb-1">Question ${index + 1}:</div>
                            <div class="text-app-text-muted text-sm">${problem.question}</div>
                        </div>
                        <div class="text-right ml-4">
                            <div class="text-red-400 text-sm mb-1">Your answer: ${problem.userAnswer}</div>
                            <div class="text-green-400 text-sm">Correct: ${problem.correctAnswer}</div>
                        </div>
                    </div>
                `;
            } else if (this.gameData.gameType === 'Number Sequences') {
                problemHTML = `
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <div class="text-app-text font-medium mb-1">Question ${index + 1}:</div>
                            <div class="text-app-text-muted text-sm">${problem.question}</div>
                        </div>
                        <div class="text-right ml-4">
                            <div class="text-red-400 text-sm mb-1">Your answer: ${problem.userAnswer}</div>
                            <div class="text-green-400 text-sm">Correct: ${problem.correctAnswer}</div>
                        </div>
                    </div>
                `;
            } else {
                // Default format for other game types
                problemHTML = `
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <div class="text-app-text font-medium mb-1">${problem.question || 'Question ' + (index + 1)}</div>
                        </div>
                        <div class="text-right ml-4">
                            <div class="text-red-400 text-sm mb-1">Your answer: ${problem.userAnswer}</div>
                            <div class="text-green-400 text-sm">Correct: ${problem.correctAnswer}</div>
                        </div>
                    </div>
                `;
            }
            
            problemDiv.innerHTML = problemHTML;
            incorrectList.appendChild(problemDiv);
        });
    }

    setupEventListeners() {
        // Practice Again button
        document.getElementById('practice-again-btn').addEventListener('click', () => {
            this.practiceAgain();
        });

        // Home button
        document.getElementById('home-btn').addEventListener('click', () => {
            this.goHome();
        });
    }

    practiceAgain() {
        // Clear the statistics data
        localStorage.removeItem('gameStatistics');
        
        // Navigate back to the appropriate game based on game type
        if (this.gameData.gameType === 'Time & Clock') {
            window.location.href = 'time-clock.html';
        } else if (this.gameData.gameType === 'Arithmetic') {
            window.location.href = 'arithmetic.html';
        } else if (this.gameData.gameType === 'Number Sequences') {
            window.location.href = 'number-sequences.html';
        } else {
            // Default to home if game type is unknown
            window.location.href = 'home.html';
        }
    }

    goHome() {
        // Clear the statistics data
        localStorage.removeItem('gameStatistics');
        window.location.href = 'home.html';
    }
}

// Initialize the statistics page when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StatisticsPage();
});