/**
 * Sound Manager
 * Handles all sound effects and music using Web Audio API
 * Respects user settings for sound preferences
 */

export default class SoundManager {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.audioContext = null;
        this.sounds = {};
        this.musicGainNode = null;
        this.sfxGainNode = null;
        
        this.init();
    }
    
    /**
     * Initialize Web Audio API
     */
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain nodes for volume control
            this.musicGainNode = this.audioContext.createGain();
            this.sfxGainNode = this.audioContext.createGain();
            
            this.musicGainNode.connect(this.audioContext.destination);
            this.sfxGainNode.connect(this.audioContext.destination);
            
            // Set initial volumes
            this.musicGainNode.gain.value = 0.3;
            this.sfxGainNode.gain.value = 0.5;
            
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }
    
    /**
     * Check if sound effects are enabled
     */
    isSoundEnabled() {
        return this.settingsManager && 
               this.settingsManager.getSetting('soundEffects') && 
               this.audioContext;
    }
    
    /**
     * Check if music is enabled
     */
    isMusicEnabled() {
        return this.settingsManager && 
               this.settingsManager.getSetting('music') && 
               this.audioContext;
    }
    
    /**
     * Play success sound (correct answer)
     */
    playSuccess() {
        if (!this.isSoundEnabled()) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        // Happy ascending notes
        oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5
        
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    /**
     * Play error sound (incorrect answer)
     */
    playError() {
        if (!this.isSoundEnabled()) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        // Descending notes
        oscillator.frequency.setValueAtTime(392.00, this.audioContext.currentTime); // G4
        oscillator.frequency.setValueAtTime(293.66, this.audioContext.currentTime + 0.15); // D4
        
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    /**
     * Play click sound (button press)
     */
    playClick() {
        if (!this.isSoundEnabled()) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }
    
    /**
     * Play celebration sound (achievement unlocked, session complete)
     */
    playCelebration() {
        if (!this.isSoundEnabled()) return;
        
        const times = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
        const frequencies = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1568.00]; // C5-E5-G5-C6-E6-G6
        
        times.forEach((time, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.sfxGainNode);
            
            oscillator.frequency.value = frequencies[i];
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime + time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + time + 0.15);
            
            oscillator.start(this.audioContext.currentTime + time);
            oscillator.stop(this.audioContext.currentTime + time + 0.15);
        });
    }
    
    /**
     * Play countdown tick (3...2...1...)
     */
    playCountdownTick() {
        if (!this.isSoundEnabled()) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        oscillator.frequency.value = 600;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    /**
     * Play countdown complete (Go!)
     */
    playCountdownGo() {
        if (!this.isSoundEnabled()) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime + 0.1);
        
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    /**
     * Play notification sound
     */
    playNotification() {
        if (!this.isSoundEnabled()) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5
        oscillator.frequency.setValueAtTime(1046.50, this.audioContext.currentTime + 0.1); // C6
        
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    /**
     * Vibrate (if enabled and supported)
     */
    vibrate(pattern = [50]) {
        if (this.settingsManager && 
            this.settingsManager.getSetting('vibration') && 
            'vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }
    
    /**
     * Update volume levels
     */
    updateVolume() {
        if (!this.audioContext) return;
        
        const soundEnabled = this.settingsManager?.getSetting('soundEffects');
        const musicEnabled = this.settingsManager?.getSetting('music');
        
        if (this.sfxGainNode) {
            this.sfxGainNode.gain.value = soundEnabled ? 0.5 : 0;
        }
        
        if (this.musicGainNode) {
            this.musicGainNode.gain.value = musicEnabled ? 0.3 : 0;
        }
    }
    
    /**
     * Resume audio context (required for some browsers after user interaction)
     */
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
}
