-- ===================================
-- MC TUTOR - COMBINED MIGRATION FILE
-- Date: 2025-12-07
-- Execute this in Supabase SQL Editor
-- ===================================



-- ========== 001_create_courses_table.sql ==========
-- ===================================
-- Migration: Create Courses Table
-- Date: 2025-12-07
-- Description: Create courses reference table for standardized course codes
-- ===================================

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  course_id SERIAL PRIMARY KEY,
  course_code VARCHAR(10) UNIQUE NOT NULL,
  course_name VARCHAR(100) NOT NULL,
  department VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial course data
INSERT INTO courses (course_code, course_name, department, description) VALUES
  ('BSA', 'BS in Accountancy', 'Business', 'Bachelor of Science in Accountancy'),
  ('BSBA', 'BS in Business Administration', 'Business', 'Bachelor of Science in Business Administration'),
  ('BSED', 'Bachelor in Secondary Education', 'Education', 'Bachelor in Secondary Education'),
  ('BSN', 'BS in Nursing', 'Health Sciences', 'Bachelor of Science in Nursing'),
  ('BSCS', 'BS in Computer Science', 'Technology', 'Bachelor of Science in Computer Science'),
  ('BSCrim', 'BS in Criminology', 'Social Sciences', 'Bachelor of Science in Criminology')
ON CONFLICT (course_code) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(course_code);

COMMENT ON TABLE courses IS 'Reference table for academic courses offered at Mabini College';



-- ========== 002_update_users_table.sql ==========
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



-- ========== 003_update_subjects_table.sql ==========
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



-- ========== 004_create_tutor_availability.sql ==========
-- ===================================
-- Migration: Create Tutor Availability Table
-- Date: 2025-12-07
-- Description: Track tutor availability schedule
-- ===================================

CREATE TABLE IF NOT EXISTS tutor_availability (
  availability_id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_tutor_availability_user 
    FOREIGN KEY (tutor_id) 
    REFERENCES users(user_id) 
    ON DELETE CASCADE,
  
  CONSTRAINT check_valid_time_range 
    CHECK (end_time > start_time),
  
  CONSTRAINT unique_tutor_schedule 
    UNIQUE(tutor_id, day_of_week, start_time)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tutor_availability_tutor ON tutor_availability(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_availability_day ON tutor_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_tutor_availability_active ON tutor_availability(is_available);

COMMENT ON TABLE tutor_availability IS 'Weekly availability schedule for tutors';
COMMENT ON COLUMN tutor_availability.day_of_week IS '0=Sunday, 1=Monday, ..., 6=Saturday';



-- ========== 005_create_tutor_stats.sql ==========
-- ===================================
-- Migration: Create Tutor Stats Table
-- Date: 2025-12-07
-- Description: Aggregated statistics for tutor performance
-- ===================================

CREATE TABLE IF NOT EXISTS tutor_stats (
  tutor_id INTEGER PRIMARY KEY,
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  cancelled_sessions INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  subjects_taught INTEGER DEFAULT 0,
  last_session_date DATE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_tutor_stats_user 
    FOREIGN KEY (tutor_id) 
    REFERENCES users(user_id) 
    ON DELETE CASCADE,
  
  CONSTRAINT check_rating_range 
    CHECK (average_rating BETWEEN 0 AND 5)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_tutor_stats_rating ON tutor_stats(average_rating);

-- Initialize stats for existing tutors
INSERT INTO tutor_stats (tutor_id)
SELECT user_id 
FROM users 
WHERE role = 'tutor'
ON CONFLICT (tutor_id) DO NOTHING;

COMMENT ON TABLE tutor_stats IS 'Aggregated performance statistics for tutors';



-- ========== 006_update_sessions_table.sql ==========
-- ===================================
-- Migration: Update Sessions Table Schema
-- Date: 2025-12-07
-- Description: Improve session workflow with proper statuses and time types
-- ===================================

-- Step 1: Add new columns
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS meeting_link VARCHAR(255);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS tutee_notes TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS tutor_notes TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Step 2: Convert session_time from VARCHAR to TIME
-- First, add new column
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS session_time_new TIME;

-- Migrate data (handle common formats)
UPDATE sessions SET session_time_new = (
  CASE 
    WHEN session_time ~ '^[0-9]{1,2}:[0-9]{2}(:[0-9]{2})?$' THEN session_time::TIME
    WHEN session_time ~ '^[0-9]{1,2}:[0-9]{2} (AM|PM)$' THEN 
      TO_TIMESTAMP(session_time, 'HH12:MI AM')::TIME
    ELSE '00:00:00'::TIME
  END
)
WHERE session_time IS NOT NULL;

-- Drop old column and rename
ALTER TABLE sessions DROP COLUMN IF EXISTS session_time;
ALTER TABLE sessions RENAME COLUMN session_time_new TO session_time;

-- Step 3: Update status column with new workflow states
ALTER TABLE sessions 
  DROP CONSTRAINT IF EXISTS check_session_status;

ALTER TABLE sessions 
  ADD CONSTRAINT check_session_status 
  CHECK (status IN ('pending', 'approved', 'rejected', 'confirmed', 'completed', 'cancelled'));

-- Step 4: Update session_type constraint
ALTER TABLE sessions 
  DROP CONSTRAINT IF EXISTS check_session_type;

ALTER TABLE sessions 
  ADD CONSTRAINT check_session_type 
  CHECK (session_type IN ('online', 'face-to-face'));

-- Step 5: Add business logic constraints
ALTER TABLE sessions 
  DROP CONSTRAINT IF EXISTS check_different_users;

ALTER TABLE sessions 
  ADD CONSTRAINT check_different_users 
  CHECK (tutee_id != tutor_id);

-- Step 6: Rename 'notes' to maintain backward compatibility
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'notes') THEN
    ALTER TABLE sessions RENAME COLUMN notes TO tutee_notes;
  END IF;
END $$;

-- Step 7: Create indexes
CREATE INDEX IF NOT EXISTS idx_sessions_tutee ON sessions(tutee_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tutor ON sessions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_subject ON sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);

COMMENT ON COLUMN sessions.session_time IS 'Start time of the tutoring session';
COMMENT ON COLUMN sessions.duration_minutes IS 'Duration of session in minutes';
COMMENT ON COLUMN sessions.status IS 'Workflow: pendingâ†’approvedâ†’confirmedâ†’completed or cancelled/rejected';



-- ========== 007_update_materials_table.sql ==========
-- ===================================
-- Migration: Update Materials Table Schema
-- Date: 2025-12-07
-- Description: Add categorization and tracking for study materials
-- ===================================

-- Step 1: Add new columns for categorization
ALTER TABLE materials ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
ALTER TABLE materials ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE materials ADD COLUMN IF NOT EXISTS topic VARCHAR(100);
ALTER TABLE materials ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE materials ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- Step 2: Add category constraint
ALTER TABLE materials 
  DROP CONSTRAINT IF EXISTS check_material_category;

ALTER TABLE materials 
  ADD CONSTRAINT check_material_category 
  CHECK (category IN ('notes', 'handout', 'exercise', 'exam', 'other') OR category IS NULL);

-- Step 3: Migrate file_path to file_name if file_name is empty
UPDATE materials 
SET file_name = SUBSTRING(file_path FROM '[^/]+$')
WHERE file_name IS NULL AND file_path IS NOT NULL;

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_materials_uploader ON materials(uploader_id);
CREATE INDEX IF NOT EXISTS idx_materials_subject ON materials(subject_id);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_public ON materials(is_public);
CREATE INDEX IF NOT EXISTS idx_materials_tags ON materials USING GIN(tags);

COMMENT ON COLUMN materials.category IS 'Type: notes, handout, exercise, exam, other';
COMMENT ON COLUMN materials.tags IS 'Array of searchable tags';
COMMENT ON COLUMN materials.is_public IS 'Whether material is visible to all users';



-- ========== 008_update_feedback_table.sql ==========
-- ===================================
-- Migration: Update Feedback Table Schema
-- Date: 2025-12-07
-- Description: Add detailed ratings and constraints
-- ===================================

-- Step 1: Add detailed rating columns
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS knowledge_rating INTEGER;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS communication_rating INTEGER;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS punctuality_rating INTEGER;

-- Step 2: Add rating constraints
ALTER TABLE feedback 
  DROP CONSTRAINT IF EXISTS check_rating_range;

ALTER TABLE feedback 
  ADD CONSTRAINT check_rating_range 
  CHECK (rating BETWEEN 1 AND 5);

ALTER TABLE feedback 
  DROP CONSTRAINT IF EXISTS check_knowledge_rating;

ALTER TABLE feedback 
  ADD CONSTRAINT check_knowledge_rating 
  CHECK (knowledge_rating BETWEEN 1 AND 5 OR knowledge_rating IS NULL);

ALTER TABLE feedback 
  DROP CONSTRAINT IF EXISTS check_communication_rating;

ALTER TABLE feedback 
  ADD CONSTRAINT check_communication_rating 
  CHECK (communication_rating BETWEEN 1 AND 5 OR communication_rating IS NULL);

ALTER TABLE feedback 
  DROP CONSTRAINT IF EXISTS check_punctuality_rating;

ALTER TABLE feedback 
  ADD CONSTRAINT check_punctuality_rating 
  CHECK (punctuality_rating BETWEEN 1 AND 5 OR punctuality_rating IS NULL);

-- Step 3: Add unique constraint (one feedback per session)
ALTER TABLE feedback 
  DROP CONSTRAINT IF EXISTS unique_session_feedback;

ALTER TABLE feedback 
  ADD CONSTRAINT unique_session_feedback 
  UNIQUE(session_id);

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_feedback_session ON feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tutee ON feedback(tutee_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tutor ON feedback(tutor_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);

COMMENT ON COLUMN feedback.rating IS 'Overall rating (1-5 stars)';
COMMENT ON COLUMN feedback.knowledge_rating IS 'Subject knowledge rating (1-5)';
COMMENT ON COLUMN feedback.communication_rating IS 'Communication skills rating (1-5)';
COMMENT ON COLUMN feedback.punctuality_rating IS 'Punctuality rating (1-5)';



-- ========== 009_update_notifications_table.sql ==========
-- ===================================
-- Migration: Update Notifications Table Schema
-- Date: 2025-12-07
-- Description: Add type constraints and related entity tracking
-- ===================================

-- Step 1: Add new columns
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title VARCHAR(100);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_id INTEGER;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_type VARCHAR(20);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

-- Step 2: Update existing notifications with default title
UPDATE notifications 
SET title = 'Notification'
WHERE title IS NULL;

-- Step 3: Add type constraint
ALTER TABLE notifications 
  DROP CONSTRAINT IF EXISTS check_notification_type;

ALTER TABLE notifications 
  ADD CONSTRAINT check_notification_type 
  CHECK (type IN (
    'session_request', 'session_approved', 'session_rejected', 
    'session_reminder', 'session_completed', 'new_material',
    'new_feedback', 'system_announcement'
  ));

-- Step 4: Add related_type constraint
ALTER TABLE notifications 
  DROP CONSTRAINT IF EXISTS check_related_type;

ALTER TABLE notifications 
  ADD CONSTRAINT check_related_type 
  CHECK (related_type IN ('session', 'material', 'feedback', 'user') OR related_type IS NULL);

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

COMMENT ON COLUMN notifications.type IS 'Notification category/event type';
COMMENT ON COLUMN notifications.related_id IS 'ID of related entity (session_id, material_id, etc.)';
COMMENT ON COLUMN notifications.related_type IS 'Type of related entity';



-- ========== 010_update_chats_table.sql ==========
-- ===================================
-- Migration: Update Chats Table Schema
-- Date: 2025-12-07
-- Description: Add read tracking and constraint
-- ===================================

-- Step 1: Add read_at column
ALTER TABLE chats ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

-- Step 2: Add constraint to prevent self-messaging
ALTER TABLE chats 
  DROP CONSTRAINT IF EXISTS check_different_chat_users;

ALTER TABLE chats 
  ADD CONSTRAINT check_different_chat_users 
  CHECK (sender_id != receiver_id);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_chats_sender ON chats(sender_id);
CREATE INDEX IF NOT EXISTS idx_chats_receiver ON chats(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chats_created ON chats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_unread ON chats(receiver_id, is_read) WHERE is_read = FALSE;

-- Step 4: Create composite index for conversation retrieval
CREATE INDEX IF NOT EXISTS idx_chats_conversation ON chats(sender_id, receiver_id, created_at DESC);

COMMENT ON TABLE chats IS 'One-to-one chat messages between users';
COMMENT ON COLUMN chats.is_read IS 'Whether message has been read by receiver';
COMMENT ON COLUMN chats.read_at IS 'Timestamp when message was read';



-- ========== 011_update_tutor_subjects_table.sql ==========
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


