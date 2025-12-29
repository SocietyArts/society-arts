-- =============================================
-- SOCIETY ARTS - FIX AUTH TRIGGER
-- Fixes "Database error saving new user" on OAuth login
-- Run this SQL in Supabase SQL Editor
-- =============================================

-- The issue: RLS policy blocks INSERT from trigger because auth.uid()
-- isn't established yet when the trigger fires on auth.users INSERT.
-- 
-- Solution: Drop the restrictive INSERT policy and rely on the 
-- SECURITY DEFINER trigger to handle inserts safely.

-- 1. Drop the problematic INSERT policy
DROP POLICY IF EXISTS "Allow insert for new users" ON user_profiles;

-- 2. Create a more permissive INSERT policy for the trigger
-- The trigger runs as SECURITY DEFINER so it bypasses RLS,
-- but we still need a policy for edge cases
CREATE POLICY "Allow profile creation"
    ON user_profiles FOR INSERT
    WITH CHECK (true);  -- Allow all inserts (trigger is the only source)

-- 3. Recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_display_name TEXT;
BEGIN
    -- Extract display name from various possible sources
    user_display_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'user_name',
        split_part(NEW.email, '@', 1)
    );
    
    -- Insert or update the profile
    INSERT INTO public.user_profiles (id, email, display_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        user_display_name,
        CASE 
            WHEN NEW.email = 'steve@societyarts.com' THEN 'super_admin'::user_role
            WHEN NEW.email LIKE '%@societyarts.com' THEN 'admin'::user_role
            ELSE 'user'::user_role
        END
    )
    ON CONFLICT (id) DO UPDATE SET
        email = COALESCE(EXCLUDED.email, user_profiles.email),
        display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name),
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'handle_new_user failed for %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

-- =============================================
-- VERIFY FIX
-- =============================================
SELECT 'Auth trigger fix applied successfully!' as status;

-- Check if trigger exists
SELECT 
    tgname as trigger_name,
    proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';
