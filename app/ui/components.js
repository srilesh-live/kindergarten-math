/**
 * UI Components Library
 * Reusable Material Design Components with Dark Theme
 * Accessible, Animated, Mobile-Optimized
 * Kindergarten Math Adventure v4
 */

import { UI_CONFIG } from '../config/masterConfig.js';

/**
 * Base Component Class
 * All UI components extend from this
 */
class BaseComponent {
    constructor(config = {}) {
        this.config = { ...UI_CONFIG, ...config };
        this.element = null;
        this.mounted = false;
        this.eventListeners = [];
    }

    create() {
        throw new Error('create() must be implemented by subclass');
    }

    mount(container) {
        if (!this.element) {
            this.element = this.create();
        }
        
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        
        if (container) {
            container.appendChild(this.element);
            this.mounted = true;
            this.onMounted();
        }
        
        return this.element;
    }

    unmount() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
            this.mounted = false;
            this.cleanup();
        }
    }

    onMounted() {
        // Override in subclasses
    }

    cleanup() {
        // Remove event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }

    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    createElement(tag, className = '', attributes = {}) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });
        return element;
    }
}

/**
 * Button Component
 * Material Design button with various styles
 */
export class Button extends BaseComponent {
    constructor(config) {
        super(config);
        this.text = config.text || '';
        this.onClick = config.onClick || (() => {});
        this.variant = config.variant || 'primary'; // primary, secondary, outlined, text
        this.size = config.size || 'medium'; // small, medium, large
        this.disabled = config.disabled || false;
        this.icon = config.icon || null;
        this.loading = config.loading || false;
        this.fullWidth = config.fullWidth || false;
    }

    create() {
        const classes = [
            'km-button',
            `km-button--${this.variant}`,
            `km-button--${this.size}`,
            this.fullWidth ? 'km-button--full-width' : '',
            this.disabled ? 'km-button--disabled' : '',
            this.loading ? 'km-button--loading' : ''
        ].filter(Boolean).join(' ');

        const button = this.createElement('button', classes, {
            type: 'button',
            disabled: this.disabled || this.loading,
            'aria-busy': this.loading
        });

        if (this.loading) {
            const spinner = this.createElement('span', 'km-button__spinner');
            spinner.innerHTML = '⏳';
            button.appendChild(spinner);
        }

        if (this.icon && !this.loading) {
            const iconEl = this.createElement('span', 'km-button__icon');
            iconEl.textContent = this.icon;
            button.appendChild(iconEl);
        }

        const textEl = this.createElement('span', 'km-button__text');
        textEl.textContent = this.text;
        button.appendChild(textEl);

        this.addEventListener(button, 'click', (e) => {
            if (!this.disabled && !this.loading) {
                this.onClick(e);
            }
        });

        return button;
    }

    setLoading(loading) {
        this.loading = loading;
        if (this.element) {
            this.element.classList.toggle('km-button--loading', loading);
            this.element.disabled = this.disabled || loading;
            this.element.setAttribute('aria-busy', loading);
        }
    }

    setDisabled(disabled) {
        this.disabled = disabled;
        if (this.element) {
            this.element.classList.toggle('km-button--disabled', disabled);
            this.element.disabled = disabled || this.loading;
        }
    }
}

/**
 * Card Component
 * Material Design card container
 */
export class Card extends BaseComponent {
    constructor(config) {
        super(config);
        this.title = config.title || '';
        this.content = config.content || '';
        this.footer = config.footer || null;
        this.elevation = config.elevation || 2; // 0-4
        this.interactive = config.interactive || false;
        this.onClick = config.onClick || null;
    }

    create() {
        const classes = [
            'km-card',
            `km-card--elevation-${this.elevation}`,
            this.interactive ? 'km-card--interactive' : ''
        ].filter(Boolean).join(' ');

        const card = this.createElement('div', classes, {
            role: this.interactive ? 'button' : 'article',
            tabindex: this.interactive ? '0' : undefined
        });

        if (this.title) {
            const header = this.createElement('div', 'km-card__header');
            const title = this.createElement('h3', 'km-card__title');
            title.textContent = this.title;
            header.appendChild(title);
            card.appendChild(header);
        }

        if (this.content) {
            const body = this.createElement('div', 'km-card__body');
            if (typeof this.content === 'string') {
                body.innerHTML = this.content;
            } else {
                body.appendChild(this.content);
            }
            card.appendChild(body);
        }

        if (this.footer) {
            const footerEl = this.createElement('div', 'km-card__footer');
            if (typeof this.footer === 'string') {
                footerEl.innerHTML = this.footer;
            } else {
                footerEl.appendChild(this.footer);
            }
            card.appendChild(footerEl);
        }

        if (this.interactive && this.onClick) {
            this.addEventListener(card, 'click', this.onClick);
            this.addEventListener(card, 'keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.onClick(e);
                }
            });
        }

        return card;
    }
}

/**
 * Modal Component
 * Full-screen overlay modal dialog
 */
export class Modal extends BaseComponent {
    constructor(config) {
        super(config);
        this.title = config.title || '';
        this.content = config.content || '';
        this.actions = config.actions || [];
        this.onClose = config.onClose || (() => {});
        this.closeOnOverlay = config.closeOnOverlay !== false;
        this.showCloseButton = config.showCloseButton !== false;
    }

    create() {
        const overlay = this.createElement('div', 'km-modal-overlay', {
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': 'km-modal-title'
        });

        const modal = this.createElement('div', 'km-modal');

        // Header
        if (this.title || this.showCloseButton) {
            const header = this.createElement('div', 'km-modal__header');
            
            if (this.title) {
                const title = this.createElement('h2', 'km-modal__title', {
                    id: 'km-modal-title'
                });
                title.textContent = this.title;
                header.appendChild(title);
            }

            if (this.showCloseButton) {
                const closeBtn = this.createElement('button', 'km-modal__close', {
                    type: 'button',
                    'aria-label': 'Close dialog'
                });
                closeBtn.innerHTML = '×';
                this.addEventListener(closeBtn, 'click', () => this.close());
                header.appendChild(closeBtn);
            }

            modal.appendChild(header);
        }

        // Body
        const body = this.createElement('div', 'km-modal__body');
        if (typeof this.content === 'string') {
            body.innerHTML = this.content;
        } else {
            body.appendChild(this.content);
        }
        modal.appendChild(body);

        // Footer with actions
        if (this.actions.length > 0) {
            const footer = this.createElement('div', 'km-modal__footer');
            this.actions.forEach(action => {
                const btn = new Button({
                    text: action.text,
                    variant: action.variant || 'text',
                    onClick: () => {
                        if (action.onClick) action.onClick();
                        if (action.close !== false) this.close();
                    }
                });
                btn.mount(footer);
            });
            modal.appendChild(footer);
        }

        overlay.appendChild(modal);

        // Close on overlay click
        if (this.closeOnOverlay) {
            this.addEventListener(overlay, 'click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }

        // Close on Escape key
        this.addEventListener(document, 'keydown', (e) => {
            if (e.key === 'Escape' && this.mounted) {
                this.close();
            }
        });

        return overlay;
    }

    open() {
        if (!this.mounted) {
            this.mount(document.body);
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            // Animation
            requestAnimationFrame(() => {
                this.element.classList.add('km-modal-overlay--active');
                
                // Focus first focusable element
                const focusable = this.element.querySelectorAll(
                    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
                );
                if (focusable.length > 0) {
                    focusable[0].focus();
                }
            });
        }
    }

    close() {
        if (this.mounted) {
            this.element.classList.remove('km-modal-overlay--active');
            
            setTimeout(() => {
                this.unmount();
                document.body.style.overflow = '';
                this.onClose();
            }, 300); // Match CSS transition duration
        }
    }
}

/**
 * Progress Bar Component
 * Visual progress indicator
 */
export class ProgressBar extends BaseComponent {
    constructor(config) {
        super(config);
        this.value = config.value || 0; // 0-100
        this.label = config.label || '';
        this.showPercentage = config.showPercentage !== false;
        this.animated = config.animated !== false;
        this.color = config.color || 'primary';
    }

    create() {
        const container = this.createElement('div', 'km-progress');

        if (this.label) {
            const labelEl = this.createElement('div', 'km-progress__label');
            labelEl.textContent = this.label;
            container.appendChild(labelEl);
        }

        const track = this.createElement('div', 'km-progress__track');
        const bar = this.createElement('div', `km-progress__bar km-progress__bar--${this.color}`, {
            role: 'progressbar',
            'aria-valuenow': this.value,
            'aria-valuemin': '0',
            'aria-valuemax': '100'
        });

        bar.style.width = `${this.value}%`;
        
        if (this.animated) {
            bar.classList.add('km-progress__bar--animated');
        }

        track.appendChild(bar);
        container.appendChild(track);

        if (this.showPercentage) {
            const percentage = this.createElement('div', 'km-progress__percentage');
            percentage.textContent = `${Math.round(this.value)}%`;
            container.appendChild(percentage);
        }

        return container;
    }

    setValue(value) {
        this.value = Math.max(0, Math.min(100, value));
        if (this.element) {
            const bar = this.element.querySelector('.km-progress__bar');
            const percentage = this.element.querySelector('.km-progress__percentage');
            
            bar.style.width = `${this.value}%`;
            bar.setAttribute('aria-valuenow', this.value);
            
            if (percentage) {
                percentage.textContent = `${Math.round(this.value)}%`;
            }
        }
    }
}

/**
 * Input Field Component
 * Material Design text input
 */
export class Input extends BaseComponent {
    constructor(config) {
        super(config);
        this.type = config.type || 'text';
        this.label = config.label || '';
        this.placeholder = config.placeholder || '';
        this.value = config.value || '';
        this.required = config.required || false;
        this.disabled = config.disabled || false;
        this.error = config.error || '';
        this.onChange = config.onChange || (() => {});
        this.icon = config.icon || null;
    }

    create() {
        const container = this.createElement('div', 'km-input-container');

        if (this.label) {
            const label = this.createElement('label', 'km-input__label');
            label.textContent = this.label;
            if (this.required) {
                label.innerHTML += ' <span class="km-input__required">*</span>';
            }
            container.appendChild(label);
        }

        const inputWrapper = this.createElement('div', 'km-input__wrapper');

        if (this.icon) {
            const iconEl = this.createElement('span', 'km-input__icon');
            iconEl.textContent = this.icon;
            inputWrapper.appendChild(iconEl);
        }

        const input = this.createElement('input', 'km-input__field', {
            type: this.type,
            placeholder: this.placeholder,
            value: this.value,
            required: this.required,
            disabled: this.disabled,
            'aria-invalid': this.error ? 'true' : 'false'
        });

        this.addEventListener(input, 'input', (e) => {
            this.value = e.target.value;
            this.onChange(e.target.value, e);
        });

        inputWrapper.appendChild(input);
        container.appendChild(inputWrapper);

        if (this.error) {
            const errorEl = this.createElement('div', 'km-input__error', {
                role: 'alert'
            });
            errorEl.textContent = this.error;
            container.appendChild(errorEl);
        }

        return container;
    }

    getValue() {
        return this.value;
    }

    setValue(value) {
        this.value = value;
        if (this.element) {
            const input = this.element.querySelector('.km-input__field');
            if (input) input.value = value;
        }
    }

    setError(error) {
        this.error = error;
        if (this.element) {
            let errorEl = this.element.querySelector('.km-input__error');
            const input = this.element.querySelector('.km-input__field');
            
            if (error) {
                if (!errorEl) {
                    errorEl = this.createElement('div', 'km-input__error', { role: 'alert' });
                    this.element.appendChild(errorEl);
                }
                errorEl.textContent = error;
                input.setAttribute('aria-invalid', 'true');
            } else {
                if (errorEl) {
                    errorEl.remove();
                }
                input.setAttribute('aria-invalid', 'false');
            }
        }
    }
}

/**
 * Toast Notification Component
 * Temporary notification message
 */
export class Toast extends BaseComponent {
    constructor(config) {
        super(config);
        this.message = config.message || '';
        this.type = config.type || 'info'; // success, error, warning, info
        this.duration = config.duration || 3000;
        this.action = config.action || null;
    }

    create() {
        const toast = this.createElement('div', `km-toast km-toast--${this.type}`, {
            role: 'status',
            'aria-live': 'polite'
        });

        const icon = this.getIcon();
        if (icon) {
            const iconEl = this.createElement('span', 'km-toast__icon');
            iconEl.textContent = icon;
            toast.appendChild(iconEl);
        }

        const message = this.createElement('span', 'km-toast__message');
        message.textContent = this.message;
        toast.appendChild(message);

        if (this.action) {
            const actionBtn = new Button({
                text: this.action.text,
                variant: 'text',
                size: 'small',
                onClick: this.action.onClick
            });
            actionBtn.mount(toast);
        }

        const closeBtn = this.createElement('button', 'km-toast__close', {
            type: 'button',
            'aria-label': 'Dismiss notification'
        });
        closeBtn.innerHTML = '×';
        this.addEventListener(closeBtn, 'click', () => this.hide());
        toast.appendChild(closeBtn);

        return toast;
    }

    getIcon() {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[this.type];
    }

    show() {
        if (!this.mounted) {
            // Create toast container if not exists
            let container = document.querySelector('.km-toast-container');
            if (!container) {
                container = this.createElement('div', 'km-toast-container');
                document.body.appendChild(container);
            }

            this.mount(container);
            
            requestAnimationFrame(() => {
                this.element.classList.add('km-toast--visible');
            });

            if (this.duration > 0) {
                setTimeout(() => this.hide(), this.duration);
            }
        }
    }

    hide() {
        if (this.mounted && this.element) {
            this.element.classList.remove('km-toast--visible');
            setTimeout(() => this.unmount(), 300);
        }
    }
}

/**
 * Loading Spinner Component
 */
export class Spinner extends BaseComponent {
    constructor(config = {}) {
        super(config);
        this.size = config.size || 'medium'; // small, medium, large
        this.overlay = config.overlay || false;
        this.message = config.message || '';
    }

    create() {
        const container = this.createElement('div', 
            `km-spinner km-spinner--${this.size}${this.overlay ? ' km-spinner--overlay' : ''}`,
            { role: 'status', 'aria-live': 'polite' }
        );

        const spinner = this.createElement('div', 'km-spinner__animation');
        spinner.innerHTML = '⏳';
        container.appendChild(spinner);

        if (this.message) {
            const message = this.createElement('div', 'km-spinner__message');
            message.textContent = this.message;
            container.appendChild(message);
        }

        const srText = this.createElement('span', 'km-sr-only');
        srText.textContent = this.message || 'Loading...';
        container.appendChild(srText);

        return container;
    }

    show() {
        if (!this.mounted) {
            this.mount(document.body);
        }
    }

    hide() {
        this.unmount();
    }
}

/**
 * Game Card Component
 * Specialized card for game selection
 */
export class GameCard extends BaseComponent {
    constructor(config) {
        super(config);
        this.game = config.game;
        this.locked = config.locked || false;
        this.progress = config.progress || 0;
        this.onSelect = config.onSelect || (() => {});
    }

    create() {
        const card = this.createElement('div', 
            `km-game-card${this.locked ? ' km-game-card--locked' : ''}`,
            {
                role: 'button',
                tabindex: this.locked ? '-1' : '0',
                'aria-label': `${this.game.name}${this.locked ? ' (locked)' : ''}`
            }
        );

        // Icon
        const icon = this.createElement('div', 'km-game-card__icon');
        icon.textContent = this.game.icon;
        card.appendChild(icon);

        // Title
        const title = this.createElement('h3', 'km-game-card__title');
        title.textContent = this.game.name;
        card.appendChild(title);

        // Description
        const desc = this.createElement('p', 'km-game-card__description');
        desc.textContent = this.game.description;
        card.appendChild(desc);

        // Progress
        if (this.progress > 0 && !this.locked) {
            const progressBar = new ProgressBar({
                value: this.progress,
                label: '',
                showPercentage: true
            });
            progressBar.mount(card);
        }

        // Lock indicator
        if (this.locked) {
            const lockIcon = this.createElement('div', 'km-game-card__lock');
            lockIcon.textContent = '🔒';
            card.appendChild(lockIcon);
        }

        if (!this.locked) {
            this.addEventListener(card, 'click', () => this.onSelect(this.game));
            this.addEventListener(card, 'keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.onSelect(this.game);
                }
            });
        }

        return card;
    }
}

/**
 * Utility function to show toast notifications
 */
export function showToast(message, type = 'info', duration = 3000) {
    const toast = new Toast({ message, type, duration });
    toast.show();
    return toast;
}

/**
 * Utility function to show loading spinner
 */
export function showLoading(message = 'Loading...') {
    const spinner = new Spinner({ overlay: true, message });
    spinner.show();
    return spinner;
}

export default {
    BaseComponent,
    Button,
    Card,
    Modal,
    ProgressBar,
    Input,
    Toast,
    Spinner,
    GameCard,
    showToast,
    showLoading
};