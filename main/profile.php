<?php
require_once '../config/database.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: ../index.php');
    exit();
}

$user_id = $_SESSION['user_id'];
$error = '';
$success = '';

// Handle profile picture upload
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['upload_picture'])) {
    if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] == 0) {
        $allowed = ['jpg', 'jpeg', 'png'];
        $filename = $_FILES['profile_picture']['name'];
        $filetype = $_FILES['profile_picture']['type'];
        $filesize = $_FILES['profile_picture']['size'];
        
        // Verify file extension
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        if (!in_array($ext, $allowed)) {
            $error = 'Only JPG, JPEG, and PNG files are allowed.';
        } elseif ($filesize > 2 * 1024 * 1024) { // 2MB max
            $error = 'File size must not exceed 2MB.';
        } else {
            // Create uploads/profiles directory if it doesn't exist
            $upload_dir = '../uploads/profiles/';
            if (!file_exists($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }
            
            // Generate unique filename
            $new_filename = 'profile_' . $user_id . '_' . time() . '.' . $ext;
            $destination = $upload_dir . $new_filename;
            
            if (move_uploaded_file($_FILES['profile_picture']['tmp_name'], $destination)) {
                // Delete old profile picture if exists
                $old_pic_query = $conn->query("SELECT profile_picture FROM users WHERE user_id = $user_id");
                $old_pic = $old_pic_query->fetch_assoc()['profile_picture'];
                if ($old_pic && file_exists('../' . $old_pic)) {
                    unlink('../' . $old_pic);
                }
                
                // Update database
                $pic_path = 'uploads/profiles/' . $new_filename;
                $update_sql = "UPDATE users SET profile_picture = '$pic_path' WHERE user_id = $user_id";
                
                if ($conn->query($update_sql)) {
                    $success = 'Profile picture updated successfully!';
                } else {
                    $error = 'Failed to update database: ' . $conn->error;
                }
            } else {
                $error = 'Failed to upload file.';
            }
        }
    } else {
        $error = 'Please select an image file.';
    }
}

// Handle profile picture removal
if (isset($_GET['remove_picture']) && $_GET['remove_picture'] == '1') {
    $old_pic_query = $conn->query("SELECT profile_picture FROM users WHERE user_id = $user_id");
    $old_pic = $old_pic_query->fetch_assoc()['profile_picture'];
    
    if ($old_pic) {
        // Delete file if exists
        if (file_exists('../' . $old_pic)) {
            unlink('../' . $old_pic);
        }
        
        // Update database
        $conn->query("UPDATE users SET profile_picture = NULL WHERE user_id = $user_id");
        $success = 'Profile picture removed successfully!';
    }
}

// Handle profile update
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['update_profile'])) {
    $full_name = mysqli_real_escape_string($conn, $_POST['full_name']);
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $phone = mysqli_real_escape_string($conn, $_POST['phone']);
    $year_level = mysqli_real_escape_string($conn, $_POST['year_level']);
    $course = mysqli_real_escape_string($conn, $_POST['course']);
    
    // Check if email is already taken by another user
    $check_email = $conn->query("SELECT user_id FROM users WHERE email = '$email' AND user_id != $user_id");
    
    if ($check_email->num_rows > 0) {
        $error = 'Email address is already in use by another account.';
    } else {
        // Update profile
        $update_sql = "UPDATE users 
                       SET full_name = '$full_name', 
                           email = '$email', 
                           phone = '$phone', 
                           year_level = '$year_level', 
                           course = '$course'
                       WHERE user_id = $user_id";
        
        if ($conn->query($update_sql)) {
            $_SESSION['full_name'] = $full_name;
            $success = 'Profile updated successfully!';
        } else {
            $error = 'Failed to update profile: ' . $conn->error;
        }
    }
}

// Handle password change
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['change_password'])) {
    $current_password = $_POST['current_password'];
    $new_password = $_POST['new_password'];
    $confirm_password = $_POST['confirm_password'];
    
    // Get current password hash
    $user_result = $conn->query("SELECT password FROM users WHERE user_id = $user_id");
    $user = $user_result->fetch_assoc();
    
    if (!password_verify($current_password, $user['password'])) {
        $error = 'Current password is incorrect.';
    } elseif ($new_password !== $confirm_password) {
        $error = 'New passwords do not match.';
    } elseif (strlen($new_password) < 6) {
        $error = 'New password must be at least 6 characters.';
    } else {
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
        $update_sql = "UPDATE users SET password = '$hashed_password' WHERE user_id = $user_id";
        
        if ($conn->query($update_sql)) {
            $success = 'Password changed successfully!';
        } else {
            $error = 'Failed to change password: ' . $conn->error;
        }
    }
}

// Get user data
$user_sql = "SELECT * FROM users WHERE user_id = $user_id";
$user_result = $conn->query($user_sql);
$user = $user_result->fetch_assoc();

// Determine dashboard link based on role
$dashboard_link = '';
switch ($user['role']) {
    case 'admin':
        $dashboard_link = 'admin/dashboard.php';
        break;
    case 'tutor':
        $dashboard_link = 'tutor/dashboard.php';
        break;
    case 'tutee':
        $dashboard_link = 'student/dashboard.php';
        break;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Profile - MC Tutor</title>
    <link rel="stylesheet" href="../assets/css/style.php">
</head>
<body>
    <header>
        <div class="header-content">
            <div class="logo">
                <h1>MC Tutor - My Profile</h1>
                <p>Cloud-Based Peer Tutoring Platform</p>
            </div>
            <div class="user-info">
                <span>Welcome, <?php echo $_SESSION['full_name']; ?></span>
                <a href="profile.php" class="logout-btn" style="background-color: #667eea; margin-right: 10px;">Profile</a>
                <a href="<?php echo $role == 'admin' ? 'admin' : ($role == 'tutor' ? 'tutor' : 'student'); ?>/dashboard.php" class="logout-btn" style="background-color: #28a745; margin-right: 10px;">Dashboard</a>
                <a href="logout.php" class="logout-btn">Logout</a>
            </div>
        </div>
    </header>

    <div class="container">
        <div style="margin-bottom: 20px;">
            <a href="<?php echo $dashboard_link; ?>" class="btn btn-secondary">← Back to Dashboard</a>
        </div>

        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <?php if ($success): ?>
            <div class="alert alert-success"><?php echo $success; ?></div>
        <?php endif; ?>

        <!-- Profile Picture Card -->
        <div class="card">
            <h2>Profile Picture</h2>
            <div style="display: flex; align-items: center; gap: 30px;">
                <div style="flex-shrink: 0;">
                    <?php if ($user['profile_picture']): ?>
                        <img src="../<?php echo $user['profile_picture']; ?>" alt="Profile Picture" 
                             style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 3px solid #667eea;">
                    <?php else: ?>
                        <div style="width: 150px; height: 150px; border-radius: 50%; background: #667eea; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px; font-weight: bold;">
                            <?php echo strtoupper(substr($user['full_name'], 0, 1)); ?>
                        </div>
                    <?php endif; ?>
                </div>
                <div style="flex: 1;">
                    <form method="POST" action="" enctype="multipart/form-data">
                        <div class="form-group">
                            <label for="profile_picture">Upload New Picture (JPG, PNG - Max 2MB)</label>
                            <input type="file" id="profile_picture" name="profile_picture" accept="image/jpeg,image/png" required>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button type="submit" name="upload_picture" class="btn btn-primary">Upload Picture</button>
                            <?php if ($user['profile_picture']): ?>
                                <a href="?remove_picture=1" class="btn btn-danger" onclick="return confirm('Remove your profile picture?')">Remove Picture</a>
                            <?php endif; ?>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Profile Information Card -->
        <div class="card">
            <h2>Profile Information</h2>
            <form method="POST" action="">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="form-group">
                        <label for="student_id">Student ID</label>
                        <input type="text" id="student_id" value="<?php echo $user['student_id']; ?>" disabled style="background-color: #f5f5f5;">
                    </div>
                    
                    <div class="form-group">
                        <label for="role">Role</label>
                        <input type="text" id="role" value="<?php echo ucfirst($user['role']); ?>" disabled style="background-color: #f5f5f5;">
                    </div>
                </div>

                <div class="form-group">
                    <label for="full_name">Full Name</label>
                    <input type="text" id="full_name" name="full_name" value="<?php echo $user['full_name']; ?>" required>
                </div>

                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" value="<?php echo $user['email']; ?>" required>
                </div>

                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" name="phone" value="<?php echo $user['phone']; ?>" required>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="form-group">
                        <label for="year_level">Year Level</label>
                        <select id="year_level" name="year_level" required>
                            <option value="">Select Year Level</option>
                            <option value="1st Year" <?php echo $user['year_level'] == '1st Year' ? 'selected' : ''; ?>>1st Year</option>
                            <option value="2nd Year" <?php echo $user['year_level'] == '2nd Year' ? 'selected' : ''; ?>>2nd Year</option>
                            <option value="3rd Year" <?php echo $user['year_level'] == '3rd Year' ? 'selected' : ''; ?>>3rd Year</option>
                            <option value="4th Year" <?php echo $user['year_level'] == '4th Year' ? 'selected' : ''; ?>>4th Year</option>
                            <option value="N/A" <?php echo $user['year_level'] == 'N/A' ? 'selected' : ''; ?>>N/A</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="course">Course</label>
                        <select id="course" name="course" required>
                            <option value="">Select Course</option>
                            <option value="Administration" <?php echo $user['course'] == 'Administration' ? 'selected' : ''; ?>>Administration</option>
                            <option value="BS in Accountancy (B.S.A.)" <?php echo $user['course'] == 'BS in Accountancy (B.S.A.)' ? 'selected' : ''; ?>>BS in Accountancy (B.S.A.)</option>
                            <option value="BS in Business Administration - Operations Management (B.S.B.A.)" <?php echo $user['course'] == 'BS in Business Administration - Operations Management (B.S.B.A.)' ? 'selected' : ''; ?>>BS in Business Administration - Operations Management</option>
                            <option value="BS in Business Administration - Financial Management (B.S.B.A.)" <?php echo $user['course'] == 'BS in Business Administration - Financial Management (B.S.B.A.)' ? 'selected' : ''; ?>>BS in Business Administration - Financial Management</option>
                            <option value="Bachelor of Science in Criminology (B.S. Crim.)" <?php echo $user['course'] == 'Bachelor of Science in Criminology (B.S. Crim.)' ? 'selected' : ''; ?>>Bachelor of Science in Criminology (B.S. Crim.)</option>
                            <option value="Bachelor of Science in Entrepreneurship (B.S. Entrep.)" <?php echo $user['course'] == 'Bachelor of Science in Entrepreneurship (B.S. Entrep.)' ? 'selected' : ''; ?>>Bachelor of Science in Entrepreneurship (B.S. Entrep.)</option>
                            <option value="Bachelor of Science in Nursing (B.S.N.)" <?php echo $user['course'] == 'Bachelor of Science in Nursing (B.S.N.)' ? 'selected' : ''; ?>>Bachelor of Science in Nursing (B.S.N.)</option>
                            <option value="Bachelor of Arts in Communication (B.A. Comm)" <?php echo $user['course'] == 'Bachelor of Arts in Communication (B.A. Comm)' ? 'selected' : ''; ?>>Bachelor of Arts in Communication (B.A. Comm)</option>
                            <option value="Bachelor in Secondary Education - English (B.S.Ed.)" <?php echo $user['course'] == 'Bachelor in Secondary Education - English (B.S.Ed.)' ? 'selected' : ''; ?>>Bachelor in Secondary Education - English</option>
                            <option value="Bachelor in Secondary Education - Mathematics (B.S.Ed.)" <?php echo $user['course'] == 'Bachelor in Secondary Education - Mathematics (B.S.Ed.)' ? 'selected' : ''; ?>>Bachelor in Secondary Education - Mathematics</option>
                            <option value="Bachelor in Secondary Education - Filipino (B.S.Ed.)" <?php echo $user['course'] == 'Bachelor in Secondary Education - Filipino (B.S.Ed.)' ? 'selected' : ''; ?>>Bachelor in Secondary Education - Filipino</option>
                            <option value="Bachelor in Secondary Education - MAPEH (B.S.Ed.)" <?php echo $user['course'] == 'Bachelor in Secondary Education - MAPEH (B.S.Ed.)' ? 'selected' : ''; ?>>Bachelor in Secondary Education - MAPEH</option>
                            <option value="Bachelor in Secondary Education - Social Studies (B.S.Ed.)" <?php echo $user['course'] == 'Bachelor in Secondary Education - Social Studies (B.S.Ed.)' ? 'selected' : ''; ?>>Bachelor in Secondary Education - Social Studies</option>
                            <option value="Bachelor of Science in Computer Science (B.S.C.S.)" <?php echo $user['course'] == 'Bachelor of Science in Computer Science (B.S.C.S.)' ? 'selected' : ''; ?>>Bachelor of Science in Computer Science (B.S.C.S.)</option>
                            <option value="Bachelor in Elementary Education - Content Course (B.E.Ed.)" <?php echo $user['course'] == 'Bachelor in Elementary Education - Content Course (B.E.Ed.)' ? 'selected' : ''; ?>>Bachelor in Elementary Education - Content Course</option>
                            <option value="Bachelor in Elementary Education - Special Education (B.E.Ed.)" <?php echo $user['course'] == 'Bachelor in Elementary Education - Special Education (B.E.Ed.)' ? 'selected' : ''; ?>>Bachelor in Elementary Education - Special Education</option>
                            <option value="Bachelor in Elementary Education - Pre-School Education (B.E.Ed.)" <?php echo $user['course'] == 'Bachelor in Elementary Education - Pre-School Education (B.E.Ed.)' ? 'selected' : ''; ?>>Bachelor in Elementary Education - Pre-School Education</option>
                            <option value="Bachelor of Early Childhood Education (B.E.C.Ed)" <?php echo $user['course'] == 'Bachelor of Early Childhood Education (B.E.C.Ed)' ? 'selected' : ''; ?>>Bachelor of Early Childhood Education (B.E.C.Ed)</option>
                            <option value="Bachelor of Special Needs Education (B.S.N.Ed)" <?php echo $user['course'] == 'Bachelor of Special Needs Education (B.S.N.Ed)' ? 'selected' : ''; ?>>Bachelor of Special Needs Education (B.S.N.Ed)</option>
                            <option value="Bachelor of Culture and Arts Education (B.C.A.Ed)" <?php echo $user['course'] == 'Bachelor of Culture and Arts Education (B.C.A.Ed)' ? 'selected' : ''; ?>>Bachelor of Culture and Arts Education (B.C.A.Ed)</option>
                            <option value="Bachelor of Physical Education (B.P.Ed.)" <?php echo $user['course'] == 'Bachelor of Physical Education (B.P.Ed.)' ? 'selected' : ''; ?>>Bachelor of Physical Education (B.P.Ed.)</option>
                        </select>
                    </div>
                </div>

                <div style="margin-top: 10px;">
                    <p style="color: #666; font-size: 14px;"><strong>Account Created:</strong> <?php echo date('M d, Y g:i A', strtotime($user['created_at'])); ?></p>
                    <p style="color: #666; font-size: 14px;"><strong>Last Updated:</strong> <?php echo date('M d, Y g:i A', strtotime($user['updated_at'])); ?></p>
                </div>

                <button type="submit" name="update_profile" class="btn btn-primary">Update Profile</button>
                <a href="chat_security.php" class="btn" style="background-color: #667eea; color: white; margin-left: 10px;">🔒 Chat Security Settings</a>
            </form>
        </div>

        <!-- Change Password Card -->
        <div class="card">
            <h2>Change Password</h2>
            <form method="POST" action="">
                <div class="form-group">
                    <label for="current_password">Current Password</label>
                    <input type="password" id="current_password" name="current_password" required minlength="6">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="form-group">
                        <label for="new_password">New Password</label>
                        <input type="password" id="new_password" name="new_password" required minlength="6">
                    </div>

                    <div class="form-group">
                        <label for="confirm_password">Confirm New Password</label>
                        <input type="password" id="confirm_password" name="confirm_password" required minlength="6">
                    </div>
                </div>

                <button type="submit" name="change_password" class="btn btn-primary">Change Password</button>
            </form>
        </div>
    </div>

    <?php require_once '../assets/includes/floating_chat_button.php'; ?>
</body>
</html>
