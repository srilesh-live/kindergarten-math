/**
 * Advanced User Management System
 * Guest vs Authenticated modes with dynamic Supabase integration
 * Parent-Child profile management with offline-first architecture
 * Kindergarten Math Adventure v4
 */

import { SUPABASE_CONFIG, USER_CONFIG } from '../config/masterConfig.js';

/**
 * Dynamic Supabase Client Loader
 * Loads Supabase only when authentication is needed
 */
class SupabaseManager {
    constructor() {
        this.client = null;
        this.isLoaded = false;
        this.isOnline = navigator.onLine;
        
        // Listen for network changes
        window.addEventListener('online', () => this.handleNetworkChange(true));
        window.addEventListener('offline', () => this.handleNetworkChange(false));
    }

    /**
     * Lazy load Supabase client
     */
    async loadSupabase() {
        if (this.isLoaded) return this.client;
        
        try {
            // Dynamic import of Supabase
            const { createClient } = await import('@supabase/supabase-js');
            
            this.client = createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey,
                {
                    auth: {
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: true
                    },
                    realtime: {
                        params: {
                            eventsPerSecond: 10
                        }
                    }
                }
            );
            
            this.isLoaded = true;
            console.log('✅ Supabase client loaded successfully');
            return this.client;
            
        } catch (error) {
            console.warn('⚠️ Supabase loading failed:', error.message);
            return null;
        }
    }

    /**
     * Handle network state changes
     */
    handleNetworkChange(isOnline) {
        this.isOnline = isOnline;
        
        if (isOnline && this.client) {
            // Trigger sync when back online
            this.syncOfflineData();
        }
    }

    /**
     * Sync offline data when connection restored
     */
    async syncOfflineData() {
        const offlineQueue = this.getOfflineQueue();
        if (offlineQueue.length === 0) return;

        console.log('🔄 Syncing offline data...', offlineQueue.length, 'items');
        
        for (const action of offlineQueue) {
            try {
                await this.executeOfflineAction(action);
            } catch (error) {
                console.error('❌ Sync failed for action:', action, error);
            }
        }
        
        // Clear synced data
        localStorage.removeItem('km_offline_queue');
    }

    /**
     * Get offline action queue
     */
    getOfflineQueue() {
        const queue = localStorage.getItem('km_offline_queue');
        return queue ? JSON.parse(queue) : [];
    }

    /**
     * Add action to offline queue
     */
    queueOfflineAction(action) {
        const queue = this.getOfflineQueue();
        queue.push({
            ...action,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
        });
        
        // Limit queue size
        if (queue.length > SUPABASE_CONFIG.offlineSync.maxOfflineActions) {
            queue.shift(); // Remove oldest
        }
        
        localStorage.setItem('km_offline_queue', JSON.stringify(queue));
    }

    /**
     * Execute queued offline action
     */
    async executeOfflineAction(action) {
        if (!this.client) return false;

        const { type, table, data, filters } = action;
        
        switch (type) {
            case 'insert':
                return await this.client.from(table).insert(data);
            case 'update':
                return await this.client.from(table).update(data).match(filters);
            case 'delete':
                return await this.client.from(table).delete().match(filters);
            default:
                console.warn('Unknown offline action type:', type);
                return false;
        }
    }
}

/**
 * User Profile Management
 * Handles child and parent profiles with advanced features
 */
export class UserManager {
    constructor() {
        this.supabaseManager = new SupabaseManager();
        this.currentUser = null;
        this.isGuest = true;
        this.children = [];
        this.parentProfile = null;
        this.sessionData = {};
        this.offlineMode = !navigator.onLine;
        
        // Initialize from localStorage
        this.loadStoredSession();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Initialize user management system
     */
    async init() {
        console.log('🔧 Initializing User Management System...');
        
        try {
            // Check for existing session
            await this.checkExistingSession();
            
            // Setup guest user if no session
            if (!this.currentUser) {
                this.setupGuestUser();
            }
            
            // Emit user ready event
            this.emitUserEvent('userReady', {
                user: this.currentUser,
                isGuest: this.isGuest,
                mode: this.isGuest ? 'guest' : 'authenticated'
            });
            
            console.log('✅ User Management initialized');
            return true;
            
        } catch (error) {
            console.error('❌ User Management initialization failed:', error);
            this.setupGuestUser(); // Fallback to guest
            return false;
        }
    }

    /**
     * Setup guest user with limited features
     */
    setupGuestUser() {
        const guestId = this.getOrCreateGuestId();
        
        this.currentUser = {
            id: guestId,
            name: this.generateGuestName(),
            avatar: this.selectRandomAvatar(),
            type: USER_CONFIG.modes.GUEST,
            ageGroup: null,
            preferences: {
                theme: 'dark',
                animations: true,
                sound: true,
                language: 'en'
            },
            stats: {
                sessionsPlayed: 0,
                questionsAnswered: 0,
                accuracy: 0,
                timeSpent: 0
            },
            createdAt: new Date().toISOString()
        };
        
        this.isGuest = true;
        this.saveUserSession();
        
        console.log('👶 Guest user created:', this.currentUser.name);
    }

    /**
     * Authentication flow - sign up
     */
    async signUp(credentials) {
        const { email, password, parentName, childName, childAge } = credentials;
        
        try {
            const supabase = await this.supabaseManager.loadSupabase();
            if (!supabase) {
                throw new Error('Authentication service unavailable');
            }

            // Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        parent_name: parentName,
                        child_name: childName,
                        child_age: childAge
                    }
                }
            });

            if (authError) throw authError;

            // Create parent profile
            const parentProfile = {
                id: authData.user.id,
                email: email,
                name: parentName,
                type: USER_CONFIG.profileTypes.PARENT,
                created_at: new Date().toISOString(),
                preferences: {
                    notifications: true,
                    reports: 'weekly',
                    privacy: 'strict'
                }
            };

            // Create child profile
            const childProfile = {
                parent_id: authData.user.id,
                name: childName,
                age_group: this.getAgeGroupFromAge(childAge),
                avatar: this.selectRandomAvatar(),
                type: USER_CONFIG.profileTypes.CHILD,
                preferences: {
                    theme: 'dark',
                    animations: true,
                    sound: true
                },
                stats: {
                    sessionsPlayed: 0,
                    questionsAnswered: 0,
                    accuracy: 0,
                    timeSpent: 0
                },
                created_at: new Date().toISOString()
            };

            // Save to database (or queue if offline)
            if (this.supabaseManager.isOnline) {
                await supabase.from(SUPABASE_CONFIG.tables.parents).insert(parentProfile);
                const { data: childData } = await supabase.from(SUPABASE_CONFIG.tables.children).insert(childProfile).select();
                
                this.setupAuthenticatedUser(parentProfile, [childData[0]]);
            } else {
                // Queue for later sync
                this.supabaseManager.queueOfflineAction({
                    type: 'insert',
                    table: SUPABASE_CONFIG.tables.parents,
                    data: parentProfile
                });
                
                this.supabaseManager.queueOfflineAction({
                    type: 'insert',
                    table: SUPABASE_CONFIG.tables.children,
                    data: childProfile
                });
                
                this.setupAuthenticatedUser(parentProfile, [childProfile]);
            }

            return { success: true, user: authData.user };

        } catch (error) {
            console.error('❌ Sign up failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Authentication flow - sign in
     */
    async signIn(credentials) {
        const { email, password } = credentials;
        
        try {
            const supabase = await this.supabaseManager.loadSupabase();
            if (!supabase) {
                throw new Error('Authentication service unavailable');
            }

            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) throw authError;

            // Load user profiles
            await this.loadUserProfiles(authData.user.id);
            
            return { success: true, user: authData.user };

        } catch (error) {
            console.error('❌ Sign in failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load user profiles after authentication
     */
    async loadUserProfiles(userId) {
        const supabase = await this.supabaseManager.loadSupabase();
        if (!supabase) return;

        try {
            // Load parent profile
            const { data: parentData } = await supabase
                .from(SUPABASE_CONFIG.tables.parents)
                .select('*')
                .eq('id', userId)
                .single();

            // Load children profiles
            const { data: childrenData } = await supabase
                .from(SUPABASE_CONFIG.tables.children)
                .select('*')
                .eq('parent_id', userId);

            this.setupAuthenticatedUser(parentData, childrenData || []);

        } catch (error) {
            console.error('❌ Failed to load profiles:', error);
        }
    }

    /**
     * Setup authenticated user state
     */
    setupAuthenticatedUser(parentProfile, children) {
        this.parentProfile = parentProfile;
        this.children = children;
        this.isGuest = false;

        // Set current user to first child or parent
        this.currentUser = children.length > 0 ? children[0] : parentProfile;
        this.currentUser.type = USER_CONFIG.modes.AUTHENTICATED;

        this.saveUserSession();
        
        this.emitUserEvent('userAuthenticated', {
            user: this.currentUser,
            parent: parentProfile,
            children: children
        });

        console.log('✅ Authenticated user setup complete');
    }

    /**
     * Switch between child profiles
     */
    switchToChild(childId) {
        const child = this.children.find(c => c.id === childId);
        if (!child) {
            console.error('❌ Child not found:', childId);
            return false;
        }

        this.currentUser = child;
        this.saveUserSession();
        
        this.emitUserEvent('userSwitched', {
            user: this.currentUser,
            previousUser: this.currentUser
        });

        console.log('🔄 Switched to child:', child.name);
        return true;
    }

    /**
     * Add new child profile
     */
    async addChild(childData) {
        if (this.isGuest) {
            console.warn('⚠️ Cannot add child in guest mode');
            return false;
        }

        const newChild = {
            parent_id: this.parentProfile.id,
            name: childData.name,
            age_group: this.getAgeGroupFromAge(childData.age),
            avatar: childData.avatar || this.selectRandomAvatar(),
            type: USER_CONFIG.profileTypes.CHILD,
            preferences: {
                theme: 'dark',
                animations: true,
                sound: true
            },
            stats: {
                sessionsPlayed: 0,
                questionsAnswered: 0,
                accuracy: 0,
                timeSpent: 0
            },
            created_at: new Date().toISOString()
        };

        try {
            const supabase = await this.supabaseManager.loadSupabase();
            
            if (supabase && this.supabaseManager.isOnline) {
                const { data } = await supabase
                    .from(SUPABASE_CONFIG.tables.children)
                    .insert(newChild)
                    .select()
                    .single();
                
                this.children.push(data);
            } else {
                // Offline mode - assign temporary ID
                newChild.id = `temp_${Date.now()}`;
                this.children.push(newChild);
                
                this.supabaseManager.queueOfflineAction({
                    type: 'insert',
                    table: SUPABASE_CONFIG.tables.children,
                    data: newChild
                });
            }

            this.saveUserSession();
            
            this.emitUserEvent('childAdded', {
                child: newChild,
                totalChildren: this.children.length
            });

            return newChild;

        } catch (error) {
            console.error('❌ Failed to add child:', error);
            return false;
        }
    }

    /**
     * Update user progress and statistics
     */
    async updateProgress(progressData) {
        const {
            gameType,
            questionsAnswered,
            correctAnswers,
            timeSpent,
            difficulty,
            ageGroup
        } = progressData;

        // Update current user stats
        this.currentUser.stats.sessionsPlayed++;
        this.currentUser.stats.questionsAnswered += questionsAnswered;
        this.currentUser.stats.timeSpent += timeSpent;
        
        // Calculate new accuracy
        const totalCorrect = (this.currentUser.stats.accuracy * 
                            (this.currentUser.stats.questionsAnswered - questionsAnswered)) + 
                            correctAnswers;
        this.currentUser.stats.accuracy = totalCorrect / this.currentUser.stats.questionsAnswered;

        // Create session record
        const sessionRecord = {
            user_id: this.currentUser.id,
            game_type: gameType,
            questions_answered: questionsAnswered,
            correct_answers: correctAnswers,
            accuracy: correctAnswers / questionsAnswered,
            time_spent: timeSpent,
            difficulty: difficulty,
            age_group: ageGroup,
            session_date: new Date().toISOString(),
            is_guest: this.isGuest
        };

        // Save to database or queue
        if (!this.isGuest) {
            const supabase = await this.supabaseManager.loadSupabase();
            
            if (supabase && this.supabaseManager.isOnline) {
                await supabase.from(SUPABASE_CONFIG.tables.sessions).insert(sessionRecord);
                await supabase.from(SUPABASE_CONFIG.tables.children)
                    .update({ stats: this.currentUser.stats })
                    .eq('id', this.currentUser.id);
            } else {
                this.supabaseManager.queueOfflineAction({
                    type: 'insert',
                    table: SUPABASE_CONFIG.tables.sessions,
                    data: sessionRecord
                });
            }
        }

        this.saveUserSession();
        
        this.emitUserEvent('progressUpdated', {
            user: this.currentUser,
            session: sessionRecord
        });
    }

    /**
     * Get user feature access based on mode
     */
    getFeatureAccess() {
        if (this.isGuest) {
            return USER_CONFIG.guestLimitations;
        }
        
        return USER_CONFIG.authenticatedFeatures;
    }

    /**
     * Check if user can access specific feature
     */
    canAccess(feature, context = {}) {
        const access = this.getFeatureAccess();
        
        switch (feature) {
            case 'game':
                if (this.isGuest) {
                    return context.gameId === 'basic-arithmetic';
                }
                return access.allGames;
                
            case 'unlimited_questions':
                return this.isGuest ? false : access.unlimitedQuestions;
                
            case 'ai_personalization':
                return this.isGuest ? false : access.aiPersonalization;
                
            case 'progress_tracking':
                return this.isGuest ? false : access.progressTracking;
                
            default:
                return this.isGuest ? false : true;
        }
    }

    /**
     * Helper methods
     */
    getOrCreateGuestId() {
        let guestId = localStorage.getItem('km_guest_id');
        if (!guestId) {
            guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('km_guest_id', guestId);
        }
        return guestId;
    }

    generateGuestName() {
        const names = [
            'Math Explorer', 'Number Ninja', 'Pattern Detective', 'Counting Champion',
            'Logic Master', 'Problem Solver', 'Brain Builder', 'Smart Cookie',
            'Calculation Kid', 'Math Wizard', 'Number Hero', 'Thinking Star'
        ];
        return names[Math.floor(Math.random() * names.length)];
    }

    selectRandomAvatar() {
        const avatars = ['🧒', '👧', '🧑', '👦', '🧕', '👶', '🧑‍🎓', '👨‍🎓', '👩‍🎓', '🧑‍🔬'];
        return avatars[Math.floor(Math.random() * avatars.length)];
    }

    getAgeGroupFromAge(age) {
        if (age <= 4) return '3-4';
        if (age <= 5) return '4-5';
        if (age <= 6) return '5-6';
        return '6-7';
    }

    /**
     * Session management
     */
    saveUserSession() {
        const sessionData = {
            currentUser: this.currentUser,
            isGuest: this.isGuest,
            parentProfile: this.parentProfile,
            children: this.children,
            timestamp: Date.now()
        };
        
        localStorage.setItem('km_session', JSON.stringify(sessionData));
    }

    loadStoredSession() {
        const stored = localStorage.getItem('km_session');
        if (!stored) return false;

        try {
            const sessionData = JSON.parse(stored);
            const age = Date.now() - sessionData.timestamp;
            
            // Session expires after 30 days for guests, never for authenticated
            if (sessionData.isGuest && age > 30 * 24 * 60 * 60 * 1000) {
                this.clearSession();
                return false;
            }

            this.currentUser = sessionData.currentUser;
            this.isGuest = sessionData.isGuest;
            this.parentProfile = sessionData.parentProfile;
            this.children = sessionData.children || [];

            return true;

        } catch (error) {
            console.error('❌ Failed to load session:', error);
            this.clearSession();
            return false;
        }
    }

    async checkExistingSession() {
        if (!this.isGuest) {
            // Check if authenticated session is still valid
            const supabase = await this.supabaseManager.loadSupabase();
            if (supabase) {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    // Session expired, fallback to guest
                    this.setupGuestUser();
                }
            }
        }
    }

    clearSession() {
        localStorage.removeItem('km_session');
        this.currentUser = null;
        this.isGuest = true;
        this.parentProfile = null;
        this.children = [];
    }

    /**
     * Event system
     */
    setupEventListeners() {
        // Network status changes
        window.addEventListener('online', () => {
            this.offlineMode = false;
            this.emitUserEvent('networkStatusChanged', { isOnline: true });
        });
        
        window.addEventListener('offline', () => {
            this.offlineMode = true;
            this.emitUserEvent('networkStatusChanged', { isOnline: false });
        });
    }

    emitUserEvent(eventName, data) {
        const event = new CustomEvent(`user_${eventName}`, {
            detail: data
        });
        window.dispatchEvent(event);
    }

    /**
     * Sign out
     */
    async signOut() {
        const supabase = await this.supabaseManager.loadSupabase();
        if (supabase && !this.isGuest) {
            await supabase.auth.signOut();
        }
        
        this.clearSession();
        this.setupGuestUser();
        
        this.emitUserEvent('userSignedOut', {
            previousUser: this.currentUser
        });
    }
}

export default UserManager;