<?php
require_once '../../config/database.php';

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'admin') {
    header('Location: ../../index.php');
    exit();
}

$success = '';
$error = '';

// Handle user status update
if (isset($_GET['action']) && isset($_GET['id'])) {
    $user_id = intval($_GET['id']);
    $action = $_GET['action'];
    
    if ($action == 'activate') {
        $conn->query("UPDATE users SET status = 'active' WHERE user_id = $user_id");
        $success = 'User activated successfully';
    } elseif ($action == 'deactivate') {
        $conn->query("UPDATE users SET status = 'inactive' WHERE user_id = $user_id");
        $success = 'User deactivated successfully';
    } elseif ($action == 'delete') {
        $conn->query("DELETE FROM users WHERE user_id = $user_id");
        $success = 'User deleted successfully';
    }
}

// Get all users
$users_sql = "SELECT * FROM users WHERE role != 'admin' ORDER BY created_at DESC";
$users = $conn->query($users_sql);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Users - MC Tutor</title>
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
        render_nav_menu('admin', 'manage_users.php');
        ?>

        <?php if ($success): ?>
            <div class="alert alert-success"><?php echo $success; ?></div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo $error; ?></div>
        <?php endif; ?>

        <div class="card">
            <h2>Manage Users</h2>
            
            <?php if ($users->num_rows > 0): ?>
                <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Course</th>
                            <th>Year</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php while ($user = $users->fetch_assoc()): ?>
                            <tr>
                                <td><?php echo $user['user_id']; ?></td>
                                <td><?php echo $user['student_id']; ?></td>
                                <td><?php echo $user['full_name']; ?></td>
                                <td><?php echo $user['email']; ?></td>
                                <td><strong><?php echo ucfirst($user['role']); ?></strong></td>
                                <td><?php echo $user['course']; ?></td>
                                <td><?php echo $user['year_level']; ?></td>
                                <td>
                                    <span class="status-badge status-<?php echo $user['status'] == 'active' ? 'confirmed' : 'cancelled'; ?>">
                                        <?php echo ucfirst($user['status']); ?>
                                    </span>
                                </td>
                                <td>
                                    <?php if ($user['status'] == 'active'): ?>
                                        <a href="?action=deactivate&id=<?php echo $user['user_id']; ?>" 
                                           class="btn btn-warning btn-sm" 
                                           onclick="return confirm('Deactivate this user?')">Deactivate</a>
                                    <?php else: ?>
                                        <a href="?action=activate&id=<?php echo $user['user_id']; ?>" 
                                           class="btn btn-success btn-sm">Activate</a>
                                    <?php endif; ?>
                                    <a href="?action=delete&id=<?php echo $user['user_id']; ?>" 
                                       class="btn btn-danger btn-sm" 
                                       onclick="return confirm('Delete this user permanently?')">Delete</a>
                                </td>
                            </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
                </div>
            <?php else: ?>
                <p class="empty-state">No users found</p>
            <?php endif; ?>
        </div>
    </div>

    <?php require_once '../../assets/includes/floating_chat_button.php'; ?>
</body>
</html>
