-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 02, 2025 at 12:42 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mc_tutor_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `chat_id` int(11) NOT NULL,
  `session_id` int(11) DEFAULT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `feedback_id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `tutee_id` int(11) NOT NULL,
  `tutor_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`feedback_id`, `session_id`, `tutee_id`, `tutor_id`, `rating`, `comment`, `created_at`) VALUES
(1, 2, 3, 5, 4, 'lerned', '2025-11-17 02:38:30');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `type` enum('session_request','session_confirmed','session_cancelled','feedback','general') DEFAULT 'general',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `user_id`, `message`, `type`, `is_read`, `created_at`) VALUES
(1, 5, 'New session request from Kimel Jan S. Mojico', 'session_request', 0, '2025-11-17 01:44:05'),
(2, 3, 'Your tutoring session has been confirmed!', 'session_confirmed', 0, '2025-11-17 01:48:02'),
(3, 3, 'Your tutoring session has been cancelled by the tutor.', 'session_cancelled', 0, '2025-11-17 02:05:41'),
(4, 5, 'New session request from Kimel Jan S. Mojico', 'session_request', 0, '2025-11-17 02:32:32'),
(5, 3, 'Your tutoring session has been confirmed!', 'session_confirmed', 0, '2025-11-17 02:35:49'),
(6, 5, 'You received new feedback from Kimel Jan S. Mojico', 'feedback', 0, '2025-11-17 02:38:30'),
(7, 5, 'New session request from Kimel Jan S. Mojico', 'session_request', 0, '2025-11-23 15:32:15'),
(8, 5, 'New session request from Kimel Jan S. Mojico', 'session_request', 0, '2025-11-28 08:36:22'),
(9, 3, 'Your tutoring session has been confirmed!', 'session_confirmed', 0, '2025-11-28 08:36:39'),
(10, 5, 'New session request from Kimel Jan S. Mojico', 'session_request', 0, '2025-11-30 06:22:38'),
(11, 3, 'Your tutoring session has been confirmed!', 'session_confirmed', 0, '2025-11-30 06:22:57'),
(12, 3, 'Your tutoring session has been confirmed!', 'session_confirmed', 0, '2025-11-30 06:23:00'),
(13, 5, 'New session request from Kimel Jan S. Mojico', 'session_request', 0, '2025-11-30 07:33:53'),
(14, 3, 'Your tutoring session has been confirmed!', 'session_confirmed', 0, '2025-11-30 07:34:03'),
(15, 3, 'Your tutoring session has been confirmed!', 'session_confirmed', 0, '2025-11-30 07:34:09'),
(16, 5, 'New session request from Kimel Jan S. Mojico', 'session_request', 0, '2025-11-30 07:55:55'),
(17, 3, 'Your tutoring session has been confirmed!', 'session_confirmed', 0, '2025-11-30 07:56:38'),
(18, 5, 'New session request from Kimel Jan S. Mojico', 'session_request', 0, '2025-11-30 08:31:29'),
(19, 3, 'Your tutoring session has been confirmed!', 'session_confirmed', 0, '2025-11-30 08:31:51'),
(20, 3, 'Your tutoring session has been confirmed!', 'session_confirmed', 0, '2025-11-30 08:31:53');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` int(11) NOT NULL,
  `tutor_id` int(11) NOT NULL,
  `tutee_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `session_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `session_type` enum('online','face-to-face') DEFAULT 'face-to-face',
  `status` enum('pending','confirmed','completed','cancelled') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `tutor_id`, `tutee_id`, `subject_id`, `session_date`, `start_time`, `end_time`, `location`, `session_type`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(2, 5, 3, 71, '2025-11-17', '18:30:00', '20:00:00', 'http://placeholder.test', 'online', 'completed', '', '2025-11-17 02:32:32', '2025-11-17 02:37:48'),
(3, 5, 3, 73, '2025-11-23', '23:31:00', '12:35:00', '', 'face-to-face', 'cancelled', '', '2025-11-23 15:32:15', '2025-11-23 15:37:58'),
(4, 5, 3, 71, '2025-11-28', '17:40:00', '19:40:00', 'http://placeholder.test', 'online', 'completed', '', '2025-11-28 08:36:22', '2025-11-28 08:38:50'),
(5, 5, 3, 74, '2025-11-30', '14:22:00', '16:22:00', 'http://placeholder.test', 'online', 'completed', '', '2025-11-30 06:22:38', '2025-11-30 07:32:45'),
(6, 5, 3, 71, '2025-11-30', '16:33:00', '19:33:00', 'http://placeholder.test', 'online', 'cancelled', 'introduction', '2025-11-30 07:33:53', '2025-11-30 07:55:18'),
(7, 5, 3, 71, '2025-11-30', '15:55:00', '16:55:00', 'http://placeholder.test', 'online', 'confirmed', '', '2025-11-30 07:55:55', '2025-11-30 07:56:38'),
(8, 5, 3, 73, '2025-12-01', '17:31:00', '19:31:00', 'http://placeholder.test', 'online', 'confirmed', '', '2025-11-30 08:31:29', '2025-11-30 08:31:51');

-- --------------------------------------------------------

--
-- Table structure for table `study_materials`
--

CREATE TABLE `study_materials` (
  `material_id` int(11) NOT NULL,
  `tutor_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `study_materials`
--

INSERT INTO `study_materials` (`material_id`, `tutor_id`, `subject_id`, `title`, `description`, `file_name`, `file_path`, `file_type`, `file_size`, `uploaded_at`) VALUES
(3, 5, 71, 'act1', '', 'cs101 - act1.pptx', 'uploads/study_materials/1763346900_691a89d4a91df.pptx', 'application/vnd.openxmlformats-officedocument.pres', 32232, '2025-11-17 02:35:00'),
(4, 5, 74, 'ACT1', '', 'cs104 - act 1.pptx', 'uploads/study_materials/1763346915_691a89e3ac992.pptx', 'application/vnd.openxmlformats-officedocument.pres', 32232, '2025-11-17 02:35:15');

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `subject_id` int(11) NOT NULL,
  `subject_code` varchar(20) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `course` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`subject_id`, `subject_code`, `subject_name`, `description`, `course`, `created_at`) VALUES
(21, 'ACCT101', 'Financial Accounting and Reporting', 'Fundamentals of financial accounting and reporting standards', 'BS in Accountancy (B.S.A.)', '2025-11-17 02:19:53'),
(22, 'ACCT102', 'Management Accounting', 'Cost accounting and managerial decision-making', 'BS in Accountancy (B.S.A.)', '2025-11-17 02:19:53'),
(23, 'ACCT103', 'Auditing Theory and Practice', 'Principles and procedures of auditing', 'BS in Accountancy (B.S.A.)', '2025-11-17 02:19:53'),
(24, 'ACCT104', 'Taxation', 'Income taxation and business tax compliance', 'BS in Accountancy (B.S.A.)', '2025-11-17 02:19:53'),
(25, 'ACCT105', 'Accounting Information Systems', 'Computerized accounting systems and controls', 'BS in Accountancy (B.S.A.)', '2025-11-17 02:19:53'),
(26, 'ACCT106', 'Advanced Financial Accounting', 'Complex accounting topics and consolidations', 'BS in Accountancy (B.S.A.)', '2025-11-17 02:19:53'),
(27, 'ACCT107', 'Government Accounting', 'Public sector and government accounting', 'BS in Accountancy (B.S.A.)', '2025-11-17 02:19:53'),
(28, 'CRIM101', 'Introduction to Criminology', 'Foundations of crime, criminals, and criminal behavior', 'BS in Criminology (B.S. Crim.)', '2025-11-17 02:19:53'),
(29, 'CRIM102', 'Criminal Law', 'Principles of criminal law and jurisprudence', 'BS in Criminology (B.S. Crim.)', '2025-11-17 02:19:53'),
(30, 'CRIM103', 'Law Enforcement Administration', 'Organization and management of law enforcement agencies', 'BS in Criminology (B.S. Crim.)', '2025-11-17 02:19:53'),
(31, 'CRIM104', 'Criminal Investigation', 'Techniques and procedures in criminal investigation', 'BS in Criminology (B.S. Crim.)', '2025-11-17 02:19:53'),
(32, 'CRIM105', 'Forensic Science', 'Application of science in criminal investigation', 'BS in Criminology (B.S. Crim.)', '2025-11-17 02:19:53'),
(33, 'CRIM106', 'Criminalistics', 'Physical evidence collection and analysis', 'BS in Criminology (B.S. Crim.)', '2025-11-17 02:19:53'),
(34, 'CRIM107', 'Correctional Administration', 'Management of correctional institutions', 'BS in Criminology (B.S. Crim.)', '2025-11-17 02:19:53'),
(35, 'CRIM108', 'Criminal Jurisprudence', 'Legal principles in criminal justice system', 'BS in Criminology (B.S. Crim.)', '2025-11-17 02:19:53'),
(36, 'NURS101', 'Fundamentals of Nursing', 'Basic nursing concepts and patient care', 'BS in Nursing (B.S.N.)', '2025-11-17 02:19:53'),
(37, 'NURS102', 'Anatomy and Physiology', 'Structure and function of human body systems', 'BS in Nursing (B.S.N.)', '2025-11-17 02:19:53'),
(38, 'NURS103', 'Medical-Surgical Nursing', 'Care of adult patients with medical-surgical conditions', 'BS in Nursing (B.S.N.)', '2025-11-17 02:19:53'),
(39, 'NURS104', 'Maternal and Child Health Nursing', 'Nursing care for mothers, infants, and children', 'BS in Nursing (B.S.N.)', '2025-11-17 02:19:53'),
(40, 'NURS105', 'Community Health Nursing', 'Public health and community-based care', 'BS in Nursing (B.S.N.)', '2025-11-17 02:19:53'),
(41, 'NURS106', 'Psychiatric Nursing', 'Mental health and psychiatric patient care', 'BS in Nursing (B.S.N.)', '2025-11-17 02:19:53'),
(42, 'NURS107', 'Pharmacology', 'Drug therapy and medication administration', 'BS in Nursing (B.S.N.)', '2025-11-17 02:19:53'),
(43, 'NURS108', 'Health Assessment', 'Physical examination and health assessment techniques', 'BS in Nursing (B.S.N.)', '2025-11-17 02:19:53'),
(44, 'EDUC101', 'Principles of Teaching', 'Foundations of teaching and learning theories', 'Bachelor in Secondary Education (B.S.Ed.)', '2025-11-17 02:19:53'),
(45, 'EDUC102', 'Educational Psychology', 'Psychological principles in education', 'Bachelor in Secondary Education (B.S.Ed.)', '2025-11-17 02:19:53'),
(46, 'EDUC103', 'Curriculum Development', 'Design and development of educational curriculum', 'Bachelor in Secondary Education (B.S.Ed.)', '2025-11-17 02:19:53'),
(47, 'EDUC104', 'Assessment of Learning', 'Educational assessment and evaluation methods', 'Bachelor in Secondary Education (B.S.Ed.)', '2025-11-17 02:19:53'),
(48, 'EDUC105', 'Classroom Management', 'Strategies for effective classroom management', 'Bachelor in Secondary Education (B.S.Ed.)', '2025-11-17 02:19:53'),
(49, 'EDUC106', 'Technology for Teaching and Learning', 'Educational technology integration', 'Bachelor in Secondary Education (B.S.Ed.)', '2025-11-17 02:19:53'),
(50, 'ENG101', 'English Grammar and Composition', 'Advanced grammar and writing skills', 'Bachelor in Secondary Education Major in English (B.S.Ed.)', '2025-11-17 02:19:53'),
(51, 'ENG102', 'Philippine Literature', 'Survey of Philippine literary works', 'Bachelor in Secondary Education Major in English (B.S.Ed.)', '2025-11-17 02:19:53'),
(52, 'ENG103', 'World Literature', 'Major works of world literature', 'Bachelor in Secondary Education Major in English (B.S.Ed.)', '2025-11-17 02:19:53'),
(53, 'ENG104', 'Language Teaching Methodology', 'Methods in teaching English language', 'Bachelor in Secondary Education Major in English (B.S.Ed.)', '2025-11-17 02:19:53'),
(54, 'MATH101', 'College Algebra', 'Advanced algebraic concepts and applications', 'Bachelor in Secondary Education Major in Mathematics (B.S.Ed.)', '2025-11-17 02:19:53'),
(55, 'MATH102', 'Trigonometry', 'Trigonometric functions and applications', 'Bachelor in Secondary Education Major in Mathematics (B.S.Ed.)', '2025-11-17 02:19:53'),
(56, 'MATH103', 'Calculus I', 'Differential and integral calculus', 'Bachelor in Secondary Education Major in Mathematics (B.S.Ed.)', '2025-11-17 02:19:53'),
(57, 'MATH104', 'Geometry', 'Euclidean and analytic geometry', 'Bachelor in Secondary Education Major in Mathematics (B.S.Ed.)', '2025-11-17 02:19:53'),
(58, 'MATH105', 'Statistics and Probability', 'Statistical methods and probability theory', 'Bachelor in Secondary Education Major in Mathematics (B.S.Ed.)', '2025-11-17 02:19:53'),
(59, 'FIL101', 'Panitikan ng Pilipinas', 'Philippine literature in Filipino', 'Bachelor in Secondary Education Major in Filipino (B.S.Ed.)', '2025-11-17 02:19:53'),
(60, 'FIL102', 'Gramatika at Retorika', 'Filipino grammar and rhetoric', 'Bachelor in Secondary Education Major in Filipino (B.S.Ed.)', '2025-11-17 02:19:53'),
(61, 'FIL103', 'Pagtuturo ng Filipino', 'Methods in teaching Filipino language', 'Bachelor in Secondary Education Major in Filipino (B.S.Ed.)', '2025-11-17 02:19:53'),
(62, 'PE101', 'Physical Education and Sports', 'Physical fitness and sports activities', 'Bachelor in Secondary Education Major in MAPEH (B.S.Ed.)', '2025-11-17 02:19:53'),
(63, 'ART101', 'Art Education', 'Visual arts and creative expression', 'Bachelor in Secondary Education Major in MAPEH (B.S.Ed.)', '2025-11-17 02:19:53'),
(64, 'MUS101', 'Music Education', 'Music theory and performance', 'Bachelor in Secondary Education Major in MAPEH (B.S.Ed.)', '2025-11-17 02:19:53'),
(65, 'HEAL101', 'Health Education', 'Health and wellness promotion', 'Bachelor in Secondary Education Major in MAPEH (B.S.Ed.)', '2025-11-17 02:19:53'),
(66, 'SOSC101', 'Philippine History', 'History of the Philippines', 'Bachelor in Secondary Education Major in Social Studies (B.S.Ed.)', '2025-11-17 02:19:53'),
(67, 'SOSC102', 'World History', 'Major events in world history', 'Bachelor in Secondary Education Major in Social Studies (B.S.Ed.)', '2025-11-17 02:19:53'),
(68, 'SOSC103', 'Economics', 'Basic economic principles and systems', 'Bachelor in Secondary Education Major in Social Studies (B.S.Ed.)', '2025-11-17 02:19:53'),
(69, 'SOSC104', 'Political Science', 'Government and political systems', 'Bachelor in Secondary Education Major in Social Studies (B.S.Ed.)', '2025-11-17 02:19:53'),
(70, 'SOSC105', 'Sociology', 'Society and social behavior', 'Bachelor in Secondary Education Major in Social Studies (B.S.Ed.)', '2025-11-17 02:19:53'),
(71, 'CS101', 'Introduction to Computing', 'Fundamentals of computers and computing', 'BS in Computer Science (B.S.C.S.)', '2025-11-17 02:19:53'),
(72, 'CS102', 'Computer Programming I', 'Basic programming concepts using C/C++', 'BS in Computer Science (B.S.C.S.)', '2025-11-17 02:19:53'),
(73, 'CS103', 'Computer Programming II', 'Advanced programming and problem solving', 'BS in Computer Science (B.S.C.S.)', '2025-11-17 02:19:53'),
(74, 'CS104', 'Data Structures and Algorithms', 'Fundamental data structures and algorithm design', 'BS in Computer Science (B.S.C.S.)', '2025-11-17 02:19:53'),
(75, 'CS105', 'Object-Oriented Programming', 'OOP concepts using Java', 'BS in Computer Science (B.S.C.S.)', '2025-11-17 02:19:53'),
(76, 'CS106', 'Database Management Systems', 'Relational databases and SQL', 'BS in Computer Science (B.S.C.S.)', '2025-11-17 02:19:53'),
(77, 'CS107', 'Web Development', 'HTML, CSS, JavaScript, and PHP', 'BS in Computer Science (B.S.C.S.)', '2025-11-17 02:19:53'),
(78, 'CS108', 'Software Engineering', 'Software development methodologies', 'BS in Computer Science (B.S.C.S.)', '2025-11-17 02:19:53'),
(79, 'CS109', 'Computer Networks', 'Network architecture and protocols', 'BS in Computer Science (B.S.C.S.)', '2025-11-17 02:19:53'),
(80, 'CS110', 'Operating Systems', 'OS concepts and system programming', 'BS in Computer Science (B.S.C.S.)', '2025-11-17 02:19:53'),
(81, 'CS111', 'Information Security', 'Cybersecurity principles and practices', 'BS in Computer Science (B.S.C.S.)', '2025-11-17 02:19:53'),
(82, 'CS112', 'Mobile Application Development', 'Android and iOS app development', 'BS in Computer Science (B.S.C.S.)', '2025-11-17 02:19:53');

-- --------------------------------------------------------

--
-- Table structure for table `tutor_availability`
--

CREATE TABLE `tutor_availability` (
  `availability_id` int(11) NOT NULL,
  `tutor_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tutor_subjects`
--

CREATE TABLE `tutor_subjects` (
  `id` int(11) NOT NULL,
  `tutor_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `proficiency_level` enum('beginner','intermediate','advanced','expert') DEFAULT 'intermediate',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tutor_subjects`
--

INSERT INTO `tutor_subjects` (`id`, `tutor_id`, `subject_id`, `proficiency_level`, `created_at`) VALUES
(6, 5, 71, 'beginner', '2025-11-17 02:29:13'),
(8, 5, 74, 'beginner', '2025-11-17 02:31:02'),
(9, 5, 73, 'beginner', '2025-11-17 05:33:57');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('admin','tutor','tutee') NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `year_level` varchar(20) DEFAULT NULL,
  `course` varchar(100) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `chat_pin_hash` varchar(255) DEFAULT NULL,
  `last_active` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `student_id`, `email`, `password`, `full_name`, `role`, `phone`, `year_level`, `course`, `profile_picture`, `chat_pin_hash`, `last_active`, `created_at`, `updated_at`, `status`) VALUES
(1, '000000', 'admin@mabini.edu', '$2y$10$KIcpY/5Qm.SGHsb3QURVG.xIvlDoa8V7IwW7z5BmsTuMn9.HD.v3q', 'Admin', 'admin', NULL, 'N/A', 'Administration', NULL, NULL, '2025-11-30 06:19:29', '2025-11-16 12:36:04', '2025-11-17 00:26:33', 'active'),
(3, '230718', 'kimelmojico29@gmail.com', '$2y$10$RCh.B4tSPcOgE6HLtxrhPuyRKRcvGbiMZHOfs/mFU1OA6C.0W4dDO', 'Kimel Jan S. Mojico', 'tutee', '09128477126', '3rd Year', 'Bachelor of Science in Computer Science (BS. CS)', NULL, NULL, '2025-11-30 06:19:29', '2025-11-16 12:38:10', '2025-11-17 01:59:42', 'active'),
(5, '200458', 'jabbaradap23@gmail.com', '$2y$10$/2sH4z4zN/LYkBq3V/8uou5Hc2HTb.6/hv0hwO6/p6nJWKRCIbbJW', 'Al Jabbar M. Adap', 'tutor', '09481350090', '3rd Year', 'Bachelor of Science in Computer Science (BS. CS)', NULL, NULL, '2025-11-30 06:19:29', '2025-11-16 12:39:25', '2025-11-17 01:59:49', 'active'),
(6, '231173', 'kealiresoles27@gmail.com', '$2y$10$AzNWsgZ5F0UqLTMCp7KV9.V5viscmmbO93iyjGQtWXn4GGUFWMy7i', 'Kreiss Keali A. Resolos', 'tutor', '09943802655', '3rd Year', 'Bachelor of Science in Computer Science (BS. CS)', NULL, NULL, '2025-11-30 06:19:29', '2025-11-17 00:43:32', '2025-11-17 01:59:46', 'active');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`chat_id`),
  ADD KEY `idx_session` (`session_id`),
  ADD KEY `idx_sender` (`sender_id`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_session_unread` (`session_id`,`is_read`,`sender_id`),
  ADD KEY `idx_session_created` (`session_id`,`created_at`),
  ADD KEY `idx_conversation` (`sender_id`,`receiver_id`),
  ADD KEY `idx_receiver` (`receiver_id`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`feedback_id`),
  ADD KEY `tutee_id` (`tutee_id`),
  ADD KEY `idx_tutor` (`tutor_id`),
  ADD KEY `idx_session` (`session_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_read` (`is_read`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `idx_tutor` (`tutor_id`),
  ADD KEY `idx_tutee` (`tutee_id`),
  ADD KEY `idx_date` (`session_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `study_materials`
--
ALTER TABLE `study_materials`
  ADD PRIMARY KEY (`material_id`),
  ADD KEY `idx_subject` (`subject_id`),
  ADD KEY `idx_tutor` (`tutor_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`subject_id`),
  ADD UNIQUE KEY `subject_code` (`subject_code`),
  ADD KEY `idx_subject_code` (`subject_code`);

--
-- Indexes for table `tutor_availability`
--
ALTER TABLE `tutor_availability`
  ADD PRIMARY KEY (`availability_id`),
  ADD KEY `idx_tutor_day` (`tutor_id`,`day_of_week`);

--
-- Indexes for table `tutor_subjects`
--
ALTER TABLE `tutor_subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_tutor_subject` (`tutor_id`,`subject_id`),
  ADD KEY `idx_tutor` (`tutor_id`),
  ADD KEY `idx_subject` (`subject_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `student_id` (`student_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `chat_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `feedback_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `study_materials`
--
ALTER TABLE `study_materials`
  MODIFY `material_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `subject_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `tutor_availability`
--
ALTER TABLE `tutor_availability`
  MODIFY `availability_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tutor_subjects`
--
ALTER TABLE `tutor_subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_messages_receiver_fk` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_messages_sender_fk` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`session_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`tutee_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `feedback_ibfk_3` FOREIGN KEY (`tutor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`tutor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sessions_ibfk_2` FOREIGN KEY (`tutee_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sessions_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE CASCADE;

--
-- Constraints for table `study_materials`
--
ALTER TABLE `study_materials`
  ADD CONSTRAINT `study_materials_ibfk_1` FOREIGN KEY (`tutor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `study_materials_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE CASCADE;

--
-- Constraints for table `tutor_availability`
--
ALTER TABLE `tutor_availability`
  ADD CONSTRAINT `tutor_availability_ibfk_1` FOREIGN KEY (`tutor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tutor_subjects`
--
ALTER TABLE `tutor_subjects`
  ADD CONSTRAINT `tutor_subjects_ibfk_1` FOREIGN KEY (`tutor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tutor_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
