<?php
require_once '../../config/database.php';

// Check if user is logged in and is student/tutee
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'tutee') {
    header('Location: ../../index.php');
    exit();
}

$user_id = $_SESSION['user_id'];
$search_subject = isset($_GET['subject']) ? intval($_GET['subject']) : 0;
$search_query = isset($_GET['search']) ? mysqli_real_escape_string($conn, $_GET['search']) : '';
$sort_by = isset($_GET['sort']) ? $_GET['sort'] : 'rating';

// Get student's course to filter relevant subjects
$student_course_result = $conn->query("SELECT course FROM users WHERE user_id = $user_id");
$student_course = $student_course_result->fetch_assoc()['course'];

// Get subjects filtered by student's course
$subjects = $conn->query("SELECT * FROM subjects WHERE course = '" . $conn->real_escape_string($student_course) . "' ORDER BY subject_name");

// Build search conditions
$where_conditions = ["u.role = 'tutor'", "u.status = 'active'"];

if ($search_subject > 0) {
    $where_conditions[] = "ts.subject_id = $search_subject";
}

if (!empty($search_query)) {
    $where_conditions[] = "(u.full_name LIKE '%$search_query%' OR 
                             u.student_id LIKE '%$search_query%' OR 
                             s.subject_name LIKE '%$search_query%' OR 
                             s.subject_code LIKE '%$search_query%')";
}

$where_clause = "WHERE " . implode(" AND ", $where_conditions);

// Determine sort order
switch ($sort_by) {
    case 'name':
        $order_by = "u.full_name ASC";
        break;
    case 'sessions':
        $order_by = "total_sessions DESC, avg_rating DESC";
        break;
    case 'rating':
    default:
        $order_by = "avg_rating DESC, total_sessions DESC";
        break;
}

// Get tutors based on search
$tutors_sql = "SELECT u.*, 
               GROUP_CONCAT(DISTINCT CONCAT(s.subject_code, ' - ', s.subject_name) SEPARATOR ', ') as subjects_list,
               AVG(f.rating) as avg_rating,
               COUNT(DISTINCT sess.session_id) as total_sessions
               FROM users u
               LEFT JOIN tutor_subjects ts ON u.user_id = ts.tutor_id
               LEFT JOIN subjects s ON ts.subject_id = s.subject_id
               LEFT JOIN feedback f ON u.user_id = f.tutor_id
               LEFT JOIN sessions sess ON u.user_id = sess.tutor_id
               $where_clause
               GROUP BY u.user_id
               HAVING subjects_list IS NOT NULL
               ORDER BY $order_by";

$tutors = $conn->query($tutors_sql);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Find Tutors - MC Tutor</title>
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
        render_nav_menu('tutee', 'find_tutors.php');
        ?>

        <div class="search-filter-container">
            <h2>Find a Tutor</h2>
            <form method="GET" action="">
                <!-- Search Bar -->
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="search">Search Tutors or Subjects</label>
                    <input type="text" 
                           id="search" 
                           name="search" 
                           placeholder="Search by name, student ID, or subject..." 
                           value="<?php echo htmlspecialchars($search_query); ?>">
                </div>
                
                <div class="filter-row">
                    <div class="filter-group">
                        <label for="subject">Filter by Subject</label>
                        <select id="subject" name="subject">
                            <option value="0">All Subjects</option>
                            <?php 
                            $subjects->data_seek(0); // Reset pointer
                            while ($subject = $subjects->fetch_assoc()): 
                            ?>
                                <option value="<?php echo $subject['subject_id']; ?>" 
                                        <?php echo $search_subject == $subject['subject_id'] ? 'selected' : ''; ?>>
                                    <?php echo $subject['subject_code']; ?> - <?php echo $subject['subject_name']; ?>
                                </option>
                            <?php endwhile; ?>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label for="sort">Sort By</label>
                        <select id="sort" name="sort">
                            <option value="rating" <?php echo $sort_by == 'rating' ? 'selected' : ''; ?>>Highest Rating</option>
                            <option value="sessions" <?php echo $sort_by == 'sessions' ? 'selected' : ''; ?>>Most Sessions</option>
                            <option value="name" <?php echo $sort_by == 'name' ? 'selected' : ''; ?>>Name (A-Z)</option>
                        </select>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" class="btn btn-primary">Search</button>
                        <?php if ($search_subject > 0 || !empty($search_query) || $sort_by != 'rating'): ?>
                            <a href="find_tutors.php" class="btn btn-secondary">Clear</a>
                        <?php endif; ?>
                    </div>
                </div>
            </form>
        </div>

        <div class="card">
            <h2>Available Tutors</h2>
            <?php if ($tutors->num_rows > 0): ?>
                <?php while ($tutor = $tutors->fetch_assoc()): ?>
                    <div class="tutor-card">
                        <div class="tutor-info">
                            <h3><?php echo $tutor['full_name']; ?></h3>
                            <p><strong>Student ID:</strong> <?php echo $tutor['student_id']; ?></p>
                            <p><strong>Course:</strong> <?php echo $tutor['course']; ?> - <?php echo $tutor['year_level']; ?></p>
                            <p><strong>Email:</strong> <?php echo $tutor['email']; ?></p>
                            <p><strong>Phone:</strong> <?php echo $tutor['phone']; ?></p>
                            
                            <div class="tutor-subjects">
                                <strong>Subjects:</strong>
                                <div>
                                    <?php 
                                    $subjects_arr = explode(', ', $tutor['subjects_list']);
                                    foreach ($subjects_arr as $subj) {
                                        echo '<span class="subject-tag">' . $subj . '</span>';
                                    }
                                    ?>
                                </div>
                            </div>
                            
                            <div class="tutor-rating">
                                <div>
                                    <strong>Rating:</strong>
                                    <?php 
                                    if ($tutor['avg_rating']) {
                                        echo number_format($tutor['avg_rating'], 1) . ' ';
                                        for ($i = 1; $i <= 5; $i++) {
                                            echo $i <= round($tutor['avg_rating']) ? '★' : '☆';
                                        }
                                    } else {
                                        echo 'No ratings yet';
                                    }
                                    ?>
                                </div>
                                <div>
                                    <strong>Sessions:</strong> <?php echo $tutor['total_sessions']; ?>
                                </div>
                            </div>
                        </div>
                        <div class="tutor-actions">
                            <a href="book_session.php?tutor_id=<?php echo $tutor['user_id']; ?>" 
                               class="btn btn-primary">Book Session</a>
                        </div>
                    </div>
                <?php endwhile; ?>
            <?php else: ?>
                <p class="empty-state">No tutors found. Please try a different subject or check back later.</p>
            <?php endif; ?>
        </div>
    </div>

    <?php require_once '../../assets/includes/floating_chat_button.php'; ?>
</body>
</html>
