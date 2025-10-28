/**
 * AriaAnnouncer.js - Accessibility announcer for screen readers
 * Manages ARIA live region announcements for dynamic content
 */

export class AriaAnnouncer {
    constructor() {
        this.announcer = document.getElementById('aria-announcer');
        this.queue = [];
        this.isAnnouncing = false;
    }

    /**
     * Announce text to screen readers
     * @param {string} message - Message to announce
     * @param {string} priority - 'polite' (default) or 'assertive'
     * @param {number} delay - Delay before announcement (ms)
     */
    announce(message, priority = 'polite', delay = 0) {
        if (!this.announcer || !message) return;

        if (delay > 0) {
            setTimeout(() => this.performAnnouncement(message, priority), delay);
        } else {
            this.performAnnouncement(message, priority);
        }
    }

    /**
     * Perform the announcement
     */
    performAnnouncement(message, priority) {
        // Set priority
        this.announcer.setAttribute('aria-live', priority);

        // Clear and set new message
        this.announcer.textContent = '';
        
        // Small delay to ensure screen readers pick up the change
        setTimeout(() => {
            this.announcer.textContent = message;
        }, 100);
    }

    /**
     * Announce question for screen readers
     */
    announceQuestion(questionNumber, totalQuestions, questionText) {
        const message = `Question ${questionNumber} of ${totalQuestions}: ${questionText}`;
        this.announce(message, 'polite', 200);
    }

    /**
     * Announce answer feedback
     */
    announceFeedback(isCorrect, correctAnswer = null) {
        let message;
        if (isCorrect) {
            message = 'Correct! Great job!';
        } else {
            message = correctAnswer 
                ? `Incorrect. The correct answer is ${correctAnswer}.`
                : 'Incorrect. Try again!';
        }
        this.announce(message, 'assertive', 100);
    }

    /**
     * Announce hint
     */
    announceHint(hintText, hintsRemaining) {
        const message = `Hint: ${hintText}. ${hintsRemaining} hints remaining.`;
        this.announce(message, 'polite', 200);
    }

    /**
     * Announce achievement unlocked
     */
    announceAchievement(achievementName, achievementDescription) {
        const message = `Achievement unlocked! ${achievementName}: ${achievementDescription}`;
        this.announce(message, 'polite', 500);
    }

    /**
     * Announce daily challenge completion
     */
    announceDailyChallenge(challengeName, reward) {
        const message = `Daily challenge complete! ${challengeName}. You earned ${reward} points!`;
        this.announce(message, 'polite', 500);
    }

    /**
     * Announce game results
     */
    announceResults(correctAnswers, totalQuestions, accuracy) {
        const message = `Game complete! You got ${correctAnswers} out of ${totalQuestions} correct, with ${accuracy} percent accuracy.`;
        this.announce(message, 'polite', 300);
    }

    /**
     * Announce loading state
     */
    announceLoading(message = 'Loading...') {
        this.announce(message, 'polite');
    }

    /**
     * Clear announcements
     */
    clear() {
        if (this.announcer) {
            this.announcer.textContent = '';
        }
    }
}
