/**
 * Clean Authentication System - Pure Tailwind Version
 */

class AuthSystem {
    constructor() {
        this.modal = document.getElementById('auth-modal');
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        this.forgotForm = document.getElementById('forgot-form');
        
        this.initializeEvents();
    }

    initializeEvents() {
        // Modal triggers
        document.getElementById('login-btn').addEventListener('click', () => this.showModal('login'));
        document.getElementById('register-btn').addEventListener('click', () => this.showModal('register'));
        document.getElementById('modal-close').addEventListener('click', () => this.hideModal());
        
        // Form switching
        document.getElementById('forgot-password-btn').addEventListener('click', () => this.switchForm('forgot'));
        document.querySelector('#switch-to-register button').addEventListener('click', () => this.switchForm('register'));
        document.querySelector('#switch-to-login button').addEventListener('click', () => this.switchForm('login'));
        document.querySelector('#back-to-login button').addEventListener('click', () => this.switchForm('login'));
        
        // Form submissions
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        this.forgotForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
        
        // Close on backdrop click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hideModal();
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('invisible')) {
                this.hideModal();
            }
        });
    }

    showModal(type = 'login') {
        this.modal.classList.remove('opacity-0', 'invisible');
        this.modal.querySelector('div').classList.remove('scale-90');
        this.modal.querySelector('div').classList.add('scale-100');
        this.switchForm(type);
    }

    hideModal() {
        this.modal.querySelector('div').classList.remove('scale-100');
        this.modal.querySelector('div').classList.add('scale-90');
        this.modal.classList.add('opacity-0', 'invisible');
        
        // Reset forms
        setTimeout(() => {
            this.loginForm.reset();
            this.registerForm.reset();
            this.forgotForm.reset();
        }, 300);
    }

    switchForm(type) {
        // Hide all forms
        this.loginForm.classList.add('hidden');
        this.registerForm.classList.add('hidden');
        this.forgotForm.classList.add('hidden');
        
        // Hide all switch links
        document.getElementById('switch-to-register').classList.add('hidden');
        document.getElementById('switch-to-login').classList.add('hidden');
        document.getElementById('back-to-login').classList.add('hidden');
        
        // Show appropriate form and links
        switch (type) {
            case 'login':
                document.getElementById('modal-title').textContent = 'Sign In';
                this.loginForm.classList.remove('hidden');
                document.getElementById('switch-to-register').classList.remove('hidden');
                break;
            case 'register':
                document.getElementById('modal-title').textContent = 'Create Account';
                this.registerForm.classList.remove('hidden');
                document.getElementById('switch-to-login').classList.remove('hidden');
                break;
            case 'forgot':
                document.getElementById('modal-title').textContent = 'Reset Password';
                this.forgotForm.classList.remove('hidden');
                document.getElementById('back-to-login').classList.remove('hidden');
                break;
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        
        // Simulate login (replace with actual authentication)
        console.log('Login attempt:', { email, password });
        
        // For demo purposes, always succeed
        setTimeout(() => {
            this.hideModal();
            window.location.href = 'pages/home.html';
        }, 500);
    }

    handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        // Basic validation
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        // Simulate registration (replace with actual authentication)
        console.log('Registration attempt:', { name, email, password });
        
        // For demo purposes, always succeed
        setTimeout(() => {
            this.hideModal();
            window.location.href = 'pages/home.html';
        }, 500);
    }

    handleForgotPassword(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        
        // Simulate password reset (replace with actual functionality)
        console.log('Password reset for:', email);
        
        alert('Password reset instructions have been sent to your email!');
        this.switchForm('login');
    }
}