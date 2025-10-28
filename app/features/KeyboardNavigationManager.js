/**
 * KeyboardNavigationManager.js - Keyboard navigation and accessibility
 * Provides comprehensive keyboard support for the entire application
 */

export class KeyboardNavigationManager {
    constructor(app) {
        this.app = app;
        this.currentFocusIndex = 0;
        this.focusableElements = [];
        this.modalStack = [];
        
        this.init();
    }

    /**
     * Initialize keyboard navigation
     */
    init() {
        // Global keyboard listener
        document.addEventListener('keydown', (e) => this.handleGlobalKeyPress(e));
        
        console.log('⌨️ Keyboard navigation initialized');
    }

    /**
     * Handle global keyboard events
     */
    handleGlobalKeyPress(e) {
        const key = e.key;
        const target = e.target;

        // Don't interfere with text input
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
            // Allow Escape to blur input fields
            if (key === 'Escape') {
                target.blur();
                e.preventDefault();
            }
            return;
        }

        switch(key) {
            case 'Escape':
                this.handleEscape(e);
                break;
            case 'Enter':
            case ' ':
                this.handleEnterOrSpace(e);
                break;
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                this.handleArrowKeys(e);
                break;
            case 'Tab':
                // Browser handles Tab naturally, but we can enhance it
                this.updateFocusableElements();
                break;
            case '1':
            case '2':
            case '3':
            case '4':
                this.handleNumberKey(e, key);
                break;
            case 'h':
            case 'H':
                // Quick hint access
                if (e.ctrlKey || e.metaKey) {
                    this.triggerHint(e);
                }
                break;
        }
    }

    /**
     * Handle Escape key - close modals, pause game, go back
     */
    handleEscape(e) {
        e.preventDefault();

        // Check for open modals
        const openModal = document.querySelector('.modal-overlay:not(.hidden)');
        if (openModal) {
            const closeBtn = openModal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.click();
            }
            return;
        }

        // Check current app state
        if (!this.app) return;

        switch(this.app.state) {
            case 'playing':
                // Pause game
                const pauseBtn = document.getElementById('pause-game-btn');
                if (pauseBtn) pauseBtn.click();
                break;
            case 'game_config':
                // Go back to game selection
                this.app.showGameSelection();
                break;
            case 'settings':
                // Close settings
                const closeSettingsBtn = document.getElementById('close-settings-btn');
                if (closeSettingsBtn) closeSettingsBtn.click();
                break;
        }
    }

    /**
     * Handle Enter or Space - activate focused element
     */
    handleEnterOrSpace(e) {
        const focused = document.activeElement;

        // If a button or link is focused, activate it
        if (focused && (focused.tagName === 'BUTTON' || focused.tagName === 'A')) {
            if (!focused.disabled) {
                e.preventDefault();
                focused.click();
            }
        }

        // If nothing is focused, try to submit answer if in game
        if (focused === document.body && this.app && this.app.state === 'playing') {
            // Focus first answer button
            const firstAnswer = document.querySelector('.km-answer-btn:not([disabled])');
            if (firstAnswer) {
                firstAnswer.focus();
            }
        }
    }

    /**
     * Handle arrow keys - navigate between focusable elements
     */
    handleArrowKeys(e) {
        const key = e.key;
        
        // Update focusable elements list
        this.updateFocusableElements();

        if (this.focusableElements.length === 0) return;

        // Special handling for answer buttons in game
        if (this.app && this.app.state === 'playing') {
            const answerButtons = Array.from(document.querySelectorAll('.km-answer-btn:not([disabled])'));
            if (answerButtons.length > 0 && answerButtons.includes(document.activeElement)) {
                this.navigateAnswerButtons(answerButtons, key, e);
                return;
            }
        }

        // General navigation
        const currentIndex = this.focusableElements.indexOf(document.activeElement);
        let newIndex = currentIndex;

        switch(key) {
            case 'ArrowUp':
            case 'ArrowLeft':
                newIndex = currentIndex <= 0 ? this.focusableElements.length - 1 : currentIndex - 1;
                e.preventDefault();
                break;
            case 'ArrowDown':
            case 'ArrowRight':
                newIndex = currentIndex >= this.focusableElements.length - 1 ? 0 : currentIndex + 1;
                e.preventDefault();
                break;
        }

        if (this.focusableElements[newIndex]) {
            this.focusableElements[newIndex].focus();
        }
    }

    /**
     * Navigate answer buttons in a grid
     */
    navigateAnswerButtons(buttons, key, e) {
        e.preventDefault();

        const currentIndex = buttons.indexOf(document.activeElement);
        let newIndex = currentIndex;

        // Assume 2-column grid for answer buttons
        const columns = 2;
        const rows = Math.ceil(buttons.length / columns);
        const currentRow = Math.floor(currentIndex / columns);
        const currentCol = currentIndex % columns;

        switch(key) {
            case 'ArrowUp':
                if (currentRow > 0) {
                    newIndex = ((currentRow - 1) * columns) + currentCol;
                    if (newIndex >= buttons.length) newIndex = buttons.length - 1;
                }
                break;
            case 'ArrowDown':
                if (currentRow < rows - 1) {
                    newIndex = ((currentRow + 1) * columns) + currentCol;
                    if (newIndex >= buttons.length) newIndex = buttons.length - 1;
                }
                break;
            case 'ArrowLeft':
                newIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
                break;
            case 'ArrowRight':
                newIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
                break;
        }

        if (buttons[newIndex]) {
            buttons[newIndex].focus();
        }
    }

    /**
     * Handle number key press - quick answer selection
     */
    handleNumberKey(e, key) {
        if (this.app && this.app.state === 'playing') {
            const answerButtons = document.querySelectorAll('.km-answer-btn:not([disabled])');
            const index = parseInt(key) - 1;
            
            if (answerButtons[index]) {
                e.preventDefault();
                answerButtons[index].focus();
                answerButtons[index].click();
            }
        }
    }

    /**
     * Trigger hint with keyboard shortcut
     */
    triggerHint(e) {
        if (this.app && this.app.state === 'playing') {
            const hintBtn = document.getElementById('hintBtn');
            if (hintBtn && !hintBtn.disabled) {
                e.preventDefault();
                hintBtn.click();
            }
        }
    }

    /**
     * Update list of focusable elements
     */
    updateFocusableElements() {
        const selector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        this.focusableElements = Array.from(document.querySelectorAll(selector));
    }

    /**
     * Focus first interactive element on screen
     */
    focusFirstElement() {
        this.updateFocusableElements();
        if (this.focusableElements.length > 0) {
            // Skip skip-link if it's first
            const firstElement = this.focusableElements[0];
            if (firstElement.classList.contains('skip-link')) {
                if (this.focusableElements[1]) {
                    this.focusableElements[1].focus();
                    return;
                }
            }
            firstElement.focus();
        }
    }

    /**
     * Trap focus within a modal
     */
    trapFocusInModal(modalElement) {
        const focusableContent = modalElement.querySelectorAll(
            'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableContent.length === 0) return;

        const firstFocusable = focusableContent[0];
        const lastFocusable = focusableContent[focusableContent.length - 1];

        // Focus first element
        firstFocusable.focus();

        // Trap focus
        const trapListener = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        };

        modalElement.addEventListener('keydown', trapListener);

        // Store for cleanup
        this.modalStack.push({
            element: modalElement,
            listener: trapListener
        });
    }

    /**
     * Release focus trap when modal closes
     */
    releaseFocusTrap(modalElement) {
        const modalData = this.modalStack.find(m => m.element === modalElement);
        if (modalData) {
            modalElement.removeEventListener('keydown', modalData.listener);
            this.modalStack = this.modalStack.filter(m => m.element !== modalElement);
        }
    }

    /**
     * Add keyboard shortcut indicator to button
     */
    addShortcutIndicator(buttonElement, shortcut) {
        const indicator = document.createElement('span');
        indicator.className = 'keyboard-shortcut';
        indicator.textContent = shortcut;
        indicator.setAttribute('aria-hidden', 'true');
        buttonElement.appendChild(indicator);
    }

    /**
     * Enable keyboard hints
     */
    enableKeyboardHints() {
        // Add visual indicators for keyboard shortcuts
        const hintBtn = document.getElementById('hintBtn');
        if (hintBtn && !hintBtn.querySelector('.keyboard-shortcut')) {
            const hint = document.createElement('span');
            hint.className = 'keyboard-shortcut';
            hint.textContent = 'Ctrl+H';
            hint.setAttribute('aria-hidden', 'true');
            hintBtn.appendChild(hint);
        }
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        document.removeEventListener('keydown', this.handleGlobalKeyPress);
        this.modalStack.forEach(modal => {
            modal.element.removeEventListener('keydown', modal.listener);
        });
        this.modalStack = [];
    }
}
