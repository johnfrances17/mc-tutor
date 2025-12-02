<?php
require_once '../../config/database.php';

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'admin') {
    header('Location: ../../index.php');
    exit();
}

$success = '';
$error = '';

// Get filter course
$filter_course = isset($_GET['filter_course']) ? mysqli_real_escape_string($conn, $_GET['filter_course']) : '';

// Handle add subject
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['add_subject'])) {
    $subject_code = mysqli_real_escape_string($conn, $_POST['subject_code']);
    $subject_name = mysqli_real_escape_string($conn, $_POST['subject_name']);
    $description = mysqli_real_escape_string($conn, $_POST['description']);
    $course = mysqli_real_escape_string($conn, $_POST['course']);
    
    $sql = "INSERT INTO subjects (subject_code, subject_name, description, course) 
            VALUES ('$subject_code', '$subject_name', '$description', '$course')";
    
    if ($conn->query($sql) === TRUE) {
        $success = 'Subject added successfully';
    } else {
        $error = 'Error adding subject: ' . $conn->error;
    }
}

// Handle delete subject
if (isset($_GET['delete']) && $_GET['delete']) {
    $subject_id = intval($_GET['delete']);
    $conn->query("DELETE FROM subjects WHERE subject_id = $subject_id");
    $success = 'Subject deleted successfully';
}

// Get all subjects
$subjects_sql = "SELECT s.*, COUNT(ts.id) as tutor_count 
                 FROM subjects s 
                 LEFT JOIN tutor_subjects ts ON s.subject_id = ts.subject_id";

if (!empty($filter_course)) {
    $subjects_sql .= " WHERE s.course = '$filter_course'";
}

$subjects_sql .= " GROUP BY s.subject_id ORDER BY s.subject_name";
$subjects = $conn->query($subjects_sql);

// Get all courses for filter
$courses = [
    'BS in Accountancy (B.S.A.)',
    'BS in Criminology (B.S. Crim.)',
    'BS in Nursing (B.S.N.)',
    'Bachelor in Secondary Education (B.S.Ed.)',
    'Bachelor in Secondary Education Major in English (B.S.Ed.)',
    'Bachelor in Secondary Education Major in Mathematics (B.S.Ed.)',
    'Bachelor in Secondary Education Major in Filipino (B.S.Ed.)',
    'Bachelor in Secondary Education Major in MAPEH (B.S.Ed.)',
    'Bachelor in Secondary Education Major in Social Studies (B.S.Ed.)',
    'BS in Computer Science (B.S.C.S.)'
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Subjects - MC Tutor</title>
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
        render_nav_menu('admin', 'manage_subjects.php');
        ?>

        <?php if ($success): ?>
            <div class="alert alert-success"><?php echo $success; ?></div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo $error; ?></div>
        <?php endif; ?>

        <div class="card">
            <h2>Add New Subject</h2>
            <form method="POST" action="">
                <div style="display: grid; grid-template-columns: 1fr 2fr 2fr; gap: 15px;">
                    <div class="form-group">
                        <label for="subject_code">Subject Code</label>
                        <input type="text" id="subject_code" name="subject_code" required>
                    </div>
                    <div class="form-group">
                        <label for="subject_name">Subject Name</label>
                        <input type="text" id="subject_name" name="subject_name" required>
                    </div>
                    <div class="form-group">
                        <label for="course">Course/Program</label>
                        <select id="course" name="course" required>
                            <option value="">Select Course...</option>
                            <option value="BS in Accountancy (B.S.A.)">BS in Accountancy (B.S.A.)</option>
                            <option value="BS in Criminology (B.S. Crim.)">BS in Criminology (B.S. Crim.)</option>
                            <option value="BS in Nursing (B.S.N.)">BS in Nursing (B.S.N.)</option>
                            <option value="Bachelor in Secondary Education (B.S.Ed.)">Bachelor in Secondary Education (B.S.Ed.)</option>
                            <option value="Bachelor in Secondary Education Major in English (B.S.Ed.)">Bachelor in Secondary Education Major in English (B.S.Ed.)</option>
                            <option value="Bachelor in Secondary Education Major in Mathematics (B.S.Ed.)">Bachelor in Secondary Education Major in Mathematics (B.S.Ed.)</option>
                            <option value="Bachelor in Secondary Education Major in Filipino (B.S.Ed.)">Bachelor in Secondary Education Major in Filipino (B.S.Ed.)</option>
                            <option value="Bachelor in Secondary Education Major in MAPEH (B.S.Ed.)">Bachelor in Secondary Education Major in MAPEH (B.S.Ed.)</option>
                            <option value="Bachelor in Secondary Education Major in Social Studies (B.S.Ed.)">Bachelor in Secondary Education Major in Social Studies (B.S.Ed.)</option>
                            <option value="BS in Computer Science (B.S.C.S.)">BS in Computer Science (B.S.C.S.)</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" rows="3"></textarea>
                </div>
                <button type="submit" name="add_subject" class="btn btn-primary">Add Subject</button>
            </form>
        </div>

        <div class="card">
            <h2>All Subjects</h2>
            <div style="margin-bottom: 20px;">
                <form method="GET" action="" style="display: flex; gap: 10px; align-items: end;">
                    <div class="form-group" style="flex: 1; margin-bottom: 0;">
                        <label for="filter_course">Filter by Course</label>
                        <select id="filter_course" name="filter_course" onchange="this.form.submit()">
                            <option value="">All Courses</option>
                            <?php foreach ($courses as $course_option): ?>
                                <option value="<?php echo $course_option; ?>" <?php echo $filter_course == $course_option ? 'selected' : ''; ?>>
                                    <?php echo $course_option; ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <?php if (!empty($filter_course)): ?>
                        <a href="manage_subjects.php" class="btn btn-secondary">Clear Filter</a>
                    <?php endif; ?>
                </form>
            </div>
            <?php if ($subjects->num_rows > 0): ?>
                <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Subject Code</th>
                            <th>Subject Name</th>
                            <th>Course/Program</th>
                            <th>Description</th>
                            <th>Tutors</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php while ($subject = $subjects->fetch_assoc()): ?>
                            <tr>
                                <td><strong><?php echo $subject['subject_code']; ?></strong></td>
                                <td><?php echo $subject['subject_name']; ?></td>
                                <td><span class="subject-tag"><?php echo $subject['course'] ?: 'N/A'; ?></span></td>
                                <td><?php echo $subject['description']; ?></td>
                                <td><?php echo $subject['tutor_count']; ?> tutor(s)</td>
                                <td>
                                    <a href="?delete=<?php echo $subject['subject_id']; ?><?php echo !empty($filter_course) ? '&filter_course=' . urlencode($filter_course) : ''; ?>" 
                                       class="btn btn-danger btn-sm" 
                                       onclick="return confirm('Delete this subject?')">Delete</a>
                                </td>
                            </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
                </div>
            <?php else: ?>
                <p class="empty-state">No subjects found</p>
            <?php endif; ?>
        </div>
    </div>

    <?php require_once '../../assets/includes/floating_chat_button.php'; ?>
</body>
</html>
