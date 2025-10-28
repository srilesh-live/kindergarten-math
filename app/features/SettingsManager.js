/**
 * Settings Manager
 * Manages user preferences and app configuration
 */

export class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.applySettings();
    }

    /**
     * Default settings
     */
    getDefaultSettings() {
        return {
            // Game Preferences
            soundEffects: true,
            music: false,
            animations: true,
            hints: true,
            autoAdvance: true,
            vibration: true,

            // Visual Preferences
            fontSize: 'medium', // small, medium, large
            highContrast: false,
            reducedMotion: false,
            colorBlindMode: false,

            // Gameplay
            difficulty: 'adaptive', // easy, medium, hard, adaptive
            questionsPerSession: 10,
            timerEnabled: false,
            showProgress: true,

            // Notifications
            achievementNotifications: true,
            encouragementMessages: true,
            dailyReminders: false,
            reminderTime: '18:00',

            // Privacy
            analytics: true,
            crashReports: true,

            // Parental Controls
            parentalControlsEnabled: false,
            parentalPin: null,
            maxSessionTime: 30, // minutes
            requireParentForSettings: false
        };
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('km_settings');
            if (saved) {
                return { ...this.getDefaultSettings(), ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
        return this.getDefaultSettings();
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('km_settings', JSON.stringify(this.settings));
            console.log('Settings saved');
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    /**
     * Update a setting
     */
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applySettings();

        // Dispatch event for setting change
        window.dispatchEvent(new CustomEvent('settings:changed', {
            detail: { key, value }
        }));
    }

    /**
     * Get a setting value
     */
    getSetting(key) {
        return this.settings[key];
    }

    /**
     * Get all settings
     */
    getAllSettings() {
        return { ...this.settings };
    }

    /**
     * Reset to default settings
     */
    resetToDefaults() {
        this.settings = this.getDefaultSettings();
        this.saveSettings();
        this.applySettings();
    }

    /**
     * Apply settings to the app
     */
    applySettings() {
        // Font size
        this.applyFontSize();

        // High contrast
        this.applyHighContrast();

        // Reduced motion
        this.applyReducedMotion();

        // Animations
        this.applyAnimations();

        // Sound effects
        window.soundsEnabled = this.settings.soundEffects;

        // Vibration
        window.vibrationEnabled = this.settings.vibration;
    }

    /**
     * Apply font size
     */
    applyFontSize() {
        const root = document.documentElement;
        
        switch (this.settings.fontSize) {
            case 'small':
                root.style.fontSize = '14px';
                break;
            case 'large':
                root.style.fontSize = '18px';
                break;
            case 'medium':
            default:
                root.style.fontSize = '16px';
                break;
        }
    }

    /**
     * Apply high contrast
     */
    applyHighContrast() {
        if (this.settings.highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }

    /**
     * Apply reduced motion
     */
    applyReducedMotion() {
        if (this.settings.reducedMotion) {
            document.body.classList.add('reduce-motion');
        } else {
            document.body.classList.remove('reduce-motion');
        }
    }

    /**
     * Apply animations setting
     */
    applyAnimations() {
        if (!this.settings.animations) {
            document.body.classList.add('no-animations');
        } else {
            document.body.classList.remove('no-animations');
        }
    }

    /**
     * Verify parental PIN
     */
    verifyParentalPin(pin) {
        if (!this.settings.parentalControlsEnabled) {
            return true;
        }
        return pin === this.settings.parentalPin;
    }

    /**
     * Set parental PIN
     */
    setParentalPin(pin) {
        this.settings.parentalPin = pin;
        this.settings.parentalControlsEnabled = true;
        this.saveSettings();
    }

    /**
     * Disable parental controls
     */
    disableParentalControls(pin) {
        if (this.verifyParentalPin(pin)) {
            this.settings.parentalControlsEnabled = false;
            this.settings.parentalPin = null;
            this.saveSettings();
            return true;
        }
        return false;
    }

    /**
     * Check if setting change requires parental permission
     */
    requiresParentalPermission(settingKey) {
        if (!this.settings.requireParentForSettings) {
            return false;
        }

        const protectedSettings = [
            'maxSessionTime',
            'parentalControlsEnabled',
            'dailyReminders',
            'analytics'
        ];

        return protectedSettings.includes(settingKey);
    }

    /**
     * Export settings as JSON
     */
    exportSettings() {
        const data = JSON.stringify(this.settings, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `math-adventure-settings-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Import settings from JSON
     */
    async importSettings(file) {
        try {
            const text = await file.text();
            const imported = JSON.parse(text);
            
            // Validate imported settings
            const defaults = this.getDefaultSettings();
            const validated = {};
            
            for (const key in defaults) {
                if (key in imported) {
                    validated[key] = imported[key];
                } else {
                    validated[key] = defaults[key];
                }
            }
            
            this.settings = validated;
            this.saveSettings();
            this.applySettings();
            
            return true;
        } catch (error) {
            console.error('Failed to import settings:', error);
            return false;
        }
    }

    /**
     * Get settings UI data
     */
    getSettingsUI() {
        return {
            sections: [
                {
                    id: 'game',
                    name: 'Game Preferences',
                    icon: '🎮',
                    settings: [
                        {
                            key: 'soundEffects',
                            type: 'toggle',
                            label: 'Sound Effects',
                            description: 'Play sounds for correct/incorrect answers'
                        },
                        {
                            key: 'animations',
                            type: 'toggle',
                            label: 'Animations',
                            description: 'Show animated transitions and effects'
                        },
                        {
                            key: 'hints',
                            type: 'toggle',
                            label: 'Show Hints',
                            description: 'Display hint button during questions'
                        },
                        {
                            key: 'autoAdvance',
                            type: 'toggle',
                            label: 'Auto Advance',
                            description: 'Automatically move to next question'
                        },
                        {
                            key: 'questionsPerSession',
                            type: 'number',
                            label: 'Questions Per Session',
                            description: 'Number of questions in each session',
                            min: 5,
                            max: 50,
                            step: 5
                        }
                    ]
                },
                {
                    id: 'accessibility',
                    name: 'Accessibility',
                    icon: '♿',
                    settings: [
                        {
                            key: 'fontSize',
                            type: 'select',
                            label: 'Text Size',
                            description: 'Adjust text size for better readability',
                            options: [
                                { value: 'small', label: 'Small' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'large', label: 'Large' }
                            ]
                        },
                        {
                            key: 'highContrast',
                            type: 'toggle',
                            label: 'High Contrast',
                            description: 'Increase contrast for better visibility'
                        },
                        {
                            key: 'reducedMotion',
                            type: 'toggle',
                            label: 'Reduce Motion',
                            description: 'Minimize animations and transitions'
                        }
                    ]
                },
                {
                    id: 'notifications',
                    name: 'Notifications',
                    icon: '🔔',
                    settings: [
                        {
                            key: 'achievementNotifications',
                            type: 'toggle',
                            label: 'Achievement Notifications',
                            description: 'Show alerts when unlocking achievements'
                        },
                        {
                            key: 'encouragementMessages',
                            type: 'toggle',
                            label: 'Encouragement Messages',
                            description: 'Display motivational AI messages'
                        },
                        {
                            key: 'dailyReminders',
                            type: 'toggle',
                            label: 'Daily Reminders',
                            description: 'Remind to practice every day'
                        }
                    ]
                },
                {
                    id: 'parental',
                    name: 'Parental Controls',
                    icon: '👨‍👩‍👧‍👦',
                    protected: true,
                    settings: [
                        {
                            key: 'maxSessionTime',
                            type: 'number',
                            label: 'Max Session Time',
                            description: 'Maximum minutes per session',
                            min: 5,
                            max: 60,
                            step: 5
                        }
                    ]
                }
            ]
        };
    }
}

export default SettingsManager;
