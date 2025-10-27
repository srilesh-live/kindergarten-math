/**
 * Public Configuration for Kindergarten Math App
 * 
 * NOTE: These values are intentionally public as they're used in client-side code.
 * Security is enforced through Supabase Row Level Security (RLS) policies.
 * 
 * The anon key has limited permissions and can only perform actions
 * that are explicitly allowed by your RLS policies.
 */

window.APP_CONFIG = {
    supabase: {
        url: 'https://aajuzlivkbnmlyqjuxxf.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhanV6bGl2a2JubWx5cWp1eHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDAxNjMsImV4cCI6MjA3NzAxNjE2M30.zks4gHHsCn-Ebhe6dt7Q9FXXsMtq95wJ2oy7P9NrAJs'
    },
    
    // App-specific settings
    app: {
        name: 'Kindergarten Math',
        version: '1.0.0',
        domain: 'math.xiva.us'
    }
};

/**
 * Global Modal System - Available on all pages
 */
window.ModalSystem = {
    /**
     * Show alert modal
     */
    showAlert(message, title = 'Notice') {
        return this.showModal({
            title: title,
            message: message,
            type: 'alert',
            buttons: [
                { text: 'OK', action: 'close', primary: true }
            ]
        });
    },

    /**
     * Show confirmation dialog
     */
    showConfirm(message, title = 'Confirm') {
        return new Promise((resolve) => {
            this.showModal({
                title: title,
                message: message,
                type: 'confirm',
                buttons: [
                    { 
                        text: 'Cancel', 
                        action: 'cancel', 
                        secondary: true, 
                        callback: () => resolve(false)
                    },
                    { 
                        text: 'Confirm', 
                        action: 'confirm', 
                        primary: true, 
                        callback: () => resolve(true)
                    }
                ]
            });
        });
    },

    /**
     * Show custom modal
     */
    showModal(config) {
        const { title, message, type, buttons } = config;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('universal-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal HTML
        const modal = document.createElement('div');
        modal.id = 'universal-modal';
        modal.className = 'universal-modal';
        
        const buttonsHtml = buttons.map(btn => {
            const classes = ['modal-btn'];
            if (btn.primary) classes.push('primary');
            if (btn.secondary) classes.push('secondary');
            if (btn.danger) classes.push('danger');
            
            return `<button class="${classes.join(' ')}" data-action="${btn.action}">${btn.text}</button>`;
        }).join('');

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">${title}</div>
                </div>
                <div class="modal-message">${message}</div>
                <div class="modal-actions">
                    ${buttonsHtml}
                </div>
            </div>
        `;

        // Add event listeners
        buttons.forEach((btn, index) => {
            const buttonEl = modal.querySelectorAll('.modal-btn')[index];
            buttonEl.addEventListener('click', () => {
                if (btn.callback && typeof btn.callback === 'function') {
                    btn.callback();
                }
                this.hideModal();
            });
        });

        // Add click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });

        // Add escape key handler
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Add to DOM and show
        document.body.appendChild(modal);
        
        // Trigger animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        return modal;
    },

    /**
     * Hide modal
     */
    hideModal() {
        const modal = document.getElementById('universal-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }
};