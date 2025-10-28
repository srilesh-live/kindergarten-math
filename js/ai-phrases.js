/**
 * AI-Driven Phrase Generation System
 * Creates engaging, child-friendly phrases with contextual awareness
 */

import { AI_CONFIG } from './config.js';

export class AIPhrasesEngine {
    constructor() {
        this.phraseDatabase = this.initializePhraseDatabase();
        this.contextualModifiers = this.initializeContextualModifiers();
        this.personalityTraits = this.initializePersonalityTraits();
        this.usageHistory = new Map(); // Track phrase usage to avoid repetition
    }

    /**
     * Initialize the comprehensive phrase database
     */
    initializePhraseDatabase() {
        return {
            // Encouragement phrases for different situations
            encouragement: {
                starting: [
                    "Ready to explore the magical world of numbers? 🌟",
                    "Let's discover amazing number secrets together! 🔍✨",
                    "Your math adventure is about to begin! 🚀",
                    "Time to become a number superhero! 🦸‍♀️🔢",
                    "Let's unlock the mysteries of mathematics! 🗝️📚"
                ],
                struggling: [
                    "Every expert was once a beginner - you're doing great! 💪",
                    "Mistakes are just learning opportunities in disguise! 🎭",
                    "Your brain is growing stronger with each try! 🧠💪",
                    "Even the greatest mathematicians needed practice! 🏆",
                    "You're building your math superpowers step by step! ⚡"
                ],
                progress: [
                    "Look how much you've learned already! 🌱➡️🌳",
                    "Your math skills are blooming beautifully! 🌸",
                    "You're becoming a true number wizard! 🧙‍♂️✨",
                    "Each question makes you smarter! 🧠⬆️",
                    "You're on a fantastic learning journey! 🛤️🎒"
                ],
                breakthrough: [
                    "Wow! You just unlocked a new math superpower! 🔓⚡",
                    "That 'aha!' moment was pure magic! ✨💡",
                    "You've discovered something amazing! 🔍🎉",
                    "Your brain just made an incredible connection! 🧠🔗",
                    "You're thinking like a true mathematician now! 🤔🏆"
                ]
            },

            // Celebration phrases for correct answers
            celebration: {
                excellent: [
                    "Absolutely stellar work! ⭐🌟✨",
                    "You're a mathematical genius! 🧠👑",
                    "That was pure number magic! 🎩🔢✨",
                    "Incredible! Your math powers are amazing! 💫⚡",
                    "You've mastered that like a true champion! 🏆👨‍🎓"
                ],
                good: [
                    "Fantastic job! Keep that momentum going! 🚀",
                    "You nailed it! High five! 🙌",
                    "Brilliant work! You're on fire! 🔥",
                    "Excellent thinking! You've got this! 💪",
                    "Way to go! You're a math star! ⭐"
                ],
                correct: [
                    "Perfect! You solved it! 🎯",
                    "Yes! That's exactly right! ✅",
                    "Correct! You're amazing! 🌟",
                    "Bingo! You got it! 🎊",
                    "Right on target! 🏹🎯"
                ],
                improvement: [
                    "You're getting better every single time! 📈",
                    "Look at that progress! Spectacular! 🚀",
                    "You're learning so fast! 💨📚",
                    "Each answer shows how smart you are! 🧠✨",
                    "You're becoming unstoppable! 🦾"
                ]
            },

            // Guidance phrases for hints and help
            guidance: {
                gentle_hints: [
                    "Here's a little secret to help you... 🤫✨",
                    "Let me share a helpful trick... 🎩🔧",
                    "Think about it this way... 💭💡",
                    "Here's a clue to guide your thinking... 🗺️",
                    "Consider this magical hint... ✨🔮"
                ],
                strategy_hints: [
                    "Try breaking it into smaller pieces... 🧩",
                    "What patterns do you notice? 🔍👀",
                    "Sometimes counting helps unlock the answer... 🔢➡️💡",
                    "Look for the hidden connections... 🔗🔍",
                    "Trust your mathematical instincts... 🧠⚡"
                ],
                encouragement_hints: [
                    "You're closer than you think! 🎯",
                    "Your next try might be the perfect one! 🍀",
                    "You have all the tools you need! 🧰✨",
                    "Believe in your amazing abilities! 💪🌟",
                    "You're about to crack the code! 🔐💥"
                ]
            },

            // Curiosity-sparking phrases
            curiosity: [
                "Did you know numbers have their own personalities? 🔢😊",
                "Mathematics is like a secret language of the universe! 🌌🗣️",
                "Every number tells a unique story... 📖✨",
                "Math is everywhere - in flowers, music, and stars! 🌸🎵⭐",
                "Numbers are the building blocks of everything amazing! 🧱🏗️",
                "Patterns in math are like fingerprints - each one is special! 👆🔍",
                "Math helps us understand the magic in everyday life! 🎪✨"
            ],

            // Achievement celebration phrases
            achievements: {
                milestones: [
                    "🏆 LEGENDARY! You've reached an incredible milestone!",
                    "🎉 AMAZING! You're officially a math champion!",
                    "✨ SPECTACULAR! You've unlocked elite status!",
                    "🌟 OUTSTANDING! You're in the hall of fame!",
                    "🚀 PHENOMENAL! You've reached the stars!"
                ],
                streaks: [
                    "🔥 You're on an unstoppable winning streak!",
                    "⚡ Lightning fast and accurate - incredible!",
                    "🎯 Perfect precision - you're in the zone!",
                    "💫 Your consistency is absolutely magical!",
                    "🏃‍♀️ You're racing through these problems like a champion!"
                ],
                mastery: [
                    "🎓 MASTERY ACHIEVED! You've conquered this skill!",
                    "👑 You're now the ruler of this math domain!",
                    "🧙‍♂️ WIZARD STATUS! You've mastered the magic!",
                    "🦸‍♀️ SUPERHERO LEVEL! Your powers have evolved!",
                    "🏅 EXPERT BADGE EARNED! You're officially amazing!"
                ]
            },

            // Time-specific greetings
            timeGreetings: {
                morning: [
                    "Good morning, math explorer! Ready for today's adventure? 🌅",
                    "Rise and shine! Let's make today mathematically amazing! ☀️",
                    "Morning, superstar! Your brain is fresh and ready! 🌤️"
                ],
                afternoon: [
                    "Good afternoon! Hope you're having a fantastic day! 🌤️",
                    "Afternoon, champion! Ready for some number fun? ☀️",
                    "Hello there! Perfect time for a math adventure! 🌞"
                ],
                evening: [
                    "Good evening! Let's wind down with some gentle math magic! 🌙",
                    "Evening, star! Ready for some peaceful problem-solving? ⭐",
                    "Hello! Let's end the day with mathematical wonders! 🌆"
                ]
            },

            // Seasonal and special phrases
            seasonal: {
                spring: ["Spring into action with fresh math energy! 🌸"],
                summer: ["Summer learning is the coolest adventure! 🏖️"],
                fall: ["Fall in love with numbers this autumn! 🍁"],
                winter: ["Warm up your brain with cozy math problems! ❄️"]
            }
        };
    }

    /**
     * Initialize contextual modifiers for dynamic phrase generation
     */
    initializeContextualModifiers() {
        return {
            difficulty: {
                easy: ["gentle", "simple", "easy-peasy", "cozy"],
                medium: ["exciting", "interesting", "cool", "neat"],
                hard: ["challenging", "advanced", "tricky", "complex"]
            },
            performance: {
                excellent: ["amazing", "spectacular", "incredible", "phenomenal"],
                good: ["great", "awesome", "fantastic", "wonderful"],
                improving: ["better", "progressing", "developing", "growing"],
                struggling: ["brave", "persistent", "determined", "strong"]
            },
            emotion: {
                confident: ["confidently", "boldly", "fearlessly"],
                curious: ["curiously", "wonderingly", "exploringly"],
                excited: ["enthusiastically", "eagerly", "joyfully"],
                calm: ["peacefully", "calmly", "serenely"]
            }
        };
    }

    /**
     * Initialize personality trait modifiers
     */
    initializePersonalityTraits() {
        return {
            adventurous: {
                prefix: "brave explorer",
                style: "adventure-themed",
                emojis: ["🗺️", "🧭", "⚔️", "🏔️"]
            },
            creative: {
                prefix: "artistic genius",
                style: "creative-themed",
                emojis: ["🎨", "🖌️", "✨", "🌈"]
            },
            scientific: {
                prefix: "young scientist",
                style: "discovery-themed",
                emojis: ["🔬", "🧪", "🔍", "💡"]
            },
            magical: {
                prefix: "math wizard",
                style: "fantasy-themed",
                emojis: ["🧙‍♀️", "⚡", "🔮", "✨"]
            }
        };
    }

    /**
     * Generate contextual phrase based on situation and user data
     */
    generatePhrase(category, context = {}) {
        const {
            subcategory = 'general',
            difficulty = 'medium',
            performance = 'good',
            personality = 'magical',
            timeOfDay = this.getTimeOfDay(),
            streakCount = 0,
            isFirstTime = false,
            previousErrors = 0,
            sessionProgress = 0
        } = context;

        let basePhrase = this.selectBasePhrase(category, subcategory, context);
        
        // Add contextual enhancements
        basePhrase = this.addPersonalityFlair(basePhrase, personality);
        basePhrase = this.addPerformanceModifier(basePhrase, performance);
        basePhrase = this.addStreakBonus(basePhrase, streakCount);
        basePhrase = this.addProgressContext(basePhrase, sessionProgress);

        // Track usage to avoid repetition
        this.trackPhraseUsage(category, basePhrase);

        return basePhrase;
    }

    /**
     * Select base phrase avoiding recent usage
     */
    selectBasePhrase(category, subcategory, context) {
        const phrases = this.phraseDatabase[category];
        if (!phrases) return "Great work! 🌟";

        const availablePhrases = subcategory && phrases[subcategory] 
            ? phrases[subcategory] 
            : phrases;

        if (Array.isArray(availablePhrases)) {
            // Filter out recently used phrases
            const recentlyUsed = this.usageHistory.get(`${category}_${subcategory}`) || [];
            const freshPhrases = availablePhrases.filter(phrase => 
                !recentlyUsed.includes(phrase)
            );
            
            const candidates = freshPhrases.length > 0 ? freshPhrases : availablePhrases;
            return candidates[Math.floor(Math.random() * candidates.length)];
        }

        return availablePhrases;
    }

    /**
     * Add personality-based modifications to phrases
     */
    addPersonalityFlair(phrase, personality) {
        const trait = this.personalityTraits[personality];
        if (!trait) return phrase;

        // Add personality-appropriate emoji
        const emoji = trait.emojis[Math.floor(Math.random() * trait.emojis.length)];
        
        // Sometimes replace generic terms with personality-specific ones
        if (Math.random() < 0.3) {
            phrase = phrase.replace(/you/gi, trait.prefix);
        }

        return `${phrase} ${emoji}`;
    }

    /**
     * Add performance-based enthusiasm modifiers
     */
    addPerformanceModifier(phrase, performance) {
        const modifiers = this.contextualModifiers.performance[performance];
        if (!modifiers || Math.random() < 0.5) return phrase;

        const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
        return phrase.replace(/great|good|nice/gi, modifier);
    }

    /**
     * Add streak bonuses for consecutive successes
     */
    addStreakBonus(phrase, streakCount) {
        if (streakCount < 3) return phrase;

        const bonuses = [
            ` 🔥 ${streakCount} in a row!`,
            ` ⚡ Amazing ${streakCount}-streak!`,
            ` 🌟 ${streakCount} perfect answers!`,
            ` 🏆 ${streakCount} consecutive wins!`
        ];

        return phrase + bonuses[Math.floor(Math.random() * bonuses.length)];
    }

    /**
     * Add session progress context
     */
    addProgressContext(phrase, progress) {
        if (progress < 0.25) return phrase;
        if (progress < 0.5) return phrase + " You're building momentum! 🚀";
        if (progress < 0.75) return phrase + " Halfway to mastery! 📈";
        return phrase + " Almost there, champion! 🎯";
    }

    /**
     * Generate adaptive encouragement based on struggle patterns
     */
    generateAdaptiveEncouragement(strugglingAreas, strengths) {
        const encouragements = [];

        // Acknowledge strengths first
        if (strengths.length > 0) {
            const strength = strengths[0];
            encouragements.push(`You're absolutely crushing ${strength}! 💪`);
        }

        // Provide gentle guidance for struggles
        if (strugglingAreas.length > 0) {
            const area = strugglingAreas[0];
            encouragements.push(`Let's explore ${area} together - you've got this! 🤝`);
        }

        // Add growth mindset reinforcement
        encouragements.push("Every challenge makes your brain stronger! 🧠💪");

        return encouragements.join(' ');
    }

    /**
     * Generate celebration message for achievements
     */
    generateAchievementCelebration(achievementType, milestone) {
        const base = this.phraseDatabase.achievements[achievementType] || 
                    this.phraseDatabase.achievements.milestones;
        
        const phrase = base[Math.floor(Math.random() * base.length)];
        
        return `${phrase}\n🎊 ${milestone.description} 🎊`;
    }

    /**
     * Get current time of day for contextual greetings
     */
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        return 'evening';
    }

    /**
     * Track phrase usage to prevent repetition
     */
    trackPhraseUsage(category, phrase) {
        const key = `${category}`;
        const history = this.usageHistory.get(key) || [];
        
        history.push(phrase);
        
        // Keep only last 5 phrases to allow eventual reuse
        if (history.length > 5) {
            history.shift();
        }
        
        this.usageHistory.set(key, history);
    }

    /**
     * Generate dynamic hint based on problem type and user history
     */
    generateSmartHint(problemType, previousAttempts, userPattern) {
        const hints = {
            arithmetic: {
                addition: [
                    "Try counting up from the bigger number! 🔢⬆️",
                    "Use your fingers or draw dots to help! ✋🔵",
                    "Break it into smaller, easier parts! 🧩"
                ],
                subtraction: [
                    "Count backwards from the first number! ⬇️🔢",
                    "Think: what do we add to get the first number? 🤔➕",
                    "Use objects to take away the amount! 📦➡️🗑️"
                ]
            },
            patterns: [
                "Look for what changes between each number! 👀🔄",
                "What rule connects all these numbers? 🔗📏",
                "Try saying the numbers out loud - hear the pattern! 🗣️👂"
            ],
            time: [
                "Remember: the short hand shows hours! ⏰👆",
                "The long hand points to minutes! ⏰✋",
                "Count by 5s around the clock! 5️⃣🔄"
            ]
        };

        const categoryHints = hints[problemType] || hints.patterns;
        const relevantHints = Array.isArray(categoryHints) ? categoryHints : categoryHints.addition;
        
        // Select hint based on attempt number to provide progressive guidance
        const hintIndex = Math.min(previousAttempts, relevantHints.length - 1);
        return relevantHints[hintIndex];
    }

    /**
     * Generate motivational message based on session analytics
     */
    generateSessionMotivation(analytics) {
        const {
            questionsAttempted = 0,
            correctAnswers = 0,
            averageTime = 0,
            improvementTrend = 'stable'
        } = analytics;

        const accuracy = questionsAttempted > 0 ? correctAnswers / questionsAttempted : 0;

        if (accuracy >= 0.9) {
            return "You're absolutely on fire today! 🔥✨ Your accuracy is phenomenal!";
        }
        
        if (accuracy >= 0.75) {
            return "Fantastic work! You're getting most of these right! 🌟👏";
        }
        
        if (improvementTrend === 'improving') {
            return "I can see you're getting better with each question! 📈💪 Keep it up!";
        }

        return "You're learning and growing with every attempt! 🌱📚 That's what matters most!";
    }
}

export default AIPhrasesEngine;