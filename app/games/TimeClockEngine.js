/**
 * Time & Clock Game Engine
 * Digital/Analog Clock Reading, Time Calculations, Daily Time Concepts
 * Interactive Clock Learning with Age-Appropriate Challenges
 * Kindergarten Math Adventure v4
 */

import { GAMES_CONFIG, AI_CONFIG } from '../config/masterConfig.js';
import { AIPhrasingEngine } from '../ai/phraseEngine.js';

/**
 * Clock Visual Renderer
 * Creates interactive and static clock representations
 */
class ClockVisualRenderer {
    constructor() {
        this.clockTypes = {
            ANALOG: 'analog',
            DIGITAL: 'digital',
            BOTH: 'both',
            INTERACTIVE: 'interactive'
        };
        
        this.clockStyles = {
            colorful: {
                face: '#f8f9fa',
                border: '#4ecdc4',
                numbers: '#2d3436',
                hourHand: '#e17055',
                minuteHand: '#74b9ff',
                centerDot: '#2d3436'
            },
            pastel: {
                face: '#ffeaa7',
                border: '#fd79a8',
                numbers: '#2d3436',
                hourHand: '#e84393',
                minuteHand: '#6c5ce7',
                centerDot: '#2d3436'
            },
            nature: {
                face: '#dff9fb',
                border: '#26de81',
                numbers: '#2f3542',
                hourHand: '#ff6348',
                minuteHand: '#2ed573',
                centerDot: '#2f3542'
            }
        };
    }

    /**
     * Generate clock visual based on time and question type
     */
    generateClockVisual(timeData, questionType, clockType = 'analog') {
        const { hour, minute, period, displayHour } = timeData;
        
        switch (questionType) {
            case 'read_time':
                return this.createReadTimeVisual(timeData, clockType);
            case 'set_time':
                return this.createSetTimeVisual(timeData, clockType);
            case 'time_comparison':
                return this.createComparisonVisual(timeData, clockType);
            case 'elapsed_time':
                return this.createElapsedTimeVisual(timeData, clockType);
            case 'daily_schedule':
                return this.createDailyScheduleVisual(timeData, clockType);
            case 'digital_analog_match':
                return this.createMatchingVisual(timeData);
            default:
                return this.createReadTimeVisual(timeData, clockType);
        }
    }

    /**
     * Create visual for reading time
     */
    createReadTimeVisual(timeData, clockType) {
        const { hour, minute, period, displayHour } = timeData;
        
        if (clockType === 'analog' || clockType === 'both') {
            const analogClock = this.generateAnalogClock(hour, minute, displayHour);
            
            if (clockType === 'both') {
                return {
                    type: 'both',
                    analog: analogClock,
                    digital: this.generateDigitalClock(hour, minute, period, true), // Hidden for question
                    instructions: 'Look at the analog clock and select the correct digital time',
                    accessibility: {
                        description: this.generateTimeDescription(hour, minute, period),
                        instructions: 'Use the clock hands to read the time'
                    }
                };
            }
            
            return {
                type: 'analog',
                clock: analogClock,
                instructions: 'What time does this clock show?',
                accessibility: {
                    description: `Analog clock showing ${displayHour}:${minute.toString().padStart(2, '0')} ${period}`,
                    instructions: 'Read the hour and minute hands to determine the time'
                }
            };
        }
        
        return {
            type: 'digital',
            clock: this.generateDigitalClock(hour, minute, period),
            instructions: 'What time is shown?',
            accessibility: {
                description: `Digital clock showing ${displayHour}:${minute.toString().padStart(2, '0')} ${period}`,
                instructions: 'Read the digital time display'
            }
        };
    }

    /**
     * Create interactive clock for setting time
     */
    createSetTimeVisual(timeData, clockType) {
        const { hour, minute, period, displayHour } = timeData;
        
        return {
            type: 'interactive',
            targetTime: {
                hour: displayHour,
                minute: minute,
                period: period,
                display: `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
            },
            interactiveClock: this.generateInteractiveClock(),
            instructions: `Set the clock to ${displayHour}:${minute.toString().padStart(2, '0')} ${period}`,
            feedback: {
                hourCorrect: false,
                minuteCorrect: false,
                complete: false
            },
            accessibility: {
                description: `Interactive clock for setting time to ${displayHour}:${minute.toString().padStart(2, '0')} ${period}`,
                instructions: 'Drag the clock hands or use buttons to set the correct time'
            }
        };
    }

    /**
     * Create visual for time comparison
     */
    createComparisonVisual(timeData) {
        const { times, comparison } = timeData;
        
        return {
            type: 'comparison',
            clocks: times.map((time, index) => ({
                id: index,
                time: time,
                clock: this.generateAnalogClock(time.hour, time.minute, time.displayHour),
                digital: this.generateDigitalClock(time.hour, time.minute, time.period)
            })),
            comparison: comparison,
            instructions: 'Which time is earlier/later?',
            accessibility: {
                description: `Compare times: ${times.map(t => `${t.displayHour}:${t.minute.toString().padStart(2, '0')} ${t.period}`).join(' and ')}`,
                instructions: 'Compare the two clocks to find which shows the earlier or later time'
            }
        };
    }

    /**
     * Create visual for elapsed time
     */
    createElapsedTimeVisual(timeData) {
        const { startTime, endTime, elapsed } = timeData;
        
        return {
            type: 'elapsed',
            startClock: {
                time: startTime,
                clock: this.generateAnalogClock(startTime.hour, startTime.minute, startTime.displayHour),
                label: 'Start Time'
            },
            endClock: {
                time: endTime,
                clock: this.generateAnalogClock(endTime.hour, endTime.minute, endTime.displayHour),
                label: 'End Time'
            },
            elapsed: elapsed,
            timeline: this.generateTimeline(startTime, endTime, elapsed),
            instructions: 'How much time passed?',
            accessibility: {
                description: `Calculate elapsed time from ${startTime.displayHour}:${startTime.minute.toString().padStart(2, '0')} to ${endTime.displayHour}:${endTime.minute.toString().padStart(2, '0')}`,
                instructions: 'Compare the start and end times to find how much time passed'
            }
        };
    }

    /**
     * Create daily schedule visual
     */
    createDailyScheduleVisual(timeData) {
        const { activity, timeOptions, correctTime } = timeData;
        
        return {
            type: 'schedule',
            activity: {
                name: activity.name,
                description: activity.description,
                illustration: activity.illustration
            },
            timeOptions: timeOptions.map(time => ({
                time: time,
                clock: this.generateAnalogClock(time.hour, time.minute, time.displayHour),
                digital: this.generateDigitalClock(time.hour, time.minute, time.period)
            })),
            correctTime: correctTime,
            instructions: `When do you usually ${activity.name}?`,
            accessibility: {
                description: `Choose the appropriate time for ${activity.name}`,
                instructions: 'Select the clock that shows the most reasonable time for this activity'
            }
        };
    }

    /**
     * Create matching visual for digital/analog
     */
    createMatchingVisual(timeData) {
        const { analogTimes, digitalTimes } = timeData;
        
        return {
            type: 'matching',
            analogClocks: analogTimes.map((time, index) => ({
                id: `analog_${index}`,
                time: time,
                clock: this.generateAnalogClock(time.hour, time.minute, time.displayHour),
                matched: false
            })),
            digitalClocks: digitalTimes.map((time, index) => ({
                id: `digital_${index}`,
                time: time,
                display: this.generateDigitalClock(time.hour, time.minute, time.period),
                matched: false
            })),
            matches: [],
            instructions: 'Match each analog clock with the correct digital time',
            accessibility: {
                description: 'Drag and drop to match analog clocks with their corresponding digital times',
                instructions: 'Use keyboard navigation to select and match clock pairs'
            }
        };
    }

    /**
     * Generate analog clock SVG
     */
    generateAnalogClock(hour, minute, displayHour = null) {
        const actualDisplayHour = displayHour || (hour > 12 ? hour - 12 : hour);
        const hourAngle = (actualDisplayHour % 12) * 30 + (minute * 0.5); // Hour hand moves with minutes
        const minuteAngle = minute * 6; // Each minute = 6 degrees
        
        const style = this.clockStyles.colorful;
        
        return {
            type: 'analog',
            size: 200,
            style: style,
            face: {
                center: { x: 100, y: 100 },
                radius: 90,
                numbers: this.generateClockNumbers()
            },
            hands: {
                hour: {
                    angle: hourAngle,
                    length: 50,
                    width: 6,
                    color: style.hourHand
                },
                minute: {
                    angle: minuteAngle,
                    length: 70,
                    width: 4,
                    color: style.minuteHand
                }
            },
            centerDot: {
                radius: 8,
                color: style.centerDot
            },
            tickMarks: this.generateTickMarks(),
            time: { hour, minute, displayHour: actualDisplayHour }
        };
    }

    /**
     * Generate digital clock display
     */
    generateDigitalClock(hour, minute, period, hidden = false) {
        const displayHour = hour > 12 ? hour - 12 : hour;
        const timeString = `${displayHour}:${minute.toString().padStart(2, '0')}`;
        
        return {
            type: 'digital',
            display: hidden ? '??:??' : timeString,
            period: hidden ? '??' : period,
            fullTime: `${timeString} ${period}`,
            hidden: hidden,
            style: {
                fontSize: '2.5rem',
                fontFamily: 'monospace',
                color: '#2d3436',
                backgroundColor: '#00b894',
                borderRadius: '10px',
                padding: '15px 25px'
            },
            time: { hour, minute, period, displayHour }
        };
    }

    /**
     * Generate interactive clock controls
     */
    generateInteractiveClock() {
        return {
            type: 'interactive',
            currentTime: { hour: 12, minute: 0 },
            controls: {
                hourHand: {
                    draggable: true,
                    stepSize: 30, // 30 degrees per hour
                    currentAngle: 0
                },
                minuteHand: {
                    draggable: true,
                    stepSize: 6, // 6 degrees per minute
                    currentAngle: 0
                },
                buttons: {
                    hourUp: { label: 'Hour +', action: 'incrementHour' },
                    hourDown: { label: 'Hour -', action: 'decrementHour' },
                    minuteUp: { label: 'Min +', action: 'incrementMinute' },
                    minuteDown: { label: 'Min -', action: 'decrementMinute' }
                }
            },
            feedback: {
                realTimeUpdate: true,
                showDigital: true,
                highlightCorrect: true
            }
        };
    }

    /**
     * Generate timeline for elapsed time
     */
    generateTimeline(startTime, endTime, elapsed) {
        const timePoints = [];
        let current = { ...startTime };
        
        // Create timeline points every 15 minutes
        while (current.hour < endTime.hour || 
               (current.hour === endTime.hour && current.minute < endTime.minute)) {
            
            timePoints.push({
                time: { ...current },
                display: `${current.displayHour}:${current.minute.toString().padStart(2, '0')}`,
                isStart: timePoints.length === 0,
                isEnd: false
            });
            
            current.minute += 15;
            if (current.minute >= 60) {
                current.minute -= 60;
                current.hour++;
                current.displayHour = current.hour > 12 ? current.hour - 12 : current.hour;
            }
        }
        
        // Add end time
        timePoints.push({
            time: { ...endTime },
            display: `${endTime.displayHour}:${endTime.minute.toString().padStart(2, '0')}`,
            isStart: false,
            isEnd: true
        });
        
        return {
            points: timePoints,
            duration: elapsed,
            style: {
                lineColor: '#74b9ff',
                pointColor: '#0984e3',
                startColor: '#00b894',
                endColor: '#e17055'
            }
        };
    }

    /**
     * Helper methods for clock generation
     */
    generateClockNumbers() {
        const numbers = [];
        for (let i = 1; i <= 12; i++) {
            const angle = (i - 3) * 30; // Start from 12 o'clock
            const radian = (angle * Math.PI) / 180;
            const x = 100 + 70 * Math.cos(radian);
            const y = 100 + 70 * Math.sin(radian);
            
            numbers.push({
                number: i,
                x: x,
                y: y,
                fontSize: '16px',
                fontWeight: 'bold'
            });
        }
        return numbers;
    }

    generateTickMarks() {
        const ticks = [];
        
        // Hour marks (thick)
        for (let i = 0; i < 12; i++) {
            const angle = i * 30;
            const radian = (angle * Math.PI) / 180;
            
            ticks.push({
                type: 'hour',
                angle: angle,
                innerRadius: 75,
                outerRadius: 85,
                width: 3,
                color: '#2d3436'
            });
        }
        
        // Minute marks (thin)
        for (let i = 0; i < 60; i++) {
            if (i % 5 !== 0) { // Skip hour positions
                const angle = i * 6;
                
                ticks.push({
                    type: 'minute',
                    angle: angle,
                    innerRadius: 80,
                    outerRadius: 85,
                    width: 1,
                    color: '#636e72'
                });
            }
        }
        
        return ticks;
    }

    generateTimeDescription(hour, minute, period) {
        const displayHour = hour > 12 ? hour - 12 : hour;
        
        if (minute === 0) {
            return `${displayHour} o'clock ${period}`;
        } else if (minute === 15) {
            return `Quarter past ${displayHour} ${period}`;
        } else if (minute === 30) {
            return `Half past ${displayHour} ${period}`;
        } else if (minute === 45) {
            const nextHour = displayHour === 12 ? 1 : displayHour + 1;
            return `Quarter to ${nextHour} ${period}`;
        } else {
            return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        }
    }
}

/**
 * Time & Clock Game Engine
 * Handles time-based learning activities and progression
 */
export class TimeClockEngine {
    constructor(userManager, ageGroup = '5-6') {
        this.userManager = userManager;
        this.ageGroup = ageGroup;
        this.config = GAMES_CONFIG.timeClock;
        this.aiEngine = new AIPhrasingEngine();
        this.visualRenderer = new ClockVisualRenderer();
        
        this.currentSession = {
            questionsAsked: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            currentStreak: 0,
            longestStreak: 0,
            startTime: null,
            problems: [],
            difficulty: this.getInitialDifficulty()
        };
        
        this.masteryTracker = {
            analog_reading: { attempts: 0, successes: 0, level: 1 },
            digital_reading: { attempts: 0, successes: 0, level: 1 },
            time_setting: { attempts: 0, successes: 0, level: 1 },
            time_comparison: { attempts: 0, successes: 0, level: 1 },
            elapsed_time: { attempts: 0, successes: 0, level: 1 },
            daily_activities: { attempts: 0, successes: 0, level: 1 }
        };

        this.questionTypes = [
            'read_analog', 'read_digital', 'set_time', 'time_comparison',
            'elapsed_time', 'daily_schedule', 'digital_analog_match'
        ];

        this.dailyActivities = [
            { name: 'wake up', times: [6, 7, 8], illustration: '🌅', description: 'Time to start the day' },
            { name: 'eat breakfast', times: [7, 8, 9], illustration: '🥞', description: 'Morning meal time' },
            { name: 'go to school', times: [8, 9], illustration: '🏫', description: 'School starts' },
            { name: 'eat lunch', times: [12, 13], illustration: '🍎', description: 'Midday meal' },
            { name: 'come home', times: [15, 16], illustration: '🏠', description: 'School ends' },
            { name: 'eat dinner', times: [17, 18, 19], illustration: '🍽️', description: 'Evening meal' },
            { name: 'go to bed', times: [19, 20, 21], illustration: '🌙', description: 'Bedtime' }
        ];

        this.setupEventListeners();
    }

    /**
     * Initialize the game engine
     */
    async init() {
        console.log('🔧 Initializing Time & Clock Engine...');
        
        try {
            await this.loadMasteryProgress();
            await this.aiEngine.init();
            this.setupAgeConfiguration();
            
            console.log('✅ Time & Clock Engine initialized');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Time & Clock Engine:', error);
            return false;
        }
    }

    /**
     * Start a new game session
     */
    startSession(options = {}) {
        const {
            maxQuestions = this.getMaxQuestions(),
            focusType = null,
            difficulty = null,
            clockType = 'analog'
        } = options;

        this.currentSession = {
            questionsAsked: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            currentStreak: 0,
            longestStreak: 0,
            startTime: Date.now(),
            maxQuestions: maxQuestions,
            focusType: focusType,
            problems: [],
            difficulty: difficulty || this.getInitialDifficulty(),
            clockType: clockType
        };

        this.emitGameEvent('sessionStarted', {
            session: this.currentSession,
            ageGroup: this.ageGroup
        });

        console.log('🕐 Time & Clock session started');
        return this.generateNextProblem();
    }

    /**
     * Generate next time problem
     */
    generateNextProblem() {
        if (this.isSessionComplete()) {
            return this.endSession();
        }

        const questionType = this.selectQuestionType();
        const timeData = this.generateTimeData(questionType);
        const visual = this.visualRenderer.generateClockVisual(
            timeData, 
            questionType, 
            this.currentSession.clockType
        );
        
        const questionData = {
            id: `time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timeData: timeData,
            visual: visual,
            questionType: questionType,
            timestamp: Date.now(),
            difficulty: this.currentSession.difficulty,
            expectedAnswerTime: this.getExpectedAnswerTime(questionType),
            hints: this.generateHints(questionType, timeData),
            encouragement: this.aiEngine.generatePhrase('pre_question', {
                gameType: 'time',
                questionType: questionType,
                difficulty: this.currentSession.difficulty,
                streak: this.currentSession.currentStreak
            })
        };

        this.currentSession.problems.push(questionData);
        this.currentSession.questionsAsked++;

        this.emitGameEvent('problemGenerated', questionData);
        return questionData;
    }

    /**
     * Generate time data based on question type
     */
    generateTimeData(questionType) {
        const difficulty = this.currentSession.difficulty;
        const ranges = this.config.difficulty[difficulty];
        
        switch (questionType) {
            case 'read_analog':
            case 'read_digital':
                return this.generateReadTimeData(ranges);
            case 'set_time':
                return this.generateSetTimeData(ranges);
            case 'time_comparison':
                return this.generateComparisonData(ranges);
            case 'elapsed_time':
                return this.generateElapsedTimeData(ranges);
            case 'daily_schedule':
                return this.generateDailyScheduleData(ranges);
            case 'digital_analog_match':
                return this.generateMatchingData(ranges);
            default:
                return this.generateReadTimeData(ranges);
        }
    }

    /**
     * Generate data for reading time
     */
    generateReadTimeData(ranges) {
        const hour = this.randomInRange(ranges.hours);
        const minuteOptions = ranges.minutes;
        const minute = minuteOptions[Math.floor(Math.random() * minuteOptions.length)];
        const period = hour < 12 ? 'AM' : 'PM';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        
        return {
            hour: hour,
            minute: minute,
            period: period,
            displayHour: displayHour,
            correctAnswer: `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`,
            options: this.generateTimeOptions(displayHour, minute, period)
        };
    }

    /**
     * Generate data for setting time
     */
    generateSetTimeData(ranges) {
        const timeData = this.generateReadTimeData(ranges);
        
        return {
            ...timeData,
            targetTime: timeData.correctAnswer,
            tolerance: {
                hour: 0,      // Must be exact
                minute: 5     // Within 5 minutes acceptable for beginners
            }
        };
    }

    /**
     * Generate data for time comparison
     */
    generateComparisonData(ranges) {
        const time1 = this.generateReadTimeData(ranges);
        let time2;
        
        // Ensure times are different
        do {
            time2 = this.generateReadTimeData(ranges);
        } while (time1.hour === time2.hour && time1.minute === time2.minute);
        
        const comparison = this.compareTime(time1, time2);
        
        return {
            times: [time1, time2],
            comparison: comparison,
            correctAnswer: comparison.earlier === 0 ? 'first' : 'second',
            options: ['first', 'second']
        };
    }

    /**
     * Generate data for elapsed time
     */
    generateElapsedTimeData(ranges) {
        const startTime = this.generateReadTimeData(ranges);
        
        // Add 30 minutes to 3 hours for elapsed time
        const elapsedMinutes = [30, 60, 90, 120, 180][Math.floor(Math.random() * 5)];
        const endHour = startTime.hour + Math.floor((startTime.minute + elapsedMinutes) / 60);
        const endMinute = (startTime.minute + elapsedMinutes) % 60;
        
        const endTime = {
            hour: endHour,
            minute: endMinute,
            period: endHour < 12 ? 'AM' : 'PM',
            displayHour: endHour > 12 ? endHour - 12 : (endHour === 0 ? 12 : endHour)
        };
        
        const elapsed = {
            hours: Math.floor(elapsedMinutes / 60),
            minutes: elapsedMinutes % 60,
            totalMinutes: elapsedMinutes
        };
        
        return {
            startTime: startTime,
            endTime: endTime,
            elapsed: elapsed,
            correctAnswer: `${elapsed.hours} hours ${elapsed.minutes} minutes`,
            options: this.generateElapsedOptions(elapsed)
        };
    }

    /**
     * Generate data for daily activities
     */
    generateDailyScheduleData(ranges) {
        const activity = this.dailyActivities[Math.floor(Math.random() * this.dailyActivities.length)];
        const correctHour = activity.times[Math.floor(Math.random() * activity.times.length)];
        const correctMinute = [0, 15, 30][Math.floor(Math.random() * 3)];
        
        const correctTime = {
            hour: correctHour,
            minute: correctMinute,
            period: correctHour < 12 ? 'AM' : 'PM',
            displayHour: correctHour > 12 ? correctHour - 12 : (correctHour === 0 ? 12 : correctHour)
        };
        
        // Generate 3 other time options
        const timeOptions = [correctTime];
        
        while (timeOptions.length < 4) {
            const wrongActivity = this.dailyActivities[Math.floor(Math.random() * this.dailyActivities.length)];
            const wrongHour = wrongActivity.times[Math.floor(Math.random() * wrongActivity.times.length)];
            const wrongMinute = [0, 15, 30][Math.floor(Math.random() * 3)];
            
            const wrongTime = {
                hour: wrongHour,
                minute: wrongMinute,
                period: wrongHour < 12 ? 'AM' : 'PM',
                displayHour: wrongHour > 12 ? wrongHour - 12 : (wrongHour === 0 ? 12 : wrongHour)
            };
            
            // Avoid duplicates
            if (!timeOptions.some(t => t.hour === wrongTime.hour && t.minute === wrongTime.minute)) {
                timeOptions.push(wrongTime);
            }
        }
        
        return {
            activity: activity,
            timeOptions: this.shuffleArray(timeOptions),
            correctTime: correctTime,
            correctAnswer: `${correctTime.displayHour}:${correctTime.minute.toString().padStart(2, '0')} ${correctTime.period}`
        };
    }

    /**
     * Generate data for digital/analog matching
     */
    generateMatchingData(ranges) {
        const numPairs = Math.min(3, ranges.pairs || 3);
        const analogTimes = [];
        const digitalTimes = [];
        
        for (let i = 0; i < numPairs; i++) {
            const timeData = this.generateReadTimeData(ranges);
            analogTimes.push(timeData);
            digitalTimes.push(timeData);
        }
        
        // Shuffle digital times to make matching challenging
        const shuffledDigitalTimes = this.shuffleArray([...digitalTimes]);
        
        return {
            analogTimes: analogTimes,
            digitalTimes: shuffledDigitalTimes,
            correctMatches: analogTimes.map((analog, index) => ({
                analogIndex: index,
                digitalIndex: shuffledDigitalTimes.findIndex(digital => 
                    digital.hour === analog.hour && digital.minute === analog.minute
                )
            }))
        };
    }

    /**
     * Process user's answer
     */
    submitAnswer(problemId, userAnswer, timeTaken, answerData = {}) {
        const problem = this.currentSession.problems.find(p => p.id === problemId);
        if (!problem) {
            console.error('❌ Problem not found:', problemId);
            return null;
        }

        const isCorrect = this.checkAnswer(problem, userAnswer, answerData);
        const response = this.processAnswer(problem, isCorrect, timeTaken, userAnswer);
        
        // Update mastery tracking
        this.updateMastery(problem.questionType, isCorrect);
        
        // Adjust difficulty
        this.adjustDifficulty();
        
        this.emitGameEvent('answerSubmitted', {
            problem: problem,
            userAnswer: userAnswer,
            correct: isCorrect,
            response: response,
            timeTaken: timeTaken
        });

        return response;
    }

    /**
     * Check if user's answer is correct
     */
    checkAnswer(problem, userAnswer, answerData) {
        const { questionType, timeData } = problem;
        
        switch (questionType) {
            case 'read_analog':
            case 'read_digital':
                return userAnswer === timeData.correctAnswer;
                
            case 'set_time':
                return this.checkSetTimeAnswer(timeData, answerData);
                
            case 'time_comparison':
                return userAnswer === timeData.correctAnswer;
                
            case 'elapsed_time':
                return this.checkElapsedAnswer(timeData, userAnswer);
                
            case 'daily_schedule':
                return userAnswer === timeData.correctAnswer;
                
            case 'digital_analog_match':
                return this.checkMatchingAnswer(timeData, answerData);
                
            default:
                return false;
        }
    }

    /**
     * Check answer for setting time
     */
    checkSetTimeAnswer(timeData, answerData) {
        const { targetHour, targetMinute } = answerData;
        const tolerance = timeData.tolerance;
        
        const hourCorrect = Math.abs(targetHour - timeData.displayHour) <= tolerance.hour;
        const minuteCorrect = Math.abs(targetMinute - timeData.minute) <= tolerance.minute;
        
        return hourCorrect && minuteCorrect;
    }

    /**
     * Check answer for elapsed time
     */
    checkElapsedAnswer(timeData, userAnswer) {
        const correct = timeData.correctAnswer;
        return userAnswer === correct || 
               userAnswer === `${timeData.elapsed.hours}h ${timeData.elapsed.minutes}m` ||
               userAnswer === timeData.elapsed.totalMinutes.toString();
    }

    /**
     * Check answer for matching exercise
     */
    checkMatchingAnswer(timeData, answerData) {
        const { matches } = answerData;
        const correctMatches = timeData.correctMatches;
        
        if (matches.length !== correctMatches.length) return false;
        
        return correctMatches.every(correct => 
            matches.some(match => 
                match.analogIndex === correct.analogIndex && 
                match.digitalIndex === correct.digitalIndex
            )
        );
    }

    /**
     * Process answer and generate response
     */
    processAnswer(problem, isCorrect, timeTaken, userAnswer) {
        const expectedTime = problem.expectedAnswerTime;
        const wasQuick = timeTaken < expectedTime * 0.8;
        
        if (isCorrect) {
            this.currentSession.correctAnswers++;
            this.currentSession.currentStreak++;
            this.currentSession.longestStreak = Math.max(
                this.currentSession.longestStreak, 
                this.currentSession.currentStreak
            );
            
            return {
                correct: true,
                message: this.aiEngine.generatePhrase('correct_answer', {
                    gameType: 'time',
                    questionType: problem.questionType,
                    streak: this.currentSession.currentStreak,
                    wasQuick: wasQuick,
                    difficulty: problem.difficulty
                }),
                celebration: this.getCelebrationLevel(),
                timeExplanation: this.generateTimeExplanation(problem.timeData, true),
                nextAction: 'continue'
            };
        } else {
            this.currentSession.incorrectAnswers++;
            this.currentSession.currentStreak = 0;
            
            return {
                correct: false,
                message: this.aiEngine.generatePhrase('incorrect_answer', {
                    gameType: 'time',
                    questionType: problem.questionType,
                    correctAnswer: this.getCorrectAnswer(problem.timeData),
                    userAnswer: userAnswer
                }),
                correctAnswer: this.getCorrectAnswer(problem.timeData),
                timeExplanation: this.generateTimeExplanation(problem.timeData, false),
                visualExplanation: this.generateVisualExplanation(problem),
                hints: this.generateDetailedHints(problem),
                nextAction: this.shouldOfferRetry() ? 'retry' : 'continue'
            };
        }
    }

    /**
     * Generate hints for time problems
     */
    generateHints(questionType, timeData) {
        const hints = [];
        
        switch (questionType) {
            case 'read_analog':
                hints.push('Look at the short hand for hours and long hand for minutes');
                hints.push('The hour hand points between numbers when it\'s not exactly on the hour');
                hints.push('Count by 5s around the clock for minutes');
                break;
                
            case 'read_digital':
                hints.push('The first number shows hours, the second shows minutes');
                hints.push('AM is morning time, PM is afternoon/evening');
                break;
                
            case 'set_time':
                hints.push('Move the short hand to the hour and long hand to the minutes');
                hints.push('The hour hand should be between numbers if minutes are not 00');
                break;
                
            case 'time_comparison':
                hints.push('Compare hours first, then minutes if hours are the same');
                hints.push('Earlier means the time comes first in the day');
                break;
                
            case 'elapsed_time':
                hints.push('Count how many hours and minutes from start to end');
                hints.push('Use your fingers to count the hours that passed');
                break;
                
            case 'daily_schedule':
                hints.push('Think about when you do this activity each day');
                hints.push('Is this a morning, afternoon, or evening activity?');
                break;
        }
        
        return hints;
    }

    /**
     * Generate explanation of time concepts
     */
    generateTimeExplanation(timeData, wasCorrect) {
        const { hour, minute, period, displayHour } = timeData;
        
        let explanation = `The time is ${displayHour}:${minute.toString().padStart(2, '0')} ${period}. `;
        
        if (minute === 0) {
            explanation += `This is exactly ${displayHour} o'clock.`;
        } else if (minute === 15) {
            explanation += `This is quarter past ${displayHour}.`;
        } else if (minute === 30) {
            explanation += `This is half past ${displayHour}.`;
        } else if (minute === 45) {
            const nextHour = displayHour === 12 ? 1 : displayHour + 1;
            explanation += `This is quarter to ${nextHour}.`;
        } else {
            explanation += `The minute hand points to ${minute} minutes past ${displayHour}.`;
        }
        
        return explanation;
    }

    /**
     * Helper methods
     */
    selectQuestionType() {
        if (this.currentSession.focusType) {
            return this.currentSession.focusType;
        }
        
        const availableTypes = this.getAvailableQuestionTypes();
        const weights = this.calculateTypeWeights(availableTypes);
        
        return this.weightedRandomSelect(availableTypes, weights);
    }

    getAvailableQuestionTypes() {
        const ageConfig = this.config.ageGroups[this.ageGroup];
        const difficulty = this.currentSession.difficulty;
        
        return ageConfig.questionTypes.filter(type => 
            this.config.difficulty[difficulty].questionTypes.includes(type)
        );
    }

    calculateTypeWeights(questionTypes) {
        return questionTypes.map(type => {
            const mastery = this.masteryTracker[type.replace('_', '_')] || { attempts: 0, successes: 0 };
            const successRate = mastery.attempts > 0 ? mastery.successes / mastery.attempts : 0;
            
            return Math.max(0.1, 1 - successRate);
        });
    }

    weightedRandomSelect(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        
        return items[0];
    }

    randomInRange(range) {
        return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }

    compareTime(time1, time2) {
        const minutes1 = time1.hour * 60 + time1.minute;
        const minutes2 = time2.hour * 60 + time2.minute;
        
        return {
            earlier: minutes1 < minutes2 ? 0 : 1,
            later: minutes1 > minutes2 ? 0 : 1,
            difference: Math.abs(minutes1 - minutes2)
        };
    }

    generateTimeOptions(hour, minute, period) {
        const correct = `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
        const options = [correct];
        
        // Generate distractors
        const distractors = [
            `${hour}:${(minute + 5) % 60 < 10 ? '0' : ''}${(minute + 5) % 60} ${period}`,
            `${hour === 12 ? 1 : hour + 1}:${minute.toString().padStart(2, '0')} ${period}`,
            `${hour}:${minute.toString().padStart(2, '0')} ${period === 'AM' ? 'PM' : 'AM'}`
        ];
        
        distractors.forEach(distractor => {
            if (distractor !== correct && options.length < 4) {
                options.push(distractor);
            }
        });
        
        return this.shuffleArray(options);
    }

    generateElapsedOptions(elapsed) {
        const correct = `${elapsed.hours} hours ${elapsed.minutes} minutes`;
        const options = [correct];
        
        // Generate distractors
        options.push(`${elapsed.hours + 1} hours ${elapsed.minutes} minutes`);
        options.push(`${elapsed.hours} hours ${elapsed.minutes + 15} minutes`);
        options.push(`${Math.max(0, elapsed.hours - 1)} hours ${elapsed.minutes} minutes`);
        
        return this.shuffleArray(options);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    getCorrectAnswer(timeData) {
        return timeData.correctAnswer || timeData.targetTime || 'Check the explanation above';
    }

    generateVisualExplanation(problem) {
        // Generate a detailed visual showing the correct answer
        return this.visualRenderer.generateClockVisual(
            {
                ...problem.timeData,
                showSolution: true,
                highlightCorrect: true
            },
            'explanation'
        );
    }

    generateDetailedHints(problem) {
        return this.generateHints(problem.questionType, problem.timeData);
    }

    /**
     * Difficulty and progression management
     */
    getInitialDifficulty() {
        const ageConfig = this.config.ageGroups[this.ageGroup];
        return ageConfig?.defaultDifficulty || 'beginner';
    }

    adjustDifficulty() {
        const recentProblems = this.currentSession.problems.slice(-5);
        if (recentProblems.length < 3) return;
        
        const recentCorrect = recentProblems.filter(p => p.wasCorrect).length;
        const accuracy = recentCorrect / recentProblems.length;
        
        if (accuracy >= 0.8 && this.currentSession.currentStreak >= 3) {
            this.increaseDifficulty();
        } else if (accuracy <= 0.4) {
            this.decreaseDifficulty();
        }
    }

    increaseDifficulty() {
        const difficulties = Object.keys(this.config.difficulty);
        const currentIndex = difficulties.indexOf(this.currentSession.difficulty);
        
        if (currentIndex < difficulties.length - 1) {
            this.currentSession.difficulty = difficulties[currentIndex + 1];
            console.log('📈 Time & Clock difficulty increased to:', this.currentSession.difficulty);
        }
    }

    decreaseDifficulty() {
        const difficulties = Object.keys(this.config.difficulty);
        const currentIndex = difficulties.indexOf(this.currentSession.difficulty);
        
        if (currentIndex > 0) {
            this.currentSession.difficulty = difficulties[currentIndex - 1];
            console.log('📉 Time & Clock difficulty decreased to:', this.currentSession.difficulty);
        }
    }

    updateMastery(questionType, correct) {
        const masteryKey = questionType.replace('read_', '').replace('_', '_');
        
        if (!this.masteryTracker[masteryKey]) {
            this.masteryTracker[masteryKey] = { attempts: 0, successes: 0, level: 1 };
        }
        
        this.masteryTracker[masteryKey].attempts++;
        if (correct) {
            this.masteryTracker[masteryKey].successes++;
        }
        
        // Update mastery level
        const mastery = this.masteryTracker[masteryKey];
        const successRate = mastery.successes / mastery.attempts;
        
        if (successRate >= 0.8 && mastery.attempts >= 10) {
            mastery.level = Math.min(mastery.level + 1, 5);
        }
    }

    /**
     * Session management
     */
    isSessionComplete() {
        return this.currentSession.questionsAsked >= this.currentSession.maxQuestions;
    }

    endSession() {
        const sessionDuration = Date.now() - this.currentSession.startTime;
        const accuracy = this.currentSession.correctAnswers / this.currentSession.questionsAsked;
        
        const sessionResults = {
            questionsAnswered: this.currentSession.questionsAsked,
            correctAnswers: this.currentSession.correctAnswers,
            accuracy: accuracy,
            timeSpent: sessionDuration,
            longestStreak: this.currentSession.longestStreak,
            masteryProgress: this.masteryTracker,
            difficulty: this.currentSession.difficulty,
            gameType: 'time-clock'
        };

        this.userManager.updateProgress(sessionResults);
        this.emitGameEvent('sessionEnded', sessionResults);
        
        return {
            type: 'session_complete',
            results: sessionResults,
            celebration: this.generateSessionCelebration(sessionResults),
            recommendations: this.generateRecommendations(sessionResults)
        };
    }

    /**
     * Utility methods
     */
    getMaxQuestions() {
        if (this.userManager.canAccess('unlimited_questions')) {
            return this.config.ageGroups[this.ageGroup].maxQuestions;
        }
        return this.config.ageGroups[this.ageGroup].guestMaxQuestions || 5;
    }

    getExpectedAnswerTime(questionType) {
        const baseTimes = {
            read_analog: 15000,
            read_digital: 8000,
            set_time: 20000,
            time_comparison: 12000,
            elapsed_time: 25000,
            daily_schedule: 10000,
            digital_analog_match: 30000
        };
        
        return baseTimes[questionType] || 15000;
    }

    getCelebrationLevel() {
        if (this.currentSession.currentStreak >= 5) return 'amazing';
        if (this.currentSession.currentStreak >= 3) return 'great';
        return 'good';
    }

    shouldOfferRetry() {
        return this.currentSession.incorrectAnswers < 2;
    }

    generateSessionCelebration(results) {
        return this.aiEngine.generatePhrase('session_complete', {
            gameType: 'time',
            accuracy: results.accuracy,
            questionsAnswered: results.questionsAnswered,
            streak: results.longestStreak
        });
    }

    generateRecommendations(results) {
        const recommendations = [];
        
        Object.entries(this.masteryTracker).forEach(([skill, data]) => {
            const rate = data.attempts > 0 ? data.successes / data.attempts : 0;
            if (rate < 0.6 && data.attempts >= 3) {
                recommendations.push(`Practice ${skill.replace('_', ' ')} more`);
            }
        });
        
        if (results.accuracy >= 0.9) {
            recommendations.push('Try more advanced time concepts');
        } else if (results.accuracy < 0.5) {
            recommendations.push('Focus on basic time reading first');
        }
        
        return recommendations;
    }

    /**
     * Configuration and setup
     */
    setupAgeConfiguration() {
        const ageConfig = this.config.ageGroups[this.ageGroup];
        if (!ageConfig) {
            console.warn('⚠️ Age group not found:', this.ageGroup);
            this.ageGroup = '5-6';
        }
    }

    async loadMasteryProgress() {
        if (!this.userManager.isGuest && this.userManager.currentUser.gameProgress) {
            const saved = this.userManager.currentUser.gameProgress.timeClock;
            if (saved?.mastery) {
                this.masteryTracker = { ...this.masteryTracker, ...saved.mastery };
            }
        }
    }

    setupEventListeners() {
        window.addEventListener('user_progressUpdated', (event) => {
            // Handle user progress updates
        });
    }

    emitGameEvent(eventName, data) {
        const event = new CustomEvent(`game_${eventName}`, {
            detail: {
                gameType: 'time-clock',
                ageGroup: this.ageGroup,
                ...data
            }
        });
        window.dispatchEvent(event);
    }
}

export default TimeClockEngine;