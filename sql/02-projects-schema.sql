-- ============================================
-- SOCIETY ARTS - USER PROJECTS SCHEMA
-- SAFE VERSION - handles existing objects
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- Create projects table
CREATE TABLE IF NOT EXISTS user_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Project info
    title TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
    
    -- Story content
    story TEXT,
    transformed_story TEXT,
    transform_label TEXT,
    
    -- Settings
    aspect_ratio TEXT DEFAULT '1:1',
    
    -- Selected styles (array of style IDs, max 4)
    selected_styles TEXT[] DEFAULT '{}',
    
    -- Chat history (JSON array of messages)
    chat_history JSONB DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_updated_at ON user_projects(updated_at DESC);

-- Enable RLS
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own projects" ON user_projects;
CREATE POLICY "Users can view own projects"
    ON user_projects FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own projects" ON user_projects;
CREATE POLICY "Users can create own projects"
    ON user_projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON user_projects;
CREATE POLICY "Users can update own projects"
    ON user_projects FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON user_projects;
CREATE POLICY "Users can delete own projects"
    ON user_projects FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- USER FAVORITES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    style_id TEXT NOT NULL,
    style_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate favorites
    UNIQUE(user_id, style_id)
);

-- Create index (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop and recreate)
DROP POLICY IF EXISTS "Users can view own favorites" ON user_favorites;
CREATE POLICY "Users can view own favorites"
    ON user_favorites FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add own favorites" ON user_favorites;
CREATE POLICY "Users can add own favorites"
    ON user_favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON user_favorites;
CREATE POLICY "Users can delete own favorites"
    ON user_favorites FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- UPDATE user_profiles TO TRACK COUNTS
-- ============================================

-- Add columns for quick counts (only if user_profiles exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS project_count INTEGER DEFAULT 0;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS favorite_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Function to update project count
CREATE OR REPLACE FUNCTION update_project_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE user_profiles SET project_count = project_count + 1 WHERE id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE user_profiles SET project_count = project_count - 1 WHERE id = OLD.user_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update favorite count
CREATE OR REPLACE FUNCTION update_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE user_profiles SET favorite_count = favorite_count + 1 WHERE id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE user_profiles SET favorite_count = favorite_count - 1 WHERE id = OLD.user_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for count updates (drop first to avoid conflicts)
DROP TRIGGER IF EXISTS on_project_change ON user_projects;
CREATE TRIGGER on_project_change
    AFTER INSERT OR DELETE ON user_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_project_count();

DROP TRIGGER IF EXISTS on_favorite_change ON user_favorites;
CREATE TRIGGER on_favorite_change
    AFTER INSERT OR DELETE ON user_favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_favorite_count();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'Projects schema migration completed successfully!' as status;
