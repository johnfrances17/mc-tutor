<?php
require_once '../config/database.php';
require_once '../assets/includes/pin_encryption.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: ../index.php');
    exit();
}

$user_id = $_SESSION['user_id'];
$role = $_SESSION['role'];
$pin_system = get_pin_encryption($user_id, $conn);

$success = '';
$error = '';

// Handle PIN setup
if (isset($_POST['setup_pin'])) {
    $new_pin = $_POST['new_pin'];
    $confirm_pin = $_POST['confirm_pin'];
    
    if ($new_pin !== $confirm_pin) {
        $error = 'PINs do not match';
    } else {
        $result = $pin_system->setPin($new_pin);
        if ($result['success']) {
            $success = 'Chat PIN set successfully! Your messages are now protected.';
        } else {
            $error = $result['error'];
        }
    }
}

// Handle PIN disable
if (isset($_POST['disable_pin'])) {
    $result = $pin_system->disablePin($_POST['current_pin']);
    if ($result['success']) {
        $success = 'Chat PIN removed successfully';
    } else {
        $error = $result['error'];
    }
}

$has_pin = $pin_system->hasPinEnabled();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Security Settings - MC Tutor</title>
    <link rel="stylesheet" href="../assets/css/style.php">
</head>
<body>
    <header>
        <div class="header-content">
            <div class="logo">
                <h1>MC Tutor - <?php echo ucfirst($role); ?> Panel</h1>
                <p>Cloud-Based Peer Tutoring Platform</p>
            </div>
            <div class="user-info">
                <span>Welcome, <?php echo $_SESSION['full_name']; ?></span>
                <a href="profile.php" class="logout-btn" style="background-color: #667eea; margin-right: 10px;">Profile</a>
                <a href="<?php echo $role; ?>/dashboard.php" class="logout-btn" style="background-color: #28a745; margin-right: 10px;">Dashboard</a>
                <a href="logout.php" class="logout-btn">Logout</a>
            </div>
        </div>
    </header>

    <div class="container">
        <div class="card">
            <h2>🔒 Chat Security Settings</h2>
            <p style="color: #666; margin-bottom: 20px;">
                Protect your chat history with a 4-digit PIN. Once enabled, you'll need to enter your PIN to access the Chat Room.
            </p>

            <?php if ($success): ?>
                <div class="alert alert-success"><?php echo $success; ?></div>
            <?php endif; ?>

            <?php if ($error): ?>
                <div class="alert alert-danger"><?php echo $error; ?></div>
            <?php endif; ?>

            <?php if (!$has_pin): ?>
                <!-- Setup PIN -->
                <div class="card">
                    <h3>Setup Chat PIN</h3>
                    <p style="color: #666; margin-bottom: 20px;">
                        Choose a 4-digit PIN to protect your chat history.
                    </p>
                    
                    <form method="POST" action="">
                        <div class="form-row">
                            <div class="form-group">
                                <label>New PIN (4 digits)</label>
                                <input type="password" name="new_pin" pattern="\d{4}" maxlength="4" 
                                       placeholder="Enter 4-digit PIN" required>
                            </div>
                            <div class="form-group">
                                <label>Confirm PIN</label>
                                <input type="password" name="confirm_pin" pattern="\d{4}" maxlength="4" 
                                       placeholder="Re-enter PIN" required>
                            </div>
                        </div>
                        <button type="submit" name="setup_pin" class="btn btn-primary">
                            🔐 Enable Chat PIN Protection
                        </button>
                    </form>
                </div>

                <div class="card" style="background: #f8f9fa;">
                    <h4>Notes</h4>
                    <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
                        <li>Your PIN is securely hashed and cannot be recovered</li>
                        <li>No expiry time - access your messages whenever you want</li>
                        <li>Past messages will be hidden until you enter your PIN</li>
                    </ul>
                </div>

            <?php else: ?>
                <!-- PIN is enabled -->
                <div class="card">
                    <h3>✅ Chat PIN Protection Active</h3>
                    <p style="color: #666; margin-bottom: 20px;">
                        Your chat history is protected. You'll need to enter your PIN when accessing the Chat Room.
                    </p>
                    
                    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <a href="shared/messenger.php" class="btn btn-success">
                            💬 Go to Chat Room
                        </a>
                        <button type="button" class="btn btn-warning" onclick="document.getElementById('disableForm').style.display='block'">
                            🔓 Disable PIN Protection
                        </button>
                    </div>
                </div>

                <!-- Disable PIN Form (hidden by default) -->
                <div id="disableForm" style="display: none; margin-top: 20px;">
                    <div class="card">
                        <h3>Disable PIN Protection</h3>
                        <p style="color: #666; margin-bottom: 20px;">
                            Enter your current PIN to disable protection.
                        </p>
                        
                        <form method="POST" action="">
                            <div class="form-group">
                                <label>Current PIN</label>
                                <input type="password" name="current_pin" pattern="\d{4}" maxlength="4" 
                                       placeholder="Enter your 4-digit PIN" required>
                            </div>
                            <button type="submit" name="disable_pin" class="btn btn-danger">
                                Remove PIN Protection
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="document.getElementById('disableForm').style.display='none'" style="margin-left: 10px;">
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            <?php endif; ?>

            <div style="margin-top: 30px; text-align: center;">
                <a href="profile.php" class="btn btn-secondary">← Back to Profile</a>
            </div>
        </div>
    </div>

    <?php require_once '../assets/includes/floating_chat_button.php'; ?>
</body>
</html>
