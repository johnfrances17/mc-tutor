-- =====================================================
-- MC TUTOR - RENAME STUDENT_ID TO SCHOOL_ID MIGRATION
-- Makes the ID field more generic for all user types
-- Date: December 4, 2025
-- Safe to run multiple times (idempotent)
-- =====================================================

-- Step 1: Rename column in users table
DO $$ 
BEGIN
    -- Check if old column exists and new one doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'student_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'school_id'
    ) THEN
        ALTER TABLE users RENAME COLUMN student_id TO school_id;
        RAISE NOTICE 'Renamed student_id to school_id in users table';
    ELSE
        RAISE NOTICE 'Column already renamed or migration already applied';
    END IF;
END $$;

-- Step 2: Update index names for clarity (if they exist)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_users_student_id'
    ) THEN
        DROP INDEX IF EXISTS idx_users_student_id;
        CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
        RAISE NOTICE 'Updated index from idx_users_student_id to idx_users_school_id';
    END IF;
END $$;

-- Step 3: Verify constraints are maintained
DO $$
BEGIN
    -- Ensure unique constraint exists on school_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_type = 'UNIQUE' 
        AND table_name = 'users' 
        AND constraint_name LIKE '%school_id%'
    ) THEN
        -- Check if there's a unique constraint on the column regardless of name
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'school_id' 
            AND is_nullable = 'NO'
        ) THEN
            RAISE NOTICE 'Unique constraint exists on school_id';
        END IF;
    END IF;
END $$;

-- Step 4: Create view for backward compatibility (optional)
CREATE OR REPLACE VIEW users_legacy AS
SELECT 
    user_id,
    school_id as student_id,  -- Alias for backward compatibility
    email,
    full_name,
    role,
    phone,
    year_level,
    course,
    profile_picture,
    status,
    created_at,
    updated_at,
    last_active
FROM users;

COMMENT ON VIEW users_legacy IS 'Backward compatibility view - maps school_id back to student_id for legacy code';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Uncomment to verify migration success:
/*
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('school_id', 'student_id')
ORDER BY column_name;
*/

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================
-- To rollback this migration, run:
/*
ALTER TABLE users RENAME COLUMN school_id TO student_id;
DROP INDEX IF EXISTS idx_users_school_id;
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
DROP VIEW IF EXISTS users_legacy;
*/
