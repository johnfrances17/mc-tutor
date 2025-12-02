<?php
/**
 * Notification Manager - File-Based Notification System
 * Manages user notifications stored as JSON files
 * Structure: notifications/{student_id}/notifications.json
 */

class NotificationManager {
    private $notifications_dir;
    private $conn;
    
    public function __construct($db_connection) {
        $this->notifications_dir = __DIR__ . '/notifications/';
        $this->conn = $db_connection;
        
        // Ensure directory exists
        if (!is_dir($this->notifications_dir)) {
            mkdir($this->notifications_dir, 0755, true);
        }
    }
    
    /**
     * Get notification file path for a user
     * Structure: notifications/{student_id}/notifications.json
     */
    private function getNotificationFilePath($student_id) {
        $user_dir = $this->notifications_dir . $student_id . '/';
        
        // Create user folder if doesn't exist
        if (!is_dir($user_dir)) {
            mkdir($user_dir, 0755, true);
        }
        
        return $user_dir . 'notifications.json';
    }
    
    /**
     * Load notifications for a user
     */
    private function loadNotifications($student_id) {
        $file_path = $this->getNotificationFilePath($student_id);
        
        if (file_exists($file_path)) {
            $content = file_get_contents($file_path);
            return json_decode($content, true);
        }
        
        // Create new notification file
        $data = [
            'student_id' => $student_id,
            'notifications' => [],
            'created_at' => date('Y-m-d H:i:s'),
            'last_updated' => date('Y-m-d H:i:s')
        ];
        
        file_put_contents($file_path, json_encode($data, JSON_PRETTY_PRINT));
        return $data;
    }
    
    /**
     * Save notifications to file
     */
    private function saveNotifications($student_id, $data) {
        $file_path = $this->getNotificationFilePath($student_id);
        $data['last_updated'] = date('Y-m-d H:i:s');
        return file_put_contents($file_path, json_encode($data, JSON_PRETTY_PRINT));
    }
    
    /**
     * Add notification for a user
     */
    public function addNotification($student_id, $message, $type = 'general', $related_id = null) {
        $data = $this->loadNotifications($student_id);
        
        // Generate unique notification ID
        $notification_id = count($data['notifications']) + 1;
        
        $notification = [
            'notification_id' => $notification_id,
            'message' => $message,
            'type' => $type, // session_request, session_confirmed, session_cancelled, feedback, general
            'related_id' => $related_id,
            'is_read' => false,
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        // Add to beginning (newest first)
        array_unshift($data['notifications'], $notification);
        
        $this->saveNotifications($student_id, $data);
        
        return [
            'success' => true,
            'notification_id' => $notification_id
        ];
    }
    
    /**
     * Get all notifications for a user
     */
    public function getNotifications($student_id, $limit = null, $unread_only = false) {
        $data = $this->loadNotifications($student_id);
        $notifications = $data['notifications'];
        
        // Filter unread only
        if ($unread_only) {
            $notifications = array_filter($notifications, function($n) {
                return !$n['is_read'];
            });
        }
        
        // Apply limit
        if ($limit) {
            $notifications = array_slice($notifications, 0, $limit);
        }
        
        return $notifications;
    }
    
    /**
     * Mark notification as read
     */
    public function markAsRead($student_id, $notification_id) {
        $data = $this->loadNotifications($student_id);
        
        foreach ($data['notifications'] as &$notification) {
            if ($notification['notification_id'] == $notification_id) {
                $notification['is_read'] = true;
                break;
            }
        }
        
        $this->saveNotifications($student_id, $data);
        
        return ['success' => true];
    }
    
    /**
     * Mark all notifications as read
     */
    public function markAllAsRead($student_id) {
        $data = $this->loadNotifications($student_id);
        
        foreach ($data['notifications'] as &$notification) {
            $notification['is_read'] = true;
        }
        
        $this->saveNotifications($student_id, $data);
        
        return ['success' => true];
    }
    
    /**
     * Get unread count
     */
    public function getUnreadCount($student_id) {
        $data = $this->loadNotifications($student_id);
        
        $count = 0;
        foreach ($data['notifications'] as $notification) {
            if (!$notification['is_read']) {
                $count++;
            }
        }
        
        return $count;
    }
    
    /**
     * Delete notification
     */
    public function deleteNotification($student_id, $notification_id) {
        $data = $this->loadNotifications($student_id);
        
        $data['notifications'] = array_filter($data['notifications'], function($n) use ($notification_id) {
            return $n['notification_id'] != $notification_id;
        });
        
        // Re-index array
        $data['notifications'] = array_values($data['notifications']);
        
        $this->saveNotifications($student_id, $data);
        
        return ['success' => true];
    }
    
    /**
     * Clear all notifications
     */
    public function clearAll($student_id) {
        $data = $this->loadNotifications($student_id);
        $data['notifications'] = [];
        $this->saveNotifications($student_id, $data);
        
        return ['success' => true];
    }
    
    /**
     * Get student_id from user_id (for backward compatibility)
     */
    private function getStudentId($user_id) {
        $sql = "SELECT student_id FROM users WHERE user_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            return $row['student_id'];
        }
        
        return null;
    }
    
    /**
     * Add notification by user_id (for backward compatibility)
     */
    public function addNotificationByUserId($user_id, $message, $type = 'general', $related_id = null) {
        $student_id = $this->getStudentId($user_id);
        if ($student_id) {
            return $this->addNotification($student_id, $message, $type, $related_id);
        }
        return ['success' => false, 'error' => 'User not found'];
    }
}
?>
