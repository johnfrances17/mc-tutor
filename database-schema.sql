-- ===================================
-- FULL SAFE MIGRATION WITH SAMPLE DATA
-- MC TUTOR DATABASE - Mabini College Inc.
-- Date: 2025-12-08
-- Description: Complete database rebuild with subjects and sample data
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
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS study_materials CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS upcoming_sessions CASCADE;
DROP TABLE IF EXISTS active_students CASCADE;
DROP TABLE IF EXISTS active_tutors CASCADE;
DROP TABLE IF EXISTS tutor_availability CASCADE;
DROP TABLE IF EXISTS tutor_stats CASCADE;
DROP TABLE IF EXISTS tutor_subjects CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Drop any views
DROP VIEW IF EXISTS active_students CASCADE;
DROP VIEW IF EXISTS active_tutors CASCADE;
DROP VIEW IF EXISTS upcoming_sessions CASCADE;

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
    course_name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Mabini College courses
INSERT INTO courses (course_code, course_name, description) VALUES
('BSA', 'Bachelor of Science in Accountancy', 'Prepares students for careers in accounting, auditing, and financial management'),
('BSBA', 'Bachelor of Science in Business Administration', 'Comprehensive business education covering management, marketing, and entrepreneurship'),
('BSED', 'Bachelor of Secondary Education', 'Teacher preparation program for secondary education'),
('BSN', 'Bachelor of Science in Nursing', 'Professional nursing program preparing competent healthcare providers'),
('BSCS', 'Bachelor of Science in Computer Science', 'Technology-focused program covering programming, systems, and software development'),
('BSCrim', 'Bachelor of Science in Criminology', 'Law enforcement and criminal justice education program');

-- ===================================
-- STEP 3: CREATE USERS TABLE
-- ===================================

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    school_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    pin VARCHAR(6),
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'tutor', 'tutee')),
    phone VARCHAR(20),
    year_level INTEGER CHECK (year_level BETWEEN 1 AND 4),
    course_code VARCHAR(10) CHECK (course_code IN ('BSA', 'BSBA', 'BSED', 'BSN', 'BSCS', 'BSCrim')),
    profile_picture TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_active TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_course_code ON users(course_code);

-- Insert default admin user
INSERT INTO users (school_id, email, password, first_name, last_name, role, status) VALUES
('000001', 'admin@mabinicolleges.edu.ph', 'admin123', 'System', 'Administrator', 'admin', 'active');

-- ===================================
-- STEP 4: CREATE SUBJECTS TABLE
-- ===================================

CREATE TABLE subjects (
    subject_id SERIAL PRIMARY KEY,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(10) NOT NULL CHECK (course_code IN ('BSA', 'BSBA', 'BSED', 'BSN', 'BSCS', 'BSCrim')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subjects_course_code ON subjects(course_code);

-- ===================================
-- STEP 5: INSERT SUBJECTS FOR ALL COURSES
-- ===================================

-- BSA (Bachelor of Science in Accountancy) - 20 subjects
INSERT INTO subjects (subject_code, subject_name, course_code, description) VALUES
('ACC001', 'Fundamentals of Accounting', 'BSA', 'Introduction to basic accounting principles and practices'),
('ACC002', 'Financial Accounting and Reporting 1', 'BSA', 'Basic financial accounting concepts and financial statements'),
('ACC003', 'Mathematics in the Modern World', 'BSA', 'Mathematical concepts applicable to business and accounting'),
('ACC004', 'Microeconomics', 'BSA', 'Individual economic behavior and market structures'),
('ACC005', 'Purposive Communication', 'BSA', 'Development of communication skills'),
('ACC006', 'Financial Accounting and Reporting 2', 'BSA', 'Intermediate accounting concepts and standards'),
('ACC007', 'Cost Accounting and Control', 'BSA', 'Cost analysis and management control systems'),
('ACC008', 'Income Taxation', 'BSA', 'Philippine taxation laws and principles'),
('ACC009', 'Macroeconomics', 'BSA', 'National economic systems and policies'),
('ACC010', 'Business Law and Obligations', 'BSA', 'Legal framework for business transactions'),
('ACC011', 'Advanced Financial Accounting', 'BSA', 'Complex accounting transactions and consolidations'),
('ACC012', 'Auditing Theory', 'BSA', 'Auditing principles, standards, and procedures'),
('ACC013', 'Business Taxation', 'BSA', 'Corporate and business tax regulations'),
('ACC014', 'Management Advisory Services', 'BSA', 'Consulting and advisory techniques for management'),
('ACC015', 'Accounting Information Systems', 'BSA', 'Technology in accounting processes'),
('ACC016', 'Financial Statement Analysis', 'BSA', 'Analysis and interpretation of financial data'),
('ACC017', 'Auditing Practice', 'BSA', 'Practical application of auditing standards'),
('ACC018', 'Government Accounting', 'BSA', 'Public sector accounting principles'),
('ACC019', 'Professional Ethics', 'BSA', 'Ethical standards for accountants'),
('ACC020', 'Practicum in Accounting', 'BSA', 'On-the-job training and application'),

-- BSBA (Bachelor of Science in Business Administration) - 20 subjects
('BAM001', 'Introduction to Business Management', 'BSBA', 'Overview of business management principles'),
('BAM002', 'Basic Accounting', 'BSBA', 'Fundamentals of accounting for business'),
('BAM003', 'Principles of Economics', 'BSBA', 'Basic economic concepts and applications'),
('BAM004', 'Business Mathematics', 'BSBA', 'Mathematical concepts applicable to business'),
('BAM005', 'Business Communication', 'BSBA', 'Effective communication in business settings'),
('BAM006', 'Principles of Marketing', 'BSBA', 'Marketing concepts and strategies'),
('BAM007', 'Business Finance', 'BSBA', 'Financial management and decision making'),
('BAM008', 'Human Resource Management', 'BSBA', 'Managing people in organizations'),
('BAM009', 'Operations Management', 'BSBA', 'Production and operations systems'),
('BAM010', 'Business Statistics', 'BSBA', 'Statistical methods for business analysis'),
('BAM011', 'Strategic Management', 'BSBA', 'Corporate strategy and competitive advantage'),
('BAM012', 'Entrepreneurship', 'BSBA', 'Starting and managing new ventures'),
('BAM013', 'Marketing Management', 'BSBA', 'Advanced marketing strategies'),
('BAM014', 'Financial Management', 'BSBA', 'Advanced financial decision making'),
('BAM015', 'Project Management', 'BSBA', 'Planning and executing business projects'),
('BAM016', 'Leadership and Organizational Behavior', 'BSBA', 'Leading teams and organizations'),
('BAM017', 'International Business', 'BSBA', 'Global business environment and strategies'),
('BAM018', 'Business Research Methods', 'BSBA', 'Research design and analysis for business'),
('BAM019', 'Business Capstone Project', 'BSBA', 'Integrative business project'),
('BAM020', 'Business Internship', 'BSBA', 'Practical work experience in business'),
-- BSED (Bachelor of Secondary Education) - 20 subjects
('ED001', 'The Teaching Profession', 'BSED', 'Introduction to the teaching profession'),
('ED002', 'Child and Adolescent Development', 'BSED', 'Understanding learner development'),
('ED003', 'Philosophy of Education', 'BSED', 'Educational philosophies and theories'),
('ED004', 'Educational Psychology', 'BSED', 'Psychology applied to education'),
('ED005', 'Technology for Teaching and Learning', 'BSED', 'Educational technology tools'),
('ED006', 'Curriculum Development', 'BSED', 'Designing effective curricula'),
('ED007', 'Assessment in Learning', 'BSED', 'Educational assessment and evaluation'),
('ED008', 'Classroom Management', 'BSED', 'Managing the learning environment'),
('ED009', 'Inclusive Education', 'BSED', 'Teaching diverse learners'),
('ED010', 'Language and Literacy Development', 'BSED', 'Developing language skills'),
('ED011', 'Teaching Methodologies', 'BSED', 'Various teaching approaches and strategies'),
('ED012', 'Special Education', 'BSED', 'Teaching learners with special needs'),
('ED013', 'Values Education', 'BSED', 'Character and values formation'),
('ED014', 'Educational Research', 'BSED', 'Research in education'),
('ED015', 'Field Study 1', 'BSED', 'Observation and participation in schools'),
('ED016', 'Practice Teaching', 'BSED', 'Supervised teaching practice'),
('ED017', 'Teaching Seminar', 'BSED', 'Reflection on teaching experiences'),
('ED018', 'Thesis Writing', 'BSED', 'Educational research thesis'),
('ED019', 'Field Study 2', 'BSED', 'Advanced practicum'),
('ED020', 'Demonstration Teaching', 'BSED', 'Final teaching demonstration'),

-- BSN (Bachelor of Science in Nursing) - 20 subjects
('NCM001', 'Fundamentals of Nursing', 'BSN', 'Basic nursing principles and skills'),
('NCM002', 'Anatomy and Physiology 1', 'BSN', 'Structure and function of the human body'),
('NCM003', 'Biochemistry', 'BSN', 'Chemistry in biological systems'),
('NCM004', 'Microbiology and Parasitology', 'BSN', 'Microorganisms and parasites'),
('NCM005', 'Nutrition and Diet Therapy', 'BSN', 'Nutritional science for health'),
('NCM006', 'Health Assessment', 'BSN', 'Systematic patient assessment'),
('NCM007', 'Pharmacology', 'BSN', 'Drug therapy and medication management'),
('NCM008', 'Anatomy and Physiology 2', 'BSN', 'Advanced body systems'),
('NCM009', 'Pathophysiology', 'BSN', 'Disease processes and mechanisms'),
('NCM010', 'Therapeutic Communication', 'BSN', 'Communication in healthcare'),
('NCM011', 'Medical-Surgical Nursing', 'BSN', 'Nursing care for medical-surgical patients'),
('NCM012', 'Maternal and Child Nursing', 'BSN', 'Obstetric and pediatric nursing'),
('NCM013', 'Mental Health Nursing', 'BSN', 'Psychiatric nursing care'),
('NCM014', 'Community Health Nursing', 'BSN', 'Public health nursing practice'),
('NCM015', 'Nursing Research', 'BSN', 'Research methods in nursing'),
('NCM016', 'Nursing Leadership and Management', 'BSN', 'Leading and managing in nursing'),
('NCM017', 'Critical Care Nursing', 'BSN', 'Intensive care nursing'),
('NCM018', 'Emergency and Disaster Nursing', 'BSN', 'Emergency response nursing'),
('NCM019', 'Clinical Practicum', 'BSN', 'Advanced clinical practice'),
('NCM020', 'NCLEX Review and Preparation', 'BSN', 'Board exam preparation'),

-- BSCS (Bachelor of Science in Computer Science) - 20 subjects
('CC001', 'Introduction to Computing', 'BSCS', 'Fundamentals of computer science'),
('CC002', 'Computer Programming 1 (C++)', 'BSCS', 'Introduction to programming using C++'),
('CC003', 'Discrete Mathematics', 'BSCS', 'Mathematical structures for CS'),
('CC004', 'Physics for Computing', 'BSCS', 'Physical principles in computing'),
('CC005', 'Technical Writing', 'BSCS', 'Writing for technical audiences'),
('CC006', 'Computer Programming 2 (Java)', 'BSCS', 'Object-oriented programming'),
('CC007', 'Data Structures and Algorithms', 'BSCS', 'Organizing and processing data'),
('CC008', 'Digital Logic Design', 'BSCS', 'Digital circuits and systems'),
('CC009', 'Database Management Systems', 'BSCS', 'Database design and SQL'),
('CC010', 'Web Development', 'BSCS', 'HTML, CSS, JavaScript fundamentals'),
('CC011', 'Software Engineering', 'BSCS', 'Software development lifecycle'),
('CC012', 'Operating Systems', 'BSCS', 'OS concepts and implementation'),
('CC013', 'Computer Networks', 'BSCS', 'Network protocols and architecture'),
('CC014', 'Artificial Intelligence', 'BSCS', 'AI concepts and applications'),
('CC015', 'Mobile Application Development', 'BSCS', 'Android/iOS development'),
('CC016', 'Cybersecurity', 'BSCS', 'Security principles and practices'),
('CC017', 'Cloud Computing', 'BSCS', 'Cloud platforms and services'),
('CC018', 'Capstone Project', 'BSCS', 'Final year project'),
('CC019', 'IT Practicum', 'BSCS', 'Industry internship'),
('CC020', 'CS Seminar and Research', 'BSCS', 'Research and presentation'),

-- BSCrim (Bachelor of Science in Criminology) - 20 subjects
('CRIM001', 'Introduction to Criminology', 'BSCrim', 'Foundations of criminology'),
('CRIM002', 'Criminal Law 1', 'BSCrim', 'Revised Penal Code'),
('CRIM003', 'Sociology of Crime', 'BSCrim', 'Social aspects of crime'),
('CRIM004', 'Criminal Psychology', 'BSCrim', 'Psychological aspects of criminal behavior'),
('CRIM005', 'Physical Fitness and Self-Defense', 'BSCrim', 'Physical training for law enforcement'),
('CRIM006', 'Criminal Investigation 1', 'BSCrim', 'Investigation techniques and procedures'),
('CRIM007', 'Criminal Law 2', 'BSCrim', 'Special penal laws'),
('CRIM008', 'Law on Evidence', 'BSCrim', 'Rules of evidence in criminal cases'),
('CRIM009', 'Forensic Science', 'BSCrim', 'Scientific investigation of crime'),
('CRIM010', 'Traffic Management', 'BSCrim', 'Traffic laws and enforcement'),
('CRIM011', 'Criminal Investigation 2', 'BSCrim', 'Advanced investigation methods'),
('CRIM012', 'Correctional Administration', 'BSCrim', 'Jail and prison management'),
('CRIM013', 'Drug Education and Vice Control', 'BSCrim', 'Drug prevention and enforcement'),
('CRIM014', 'Fire Safety and Arson Investigation', 'BSCrim', 'Fire protection and investigation'),
('CRIM015', 'Criminalistics', 'BSCrim', 'Physical evidence examination'),
('CRIM016', 'Law Enforcement Administration', 'BSCrim', 'Police organization and management'),
('CRIM017', 'Criminal Justice System', 'BSCrim', 'Philippine justice system'),
('CRIM018', 'Criminology Thesis', 'BSCrim', 'Research in criminology'),
('CRIM019', 'On-the-Job Training', 'BSCrim', 'Field experience in law enforcement'),
('CRIM020', 'Board Exam Review', 'BSCrim', 'Criminologist licensure exam preparation');
-- ===================================
-- STEP 6: CREATE TUTOR_SUBJECTS TABLE
-- ===================================

CREATE TABLE tutor_subjects (
    tutor_subject_id SERIAL PRIMARY KEY,
    tutor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(subject_id) ON DELETE CASCADE,
    proficiency_level VARCHAR(20) DEFAULT 'intermediate' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tutor_id, subject_id)
);

CREATE INDEX idx_tutor_subjects_tutor ON tutor_subjects(tutor_id);
CREATE INDEX idx_tutor_subjects_subject ON tutor_subjects(subject_id);

-- ===================================
-- STEP 7: CREATE TUTOR_AVAILABILITY TABLE
-- ===================================

CREATE TABLE tutor_availability (
    availability_id SERIAL PRIMARY KEY,
    tutor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tutor_availability_tutor ON tutor_availability(tutor_id);
CREATE INDEX idx_tutor_availability_day ON tutor_availability(day_of_week);

-- ===================================
-- STEP 8: CREATE TUTOR_STATS TABLE
-- ===================================

CREATE TABLE tutor_stats (
    stats_id SERIAL PRIMARY KEY,
    tutor_id INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    total_sessions INTEGER DEFAULT 0,
    completed_sessions INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_hours DECIMAL(10,2) DEFAULT 0.00,
    subjects_taught INTEGER DEFAULT 0,
    students_helped INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tutor_stats_rating ON tutor_stats(average_rating DESC);
CREATE INDEX idx_tutor_stats_sessions ON tutor_stats(total_sessions DESC);

-- ===================================
-- STEP 9: CREATE SESSIONS TABLE
-- ===================================

CREATE TABLE sessions (
    session_id SERIAL PRIMARY KEY,
    tutee_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    tutor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(subject_id) ON DELETE SET NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    session_type VARCHAR(20) DEFAULT 'online' CHECK (session_type IN ('online', 'physical')),
    location TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_tutee ON sessions(tutee_id);
CREATE INDEX idx_sessions_tutor ON sessions(tutor_id);
CREATE INDEX idx_sessions_subject ON sessions(subject_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_date ON sessions(session_date);

-- ===================================
-- STEP 10: CREATE MATERIALS TABLE
-- ===================================

CREATE TABLE materials (
    material_id SERIAL PRIMARY KEY,
    tutor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(subject_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    filename VARCHAR(255),
    file_size BIGINT,
    file_type VARCHAR(100),
    category VARCHAR(50) CHECK (category IN ('lecture', 'assignment', 'quiz', 'reference', 'other')),
    tags TEXT[],
    download_count INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_materials_tutor ON materials(tutor_id);
CREATE INDEX idx_materials_subject ON materials(subject_id);
CREATE INDEX idx_materials_category ON materials(category);

-- ===================================
-- STEP 11: CREATE FEEDBACK TABLE
-- ===================================

CREATE TABLE feedback (
    feedback_id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(session_id) ON DELETE CASCADE,
    tutee_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    tutor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    knowledge_rating INTEGER CHECK (knowledge_rating BETWEEN 1 AND 5),
    punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
    teaching_style_rating INTEGER CHECK (teaching_style_rating BETWEEN 1 AND 5),
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedback_session ON feedback(session_id);
CREATE INDEX idx_feedback_tutor ON feedback(tutor_id);
CREATE INDEX idx_feedback_tutee ON feedback(tutee_id);

-- ===================================
-- STEP 12: CREATE NOTIFICATIONS TABLE
-- ===================================

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('session', 'material', 'feedback', 'system', 'other')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id INTEGER,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ===================================
-- STEP 13: CREATE CHATS TABLE
-- ===================================

CREATE TABLE chats (
    chat_id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chats_sender ON chats(sender_id);
CREATE INDEX idx_chats_receiver ON chats(receiver_id);
CREATE INDEX idx_chats_created ON chats(created_at DESC);
CREATE INDEX idx_chats_read ON chats(is_read);

-- ===================================
-- MIGRATION COMPLETE!
-- ===================================

-- Summary of tables created:
-- 1. courses (6 courses for Mabini College)
-- 2. users (1 admin user)
-- 3. subjects (120 subjects across all courses - 20 per course)
-- 4. tutor_subjects
-- 5. tutor_availability
-- 6. tutor_stats
-- 7. sessions
-- 8. materials
-- 9. feedback
-- 10. notifications
-- 11. chats

-- Data Summary:
-- ✅ 6 Courses (BSA, BSBA, BSED, BSN, BSCS, BSCrim)
-- ✅ 120 Subjects (20 per course, BSA001-BSA020, BSBA001-BSBA020, etc.)
-- ✅ 1 Admin User (admin@mabinicolleges.edu.ph / admin123)
-- ✅ All tables with proper indexes and constraints
-- ✅ Denormalized design: course_code used directly (no course_id FK)
-- ✅ No year_level restriction on subjects (peer-to-peer tutoring)

-- Design Philosophy:
-- - school_id is permanent student ID (e.g., 2021-12345)
-- - course_code stored directly in users/subjects (BSA, BSBA, etc.)
-- - Subjects use sequential codes: BSA001-BSA020, BSBA001-BSBA020
-- - No prerequisites: 4th year can tutor 1st year subjects

-- Next Steps:
-- 1. Register tutors and tutees through the application
-- 2. Tutors can add their subjects from the 120 available subjects
-- 3. Tutors can set their availability schedule
-- 4. Students can search tutors by subject (any year level)
-- 5. Book sessions and upload study materials
-- 6. Give feedback after sessions

-- NOTE: Passwords stored as plain text (implement bcrypt in future phase)
-- Login Credentials:
-- Admin: admin@mabinicolleges.edu.ph / admin123

SELECT 'Migration completed successfully!' AS status,
       (SELECT COUNT(*) FROM courses) AS total_courses,
       (SELECT COUNT(*) FROM subjects) AS total_subjects,
       (SELECT COUNT(*) FROM users) AS total_users;
