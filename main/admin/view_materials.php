<?php
require_once '../../config/database.php';

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'admin') {
    header('Location: ../../index.php');
    exit();
}

// Get all study materials
$materials_sql = "SELECT sm.*, 
                  u.full_name as tutor_name,
                  s.subject_name, s.subject_code
                  FROM study_materials sm
                  JOIN users u ON sm.tutor_id = u.user_id
                  JOIN subjects s ON sm.subject_id = s.subject_id
                  ORDER BY sm.uploaded_at DESC";
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
        render_nav_menu('admin', 'view_materials.php');
        ?>

        <div class="card">
            <h2>All Study Materials</h2>
            <?php if ($materials->num_rows > 0): ?>
                <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Subject</th>
                            <th>Uploaded By</th>
                            <th>File Name</th>
                            <th>Type</th>
                            <th>Size</th>
                            <th>Uploaded</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php while ($material = $materials->fetch_assoc()): ?>
                            <tr>
                                <td><?php echo $material['material_id']; ?></td>
                                <td><strong style="color: #333;"><?php echo $material['title']; ?></strong></td>
                                <td><?php echo $material['subject_code']; ?></td>
                                <td><?php echo $material['tutor_name']; ?></td>
                                <td><?php echo $material['file_name']; ?></td>
                                <td><?php echo $material['file_type']; ?></td>
                                <td><?php echo number_format($material['file_size'] / 1024, 2); ?> KB</td>
                                <td><?php echo date('M d, Y', strtotime($material['uploaded_at'])); ?></td>
                                <td>
                                    <a href="../../<?php echo $material['file_path']; ?>" 
                                       class="btn btn-info btn-sm" target="_blank">Download</a>
                                </td>
                            </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
                </div>
            <?php else: ?>
                <p class="empty-state">No study materials found</p>
            <?php endif; ?>
        </div>
    </div>

    <?php require_once '../../assets/includes/floating_chat_button.php'; ?>
</body>
</html>
