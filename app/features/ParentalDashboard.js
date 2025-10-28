/**
 * Parental Dashboard
 * Comprehensive analytics and progress tracking for parents
 * Displays charts, statistics, and insights across all children
 */

export default class ParentalDashboard {
    constructor(userManager) {
        this.userManager = userManager;
    }
    
    /**
     * Generate dashboard HTML
     */
    getDashboardHTML() {
        const user = this.userManager.currentUser;
        if (!user || this.userManager.isGuest) {
            return this.getGuestMessage();
        }
        
        const stats = user.getStats();
        const children = this.getChildrenData();
        
        return `
            <div class="parental-dashboard">
                <header class="dashboard-header">
                    <h1>📊 Parental Dashboard</h1>
                    <p class="dashboard-subtitle">Monitor your child's learning progress</p>
                </header>
                
                <div class="dashboard-grid">
                    <!-- Overview Cards -->
                    <div class="dashboard-section">
                        <h2 class="section-title">📈 Overview</h2>
                        <div class="stat-cards-grid">
                            ${this.getOverviewCards(stats)}
                        </div>
                    </div>
                    
                    <!-- Performance Chart -->
                    <div class="dashboard-section dashboard-section--full">
                        <h2 class="section-title">📊 Accuracy Trends</h2>
                        <div class="chart-container">
                            ${this.getAccuracyChart(stats)}
                        </div>
                    </div>
                    
                    <!-- Game Breakdown -->
                    <div class="dashboard-section">
                        <h2 class="section-title">🎮 Game Performance</h2>
                        <div class="game-breakdown">
                            ${this.getGameBreakdown(stats)}
                        </div>
                    </div>
                    
                    <!-- Recent Sessions -->
                    <div class="dashboard-section">
                        <h2 class="section-title">📝 Recent Sessions</h2>
                        <div class="session-history">
                            ${this.getSessionHistory(stats)}
                        </div>
                    </div>
                    
                    <!-- Achievements Progress -->
                    <div class="dashboard-section dashboard-section--full">
                        <h2 class="section-title">🏆 Achievements Progress</h2>
                        <div class="achievements-grid">
                            ${this.getAchievementsProgress(stats)}
                        </div>
                    </div>
                    
                    <!-- Learning Insights -->
                    <div class="dashboard-section dashboard-section--full">
                        <h2 class="section-title">💡 Learning Insights</h2>
                        <div class="insights-container">
                            ${this.getLearningInsights(stats)}
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="dashboard-section dashboard-section--full">
                        <div class="dashboard-actions">
                            <button class="km-button km-button--secondary" id="exportReportBtn">
                                📥 Export Report
                            </button>
                            <button class="km-button km-button--secondary" id="printReportBtn">
                                🖨️ Print Report
                            </button>
                            <button class="km-button km-button--secondary" id="shareReportBtn">
                                📤 Share Progress
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Get guest user message
     */
    getGuestMessage() {
        return `
            <div class="dashboard-empty">
                <div class="empty-state">
                    <div class="empty-icon">👤</div>
                    <h2>Sign In Required</h2>
                    <p>Create an account to track progress and view detailed analytics.</p>
                    <button class="km-button km-button--primary" id="signInFromDashboard">
                        Sign In
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Get overview stat cards
     */
    getOverviewCards(stats) {
        const totalQuestions = stats.totalQuestionsAnswered || 0;
        const accuracy = totalQuestions > 0 
            ? Math.round((stats.totalCorrectAnswers / totalQuestions) * 100) 
            : 0;
        const streak = stats.longestStreak || 0;
        const sessions = Object.values(stats.gameSessions || {}).reduce((a, b) => a + b, 0);
        
        return `
            <div class="stat-card">
                <div class="stat-icon">📝</div>
                <div class="stat-content">
                    <div class="stat-value">${totalQuestions}</div>
                    <div class="stat-label">Questions Answered</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🎯</div>
                <div class="stat-content">
                    <div class="stat-value">${accuracy}%</div>
                    <div class="stat-label">Overall Accuracy</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🔥</div>
                <div class="stat-content">
                    <div class="stat-value">${streak}</div>
                    <div class="stat-label">Longest Streak</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🎮</div>
                <div class="stat-content">
                    <div class="stat-value">${sessions}</div>
                    <div class="stat-label">Total Sessions</div>
                </div>
            </div>
        `;
    }
    
    /**
     * Get accuracy chart (simple CSS bar chart)
     */
    getAccuracyChart(stats) {
        // Generate mock weekly data (in real app, would track actual daily performance)
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const data = this.generateWeeklyData(stats);
        
        const maxValue = Math.max(...data, 1);
        const bars = days.map((day, i) => {
            const value = data[i];
            const height = (value / maxValue) * 100;
            const color = value >= 80 ? '#06ffa5' : value >= 60 ? '#feca57' : '#ff6b6b';
            
            return `
                <div class="chart-bar">
                    <div class="chart-bar-fill" style="height: ${height}%; background: ${color};">
                        <span class="chart-bar-value">${value}%</span>
                    </div>
                    <div class="chart-bar-label">${day}</div>
                </div>
            `;
        }).join('');
        
        return `
            <div class="bar-chart">
                ${bars}
            </div>
        `;
    }
    
    /**
     * Generate weekly performance data
     */
    generateWeeklyData(stats) {
        // In real app, would pull from session history
        // For now, generate based on overall accuracy with some variation
        const baseAccuracy = stats.totalQuestionsAnswered > 0
            ? Math.round((stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100)
            : 0;
        
        return Array.from({ length: 7 }, () => {
            const variation = Math.floor(Math.random() * 20) - 10;
            return Math.max(0, Math.min(100, baseAccuracy + variation));
        });
    }
    
    /**
     * Get game breakdown
     */
    getGameBreakdown(stats) {
        const games = [
            { id: 'basic-arithmetic', name: 'Basic Arithmetic', icon: '🔢' },
            { id: 'number-sequences', name: 'Number Sequences', icon: '🔢' },
            { id: 'time-clock', name: 'Time & Clock', icon: '🕐' },
            { id: 'money-math', name: 'Money Math', icon: '💰' }
        ];
        
        const gameSessions = stats.gameSessions || {};
        const totalSessions = Object.values(gameSessions).reduce((a, b) => a + b, 0) || 1;
        
        return games.map(game => {
            const sessions = gameSessions[game.id] || 0;
            const percentage = Math.round((sessions / totalSessions) * 100);
            
            return `
                <div class="game-stat">
                    <div class="game-stat-header">
                        <span class="game-stat-icon">${game.icon}</span>
                        <span class="game-stat-name">${game.name}</span>
                    </div>
                    <div class="game-stat-bar">
                        <div class="game-stat-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="game-stat-info">
                        <span>${sessions} sessions</span>
                        <span>${percentage}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Get session history
     */
    getSessionHistory(stats) {
        // Mock recent sessions (in real app, would pull from database)
        const sessions = this.generateMockSessions(stats);
        
        if (sessions.length === 0) {
            return '<p class="empty-message">No sessions yet. Start playing to see history!</p>';
        }
        
        return sessions.map(session => `
            <div class="session-item">
                <div class="session-icon">${session.icon}</div>
                <div class="session-info">
                    <div class="session-game">${session.game}</div>
                    <div class="session-date">${session.date}</div>
                </div>
                <div class="session-stats">
                    <div class="session-accuracy ${session.accuracy >= 80 ? 'high' : session.accuracy >= 60 ? 'medium' : 'low'}">
                        ${session.accuracy}%
                    </div>
                    <div class="session-questions">${session.questions} questions</div>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Generate mock session data
     */
    generateMockSessions(stats) {
        const games = [
            { id: 'basic-arithmetic', name: 'Basic Arithmetic', icon: '🔢' },
            { id: 'number-sequences', name: 'Number Sequences', icon: '🔢' },
            { id: 'time-clock', name: 'Time & Clock', icon: '🕐' },
            { id: 'money-math', name: 'Money Math', icon: '💰' }
        ];
        
        const totalSessions = Object.values(stats.gameSessions || {}).reduce((a, b) => a + b, 0);
        if (totalSessions === 0) return [];
        
        // Generate up to 5 recent sessions
        return Array.from({ length: Math.min(5, totalSessions) }, (_, i) => {
            const game = games[Math.floor(Math.random() * games.length)];
            const daysAgo = i;
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            
            return {
                game: game.name,
                icon: game.icon,
                date: this.formatDate(date),
                accuracy: Math.floor(Math.random() * 40) + 60, // 60-100%
                questions: Math.floor(Math.random() * 11) + 10 // 10-20
            };
        });
    }
    
    /**
     * Format date for display
     */
    formatDate(date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }
    
    /**
     * Get achievements progress
     */
    getAchievementsProgress(stats) {
        const achievements = [
            { name: 'First Steps', icon: '👣', unlocked: stats.totalQuestionsAnswered >= 1 },
            { name: 'Streak Master', icon: '🔥', unlocked: stats.longestStreak >= 10 },
            { name: 'Century Club', icon: '💯', unlocked: stats.totalQuestionsAnswered >= 100 },
            { name: 'Perfect Score', icon: '⭐', unlocked: stats.perfectSessions >= 1 },
            { name: 'Speed Demon', icon: '⚡', unlocked: (stats.fastAnswers || 0) >= 10 },
            { name: 'All-Rounder', icon: '🎮', unlocked: Object.keys(stats.gameSessions || {}).length >= 4 }
        ];
        
        return achievements.map(achievement => `
            <div class="achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                ${achievement.unlocked ? '<div class="achievement-check">✓</div>' : ''}
            </div>
        `).join('');
    }
    
    /**
     * Get learning insights
     */
    getLearningInsights(stats) {
        const insights = [];
        const totalQuestions = stats.totalQuestionsAnswered || 0;
        const accuracy = totalQuestions > 0 
            ? Math.round((stats.totalCorrectAnswers / totalQuestions) * 100) 
            : 0;
        
        // Accuracy insight
        if (accuracy >= 80) {
            insights.push({
                type: 'success',
                icon: '🌟',
                title: 'Excellent Performance!',
                message: `${accuracy}% accuracy shows strong understanding of mathematical concepts.`
            });
        } else if (accuracy >= 60) {
            insights.push({
                type: 'info',
                icon: '📚',
                title: 'Good Progress',
                message: `${accuracy}% accuracy is good! Regular practice will boost performance.`
            });
        } else if (totalQuestions > 0) {
            insights.push({
                type: 'warning',
                icon: '💪',
                title: 'Keep Practicing',
                message: 'More practice will help build confidence and improve accuracy.'
            });
        }
        
        // Streak insight
        if (stats.longestStreak >= 10) {
            insights.push({
                type: 'success',
                icon: '🔥',
                title: 'Impressive Streak!',
                message: `${stats.longestStreak} correct answers in a row shows great focus.`
            });
        }
        
        // Volume insight
        if (totalQuestions >= 500) {
            insights.push({
                type: 'success',
                icon: '🎯',
                title: 'Dedicated Learner',
                message: `${totalQuestions} questions answered demonstrates commitment to learning.`
            });
        }
        
        // Consistency insight
        const consecutiveDays = stats.consecutiveDays || 0;
        if (consecutiveDays >= 7) {
            insights.push({
                type: 'success',
                icon: '📅',
                title: 'Daily Practice Habit',
                message: `${consecutiveDays} days of consecutive practice builds strong foundations.`
            });
        }
        
        // Default insight if none
        if (insights.length === 0) {
            insights.push({
                type: 'info',
                icon: '🚀',
                title: 'Just Getting Started',
                message: 'Keep playing to unlock insights about learning progress!'
            });
        }
        
        return insights.map(insight => `
            <div class="insight-card insight-${insight.type}">
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-content">
                    <h3 class="insight-title">${insight.title}</h3>
                    <p class="insight-message">${insight.message}</p>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Get children data (for multi-child support)
     */
    getChildrenData() {
        // Future enhancement: support multiple children profiles
        return [{
            name: this.userManager.currentUser?.name || 'Child',
            stats: this.userManager.currentUser?.getStats()
        }];
    }
    
    /**
     * Export report as JSON
     */
    exportReport() {
        const user = this.userManager.currentUser;
        if (!user) return;
        
        const report = {
            exportDate: new Date().toISOString(),
            childName: user.name,
            stats: user.getStats(),
            achievements: user.achievements,
            generatedBy: 'Kindergarten Math Adventure'
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `progress-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Print report
     */
    printReport() {
        window.print();
    }
    
    /**
     * Share report (using Web Share API if available)
     */
    async shareReport() {
        const user = this.userManager.currentUser;
        if (!user) return;
        
        const stats = user.getStats();
        const totalQuestions = stats.totalQuestionsAnswered || 0;
        const accuracy = totalQuestions > 0 
            ? Math.round((stats.totalCorrectAnswers / totalQuestions) * 100) 
            : 0;
        
        const shareData = {
            title: 'Math Learning Progress',
            text: `🎓 ${user.name}'s Progress:\n📝 ${totalQuestions} questions answered\n🎯 ${accuracy}% accuracy\n🔥 ${stats.longestStreak} longest streak`,
            url: window.location.href
        };
        
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareData.text);
            alert('Progress copied to clipboard!');
        }
    }
}
