<?php
require_once '../../config/database.php';

// Check if user is logged in and is tutor
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'tutor') {
    header('Location: ../../index.php');
    exit();
}

$user_id = $_SESSION['user_id'];

// Get all feedback for this tutor
$feedback_sql = "SELECT f.*, 
                 tutee.full_name as tutee_name,
                 s.session_date,
                 subj.subject_name, subj.subject_code
                 FROM feedback f
                 JOIN users tutee ON f.tutee_id = tutee.user_id
                 JOIN sessions s ON f.session_id = s.session_id
                 JOIN subjects subj ON s.subject_id = subj.subject_id
                 WHERE f.tutor_id = $user_id
                 ORDER BY f.created_at DESC";
$feedbacks = $conn->query($feedback_sql);

// Get average rating
$avg_result = $conn->query("SELECT AVG(rating) as avg_rating, COUNT(*) as total_feedback 
                            FROM feedback WHERE tutor_id = $user_id");
$avg_data = $avg_result->fetch_assoc();
$avg_rating = $avg_data['avg_rating'] ? number_format($avg_data['avg_rating'], 1) : 'N/A';
$total_feedback = $avg_data['total_feedback'];
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
        render_nav_menu('tutor', 'my_feedback.php');
        ?>

        <div class="dashboard-grid" style="grid-template-columns: 1fr 1fr;">
            <div class="stat-card">
                <h3>Average Rating</h3>
                <div class="number"><?php echo $avg_rating; ?></div>
                <div style="color: #ffc107; font-size: 24px; margin-top: 10px;">
                    <?php 
                    $rating_num = $avg_rating != 'N/A' ? round($avg_rating) : 0;
                    for ($i = 1; $i <= 5; $i++) {
                        echo $i <= $rating_num ? '★' : '☆';
                    }
                    ?>
                </div>
            </div>
            <div class="stat-card">
                <h3>Total Feedback</h3>
                <div class="number"><?php echo $total_feedback; ?></div>
            </div>
        </div>

        <div class="card">
            <h2>Student Feedback</h2>
            <?php if ($feedbacks->num_rows > 0): ?>
                <div style="display: grid; gap: 20px;">
                    <?php while ($feedback = $feedbacks->fetch_assoc()): ?>
                        <div style="background: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <div>
                                    <strong style="color: #333; font-size: 16px;"><?php echo $feedback['tutee_name']; ?></strong><br>
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
                <p class="empty-state">No feedback received yet. Complete sessions to receive feedback from students.</p>
            <?php endif; ?>
        </div>
    </div>

    <?php require_once '../../assets/includes/floating_chat_button.php'; ?>
</body>
</html>
