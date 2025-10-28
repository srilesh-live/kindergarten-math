-- Kindergarten Math Adventure - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create all necessary tables

-- ================================================
-- USER PROFILES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email TEXT,
    display_name TEXT NOT NULL,
    age_group TEXT DEFAULT '4-5',
    avatar TEXT DEFAULT '👶',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================================
-- USER PROGRESS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    total_games_played INTEGER DEFAULT 0,
    total_correct_answers INTEGER DEFAULT 0,
    total_questions_answered INTEGER DEFAULT 0,
    overall_accuracy DECIMAL(5,2) DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- in seconds
    best_streak INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    experience_points INTEGER DEFAULT 0,
    last_played TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
    FOR ALL USING (auth.uid() = user_id);

-- ================================================
-- USER SETTINGS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    sound_enabled BOOLEAN DEFAULT TRUE,
    music_enabled BOOLEAN DEFAULT TRUE,
    vibration_enabled BOOLEAN DEFAULT TRUE,
    hints_enabled BOOLEAN DEFAULT TRUE,
    confetti_enabled BOOLEAN DEFAULT TRUE,
    age_group TEXT DEFAULT '4-5',
    text_size TEXT DEFAULT 'medium',
    high_contrast BOOLEAN DEFAULT FALSE,
    reduced_motion BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

-- ================================================
-- USER ACHIEVEMENTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    achievement_id TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    progress INTEGER DEFAULT 100,
    UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON user_achievements
    FOR UPDATE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- ================================================
-- GAME SESSIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    game_type TEXT NOT NULL,
    session_date TIMESTAMPTZ DEFAULT NOW(),
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- in seconds
    longest_streak INTEGER DEFAULT 0,
    hints_used INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own sessions" ON game_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON game_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_date ON game_sessions(session_date DESC);
CREATE INDEX idx_game_sessions_game_type ON game_sessions(game_type);

-- ================================================
-- DAILY CHALLENGE COMPLETIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS daily_challenge_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    challenge_date DATE NOT NULL,
    challenge_type TEXT NOT NULL,
    challenge_name TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    progress INTEGER DEFAULT 0,
    reward_points INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, challenge_date, challenge_type)
);

-- Enable RLS
ALTER TABLE daily_challenge_completions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own challenges" ON daily_challenge_completions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges" ON daily_challenge_completions
    FOR ALL USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_daily_challenges_user_date ON daily_challenge_completions(user_id, challenge_date DESC);

-- ================================================
-- LEADERBOARD TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar TEXT DEFAULT '👶',
    total_score INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    achievements_count INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    experience_points INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (public read, user write)
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view leaderboard" ON leaderboard_entries
    FOR SELECT USING (true);

CREATE POLICY "Users can update own entry" ON leaderboard_entries
    FOR ALL USING (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX idx_leaderboard_score ON leaderboard_entries(total_score DESC);
CREATE INDEX idx_leaderboard_level ON leaderboard_entries(level DESC);
CREATE INDEX idx_leaderboard_updated ON leaderboard_entries(last_updated DESC);

-- ================================================
-- FUNCTIONS
-- ================================================

-- Function to get game type leaderboard
CREATE OR REPLACE FUNCTION get_game_type_leaderboard(
    game_type_param TEXT,
    limit_param INTEGER DEFAULT 50
)
RETURNS TABLE (
    user_id UUID,
    display_name TEXT,
    avatar TEXT,
    total_score BIGINT,
    games_played BIGINT,
    avg_accuracy DECIMAL,
    best_streak INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gs.user_id,
        up.display_name,
        up.avatar,
        SUM(gs.score)::BIGINT as total_score,
        COUNT(*)::BIGINT as games_played,
        AVG(gs.accuracy) as avg_accuracy,
        MAX(gs.longest_streak) as best_streak
    FROM game_sessions gs
    JOIN user_profiles up ON gs.user_id = up.user_id
    WHERE gs.game_type = game_type_param
    GROUP BY gs.user_id, up.display_name, up.avatar
    ORDER BY total_score DESC
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- TRIGGERS
-- ================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- REALTIME PUBLICATION (for real-time updates)
-- ================================================

-- Enable realtime for leaderboard
ALTER PUBLICATION supabase_realtime ADD TABLE leaderboard_entries;

-- ================================================
-- INITIAL DATA / SEED (Optional)
-- ================================================

-- You can add any initial data here if needed

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON TABLE user_profiles IS 'User profile information';
COMMENT ON TABLE user_progress IS 'User game progress and statistics';
COMMENT ON TABLE user_settings IS 'User preferences and settings';
COMMENT ON TABLE user_achievements IS 'Unlocked achievements per user';
COMMENT ON TABLE game_sessions IS 'Individual game session records';
COMMENT ON TABLE daily_challenge_completions IS 'Daily challenge completion tracking';
COMMENT ON TABLE leaderboard_entries IS 'Global leaderboard rankings';
