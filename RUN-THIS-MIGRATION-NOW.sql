-- ⚠️ IMPORTANT: Run this SQL in Supabase SQL Editor NOW
-- This will fix both issues:
--   1. "created_by_tutor_id" column error
--   2. Enable custom subject creation

-- Copy everything below and paste into Supabase SQL Editor
-- Then click "Run" button

BEGIN;

-- Add is_custom column to track tutor-created subjects
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE;

-- Add created_by_tutor_id to track which tutor created it
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS created_by_tutor_id INTEGER REFERENCES users(user_id);

-- Update existing subjects to mark them as standard (not custom)
UPDATE subjects SET is_custom = FALSE WHERE is_custom IS NULL;

-- Create index for faster queries on custom subjects
CREATE INDEX IF NOT EXISTS idx_subjects_is_custom ON subjects(is_custom);
CREATE INDEX IF NOT EXISTS idx_subjects_created_by_tutor ON subjects(created_by_tutor_id);

COMMIT;

-- After running, verify with this query:
SELECT subject_code, subject_name, is_custom, created_by_tutor_id 
FROM subjects 
LIMIT 5;
