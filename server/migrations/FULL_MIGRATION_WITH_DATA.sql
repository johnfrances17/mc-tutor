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
    course_id INTEGER REFERENCES courses(course_id) ON DELETE SET NULL,
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
CREATE INDEX idx_users_course ON users(course_id);

-- Insert default admin user
INSERT INTO users (school_id, email, password, first_name, last_name, role, status) VALUES
('ADMIN-2025', 'admin@mabinicolleges.edu.ph', 'admin123', 'System', 'Administrator', 'admin', 'active');

-- ===================================
-- STEP 4: CREATE SUBJECTS TABLE
-- ===================================

CREATE TABLE subjects (
    subject_id SERIAL PRIMARY KEY,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    course_id INTEGER REFERENCES courses(course_id) ON DELETE CASCADE,
    year_level INTEGER CHECK (year_level BETWEEN 1 AND 4),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subjects_course ON subjects(course_id);
CREATE INDEX idx_subjects_year_level ON subjects(year_level);

-- ===================================
-- STEP 5: INSERT SUBJECTS FOR ALL COURSES
-- ===================================

-- BSA (Bachelor of Science in Accountancy) - Course ID: 1
INSERT INTO subjects (subject_code, subject_name, course_id, year_level, description) VALUES
-- 1st Year
('ACC101', 'Fundamentals of Accounting', 1, 1, 'Introduction to basic accounting principles and practices'),
('ACC102', 'Financial Accounting and Reporting 1', 1, 1, 'Basic financial accounting concepts and financial statements'),
('MATH101', 'Mathematics in the Modern World', 1, 1, 'Mathematical concepts applicable to business and accounting'),
('ECON101', 'Microeconomics', 1, 1, 'Individual economic behavior and market structures'),
('ENGL101', 'Purposive Communication', 1, 1, 'Development of communication skills'),
-- 2nd Year
('ACC201', 'Financial Accounting and Reporting 2', 1, 2, 'Intermediate accounting concepts and standards'),
('ACC202', 'Cost Accounting and Control', 1, 2, 'Cost analysis and management control systems'),
('TAX201', 'Income Taxation', 1, 2, 'Philippine taxation laws and principles'),
('ECON201', 'Macroeconomics', 1, 2, 'National economic systems and policies'),
('LAW201', 'Business Law and Obligations', 1, 2, 'Legal framework for business transactions'),
-- 3rd Year
('ACC301', 'Advanced Financial Accounting', 1, 3, 'Complex accounting transactions and consolidations'),
('AUDIT301', 'Auditing Theory', 1, 3, 'Auditing principles, standards, and procedures'),
('TAX301', 'Business Taxation', 1, 3, 'Corporate and business tax regulations'),
('ACC302', 'Management Advisory Services', 1, 3, 'Consulting and advisory techniques for management'),
('IT301', 'Accounting Information Systems', 1, 3, 'Technology in accounting processes'),
-- 4th Year
('ACC401', 'Financial Statement Analysis', 1, 4, 'Analysis and interpretation of financial data'),
('AUDIT401', 'Auditing Practice', 1, 4, 'Practical application of auditing standards'),
('GOV401', 'Government Accounting', 1, 4, 'Public sector accounting principles'),
('ETHIC401', 'Professional Ethics', 1, 4, 'Ethical standards for accountants'),
('PRACT401', 'Practicum in Accounting', 1, 4, 'On-the-job training and application'),

-- BSBA (Bachelor of Science in Business Administration) - Course ID: 2
-- 1st Year
('MGMT101', 'Introduction to Business Management', 2, 1, 'Overview of business management principles'),
('ACCT101', 'Basic Accounting', 2, 1, 'Fundamentals of accounting for business'),
('ECON101B', 'Principles of Economics', 2, 1, 'Basic economic concepts and applications'),
('MATH102', 'Business Mathematics', 2, 1, 'Mathematical applications in business'),
('COMM101', 'Business Communication', 2, 1, 'Effective communication in business settings'),
-- 2nd Year
('MKTG201', 'Principles of Marketing', 2, 2, 'Marketing concepts and strategies'),
('FINC201', 'Business Finance', 2, 2, 'Financial management and decision making'),
('HRMT201', 'Human Resource Management', 2, 2, 'Managing people in organizations'),
('OPMT201', 'Operations Management', 2, 2, 'Production and operations systems'),
('STAT201', 'Business Statistics', 2, 2, 'Statistical methods for business analysis'),
-- 3rd Year
('STRT301', 'Strategic Management', 2, 3, 'Corporate strategy and competitive advantage'),
('ENTR301', 'Entrepreneurship', 2, 3, 'Starting and managing new ventures'),
('MKTG301', 'Marketing Management', 2, 3, 'Advanced marketing strategies'),
('FINC301', 'Financial Management', 2, 3, 'Advanced financial decision making'),
('PROJ301', 'Project Management', 2, 3, 'Planning and executing business projects'),
-- 4th Year
('LEAD401', 'Leadership and Organizational Behavior', 2, 4, 'Leading teams and organizations'),
('IBUS401', 'International Business', 2, 4, 'Global business environment and strategies'),
('RSCH401', 'Business Research Methods', 2, 4, 'Research design and analysis for business'),
('CAPS401', 'Business Capstone Project', 2, 4, 'Integrative business project'),
('INTE401', 'Business Internship', 2, 4, 'Practical work experience in business'),

-- BSED (Bachelor of Secondary Education) - Course ID: 3
-- 1st Year
('EDUC101', 'The Teaching Profession', 3, 1, 'Introduction to the teaching profession'),
('CHLD101', 'Child and Adolescent Development', 3, 1, 'Understanding learner development'),
('PHIL101', 'Philosophy of Education', 3, 1, 'Educational philosophies and theories'),
('PSYC101', 'Educational Psychology', 3, 1, 'Psychology applied to education'),
('TECH101', 'Technology for Teaching and Learning', 3, 1, 'Educational technology tools'),
-- 2nd Year
('CURR201', 'Curriculum Development', 3, 2, 'Designing effective curricula'),
('ASSM201', 'Assessment in Learning', 3, 2, 'Educational assessment and evaluation'),
('CLAS201', 'Classroom Management', 3, 2, 'Managing the learning environment'),
('INCL201', 'Inclusive Education', 3, 2, 'Teaching diverse learners'),
('LANG201', 'Language and Literacy Development', 3, 2, 'Developing language skills'),
-- 3rd Year
('METH301', 'Teaching Methodologies', 3, 3, 'Various teaching approaches and strategies'),
('SPED301', 'Special Education', 3, 3, 'Teaching learners with special needs'),
('VALS301', 'Values Education', 3, 3, 'Character and values formation'),
('RSRCH301', 'Educational Research', 3, 3, 'Research in education'),
('FLDST301', 'Field Study 1', 3, 3, 'Observation and participation in schools'),
-- 4th Year
('PRAC401', 'Practice Teaching', 3, 4, 'Supervised teaching practice'),
('SEMT401', 'Teaching Seminar', 3, 4, 'Reflection on teaching experiences'),
('THES401', 'Thesis Writing', 3, 4, 'Educational research thesis'),
('FLDST401', 'Field Study 2', 3, 4, 'Advanced practicum'),
('DEMO401', 'Demonstration Teaching', 3, 4, 'Final teaching demonstration'),

-- BSN (Bachelor of Science in Nursing) - Course ID: 4
-- 1st Year
('NURS101', 'Fundamentals of Nursing', 4, 1, 'Basic nursing principles and skills'),
('ANAT101', 'Anatomy and Physiology 1', 4, 1, 'Structure and function of the human body'),
('CHEM101', 'Biochemistry', 4, 1, 'Chemistry in biological systems'),
('MICR101', 'Microbiology and Parasitology', 4, 1, 'Microorganisms and parasites'),
('NUTR101', 'Nutrition and Diet Therapy', 4, 1, 'Nutritional science for health'),
-- 2nd Year
('NURS201', 'Health Assessment', 4, 2, 'Systematic patient assessment'),
('PHARM201', 'Pharmacology', 4, 2, 'Drug therapy and medication management'),
('ANAT201', 'Anatomy and Physiology 2', 4, 2, 'Advanced body systems'),
('PATH201', 'Pathophysiology', 4, 2, 'Disease processes and mechanisms'),
('COMM201', 'Therapeutic Communication', 4, 2, 'Communication in healthcare'),
-- 3rd Year
('NURS301', 'Medical-Surgical Nursing', 4, 3, 'Nursing care for medical-surgical patients'),
('MATR301', 'Maternal and Child Nursing', 4, 3, 'Obstetric and pediatric nursing'),
('MENT301', 'Mental Health Nursing', 4, 3, 'Psychiatric nursing care'),
('COMM301', 'Community Health Nursing', 4, 3, 'Public health nursing practice'),
('RSRCH301N', 'Nursing Research', 4, 3, 'Research methods in nursing'),
-- 4th Year
('LEAD401N', 'Nursing Leadership and Management', 4, 4, 'Leading and managing in nursing'),
('CRIT401', 'Critical Care Nursing', 4, 4, 'Intensive care nursing'),
('EMER401', 'Emergency and Disaster Nursing', 4, 4, 'Emergency response nursing'),
('CLIN401', 'Clinical Practicum', 4, 4, 'Advanced clinical practice'),
('NCLEX401', 'NCLEX Review and Preparation', 4, 4, 'Board exam preparation'),

-- BSCS (Bachelor of Science in Computer Science) - Course ID: 5
-- 1st Year
('CS101', 'Introduction to Computing', 5, 1, 'Fundamentals of computer science'),
('PROG101', 'Computer Programming 1 (C++)', 5, 1, 'Introduction to programming using C++'),
('MATH103', 'Discrete Mathematics', 5, 1, 'Mathematical structures for CS'),
('PHYS101', 'Physics for Computing', 5, 1, 'Physical principles in computing'),
('ENGL102', 'Technical Writing', 5, 1, 'Writing for technical audiences'),
-- 2nd Year
('PROG201', 'Computer Programming 2 (Java)', 5, 2, 'Object-oriented programming'),
('DSTR201', 'Data Structures and Algorithms', 5, 2, 'Organizing and processing data'),
('DIGI201', 'Digital Logic Design', 5, 2, 'Digital circuits and systems'),
('DBMS201', 'Database Management Systems', 5, 2, 'Database design and SQL'),
('WEB201', 'Web Development', 5, 2, 'HTML, CSS, JavaScript fundamentals'),
-- 3rd Year
('SOFT301', 'Software Engineering', 5, 3, 'Software development lifecycle'),
('OPSYS301', 'Operating Systems', 5, 3, 'OS concepts and implementation'),
('NETWK301', 'Computer Networks', 5, 3, 'Network protocols and architecture'),
('AI301', 'Artificial Intelligence', 5, 3, 'AI concepts and applications'),
('MOBIL301', 'Mobile Application Development', 5, 3, 'Android/iOS development'),
-- 4th Year
('CYBER401', 'Cybersecurity', 5, 4, 'Security principles and practices'),
('CLOUD401', 'Cloud Computing', 5, 4, 'Cloud platforms and services'),
('CAPS401C', 'Capstone Project', 5, 4, 'Final year project'),
('PRACT401C', 'IT Practicum', 5, 4, 'Industry internship'),
('SEMR401', 'CS Seminar and Research', 5, 4, 'Research and presentation'),

-- BSCrim (Bachelor of Science in Criminology) - Course ID: 6
-- 1st Year
('CRIM101', 'Introduction to Criminology', 6, 1, 'Foundations of criminology'),
('LAW101', 'Criminal Law 1', 6, 1, 'Revised Penal Code'),
('SOCIO101', 'Sociology of Crime', 6, 1, 'Social aspects of crime'),
('PSYC102', 'Criminal Psychology', 6, 1, 'Psychological aspects of criminal behavior'),
('PHYS102', 'Physical Fitness and Self-Defense', 6, 1, 'Physical training for law enforcement'),
-- 2nd Year
('INVES201', 'Criminal Investigation 1', 6, 2, 'Investigation techniques and procedures'),
('LAW201C', 'Criminal Law 2', 6, 2, 'Special penal laws'),
('EVID201', 'Law on Evidence', 6, 2, 'Rules of evidence in criminal cases'),
('FRNS201', 'Forensic Science', 6, 2, 'Scientific investigation of crime'),
('TRAF201', 'Traffic Management', 6, 2, 'Traffic laws and enforcement'),
-- 3rd Year
('INVES301', 'Criminal Investigation 2', 6, 3, 'Advanced investigation methods'),
('CORR301', 'Correctional Administration', 6, 3, 'Jail and prison management'),
('DRUG301', 'Drug Education and Vice Control', 6, 3, 'Drug prevention and enforcement'),
('FIRE301', 'Fire Safety and Arson Investigation', 6, 3, 'Fire protection and investigation'),
('CRIM301', 'Criminalistics', 6, 3, 'Physical evidence examination'),
-- 4th Year
('LAWENF401', 'Law Enforcement Administration', 6, 4, 'Police organization and management'),
('JUST401', 'Criminal Justice System', 6, 4, 'Philippine justice system'),
('THES401C', 'Criminology Thesis', 6, 4, 'Research in criminology'),
('PRACT401CR', 'On-the-Job Training', 6, 4, 'Field experience in law enforcement'),
('BOARD401', 'Board Exam Review', 6, 4, 'Criminologist licensure exam preparation');

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
-- ✅ 120 Subjects (20 per course, distributed across 4 year levels)
-- ✅ 1 Admin User (admin@mabinicolleges.edu.ph / admin123)
-- ✅ All tables with proper indexes and foreign keys
-- ✅ All constraints and validations in place

-- Next Steps:
-- 1. Register tutors and tutees through the application
-- 2. Tutors can add their subjects from the 120 available subjects
-- 3. Tutors can set their availability schedule
-- 4. Students can search tutors by subject
-- 5. Book sessions and upload study materials
-- 6. Give feedback after sessions

-- NOTE: Passwords stored as plain text (implement bcrypt in future phase)
-- Login Credentials:
-- Admin: admin@mabinicolleges.edu.ph / admin123

SELECT 'Migration completed successfully!' AS status,
       (SELECT COUNT(*) FROM courses) AS total_courses,
       (SELECT COUNT(*) FROM subjects) AS total_subjects,
       (SELECT COUNT(*) FROM users) AS total_users;
