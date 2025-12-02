-- =====================================================
-- MC TUTOR - SUPABASE MIGRATION SQL (SAFE VERSION)
-- PostgreSQL-compatible database schema
-- This version can be run multiple times safely
-- Generated: December 2, 2025
-- =====================================================

-- Enable UUID extension (optional, if you want to use UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- DROP EXISTING OBJECTS (Optional - uncomment if needed)
-- =====================================================

-- Uncomment these lines if you want to completely reset the database:
/*
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS study_materials CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS tutor_availability CASCADE;
DROP TABLE IF EXISTS tutor_subjects CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS session_type CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS proficiency_level CASCADE;
DROP TYPE IF EXISTS day_of_week CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_upcoming_sessions(INTEGER, user_role) CASCADE;
*/

-- =====================================================
-- CUSTOM ENUM TYPES (with safe creation)
-- =====================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'tutor', 'tutee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_type AS ENUM ('online', 'face-to-face');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('session_request', 'session_confirmed', 'session_cancelled', 'feedback', 'general');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE proficiency_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE day_of_week AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- TABLES
-- =====================================================

-- -----------------------------------------------------
-- Table: users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role user_role NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  year_level VARCHAR(20) DEFAULT NULL,
  course VARCHAR(100) DEFAULT NULL,
  profile_picture VARCHAR(500) DEFAULT NULL,
  chat_pin_hash VARCHAR(255) DEFAULT NULL,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status user_status DEFAULT 'active'
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);

-- -----------------------------------------------------
-- Table: subjects
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
  subject_id SERIAL PRIMARY KEY,
  subject_code VARCHAR(20) UNIQUE NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  course VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for subjects
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(subject_code);
CREATE INDEX IF NOT EXISTS idx_subjects_course ON subjects(course);

-- -----------------------------------------------------
-- Table: tutor_subjects
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS tutor_subjects (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
  proficiency_level proficiency_level DEFAULT 'intermediate',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tutor_id, subject_id)
);

-- Indexes for tutor_subjects
CREATE INDEX IF NOT EXISTS idx_tutor_subjects_tutor ON tutor_subjects(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_subjects_subject ON tutor_subjects(subject_id);

-- -----------------------------------------------------
-- Table: tutor_availability
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS tutor_availability (
  availability_id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for tutor_availability
CREATE INDEX IF NOT EXISTS idx_tutor_availability_tutor_day ON tutor_availability(tutor_id, day_of_week);

-- -----------------------------------------------------
-- Table: sessions
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  session_id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  tutee_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(255) DEFAULT NULL,
  session_type session_type DEFAULT 'face-to-face',
  status session_status DEFAULT 'pending',
  notes TEXT DEFAULT NULL,
  meeting_link VARCHAR(500) DEFAULT NULL,
  tutor_notes TEXT DEFAULT NULL,
  cancellation_reason TEXT DEFAULT NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_tutor ON sessions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tutee ON sessions(tutee_id);
CREATE INDEX IF NOT EXISTS idx_sessions_subject ON sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_upcoming ON sessions(status, session_date, start_time);

-- -----------------------------------------------------
-- Table: feedback
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
  feedback_id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  tutee_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  tutor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  rating INTEGER DEFAULT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for feedback
CREATE INDEX IF NOT EXISTS idx_feedback_session ON feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tutor ON feedback(tutor_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tutee ON feedback(tutee_id);

-- -----------------------------------------------------
-- Table: notifications
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type notification_type DEFAULT 'general',
  related_id INTEGER DEFAULT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);

-- -----------------------------------------------------
-- Table: study_materials
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS study_materials (
  material_id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) DEFAULT NULL,
  file_size INTEGER DEFAULT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for study_materials
CREATE INDEX IF NOT EXISTS idx_study_materials_tutor ON study_materials(tutor_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_subject ON study_materials(subject_id);

-- -----------------------------------------------------
-- Table: chat_messages (OPTIONAL)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
  chat_id SERIAL PRIMARY KEY,
  session_id INTEGER DEFAULT NULL REFERENCES sessions(session_id) ON DELETE SET NULL,
  sender_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver ON chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_unread ON chat_messages(session_id, is_read, sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;

-- Create triggers
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
BEFORE UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Public can view tutor profiles" ON users;

DROP POLICY IF EXISTS "Everyone can view subjects" ON subjects;
DROP POLICY IF EXISTS "Admins can insert subjects" ON subjects;
DROP POLICY IF EXISTS "Admins can update subjects" ON subjects;

DROP POLICY IF EXISTS "Everyone can view tutor subjects" ON tutor_subjects;
DROP POLICY IF EXISTS "Tutors can insert own subjects" ON tutor_subjects;
DROP POLICY IF EXISTS "Tutors can delete own subjects" ON tutor_subjects;

DROP POLICY IF EXISTS "Tutors can view their sessions" ON sessions;
DROP POLICY IF EXISTS "Students can view their sessions" ON sessions;
DROP POLICY IF EXISTS "Students can create sessions" ON sessions;
DROP POLICY IF EXISTS "Tutors can update their sessions" ON sessions;
DROP POLICY IF EXISTS "Students can update their sessions" ON sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON sessions;

DROP POLICY IF EXISTS "Tutors can view their feedback" ON feedback;
DROP POLICY IF EXISTS "Students can view their feedback" ON feedback;
DROP POLICY IF EXISTS "Students can submit feedback" ON feedback;
DROP POLICY IF EXISTS "Admins can view all feedback" ON feedback;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

DROP POLICY IF EXISTS "Everyone can view study materials" ON study_materials;
DROP POLICY IF EXISTS "Tutors can upload materials" ON study_materials;
DROP POLICY IF EXISTS "Tutors can delete materials" ON study_materials;
DROP POLICY IF EXISTS "Admins can manage materials" ON study_materials;

DROP POLICY IF EXISTS "Users can view their messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can mark received messages as read" ON chat_messages;

-- =====================================================
-- RLS POLICIES: USERS TABLE
-- =====================================================

CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE user_id::text = auth.uid()::text 
    AND role = 'admin'
  )
);

CREATE POLICY "Public can view tutor profiles"
ON users FOR SELECT
USING (role = 'tutor' AND status = 'active');

-- =====================================================
-- RLS POLICIES: SUBJECTS TABLE
-- =====================================================

CREATE POLICY "Everyone can view subjects"
ON subjects FOR SELECT
USING (true);

CREATE POLICY "Admins can insert subjects"
ON subjects FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE user_id::text = auth.uid()::text 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update subjects"
ON subjects FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE user_id::text = auth.uid()::text 
    AND role = 'admin'
  )
);

-- =====================================================
-- RLS POLICIES: TUTOR_SUBJECTS TABLE
-- =====================================================

CREATE POLICY "Everyone can view tutor subjects"
ON tutor_subjects FOR SELECT
USING (true);

CREATE POLICY "Tutors can insert own subjects"
ON tutor_subjects FOR INSERT
WITH CHECK (tutor_id::text = auth.uid()::text);

CREATE POLICY "Tutors can delete own subjects"
ON tutor_subjects FOR DELETE
USING (tutor_id::text = auth.uid()::text);

-- =====================================================
-- RLS POLICIES: SESSIONS TABLE
-- =====================================================

CREATE POLICY "Tutors can view their sessions"
ON sessions FOR SELECT
USING (tutor_id::text = auth.uid()::text);

CREATE POLICY "Students can view their sessions"
ON sessions FOR SELECT
USING (tutee_id::text = auth.uid()::text);

CREATE POLICY "Students can create sessions"
ON sessions FOR INSERT
WITH CHECK (tutee_id::text = auth.uid()::text);

CREATE POLICY "Tutors can update their sessions"
ON sessions FOR UPDATE
USING (tutor_id::text = auth.uid()::text);

CREATE POLICY "Students can update their sessions"
ON sessions FOR UPDATE
USING (tutee_id::text = auth.uid()::text);

CREATE POLICY "Admins can view all sessions"
ON sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE user_id::text = auth.uid()::text 
    AND role = 'admin'
  )
);

-- =====================================================
-- RLS POLICIES: FEEDBACK TABLE
-- =====================================================

CREATE POLICY "Tutors can view their feedback"
ON feedback FOR SELECT
USING (tutor_id::text = auth.uid()::text);

CREATE POLICY "Students can view their feedback"
ON feedback FOR SELECT
USING (tutee_id::text = auth.uid()::text);

CREATE POLICY "Students can submit feedback"
ON feedback FOR INSERT
WITH CHECK (tutee_id::text = auth.uid()::text);

CREATE POLICY "Admins can view all feedback"
ON feedback FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE user_id::text = auth.uid()::text 
    AND role = 'admin'
  )
);

-- =====================================================
-- RLS POLICIES: NOTIFICATIONS TABLE
-- =====================================================

CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
USING (user_id::text = auth.uid()::text);

CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- =====================================================
-- RLS POLICIES: STUDY_MATERIALS TABLE
-- =====================================================

CREATE POLICY "Everyone can view study materials"
ON study_materials FOR SELECT
USING (true);

CREATE POLICY "Tutors can upload materials"
ON study_materials FOR INSERT
WITH CHECK (tutor_id::text = auth.uid()::text);

CREATE POLICY "Tutors can delete materials"
ON study_materials FOR DELETE
USING (tutor_id::text = auth.uid()::text);

CREATE POLICY "Admins can manage materials"
ON study_materials FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE user_id::text = auth.uid()::text 
    AND role = 'admin'
  )
);

-- =====================================================
-- RLS POLICIES: CHAT_MESSAGES TABLE
-- =====================================================

CREATE POLICY "Users can view their messages"
ON chat_messages FOR SELECT
USING (
  sender_id::text = auth.uid()::text 
  OR receiver_id::text = auth.uid()::text
);

CREATE POLICY "Users can send messages"
ON chat_messages FOR INSERT
WITH CHECK (sender_id::text = auth.uid()::text);

CREATE POLICY "Users can mark received messages as read"
ON chat_messages FOR UPDATE
USING (receiver_id::text = auth.uid()::text);

-- =====================================================
-- SEED DATA: INSERT SUBJECTS (only if empty)
-- =====================================================

INSERT INTO subjects (subject_code, subject_name, description, course)
SELECT * FROM (VALUES
  -- BS in Accountancy
  ('ACCT101', 'Financial Accounting and Reporting', 'Fundamentals of financial accounting and reporting standards', 'BS in Accountancy (B.S.A.)'),
  ('ACCT102', 'Management Accounting', 'Cost accounting and managerial decision-making', 'BS in Accountancy (B.S.A.)'),
  ('ACCT103', 'Auditing Theory and Practice', 'Principles and procedures of auditing', 'BS in Accountancy (B.S.A.)'),
  ('ACCT104', 'Taxation', 'Income taxation and business tax compliance', 'BS in Accountancy (B.S.A.)'),
  ('ACCT105', 'Accounting Information Systems', 'Computerized accounting systems and controls', 'BS in Accountancy (B.S.A.)'),
  ('ACCT106', 'Advanced Financial Accounting', 'Complex accounting topics and consolidations', 'BS in Accountancy (B.S.A.)'),
  ('ACCT107', 'Government Accounting', 'Public sector and government accounting', 'BS in Accountancy (B.S.A.)'),
  
  -- BS in Criminology
  ('CRIM101', 'Introduction to Criminology', 'Foundations of crime, criminals, and criminal behavior', 'BS in Criminology (B.S. Crim.)'),
  ('CRIM102', 'Criminal Law', 'Principles of criminal law and jurisprudence', 'BS in Criminology (B.S. Crim.)'),
  ('CRIM103', 'Law Enforcement Administration', 'Organization and management of law enforcement agencies', 'BS in Criminology (B.S. Crim.)'),
  ('CRIM104', 'Criminal Investigation', 'Techniques and procedures in criminal investigation', 'BS in Criminology (B.S. Crim.)'),
  ('CRIM105', 'Forensic Science', 'Application of science in criminal investigation', 'BS in Criminology (B.S. Crim.)'),
  ('CRIM106', 'Criminalistics', 'Physical evidence collection and analysis', 'BS in Criminology (B.S. Crim.)'),
  ('CRIM107', 'Correctional Administration', 'Management of correctional institutions', 'BS in Criminology (B.S. Crim.)'),
  ('CRIM108', 'Criminal Jurisprudence', 'Legal principles in criminal justice system', 'BS in Criminology (B.S. Crim.)'),
  
  -- BS in Nursing
  ('NURS101', 'Fundamentals of Nursing', 'Basic nursing concepts and patient care', 'BS in Nursing (B.S.N.)'),
  ('NURS102', 'Anatomy and Physiology', 'Structure and function of human body systems', 'BS in Nursing (B.S.N.)'),
  ('NURS103', 'Medical-Surgical Nursing', 'Care of adult patients with medical-surgical conditions', 'BS in Nursing (B.S.N.)'),
  ('NURS104', 'Maternal and Child Health Nursing', 'Nursing care for mothers, infants, and children', 'BS in Nursing (B.S.N.)'),
  ('NURS105', 'Community Health Nursing', 'Public health and community-based care', 'BS in Nursing (B.S.N.)'),
  ('NURS106', 'Psychiatric Nursing', 'Mental health and psychiatric patient care', 'BS in Nursing (B.S.N.)'),
  ('NURS107', 'Pharmacology', 'Drug therapy and medication administration', 'BS in Nursing (B.S.N.)'),
  ('NURS108', 'Health Assessment', 'Physical examination and health assessment techniques', 'BS in Nursing (B.S.N.)'),
  
  -- Bachelor in Secondary Education
  ('EDUC101', 'Principles of Teaching', 'Foundations of teaching and learning theories', 'Bachelor in Secondary Education (B.S.Ed.)'),
  ('EDUC102', 'Educational Psychology', 'Psychological principles in education', 'Bachelor in Secondary Education (B.S.Ed.)'),
  ('EDUC103', 'Curriculum Development', 'Design and development of educational curriculum', 'Bachelor in Secondary Education (B.S.Ed.)'),
  ('EDUC104', 'Assessment of Learning', 'Educational assessment and evaluation methods', 'Bachelor in Secondary Education (B.S.Ed.)'),
  ('EDUC105', 'Classroom Management', 'Strategies for effective classroom management', 'Bachelor in Secondary Education (B.S.Ed.)'),
  ('EDUC106', 'Technology for Teaching and Learning', 'Educational technology integration', 'Bachelor in Secondary Education (B.S.Ed.)'),
  
  -- Major in English
  ('ENG101', 'English Grammar and Composition', 'Advanced grammar and writing skills', 'Bachelor in Secondary Education Major in English (B.S.Ed.)'),
  ('ENG102', 'Philippine Literature', 'Survey of Philippine literary works', 'Bachelor in Secondary Education Major in English (B.S.Ed.)'),
  ('ENG103', 'World Literature', 'Major works of world literature', 'Bachelor in Secondary Education Major in English (B.S.Ed.)'),
  ('ENG104', 'Language Teaching Methodology', 'Methods in teaching English language', 'Bachelor in Secondary Education Major in English (B.S.Ed.)'),
  
  -- Major in Mathematics
  ('MATH101', 'College Algebra', 'Advanced algebraic concepts and applications', 'Bachelor in Secondary Education Major in Mathematics (B.S.Ed.)'),
  ('MATH102', 'Trigonometry', 'Trigonometric functions and applications', 'Bachelor in Secondary Education Major in Mathematics (B.S.Ed.)'),
  ('MATH103', 'Calculus I', 'Differential and integral calculus', 'Bachelor in Secondary Education Major in Mathematics (B.S.Ed.)'),
  ('MATH104', 'Geometry', 'Euclidean and analytic geometry', 'Bachelor in Secondary Education Major in Mathematics (B.S.Ed.)'),
  ('MATH105', 'Statistics and Probability', 'Statistical methods and probability theory', 'Bachelor in Secondary Education Major in Mathematics (B.S.Ed.)'),
  
  -- Major in Filipino
  ('FIL101', 'Panitikan ng Pilipinas', 'Philippine literature in Filipino', 'Bachelor in Secondary Education Major in Filipino (B.S.Ed.)'),
  ('FIL102', 'Gramatika at Retorika', 'Filipino grammar and rhetoric', 'Bachelor in Secondary Education Major in Filipino (B.S.Ed.)'),
  ('FIL103', 'Pagtuturo ng Filipino', 'Methods in teaching Filipino language', 'Bachelor in Secondary Education Major in Filipino (B.S.Ed.)'),
  
  -- Major in MAPEH
  ('PE101', 'Physical Education and Sports', 'Physical fitness and sports activities', 'Bachelor in Secondary Education Major in MAPEH (B.S.Ed.)'),
  ('ART101', 'Art Education', 'Visual arts and creative expression', 'Bachelor in Secondary Education Major in MAPEH (B.S.Ed.)'),
  ('MUS101', 'Music Education', 'Music theory and performance', 'Bachelor in Secondary Education Major in MAPEH (B.S.Ed.)'),
  ('HEAL101', 'Health Education', 'Health and wellness promotion', 'Bachelor in Secondary Education Major in MAPEH (B.S.Ed.)'),
  
  -- Major in Social Studies
  ('SOSC101', 'Philippine History', 'History of the Philippines', 'Bachelor in Secondary Education Major in Social Studies (B.S.Ed.)'),
  ('SOSC102', 'World History', 'Major events in world history', 'Bachelor in Secondary Education Major in Social Studies (B.S.Ed.)'),
  ('SOSC103', 'Economics', 'Basic economic principles and systems', 'Bachelor in Secondary Education Major in Social Studies (B.S.Ed.)'),
  ('SOSC104', 'Political Science', 'Government and political systems', 'Bachelor in Secondary Education Major in Social Studies (B.S.Ed.)'),
  ('SOSC105', 'Sociology', 'Society and social behavior', 'Bachelor in Secondary Education Major in Social Studies (B.S.Ed.)'),
  
  -- BS in Computer Science
  ('CS101', 'Introduction to Computing', 'Fundamentals of computers and computing', 'BS in Computer Science (B.S.C.S.)'),
  ('CS102', 'Computer Programming I', 'Basic programming concepts using C/C++', 'BS in Computer Science (B.S.C.S.)'),
  ('CS103', 'Computer Programming II', 'Advanced programming and problem solving', 'BS in Computer Science (B.S.C.S.)'),
  ('CS104', 'Data Structures and Algorithms', 'Fundamental data structures and algorithm design', 'BS in Computer Science (B.S.C.S.)'),
  ('CS105', 'Object-Oriented Programming', 'OOP concepts using Java', 'BS in Computer Science (B.S.C.S.)'),
  ('CS106', 'Database Management Systems', 'Relational databases and SQL', 'BS in Computer Science (B.S.C.S.)'),
  ('CS107', 'Web Development', 'HTML, CSS, JavaScript, and PHP', 'BS in Computer Science (B.S.C.S.)'),
  ('CS108', 'Software Engineering', 'Software development methodologies', 'BS in Computer Science (B.S.C.S.)'),
  ('CS109', 'Computer Networks', 'Network architecture and protocols', 'BS in Computer Science (B.S.C.S.)'),
  ('CS110', 'Operating Systems', 'OS concepts and system programming', 'BS in Computer Science (B.S.C.S.)'),
  ('CS111', 'Information Security', 'Cybersecurity principles and practices', 'BS in Computer Science (B.S.C.S.)'),
  ('CS112', 'Mobile Application Development', 'Android and iOS app development', 'BS in Computer Science (B.S.C.S.)')
) AS v(subject_code, subject_name, description, course)
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE subjects.subject_code = v.subject_code);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get upcoming sessions
CREATE OR REPLACE FUNCTION get_upcoming_sessions(p_user_id INTEGER, p_role user_role)
RETURNS TABLE (
  session_id INTEGER,
  tutor_name VARCHAR,
  tutee_name VARCHAR,
  subject_name VARCHAR,
  session_date DATE,
  start_time TIME,
  end_time TIME,
  status session_status,
  session_type session_type
) AS $$
BEGIN
  IF p_role = 'tutee' THEN
    RETURN QUERY
    SELECT 
      s.session_id,
      u_tutor.full_name as tutor_name,
      u_tutee.full_name as tutee_name,
      subj.subject_name,
      s.session_date,
      s.start_time,
      s.end_time,
      s.status,
      s.session_type
    FROM sessions s
    JOIN users u_tutor ON s.tutor_id = u_tutor.user_id
    JOIN users u_tutee ON s.tutee_id = u_tutee.user_id
    JOIN subjects subj ON s.subject_id = subj.subject_id
    WHERE s.tutee_id = p_user_id
      AND s.status IN ('pending', 'confirmed')
      AND (s.session_date || ' ' || s.start_time)::TIMESTAMP > CURRENT_TIMESTAMP
    ORDER BY s.session_date, s.start_time;
  ELSIF p_role = 'tutor' THEN
    RETURN QUERY
    SELECT 
      s.session_id,
      u_tutor.full_name as tutor_name,
      u_tutee.full_name as tutee_name,
      subj.subject_name,
      s.session_date,
      s.start_time,
      s.end_time,
      s.status,
      s.session_type
    FROM sessions s
    JOIN users u_tutor ON s.tutor_id = u_tutor.user_id
    JOIN users u_tutee ON s.tutee_id = u_tutee.user_id
    JOIN subjects subj ON s.subject_id = subj.subject_id
    WHERE s.tutor_id = p_user_id
      AND s.status IN ('pending', 'confirmed')
      AND (s.session_date || ' ' || s.start_time)::TIMESTAMP > CURRENT_TIMESTAMP
    ORDER BY s.session_date, s.start_time;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '📊 Tables created: 9';
  RAISE NOTICE '🔒 RLS policies applied: 30+';
  RAISE NOTICE '📚 Subjects loaded: 62';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '1. Verify tables in Table Editor';
  RAISE NOTICE '2. Create Storage buckets (profile-pictures, study-materials)';
  RAISE NOTICE '3. Set up Supabase Auth users';
  RAISE NOTICE '4. Follow SUPABASE_SETUP_GUIDE.md for complete migration';
END $$;

-- =====================================================
-- END OF MIGRATION SQL
-- =====================================================
