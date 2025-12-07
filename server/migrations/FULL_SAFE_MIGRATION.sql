-- ===================================
-- FULL SAFE MIGRATION - MC TUTOR DATABASE
-- Date: 2025-12-07
-- Description: Complete database rebuild with DROP and CREATE
-- WARNING: This will DELETE ALL existing data!
-- BACKUP YOUR DATABASE BEFORE RUNNING THIS!
-- ===================================

-- ===================================
-- STEP 1: DROP ALL EXISTING TABLES
-- ===================================

-- Drop tables in reverse dependency order to avoid FK constraint errors
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS tutor_availability CASCADE;
DROP TABLE IF EXISTS tutor_stats CASCADE;
DROP TABLE IF EXISTS tutor_subjects CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

-- Drop any existing types/enums
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;
DROP TYPE IF EXISTS session_type CASCADE;
DROP TYPE IF EXISTS material_category CASCADE;
DROP TYPE IF EXISTS proficiency_level CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;

-- ===================================
-- STEP 2: CREATE COURSES TABLE
-- ===================================

CREATE TABLE courses (
  course_id SERIAL PRIMARY KEY,
  course_code VARCHAR(10) UNIQUE NOT NULL,
  course_name VARCHAR(100) NOT NULL,
  department VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert course data
INSERT INTO courses (course_code, course_name, department, description) VALUES
  ('BSA', 'BS in Accountancy', 'Business', 'Bachelor of Science in Accountancy'),
  ('BSBA', 'BS in Business Administration', 'Business', 'Bachelor of Science in Business Administration'),
  ('BSED', 'Bachelor in Secondary Education', 'Education', 'Bachelor in Secondary Education'),
  ('BSN', 'BS in Nursing', 'Health Sciences', 'Bachelor of Science in Nursing'),
  ('BSCS', 'BS in Computer Science', 'Technology', 'Bachelor of Science in Computer Science'),
  ('BSCrim', 'BS in Criminology', 'Social Sciences', 'Bachelor of Science in Criminology');

-- Create index
CREATE INDEX idx_courses_code ON courses(course_code);

-- ===================================
-- STEP 3: CREATE USERS TABLE
-- ===================================

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  school_id VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  
  -- Personal Info
  first_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  profile_picture VARCHAR(255),
  bio TEXT,
  
  -- Academic Info
  role VARCHAR(10) CHECK (role IN ('admin', 'tutor', 'tutee')) NOT NULL,
  course_id INTEGER REFERENCES courses(course_id),
  year_level INTEGER CHECK (year_level BETWEEN 1 AND 4),
  
  -- Security
  chat_pin VARCHAR(6),
  status VARCHAR(10) CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  
  -- Activity Tracking
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_password_change TIMESTAMP,
  failed_login_attempts INTEGER DEFAULT 0,
  last_failed_login TIMESTAMP,
  account_locked_until TIMESTAMP,
  
  -- Constraints
  CONSTRAINT check_tutor_has_academic_info CHECK (
    role != 'tutor' OR (course_id IS NOT NULL AND year_level IS NOT NULL)
  ),
  CONSTRAINT check_tutee_has_academic_info CHECK (
    role != 'tutee' OR (course_id IS NOT NULL AND year_level IS NOT NULL)
  )
);

-- Create indexes
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_course ON users(course_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_year_level ON users(year_level);

-- ===================================
-- STEP 4: CREATE SUBJECTS TABLE
-- ===================================

CREATE TABLE subjects (
  subject_id SERIAL PRIMARY KEY,
  subject_code VARCHAR(20) UNIQUE NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  course_id INTEGER REFERENCES courses(course_id),
  year_level INTEGER CHECK (year_level BETWEEN 1 AND 4),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_subjects_code ON subjects(subject_code);
CREATE INDEX idx_subjects_course ON subjects(course_id);
CREATE INDEX idx_subjects_year_level ON subjects(year_level);

-- ===================================
-- STEP 5: CREATE TUTOR_SUBJECTS TABLE
-- ===================================

CREATE TABLE tutor_subjects (
  tutor_subject_id SERIAL PRIMARY KEY,
  tutor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(subject_id) ON DELETE CASCADE,
  proficiency_level VARCHAR(20) CHECK (proficiency_level IN ('beginner', 'intermediate', 'expert')),
  years_of_experience INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(tutor_id, subject_id)
);

-- Create indexes
CREATE INDEX idx_tutor_subjects_tutor ON tutor_subjects(tutor_id);
CREATE INDEX idx_tutor_subjects_subject ON tutor_subjects(subject_id);
CREATE INDEX idx_tutor_subjects_active ON tutor_subjects(is_active);

-- ===================================
-- STEP 6: CREATE TUTOR_AVAILABILITY TABLE
-- ===================================

CREATE TABLE tutor_availability (
  availability_id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_valid_time_range CHECK (end_time > start_time),
  CONSTRAINT unique_tutor_schedule UNIQUE(tutor_id, day_of_week, start_time)
);

-- Create indexes
CREATE INDEX idx_tutor_availability_tutor ON tutor_availability(tutor_id);
CREATE INDEX idx_tutor_availability_day ON tutor_availability(day_of_week);
CREATE INDEX idx_tutor_availability_active ON tutor_availability(is_available);

-- ===================================
-- STEP 7: CREATE TUTOR_STATS TABLE
-- ===================================

CREATE TABLE tutor_stats (
  tutor_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  cancelled_sessions INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  subjects_taught INTEGER DEFAULT 0,
  last_session_date DATE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_rating_range CHECK (average_rating BETWEEN 0 AND 5)
);

-- Create index
CREATE INDEX idx_tutor_stats_rating ON tutor_stats(average_rating);

-- ===================================
-- STEP 8: CREATE SESSIONS TABLE
-- ===================================

CREATE TABLE sessions (
  session_id SERIAL PRIMARY KEY,
  tutee_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  tutor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(subject_id),
  
  -- Session Details
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  session_type VARCHAR(20) CHECK (session_type IN ('online', 'face-to-face')) NOT NULL,
  location VARCHAR(100),
  meeting_link VARCHAR(255),
  
  -- Status Workflow
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  
  -- Notes
  tutee_notes TEXT,
  tutor_notes TEXT,
  cancellation_reason TEXT,
  
  -- Tracking
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT check_different_users CHECK (tutee_id != tutor_id)
);

-- Create indexes
CREATE INDEX idx_sessions_tutee ON sessions(tutee_id);
CREATE INDEX idx_sessions_tutor ON sessions(tutor_id);
CREATE INDEX idx_sessions_subject ON sessions(subject_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_date ON sessions(session_date);

-- ===================================
-- STEP 9: CREATE MATERIALS TABLE
-- ===================================

CREATE TABLE materials (
  material_id SERIAL PRIMARY KEY,
  uploader_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(subject_id),
  
  -- File Info
  title VARCHAR(200) NOT NULL,
  description TEXT,
  file_path VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  
  -- Categorization
  category VARCHAR(50) CHECK (category IN ('notes', 'handout', 'exercise', 'exam', 'other')),
  topic VARCHAR(100),
  tags TEXT[],
  
  -- Access Control
  is_public BOOLEAN DEFAULT TRUE,
  download_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_materials_uploader ON materials(uploader_id);
CREATE INDEX idx_materials_subject ON materials(subject_id);
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_public ON materials(is_public);
CREATE INDEX idx_materials_tags ON materials USING GIN(tags);

-- ===================================
-- STEP 10: CREATE FEEDBACK TABLE
-- ===================================

CREATE TABLE feedback (
  feedback_id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(session_id) ON DELETE CASCADE UNIQUE,
  tutee_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  tutor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Rating & Comments
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  
  -- Detailed Ratings
  knowledge_rating INTEGER CHECK (knowledge_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_feedback_session ON feedback(session_id);
CREATE INDEX idx_feedback_tutee ON feedback(tutee_id);
CREATE INDEX idx_feedback_tutor ON feedback(tutor_id);
CREATE INDEX idx_feedback_rating ON feedback(rating);

-- ===================================
-- STEP 11: CREATE NOTIFICATIONS TABLE
-- ===================================

CREATE TABLE notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Notification Details
  type VARCHAR(50) CHECK (type IN (
    'session_request', 'session_approved', 'session_rejected', 
    'session_reminder', 'session_completed', 'new_material',
    'new_feedback', 'system_announcement'
  )) NOT NULL,
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  
  -- Related Entity
  related_id INTEGER,
  related_type VARCHAR(20) CHECK (related_type IN ('session', 'material', 'feedback', 'user')),
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ===================================
-- STEP 12: CREATE CHATS TABLE
-- ===================================

CREATE TABLE chats (
  chat_id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  receiver_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_different_chat_users CHECK (sender_id != receiver_id)
);

-- Create indexes
CREATE INDEX idx_chats_sender ON chats(sender_id);
CREATE INDEX idx_chats_receiver ON chats(receiver_id);
CREATE INDEX idx_chats_created ON chats(created_at DESC);
CREATE INDEX idx_chats_unread ON chats(receiver_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_chats_conversation ON chats(sender_id, receiver_id, created_at DESC);

-- ===================================
-- STEP 13: INSERT SAMPLE ADMIN USER
-- ===================================

-- Insert default admin user
-- Password: admin123 (plain text - will be hashed in future)
INSERT INTO users (
  school_id, email, password, first_name, last_name, 
  role, status, created_at
) VALUES (
  'ADMIN001',
  'admin@mabini.edu.ph',
  'admin123',
  'System',
  'Administrator',
  'admin',
  'active',
  CURRENT_TIMESTAMP
);

-- ===================================
-- STEP 14: VERIFICATION QUERIES
-- ===================================

-- Check all tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check courses
SELECT * FROM courses ORDER BY course_code;

-- Check admin user
SELECT user_id, school_id, email, first_name, last_name, role, status 
FROM users 
WHERE role = 'admin';

-- ===================================
-- MIGRATION COMPLETE!
-- ===================================

-- Summary of tables created:
-- 1. courses (6 rows)
-- 2. users (1 admin user)
-- 3. subjects
-- 4. tutor_subjects
-- 5. tutor_availability
-- 6. tutor_stats
-- 7. sessions
-- 8. materials
-- 9. feedback
-- 10. notifications
-- 11. chats

-- Next Steps:
-- 1. Register tutors and tutees through the application
-- 2. Add subjects for each course
-- 3. Tutors can add their subjects and availability
-- 4. Students can book sessions
-- 5. Upload study materials
-- 6. Give feedback after sessions

-- NOTE: All passwords and PINs are stored as plain text
-- Implement bcrypt hashing in future phase
