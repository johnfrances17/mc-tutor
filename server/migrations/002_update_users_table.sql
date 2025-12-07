-- ===================================
-- Migration: Update Users Table Schema
-- Date: 2025-12-07
-- Description: Add course_id FK, change year_level to INTEGER, update constraints
-- ===================================

-- Step 1: Add course_id column (nullable first)
ALTER TABLE users ADD COLUMN IF NOT EXISTS course_id INTEGER;

-- Step 2: Migrate existing course VARCHAR data to course_id
UPDATE users SET course_id = (
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

-- Step 3: Add year_level_new as INTEGER column
ALTER TABLE users ADD COLUMN IF NOT EXISTS year_level_new INTEGER;

-- Step 4: Migrate year_level data (convert VARCHAR to INTEGER)
UPDATE users SET year_level_new = (
  CASE 
    WHEN year_level = '1' OR year_level = '1st Year' THEN 1
    WHEN year_level = '2' OR year_level = '2nd Year' THEN 2
    WHEN year_level = '3' OR year_level = '3rd Year' THEN 3
    WHEN year_level = '4' OR year_level = '4th Year' THEN 4
    ELSE NULL
  END
)
WHERE year_level IS NOT NULL;

-- Step 5: Drop old year_level column and rename new one
ALTER TABLE users DROP COLUMN IF EXISTS year_level;
ALTER TABLE users RENAME COLUMN year_level_new TO year_level;

-- Step 6: Add foreign key constraint for course_id
ALTER TABLE users 
  ADD CONSTRAINT fk_users_course 
  FOREIGN KEY (course_id) 
  REFERENCES courses(course_id);

-- Step 7: Add check constraints
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS check_year_level_range;
  
ALTER TABLE users 
  ADD CONSTRAINT check_year_level_range 
  CHECK (year_level BETWEEN 1 AND 4);

ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS check_role_values;
  
ALTER TABLE users 
  ADD CONSTRAINT check_role_values 
  CHECK (role IN ('admin', 'tutor', 'tutee'));

ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS check_status_values;
  
ALTER TABLE users 
  ADD CONSTRAINT check_status_values 
  CHECK (status IN ('active', 'inactive'));

-- Step 8: Add chat_pin column (rename from chat_pin_hash since we're not hashing yet)
ALTER TABLE users DROP COLUMN IF EXISTS chat_pin_hash;
ALTER TABLE users ADD COLUMN IF NOT EXISTS chat_pin VARCHAR(6);

-- Step 9: Add business logic constraints
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS check_tutor_has_academic_info;
  
ALTER TABLE users 
  ADD CONSTRAINT check_tutor_has_academic_info 
  CHECK (
    role != 'tutor' OR (course_id IS NOT NULL AND year_level IS NOT NULL)
  );

ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS check_tutee_has_academic_info;
  
ALTER TABLE users 
  ADD CONSTRAINT check_tutee_has_academic_info 
  CHECK (
    role != 'tutee' OR (course_id IS NOT NULL AND year_level IS NOT NULL)
  );

-- Step 10: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_course ON users(course_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_year_level ON users(year_level);

COMMENT ON COLUMN users.course_id IS 'Foreign key to courses table';
COMMENT ON COLUMN users.year_level IS 'Academic year level (1-4)';
COMMENT ON COLUMN users.chat_pin IS 'PIN for chat encryption (plain text for now)';
