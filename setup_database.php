<?php
// Database setup script - Run this once to create the database and tables

$host = 'localhost';
$user = 'root';
$pass = '';

// Create connection without database
$conn = new mysqli($host, $user, $pass);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database
$sql = "CREATE DATABASE IF NOT EXISTS mc_tutor_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
if ($conn->query($sql) === TRUE) {
    echo "Database created successfully<br>";
} else {
    echo "Error creating database: " . $conn->error . "<br>";
}

// Select database
$conn->select_db('mc_tutor_db');

// Create users table
$sql = "CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'tutor', 'tutee') NOT NULL,
    phone VARCHAR(20),
    year_level VARCHAR(20),
    course VARCHAR(100),
    profile_picture VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql) === TRUE) {
    echo "Table 'users' created successfully<br>";
} else {
    echo "Error creating users table: " . $conn->error . "<br>";
}

// Create subjects table
$sql = "CREATE TABLE IF NOT EXISTS subjects (
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql) === TRUE) {
    echo "Table 'subjects' created successfully<br>";
} else {
    echo "Error creating subjects table: " . $conn->error . "<br>";
}

// Create tutor_subjects table (many-to-many relationship)
$sql = "CREATE TABLE IF NOT EXISTS tutor_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT NOT NULL,
    subject_id INT NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    UNIQUE KEY unique_tutor_subject (tutor_id, subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql) === TRUE) {
    echo "Table 'tutor_subjects' created successfully<br>";
} else {
    echo "Error creating tutor_subjects table: " . $conn->error . "<br>";
}

// Create tutor_availability table
$sql = "CREATE TABLE IF NOT EXISTS tutor_availability (
    availability_id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql) === TRUE) {
    echo "Table 'tutor_availability' created successfully<br>";
} else {
    echo "Error creating tutor_availability table: " . $conn->error . "<br>";
}

// Create sessions table
$sql = "CREATE TABLE IF NOT EXISTS sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT NOT NULL,
    tutee_id INT NOT NULL,
    subject_id INT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255),
    session_type ENUM('online', 'face-to-face') DEFAULT 'face-to-face',
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tutee_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql) === TRUE) {
    echo "Table 'sessions' created successfully<br>";
} else {
    echo "Error creating sessions table: " . $conn->error . "<br>";
}

// Create study_materials table
$sql = "CREATE TABLE IF NOT EXISTS study_materials (
    material_id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT NOT NULL,
    subject_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql) === TRUE) {
    echo "Table 'study_materials' created successfully<br>";
} else {
    echo "Error creating study_materials table: " . $conn->error . "<br>";
}

// Create feedback table
$sql = "CREATE TABLE IF NOT EXISTS feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    tutee_id INT NOT NULL,
    tutor_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (tutee_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql) === TRUE) {
    echo "Table 'feedback' created successfully<br>";
} else {
    echo "Error creating feedback table: " . $conn->error . "<br>";
}

// Create notifications table
$sql = "CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    type ENUM('session_request', 'session_confirmed', 'session_cancelled', 'feedback', 'general') DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql) === TRUE) {
    echo "Table 'notifications' created successfully<br>";
} else {
    echo "Error creating notifications table: " . $conn->error . "<br>";
}

// Insert default admin user
$admin_password = password_hash('admin123', PASSWORD_DEFAULT);
$sql = "INSERT INTO users (student_id, email, password, full_name, role, year_level, course) 
        VALUES ('ADMIN001', 'admin@mabini.edu', '$admin_password', 'System Administrator', 'admin', 'N/A', 'Administration')
        ON DUPLICATE KEY UPDATE password = '$admin_password'";

if ($conn->query($sql) === TRUE) {
    echo "Default admin user created successfully<br>";
    echo "<strong>Admin Login:</strong> Email: admin@mabini.edu | Password: admin123<br>";
} else {
    echo "Error creating admin user: " . $conn->error . "<br>";
}

// Insert major subjects by course program
$subjects = [
    // BS in Accountancy (B.S.A.)
    ['ACCT101', 'Financial Accounting and Reporting', 'Fundamentals of financial accounting and reporting standards'],
    ['ACCT102', 'Management Accounting', 'Cost accounting and managerial decision-making'],
    ['ACCT103', 'Auditing Theory and Practice', 'Principles and procedures of auditing'],
    ['ACCT104', 'Taxation', 'Income taxation and business tax compliance'],
    ['ACCT105', 'Accounting Information Systems', 'Computerized accounting systems and controls'],
    ['ACCT106', 'Advanced Financial Accounting', 'Complex accounting topics and consolidations'],
    ['ACCT107', 'Government Accounting', 'Public sector and government accounting'],
    
    // BS in Criminology (B.S. Crim.)
    ['CRIM101', 'Introduction to Criminology', 'Foundations of crime, criminals, and criminal behavior'],
    ['CRIM102', 'Criminal Law', 'Principles of criminal law and jurisprudence'],
    ['CRIM103', 'Law Enforcement Administration', 'Organization and management of law enforcement agencies'],
    ['CRIM104', 'Criminal Investigation', 'Techniques and procedures in criminal investigation'],
    ['CRIM105', 'Forensic Science', 'Application of science in criminal investigation'],
    ['CRIM106', 'Criminalistics', 'Physical evidence collection and analysis'],
    ['CRIM107', 'Correctional Administration', 'Management of correctional institutions'],
    ['CRIM108', 'Criminal Jurisprudence', 'Legal principles in criminal justice system'],
    
    // BS in Nursing (B.S.N.)
    ['NURS101', 'Fundamentals of Nursing', 'Basic nursing concepts and patient care'],
    ['NURS102', 'Anatomy and Physiology', 'Structure and function of human body systems'],
    ['NURS103', 'Medical-Surgical Nursing', 'Care of adult patients with medical-surgical conditions'],
    ['NURS104', 'Maternal and Child Health Nursing', 'Nursing care for mothers, infants, and children'],
    ['NURS105', 'Community Health Nursing', 'Public health and community-based care'],
    ['NURS106', 'Psychiatric Nursing', 'Mental health and psychiatric patient care'],
    ['NURS107', 'Pharmacology', 'Drug therapy and medication administration'],
    ['NURS108', 'Health Assessment', 'Physical examination and health assessment techniques'],
    
    // Bachelor in Secondary Education (B.S.Ed.) - Core
    ['EDUC101', 'Principles of Teaching', 'Foundations of teaching and learning theories'],
    ['EDUC102', 'Educational Psychology', 'Psychological principles in education'],
    ['EDUC103', 'Curriculum Development', 'Design and development of educational curriculum'],
    ['EDUC104', 'Assessment of Learning', 'Educational assessment and evaluation methods'],
    ['EDUC105', 'Classroom Management', 'Strategies for effective classroom management'],
    ['EDUC106', 'Technology for Teaching and Learning', 'Educational technology integration'],
    
    // Secondary Education - English Major
    ['ENG101', 'English Grammar and Composition', 'Advanced grammar and writing skills'],
    ['ENG102', 'Philippine Literature', 'Survey of Philippine literary works'],
    ['ENG103', 'World Literature', 'Major works of world literature'],
    ['ENG104', 'Language Teaching Methodology', 'Methods in teaching English language'],
    
    // Secondary Education - Mathematics Major
    ['MATH101', 'College Algebra', 'Advanced algebraic concepts and applications'],
    ['MATH102', 'Trigonometry', 'Trigonometric functions and applications'],
    ['MATH103', 'Calculus I', 'Differential and integral calculus'],
    ['MATH104', 'Geometry', 'Euclidean and analytic geometry'],
    ['MATH105', 'Statistics and Probability', 'Statistical methods and probability theory'],
    
    // Secondary Education - Filipino Major
    ['FIL101', 'Panitikan ng Pilipinas', 'Philippine literature in Filipino'],
    ['FIL102', 'Gramatika at Retorika', 'Filipino grammar and rhetoric'],
    ['FIL103', 'Pagtuturo ng Filipino', 'Methods in teaching Filipino language'],
    
    // Secondary Education - MAPEH Major
    ['PE101', 'Physical Education and Sports', 'Physical fitness and sports activities'],
    ['ART101', 'Art Education', 'Visual arts and creative expression'],
    ['MUS101', 'Music Education', 'Music theory and performance'],
    ['HEAL101', 'Health Education', 'Health and wellness promotion'],
    
    // Secondary Education - Social Studies Major
    ['SOSC101', 'Philippine History', 'History of the Philippines'],
    ['SOSC102', 'World History', 'Major events in world history'],
    ['SOSC103', 'Economics', 'Basic economic principles and systems'],
    ['SOSC104', 'Political Science', 'Government and political systems'],
    ['SOSC105', 'Sociology', 'Society and social behavior'],
    
    // BS in Computer Science (B.S.C.S.)
    ['CS101', 'Introduction to Computing', 'Fundamentals of computers and computing'],
    ['CS102', 'Computer Programming I', 'Basic programming concepts using C/C++'],
    ['CS103', 'Computer Programming II', 'Advanced programming and problem solving'],
    ['CS104', 'Data Structures and Algorithms', 'Fundamental data structures and algorithm design'],
    ['CS105', 'Object-Oriented Programming', 'OOP concepts using Java'],
    ['CS106', 'Database Management Systems', 'Relational databases and SQL'],
    ['CS107', 'Web Development', 'HTML, CSS, JavaScript, and PHP'],
    ['CS108', 'Software Engineering', 'Software development methodologies'],
    ['CS109', 'Computer Networks', 'Network architecture and protocols'],
    ['CS110', 'Operating Systems', 'OS concepts and system programming'],
    ['CS111', 'Information Security', 'Cybersecurity principles and practices'],
    ['CS112', 'Mobile Application Development', 'Android and iOS app development']
];

foreach ($subjects as $subject) {
    $sql = "INSERT IGNORE INTO subjects (subject_code, subject_name, description) 
            VALUES ('{$subject[0]}', '{$subject[1]}', '{$subject[2]}')";
    $conn->query($sql);
}
echo "Major subjects for all programs inserted successfully<br>";

echo "<br><strong>Database setup completed!</strong><br>";
echo "<a href='index.php'>Go to Login Page</a>";

$conn->close();
?>
