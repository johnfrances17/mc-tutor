<?php
/**
 * Chat Encryption System for MC Tutor
 * Provides end-to-end encryption for chat messages
 * Compatible with cloud deployment (Vercel + Supabase)
 * 
 * Uses AES-256-GCM encryption for secure message storage
 */

class ChatEncryption {
    private $encryption_key;
    private $cipher_method = 'aes-256-gcm';
    
    /**
     * Initialize encryption with environment-based key
     */
    public function __construct() {
        // Use environment variable for production (Vercel)
        // Fallback to config for local development
        $this->encryption_key = getenv('CHAT_ENCRYPTION_KEY') ?: $this->getLocalKey();
    }
    
    /**
     * Get encryption key from local config file
     * For production, use environment variables
     */
    private function getLocalKey() {
        $key_file = __DIR__ . '/../../config/encryption_key.php';
        
        if (!file_exists($key_file)) {
            // Generate new key if doesn't exist
            $new_key = $this->generateKey();
            $this->saveKey($new_key);
            return $new_key;
        }
        
        return require $key_file;
    }
    
    /**
     * Generate a secure encryption key
     */
    public function generateKey() {
        return base64_encode(random_bytes(32));
    }
    
    /**
     * Save encryption key to config file
     */
    private function saveKey($key) {
        $key_file = __DIR__ . '/../../config/encryption_key.php';
        $content = "<?php\n// Auto-generated encryption key - DO NOT COMMIT TO GIT\n";
        $content .= "// Add this file to .gitignore\n";
        $content .= "return '" . $key . "';\n";
        
        if (!file_exists(dirname($key_file))) {
            mkdir(dirname($key_file), 0755, true);
        }
        
        file_put_contents($key_file, $content);
        chmod($key_file, 0600); // Restrict file permissions
    }
    
    /**
     * Encrypt a message
     * 
     * @param string $message The plaintext message
     * @return string|false The encrypted message with IV and tag, or false on failure
     */
    public function encrypt($message) {
        if (empty($message)) {
            return false;
        }
        
        try {
            $key = base64_decode($this->encryption_key);
            $iv = random_bytes(openssl_cipher_iv_length($this->cipher_method));
            $tag = '';
            
            $encrypted = openssl_encrypt(
                $message,
                $this->cipher_method,
                $key,
                OPENSSL_RAW_DATA,
                $iv,
                $tag,
                '',
                16
            );
            
            if ($encrypted === false) {
                error_log("Encryption failed: " . openssl_error_string());
                return false;
            }
            
            // Combine IV + encrypted data + tag and encode
            $result = base64_encode($iv . $encrypted . $tag);
            
            return $result;
            
        } catch (Exception $e) {
            error_log("Encryption error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Decrypt a message
     * 
     * @param string $encrypted_message The encrypted message
     * @return string|false The decrypted message, or false on failure
     */
    public function decrypt($encrypted_message) {
        if (empty($encrypted_message)) {
            return false;
        }
        
        try {
            $key = base64_decode($this->encryption_key);
            $data = base64_decode($encrypted_message);
            
            if ($data === false) {
                return false;
            }
            
            $iv_length = openssl_cipher_iv_length($this->cipher_method);
            $tag_length = 16;
            
            // Extract IV, encrypted data, and tag
            $iv = substr($data, 0, $iv_length);
            $tag = substr($data, -$tag_length);
            $encrypted = substr($data, $iv_length, -$tag_length);
            
            $decrypted = openssl_decrypt(
                $encrypted,
                $this->cipher_method,
                $key,
                OPENSSL_RAW_DATA,
                $iv,
                $tag
            );
            
            if ($decrypted === false) {
                error_log("Decryption failed: " . openssl_error_string());
                return false;
            }
            
            return $decrypted;
            
        } catch (Exception $e) {
            error_log("Decryption error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Hash a message for verification (one-way)
     * Useful for message integrity checking
     * 
     * @param string $message The message to hash
     * @return string The hash
     */
    public function hashMessage($message) {
        return hash_hmac('sha256', $message, $this->encryption_key);
    }
    
    /**
     * Verify message integrity
     * 
     * @param string $message The original message
     * @param string $hash The hash to verify against
     * @return bool True if valid
     */
    public function verifyHash($message, $hash) {
        return hash_equals($this->hashMessage($message), $hash);
    }
}

/**
 * Helper function to get encryption instance
 */
function get_chat_encryption() {
    static $instance = null;
    if ($instance === null) {
        $instance = new ChatEncryption();
    }
    return $instance;
}

/**
 * Quick encrypt function
 */
function encrypt_message($message) {
    return get_chat_encryption()->encrypt($message);
}

/**
 * Quick decrypt function
 */
function decrypt_message($encrypted_message) {
    return get_chat_encryption()->decrypt($encrypted_message);
}
?>
