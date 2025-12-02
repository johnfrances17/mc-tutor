-- =====================================================
-- MC TUTOR - SUPABASE MIGRATION SQL
-- PostgreSQL-compatible database schema
-- Generated: December 2, 2025
-- =====================================================

-- Enable UUID extension (optional, if you want to use UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CUSTOM ENUM TYPES
-- =====================================================

CREATE TYPE user_role AS ENUM ('admin', 'tutor', 'tutee');
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE session_type AS ENUM ('online', 'face-to-face');
CREATE TYPE session_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE notification_type AS ENUM ('session_request', 'session_confirmed', 'session_cancelled', 'feedback', 'general');
CREATE TYPE proficiency_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE day_of_week AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

-- =====================================================
-- TABLES
-- =====================================================

-- -----------------------------------------------------
-- Table: users
-- -----------------------------------------------------
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role user_role NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  year_level VARCHAR(20) DEFAULT NULL,
  course VARCHAR(100) DEFAULT NULL,
  profile_picture VARCHAR(500) DEFAULT NULL,  -- Supabase Storage URL
  chat_pin_hash VARCHAR(255) DEFAULT NULL,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status user_status DEFAULT 'active'
);

-- Indexes for users
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_student_id ON users(student_id);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------
-- Table: subjects
-- -----------------------------------------------------
CREATE TABLE subjects (
  subject_id SERIAL PRIMARY KEY,
  subject_code VARCHAR(20) UNIQUE NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  course VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for subjects
CREATE INDEX idx_subjects_code ON subjects(subject_code);
CREATE INDEX idx_subjects_course ON subjects(course);

-- -----------------------------------------------------
-- Table: tutor_subjects
-- -----------------------------------------------------
CREATE TABLE tutor_subjects (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
  proficiency_level proficiency_level DEFAULT 'intermediate',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tutor_id, subject_id)
);

-- Indexes for tutor_subjects
CREATE INDEX idx_tutor_subjects_tutor ON tutor_subjects(tutor_id);
CREATE INDEX idx_tutor_subjects_subject ON tutor_subjects(subject_id);

-- -----------------------------------------------------
-- Table: tutor_availability
-- -----------------------------------------------------
CREATE TABLE tutor_availability (
  availability_id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for tutor_availability
CREATE INDEX idx_tutor_availability_tutor_day ON tutor_availability(tutor_id, day_of_week);

-- -----------------------------------------------------
-- Table: sessions
-- -----------------------------------------------------
CREATE TABLE sessions (
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
CREATE INDEX idx_sessions_tutor ON sessions(tutor_id);
CREATE INDEX idx_sessions_tutee ON sessions(tutee_id);
CREATE INDEX idx_sessions_subject ON sessions(subject_id);
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_upcoming ON sessions(status, session_date, start_time);

-- Trigger for sessions updated_at
CREATE TRIGGER update_sessions_updated_at
BEFORE UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------
-- Table: feedback
-- -----------------------------------------------------
CREATE TABLE feedback (
  feedback_id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  tutee_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  tutor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  rating INTEGER DEFAULT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for feedback
CREATE INDEX idx_feedback_session ON feedback(session_id);
CREATE INDEX idx_feedback_tutor ON feedback(tutor_id);
CREATE INDEX idx_feedback_tutee ON feedback(tutee_id);

-- -----------------------------------------------------
-- Table: notifications (OPTIONAL - if migrating from file-based)
-- -----------------------------------------------------
CREATE TABLE notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type notification_type DEFAULT 'general',
  related_id INTEGER DEFAULT NULL,  -- session_id or other reference
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- -----------------------------------------------------
-- Table: study_materials
-- -----------------------------------------------------
CREATE TABLE study_materials (
  material_id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,  -- Supabase Storage URL
  file_type VARCHAR(50) DEFAULT NULL,
  file_size INTEGER DEFAULT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for study_materials
CREATE INDEX idx_study_materials_tutor ON study_materials(tutor_id);
CREATE INDEX idx_study_materials_subject ON study_materials(subject_id);

-- -----------------------------------------------------
-- Table: chat_messages (OPTIONAL - if migrating from file-based)
-- Keep this if you want to move away from file-based chat
-- Otherwise, delete this table and keep the file-based system
-- -----------------------------------------------------
CREATE TABLE chat_messages (
  chat_id SERIAL PRIMARY KEY,
  session_id INTEGER DEFAULT NULL REFERENCES sessions(session_id) ON DELETE SET NULL,
  sender_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for chat_messages
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_receiver ON chat_messages(receiver_id);
CREATE INDEX idx_chat_messages_conversation ON chat_messages(sender_id, receiver_id);
CREATE INDEX idx_chat_messages_session_unread ON chat_messages(session_id, is_read, sender_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);

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

-- =====================================================
-- RLS POLICIES: USERS TABLE
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid()::text = user_id::text);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid()::text = user_id::text);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE user_id::text = auth.uid()::text 
    AND role = 'admin'
  )
);

-- Public can view basic tutor info (for finding tutors)
CREATE POLICY "Public can view tutor profiles"
ON users FOR SELECT
USING (role = 'tutor' AND status = 'active');

-- =====================================================
-- RLS POLICIES: SUBJECTS TABLE
-- =====================================================

-- Everyone can view subjects (public catalog)
CREATE POLICY "Everyone can view subjects"
ON subjects FOR SELECT
USING (true);

-- Only admins can insert subjects
CREATE POLICY "Admins can insert subjects"
ON subjects FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE user_id::text = auth.uid()::text 
    AND role = 'admin'
  )
);

-- Only admins can update subjects
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

-- Everyone can view tutor subjects (for finding tutors)
CREATE POLICY "Everyone can view tutor subjects"
ON tutor_subjects FOR SELECT
USING (true);

-- Tutors can manage their own subjects
CREATE POLICY "Tutors can insert own subjects"
ON tutor_subjects FOR INSERT
WITH CHECK (tutor_id::text = auth.uid()::text);

CREATE POLICY "Tutors can delete own subjects"
ON tutor_subjects FOR DELETE
USING (tutor_id::text = auth.uid()::text);

-- =====================================================
-- RLS POLICIES: SESSIONS TABLE
-- =====================================================

-- Tutors can view their tutoring sessions
CREATE POLICY "Tutors can view their sessions"
ON sessions FOR SELECT
USING (tutor_id::text = auth.uid()::text);

-- Students can view their booked sessions
CREATE POLICY "Students can view their sessions"
ON sessions FOR SELECT
USING (tutee_id::text = auth.uid()::text);

-- Students can create sessions (book tutoring)
CREATE POLICY "Students can create sessions"
ON sessions FOR INSERT
WITH CHECK (tutee_id::text = auth.uid()::text);

-- Tutors can update their sessions (confirm, cancel, add notes)
CREATE POLICY "Tutors can update their sessions"
ON sessions FOR UPDATE
USING (tutor_id::text = auth.uid()::text);

-- Students can update their sessions (cancel, add notes)
CREATE POLICY "Students can update their sessions"
ON sessions FOR UPDATE
USING (tutee_id::text = auth.uid()::text);

-- Admins can view all sessions
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

-- Tutors can view feedback about them
CREATE POLICY "Tutors can view their feedback"
ON feedback FOR SELECT
USING (tutor_id::text = auth.uid()::text);

-- Students can view their submitted feedback
CREATE POLICY "Students can view their feedback"
ON feedback FOR SELECT
USING (tutee_id::text = auth.uid()::text);

-- Students can submit feedback for their sessions
CREATE POLICY "Students can submit feedback"
ON feedback FOR INSERT
WITH CHECK (tutee_id::text = auth.uid()::text);

-- Admins can view all feedback
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

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id::text = auth.uid()::text);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id::text = auth.uid()::text);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
USING (user_id::text = auth.uid()::text);

-- System can insert notifications (via service role)
CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- =====================================================
-- RLS POLICIES: STUDY_MATERIALS TABLE
-- =====================================================

-- Everyone can view study materials
CREATE POLICY "Everyone can view study materials"
ON study_materials FOR SELECT
USING (true);

-- Tutors can upload their own materials
CREATE POLICY "Tutors can upload materials"
ON study_materials FOR INSERT
WITH CHECK (tutor_id::text = auth.uid()::text);

-- Tutors can delete their own materials
CREATE POLICY "Tutors can delete materials"
ON study_materials FOR DELETE
USING (tutor_id::text = auth.uid()::text);

-- Admins can manage all materials
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

-- Users can view messages they sent or received
CREATE POLICY "Users can view their messages"
ON chat_messages FOR SELECT
USING (
  sender_id::text = auth.uid()::text 
  OR receiver_id::text = auth.uid()::text
);

-- Users can send messages
CREATE POLICY "Users can send messages"
ON chat_messages FOR INSERT
WITH CHECK (sender_id::text = auth.uid()::text);

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can mark received messages as read"
ON chat_messages FOR UPDATE
USING (receiver_id::text = auth.uid()::text);

-- =====================================================
-- SEED DATA: INSERT SUBJECTS
-- =====================================================

INSERT INTO subjects (subject_code, subject_name, description, course) VALUES
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
('CS112', 'Mobile Application Development', 'Android and iOS app development', 'BS in Computer Science (B.S.C.S.)');

-- =====================================================
-- SEED DATA: INSERT ADMIN USER (EXAMPLE)
-- Note: You'll need to create this user in Supabase Auth first
-- Then link by user_id. Password should be hashed via Supabase Auth.
-- =====================================================

-- INSERT INTO users (user_id, student_id, email, password, full_name, role, year_level, course, status) VALUES
-- (1, '000000', 'admin@mabini.edu', '$2y$10$KIcpY/5Qm.SGHsb3QURVG.xIvlDoa8V7IwW7z5BmsTuMn9.HD.v3q', 'Admin', 'admin', 'N/A', 'Administration', 'active');

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get upcoming sessions (example helper function)
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
-- MIGRATION NOTES
-- =====================================================

-- 1. This schema is PostgreSQL-compatible for Supabase
-- 2. ENUM types replace MySQL ENUM values
-- 3. SERIAL replaces AUTO_INCREMENT
-- 4. Triggers handle automatic timestamp updates
-- 5. Row Level Security (RLS) policies enforce access control
-- 6. Foreign key cascades are preserved
-- 7. All indexes are recreated for performance
-- 8. VARCHAR sizes increased for file_path (Supabase URLs)
-- 9. TIMESTAMP WITH TIME ZONE for proper timezone handling
-- 10. Helper functions for common queries (optional)

-- =====================================================
-- END OF MIGRATION SQL
-- =====================================================
