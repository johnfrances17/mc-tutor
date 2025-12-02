-- ============================================
-- MC TUTOR DATABASE - SEED DATA (TEST/DEVELOPMENT)
-- ============================================
-- Sample data for testing and development
-- DO NOT run this on production servers!
-- Generated: November 30, 2025
-- ============================================

USE `mc_tutor_db`;

-- --------------------------------------------------------
-- SEED: USERS (Admin + Test Accounts)
-- --------------------------------------------------------

INSERT INTO `users` (`student_id`, `email`, `password`, `full_name`, `role`, `phone`, `year_level`, `course`, `status`) VALUES
('000000', 'admin@mabini.edu', '$2y$10$KIcpY/5Qm.SGHsb3QURVG.xIvlDoa8V7IwW7z5BmsTuMn9.HD.v3q', 'Admin', 'admin', NULL, 'N/A', 'Administration', 'active'),
('230718', 'kimelmojico29@gmail.com', '$2y$10$RCh.B4tSPcOgE6HLtxrhPuyRKRcvGbiMZHOfs/mFU1OA6C.0W4dDO', 'Kimel Jan S. Mojico', 'tutee', '09128477126', '3rd Year', 'Bachelor of Science in Computer Science (BS. CS)', 'active'),
('200458', 'jabbaradap23@gmail.com', '$2y$10$/2sH4z4zN/LYkBq3V/8uou5Hc2HTb.6/hv0hwO6/p6nJWKRCIbbJW', 'Al Jabbar M. Adap', 'tutor', '09481350090', '3rd Year', 'Bachelor of Science in Computer Science (BS. CS)', 'active'),
('231173', 'kealiresoles27@gmail.com', '$2y$10$AzNWsgZ5F0UqLTMCp7KV9.V5viscmmbO93iyjGQtWXn4GGUFWMy7i', 'Kreiss Keali A. Resolos', 'tutor', '09943802655', '3rd Year', 'Bachelor of Science in Computer Science (BS. CS)', 'active');

-- --------------------------------------------------------
-- SEED: SUBJECTS (All Courses)
-- --------------------------------------------------------

INSERT INTO `subjects` (`subject_code`, `subject_name`, `description`, `course`) VALUES
-- Accountancy
('ACCT101', 'Financial Accounting and Reporting', 'Fundamentals of financial accounting and reporting standards', 'BS in Accountancy (B.S.A.)'),
('ACCT102', 'Management Accounting', 'Cost accounting and managerial decision-making', 'BS in Accountancy (B.S.A.)'),
('ACCT103', 'Auditing Theory and Practice', 'Principles and procedures of auditing', 'BS in Accountancy (B.S.A.)'),
('ACCT104', 'Taxation', 'Income taxation and business tax compliance', 'BS in Accountancy (B.S.A.)'),
('ACCT105', 'Accounting Information Systems', 'Computerized accounting systems and controls', 'BS in Accountancy (B.S.A.)'),
('ACCT106', 'Advanced Financial Accounting', 'Complex accounting topics and consolidations', 'BS in Accountancy (B.S.A.)'),
('ACCT107', 'Government Accounting', 'Public sector and government accounting', 'BS in Accountancy (B.S.A.)'),

-- Criminology
('CRIM101', 'Introduction to Criminology', 'Foundations of crime, criminals, and criminal behavior', 'BS in Criminology (B.S. Crim.)'),
('CRIM102', 'Criminal Law', 'Principles of criminal law and jurisprudence', 'BS in Criminology (B.S. Crim.)'),
('CRIM103', 'Law Enforcement Administration', 'Organization and management of law enforcement agencies', 'BS in Criminology (B.S. Crim.)'),
('CRIM104', 'Criminal Investigation', 'Techniques and procedures in criminal investigation', 'BS in Criminology (B.S. Crim.)'),
('CRIM105', 'Forensic Science', 'Application of science in criminal investigation', 'BS in Criminology (B.S. Crim.)'),
('CRIM106', 'Criminalistics', 'Physical evidence collection and analysis', 'BS in Criminology (B.S. Crim.)'),
('CRIM107', 'Correctional Administration', 'Management of correctional institutions', 'BS in Criminology (B.S. Crim.)'),
('CRIM108', 'Criminal Jurisprudence', 'Legal principles in criminal justice system', 'BS in Criminology (B.S. Crim.)'),

-- Nursing
('NURS101', 'Fundamentals of Nursing', 'Basic nursing concepts and patient care', 'BS in Nursing (B.S.N.)'),
('NURS102', 'Anatomy and Physiology', 'Structure and function of human body systems', 'BS in Nursing (B.S.N.)'),
('NURS103', 'Medical-Surgical Nursing', 'Care of adult patients with medical-surgical conditions', 'BS in Nursing (B.S.N.)'),
('NURS104', 'Maternal and Child Health Nursing', 'Nursing care for mothers, infants, and children', 'BS in Nursing (B.S.N.)'),
('NURS105', 'Community Health Nursing', 'Public health and community-based care', 'BS in Nursing (B.S.N.)'),
('NURS106', 'Psychiatric Nursing', 'Mental health and psychiatric patient care', 'BS in Nursing (B.S.N.)'),
('NURS107', 'Pharmacology', 'Drug therapy and medication administration', 'BS in Nursing (B.S.N.)'),
('NURS108', 'Health Assessment', 'Physical examination and health assessment techniques', 'BS in Nursing (B.S.N.)'),

-- Education Core
('EDUC101', 'Principles of Teaching', 'Foundations of teaching and learning theories', 'Bachelor in Secondary Education (B.S.Ed.)'),
('EDUC102', 'Educational Psychology', 'Psychological principles in education', 'Bachelor in Secondary Education (B.S.Ed.)'),
('EDUC103', 'Curriculum Development', 'Design and development of educational curriculum', 'Bachelor in Secondary Education (B.S.Ed.)'),
('EDUC104', 'Assessment of Learning', 'Educational assessment and evaluation methods', 'Bachelor in Secondary Education (B.S.Ed.)'),
('EDUC105', 'Classroom Management', 'Strategies for effective classroom management', 'Bachelor in Secondary Education (B.S.Ed.)'),
('EDUC106', 'Technology for Teaching and Learning', 'Educational technology integration', 'Bachelor in Secondary Education (B.S.Ed.)'),

-- Education Major: English
('ENG101', 'English Grammar and Composition', 'Advanced grammar and writing skills', 'Bachelor in Secondary Education Major in English (B.S.Ed.)'),
('ENG102', 'Philippine Literature', 'Survey of Philippine literary works', 'Bachelor in Secondary Education Major in English (B.S.Ed.)'),
('ENG103', 'World Literature', 'Major works of world literature', 'Bachelor in Secondary Education Major in English (B.S.Ed.)'),
('ENG104', 'Language Teaching Methodology', 'Methods in teaching English language', 'Bachelor in Secondary Education Major in English (B.S.Ed.)'),

-- Education Major: Mathematics
('MATH101', 'College Algebra', 'Advanced algebraic concepts and applications', 'Bachelor in Secondary Education Major in Mathematics (B.S.Ed.)'),
('MATH102', 'Trigonometry', 'Trigonometric functions and applications', 'Bachelor in Secondary Education Major in Mathematics (B.S.Ed.)'),
('MATH103', 'Calculus I', 'Differential and integral calculus', 'Bachelor in Secondary Education Major in Mathematics (B.S.Ed.)'),
('MATH104', 'Geometry', 'Euclidean and analytic geometry', 'Bachelor in Secondary Education Major in Mathematics (B.S.Ed.)'),
('MATH105', 'Statistics and Probability', 'Statistical methods and probability theory', 'Bachelor in Secondary Education Major in Mathematics (B.S.Ed.)'),

-- Education Major: Filipino
('FIL101', 'Panitikan ng Pilipinas', 'Philippine literature in Filipino', 'Bachelor in Secondary Education Major in Filipino (B.S.Ed.)'),
('FIL102', 'Gramatika at Retorika', 'Filipino grammar and rhetoric', 'Bachelor in Secondary Education Major in Filipino (B.S.Ed.)'),
('FIL103', 'Pagtuturo ng Filipino', 'Methods in teaching Filipino language', 'Bachelor in Secondary Education Major in Filipino (B.S.Ed.)'),

-- Education Major: MAPEH
('PE101', 'Physical Education and Sports', 'Physical fitness and sports activities', 'Bachelor in Secondary Education Major in MAPEH (B.S.Ed.)'),
('ART101', 'Art Education', 'Visual arts and creative expression', 'Bachelor in Secondary Education Major in MAPEH (B.S.Ed.)'),
('MUS101', 'Music Education', 'Music theory and performance', 'Bachelor in Secondary Education Major in MAPEH (B.S.Ed.)'),
('HEAL101', 'Health Education', 'Health and wellness promotion', 'Bachelor in Secondary Education Major in MAPEH (B.S.Ed.)'),

-- Education Major: Social Studies
('SOSC101', 'Philippine History', 'History of the Philippines', 'Bachelor in Secondary Education Major in Social Studies (B.S.Ed.)'),
('SOSC102', 'World History', 'Major events in world history', 'Bachelor in Secondary Education Major in Social Studies (B.S.Ed.)'),
('SOSC103', 'Economics', 'Basic economic principles and systems', 'Bachelor in Secondary Education Major in Social Studies (B.S.Ed.)'),
('SOSC104', 'Political Science', 'Government and political systems', 'Bachelor in Secondary Education Major in Social Studies (B.S.Ed.)'),
('SOSC105', 'Sociology', 'Society and social behavior', 'Bachelor in Secondary Education Major in Social Studies (B.S.Ed.)'),

-- Computer Science
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

-- --------------------------------------------------------
-- SEED: TUTOR SUBJECTS (Test Tutor Expertise)
-- --------------------------------------------------------

INSERT INTO `tutor_subjects` (`tutor_id`, `subject_id`, `proficiency_level`) 
SELECT u.user_id, s.subject_id, 'intermediate'
FROM `users` u, `subjects` s
WHERE u.student_id = '200458' AND s.subject_code IN ('CS101', 'CS103', 'CS104');

-- --------------------------------------------------------
-- SEED: SESSIONS (Sample Test Sessions)
-- --------------------------------------------------------

INSERT INTO `sessions` (`tutor_id`, `tutee_id`, `subject_id`, `session_date`, `start_time`, `end_time`, `location`, `session_type`, `status`, `notes`, `meeting_link`, `confirmed_at`) 
SELECT 
    (SELECT user_id FROM users WHERE student_id = '200458') as tutor_id,
    (SELECT user_id FROM users WHERE student_id = '230718') as tutee_id,
    (SELECT subject_id FROM subjects WHERE subject_code = 'CS101') as subject_id,
    '2025-12-01' as session_date,
    '14:00:00' as start_time,
    '15:00:00' as end_time,
    NULL as location,
    'online' as session_type,
    'confirmed' as status,
    'Introduction to computing basics' as notes,
    'https://meet.google.com/abc-defg-hij' as meeting_link,
    NOW() as confirmed_at;

-- --------------------------------------------------------
-- NOTES
-- --------------------------------------------------------

-- This seed data is for DEVELOPMENT/TESTING ONLY
-- Default admin password: "admin123" (hashed)
-- Test users password: match their names (hashed)
-- Run schema.sql FIRST, then this file
-- For production: Create your own admin user manually
