/**
 * Mobile Statistics Page
 * Comprehensive game results and progress tracking
 */

class MobileStatistics {
    constructor() {
        this.gameResults = null;
        this.achievements = [];
        
        this.init();
    }
    
    init() {
        console.log('📊 Initializing Mobile Statistics');
        
        // Load the most recent game results
        this.loadGameResults();
        
        // Display statistics
        this.displayResults();
        
        // Check for achievements
        this.checkAchievements();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Animate progress indicators
        setTimeout(() => this.animateProgress(), 500);
    }
    
    loadGameResults() {
        try {
            const allResults = JSON.parse(localStorage.getItem('game-results') || '[]');
            if (allResults.length > 0) {
                this.gameResults = allResults[allResults.length - 1]; // Get most recent
            } else {
                // Fallback for direct navigation
                this.createFallbackResults();
            }
        } catch (error) {
            console.warn('Failed to load game results:', error);
            this.createFallbackResults();
        }
    }
    
    createFallbackResults() {
        // Create default results if none found
        this.gameResults = {
            game: 'arithmetic',
            date: new Date().toISOString(),
            totalQuestions: 10,
            correctAnswers: 0,
            incorrectAnswers: 0,
            totalTime: 0,
            averageTime: 0,
            problems: [],
            settings: { difficulty: 'medium' }
        };
    }
    
    displayResults() {
        if (!this.gameResults) return;
        
        const {
            game,
            totalQuestions,
            correctAnswers,
            incorrectAnswers,
            totalTime,
            averageTime,
            problems,
            settings
        } = this.gameResults;
        
        // Calculate percentage
        const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        // Update performance display
        this.updatePerformanceDisplay(percentage, correctAnswers, totalQuestions);
        
        // Update score displays
        document.getElementById('correct-score').textContent = correctAnswers;
        document.getElementById('incorrect-score').textContent = incorrectAnswers;
        document.getElementById('time-score').textContent = this.formatTime(averageTime);
        document.getElementById('score-percentage').textContent = `${percentage}%`;
        
        // Update game details
        document.getElementById('game-type').textContent = this.formatGameType(game);
        document.getElementById('total-questions').textContent = totalQuestions;
        document.getElementById('difficulty-level').textContent = this.formatDifficulty(settings?.difficulty || 'medium');
        document.getElementById('total-time').textContent = this.formatTime(totalTime);
        
        // Update performance breakdown
        document.getElementById('accuracy-percentage').textContent = `${percentage}%`;
        
        if (problems && problems.length > 0) {
            const times = problems.map(p => p.timeSpent).filter(t => t > 0);
            const firstTryCorrect = problems.filter(p => p.isCorrect && p.attempts === 1).length;
            
            document.getElementById('fastest-time').textContent = times.length > 0 ? this.formatTime(Math.min(...times)) : '-';
            document.getElementById('slowest-time').textContent = times.length > 0 ? this.formatTime(Math.max(...times)) : '-';
            document.getElementById('first-try-correct').textContent = `${firstTryCorrect}/${totalQuestions}`;
        }
        
        // Display incorrect problems for review
        this.displayIncorrectProblems();
    }
    
    updatePerformanceDisplay(percentage, correct, total) {
        const performanceIcon = document.getElementById('performance-icon');
        const performanceTitle = document.getElementById('performance-title');
        const performanceMessage = document.getElementById('performance-message');
        
        if (percentage === 100) {
            performanceIcon.textContent = '🏆';
            performanceTitle.textContent = 'Perfect Score!';
            performanceMessage.textContent = 'Outstanding! You got every question correct!';
            this.showAchievementBanner('🌟 Perfect Score Achievement Unlocked! 🌟');
            this.createCelebration();
        } else if (percentage >= 90) {
            performanceIcon.textContent = '⭐';
            performanceTitle.textContent = 'Excellent Work!';
            performanceMessage.textContent = 'Amazing job! You\'re really getting the hang of this!';
        } else if (percentage >= 80) {
            performanceIcon.textContent = '👏';
            performanceTitle.textContent = 'Great Job!';
            performanceMessage.textContent = 'Well done! You\'re doing really well!';
        } else if (percentage >= 70) {
            performanceIcon.textContent = '👍';
            performanceTitle.textContent = 'Good Work!';
            performanceMessage.textContent = 'Nice effort! Keep practicing to improve!';
        } else if (percentage >= 50) {
            performanceIcon.textContent = '💪';
            performanceTitle.textContent = 'Keep Trying!';
            performanceMessage.textContent = 'You\'re learning! Practice makes perfect!';
        } else {
            performanceIcon.textContent = '🌱';
            performanceTitle.textContent = 'Learning Time!';
            performanceMessage.textContent = 'Every expert was once a beginner. Keep going!';
        }
    }
    
    displayIncorrectProblems() {
        const reviewSection = document.getElementById('review-section');
        const incorrectProblemsContainer = document.getElementById('incorrect-problems');
        
        if (!this.gameResults || !this.gameResults.problems) {
            reviewSection.classList.add('hidden');
            return;
        }
        
        const incorrectProblems = this.gameResults.problems.filter(p => !p.isCorrect);
        
        if (incorrectProblems.length === 0) {
            reviewSection.classList.add('hidden');
            return;
        }
        
        reviewSection.classList.remove('hidden');
        incorrectProblemsContainer.innerHTML = '';
        
        incorrectProblems.forEach((problem, index) => {
            const problemDiv = document.createElement('div');
            problemDiv.className = 'bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in';
            problemDiv.style.animationDelay = `${index * 0.1}s`;
            
            problemDiv.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="text-gray-900 font-semibold">${problem.problem}</div>
                        <div class="text-sm text-gray-600 mt-1">
                            Your answer: <span class="font-medium text-red-600">${problem.userAnswer}</span> • 
                            Correct answer: <span class="font-medium text-green-600">${problem.correctAnswer}</span>
                        </div>
                    </div>
                    <div class="ml-4 text-red-500">
                        <span class="material-icons-round">error</span>
                    </div>
                </div>
            `;
            
            incorrectProblemsContainer.appendChild(problemDiv);
        });
    }
    
    checkAchievements() {
        if (!this.gameResults) return;
        
        const { correctAnswers, totalQuestions, problems, totalTime } = this.gameResults;
        const percentage = (correctAnswers / totalQuestions) * 100;
        
        // Define achievements
        const possibleAchievements = [
            {
                id: 'perfect_score',
                icon: '🏆',
                title: 'Perfect Score',
                description: 'Got 100% correct!',
                condition: percentage === 100
            },
            {
                id: 'speed_demon',
                icon: '⚡',
                title: 'Speed Demon',
                description: 'Averaged under 3 seconds per question',
                condition: this.gameResults.averageTime < 3000
            },
            {
                id: 'first_try_hero',
                icon: '🎯',
                title: 'First Try Hero',
                description: 'Got 5+ questions right on first try',
                condition: problems.filter(p => p.isCorrect && p.attempts === 1).length >= 5
            },
            {
                id: 'persistent',
                icon: '💪',
                title: 'Persistent Learner',
                description: 'Completed all questions',
                condition: totalQuestions === 10
            },
            {
                id: 'excellent',
                icon: '⭐',
                title: 'Excellence',
                description: 'Scored 90% or higher',
                condition: percentage >= 90
            },
            {
                id: 'great_job',
                icon: '👏',
                title: 'Great Job',
                description: 'Scored 80% or higher',
                condition: percentage >= 80
            }
        ];
        
        // Check which achievements are earned
        this.achievements = possibleAchievements.filter(achievement => achievement.condition);
        
        // Display achievements
        this.displayAchievements();
    }
    
    displayAchievements() {
        const achievementsGrid = document.getElementById('achievements-grid');
        achievementsGrid.innerHTML = '';
        
        if (this.achievements.length === 0) {
            achievementsGrid.innerHTML = `
                <div class="col-span-full text-center text-gray-500 py-8">
                    <span class="material-icons-round text-4xl mb-2 opacity-50">emoji_events</span>
                    <p>Keep practicing to earn achievements!</p>
                </div>
            `;
            return;
        }
        
        this.achievements.forEach((achievement, index) => {
            const achievementDiv = document.createElement('div');
            achievementDiv.className = 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-300 rounded-2xl p-4 text-center animate-scale-up achievement-badge';
            achievementDiv.style.animationDelay = `${index * 0.1}s`;
            
            achievementDiv.innerHTML = `
                <div class="text-3xl mb-2">${achievement.icon}</div>
                <div class="font-bold text-yellow-800 text-sm">${achievement.title}</div>
                <div class="text-xs text-yellow-700 mt-1">${achievement.description}</div>
            `;
            
            achievementsGrid.appendChild(achievementDiv);
        });
        
        // Play achievement sound if perfect score
        if (this.achievements.some(a => a.id === 'perfect_score')) {
            setTimeout(() => this.playAchievementSound(), 800);
        }
    }
    
    showAchievementBanner(text) {
        const banner = document.getElementById('achievement-banner');
        banner.innerHTML = `
            <div class="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 text-center shadow-xl animate-bounce-gentle">
                <div class="text-white font-bold text-lg sm:text-xl">${text}</div>
            </div>
        `;
        banner.classList.remove('hidden');
    }
    
    animateProgress() {
        const progressCircle = document.getElementById('progress-circle');
        const scorePercentage = document.getElementById('score-percentage');
        
        if (!this.gameResults) return;
        
        const percentage = (this.gameResults.correctAnswers / this.gameResults.totalQuestions) * 100;
        const circumference = 2 * Math.PI * 56; // radius = 56
        const offset = circumference - (percentage / 100) * circumference;
        
        // Animate the progress ring
        setTimeout(() => {
            progressCircle.style.strokeDashoffset = offset;
        }, 100);
        
        // Animate the percentage counter
        this.animateCounter(scorePercentage, 0, percentage, 1500, '%');
        
        // Animate other counters
        setTimeout(() => {
            this.animateCounter(document.getElementById('correct-score'), 0, this.gameResults.correctAnswers, 1000);
            this.animateCounter(document.getElementById('incorrect-score'), 0, this.gameResults.incorrectAnswers, 1000);
        }, 300);
    }
    
    animateCounter(element, start, end, duration, suffix = '') {
        if (!element) return;
        
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.round(start + (end - start) * progress);
            element.textContent = current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    createCelebration() {
        const container = document.getElementById('celebration-container');
        if (!container) return;
        
        // Create confetti burst for perfect score
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            
            container.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }
    }
    
    playAchievementSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Play a victory fanfare
            const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6
            
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = freq;
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.3);
                }, index * 200);
            });
        } catch (error) {
            console.warn('Achievement sound failed:', error);
        }
    }
    
    setupEventListeners() {
        // Handle page visibility for mobile
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Refresh animations when returning to page
                setTimeout(() => this.animateProgress(), 200);
            }
        });
    }
    
    formatTime(ms) {
        if (!ms || ms === 0) return '0s';
        
        const seconds = Math.round(ms / 1000);
        if (seconds < 60) {
            return `${seconds}s`;
        }
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }
    
    formatGameType(game) {
        const gameTypes = {
            arithmetic: 'Arithmetic',
            'time-clock': 'Time & Clock',
            sequences: 'Number Sequences'
        };
        return gameTypes[game] || 'Math Game';
    }
    
    formatDifficulty(difficulty) {
        const difficulties = {
            easy: 'Easy',
            medium: 'Medium',
            hard: 'Hard'
        };
        return difficulties[difficulty] || 'Medium';
    }
    
    generateShareText() {
        if (!this.gameResults) return 'I played a math game!';
        
        const { game, correctAnswers, totalQuestions } = this.gameResults;
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        const gameType = this.formatGameType(game);
        
        let shareText = `🎮 I just played ${gameType} and scored ${percentage}% (${correctAnswers}/${totalQuestions})!\n\n`;
        
        if (percentage === 100) {
            shareText += '🏆 Perfect Score! ';
        } else if (percentage >= 90) {
            shareText += '⭐ Excellent work! ';
        } else if (percentage >= 80) {
            shareText += '👏 Great job! ';
        }
        
        shareText += '\n#MathGames #Learning #Education';
        
        return shareText;
    }
}

// Global functions for HTML event handlers
function playAgain() {
    if (window.mobileStats && window.mobileStats.gameResults) {
        const gameType = window.mobileStats.gameResults.game;
        
        // Navigate to appropriate game
        if (gameType === 'arithmetic') {
            window.location.href = 'arithmetic.html';
        } else if (gameType === 'time-clock') {
            window.location.href = 'time-clock.html';
        } else if (gameType === 'sequences') {
            window.location.href = 'sequences.html';
        } else {
            window.location.href = 'index.html';
        }
    } else {
        window.location.href = 'index.html';
    }
}

function goHome() {
    window.location.href = 'index.html';
}

function shareResults() {
    const modal = document.getElementById('share-modal');
    const shareContent = document.getElementById('share-content');
    
    if (window.mobileStats) {
        shareContent.textContent = window.mobileStats.generateShareText();
    }
    
    if (modal) {
        modal.classList.remove('opacity-0', 'invisible');
        document.body.style.overflow = 'hidden';
    }
}

function closeShare() {
    const modal = document.getElementById('share-modal');
    if (modal) {
        modal.classList.add('opacity-0', 'invisible');
        document.body.style.overflow = '';
    }
}

async function copyResults() {
    try {
        const shareContent = document.getElementById('share-content');
        if (shareContent && navigator.clipboard) {
            await navigator.clipboard.writeText(shareContent.textContent);
            
            // Show success feedback
            const button = event.target;
            const originalText = button.innerHTML;
            button.innerHTML = '<span class="material-icons-round text-sm mr-2">check</span>Copied!';
            button.classList.add('bg-green-600', 'hover:bg-green-700');
            button.classList.remove('bg-primary-600', 'hover:bg-primary-700');
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('bg-green-600', 'hover:bg-green-700');
                button.classList.add('bg-primary-600', 'hover:bg-primary-700');
                closeShare();
            }, 1500);
        }
    } catch (error) {
        console.warn('Failed to copy to clipboard:', error);
        
        // Fallback for older browsers
        const shareContent = document.getElementById('share-content');
        if (shareContent) {
            shareContent.select();
            document.execCommand('copy');
        }
    }
}

// Initialize statistics when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.mobileStats = new MobileStatistics();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileStatistics;
}