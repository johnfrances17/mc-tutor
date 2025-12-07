-- MC Tutor Database Refactoring - Based on Actual Supabase Schema
-- Refactor full_name to first_name, middle_name, last_name
-- Add Row Level Security (RLS) for better access control
-- Date: 2025-12-07

-- ============================================
-- CURRENT SCHEMA DETECTED:
-- users: user_id, school_id, email, password, full_name, role, phone, 
--        year_level, course, profile_picture, chat_pin_hash, last_active,
--        created_at, updated_at, status, deleted_at
-- ============================================

BEGIN;

-- ============================================
-- STEP 1: Add new name columns to users table
-- ============================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

COMMENT ON COLUMN users.first_name IS 'User first/given name (required after migration)';
COMMENT ON COLUMN users.middle_name IS 'User middle name (optional)';
COMMENT ON COLUMN users.last_name IS 'User surname/family name (required after migration)';

-- ============================================
-- STEP 2: Migrate existing data from full_name
-- ============================================

-- Split full_name into components
-- Handles formats: "First Last", "First Middle Last", "First M. Last"
UPDATE users 
SET 
  first_name = CASE 
    WHEN full_name IS NOT NULL AND full_name != '' THEN 
      TRIM(SPLIT_PART(full_name, ' ', 1))
    ELSE 'Unknown' 
  END,
  middle_name = CASE 
    -- If there are 3 or more parts, middle is part 2
    WHEN full_name IS NOT NULL AND array_length(string_to_array(full_name, ' '), 1) >= 3 THEN 
      TRIM(SPLIT_PART(full_name, ' ', 2))
    ELSE NULL 
  END,
  last_name = CASE 
    -- If 3+ parts, last is part 3+
    WHEN full_name IS NOT NULL AND array_length(string_to_array(full_name, ' '), 1) >= 3 THEN 
      TRIM(array_to_string((string_to_array(full_name, ' '))[3:], ' '))
    -- If 2 parts, last is part 2
    WHEN full_name IS NOT NULL AND array_length(string_to_array(full_name, ' '), 1) = 2 THEN 
      TRIM(SPLIT_PART(full_name, ' ', 2))
    -- If only 1 part or null
    ELSE COALESCE(full_name, 'Unknown')
  END
WHERE full_name IS NOT NULL OR first_name IS NULL;

-- ============================================
-- STEP 3: Verify migration
-- ============================================

-- Show sample of migrated data
DO $$
DECLARE
  sample_record RECORD;
BEGIN
  RAISE NOTICE '=== MIGRATION VERIFICATION ===';
  FOR sample_record IN 
    SELECT 
      user_id,
      full_name as old_name,
      first_name,
      middle_name,
      last_name,
      CASE 
        WHEN middle_name IS NOT NULL AND middle_name != '' THEN 
          CONCAT(first_name, ' ', middle_name, ' ', last_name)
        ELSE 
          CONCAT(first_name, ' ', last_name)
      END as reconstructed
    FROM users 
    LIMIT 5
  LOOP
    RAISE NOTICE 'User %: "%" → First: "%" Middle: "%" Last: "%" (Reconstructed: "%")', 
      sample_record.user_id,
      sample_record.old_name,
      sample_record.first_name,
      sample_record.middle_name,
      sample_record.last_name,
      sample_record.reconstructed;
  END LOOP;
END $$;

-- ============================================
-- STEP 4: Add constraints after data migration
-- ============================================

-- Make new fields NOT NULL
ALTER TABLE users ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE users ALTER COLUMN last_name SET NOT NULL;

-- Add length validation
ALTER TABLE users 
ADD CONSTRAINT check_first_name_length 
  CHECK (char_length(first_name) >= 1 AND char_length(first_name) <= 100);

ALTER TABLE users 
ADD CONSTRAINT check_last_name_length 
  CHECK (char_length(last_name) >= 1 AND char_length(last_name) <= 100);

ALTER TABLE users 
ADD CONSTRAINT check_middle_name_length 
  CHECK (middle_name IS NULL OR (char_length(middle_name) >= 1 AND char_length(middle_name) <= 100));

-- ============================================
-- STEP 5: Create helper function for full name
-- ============================================

CREATE OR REPLACE FUNCTION get_full_name(
  p_first_name VARCHAR,
  p_middle_name VARCHAR,
  p_last_name VARCHAR
)
RETURNS VARCHAR AS $$
BEGIN
  IF p_middle_name IS NOT NULL AND p_middle_name != '' THEN
    RETURN CONCAT(p_first_name, ' ', p_middle_name, ' ', p_last_name);
  ELSE
    RETURN CONCAT(p_first_name, ' ', p_last_name);
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_full_name IS 'Helper function to construct full name from components';

-- ============================================
-- STEP 6: Create indexes for search performance
-- ============================================

-- Indexes for name searches
CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name);
CREATE INDEX IF NOT EXISTS idx_users_full_name_search ON users 
  USING gin(to_tsvector('english', 
    COALESCE(first_name, '') || ' ' || 
    COALESCE(middle_name, '') || ' ' || 
    COALESCE(last_name, '')
  ));

-- Existing indexes (ensure they exist)
CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status) WHERE status = 'active';

-- ============================================
-- STEP 7: Enable Row Level Security (RLS)
-- ============================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Public can view active tutors" ON users;
DROP POLICY IF EXISTS "Service role has full access" ON users;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT
  USING (
    auth.uid()::text = school_id 
    OR role = 'admin'
  );

-- Policy 2: Users can update their own profile (restricted fields)
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE
  USING (auth.uid()::text = school_id)
  WITH CHECK (
    auth.uid()::text = school_id 
    AND role = OLD.role  -- Cannot change role
    AND school_id = OLD.school_id  -- Cannot change school_id
  );

-- Policy 3: Public can view active tutor profiles (for finding tutors)
CREATE POLICY "Public can view active tutors" ON users
  FOR SELECT
  USING (
    role = 'tutor' 
    AND status = 'active' 
    AND deleted_at IS NULL
  );

-- Policy 4: Service role bypasses RLS (for server operations)
CREATE POLICY "Service role has full access" ON users
  FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- ============================================
-- STEP 8: Enable RLS on related tables
-- ============================================

-- Enable RLS on sessions table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'sessions') THEN
    ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
    
    -- Users can view their own sessions
    DROP POLICY IF EXISTS "Users can view their sessions" ON sessions;
    CREATE POLICY "Users can view their sessions" ON sessions
      FOR SELECT
      USING (
        tutor_id IN (SELECT user_id FROM users WHERE school_id = auth.uid()::text)
        OR tutee_id IN (SELECT user_id FROM users WHERE school_id = auth.uid()::text)
      );
  END IF;
END $$;

-- Enable RLS on materials table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'materials') THEN
    ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
    
    -- All authenticated users can view materials
    DROP POLICY IF EXISTS "Authenticated users can view materials" ON materials;
    CREATE POLICY "Authenticated users can view materials" ON materials
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
      
    -- Tutors can manage their own materials
    DROP POLICY IF EXISTS "Tutors can manage their materials" ON materials;
    CREATE POLICY "Tutors can manage their materials" ON materials
      FOR ALL
      USING (
        tutor_id IN (SELECT user_id FROM users WHERE school_id = auth.uid()::text)
      );
  END IF;
END $$;

-- ============================================
-- STEP 9: Create audit log table for security
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  log_id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id INTEGER,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs
DROP POLICY IF EXISTS "Users can view their audit logs" ON audit_logs;
CREATE POLICY "Users can view their audit logs" ON audit_logs
  FOR SELECT
  USING (
    user_id IN (SELECT user_id FROM users WHERE school_id = auth.uid()::text)
  );

-- ============================================
-- STEP 10: Add security fields to users table
-- ============================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_failed_login TIMESTAMP,
ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_users_locked ON users(account_locked_until) 
  WHERE account_locked_until IS NOT NULL;

-- ============================================
-- STEP 11: Create view for backward compatibility
-- ============================================

CREATE OR REPLACE VIEW users_with_full_name AS
SELECT 
  user_id,
  school_id,
  email,
  password,
  first_name,
  middle_name,
  last_name,
  get_full_name(first_name, middle_name, last_name) as full_name,
  role,
  phone,
  year_level,
  course,
  profile_picture,
  chat_pin_hash,
  last_active,
  created_at,
  updated_at,
  status,
  deleted_at,
  failed_login_attempts,
  last_failed_login,
  account_locked_until,
  last_password_change
FROM users;

COMMENT ON VIEW users_with_full_name IS 'Backward compatible view with computed full_name field';

-- ============================================
-- STEP 12: Grant permissions
-- ============================================

-- Grant authenticated users appropriate permissions
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT ON users_with_full_name TO authenticated;
GRANT SELECT, INSERT ON audit_logs TO authenticated;

-- ============================================
-- STEP 13: Create search function
-- ============================================

CREATE OR REPLACE FUNCTION search_users_by_name(search_term TEXT)
RETURNS TABLE(
  user_id INTEGER,
  full_name TEXT,
  first_name VARCHAR,
  middle_name VARCHAR,
  last_name VARCHAR,
  email VARCHAR,
  role VARCHAR,
  status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.user_id,
    get_full_name(u.first_name, u.middle_name, u.last_name) as full_name,
    u.first_name,
    u.middle_name,
    u.last_name,
    u.email,
    u.role::VARCHAR,
    u.status::VARCHAR
  FROM users u
  WHERE 
    u.deleted_at IS NULL
    AND (
      u.first_name ILIKE '%' || search_term || '%' 
      OR u.middle_name ILIKE '%' || search_term || '%' 
      OR u.last_name ILIKE '%' || search_term || '%'
      OR u.email ILIKE '%' || search_term || '%'
      OR get_full_name(u.first_name, u.middle_name, u.last_name) ILIKE '%' || search_term || '%'
    )
  ORDER BY u.last_name, u.first_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FINAL VERIFICATION
-- ============================================

DO $$
DECLARE
  total_users INTEGER;
  users_with_names INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM users;
  SELECT COUNT(*) INTO users_with_names FROM users 
    WHERE first_name IS NOT NULL AND last_name IS NOT NULL;
    
  RAISE NOTICE '=== MIGRATION COMPLETE ===';
  RAISE NOTICE 'Total users: %', total_users;
  RAISE NOTICE 'Users with migrated names: %', users_with_names;
  RAISE NOTICE 'RLS enabled on users: %', 
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'users');
END $$;

COMMIT;

-- ============================================
-- POST-MIGRATION NOTES
-- ============================================
-- 
-- ✅ Name fields migrated: full_name → first_name, middle_name, last_name
-- ✅ Row Level Security (RLS) enabled
-- ✅ Audit logging table created
-- ✅ Security fields added (failed logins, account lockout)
-- ✅ Search indexes created for performance
-- ✅ Helper functions and views for backward compatibility
--
-- NEXT STEPS:
-- 1. Test queries: SELECT * FROM users_with_full_name LIMIT 5;
-- 2. Test search: SELECT * FROM search_users_by_name('Kimel');
-- 3. Update application code to use new fields
-- 4. After 30 days of testing, optionally:
--    ALTER TABLE users DROP COLUMN full_name;
--
-- ============================================
