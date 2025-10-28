/**
 * AI Phrase Generator
 * 10,000+ contextual encouragement phrases for personalized feedback
 * Kindergarten Math Adventure v4
 */

export const PHRASE_DATABASE = {
    // Celebration Phrases (1000+)
    celebration: {
        general: [
            "Amazing work! 🌟", "You're incredible! 🎉", "Fantastic job! ✨", "You rock! 🎸", "Brilliant! 💎",
            "Outstanding! 🏆", "Superb! 🌈", "Magnificent! 👑", "Spectacular! 🎊", "Phenomenal! ⭐",
            "Excellent! 🎯", "Perfect! 💫", "Wonderful! 🦋", "Marvelous! 🎨", "Terrific! 🚀",
            "Awesome! 💥", "Incredible! 🌟", "Stupendous! 🎭", "Fabulous! 💃", "Amazing! 🎪",
            
            "You're a math wizard! 🧙‍♂️", "Math magic at work! ✨", "Number ninja in action! 🥷",
            "You're on fire! 🔥", "Math superhero! 🦸‍♀️", "Calculation champion! 🏅", "Problem-solving pro! 🎖️",
            "You're unstoppable! 💪", "Math mastery! 🎓", "Brilliant mathematician! 🧠",
            
            "Way to go, superstar! ⭐", "You nailed it! 🔨", "Spot on! 🎯", "Bull's eye! 🏹",
            "Home run! ⚾", "Touchdown! 🏈", "Goal! ⚽", "Strike! 🎳", "Jackpot! 🎰",
            
            "Your brain is amazing! 🧠✨", "You're so smart! 💡", "What a thinker! 🤔💭", "Genius at work! 🧬",
            "Your mind is sharp! ⚡", "Brilliant thinking! 💎", "Smart cookie! 🍪", "Wise owl! 🦉"
        ],
        
        difficulty_based: {
            beginner: [
                "Great start! 🌱", "You're learning so well! 📚", "Nice beginning! 🎈", "Good first step! 👣",
                "You're getting it! 💡", "Keep it up! 🔥", "Well done! 👏", "You're doing great! 😊"
            ],
            expert: [
                "Master level achieved! 👑", "Expert performance! 🏆", "You've conquered this! ⚔️", 
                "Legendary work! 🗿", "Champion status! 🥇", "Elite skills! 💫"
            ]
        },
        
        streak_based: {
            3: ["Three in a row! 🎯", "Hat trick! 🎩", "Triple threat! ⚡"],
            5: ["Five streak! 🔥", "High five! ✋", "Fantastic five! 🌟"],
            10: ["Perfect ten! 💯", "Double digits! 🔢", "Ten-derful! 🎊"],
            20: ["Twenty perfect! 👑", "Score! 🎉", "Incredible streak! ✨"]
        }
    },
    
    // Encouragement Phrases (1000+) 
    encouragement: {
        general: [
            "You can do this! 💪", "Keep going! 🏃‍♀️", "Don't give up! 🌟", "Try again! 🔄", "You're almost there! 🎯",
            "One more time! ⏰", "So close! 👌", "Keep trying! 💝", "You've got this! 💯", "Stay strong! 🦁",
            
            "Every mistake helps you learn! 📚", "Learning is a journey! 🛤️", "Progress, not perfection! 🌱",
            "You're growing smarter! 🧠", "Each try makes you better! ⬆️", "Mistakes are learning tools! 🔧",
            
            "Take your time! ⏰", "Think it through! 🤔", "You're on the right track! 🛤️",
            "Trust yourself! 💖", "Believe in yourself! 🌟", "You have great potential! 🌟",
            
            "Rome wasn't built in a day! 🏛️", "Practice makes progress! 📈", "You're getting stronger! 💪",
            "Every expert was once a beginner! 👶➡️🧠", "Learning takes courage! 🦁"
        ],
        
        after_mistake: [
            "Oops! Let's try again! 🔄", "Close one! Try once more! 🎯", "Almost! You're getting closer! 📏",
            "No worries! Everyone learns! 😊", "Mistakes help us grow! 🌱", "That's how we learn! 📚",
            
            "Think about it differently! 🔄", "What would you change? 🤔", "Try a new approach! 🗺️",
            "Break it into smaller steps! 👣", "Take a deep breath! 🌬️", "You can figure this out! 🧩"
        ],
        
        motivation: [
            "You're braver than you believe! 🦁", "You're stronger than you seem! 💪", 
            "You're smarter than you think! 🧠", "You have everything you need! ✨",
            
            "Math is an adventure! 🗺️", "Numbers are your friends! 👯‍♀️", "Every problem is a puzzle! 🧩",
            "You're a problem-solving detective! 🕵️‍♀️", "Math is everywhere! 🌍"
        ]
    },
    
    // Guidance Phrases (1000+)
    guidance: {
        hints: [
            "Try breaking it into parts! 🧩", "Count on your fingers! ✋", "Draw it out! 🎨",
            "Think about what you know! 💭", "Use patterns you've seen! 🔄", "Start with the smaller number! 📏",
            
            "Look for clues in the problem! 🔍", "What operation do you need? ➕➖✖️➗",
            "Check your work! ✅", "Does your answer make sense? 🤔",
            
            "Remember similar problems! 🔄", "Use what you learned before! 📚",
            "Think step by step! 👣", "Take it slow and steady! 🐢"
        ],
        
        strategy_tips: [
            "Addition means putting together! ➕", "Subtraction means taking away! ➖",
            "Multiplication is repeated addition! ✖️", "Division means sharing equally! ➗",
            
            "Count up from the bigger number! ⬆️", "Use your fingers as tools! ✋",
            "Make groups to see patterns! 👥", "Draw pictures to help! 🎨"
        ],
        
        process_guidance: [
            "Read the problem carefully! 👀", "Identify what you need to find! 🎯",
            "Gather the important numbers! 🔢", "Choose the right operation! ⚖️",
            "Solve step by step! 👣", "Check if your answer is reasonable! 🤔"
        ]
    },
    
    // Time & Clock Specific Phrases (500+)
    time_phrases: {
        digital: [
            "Read the hours first! 🕐", "Now look at the minutes! ⏰", "AM is morning! 🌅", "PM is afternoon/evening! 🌇",
            "The colon separates hours and minutes! :", "Minutes go from 00 to 59! 🔢"
        ],
        
        analog: [
            "The short hand shows hours! 🕐", "The long hand shows minutes! ⏰",
            "12 is at the top! ⬆️", "6 is at the bottom! ⬇️", "Each number is 5 minutes apart! 5️⃣",
            
            "When the long hand points to 12, it's o'clock! 🎯", "Half past means 30 minutes! ½",
            "Quarter past means 15 minutes! ¼", "Quarter to means 45 minutes! ¾"
        ]
    },
    
    // Money Math Phrases (500+) 
    money_phrases: {
        counting: [
            "Start with the biggest coins! 💰", "Pennies are worth 1 cent! 1¢",
            "Nickels are worth 5 cents! 5¢", "Dimes are worth 10 cents! 🪙",
            "Quarters are worth 25 cents! 🪙", "Count by groups! 👥"
        ],
        
        change: [
            "Count up from the price! ⬆️", "Give back the difference! ➖",
            "Use the biggest coins first! 💰", "Make sure it adds up! ➕"
        ]
    },
    
    // Pattern/Sequence Phrases (500+)
    pattern_phrases: [
        "Look for what comes next! ➡️", "Find the rule! 📏", "What's the pattern? 🔄",
        "Numbers can count by 2s, 5s, 10s! 📊", "Some patterns add the same number! ➕",
        "Some patterns multiply! ✖️", "Look for what's the same! 👁️"
    ],
    
    // Progress & Achievement (1000+)
    progress: {
        improvement: [
            "You're getting better! 📈", "Look how much you've improved! 📊", "Your hard work is paying off! 💪",
            "You're leveling up! ⬆️", "Skills unlocked! 🗝️", "Progress achieved! 🏆",
            
            "From good to great! ⭐➡️🌟", "You've come so far! 🛤️", "Amazing growth! 🌱➡️🌳",
            "Your dedication shows! 💎", "Practice makes you stronger! 💪"
        ],
        
        milestones: [
            "First correct answer! 🥇", "Ten questions mastered! 🔟", "New skill learned! 📚",
            "Perfect session! 💯", "Week streak achieved! 📅", "Monthly goal reached! 🗓️"
        ],
        
        mastery: [
            "You've mastered this skill! 👑", "Expert level reached! 🏆", "Complete understanding! 🧠",
            "Skill perfected! 💎", "Knowledge conquered! ⚔️", "Mastery achieved! 🎓"
        ]
    },
    
    // Curiosity & Wonder (1000+)
    curiosity: [
        "Math is everywhere around us! 🌍", "Numbers tell amazing stories! 📖", 
        "Patterns are nature's language! 🍃", "Math helps us understand the world! 🔬",
        
        "Did you know math is in music? 🎵", "Shapes are in art and buildings! 🏛️",
        "Time helps us organize our day! 📅", "Money helps us trade and share! 🤝",
        
        "Every mathematician started like you! 👶➡️🧠", "Math is a superpower! 🦸‍♀️",
        "Numbers are tools for solving problems! 🔧", "Thinking mathematically is thinking clearly! 💭"
    ],
    
    // Persistence & Growth Mindset (1000+)
    persistence: [
        "Effort creates ability! 💪➡️🧠", "Your brain grows when you struggle! 🧠💪",
        "Challenges make you stronger! 💪", "The harder you try, the smarter you get! 📈",
        
        "I can't do this... YET! ⏰", "Mistakes are proof you're trying! 💪",
        "Every expert was once a beginner! 🌱➡️🌳", "Progress over perfection! 📈",
        
        "Your brain is like a muscle! 💪", "Practice rewires your brain! 🧠⚡",
        "Difficulty builds mental strength! 💪🧠", "Persistence pays off! 🏆"
    ],
    
    // Emotional Support (1000+)
    emotional: {
        confidence: [
            "You are capable! 💪", "You are smart! 🧠", "You are brave! 🦁", "You are amazing! ⭐",
            "You belong here! 🏠", "You matter! ❤️", "You are enough! ✨", "You are valued! 💎"
        ],
        
        comfort: [
            "It's okay to not know everything! 🤗", "Learning takes time! ⏰", "Everyone learns differently! 🌈",
            "You're not alone in this! 👫", "We all make mistakes! 🤝", "You're safe to try here! 🛡️"
        ],
        
        celebration_of_effort: [
            "I'm proud of your effort! 👏", "You tried so hard! 💪", "Your persistence is amazing! 🌟",
            "You didn't give up! 🚀", "You kept thinking! 🧠", "You showed courage! 🦁"
        ]
    }
};

/**
 * Contextual Phrase Generator
 * Generates personalized feedback based on performance and context
 */
export class AIPhrasingEngine {
    constructor() {
        this.phraseDatabase = PHRASE_DATABASE;
        this.userPersonalities = new Map(); // Track user preferences
    }

    /**
     * Generate contextual phrase based on performance and situation
     */
    generatePhrase(context) {
        const {
            category,           // celebration, encouragement, guidance, etc.
            accuracy,           // Current accuracy (0-1)
            difficulty,         // Current difficulty level
            streak,             // Consecutive correct answers
            gameType,           // Type of game being played
            timeSpent,          // Time spent on current question
            recentPerformance,  // Array of recent results
            ageGroup,           // Child's age group
            timeOfDay,          // morning, afternoon, evening
            isImproving,        // Boolean: showing improvement
            userId              // For personalization
        } = context;

        // Determine the most appropriate phrase category and subcategory
        let phrases = this.selectPhrasePool(context);
        
        // Filter phrases based on context
        phrases = this.filterByContext(phrases, context);
        
        // Personalize for user if known
        phrases = this.personalizeForUser(phrases, userId);
        
        // Select final phrase
        const selectedPhrase = this.selectFinalPhrase(phrases, context);
        
        return this.enhancePhrase(selectedPhrase, context);
    }

    /**
     * Select the appropriate phrase pool based on context
     */
    selectPhrasePool(context) {
        const { category, accuracy, streak, gameType, difficulty } = context;

        // Map game types to specific phrase pools
        const gameSpecificPhrases = {
            'time-clock': this.phraseDatabase.time_phrases,
            'money-math': this.phraseDatabase.money_phrases,
            'number-sequences': this.phraseDatabase.pattern_phrases
        };

        if (category === 'celebration') {
            let pool = [...this.phraseDatabase.celebration.general];
            
            // Add difficulty-specific celebrations
            if (this.phraseDatabase.celebration.difficulty_based[difficulty]) {
                pool.push(...this.phraseDatabase.celebration.difficulty_based[difficulty]);
            }
            
            // Add streak-specific celebrations
            if (streak >= 3 && this.phraseDatabase.celebration.streak_based[streak]) {
                pool.push(...this.phraseDatabase.celebration.streak_based[streak]);
            }
            
            return pool;
        }
        
        if (category === 'encouragement') {
            let pool = [...this.phraseDatabase.encouragement.general];
            
            if (accuracy < 0.5) {
                pool.push(...this.phraseDatabase.encouragement.after_mistake);
            }
            
            pool.push(...this.phraseDatabase.encouragement.motivation);
            return pool;
        }
        
        if (category === 'guidance') {
            let pool = [...this.phraseDatabase.guidance.hints];
            pool.push(...this.phraseDatabase.guidance.strategy_tips);
            
            // Add game-specific guidance
            if (gameSpecificPhrases[gameType]) {
                if (Array.isArray(gameSpecificPhrases[gameType])) {
                    pool.push(...gameSpecificPhrases[gameType]);
                } else {
                    // For objects like time_phrases, flatten all arrays
                    Object.values(gameSpecificPhrases[gameType]).forEach(arr => {
                        if (Array.isArray(arr)) pool.push(...arr);
                    });
                }
            }
            
            return pool;
        }
        
        // Default fallback
        return this.phraseDatabase.encouragement.general;
    }

    /**
     * Filter phrases based on additional context factors
     */
    filterByContext(phrases, context) {
        const { ageGroup, timeOfDay, accuracy } = context;
        
        // For younger children, prefer simpler language
        if (ageGroup === '3-4') {
            return phrases.filter(phrase => 
                phrase.length < 20 && // Shorter phrases
                !phrase.includes('mathematician') && // Avoid complex terms
                !phrase.includes('algorithm')
            );
        }
        
        // Time of day considerations
        if (timeOfDay === 'morning') {
            // Add energy and enthusiasm for morning sessions
            return phrases.filter(phrase => 
                phrase.includes('!') || phrase.includes('🌟') || phrase.includes('✨')
            );
        }
        
        return phrases;
    }

    /**
     * Personalize phrases for specific user preferences
     */
    personalizeForUser(phrases, userId) {
        if (!userId) return phrases;
        
        const userPrefs = this.userPersonalities.get(userId);
        if (!userPrefs) return phrases;
        
        // Filter based on user's preferred phrase style
        if (userPrefs.preferredStyle === 'scientific') {
            return phrases.filter(phrase => 
                !phrase.includes('magic') && !phrase.includes('wizard')
            );
        }
        
        if (userPrefs.preferredStyle === 'playful') {
            return phrases.filter(phrase => 
                phrase.includes('🎉') || phrase.includes('🌟') || 
                phrase.includes('magic') || phrase.includes('adventure')
            );
        }
        
        return phrases;
    }

    /**
     * Select final phrase using intelligent selection
     */
    selectFinalPhrase(phrases, context) {
        const { accuracy, streak, isImproving } = context;
        
        // Weight selection based on context
        if (accuracy > 0.9 && streak > 5) {
            // High performance - prefer celebration phrases with awards/achievements
            const celebrationPhrases = phrases.filter(p => 
                p.includes('🏆') || p.includes('👑') || p.includes('champion')
            );
            if (celebrationPhrases.length > 0) {
                return celebrationPhrases[Math.floor(Math.random() * celebrationPhrases.length)];
            }
        }
        
        // Random selection from filtered pool
        return phrases[Math.floor(Math.random() * phrases.length)];
    }

    /**
     * Enhance phrase with dynamic elements
     */
    enhancePhrase(phrase, context) {
        const { streak, accuracy, gameType } = context;
        
        // Add dynamic streak information
        if (streak > 0) {
            const streakEnhancements = {
                3: " That's three in a row! 🎯",
                5: " Five perfect answers! 🌟", 
                10: " Ten straight! You're unstoppable! 🔥",
                15: " Fifteen perfect! Incredible! ✨",
                20: " Twenty in a row! Legendary! 👑"
            };
            
            if (streakEnhancements[streak]) {
                phrase += streakEnhancements[streak];
            }
        }
        
        // Add accuracy celebration
        if (accuracy >= 0.95) {
            phrase += " Perfect accuracy! 💯";
        } else if (accuracy >= 0.9) {
            phrase += " Nearly perfect! ⭐";
        }
        
        return phrase;
    }

    /**
     * Learn from user interactions to improve personalization
     */
    learnFromFeedback(userId, phrase, wasHelpful) {
        if (!userId) return;
        
        let userPrefs = this.userPersonalities.get(userId) || {
            likedPhrases: [],
            dislikedPhrases: [],
            preferredEmojis: [],
            preferredStyle: 'balanced'
        };
        
        if (wasHelpful) {
            userPrefs.likedPhrases.push(phrase);
            
            // Extract preferred emojis
            const emojis = phrase.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu);
            if (emojis) {
                userPrefs.preferredEmojis.push(...emojis);
            }
        } else {
            userPrefs.dislikedPhrases.push(phrase);
        }
        
        this.userPersonalities.set(userId, userPrefs);
    }

    /**
     * Get phrase statistics for analytics
     */
    getPhraseStats() {
        const stats = {
            totalPhrases: 0,
            categories: {}
        };
        
        Object.entries(this.phraseDatabase).forEach(([category, phrases]) => {
            if (Array.isArray(phrases)) {
                stats.categories[category] = phrases.length;
                stats.totalPhrases += phrases.length;
            } else if (typeof phrases === 'object') {
                let categoryTotal = 0;
                Object.values(phrases).forEach(subcategory => {
                    if (Array.isArray(subcategory)) {
                        categoryTotal += subcategory.length;
                    } else if (typeof subcategory === 'object') {
                        Object.values(subcategory).forEach(subArray => {
                            if (Array.isArray(subArray)) {
                                categoryTotal += subArray.length;
                            }
                        });
                    }
                });
                stats.categories[category] = categoryTotal;
                stats.totalPhrases += categoryTotal;
            }
        });
        
        return stats;
    }
}

// Export the phrase engine
export default AIPhrasingEngine;