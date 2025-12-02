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

// Handle file upload
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['upload_material'])) {
    $subject_id = intval($_POST['subject_id']);
    $title = mysqli_real_escape_string($conn, $_POST['title']);
    $description = mysqli_real_escape_string($conn, $_POST['description']);
    
    // Handle file upload
    if (isset($_FILES['file']) && $_FILES['file']['error'] == 0) {
        $upload_dir = '../../uploads/study_materials/';
        
        // Create directory if it doesn't exist
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        $file_name = $_FILES['file']['name'];
        $file_tmp = $_FILES['file']['tmp_name'];
        $file_size = $_FILES['file']['size'];
        $file_type = $_FILES['file']['type'];
        
        // Generate unique filename
        $file_ext = pathinfo($file_name, PATHINFO_EXTENSION);
        $unique_name = time() . '_' . uniqid() . '.' . $file_ext;
        $file_path = 'uploads/study_materials/' . $unique_name;
        $full_path = $upload_dir . $unique_name;
        
        // Move uploaded file
        if (move_uploaded_file($file_tmp, $full_path)) {
            $sql = "INSERT INTO study_materials (tutor_id, subject_id, title, description, file_name, file_path, file_type, file_size) 
                    VALUES ($user_id, $subject_id, '$title', '$description', '$file_name', '$file_path', '$file_type', $file_size)";
            
            if ($conn->query($sql) === TRUE) {
                $success = 'Study material uploaded successfully';
            } else {
                $error = 'Error saving material: ' . $conn->error;
            }
        } else {
            $error = 'Error uploading file';
        }
    } else {
        $error = 'Please select a file to upload';
    }
}

// Handle delete material
if (isset($_GET['delete']) && $_GET['delete']) {
    $material_id = intval($_GET['delete']);
    
    // Get file path before deleting
    $material = $conn->query("SELECT file_path FROM study_materials WHERE material_id = $material_id AND tutor_id = $user_id")->fetch_assoc();
    
    if ($material) {
        // Delete file
        if (file_exists('../../' . $material['file_path'])) {
            unlink('../../' . $material['file_path']);
        }
        
        // Delete from database
        $conn->query("DELETE FROM study_materials WHERE material_id = $material_id AND tutor_id = $user_id");
        $success = 'Material deleted successfully';
    }
}

// Get tutor's subjects
$my_subjects = $conn->query("SELECT s.* FROM subjects s 
                            JOIN tutor_subjects ts ON s.subject_id = ts.subject_id 
                            WHERE ts.tutor_id = $user_id
                            ORDER BY s.subject_name");

// Get tutor's uploaded materials
$materials_sql = "SELECT sm.*, s.subject_name, s.subject_code
                  FROM study_materials sm
                  JOIN subjects s ON sm.subject_id = s.subject_id
                  WHERE sm.tutor_id = $user_id
                  ORDER BY sm.uploaded_at DESC";
$materials = $conn->query($materials_sql);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload Materials - MC Tutor</title>
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
        render_nav_menu('tutor', 'upload_materials.php');
        ?>

        <?php if ($success): ?>
            <div class="alert alert-success"><?php echo $success; ?></div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo $error; ?></div>
        <?php endif; ?>

        <?php if ($my_subjects->num_rows > 0): ?>
        <div class="card">
            <h2>Upload Study Material</h2>
            <form method="POST" action="" enctype="multipart/form-data">
                <div class="form-group">
                    <label for="subject_id">Subject</label>
                    <select id="subject_id" name="subject_id" required>
                        <option value="">Select subject...</option>
                        <?php while ($subject = $my_subjects->fetch_assoc()): ?>
                            <option value="<?php echo $subject['subject_id']; ?>">
                                <?php echo $subject['subject_code']; ?> - <?php echo $subject['subject_name']; ?>
                            </option>
                        <?php endwhile; ?>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="title">Material Title</label>
                    <input type="text" id="title" name="title" required placeholder="e.g., Lecture Notes - Chapter 1">
                </div>
                
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" rows="3" placeholder="Brief description of the material..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="file">Upload File (PDF, DOC, DOCX, PPT, PPTX, ZIP)</label>
                    <input type="file" id="file" name="file" required 
                           accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt">
                    <small style="color: #666;">Maximum file size: 10MB</small>
                </div>
                
                <button type="submit" name="upload_material" class="btn btn-primary">Upload Material</button>
            </form>
        </div>
        <?php else: ?>
        <div class="alert alert-info">
            Please add subjects you can teach first before uploading study materials. 
            <a href="my_subjects.php">Go to My Subjects</a>
        </div>
        <?php endif; ?>

        <div class="card">
            <h2>My Uploaded Materials</h2>
            <?php if ($materials->num_rows > 0): ?>
                <div style="display: grid; gap: 15px;">
                    <?php while ($material = $materials->fetch_assoc()): ?>
                        <div class="material-item">
                            <div class="material-info">
                                <h4 style="color: #333; font-size: 16px; margin-bottom: 8px;"><?php echo $material['title']; ?></h4>
                                <p style="color: #555; margin-bottom: 5px;"><strong>Subject:</strong> <?php echo $material['subject_code']; ?> - <?php echo $material['subject_name']; ?></p>
                                <p style="color: #333; margin-bottom: 8px; line-height: 1.6;"><strong>Description:</strong> <?php echo htmlspecialchars($material['description']); ?></p>
                                <p style="color: #666; margin-bottom: 5px;">
                                    <strong>File:</strong> <?php echo $material['file_name']; ?> 
                                    (<?php echo number_format($material['file_size'] / 1024, 2); ?> KB)
                                </p>
                                <p><small style="color: #999;">Uploaded: <?php echo date('M d, Y g:i A', strtotime($material['uploaded_at'])); ?></small></p>
                            </div>
                            <div>
                                <a href="../../<?php echo $material['file_path']; ?>" 
                                   class="btn btn-info btn-sm" target="_blank">Download</a>
                                <a href="?delete=<?php echo $material['material_id']; ?>" 
                                   class="btn btn-danger btn-sm"
                                   onclick="return confirm('Delete this material?')">Delete</a>
                            </div>
                        </div>
                    <?php endwhile; ?>
                </div>
            <?php else: ?>
                <p class="empty-state">No materials uploaded yet</p>
            <?php endif; ?>
        </div>
    </div>

    <?php require_once '../../assets/includes/floating_chat_button.php'; ?>
</body>
</html>
