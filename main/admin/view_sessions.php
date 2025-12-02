<?php
require_once '../../config/database.php';

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'admin') {
    header('Location: ../../index.php');
    exit();
}

// Get all sessions
$sessions_sql = "SELECT s.*, 
                 tutor.full_name as tutor_name, tutor.student_id as tutor_student_id,
                 tutee.full_name as tutee_name, tutee.student_id as tutee_student_id,
                 subj.subject_name, subj.subject_code
                 FROM sessions s
                 JOIN users tutor ON s.tutor_id = tutor.user_id
                 JOIN users tutee ON s.tutee_id = tutee.user_id
                 JOIN subjects subj ON s.subject_id = subj.subject_id
                 ORDER BY s.session_date DESC, s.start_time DESC";
$sessions = $conn->query($sessions_sql);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>View Sessions - MC Tutor</title>
    <link rel="stylesheet" href="../../assets/css/style.php">
</head>
<body>
    <header>
        <div class="header-content">
            <div class="logo">
                <h1>MC Tutor - Admin Panel</h1>
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
        render_nav_menu('admin', 'view_sessions.php');
        ?>

        <div class="card">
            <h2>All Tutoring Sessions</h2>
            <?php if ($sessions->num_rows > 0): ?>
                <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tutor</th>
                            <th>Tutee</th>
                            <th>Subject</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Location</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php while ($session = $sessions->fetch_assoc()): ?>
                            <tr>
                                <td><?php echo $session['session_id']; ?></td>
                                <td>
                                    <strong><?php echo $session['tutor_name']; ?></strong><br>
                                    <small><?php echo $session['tutor_student_id']; ?></small>
                                </td>
                                <td>
                                    <strong><?php echo $session['tutee_name']; ?></strong><br>
                                    <small><?php echo $session['tutee_student_id']; ?></small>
                                </td>
                                <td>
                                    <strong><?php echo $session['subject_code']; ?></strong><br>
                                    <small><?php echo $session['subject_name']; ?></small>
                                </td>
                                <td><?php echo date('M d, Y', strtotime($session['session_date'])); ?></td>
                                <td>
                                    <?php echo date('g:i A', strtotime($session['start_time'])); ?> - 
                                    <?php echo date('g:i A', strtotime($session['end_time'])); ?>
                                </td>
                                <td><?php echo $session['location'] ?: 'N/A'; ?></td>
                                <td><?php echo ucfirst($session['session_type']); ?></td>
                                <td><span class="status-badge status-<?php echo $session['status']; ?>"><?php echo ucfirst($session['status']); ?></span></td>
                                <td><?php echo date('M d, Y', strtotime($session['created_at'])); ?></td>
                            </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
                </div>
            <?php else: ?>
                <p class="empty-state">No sessions found</p>
            <?php endif; ?>
        </div>
    </div>

    <?php require_once '../../assets/includes/floating_chat_button.php'; ?>
</body>
</html>
