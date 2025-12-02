<?php
require_once '../../config/database.php';

// Check if user is logged in and is student/tutee
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'tutee') {
    header('Location: ../../index.php');
    exit();
}

$user_id = $_SESSION['user_id'];
$filter_subject = isset($_GET['subject']) ? intval($_GET['subject']) : 0;

// Get all subjects for filter (only subjects from confirmed/completed sessions)
$subjects = $conn->query("SELECT DISTINCT s.* FROM subjects s 
                          JOIN sessions ses ON s.subject_id = ses.subject_id
                          WHERE ses.tutee_id = $user_id
                          AND ses.status IN ('confirmed', 'completed')
                          ORDER BY s.subject_name");

// Get study materials - ONLY from tutors with confirmed/completed sessions for the SPECIFIC subject
if ($filter_subject > 0) {
    $materials_sql = "SELECT sm.*, 
                      u.full_name as tutor_name,
                      s.subject_name, s.subject_code
                      FROM study_materials sm
                      JOIN users u ON sm.tutor_id = u.user_id
                      JOIN subjects s ON sm.subject_id = s.subject_id
                      WHERE sm.subject_id = $filter_subject
                      AND EXISTS (
                          SELECT 1 
                          FROM sessions ses
                          WHERE ses.tutor_id = sm.tutor_id
                          AND ses.tutee_id = $user_id
                          AND ses.subject_id = sm.subject_id
                          AND ses.status IN ('confirmed', 'completed')
                      )
                      ORDER BY sm.uploaded_at DESC";
} else {
    $materials_sql = "SELECT sm.*, 
                      u.full_name as tutor_name,
                      s.subject_name, s.subject_code
                      FROM study_materials sm
                      JOIN users u ON sm.tutor_id = u.user_id
                      JOIN subjects s ON sm.subject_id = s.subject_id
                      WHERE EXISTS (
                          SELECT 1 
                          FROM sessions ses
                          WHERE ses.tutor_id = sm.tutor_id
                          AND ses.tutee_id = $user_id
                          AND ses.subject_id = sm.subject_id
                          AND ses.status IN ('confirmed', 'completed')
                      )
                      ORDER BY sm.uploaded_at DESC";
}

$materials = $conn->query($materials_sql);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Study Materials - MC Tutor</title>
    <link rel="stylesheet" href="../../assets/css/style.php">
</head>
<body>
    <header>
        <div class="header-content">
            <div class="logo">
                <h1>MC Tutor - Student Panel</h1>
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
        render_nav_menu('tutee', 'study_materials.php');
        ?>

        <div class="card">
            <h2>Browse Study Materials</h2>
            <p style="color: #666; margin-bottom: 15px; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #667eea; border-radius: 4px;">
                <strong>Note:</strong> You can only access study materials for subjects where you have confirmed or completed sessions with the tutor who uploaded them.
            </p>
            <form method="GET" action="">
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 15px; align-items: end;">
                    <div class="form-group">
                        <label for="subject">Filter by Subject</label>
                        <select id="subject" name="subject" onchange="this.form.submit()">
                            <option value="0">All Subjects</option>
                            <?php while ($subject = $subjects->fetch_assoc()): ?>
                                <option value="<?php echo $subject['subject_id']; ?>" 
                                        <?php echo $filter_subject == $subject['subject_id'] ? 'selected' : ''; ?>>
                                    <?php echo $subject['subject_code']; ?> - <?php echo $subject['subject_name']; ?>
                                </option>
                            <?php endwhile; ?>
                        </select>
                    </div>
                    <?php if ($filter_subject > 0): ?>
                        <a href="study_materials.php" class="btn btn-secondary">Clear Filter</a>
                    <?php endif; ?>
                </div>
            </form>
        </div>

        <div class="card">
            <h2>Available Study Materials</h2>
            <?php if ($materials->num_rows > 0): ?>
                <div style="display: grid; gap: 15px;">
                    <?php while ($material = $materials->fetch_assoc()): ?>
                        <div class="material-item">
                            <div class="material-info">
                                <h4 style="color: #333; font-size: 16px; margin-bottom: 8px;"><?php echo $material['title']; ?></h4>
                                <p style="color: #555; margin-bottom: 5px;"><strong>Subject:</strong> <?php echo $material['subject_code']; ?> - <?php echo $material['subject_name']; ?></p>
                                <p style="color: #555; margin-bottom: 5px;"><strong>Uploaded by:</strong> <?php echo $material['tutor_name']; ?></p>
                                <p style="color: #333; margin-bottom: 8px; line-height: 1.6;"><strong>Description:</strong> <?php echo htmlspecialchars($material['description']); ?></p>
                                <p style="color: #666; margin-bottom: 5px;">
                                    <strong>File:</strong> <?php echo $material['file_name']; ?> 
                                    (<?php echo number_format($material['file_size'] / 1024, 2); ?> KB)
                                </p>
                                <p><small style="color: #999;">Uploaded: <?php echo date('M d, Y g:i A', strtotime($material['uploaded_at'])); ?></small></p>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <a href="../../<?php echo $material['file_path']; ?>" 
                                   class="btn btn-primary btn-sm" 
                                   download="<?php echo $material['file_name']; ?>">
                                   Download
                                </a>
                                <a href="../../<?php echo $material['file_path']; ?>" 
                                   class="btn btn-info btn-sm" 
                                   target="_blank" 
                                   rel="noopener noreferrer">
                                   View
                                </a>
                            </div>
                        </div>
                    <?php endwhile; ?>
                </div>
            <?php else: ?>
                <p class="empty-state">No study materials available. You can only access materials from tutors you have booked sessions with. <a href="find_tutors.php" style="color: #667eea;">Book a session</a> to get access to study materials!</p>
            <?php endif; ?>
        </div>
    </div>

    <?php require_once '../../assets/includes/floating_chat_button.php'; ?>
</body>
</html>
