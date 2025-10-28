/**
 * Hints Manager
 * Provides progressive hints for math problems
 */

export default class HintsManager {
    constructor() {
        this.currentHints = [];
        this.hintsShown = 0;
    }

    /**
     * Generate hints for a basic arithmetic problem
     * @param {Object} problem - Problem object with operand1, operand2, operator
     * @returns {Array} Array of progressive hints
     */
    generateArithmeticHints(problem) {
        const { operand1, operand2, operator, correctAnswer } = problem;
        const hints = [];

        switch (operator) {
            case '+':
                hints.push(`💡 Think about combining two groups together.`);
                hints.push(`💡 Start with ${operand1} and count up ${operand2} more.`);
                hints.push(`💡 ${operand1} + ${operand2} = ${correctAnswer}`);
                break;
            
            case '-':
                hints.push(`💡 Think about taking away or removing items.`);
                hints.push(`💡 Start with ${operand1} and count down ${operand2}.`);
                hints.push(`💡 ${operand1} - ${operand2} = ${correctAnswer}`);
                break;
            
            case '×':
                hints.push(`💡 Multiplication is adding the same number multiple times.`);
                hints.push(`💡 Count ${operand1} groups of ${operand2} items each.`);
                hints.push(`💡 ${operand1} × ${operand2} = ${correctAnswer}`);
                break;
            
            case '÷':
                hints.push(`💡 Division is splitting into equal groups.`);
                hints.push(`💡 Split ${operand1} items into ${operand2} equal groups.`);
                hints.push(`💡 ${operand1} ÷ ${operand2} = ${correctAnswer}`);
                break;
        }

        return hints;
    }

    /**
     * Generate hints for number sequences
     * @param {Object} problem - Sequence problem
     * @returns {Array} Array of progressive hints
     */
    generateSequenceHints(problem) {
        const { sequence, missingIndex, pattern, correctAnswer } = problem;
        const hints = [];

        hints.push(`💡 Look for a pattern in the numbers.`);
        
        if (pattern.type === 'add') {
            hints.push(`💡 Each number increases by ${pattern.value}.`);
        } else if (pattern.type === 'subtract') {
            hints.push(`💡 Each number decreases by ${pattern.value}.`);
        } else if (pattern.type === 'multiply') {
            hints.push(`💡 Each number is multiplied by ${pattern.value}.`);
        }
        
        hints.push(`💡 The missing number is ${correctAnswer}.`);

        return hints;
    }

    /**
     * Generate hints for clock/time problems
     * @param {Object} problem - Clock problem
     * @returns {Array} Array of progressive hints
     */
    generateClockHints(problem) {
        const { hours, minutes, correctAnswer } = problem;
        const hints = [];

        hints.push(`💡 Look at the position of the clock hands.`);
        hints.push(`💡 The short hand points to the hour, the long hand to minutes.`);
        
        if (minutes === 0) {
            hints.push(`💡 When the long hand is at 12, it's exactly the hour.`);
        } else if (minutes === 30) {
            hints.push(`💡 When the long hand is at 6, it's 30 minutes (half past).`);
        } else if (minutes === 15) {
            hints.push(`💡 When the long hand is at 3, it's 15 minutes (quarter past).`);
        } else if (minutes === 45) {
            hints.push(`💡 When the long hand is at 9, it's 45 minutes (quarter to).`);
        }
        
        hints.push(`💡 The time is ${correctAnswer}.`);

        return hints;
    }

    /**
     * Generate hints for money problems
     * @param {Object} problem - Money problem
     * @returns {Array} Array of progressive hints
     */
    generateMoneyHints(problem) {
        const { coins, totalValue, correctAnswer } = problem;
        const hints = [];

        hints.push(`💡 Count the value of each coin carefully.`);
        
        if (coins) {
            const coinValues = {
                penny: 1,
                nickel: 5,
                dime: 10,
                quarter: 25
            };
            
            const coinList = Object.entries(coins)
                .filter(([_, count]) => count > 0)
                .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
                .join(', ');
            
            hints.push(`💡 You have: ${coinList}.`);
            hints.push(`💡 Remember: penny=1¢, nickel=5¢, dime=10¢, quarter=25¢.`);
        }
        
        hints.push(`💡 The answer is ${correctAnswer}¢.`);

        return hints;
    }

    /**
     * Generate hints based on game type
     * @param {string} gameType - Type of game
     * @param {Object} problem - Current problem
     * @returns {Array} Array of progressive hints
     */
    generateHints(gameType, problem) {
        switch (gameType) {
            case 'basic-arithmetic':
                return this.generateArithmeticHints(problem);
            case 'number-sequences':
                return this.generateSequenceHints(problem);
            case 'time-clock':
                return this.generateClockHints(problem);
            case 'money-math':
                return this.generateMoneyHints(problem);
            default:
                return ['💡 Take your time and think carefully!'];
        }
    }

    /**
     * Set up hints for a new problem
     * @param {string} gameType - Type of game
     * @param {Object} problem - Current problem
     */
    setupHints(gameType, problem) {
        this.currentHints = this.generateHints(gameType, problem);
        this.hintsShown = 0;
    }

    /**
     * Get the next hint
     * @returns {string|null} Next hint or null if no more hints
     */
    getNextHint() {
        if (this.hintsShown >= this.currentHints.length) {
            return null;
        }
        
        const hint = this.currentHints[this.hintsShown];
        this.hintsShown++;
        return hint;
    }

    /**
     * Check if more hints are available
     * @returns {boolean} True if more hints available
     */
    hasMoreHints() {
        return this.hintsShown < this.currentHints.length;
    }

    /**
     * Get total number of hints available
     * @returns {number} Total hints for current problem
     */
    getTotalHints() {
        return this.currentHints.length;
    }

    /**
     * Get number of hints already shown
     * @returns {number} Hints shown count
     */
    getHintsShownCount() {
        return this.hintsShown;
    }

    /**
     * Reset hints for a new problem
     */
    reset() {
        this.currentHints = [];
        this.hintsShown = 0;
    }

    /**
     * Create hint notification UI element
     * @param {string} hintText - Hint text to display
     * @returns {HTMLElement} Hint notification element
     */
    createHintNotification(hintText) {
        const notification = document.createElement('div');
        notification.className = 'hint-notification';
        notification.innerHTML = `
            <div class="hint-icon">💡</div>
            <div class="hint-text">${hintText}</div>
        `;
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('hint-fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        return notification;
    }

    /**
     * Show hint in the UI
     * @param {string} hintText - Hint to display
     * @param {HTMLElement} container - Container to append hint to
     */
    showHint(hintText, container) {
        const notification = this.createHintNotification(hintText);
        
        // Remove any existing hints first
        const existingHints = container.querySelectorAll('.hint-notification');
        existingHints.forEach(hint => hint.remove());
        
        container.appendChild(notification);
        
        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('hint-show');
        });
    }

    /**
     * Calculate hint penalty for scoring
     * @param {number} basePoints - Base points for problem
     * @returns {number} Points to deduct for hints used
     */
    calculateHintPenalty(basePoints) {
        // Deduct 10% per hint, max 30%
        const penaltyPercent = Math.min(this.hintsShown * 10, 30);
        return Math.floor(basePoints * penaltyPercent / 100);
    }
}
