<?php
/**
 * PIN-Based Chat Encryption System
 * Users can optionally set a 4-digit PIN to encrypt their chat history
 * No expiry - messages remain encrypted until PIN is entered
 */

class PinChatEncryption {
    private $user_id;
    private $conn;
    
    public function __construct($user_id, $conn) {
        $this->user_id = $user_id;
        $this->conn = $conn;
    }
    
    /**
     * Check if user has PIN encryption enabled
     */
    public function hasPinEnabled() {
        $result = $this->conn->query("SELECT chat_pin_hash FROM users WHERE user_id = {$this->user_id}");
        if ($result && $row = $result->fetch_assoc()) {
            return !empty($row['chat_pin_hash']);
        }
        return false;
    }
    
    /**
     * Set user's chat PIN
     */
    public function setPin($pin) {
        if (!preg_match('/^\d{4}$/', $pin)) {
            return ['success' => false, 'error' => 'PIN must be exactly 4 digits'];
        }
        
        $pin_hash = password_hash($pin, PASSWORD_BCRYPT);
        $pin_hash = $this->conn->real_escape_string($pin_hash);
        
        $update = $this->conn->query("UPDATE users SET chat_pin_hash = '$pin_hash' WHERE user_id = {$this->user_id}");
        
        if ($update) {
            $_SESSION['chat_pin_verified'] = true;
            $_SESSION['chat_pin_time'] = time();
            return ['success' => true];
        }
        
        return ['success' => false, 'error' => 'Failed to set PIN'];
    }
    
    /**
     * Verify PIN
     */
    public function verifyPin($pin) {
        if (!preg_match('/^\d{4}$/', $pin)) {
            return ['success' => false, 'error' => 'Invalid PIN format'];
        }
        
        $result = $this->conn->query("SELECT chat_pin_hash FROM users WHERE user_id = {$this->user_id}");
        if ($result && $row = $result->fetch_assoc()) {
            if (password_verify($pin, $row['chat_pin_hash'])) {
                $_SESSION['chat_pin_verified'] = true;
                $_SESSION['chat_pin_time'] = time();
                return ['success' => true];
            }
        }
        
        return ['success' => false, 'error' => 'Incorrect PIN'];
    }
    
    /**
     * Check if PIN is currently verified in session
     */
    public function isPinVerified() {
        return isset($_SESSION['chat_pin_verified']) && $_SESSION['chat_pin_verified'] === true;
    }
    
    /**
     * Lock chat (require PIN re-entry)
     */
    public function lockChat() {
        unset($_SESSION['chat_pin_verified']);
        unset($_SESSION['chat_pin_time']);
    }
    
    /**
     * Disable PIN protection
     */
    public function disablePin($current_pin) {
        $verify = $this->verifyPin($current_pin);
        if ($verify['success']) {
            $this->conn->query("UPDATE users SET chat_pin_hash = NULL WHERE user_id = {$this->user_id}");
            $this->lockChat();
            return ['success' => true];
        }
        return $verify;
    }
    
    /**
     * Check if user needs to enter PIN to access chats
     */
    public function needsPinEntry() {
        return $this->hasPinEnabled() && !$this->isPinVerified();
    }
}

// Helper function
function get_pin_encryption($user_id, $conn) {
    return new PinChatEncryption($user_id, $conn);
}
?>
