<?php
require_once '../../config/database.php';

// Check if user is logged in and is student/tutee
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'tutee') {
    header('Location: ../../index.php');
    exit();
}

$user_id = $_SESSION['user_id'];
$session_id = isset($_GET['session_id']) ? intval($_GET['session_id']) : 0;

$success = '';
$error = '';

// Get session information
$session_sql = "SELECT s.*, 
                tutor.full_name as tutor_name,
                subj.subject_name, subj.subject_code
                FROM sessions s
                JOIN users tutor ON s.tutor_id = tutor.user_id
                JOIN subjects subj ON s.subject_id = subj.subject_id
                WHERE s.session_id = $session_id AND s.tutee_id = $user_id AND s.status = 'completed'";
$session_result = $conn->query($session_sql);

if ($session_result->num_rows == 0) {
    header('Location: my_sessions.php');
    exit();
}

$session = $session_result->fetch_assoc();

// Check if feedback already given
$check_feedback = $conn->query("SELECT * FROM feedback WHERE session_id = $session_id");
if ($check_feedback->num_rows > 0) {
    header('Location: my_sessions.php');
    exit();
}

// Handle feedback submission
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['submit_feedback'])) {
    $rating = intval($_POST['rating']);
    $comment = mysqli_real_escape_string($conn, $_POST['comment']);
    
    if ($rating < 1 || $rating > 5) {
        $error = 'Please select a valid rating';
    } else {
        $sql = "INSERT INTO feedback (session_id, tutee_id, tutor_id, rating, comment) 
                VALUES ($session_id, $user_id, {$session['tutor_id']}, $rating, '$comment')";
        
        if ($conn->query($sql) === TRUE) {
            // Create notification for tutor
            $conn->query("INSERT INTO notifications (user_id, message, type) 
                         VALUES ({$session['tutor_id']}, 'You received new feedback from {$_SESSION['full_name']}', 'feedback')");
            
            $success = 'Feedback submitted successfully! Thank you for your input.';
            header('refresh:2;url=my_sessions.php');
        } else {
            $error = 'Error submitting feedback: ' . $conn->error;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Give Feedback - MC Tutor</title>
    <link rel="stylesheet" href="../../assets/css/style.php">
    <style>
        .star-rating {
            display: flex;
            gap: 10px;
            font-size: 40px;
            margin: 20px 0;
        }
        .star-rating input[type="radio"] {
            display: none;
        }
        .star-rating label {
            cursor: pointer;
            color: #ddd;
            transition: color 0.2s;
        }
        .star-rating label:hover,
        .star-rating label:hover ~ label,
        .star-rating input[type="radio"]:checked ~ label {
            color: #ffc107;
        }
    </style>
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
        render_nav_menu('tutee', 'my_sessions.php');
        ?>

        <?php if ($success): ?>
            <div class="alert alert-success"><?php echo $success; ?></div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo $error; ?></div>
        <?php endif; ?>

        <div class="card">
            <h2>Give Feedback</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h3>Session Details</h3>
                <p><strong>Tutor:</strong> <?php echo $session['tutor_name']; ?></p>
                <p><strong>Subject:</strong> <?php echo $session['subject_code']; ?> - <?php echo $session['subject_name']; ?></p>
                <p><strong>Date:</strong> <?php echo date('M d, Y', strtotime($session['session_date'])); ?></p>
                <p><strong>Time:</strong> 
                    <?php echo date('g:i A', strtotime($session['start_time'])); ?> - 
                    <?php echo date('g:i A', strtotime($session['end_time'])); ?>
                </p>
            </div>

            <form method="POST" action="">
                <div class="form-group">
                    <label>How would you rate this tutoring session?</label>
                    <div class="star-rating">
                        <input type="radio" id="star5" name="rating" value="5" required>
                        <label for="star5">★</label>
                        <input type="radio" id="star4" name="rating" value="4">
                        <label for="star4">★</label>
                        <input type="radio" id="star3" name="rating" value="3">
                        <label for="star3">★</label>
                        <input type="radio" id="star2" name="rating" value="2">
                        <label for="star2">★</label>
                        <input type="radio" id="star1" name="rating" value="1">
                        <label for="star1">★</label>
                    </div>
                    <small style="color: #666;">Click on a star to rate (5 = Excellent, 1 = Poor)</small>
                </div>

                <div class="form-group">
                    <label for="comment">Your Comments</label>
                    <textarea id="comment" name="comment" rows="6" required
                              placeholder="Share your experience with this tutoring session. What did you learn? How was the tutor's explanation? Any suggestions?"></textarea>
                </div>

                <div style="display: flex; gap: 15px;">
                    <button type="submit" name="submit_feedback" class="btn btn-primary">Submit Feedback</button>
                    <a href="my_sessions.php" class="btn btn-secondary">Cancel</a>
                </div>
            </form>
        </div>
    </div>

    <script>
        // Make stars interactive
        const stars = document.querySelectorAll('.star-rating label');
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                stars.forEach((s, i) => {
                    if (i >= index) {
                        s.style.color = '#ffc107';
                    } else {
                        s.style.color = '#ddd';
                    }
                });
            });
        });
    </script>

    <?php require_once '../../assets/includes/floating_chat_button.php'; ?>
</body>
</html>
