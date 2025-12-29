-- ============================================
-- SOCIETY ARTS - USER PREFERENCES MIGRATION
-- Adds preference columns to user_profiles
-- Run this AFTER auth-schema-safe.sql
-- ============================================

-- Add new preference columns to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS style_finder_version VARCHAR(10) DEFAULT '1',
ADD COLUMN IF NOT EXISTS voice_persona VARCHAR(20) DEFAULT 'default',
ADD COLUMN IF NOT EXISTS grid_density VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Create index on preferences for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferences ON user_profiles USING GIN (preferences);

-- Comments for documentation
COMMENT ON COLUMN user_profiles.style_finder_version IS 'Preferred Style Finder version: 1, 2, 3, or 4';
COMMENT ON COLUMN user_profiles.voice_persona IS 'Voice persona preference: default, female, male, neutral';
COMMENT ON COLUMN user_profiles.grid_density IS 'Grid display density: compact, medium, spacious';
COMMENT ON COLUMN user_profiles.preferences IS 'JSON object for additional user preferences';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'User preferences migration completed successfully!' as status;
