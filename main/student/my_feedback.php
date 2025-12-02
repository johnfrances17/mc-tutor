<?php
require_once '../../config/database.php';

// Check if user is logged in and is student/tutee
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'tutee') {
    header('Location: ../../index.php');
    exit();
}

$user_id = $_SESSION['user_id'];

// Get all feedback given by this student
$feedback_sql = "SELECT f.*, 
                 tutor.full_name as tutor_name,
                 s.session_date,
                 subj.subject_name, subj.subject_code
                 FROM feedback f
                 JOIN users tutor ON f.tutor_id = tutor.user_id
                 JOIN sessions s ON f.session_id = s.session_id
                 JOIN subjects subj ON s.subject_id = subj.subject_id
                 WHERE f.tutee_id = $user_id
                 ORDER BY f.created_at DESC";
$feedbacks = $conn->query($feedback_sql);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Feedback - MC Tutor</title>
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
        render_nav_menu('tutee', 'my_feedback.php');
        ?>

        <div class="card">
            <h2>Feedback I've Given</h2>
            <?php if ($feedbacks->num_rows > 0): ?>
                <div style="display: grid; gap: 20px;">
                    <?php while ($feedback = $feedbacks->fetch_assoc()): ?>
                        <div style="background: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <div>
                                    <strong style="color: #333; font-size: 16px;">Tutor: <?php echo $feedback['tutor_name']; ?></strong><br>
                                    <small style="color: #666;"><?php echo $feedback['subject_code']; ?> - <?php echo $feedback['subject_name']; ?></small>
                                </div>
                                <div style="text-align: right;">
                                    <div class="rating" style="color: #ffc107; font-size: 20px;">
                                        <?php 
                                        for ($i = 1; $i <= 5; $i++) {
                                            echo $i <= $feedback['rating'] ? '★' : '☆';
                                        }
                                        ?>
                                    </div>
                                    <small style="color: #999;"><?php echo date('M d, Y', strtotime($feedback['created_at'])); ?></small>
                                </div>
                            </div>
                            <p class="feedback-comment" style="margin-top: 15px; color: #333; font-size: 15px; line-height: 1.7; background: #f8f9fa; padding: 15px; border-radius: 5px;">
                                "<?php echo htmlspecialchars($feedback['comment']); ?>"
                            </p>
                            <small style="color: #999;">Session Date: <?php echo date('M d, Y', strtotime($feedback['session_date'])); ?></small>
                        </div>
                    <?php endwhile; ?>
                </div>
            <?php else: ?>
                <p class="empty-state">
                    You haven't given any feedback yet. Complete a session and provide feedback to help improve the tutoring experience.
                </p>
            <?php endif; ?>
        </div>
    </div>

    <?php require_once '../../assets/includes/floating_chat_button.php'; ?>
</body>
</html>
