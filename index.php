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
        <title>MC Tutor - Login</title>
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
                    <a href="index.php?role=student" class="role-card">
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
                    
                    <a href="index.php?role=tutor" class="role-card">
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
                    <p style="text-align: center; color: #666; margin: 0;">Don't have an account? <a href="register.php" style="color: #667eea; text-decoration: none; font-weight: 600;">Register here</a></p>
                </div>
            </div>
        </div>
    </body>
    </html>
    <?php
    exit();
}

// Convert role parameter to database format
$role_filter = ($selected_role == 'student') ? 'tutee' : 'tutor';

// Handle login
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['login'])) {
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $password = $_POST['password'];
    
    $sql = "SELECT * FROM users WHERE email = '$email' AND status = 'active' AND role = '$role_filter'";
    $result = $conn->query($sql);
    
    if ($result->num_rows == 1) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['full_name'] = $user['full_name'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['email'] = $user['email'];
            
            // Redirect based on role
            if ($user['role'] == 'tutor') {
                header('Location: main/tutor/dashboard.php');
            } else {
                header('Location: main/student/dashboard.php');
            }
            exit();
        } else {
            $error = 'Invalid email or password';
        }
    } else {
        $error = 'Invalid email or password, or wrong role selected';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - MC Tutor Platform</title>
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
        .auth-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="auth-container" style="max-width: 450px; padding: 50px 45px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #667eea; margin-bottom: 5px; font-size: 32px;">MC Tutor</h1>
            <p style="color: #666; font-size: 16px;">Cloud-Based Peer Tutoring Platform</p>
            <p style="color: #999; font-size: 13px;">Mabini College Inc.</p>
        </div>
        
        <h2 style="text-align: center; margin-bottom: 20px;">
            <?php echo $selected_role == 'student' ? 'Student' : 'Tutor'; ?> Login
        </h2>
        
        <hr style="border: none; border-top: 2px solid #f0f0f0; margin: 0 0 30px 0;">
        
        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <?php if ($success): ?>
            <div class="alert alert-success"><?php echo $success; ?></div>
        <?php endif; ?>
        
        <form method="POST" action="">
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit" name="login" class="btn btn-primary" style="width: 100%; margin-bottom: 15px;">Login</button>
            
            <a href="index.php" class="btn btn-secondary" style="width: 100%; display: block; text-align: center; margin-bottom: 10px;">← Back to Role Selection</a>
        </form>
        
        <div class="auth-footer" style="text-align: center; margin-top: 20px;">
            Don't have an account? <a href="register.php?role=<?php echo $selected_role; ?>">Register here</a>
        </div>
    </div>
</body>
</html>
