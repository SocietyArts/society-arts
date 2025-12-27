-- ============================================
-- SOCIETY ARTS - SAFE MIGRATION
-- Only adds what's missing, won't error on existing objects
-- ============================================

-- Add style_name column to user_favorites if it doesn't exist
ALTER TABLE user_favorites 
ADD COLUMN IF NOT EXISTS style_name TEXT;

-- Add project_count to user_profiles if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS project_count INTEGER DEFAULT 0;

-- Add favorite_count to user_profiles if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS favorite_count INTEGER DEFAULT 0;

-- ============================================
-- INDEXES (drop and recreate to be safe)
-- ============================================

DROP INDEX IF EXISTS idx_user_projects_user_id;
CREATE INDEX idx_user_projects_user_id ON user_projects(user_id);

DROP INDEX IF EXISTS idx_user_projects_updated_at;
CREATE INDEX idx_user_projects_updated_at ON user_projects(updated_at DESC);

DROP INDEX IF EXISTS idx_user_favorites_user_id;
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);

-- ============================================
-- FUNCTIONS (CREATE OR REPLACE is safe)
-- ============================================

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

-- ============================================
-- TRIGGERS (drop first, then create)
-- ============================================

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
-- Done! All migrations applied safely.
-- ============================================
