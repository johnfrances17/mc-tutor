<?php
// Floating Chat Button Component
// Include this at the bottom of every page (before </body>)

// Get unread message count
$chat_user_id = $_SESSION['user_id'] ?? 0;
if ($chat_user_id > 0) {
    $unread_sql = "SELECT COUNT(*) as unread FROM chat_messages cm
                  WHERE cm.sender_id != $chat_user_id 
                  AND cm.is_read = 0
                  AND EXISTS (
                      SELECT 1 FROM sessions s 
                      WHERE s.session_id = cm.session_id 
                      AND (s.tutor_id = $chat_user_id OR s.tutee_id = $chat_user_id)
                  )";
    $unread_result = $conn->query($unread_sql);
    $unread_count = $unread_result ? $unread_result->fetch_assoc()['unread'] : 0;
} else {
    $unread_count = 0;
}
?>

<!-- Floating Chat Button -->
<button class="floating-chat-btn" onclick="window.location.href='<?php 
    $current_path = $_SERVER['PHP_SELF'];
    if (strpos($current_path, '/tutor/') !== false) {
        echo '../shared/messenger.php';
    } elseif (strpos($current_path, '/student/') !== false) {
        echo '../shared/messenger.php';
    } elseif (strpos($current_path, '/admin/') !== false) {
        echo '../shared/messenger.php';
    } elseif (strpos($current_path, '/shared/') !== false) {
        echo 'messenger.php';
    } elseif (strpos($current_path, '/main/') !== false) {
        echo 'shared/messenger.php';
    } else {
        echo 'main/shared/messenger.php';
    }
?>'" title="Open Chat Room">
    💬
    <?php if ($unread_count > 0): ?>
        <span class="chat-badge"><?php echo $unread_count > 99 ? '99+' : $unread_count; ?></span>
    <?php endif; ?>
</button>
