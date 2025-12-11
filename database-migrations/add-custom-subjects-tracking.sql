-- Migration: Add custom subject tracking fields
-- Date: 2025-12-11
-- Purpose: Allow tracking of tutor-created custom subjects and their approval status

BEGIN;

-- Add is_custom column to track tutor-created subjects
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE;

-- Add created_by_tutor_id to track which tutor created it
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS created_by_tutor_id INTEGER REFERENCES users(user_id);

-- Add approved status for custom subjects (null means it's a standard subject)
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT NULL;

-- Update existing subjects to mark them as standard (not custom)
UPDATE subjects SET is_custom = FALSE WHERE is_custom IS NULL;

-- Create index for faster queries on custom subjects
CREATE INDEX IF NOT EXISTS idx_subjects_is_custom ON subjects(is_custom);
CREATE INDEX IF NOT EXISTS idx_subjects_approval_status ON subjects(approval_status);
CREATE INDEX IF NOT EXISTS idx_subjects_created_by_tutor ON subjects(created_by_tutor_id);

COMMIT;

-- Verification queries
-- SELECT subject_code, subject_name, is_custom, approval_status FROM subjects WHERE is_custom = TRUE;
-- SELECT COUNT(*) as custom_subjects FROM subjects WHERE is_custom = TRUE;
