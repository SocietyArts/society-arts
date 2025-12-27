-- =============================================
-- SOCIETY ARTS - USER AUTHENTICATION SCHEMA
-- SAFE VERSION - handles existing objects
-- Run this SQL in Supabase SQL Editor
-- =============================================

-- 1. Create user role enum (skip if already exists)
DO $$ 
BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'type "user_role" already exists, skipping';
END $$;

-- 2. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create index on role for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- 4. Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for user_profiles (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        role = (SELECT role FROM user_profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Super admins can view all profiles" ON user_profiles;
CREATE POLICY "Super admins can view all profiles"
    ON user_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

DROP POLICY IF EXISTS "Super admins can update all profiles" ON user_profiles;
CREATE POLICY "Super admins can update all profiles"
    ON user_profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Allow insert for new user creation
DROP POLICY IF EXISTS "Allow insert for new users" ON user_profiles;
CREATE POLICY "Allow insert for new users"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 6. Function to handle new user signups
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, display_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        CASE 
            WHEN NEW.email = 'steve@societyarts.com' THEN 'super_admin'::user_role
            ELSE 'user'::user_role
        END
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 8. Create storage bucket for avatars (ignore if exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 9. Storage policies for avatars (drop and recreate)
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- 10. Add style editing policy for admins (only if styles table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'styles') THEN
        DROP POLICY IF EXISTS "Admins can update styles" ON styles;
        CREATE POLICY "Admins can update styles"
            ON styles FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM user_profiles
                    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
                )
            );
    END IF;
END $$;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT 'Auth schema migration completed successfully!' as status;
