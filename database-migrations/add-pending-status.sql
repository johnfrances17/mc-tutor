-- Migration: Add 'pending' status to users table
-- Date: 2025-12-11
-- Purpose: Allow user accounts to be created with 'pending' status for admin approval workflow

-- Step 1: Drop the existing status check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;

-- Step 2: Add the new check constraint with 'pending' included
ALTER TABLE users ADD CONSTRAINT users_status_check 
  CHECK (status IN ('active', 'inactive', 'suspended', 'pending'));

-- Step 3: Update the default value to 'pending' for new registrations (optional)
-- Uncomment the line below if you want new registrations to default to 'pending'
-- ALTER TABLE users ALTER COLUMN status SET DEFAULT 'pending';

-- Step 4: Verify the change
-- Run this query to check the constraint:
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'users_status_check';

-- Note: Existing users will not be affected. Only new registrations will use the 'pending' status.
