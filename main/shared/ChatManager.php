<?php
/**
 * Chat Manager - File-Based Chat System
 * Manages peer-to-peer conversations stored as JSON files
 * Each conversation: {student_id1}-{student_id2}.json
 */

class ChatManager {
    private $chats_dir;
    private $metadata_file;
    private $conn;
    
    public function __construct($db_connection) {
        $this->chats_dir = __DIR__ . '/chats/';
        $this->metadata_file = $this->chats_dir . 'metadata.json';
        $this->conn = $db_connection;
        
        // Ensure directory exists
        if (!is_dir($this->chats_dir)) {
            mkdir($this->chats_dir, 0755, true);
        }
        
        // Ensure metadata exists
        if (!file_exists($this->metadata_file)) {
            file_put_contents($this->metadata_file, json_encode([
                'conversations' => [],
                'last_updated' => date('Y-m-d H:i:s')
            ]));
        }
    }
    
    /**
     * Get conversation ID from two student IDs
     * Always returns: LEAST-GREATEST format
     */
    private function getConversationId($student_id_1, $student_id_2) {
        $ids = [$student_id_1, $student_id_2];
        sort($ids);
        return implode('-', $ids);
    }
    
    /**
     * Get chat file path for a conversation
     * New structure: chats/{id1-id2}/messages.json
     */
    private function getChatFilePath($student_id_1, $student_id_2) {
        $conv_id = $this->getConversationId($student_id_1, $student_id_2);
        $conv_dir = $this->chats_dir . $conv_id . '/';
        
        // Create conversation folder if doesn't exist
        if (!is_dir($conv_dir)) {
            mkdir($conv_dir, 0755, true);
        }
        
        return $conv_dir . 'messages.json';
    }
    
    /**
     * Load conversation from file
     * Returns array or creates new if doesn't exist
     */
    public function loadConversation($student_id_1, $student_id_2) {
        $file_path = $this->getChatFilePath($student_id_1, $student_id_2);
        
        if (file_exists($file_path)) {
            $content = file_get_contents($file_path);
            return json_decode($content, true);
        }
        
        // Create new conversation structure
        $conv_id = $this->getConversationId($student_id_1, $student_id_2);
        $new_conversation = [
            'conversation_id' => $conv_id,
            'participants' => [
                'student_id_1' => min($student_id_1, $student_id_2),
                'student_id_2' => max($student_id_1, $student_id_2)
            ],
            'created_at' => date('Y-m-d H:i:s'),
            'last_message_at' => null,
            'is_encrypted' => true,
            'messages' => []
        ];
        
        // Save new conversation
        file_put_contents($file_path, json_encode($new_conversation, JSON_PRETTY_PRINT));
        
        // Update metadata
        $this->updateMetadata($conv_id, $student_id_1, $student_id_2);
        
        return $new_conversation;
    }
    
    /**
     * Send a message to conversation
     */
    public function sendMessage($sender_student_id, $receiver_student_id, $message_text, $encrypt = true) {
        // Load conversation
        $conversation = $this->loadConversation($sender_student_id, $receiver_student_id);
        
        // Get sender info
        $sender_info = $this->getUserInfo($sender_student_id);
        
        // Encrypt message if needed
        $message_content = $encrypt ? encrypt_message($message_text) : $message_text;
        
        // Create message
        $new_message = [
            'message_id' => count($conversation['messages']) + 1,
            'sender_student_id' => $sender_student_id,
            'sender_name' => $sender_info['full_name'],
            'message' => $message_content,
            'message_type' => 'text',
            'is_read' => false,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        // Add to conversation
        $conversation['messages'][] = $new_message;
        $conversation['last_message_at'] = $new_message['timestamp'];
        
        // Save conversation
        $file_path = $this->getChatFilePath($sender_student_id, $receiver_student_id);
        file_put_contents($file_path, json_encode($conversation, JSON_PRETTY_PRINT));
        
        return [
            'success' => true,
            'message' => $new_message
        ];
    }
    
    /**
     * Get all messages in a conversation
     */
    public function getMessages($student_id_1, $student_id_2, $decrypt = true) {
        $conversation = $this->loadConversation($student_id_1, $student_id_2);
        
        if (!$decrypt) {
            return $conversation['messages'];
        }
        
        // Decrypt messages
        $decrypted_messages = [];
        foreach ($conversation['messages'] as $msg) {
            $msg_copy = $msg;
            if ($conversation['is_encrypted']) {
                $decrypted = decrypt_message($msg['message']);
                $msg_copy['message'] = $decrypted !== false ? $decrypted : '[Encrypted]';
            }
            $decrypted_messages[] = $msg_copy;
        }
        
        return $decrypted_messages;
    }
    
    /**
     * Mark messages as read
     */
    public function markAsRead($reader_student_id, $sender_student_id) {
        $conversation = $this->loadConversation($reader_student_id, $sender_student_id);
        
        $updated = false;
        foreach ($conversation['messages'] as &$msg) {
            if ($msg['sender_student_id'] === $sender_student_id && !$msg['is_read']) {
                $msg['is_read'] = true;
                $updated = true;
            }
        }
        
        if ($updated) {
            $file_path = $this->getChatFilePath($reader_student_id, $sender_student_id);
            file_put_contents($file_path, json_encode($conversation, JSON_PRETTY_PRINT));
        }
        
        return ['success' => true];
    }
    
    /**
     * Get unread count for a user
     */
    public function getUnreadCount($my_student_id, $other_student_id) {
        $conversation = $this->loadConversation($my_student_id, $other_student_id);
        
        $count = 0;
        foreach ($conversation['messages'] as $msg) {
            if ($msg['sender_student_id'] === $other_student_id && !$msg['is_read']) {
                $count++;
            }
        }
        
        return $count;
    }
    
    /**
     * Get all conversations for a user
     */
    public function getAllConversations($my_student_id) {
        $metadata = json_decode(file_get_contents($this->metadata_file), true);
        $conversations = [];
        
        foreach ($metadata['conversations'] as $conv) {
            // Check if user is participant
            if ($conv['participant1_student_id'] === $my_student_id || 
                $conv['participant2_student_id'] === $my_student_id) {
                
                // Determine other user
                $other_student_id = $conv['participant1_student_id'] === $my_student_id ? 
                    $conv['participant2_student_id'] : $conv['participant1_student_id'];
                
                // Load conversation file
                $conversation = $this->loadConversation($my_student_id, $other_student_id);
                
                // Get other user info
                $other_user_info = $this->getUserInfo($other_student_id);
                
                // Get last message
                $last_message = !empty($conversation['messages']) ? 
                    end($conversation['messages']) : null;
                
                // Get unread count
                $unread_count = $this->getUnreadCount($my_student_id, $other_student_id);
                
                // Get active subject (if any upcoming session)
                $active_subject = $this->getActiveSubject($my_student_id, $other_student_id);
                
                $conversations[] = [
                    'conversation_id' => $conversation['conversation_id'],
                    'other_user' => $other_user_info,
                    'last_message' => $last_message,
                    'last_message_at' => $conversation['last_message_at'],
                    'unread_count' => $unread_count,
                    'active_subject' => $active_subject
                ];
            }
        }
        
        // Sort by last message time
        usort($conversations, function($a, $b) {
            return strtotime($b['last_message_at'] ?? '1970-01-01') - 
                   strtotime($a['last_message_at'] ?? '1970-01-01');
        });
        
        return $conversations;
    }
    
    /**
     * Update metadata file
     */
    private function updateMetadata($conversation_id, $student_id_1, $student_id_2) {
        $metadata = json_decode(file_get_contents($this->metadata_file), true);
        
        // Check if conversation exists
        $exists = false;
        foreach ($metadata['conversations'] as $conv) {
            if ($conv['conversation_id'] === $conversation_id) {
                $exists = true;
                break;
            }
        }
        
        if (!$exists) {
            $metadata['conversations'][] = [
                'conversation_id' => $conversation_id,
                'participant1_student_id' => min($student_id_1, $student_id_2),
                'participant2_student_id' => max($student_id_1, $student_id_2),
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            $metadata['last_updated'] = date('Y-m-d H:i:s');
            file_put_contents($this->metadata_file, json_encode($metadata, JSON_PRETTY_PRINT));
        }
    }
    
    /**
     * Get user info from database
     */
    private function getUserInfo($student_id) {
        $stmt = $this->conn->prepare("SELECT user_id, student_id, full_name, role, profile_picture 
                                      FROM users WHERE student_id = ?");
        $stmt->bind_param("s", $student_id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
    
    /**
     * Get active subject for upcoming session
     */
    private function getActiveSubject($student_id_1, $student_id_2) {
        // Get user_ids
        $user1 = $this->getUserInfo($student_id_1);
        $user2 = $this->getUserInfo($student_id_2);
        
        if (!$user1 || !$user2) return null;
        
        $user_id_1 = $user1['user_id'];
        $user_id_2 = $user2['user_id'];
        
        // Query for UPCOMING confirmed session
        $sql = "SELECT s.*, subj.subject_code, subj.subject_name
                FROM sessions s
                JOIN subjects subj ON s.subject_id = subj.subject_id
                WHERE ((s.tutor_id = ? AND s.tutee_id = ?)
                       OR (s.tutee_id = ? AND s.tutor_id = ?))
                AND s.status = 'confirmed'
                AND CONCAT(s.session_date, ' ', s.start_time) > NOW()
                ORDER BY s.session_date ASC, s.start_time ASC
                LIMIT 1";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("iiii", $user_id_1, $user_id_2, $user_id_1, $user_id_2);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $session = $result->fetch_assoc();
            return [
                'subject_code' => $session['subject_code'],
                'subject_name' => $session['subject_name'],
                'session_date' => $session['session_date'],
                'start_time' => $session['start_time']
            ];
        }
        
        return null;
    }
    
    /**
     * Delete a conversation (admin function)
     */
    public function deleteConversation($student_id_1, $student_id_2) {
        $file_path = $this->getChatFilePath($student_id_1, $student_id_2);
        
        if (file_exists($file_path)) {
            unlink($file_path);
            
            // Update metadata
            $conv_id = $this->getConversationId($student_id_1, $student_id_2);
            $metadata = json_decode(file_get_contents($this->metadata_file), true);
            
            $metadata['conversations'] = array_filter($metadata['conversations'], function($conv) use ($conv_id) {
                return $conv['conversation_id'] !== $conv_id;
            });
            
            $metadata['last_updated'] = date('Y-m-d H:i:s');
            file_put_contents($this->metadata_file, json_encode($metadata, JSON_PRETTY_PRINT));
            
            return ['success' => true];
        }
        
        return ['success' => false, 'error' => 'Conversation not found'];
    }
}
?>
