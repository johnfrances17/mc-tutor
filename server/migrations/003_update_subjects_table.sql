-- ===================================
-- Migration: Update Subjects Table Schema
-- Date: 2025-12-07
-- Description: Add course_id FK, add year_level, update constraints
-- ===================================

-- Step 1: Add course_id column (nullable first)
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS course_id INTEGER;

-- Step 2: Migrate existing course VARCHAR data to course_id
UPDATE subjects SET course_id = (
  CASE 
    WHEN course = 'BSA' THEN (SELECT course_id FROM courses WHERE course_code = 'BSA')
    WHEN course = 'BSBA' THEN (SELECT course_id FROM courses WHERE course_code = 'BSBA')
    WHEN course = 'BSED' THEN (SELECT course_id FROM courses WHERE course_code = 'BSED')
    WHEN course = 'BSN' THEN (SELECT course_id FROM courses WHERE course_code = 'BSN')
    WHEN course = 'BSCS' THEN (SELECT course_id FROM courses WHERE course_code = 'BSCS')
    WHEN course = 'BSCrim' THEN (SELECT course_id FROM courses WHERE course_code = 'BSCrim')
    ELSE NULL
  END
)
WHERE course IS NOT NULL;

-- Step 3: Add year_level column if it doesn't exist
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS year_level INTEGER;

-- Step 4: Add foreign key constraint
ALTER TABLE subjects 
  ADD CONSTRAINT fk_subjects_course 
  FOREIGN KEY (course_id) 
  REFERENCES courses(course_id);

-- Step 5: Add check constraint for year_level
ALTER TABLE subjects 
  DROP CONSTRAINT IF EXISTS check_subject_year_level;
  
ALTER TABLE subjects 
  ADD CONSTRAINT check_subject_year_level 
  CHECK (year_level BETWEEN 1 AND 4);

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_subjects_course ON subjects(course_id);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(subject_code);
CREATE INDEX IF NOT EXISTS idx_subjects_year_level ON subjects(year_level);

COMMENT ON COLUMN subjects.course_id IS 'Foreign key to courses table';
COMMENT ON COLUMN subjects.year_level IS 'Recommended year level for this subject (1-4)';
