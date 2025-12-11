-- Quick Migration Runner - Add Pending Status
-- Run this entire script in Supabase SQL Editor

-- ============================================
-- MIGRATION: Add 'pending' status support
-- ============================================

BEGIN;

-- Step 1: Drop existing constraint
DO $$ 
BEGIN
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
    RAISE NOTICE '✓ Dropped old status constraint';
EXCEPTION 
    WHEN OTHERS THEN 
        RAISE NOTICE '⚠ Could not drop constraint (may not exist): %', SQLERRM;
END $$;

-- Step 2: Add new constraint with 'pending'
ALTER TABLE users ADD CONSTRAINT users_status_check 
  CHECK (status IN ('active', 'inactive', 'suspended', 'pending'));

RAISE NOTICE '✓ Added new status constraint with pending support';

-- Step 3: (Optional) Change default to 'pending' for new registrations
-- Uncomment the next line if you want new users to default to 'pending'
-- ALTER TABLE users ALTER COLUMN status SET DEFAULT 'pending';

-- Step 4: Verify the constraint
DO $$
DECLARE
    constraint_def TEXT;
BEGIN
    SELECT pg_get_constraintdef(oid) INTO constraint_def
    FROM pg_constraint 
    WHERE conname = 'users_status_check';
    
    RAISE NOTICE '✓ New constraint definition: %', constraint_def;
END $$;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check current status values in use
SELECT status, COUNT(*) as count
FROM users
GROUP BY status
ORDER BY count DESC;

-- Test query (don't actually insert)
-- SELECT 'Migration successful - pending status is now valid' as result;
