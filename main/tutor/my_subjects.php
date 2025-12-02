<?php
require_once '../../config/database.php';
require_once '../shared/SessionPreferencesManager.php';

// Check if user is logged in and is tutor
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'tutor') {
    header('Location: ../../index.php');
    exit();
}

$user_id = $_SESSION['user_id'];
$success = '';
$error = '';

$prefsManager = new SessionPreferencesManager();

// Handle add subject
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['add_subject'])) {
    $subject_id = intval($_POST['subject_id']);
    $proficiency = mysqli_real_escape_string($conn, $_POST['proficiency']);
    
    $sql = "INSERT INTO tutor_subjects (tutor_id, subject_id, proficiency_level) 
            VALUES ($user_id, $subject_id, '$proficiency')";
    
    if ($conn->query($sql) === TRUE) {
        $success = 'Subject added successfully. Now set your availability preferences below.';
    } else {
        $error = 'Error adding subject: ' . $conn->error;
    }
}

// Handle update session preferences
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['update_preferences'])) {
    $subject_id = intval($_POST['subject_id']);
    
    $preferences = [
        'face-to-face' => [
            'available' => isset($_POST['f2f_available']),
            'location' => mysqli_real_escape_string($conn, $_POST['f2f_location'] ?? '')
        ],
        'online' => [
            'available' => isset($_POST['online_available']),
            'meeting_link' => mysqli_real_escape_string($conn, $_POST['online_link'] ?? '')
        ]
    ];
    
    // Validation
    if ($preferences['face-to-face']['available'] && empty($preferences['face-to-face']['location'])) {
        $error = 'Please provide a location for face-to-face sessions';
    } elseif ($preferences['online']['available'] && empty($preferences['online']['meeting_link'])) {
        $error = 'Please provide a meeting link for online sessions';
    } elseif (!$preferences['face-to-face']['available'] && !$preferences['online']['available']) {
        $error = 'Please select at least one session type';
    } else {
        if ($prefsManager->savePreferences($user_id, $subject_id, $preferences)) {
            $success = 'Session preferences updated successfully!';
        } else {
            $error = 'Error saving preferences';
        }
    }
}

// Handle remove subject
if (isset($_GET['remove']) && $_GET['remove']) {
    $id = intval($_GET['remove']);
    
    // Get subject_id before deleting
    $subject_result = $conn->query("SELECT subject_id FROM tutor_subjects WHERE id = $id AND tutor_id = $user_id");
    if ($subject_result->num_rows > 0) {
        $subject_id = $subject_result->fetch_assoc()['subject_id'];
        
        // Delete from database
        $conn->query("DELETE FROM tutor_subjects WHERE id = $id AND tutor_id = $user_id");
        
        // Delete preferences file
        $prefsManager->deletePreferences($user_id, $subject_id);
        
        $success = 'Subject removed successfully';
    }
}

// Get tutor's subjects
$my_subjects_sql = "SELECT ts.*, s.subject_code, s.subject_name, s.description, s.course
                    FROM tutor_subjects ts
                    JOIN subjects s ON ts.subject_id = s.subject_id
                    WHERE ts.tutor_id = $user_id
                    ORDER BY s.subject_name";
$my_subjects = $conn->query($my_subjects_sql);

// Get tutor's course
$tutor_course_sql = "SELECT course FROM users WHERE user_id = $user_id";
$tutor_course_result = $conn->query($tutor_course_sql);
$tutor_course = $tutor_course_result->fetch_assoc()['course'];

// Extract course keywords for flexible matching
$course_keywords = [];
if (stripos($tutor_course, 'Computer Science') !== false || stripos($tutor_course, 'CS') !== false) {
    $course_keywords[] = "course LIKE '%Computer Science%'";
} elseif (stripos($tutor_course, 'Accountancy') !== false) {
    $course_keywords[] = "course LIKE '%Accountancy%'";
} elseif (stripos($tutor_course, 'Criminology') !== false) {
    $course_keywords[] = "course LIKE '%Criminology%'";
} elseif (stripos($tutor_course, 'Nursing') !== false) {
    $course_keywords[] = "course LIKE '%Nursing%'";
} elseif (stripos($tutor_course, 'Secondary Education') !== false) {
    $course_keywords[] = "course LIKE '%Secondary Education%'";
}

$course_filter = count($course_keywords) > 0 ? '(' . implode(' OR ', $course_keywords) . ')' : "course = '$tutor_course'";

// Get available subjects to add (filtered by tutor's course)
$available_subjects_sql = "SELECT * FROM subjects 
                           WHERE subject_id NOT IN (
                               SELECT subject_id FROM tutor_subjects WHERE tutor_id = $user_id
                           )
                           AND $course_filter
                           ORDER BY subject_name";
$available_subjects = $conn->query($available_subjects_sql);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Subjects - MC Tutor</title>
    <link rel="stylesheet" href="../../assets/css/style.php">
</head>
<body>
    <header>
        <div class="header-content">
            <div class="logo">
                <h1>MC Tutor - Tutor Panel</h1>
                <p>Cloud-Based Peer Tutoring Platform</p>
            </div>
            <div class="user-info">
                <span>Welcome, <?php echo $_SESSION['full_name']; ?></span>
                <a href="../profile.php" class="logout-btn" style="background-color: #667eea; margin-right: 10px;">Profile</a>
                <a href="dashboard.php" class="logout-btn" style="background-color: #28a745; margin-right: 10px;">Dashboard</a>
                <a href="../logout.php" class="logout-btn">Logout</a>
            </div>
        </div>
    </header>

    <div class="container">
        <?php 
        require_once '../../assets/includes/nav_menu.php';
        render_nav_menu('tutor', 'my_subjects.php');
        ?>

        <?php if ($success): ?>
            <div class="alert alert-success"><?php echo $success; ?></div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo $error; ?></div>
        <?php endif; ?>

        <?php if ($available_subjects->num_rows > 0): ?>
        <div class="card">
            <h2>Add Subject You Can Teach</h2>
            <form method="POST" action="">
                <div class="filter-row">
                    <div class="filter-group">
                        <label for="subject_id">Select Subject</label>
                        <select id="subject_id" name="subject_id" required>
                            <option value="">Choose a subject...</option>
                            <?php while ($subject = $available_subjects->fetch_assoc()): ?>
                                <option value="<?php echo $subject['subject_id']; ?>">
                                    <?php echo $subject['subject_code']; ?> - <?php echo $subject['subject_name']; ?>
                                </option>
                            <?php endwhile; ?>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="proficiency">Proficiency Level</label>
                        <select id="proficiency" name="proficiency" required>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate" selected>Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                        </select>
                    </div>
                    <div>
                        <button type="submit" name="add_subject" class="btn btn-primary">Add Subject</button>
                    </div>
                </div>
            </form>
        </div>
        <?php endif; ?>

        <div class="card">
            <h2>Subjects I Can Teach</h2>
            <?php if ($my_subjects->num_rows > 0): ?>
                <div class="subjects-list">
                    <?php 
                    $my_subjects->data_seek(0); // Reset pointer
                    while ($subject = $my_subjects->fetch_assoc()): 
                        $prefs = $prefsManager->getPreferences($user_id, $subject['subject_id']);
                        $has_prefs = $prefsManager->hasPreferences($user_id, $subject['subject_id']);
                    ?>
                        <div class="subject-card" style="border: 2px solid <?php echo $has_prefs ? '#28a745' : '#ffc107'; ?>; padding: 20px; margin-bottom: 20px; border-radius: 8px; background: #f8f9fa;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                                <div>
                                    <h3 style="margin: 0 0 10px 0; color: #2c3e50;">
                                        <?php echo $subject['subject_code']; ?> - <?php echo $subject['subject_name']; ?>
                                    </h3>
                                    <span class="subject-tag"><?php echo ucfirst($subject['proficiency_level']); ?></span>
                                    <?php if ($has_prefs): ?>
                                        <span class="subject-tag" style="background: #28a745; margin-left: 5px;">✓ Available</span>
                                    <?php else: ?>
                                        <span class="subject-tag" style="background: #ffc107; margin-left: 5px;">⚠ Set Availability</span>
                                    <?php endif; ?>
                                </div>
                                <a href="?remove=<?php echo $subject['id']; ?>" 
                                   class="btn btn-danger btn-sm" 
                                   onclick="return confirm('Remove this subject and all preferences?')">Remove</a>
                            </div>
                            
                            <p style="color: #666; margin-bottom: 15px;"><?php echo $subject['description']; ?></p>
                            
                            <!-- Session Preferences Form -->
                            <form method="POST" action="" style="background: white; padding: 15px; border-radius: 5px;">
                                <input type="hidden" name="subject_id" value="<?php echo $subject['subject_id']; ?>">
                                
                                <h4 style="margin-top: 0; color: #2c3e50;">📍 Where/How Can Students Book Sessions?</h4>
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                                    <!-- Face-to-Face Option -->
                                    <div style="border: 2px solid #ddd; padding: 15px; border-radius: 5px;">
                                        <label style="display: flex; align-items: center; margin-bottom: 10px; cursor: pointer;">
                                            <input type="checkbox" name="f2f_available" id="f2f_<?php echo $subject['subject_id']; ?>" 
                                                   <?php echo ($prefs['preferences']['face-to-face']['available'] ?? false) ? 'checked' : ''; ?>
                                                   onchange="toggleInput('f2f_<?php echo $subject['subject_id']; ?>')">
                                            <strong style="margin-left: 8px;">🤝 Face-to-Face</strong>
                                        </label>
                                        <input type="text" name="f2f_location" 
                                               id="f2f_input_<?php echo $subject['subject_id']; ?>"
                                               placeholder="e.g., Library Room 101, Cafeteria"
                                               value="<?php echo htmlspecialchars($prefs['preferences']['face-to-face']['location'] ?? ''); ?>"
                                               <?php echo ($prefs['preferences']['face-to-face']['available'] ?? false) ? '' : 'disabled'; ?>
                                               style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                    </div>
                                    
                                    <!-- Online Option -->
                                    <div style="border: 2px solid #ddd; padding: 15px; border-radius: 5px;">
                                        <label style="display: flex; align-items: center; margin-bottom: 10px; cursor: pointer;">
                                            <input type="checkbox" name="online_available" id="online_<?php echo $subject['subject_id']; ?>"
                                                   <?php echo ($prefs['preferences']['online']['available'] ?? false) ? 'checked' : ''; ?>
                                                   onchange="toggleInput('online_<?php echo $subject['subject_id']; ?>')">
                                            <strong style="margin-left: 8px;">💻 Online</strong>
                                        </label>
                                        <input type="url" name="online_link"
                                               id="online_input_<?php echo $subject['subject_id']; ?>"
                                               placeholder="https://meet.google.com/xxx-xxx-xxx"
                                               value="<?php echo htmlspecialchars($prefs['preferences']['online']['meeting_link'] ?? ''); ?>"
                                               <?php echo ($prefs['preferences']['online']['available'] ?? false) ? '' : 'disabled'; ?>
                                               style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                        <small style="display: block; margin-top: 5px; color: #666;">
                                            Create link: <a href="https://meet.google.com/" target="_blank" style="color: #667eea;">Google Meet</a> | 
                                            <a href="https://zoom.us/" target="_blank" style="color: #667eea;">Zoom</a>
                                        </small>
                                    </div>
                                </div>
                                
                                <button type="submit" name="update_preferences" class="btn btn-primary">
                                    💾 Save Availability Settings
                                </button>
                                
                                <?php if ($has_prefs): ?>
                                    <div style="margin-top: 10px; padding: 10px; background: #d4edda; border-radius: 4px; color: #155724;">
                                        <strong>✓ Students can now book sessions for this subject!</strong>
                                    </div>
                                <?php else: ?>
                                    <div style="margin-top: 10px; padding: 10px; background: #fff3cd; border-radius: 4px; color: #856404;">
                                        <strong>⚠ Set at least one option for students to book sessions</strong>
                                    </div>
                                <?php endif; ?>
                            </form>
                        </div>
                    <?php endwhile; ?>
                </div>
            <?php else: ?>
                <p class="empty-state">You haven't added any subjects yet. Add subjects you can teach to start receiving tutoring requests.</p>
            <?php endif; ?>
        </div>
    </div>

    <?php require_once '../../assets/includes/floating_chat_button.php'; ?>
    
    <script>
    function toggleInput(checkboxId) {
        const checkbox = document.getElementById(checkboxId);
        const input = document.getElementById(checkboxId.replace('_', '_input_'));
        
        if (checkbox.checked) {
            input.disabled = false;
            input.focus();
        } else {
            input.disabled = true;
            input.value = '';
        }
    }
    </script>
</body>
</html>
