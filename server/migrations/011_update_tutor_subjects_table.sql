-- ===================================
-- Migration: Update Tutor Subjects Table Schema
-- Date: 2025-12-07
-- Description: Add proficiency constraints and activity tracking
-- ===================================

-- Step 1: Add new columns
ALTER TABLE tutor_subjects ADD COLUMN IF NOT EXISTS years_of_experience INTEGER DEFAULT 0;
ALTER TABLE tutor_subjects ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE tutor_subjects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Step 2: Add proficiency level constraint
ALTER TABLE tutor_subjects 
  DROP CONSTRAINT IF EXISTS check_proficiency_level;

ALTER TABLE tutor_subjects 
  ADD CONSTRAINT check_proficiency_level 
  CHECK (proficiency_level IN ('beginner', 'intermediate', 'expert') OR proficiency_level IS NULL);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_tutor_subjects_tutor ON tutor_subjects(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_subjects_subject ON tutor_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_tutor_subjects_active ON tutor_subjects(is_active);

COMMENT ON COLUMN tutor_subjects.proficiency_level IS 'Tutor proficiency: beginner, intermediate, expert';
COMMENT ON COLUMN tutor_subjects.is_active IS 'Whether tutor is currently offering this subject';
