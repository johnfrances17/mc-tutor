-- MC Tutor Database - TRANSFORM TO 3 NAME FIELDS
-- This will update your database structure FIRST before fetching schema
-- Date: 2025-12-07

BEGIN;

-- ============================================
-- STEP 1: Add the 3 name columns if not exist
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
    RAISE NOTICE '✅ Added column: first_name';
  ELSE
    RAISE NOTICE '⏭️ first_name already exists';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'middle_name'
  ) THEN
    ALTER TABLE users ADD COLUMN middle_name VARCHAR(100);
    RAISE NOTICE '✅ Added column: middle_name';
  ELSE
    RAISE NOTICE '⏭️ middle_name already exists';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
    RAISE NOTICE '✅ Added column: last_name';
  ELSE
    RAISE NOTICE '⏭️ last_name already exists';
  END IF;
END $$;

-- ============================================
-- STEP 2: Migrate data from full_name to 3 fields
-- ============================================

DO $$ 
DECLARE
  rec RECORD;
  name_parts TEXT[];
  parts_count INT;
BEGIN
  FOR rec IN 
    SELECT user_id, full_name 
    FROM users 
    WHERE full_name IS NOT NULL
      AND (first_name IS NULL OR last_name IS NULL)
  LOOP
    -- Split name by spaces
    name_parts := string_to_array(TRIM(rec.full_name), ' ');
    parts_count := array_length(name_parts, 1);
    
    IF parts_count = 1 THEN
      -- Only one word - use as both first and last name
      UPDATE users 
      SET 
        first_name = name_parts[1],
        middle_name = NULL,
        last_name = name_parts[1]
      WHERE user_id = rec.user_id;
      
    ELSIF parts_count = 2 THEN
      -- Two words - first and last
      UPDATE users 
      SET 
        first_name = name_parts[1],
        middle_name = NULL,
        last_name = name_parts[2]
      WHERE user_id = rec.user_id;
      
    ELSIF parts_count >= 3 THEN
      -- Three or more words - first, middle, rest as last
      UPDATE users 
      SET 
        first_name = name_parts[1],
        middle_name = name_parts[2],
        last_name = array_to_string(name_parts[3:parts_count], ' ')
      WHERE user_id = rec.user_id;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ Data migration completed from full_name to first/middle/last';
END $$;

-- ============================================
-- STEP 3: Set defaults for NULL values
-- ============================================

DO $$ 
BEGIN
  UPDATE users SET first_name = 'Unknown' WHERE first_name IS NULL OR first_name = '';
  UPDATE users SET last_name = 'Unknown' WHERE last_name IS NULL OR last_name = '';
  RAISE NOTICE '✅ Set defaults for NULL values';
END $$;

-- ============================================
-- STEP 4: Drop ALL views that depend on users table
-- ============================================

DROP VIEW IF EXISTS users_with_full_name CASCADE;
DROP VIEW IF EXISTS users_legacy CASCADE;
DROP VIEW IF EXISTS active_students CASCADE;
DROP VIEW IF EXISTS active_tutors CASCADE;
DROP VIEW IF EXISTS upcoming_sessions CASCADE;
DROP VIEW IF EXISTS sessions_with_details CASCADE;
DROP VIEW IF EXISTS user_sessions CASCADE;

DO $$ 
BEGIN
  RAISE NOTICE '🗑️ Deleted ALL old views that might depend on full_name';
END $$;

-- ============================================
-- STEP 5: NOW drop full_name column
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE users DROP COLUMN full_name CASCADE;
    RAISE NOTICE '🗑️ DELETED full_name column forever!';
  ELSE
    RAISE NOTICE '⏭️ full_name column already deleted';
  END IF;
END $$;

-- ============================================
-- STEP 6: Set NOT NULL constraints
-- ============================================

DO $$ 
BEGIN
  BEGIN
    ALTER TABLE users ALTER COLUMN first_name SET NOT NULL;
    RAISE NOTICE '✅ first_name set to NOT NULL';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⏭️ first_name already NOT NULL';
  END;

  BEGIN
    ALTER TABLE users ALTER COLUMN last_name SET NOT NULL;
    RAISE NOTICE '✅ last_name set to NOT NULL';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⏭️ last_name already NOT NULL';
  END;
END $$;

-- ============================================
-- STEP 7: Create helper function
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

DO $$ 
BEGIN
  RAISE NOTICE '✅ Helper function get_full_name() created';
END $$;

-- ============================================
-- STEP 8: Create NEW simple views
-- ============================================

CREATE OR REPLACE VIEW students AS
SELECT 
  user_id,
  first_name,
  middle_name,
  last_name,
  get_full_name(first_name, middle_name, last_name) as full_name,
  email,
  role,
  status,
  school_id,
  year_level,
  created_at,
  updated_at
FROM users 
WHERE role = 'tutee' AND status = 'active' AND deleted_at IS NULL;

CREATE OR REPLACE VIEW tutors AS
SELECT 
  user_id,
  first_name,
  middle_name,
  last_name,
  get_full_name(first_name, middle_name, last_name) as full_name,
  email,
  role,
  status,
  created_at,
  updated_at
FROM users 
WHERE role = 'tutor' AND status = 'active' AND deleted_at IS NULL;

DO $$ 
BEGIN
  RAISE NOTICE '✅ Created NEW simple views: students, tutors';
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  total_users INTEGER;
  users_with_names INTEGER;
  has_full_name BOOLEAN;
  rec RECORD;
BEGIN
  -- Count users
  SELECT COUNT(*) INTO total_users FROM users;
  SELECT COUNT(*) INTO users_with_names FROM users 
    WHERE first_name IS NOT NULL AND last_name IS NOT NULL;
  
  -- Check if full_name still exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'full_name'
  ) INTO has_full_name;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 DATABASE TRANSFORMATION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total users: %', total_users;
  RAISE NOTICE 'Users with new name fields: %', users_with_names;
  RAISE NOTICE 'full_name column exists: %', has_full_name;
  RAISE NOTICE '';
  RAISE NOTICE 'Sample users:';
  FOR rec IN 
    SELECT user_id, first_name, middle_name, last_name,
           get_full_name(first_name, middle_name, last_name) as computed_name,
           email, role
    FROM users LIMIT 5
  LOOP
    RAISE NOTICE '  User %: % % % → "%"', 
      rec.user_id, rec.first_name, 
      COALESCE(rec.middle_name, '(no middle)'), 
      rec.last_name, rec.computed_name;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Ready! Run fetch_current_schema.sql now';
  RAISE NOTICE '========================================';
END $$;

COMMIT;
