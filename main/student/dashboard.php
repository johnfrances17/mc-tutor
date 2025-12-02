<?php
require_once '../../config/database.php';

// Check if user is logged in and is student/tutee
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'tutee') {
    header('Location: ../../index.php');
    exit();
}

$user_id = $_SESSION['user_id'];

// Get student statistics
$stats = [];

// Total session requests
$result = $conn->query("SELECT COUNT(*) as count FROM sessions WHERE tutee_id = $user_id");
$stats['total_requests'] = $result->fetch_assoc()['count'];

// Pending sessions
$result = $conn->query("SELECT COUNT(*) as count FROM sessions WHERE tutee_id = $user_id AND status = 'pending'");
$stats['pending_sessions'] = $result->fetch_assoc()['count'];

// Confirmed sessions
$result = $conn->query("SELECT COUNT(*) as count FROM sessions WHERE tutee_id = $user_id AND status = 'confirmed'");
$stats['confirmed_sessions'] = $result->fetch_assoc()['count'];

// Completed sessions
$result = $conn->query("SELECT COUNT(*) as count FROM sessions WHERE tutee_id = $user_id AND status = 'completed'");
$stats['completed_sessions'] = $result->fetch_assoc()['count'];

// Get upcoming sessions
$upcoming_sessions_sql = "SELECT s.*, 
                          tutor.full_name as tutor_name,
                          tutor.email as tutor_email,
                          subj.subject_name, subj.subject_code
                          FROM sessions s
                          JOIN users tutor ON s.tutor_id = tutor.user_id
                          JOIN subjects subj ON s.subject_id = subj.subject_id
                          WHERE s.tutee_id = $user_id 
                          AND s.status IN ('pending', 'confirmed')
                          AND s.session_date >= CURDATE()
                          ORDER BY s.session_date, s.start_time
                          LIMIT 10";
$upcoming_sessions = $conn->query($upcoming_sessions_sql);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Dashboard - MC Tutor</title>
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
        render_nav_menu('tutee', 'dashboard.php');
        ?>

        <div class="dashboard-grid">
            <div class="stat-card">
                <h3>Total Requests</h3>
                <div class="number"><?php echo $stats['total_requests']; ?></div>
            </div>
            <div class="stat-card">
                <h3>Pending</h3>
                <div class="number"><?php echo $stats['pending_sessions']; ?></div>
            </div>
            <div class="stat-card">
                <h3>Confirmed</h3>
                <div class="number"><?php echo $stats['confirmed_sessions']; ?></div>
            </div>
            <div class="stat-card">
                <h3>Completed</h3>
                <div class="number"><?php echo $stats['completed_sessions']; ?></div>
            </div>
        </div>

        <div class="card">
            <h2>Upcoming Sessions</h2>
            <?php if ($upcoming_sessions->num_rows > 0): ?>
                <table>
                    <thead>
                        <tr>
                            <th>Tutor</th>
                            <th>Subject</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Location</th>
                            <th>Type</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php while ($session = $upcoming_sessions->fetch_assoc()): ?>
                            <tr>
                                <td>
                                    <strong><?php echo $session['tutor_name']; ?></strong><br>
                                    <small><?php echo $session['tutor_email']; ?></small>
                                </td>
                                <td><?php echo $session['subject_code']; ?></td>
                                <td><?php echo date('M d, Y', strtotime($session['session_date'])); ?></td>
                                <td><?php echo date('g:i A', strtotime($session['start_time'])); ?></td>
                                <td><?php echo $session['location'] ?: 'N/A'; ?></td>
                                <td><?php echo ucfirst($session['session_type']); ?></td>
                                <td><span class="status-badge status-<?php echo $session['status']; ?>"><?php echo ucfirst($session['status']); ?></span></td>
                            </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
            <?php else: ?>
                <p class="empty-state">
                    No upcoming sessions. <a href="find_tutors.php">Find a tutor</a> to book a session.
                </p>
            <?php endif; ?>
        </div>
    </div>

    <?php require_once '../../assets/includes/floating_chat_button.php'; ?>
</body>
</html>
