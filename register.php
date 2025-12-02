<?php
require_once 'config/database.php';

$error = '';
$success = '';
$selected_role = isset($_GET['role']) ? $_GET['role'] : '';

// If no role selected, show role selection screen
if (empty($selected_role)) {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Register - MC Tutor Platform</title>
        <link rel="stylesheet" href="assets/css/style.php">
        <style>
            body {
                background: #f5f5f5;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                padding: 20px;
            }
            .role-selection-container {
                width: 100%;
                max-width: 800px;
            }
            .role-selection-card {
                background: white;
                padding: 50px;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            }
            .role-selection-card h1 {
                color: #667eea;
                font-size: 36px;
                margin-bottom: 8px;
                text-align: center;
            }
            .role-selection-card .subtitle {
                color: #666;
                font-size: 18px;
                margin-bottom: 8px;
                text-align: center;
            }
            .role-selection-card .institution {
                color: #999;
                font-size: 14px;
                margin-bottom: 40px;
                text-align: center;
            }
            .role-selection-card h2 {
                color: #333;
                font-size: 24px;
                margin-bottom: 40px;
                font-weight: 500;
                text-align: center;
            }
            .role-cards {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-top: 30px;
            }
            .role-card {
                background: #f8f9fa;
                border: 2px solid #e0e0e0;
                border-radius: 12px;
                padding: 40px 30px;
                cursor: pointer;
                transition: all 0.3s;
                text-decoration: none;
                display: block;
            }
            .role-card:hover {
                border-color: #667eea;
                box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
                transform: translateY(-4px);
            }
            .role-card .icon {
                display: flex;
                justify-content: center;
                margin-bottom: 20px;
            }
            .role-card h3 {
                color: #333;
                font-size: 22px;
                font-weight: 600;
                margin-bottom: 12px;
                text-align: center;
            }
            .role-card p {
                color: #666;
                font-size: 14px;
                line-height: 1.6;
                margin: 0;
                text-align: center;
            }
            @media (max-width: 768px) {
                .role-cards {
                    grid-template-columns: 1fr;
                }
                .role-selection-card {
                    padding: 30px 25px;
                }
            }
        </style>
    </head>
    <body>
        <div class="role-selection-container">
            <div class="role-selection-card">
                <h1>MC Tutor</h1>
                <div class="subtitle">Cloud-Based Peer Tutoring Platform</div>
                <div class="institution">Mabini College Inc.</div>
                
                <h2>Choose Your Role</h2>
                
                <div class="role-cards">
                    <a href="register.php?role=student" class="role-card">
                        <div class="icon">
                            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="10" y="15" width="40" height="30" rx="2" fill="#667eea" opacity="0.2"/>
                                <rect x="15" y="20" width="30" height="20" rx="1" fill="#667eea"/>
                                <line x1="20" y1="26" x2="40" y2="26" stroke="white" stroke-width="2" stroke-linecap="round"/>
                                <line x1="20" y1="31" x2="35" y2="31" stroke="white" stroke-width="2" stroke-linecap="round"/>
                                <circle cx="30" cy="12" r="8" fill="#667eea"/>
                                <path d="M 30 8 L 32 14 L 28 14 Z" fill="white"/>
                            </svg>
                        </div>
                        <h3>Student</h3>
                        <p>I need help with my subjects and want to find tutors to guide me</p>
                    </a>
                    
                    <a href="register.php?role=tutor" class="role-card">
                        <div class="icon">
                            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="30" cy="18" r="10" fill="#667eea"/>
                                <path d="M 15 45 Q 15 30 30 30 Q 45 30 45 45" fill="#667eea"/>
                                <rect x="20" y="48" width="20" height="8" rx="1" fill="#667eea" opacity="0.7"/>
                                <path d="M 10 25 L 30 15 L 50 25 L 30 20 Z" fill="#667eea" opacity="0.3"/>
                                <circle cx="42" cy="22" r="6" fill="#667eea" opacity="0.5"/>
                                <path d="M 40 20 L 42 24 L 44 20" stroke="white" stroke-width="2" fill="none"/>
                            </svg>
                        </div>
                        <h3>Tutor</h3>
                        <p>I want to share my knowledge and help fellow students succeed</p>
                    </a>
                </div>
                
                <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #f0f0f0;">
                    <p style="text-align: center; color: #666; margin: 0;">Already have an account? <a href="index.php" style="color: #667eea; text-decoration: none; font-weight: 600;">Login here</a></p>
                </div>
            </div>
        </div>
    </body>
    </html>
    <?php
    exit();
}

// Convert role parameter to database format
$role_value = ($selected_role == 'student') ? 'tutee' : 'tutor';

// Handle registration
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['register'])) {
    $student_id = mysqli_real_escape_string($conn, $_POST['student_id']);
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
    $full_name = mysqli_real_escape_string($conn, $_POST['full_name']);
    $role = $role_value; // Use pre-selected role
    $phone = mysqli_real_escape_string($conn, $_POST['phone']);
    $year_level = mysqli_real_escape_string($conn, $_POST['year_level']);
    $course = mysqli_real_escape_string($conn, $_POST['course']);
    
    // Validation
    if ($password !== $confirm_password) {
        $error = 'Passwords do not match';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters';
    } else {
        // Check if email or student ID already exists
        $check_sql = "SELECT * FROM users WHERE email = '$email' OR student_id = '$student_id'";
        $check_result = $conn->query($check_sql);
        
        if ($check_result->num_rows > 0) {
            $error = 'Email or Student ID already exists';
        } else {
            // Hash password and insert user
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            
            $sql = "INSERT INTO users (student_id, email, password, full_name, role, phone, year_level, course) 
                    VALUES ('$student_id', '$email', '$hashed_password', '$full_name', '$role', '$phone', '$year_level', '$course')";
            
            if ($conn->query($sql) === TRUE) {
                $success = 'Registration successful! Redirecting to login...';
                header('refresh:2;url=index.php?role=' . $selected_role);
            } else {
                $error = 'Registration failed: ' . $conn->error;
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - MC Tutor Platform</title>
    <link rel="stylesheet" href="assets/css/style.php">
    <script>
        const courseSubjects = {
            'accountancy': ['BS in Accountancy (B.S.A.)'],
            'business_ops': ['BS in Business Administration - Operations Management (B.S.B.A.)'],
            'business_fin': ['BS in Business Administration - Financial Management (B.S.B.A.)'],
            'criminology': ['Bachelor of Science in Criminology (B.S. Crim.)'],
            'entrepreneurship': ['Bachelor of Science in Entrepreneurship (B.S. Entrep.)'],
            'nursing': ['Bachelor of Science in Nursing (B.S.N.)'],
            'communication': ['Bachelor of Arts in Communication (B.A. Comm)'],
            'secondary_ed': [
                'Bachelor in Secondary Education - English (B.S.Ed.)',
                'Bachelor in Secondary Education - Mathematics (B.S.Ed.)',
                'Bachelor in Secondary Education - Filipino (B.S.Ed.)',
                'Bachelor in Secondary Education - MAPEH (B.S.Ed.)',
                'Bachelor in Secondary Education - Social Studies (B.S.Ed.)'
            ],
            'computer_science': ['Bachelor of Science in Computer Science (B.S.C.S.)'],
            'elementary_ed': [
                'Bachelor in Elementary Education - Content Course (B.E.Ed.)',
                'Bachelor in Elementary Education - Special Education (B.E.Ed.)',
                'Bachelor in Elementary Education - Pre-School Education (B.E.Ed.)'
            ],
            'early_childhood': ['Bachelor of Early Childhood Education (B.E.C.Ed)'],
            'special_needs': ['Bachelor of Special Needs Education (B.S.N.Ed)'],
            'culture_arts': ['Bachelor of Culture and Arts Education (B.C.A.Ed)'],
            'physical_ed': ['Bachelor of Physical Education (B.P.Ed.)']
        };

        function updateSubjects() {
            const programSelect = document.getElementById('course_program');
            const subjectField = document.getElementById('subject_field');
            const courseSelect = document.getElementById('course');
            const selectedProgram = programSelect.value;
            
            courseSelect.innerHTML = '<option value="">Select Major/Specialization</option>';
            
            if (selectedProgram && courseSubjects[selectedProgram]) {
                const subjects = courseSubjects[selectedProgram];
                
                subjects.forEach(subject => {
                    const option = document.createElement('option');
                    option.value = subject;
                    option.textContent = subject;
                    courseSelect.appendChild(option);
                });
                
                subjectField.style.display = 'block';
                courseSelect.disabled = false;
                courseSelect.required = true;
            } else {
                subjectField.style.display = 'none';
                courseSelect.disabled = true;
                courseSelect.required = false;
            }
        }
    </script>
    <style>
        body {
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .auth-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="auth-container" style="max-width: 600px; padding: 50px 45px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #667eea; margin-bottom: 5px; font-size: 32px;">MC Tutor</h1>
            <p style="color: #666; font-size: 16px;">Cloud-Based Peer Tutoring Platform</p>
            <p style="color: #999; font-size: 13px;">Mabini College Inc.</p>
        </div>
        
        <h2 style="text-align: center; margin-bottom: 20px;">
            Register as <?php echo $selected_role == 'student' ? 'Student' : 'Tutor'; ?>
        </h2>
        
        <hr style="border: none; border-top: 2px solid #f0f0f0; margin: 0 0 30px 0;">
        
        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <?php if ($success): ?>
            <div class="alert alert-success"><?php echo $success; ?></div>
        <?php endif; ?>
        
            <form method="POST" action="">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="form-group">
                    <label for="student_id">Student ID</label>
                    <input type="text" id="student_id" name="student_id" required>
                </div>
                
                <div class="form-group">
                    <label for="full_name">Full Name</label>
                    <input type="text" id="full_name" name="full_name" required>
                </div>
            </div>            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" required>
            </div>
            
            <div class="form-group">
                <label for="year_level">Year Level</label>
                <select id="year_level" name="year_level" required>
                    <option value="">Select Year Level</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="course_program">Course Program</label>
                <select id="course_program" name="course_program" required onchange="updateSubjects()">
                    <option value="">Select Course Program</option>
                    <option value="accountancy">BS in Accountancy (B.S.A.)</option>
                    <option value="business_ops">BS in Business Administration - Operations Management</option>
                    <option value="business_fin">BS in Business Administration - Financial Management</option>
                    <option value="criminology">Bachelor of Science in Criminology (B.S. Crim.)</option>
                    <option value="entrepreneurship">Bachelor of Science in Entrepreneurship (B.S. Entrep.)</option>
                    <option value="nursing">Bachelor of Science in Nursing (B.S.N.)</option>
                    <option value="communication">Bachelor of Arts in Communication (B.A. Comm)</option>
                    <option value="secondary_ed">Bachelor in Secondary Education (B.S.Ed.)</option>
                    <option value="computer_science">Bachelor of Science in Computer Science (B.S.C.S.)</option>
                    <option value="elementary_ed">Bachelor in Elementary Education (B.E.Ed.)</option>
                    <option value="early_childhood">Bachelor of Early Childhood Education (B.E.C.Ed)</option>
                    <option value="special_needs">Bachelor of Special Needs Education (B.S.N.Ed)</option>
                    <option value="culture_arts">Bachelor of Culture and Arts Education (B.C.A.Ed)</option>
                    <option value="physical_ed">Bachelor of Physical Education (B.P.Ed.)</option>
                </select>
            </div>
            
            <div class="form-group" id="subject_field" style="display: none;">
                <label for="course">Major/Specialization</label>
                <select id="course" name="course" disabled>
                    <option value="">Select Major/Specialization</option>
                </select>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required minlength="6">
                </div>
                
                <div class="form-group">
                    <label for="confirm_password">Confirm Password</label>
                    <input type="password" id="confirm_password" name="confirm_password" required minlength="6">
                </div>
            </div>
            
            <button type="submit" name="register" class="btn btn-primary" style="width: 100%; margin-bottom: 15px;">Register</button>
            
            <a href="register.php" class="btn btn-secondary" style="width: 100%; display: block; text-align: center; margin-bottom: 10px;">← Back to Role Selection</a>
        </form>
        
        <div class="auth-footer" style="text-align: center; margin-top: 20px;">
            Already have an account? <a href="index.php?role=<?php echo $selected_role; ?>">Login here</a>
        </div>
    </div>
</body>
</html>