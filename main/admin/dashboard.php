<?php
require_once '../../config/database.php';

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'admin') {
    header('Location: ../../index.php');
    exit();
}

// Get statistics
$stats = [];

// Total users
$result = $conn->query("SELECT COUNT(*) as count FROM users WHERE role != 'admin'");
$stats['total_users'] = $result->fetch_assoc()['count'];

// Total tutors
$result = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'tutor'");
$stats['total_tutors'] = $result->fetch_assoc()['count'];

// Total tutees
$result = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'tutee'");
$stats['total_tutees'] = $result->fetch_assoc()['count'];

// Total sessions
$result = $conn->query("SELECT COUNT(*) as count FROM sessions");
$stats['total_sessions'] = $result->fetch_assoc()['count'];

// Pending sessions
$result = $conn->query("SELECT COUNT(*) as count FROM sessions WHERE status = 'pending'");
$stats['pending_sessions'] = $result->fetch_assoc()['count'];

// Completed sessions
$result = $conn->query("SELECT COUNT(*) as count FROM sessions WHERE status = 'completed'");
$stats['completed_sessions'] = $result->fetch_assoc()['count'];

// Total subjects
$result = $conn->query("SELECT COUNT(*) as count FROM subjects");
$stats['total_subjects'] = $result->fetch_assoc()['count'];

// Total study materials
$result = $conn->query("SELECT COUNT(*) as count FROM study_materials");
$stats['total_materials'] = $result->fetch_assoc()['count'];

// Recent sessions
$recent_sessions_sql = "SELECT s.*, 
                        tutor.full_name as tutor_name,
                        tutee.full_name as tutee_name,
                        subj.subject_name
                        FROM sessions s
                        JOIN users tutor ON s.tutor_id = tutor.user_id
                        JOIN users tutee ON s.tutee_id = tutee.user_id
                        JOIN subjects subj ON s.subject_id = subj.subject_id
                        ORDER BY s.created_at DESC
                        LIMIT 10";
$recent_sessions = $conn->query($recent_sessions_sql);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - MC Tutor</title>
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
        render_nav_menu('admin', 'dashboard.php');
        ?>

        <div class="dashboard-grid">
            <div class="stat-card">
                <h3>Total Users</h3>
                <div class="number"><?php echo $stats['total_users']; ?></div>
            </div>
            <div class="stat-card">
                <h3>Total Tutors</h3>
                <div class="number"><?php echo $stats['total_tutors']; ?></div>
            </div>
            <div class="stat-card">
                <h3>Total Tutees</h3>
                <div class="number"><?php echo $stats['total_tutees']; ?></div>
            </div>
            <div class="stat-card">
                <h3>Total Sessions</h3>
                <div class="number"><?php echo $stats['total_sessions']; ?></div>
            </div>
            <div class="stat-card">
                <h3>Pending Sessions</h3>
                <div class="number"><?php echo $stats['pending_sessions']; ?></div>
            </div>
            <div class="stat-card">
                <h3>Completed Sessions</h3>
                <div class="number"><?php echo $stats['completed_sessions']; ?></div>
            </div>
            <div class="stat-card">
                <h3>Total Subjects</h3>
                <div class="number"><?php echo $stats['total_subjects']; ?></div>
            </div>
            <div class="stat-card">
                <h3>Study Materials</h3>
                <div class="number"><?php echo $stats['total_materials']; ?></div>
            </div>
        </div>

        <div class="card">
            <h2>Recent Sessions</h2>
            <?php if ($recent_sessions->num_rows > 0): ?>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tutor</th>
                            <th>Tutee</th>
                            <th>Subject</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php while ($session = $recent_sessions->fetch_assoc()): ?>
                            <tr>
                                <td><?php echo $session['session_id']; ?></td>
                                <td><?php echo $session['tutor_name']; ?></td>
                                <td><?php echo $session['tutee_name']; ?></td>
                                <td><?php echo $session['subject_name']; ?></td>
                                <td><?php echo date('M d, Y', strtotime($session['session_date'])); ?></td>
                                <td><?php echo date('g:i A', strtotime($session['start_time'])); ?></td>
                                <td><span class="status-badge status-<?php echo $session['status']; ?>"><?php echo ucfirst($session['status']); ?></span></td>
                                <td><?php echo ucfirst($session['session_type']); ?></td>
                            </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
            <?php else: ?>
                <p class="empty-state">No sessions found</p>
            <?php endif; ?>
        </div>
    </div>

    <?php require_once '../../assets/includes/floating_chat_button.php'; ?>
</body>
</html>
