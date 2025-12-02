<?php
require_once '../../config/database.php';

// Check if user is logged in and is tutor
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'tutor') {
    header('Location: ../../index.php');
    exit();
}

$user_id = $_SESSION['user_id'];
$success = '';
$error = '';

// Handle session actions
if (isset($_GET['action']) && isset($_GET['id'])) {
    $session_id = intval($_GET['id']);
    $action = $_GET['action'];
    
    if ($action == 'confirm') {
        $conn->query("UPDATE sessions SET status = 'confirmed' WHERE session_id = $session_id AND tutor_id = $user_id");
        
        // Get session details and send notification
        $session = $conn->query("SELECT * FROM sessions WHERE session_id = $session_id")->fetch_assoc();
        $conn->query("INSERT INTO notifications (user_id, message, type) 
                     VALUES ({$session['tutee_id']}, 'Your tutoring session has been confirmed!', 'session_confirmed')");
        
        $success = 'Session confirmed successfully';
    } elseif ($action == 'cancel') {
        $conn->query("UPDATE sessions SET status = 'cancelled' WHERE session_id = $session_id AND tutor_id = $user_id");
        
        $session = $conn->query("SELECT * FROM sessions WHERE session_id = $session_id")->fetch_assoc();
        $conn->query("INSERT INTO notifications (user_id, message, type) 
                     VALUES ({$session['tutee_id']}, 'Your tutoring session has been cancelled by the tutor.', 'session_cancelled')");
        
        $success = 'Session cancelled';
    } elseif ($action == 'complete') {
        $conn->query("UPDATE sessions SET status = 'completed' WHERE session_id = $session_id AND tutor_id = $user_id");
        $success = 'Session marked as completed';
    }
}

// Get all tutor's sessions
$sessions_sql = "SELECT s.*, 
                 tutee.full_name as tutee_name,
                 tutee.email as tutee_email,
                 tutee.phone as tutee_phone,
                 subj.subject_name, subj.subject_code
                 FROM sessions s
                 JOIN users tutee ON s.tutee_id = tutee.user_id
                 JOIN subjects subj ON s.subject_id = subj.subject_id
                 WHERE s.tutor_id = $user_id
                 ORDER BY s.session_date DESC, s.start_time DESC";
$sessions = $conn->query($sessions_sql);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Sessions - MC Tutor</title>
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
        render_nav_menu('tutor', 'my_sessions.php');
        ?>

        <?php if ($success): ?>
            <div class="alert alert-success"><?php echo $success; ?></div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo $error; ?></div>
        <?php endif; ?>

        <div class="card">
            <h2>My Tutoring Sessions</h2>
            <?php if ($sessions->num_rows > 0): ?>
                <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Contact</th>
                            <th>Subject</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Location</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Notes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php while ($session = $sessions->fetch_assoc()): ?>
                            <tr>
                                <td><strong><?php echo $session['tutee_name']; ?></strong></td>
                                <td>
                                    <?php echo $session['tutee_email']; ?><br>
                                    <small><?php echo $session['tutee_phone']; ?></small>
                                </td>
                                <td>
                                    <strong><?php echo $session['subject_code']; ?></strong><br>
                                    <small><?php echo $session['subject_name']; ?></small>
                                </td>
                                <td><?php echo date('M d, Y', strtotime($session['session_date'])); ?></td>
                                <td>
                                    <?php echo date('g:i A', strtotime($session['start_time'])); ?><br>
                                    <small>to <?php echo date('g:i A', strtotime($session['end_time'])); ?></small>
                                </td>
                                <td>
                                    <?php if ($session['session_type'] == 'online'): ?>
                                        <a href="<?php echo $session['location']; ?>" target="_blank" style="color: #667eea; text-decoration: underline;">
                                            🔗 Join Meeting
                                        </a>
                                    <?php else: ?>
                                        📍 <?php echo $session['location'] ?: 'N/A'; ?>
                                    <?php endif; ?>
                                </td>
                                <td><?php echo ucfirst($session['session_type']); ?></td>
                                <td><span class="status-badge status-<?php echo $session['status']; ?>"><?php echo ucfirst($session['status']); ?></span></td>
                                <td><?php echo $session['notes'] ? substr($session['notes'], 0, 50) . '...' : 'N/A'; ?></td>
                                <td>
                                    <?php if ($session['status'] == 'pending'): ?>
                                        <a href="?action=confirm&id=<?php echo $session['session_id']; ?>" 
                                           class="btn btn-success btn-sm">Confirm</a>
                                        <a href="?action=cancel&id=<?php echo $session['session_id']; ?>" 
                                           class="btn btn-danger btn-sm"
                                           onclick="return confirm('Cancel this session?')">Decline</a>
                                    <?php elseif ($session['status'] == 'confirmed'): ?>
                                        <a href="../shared/messenger.php?user_id=<?php echo $session['tutee_id']; ?>" 
                                           class="btn btn-success btn-sm">💬 Chat</a>
                                        <a href="?action=complete&id=<?php echo $session['session_id']; ?>" 
                                           class="btn btn-primary btn-sm">Mark Complete</a>
                                        <a href="?action=cancel&id=<?php echo $session['session_id']; ?>" 
                                           class="btn btn-danger btn-sm"
                                           onclick="return confirm('Cancel this session?')">Cancel</a>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
                </div>
            <?php else: ?>
                <p class="empty-state">No sessions found. Students will be able to book sessions once you add subjects you can teach.</p>
            <?php endif; ?>
        </div>
    </div>

    <?php require_once '../../assets/includes/floating_chat_button.php'; ?>
</body>
</html>
