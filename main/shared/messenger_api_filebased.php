<?php
/**
 * Messenger API - File-Based Chat System
 * Handles all chat operations using JSON files
 */

require_once '../../config/database.php';
require_once '../../assets/includes/chat_encryption.php';
require_once 'ChatManager.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit();
}

$user_id = $_SESSION['user_id'];

// Get current user's student_id
$user_query = $conn->query("SELECT student_id, full_name FROM users WHERE user_id = $user_id");
$current_user = $user_query->fetch_assoc();
$my_student_id = $current_user['student_id'];

// Initialize ChatManager
$chatManager = new ChatManager($conn);

// Get request data
$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';

try {
    switch ($action) {
        case 'send':
            // Send a message
            $receiver_user_id = intval($data['receiver_id']);
            $message = $data['message'] ?? '';
            
            if (empty($message)) {
                throw new Exception('Message cannot be empty');
            }
            
            // Get receiver's student_id
            $receiver_query = $conn->query("SELECT student_id FROM users WHERE user_id = $receiver_user_id");
            $receiver = $receiver_query->fetch_assoc();
            $receiver_student_id = $receiver['student_id'];
            
            // Send message
            $result = $chatManager->sendMessage($my_student_id, $receiver_student_id, $message, true);
            
            echo json_encode([
                'success' => true,
                'message' => [
                    'message_id' => $result['message']['message_id'],
                    'sender_student_id' => $my_student_id,
                    'sender_name' => $current_user['full_name'],
                    'message' => htmlspecialchars($message),
                    'timestamp' => $result['message']['timestamp'],
                    'is_own' => true
                ]
            ]);
            break;
            
        case 'fetch':
            // Fetch messages
            $other_user_id = intval($data['other_user_id']);
            
            // Get other user's student_id
            $other_query = $conn->query("SELECT student_id FROM users WHERE user_id = $other_user_id");
            $other_user = $other_query->fetch_assoc();
            $other_student_id = $other_user['student_id'];
            
            // Get messages
            $messages = $chatManager->getMessages($my_student_id, $other_student_id, true);
            
            // Format messages
            $formatted_messages = [];
            foreach ($messages as $msg) {
                $formatted_messages[] = [
                    'message_id' => $msg['message_id'],
                    'sender_student_id' => $msg['sender_student_id'],
                    'sender_name' => $msg['sender_name'],
                    'message' => htmlspecialchars($msg['message']),
                    'timestamp' => $msg['timestamp'],
                    'is_read' => $msg['is_read'],
                    'is_own' => $msg['sender_student_id'] === $my_student_id
                ];
            }
            
            echo json_encode([
                'success' => true,
                'messages' => $formatted_messages
            ]);
            break;
            
        case 'mark_read':
            // Mark messages as read
            $sender_user_id = intval($data['sender_id']);
            
            // Get sender's student_id
            $sender_query = $conn->query("SELECT student_id FROM users WHERE user_id = $sender_user_id");
            $sender = $sender_query->fetch_assoc();
            $sender_student_id = $sender['student_id'];
            
            // Mark as read
            $chatManager->markAsRead($my_student_id, $sender_student_id);
            
            echo json_encode(['success' => true]);
            break;
            
        case 'get_unread':
            // Get unread count
            $other_user_id = intval($data['other_user_id']);
            
            // Get other user's student_id
            $other_query = $conn->query("SELECT student_id FROM users WHERE user_id = $other_user_id");
            $other_user = $other_query->fetch_assoc();
            $other_student_id = $other_user['student_id'];
            
            $unread_count = $chatManager->getUnreadCount($my_student_id, $other_student_id);
            
            echo json_encode([
                'success' => true,
                'unread_count' => $unread_count
            ]);
            break;
            
        default:
            throw new Exception('Invalid action');
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
