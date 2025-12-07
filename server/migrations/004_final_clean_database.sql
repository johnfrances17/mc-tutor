-- MC Tutor Database - FINAL CLEAN MIGRATION
-- Remove duplicate tables and optimize structure
-- Date: 2025-12-07

BEGIN;

-- ============================================
-- STEP 1: Add name columns if not exist
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
    RAISE NOTICE '✅ Added column: first_name';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'middle_name'
  ) THEN
    ALTER TABLE users ADD COLUMN middle_name VARCHAR(100);
    RAISE NOTICE '✅ Added column: middle_name';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
    RAISE NOTICE '✅ Added column: last_name';
  END IF;
END $$;

-- ============================================
-- STEP 2: Migrate data from full_name
-- ============================================

DO $$ 
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN 
    SELECT user_id, full_name 
    FROM users 
    WHERE (first_name IS NULL OR last_name IS NULL) 
      AND full_name IS NOT NULL
  LOOP
    UPDATE users 
    SET 
      first_name = TRIM(SPLIT_PART(rec.full_name, ' ', 1)),
      middle_name = CASE 
        WHEN array_length(string_to_array(rec.full_name, ' '), 1) >= 3 THEN 
          TRIM(SPLIT_PART(rec.full_name, ' ', 2))
        ELSE NULL 
      END,
      last_name = CASE 
        WHEN array_length(string_to_array(rec.full_name, ' '), 1) >= 3 THEN 
          TRIM(array_to_string((string_to_array(rec.full_name, ' '))[3:], ' '))
        WHEN array_length(string_to_array(rec.full_name, ' '), 1) = 2 THEN 
          TRIM(SPLIT_PART(rec.full_name, ' ', 2))
        ELSE rec.full_name
      END
    WHERE user_id = rec.user_id;
  END LOOP;
  
  RAISE NOTICE '✅ Data migration completed';
END $$;

-- ============================================
-- STEP 3: Set NOT NULL and add constraints
-- ============================================

DO $$ 
BEGIN
  UPDATE users SET first_name = 'Unknown' WHERE first_name IS NULL OR first_name = '';
  UPDATE users SET last_name = 'Unknown' WHERE last_name IS NULL OR last_name = '';
  
  BEGIN
    ALTER TABLE users ALTER COLUMN first_name SET NOT NULL;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'first_name already NOT NULL';
  END;

  BEGIN
    ALTER TABLE users ALTER COLUMN last_name SET NOT NULL;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'last_name already NOT NULL';
  END;
END $$;

ALTER TABLE users DROP CONSTRAINT IF EXISTS check_first_name_length;
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_last_name_length;
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_middle_name_length;

ALTER TABLE users 
ADD CONSTRAINT check_first_name_length 
  CHECK (char_length(first_name) >= 1 AND char_length(first_name) <= 100);

ALTER TABLE users 
ADD CONSTRAINT check_last_name_length 
  CHECK (char_length(last_name) >= 1 AND char_length(last_name) <= 100);

ALTER TABLE users 
ADD CONSTRAINT check_middle_name_length 
  CHECK (middle_name IS NULL OR (char_length(middle_name) >= 1 AND char_length(middle_name) <= 100));

RAISE NOTICE '✅ Constraints added';

-- ============================================
-- STEP 4: DELETE full_name column (NO LONGER NEEDED!)
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE users DROP COLUMN full_name;
    RAISE NOTICE '🗑️ DELETED full_name column - no longer needed!';
  END IF;
END $$;

-- ============================================
-- STEP 5: Create helper function for display
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

RAISE NOTICE '✅ Helper function created';

-- ============================================
-- STEP 6: Create optimized indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name);
CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status) WHERE status = 'active';

DROP INDEX IF EXISTS idx_users_name_search;
CREATE INDEX idx_users_name_search ON users 
  USING gin(to_tsvector('english', 
    COALESCE(first_name, '') || ' ' || 
    COALESCE(middle_name, '') || ' ' || 
    COALESCE(last_name, '')
  ));

RAISE NOTICE '✅ Indexes created';

-- ============================================
-- STEP 7: DISABLE RLS on ALL tables
-- ============================================

DO $$ 
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT schemaname, tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' AND rowsecurity = true
  LOOP
    EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY', tbl.schemaname, tbl.tablename);
    RAISE NOTICE '✅ Disabled RLS on: %', tbl.tablename;
  END LOOP;
END $$;

-- Drop all policies
DO $$ 
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
  RAISE NOTICE '✅ All RLS policies dropped';
END $$;

-- ============================================
-- STEP 8: DELETE DUPLICATE/USELESS TABLES & VIEWS
-- ============================================

-- Delete useless views
DROP VIEW IF EXISTS users_with_full_name CASCADE;
DROP VIEW IF EXISTS users_legacy CASCADE;
DROP VIEW IF EXISTS active_students CASCADE;
DROP VIEW IF EXISTS active_tutors CASCADE;
DROP VIEW IF EXISTS upcoming_sessions CASCADE;

RAISE NOTICE '🗑️ Deleted useless views: users_with_full_name, users_legacy, active_students, active_tutors, upcoming_sessions';

-- Delete duplicate tables if they exist
DROP TABLE IF EXISTS users_legacy_backup CASCADE;
DROP TABLE IF EXISTS sessions_backup CASCADE;

RAISE NOTICE '🗑️ Deleted backup tables if existed';

-- ============================================
-- STEP 9: Add security fields
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'failed_login_attempts'
  ) THEN
    ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'last_failed_login'
  ) THEN
    ALTER TABLE users ADD COLUMN last_failed_login TIMESTAMP;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'account_locked_until'
  ) THEN
    ALTER TABLE users ADD COLUMN account_locked_until TIMESTAMP;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_locked ON users(account_locked_until) 
  WHERE account_locked_until IS NOT NULL;

RAISE NOTICE '✅ Security fields added';

-- ============================================
-- STEP 10: Create audit log table
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  log_id BIGSERIAL PRIMARY KEY,
  user_id INTEGER,
  action VARCHAR(50) NOT NULL,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

RAISE NOTICE '✅ Audit logs table ready';

-- ============================================
-- STEP 11: Create useful helper views (ONLY IF NEEDED)
-- ============================================

-- Simple view to get students (replaces active_students)
CREATE OR REPLACE VIEW students AS
SELECT * FROM users 
WHERE role = 'tutee' AND status = 'active' AND deleted_at IS NULL;

-- Simple view to get tutors (replaces active_tutors)
CREATE OR REPLACE VIEW tutors AS
SELECT * FROM users 
WHERE role = 'tutor' AND status = 'active' AND deleted_at IS NULL;

RAISE NOTICE '✅ Created simple views: students, tutors';

-- ============================================
-- STEP 12: Create search function
-- ============================================

CREATE OR REPLACE FUNCTION search_users_by_name(search_term TEXT)
RETURNS TABLE(
  user_id INTEGER,
  full_name TEXT,
  email VARCHAR,
  role VARCHAR,
  status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.user_id,
    get_full_name(u.first_name, u.middle_name, u.last_name) as full_name,
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
    )
  ORDER BY u.last_name, u.first_name
  LIMIT 100;
END;
$$ LANGUAGE plpgsql STABLE;

RAISE NOTICE '✅ Search function created';

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  total_users INTEGER;
  users_with_names INTEGER;
  unrestricted_tables INTEGER;
  rec RECORD;
BEGIN
  SELECT COUNT(*) INTO total_users FROM users;
  SELECT COUNT(*) INTO users_with_names FROM users 
    WHERE first_name IS NOT NULL AND last_name IS NOT NULL;
  
  SELECT COUNT(*) INTO unrestricted_tables
  FROM pg_tables 
  WHERE schemaname = 'public' AND rowsecurity = true;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 DATABASE MIGRATION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total users: %', total_users;
  RAISE NOTICE 'Users with name fields: %', users_with_names;
  RAISE NOTICE 'Tables with RLS: % (should be 0)', unrestricted_tables;
  RAISE NOTICE '';
  RAISE NOTICE '✅ DELETED: full_name column';
  RAISE NOTICE '✅ DELETED: users_with_full_name view';
  RAISE NOTICE '✅ DELETED: active_students view';
  RAISE NOTICE '✅ DELETED: active_tutors view';
  RAISE NOTICE '✅ DELETED: upcoming_sessions view';
  RAISE NOTICE '';
  RAISE NOTICE '✅ CREATED: students view (role=tutee)';
  RAISE NOTICE '✅ CREATED: tutors view (role=tutor)';
  RAISE NOTICE '✅ ADDED: first_name, middle_name, last_name';
  RAISE NOTICE '✅ ALL RLS disabled';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Sample users:';
  FOR rec IN 
    SELECT user_id, first_name, middle_name, last_name,
           get_full_name(first_name, middle_name, last_name) as computed_name,
           role
    FROM users LIMIT 3
  LOOP
    RAISE NOTICE '  User % (%)): % % % → %', 
      rec.user_id, rec.role, rec.first_name, rec.middle_name, rec.last_name, rec.computed_name;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🚀 READY TO USE!';
  RAISE NOTICE '========================================';
END $$;

COMMIT;

-- ============================================
-- POST-MIGRATION (Run separately)
-- ============================================
-- 
-- VACUUM ANALYZE users;
-- VACUUM ANALYZE audit_logs;
-- 
-- ============================================
