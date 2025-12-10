-- Migration: Remove email_verified column from users table
-- Date: 2025-12-10
-- Description: Remove unused email verification functionality
-- Safe to run multiple times

-- Drop index if exists
DROP INDEX IF EXISTS idx_users_email_verified;

-- Remove email_verified column if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE users DROP COLUMN email_verified;
        RAISE NOTICE 'Removed email_verified column from users table';
    ELSE
        RAISE NOTICE 'email_verified column does not exist';
    END IF;
END $$;

-- Display results
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE role = 'admin') as admin_users,
    COUNT(*) FILTER (WHERE role = 'tutor') as tutors,
    COUNT(*) FILTER (WHERE role = 'tutee') as tutees
FROM users;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Email verification removal completed successfully!';
    RAISE NOTICE 'Users can now register and login without email verification';
END $$;
