/**
 * Confetti Animation Library
 * Canvas-based particle system for celebrations
 */

export default class ConfettiAnimation {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.colors = [
            '#06FFA5', // Success green
            '#5E60CE', // Primary purple
            '#FECA57', // Warning yellow
            '#FF6B6B', // Error red
            '#48DBF B', // Info blue
            '#F59E0B', // Amber
            '#EC4899', // Pink
            '#10B981'  // Emerald
        ];
    }

    /**
     * Create and setup canvas
     * @returns {HTMLCanvasElement} Canvas element
     */
    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        return canvas;
    }

    /**
     * Create a confetti particle
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} options - Particle options
     * @returns {Object} Particle object
     */
    createParticle(x, y, options = {}) {
        const angle = options.angle || (Math.random() * Math.PI * 2);
        const velocity = options.velocity || (Math.random() * 10 + 5);
        
        return {
            x: x,
            y: y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity - Math.random() * 10,
            gravity: options.gravity || 0.5,
            friction: options.friction || 0.99,
            opacity: 1,
            fadeRate: options.fadeRate || 0.015,
            size: options.size || (Math.random() * 10 + 5),
            color: options.color || this.colors[Math.floor(Math.random() * this.colors.length)],
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            shape: options.shape || (Math.random() > 0.5 ? 'square' : 'circle')
        };
    }

    /**
     * Update particle physics
     * @param {Object} particle - Particle to update
     */
    updateParticle(particle) {
        particle.vy += particle.gravity;
        particle.vx *= particle.friction;
        particle.vy *= particle.friction;
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        particle.rotation += particle.rotationSpeed;
        particle.opacity -= particle.fadeRate;
    }

    /**
     * Draw a particle
     * @param {Object} particle - Particle to draw
     */
    drawParticle(particle) {
        if (!this.ctx) return;
        
        this.ctx.save();
        this.ctx.globalAlpha = particle.opacity;
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);
        
        this.ctx.fillStyle = particle.color;
        
        if (particle.shape === 'circle') {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (particle.shape === 'square') {
            this.ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        } else if (particle.shape === 'triangle') {
            this.ctx.beginPath();
            this.ctx.moveTo(0, -particle.size / 2);
            this.ctx.lineTo(particle.size / 2, particle.size / 2);
            this.ctx.lineTo(-particle.size / 2, particle.size / 2);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    /**
     * Animation loop
     */
    animate() {
        if (!this.ctx || !this.canvas) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles = this.particles.filter(particle => {
            this.updateParticle(particle);
            
            // Remove if off-screen or fully faded
            if (particle.opacity <= 0 || particle.y > this.canvas.height + 50) {
                return false;
            }
            
            this.drawParticle(particle);
            return true;
        });
        
        // Continue animation if particles remain
        if (this.particles.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.cleanup();
        }
    }

    /**
     * Cleanup canvas and stop animation
     */
    cleanup() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
    }

    /**
     * Burst effect - explosion from center
     * @param {Object} options - Burst options
     */
    burst(options = {}) {
        const x = options.x || window.innerWidth / 2;
        const y = options.y || window.innerHeight / 2;
        const count = options.count || 50;
        const colors = options.colors || this.colors;
        
        if (!this.canvas) {
            document.body.appendChild(this.createCanvas());
        }
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const particle = this.createParticle(x, y, {
                angle: angle + (Math.random() - 0.5) * 0.5,
                velocity: Math.random() * 15 + 10,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 12 + 6
            });
            this.particles.push(particle);
        }
        
        if (!this.animationId) {
            this.animate();
        }
    }

    /**
     * Cascade effect - rain from top
     * @param {Object} options - Cascade options
     */
    cascade(options = {}) {
        const count = options.count || 100;
        const duration = options.duration || 3000;
        const colors = options.colors || this.colors;
        
        if (!this.canvas) {
            document.body.appendChild(this.createCanvas());
        }
        
        const interval = duration / count;
        let created = 0;
        
        const createParticle = () => {
            if (created >= count) {
                clearInterval(timer);
                return;
            }
            
            const x = Math.random() * this.canvas.width;
            const y = -50;
            
            const particle = this.createParticle(x, y, {
                angle: Math.PI / 2,
                velocity: Math.random() * 5 + 3,
                gravity: 0.3,
                color: colors[Math.floor(Math.random() * colors.length)],
                fadeRate: 0.008
            });
            
            this.particles.push(particle);
            created++;
            
            if (!this.animationId) {
                this.animate();
            }
        };
        
        const timer = setInterval(createParticle, interval);
        createParticle(); // Create first one immediately
    }

    /**
     * Fountain effect - upward stream
     * @param {Object} options - Fountain options
     */
    fountain(options = {}) {
        const x = options.x || window.innerWidth / 2;
        const y = options.y || window.innerHeight;
        const duration = options.duration || 2000;
        const colors = options.colors || this.colors;
        
        if (!this.canvas) {
            document.body.appendChild(this.createCanvas());
        }
        
        const startTime = Date.now();
        
        const createParticles = () => {
            const elapsed = Date.now() - startTime;
            
            if (elapsed > duration) {
                return;
            }
            
            for (let i = 0; i < 5; i++) {
                const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
                const particle = this.createParticle(x, y, {
                    angle: angle,
                    velocity: Math.random() * 20 + 15,
                    gravity: 0.8,
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
                this.particles.push(particle);
            }
            
            if (!this.animationId) {
                this.animate();
            }
            
            requestAnimationFrame(createParticles);
        };
        
        createParticles();
    }

    /**
     * Celebration effect - combination burst
     * @param {Object} options - Celebration options
     */
    celebrate(options = {}) {
        const type = options.type || 'burst';
        const colors = options.colors || this.colors;
        
        switch (type) {
            case 'burst':
                this.burst({ ...options, colors });
                break;
            case 'cascade':
                this.cascade({ ...options, colors });
                break;
            case 'fountain':
                this.fountain({ ...options, colors });
                break;
            case 'multi':
                // Multiple bursts
                this.burst({ ...options, colors, x: window.innerWidth * 0.3 });
                setTimeout(() => {
                    this.burst({ ...options, colors, x: window.innerWidth * 0.7 });
                }, 200);
                setTimeout(() => {
                    this.burst({ ...options, colors, x: window.innerWidth * 0.5 });
                }, 400);
                break;
            default:
                this.burst({ ...options, colors });
        }
    }

    /**
     * Achievement-themed confetti
     * @param {string} achievementType - Type of achievement
     */
    achievementCelebration(achievementType) {
        let colors;
        
        switch (achievementType) {
            case 'gold':
                colors = ['#FFD700', '#FFA500', '#FF8C00', '#FFFF00'];
                break;
            case 'silver':
                colors = ['#C0C0C0', '#D3D3D3', '#A9A9A9', '#DCDCDC'];
                break;
            case 'bronze':
                colors = ['#CD7F32', '#B87333', '#8B4513', '#D2691E'];
                break;
            default:
                colors = this.colors;
        }
        
        this.celebrate({ type: 'multi', colors, count: 60 });
    }

    /**
     * Perfect score celebration
     */
    perfectScore() {
        this.celebrate({
            type: 'multi',
            colors: ['#06FFA5', '#5E60CE', '#48DBFB', '#10B981'],
            count: 80
        });
    }

    /**
     * Level up celebration
     */
    levelUp() {
        this.celebrate({
            type: 'fountain',
            duration: 3000,
            colors: ['#FECA57', '#F59E0B', '#FF6B6B', '#EC4899']
        });
    }
}
