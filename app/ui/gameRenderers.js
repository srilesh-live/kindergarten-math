/**
 * Game Renderers - Visual representation for each game type
 * Renders questions and visual aids for all 4 game types
 */

import { showToast } from './components.js';

/**
 * Base Game Renderer
 */
class BaseGameRenderer {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
    }

    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    createElement(type, className, content) {
        const elem = document.createElement(type);
        if (className) elem.className = className;
        if (content) elem.innerHTML = content;
        return elem;
    }
}

/**
 * Basic Arithmetic Renderer
 */
export class BasicArithmeticRenderer extends BaseGameRenderer {
    render(problem, visualData) {
        this.clear();

        const questionDiv = this.createElement('div', 'km-question-wrapper');
        
        // Render question text
        const questionText = this.createElement('h3', 'km-question-text', 
            `${problem.question.text || problem.question}`);
        questionDiv.appendChild(questionText);

        // Render visual representation
        if (visualData && visualData.html) {
            const visualDiv = this.createElement('div', 'km-visual-math');
            visualDiv.innerHTML = visualData.html;
            questionDiv.appendChild(visualDiv);
        }

        // Render answer options
        const optionsDiv = this.createElement('div', 'km-answer-options');
        
        if (problem.options && problem.options.length > 0) {
            problem.options.forEach((option, index) => {
                const btn = this.createElement('button', 
                    'km-button km-button--outlined km-answer-btn', 
                    `<span class="km-answer-number">${index + 1}</span> <span class="km-answer-value">${option}</span>`);
                
                btn.setAttribute('data-answer', option);
                btn.setAttribute('aria-label', `Answer ${index + 1}: ${option}. Press ${index + 1} to select.`);
                
                optionsDiv.appendChild(btn);
            });
        }

        questionDiv.appendChild(optionsDiv);
        this.container.appendChild(questionDiv);

        return questionDiv;
    }
}

/**
 * Number Sequences Renderer
 */
export class NumberSequencesRenderer extends BaseGameRenderer {
    render(problem, visualData) {
        this.clear();

        const questionDiv = this.createElement('div', 'km-question-wrapper');
        
        // Render question text
        const questionText = this.createElement('h3', 'km-question-text', 
            problem.question.text || problem.question);
        questionDiv.appendChild(questionText);

        // Render visual pattern
        if (visualData && visualData.html) {
            const visualDiv = this.createElement('div', 'km-visual-pattern');
            visualDiv.innerHTML = visualData.html;
            questionDiv.appendChild(visualDiv);
        }

        // Render answer options
        const optionsDiv = this.createElement('div', 'km-answer-options');
        
        if (problem.options && problem.options.length > 0) {
            problem.options.forEach((option, index) => {
                const btn = this.createElement('button', 
                    'km-button km-button--outlined km-answer-btn', 
                    `<span class="km-answer-number">${index + 1}</span> <span class="km-answer-value">${option}</span>`);
                
                btn.setAttribute('data-answer', option);
                btn.setAttribute('aria-label', `Answer ${index + 1}: ${option}. Press ${index + 1} to select.`);
                
                optionsDiv.appendChild(btn);
            });
        }

        questionDiv.appendChild(optionsDiv);
        this.container.appendChild(questionDiv);

        return questionDiv;
    }
}

/**
 * Time & Clock Renderer
 */
export class TimeClockRenderer extends BaseGameRenderer {
    render(problem, visualData) {
        this.clear();

        const questionDiv = this.createElement('div', 'km-question-wrapper');
        
        // Render question text
        const questionText = this.createElement('h3', 'km-question-text', 
            problem.question.text || problem.question);
        questionDiv.appendChild(questionText);

        // Render clock visual
        if (visualData && visualData.html) {
            const visualDiv = this.createElement('div', 'km-visual-clock');
            visualDiv.innerHTML = visualData.html;
            questionDiv.appendChild(visualDiv);
        }

        // Render answer options
        const optionsDiv = this.createElement('div', 'km-answer-options');
        
        if (problem.options && problem.options.length > 0) {
            problem.options.forEach((option, index) => {
                const btn = this.createElement('button', 
                    'km-button km-button--outlined km-answer-btn', 
                    `<span class="km-answer-number">${index + 1}</span> <span class="km-answer-value">${option}</span>`);
                
                btn.setAttribute('data-answer', option);
                btn.setAttribute('aria-label', `Answer ${index + 1}: ${option}. Press ${index + 1} to select.`);
                
                optionsDiv.appendChild(btn);
            });
        }

        questionDiv.appendChild(optionsDiv);
        this.container.appendChild(questionDiv);

        return questionDiv;
    }
}

/**
 * Money Math Renderer
 */
export class MoneyMathRenderer extends BaseGameRenderer {
    render(problem, visualData) {
        this.clear();

        const questionDiv = this.createElement('div', 'km-question-wrapper');
        
        // Render question text
        const questionText = this.createElement('h3', 'km-question-text', 
            problem.question.text || problem.question);
        questionDiv.appendChild(questionText);

        // Render money visual
        if (visualData && visualData.html) {
            const visualDiv = this.createElement('div', 'km-visual-money');
            visualDiv.innerHTML = visualData.html;
            questionDiv.appendChild(visualDiv);
        }

        // Render answer options
        const optionsDiv = this.createElement('div', 'km-answer-options');
        
        if (problem.options && problem.options.length > 0) {
            problem.options.forEach((option, index) => {
                const btn = this.createElement('button', 
                    'km-button km-button--outlined km-answer-btn', 
                    `<span class="km-answer-number">${index + 1}</span> <span class="km-answer-value">${option}</span>`);
                
                btn.setAttribute('data-answer', option);
                btn.setAttribute('aria-label', `Answer ${index + 1}: ${option}. Press ${index + 1} to select.`);
                
                optionsDiv.appendChild(btn);
            });
        }

        questionDiv.appendChild(optionsDiv);
        this.container.appendChild(questionDiv);

        return questionDiv;
    }
}

/**
 * Unified Game Renderer Factory
 */
export class GameRendererFactory {
    static create(gameType, containerSelector) {
        switch (gameType) {
            case 'basic-arithmetic':
                return new BasicArithmeticRenderer(containerSelector);
            case 'number-sequences':
                return new NumberSequencesRenderer(containerSelector);
            case 'time-clock':
                return new TimeClockRenderer(containerSelector);
            case 'money-math':
                return new MoneyMathRenderer(containerSelector);
            default:
                console.warn(`Unknown game type: ${gameType}, using BasicArithmeticRenderer`);
                return new BasicArithmeticRenderer(containerSelector);
        }
    }
}

export default GameRendererFactory;
