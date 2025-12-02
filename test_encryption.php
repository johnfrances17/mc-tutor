<?php
/**
 * Test Encryption System
 * Run this script to verify encryption is working correctly
 */

require_once 'config/database.php';
require_once 'assets/includes/chat_encryption.php';

echo "<h1>MC Tutor - Chat Encryption Test</h1>\n\n";

// Test 1: Basic Encryption/Decryption
echo "<h2>Test 1: Basic Encryption/Decryption</h2>\n";
$test_message = "Hello, this is a test message! 🎉";
echo "Original: " . htmlspecialchars($test_message) . "\n\n";

$encrypted = encrypt_message($test_message);
echo "Encrypted: " . htmlspecialchars(substr($encrypted, 0, 50)) . "...\n\n";

$decrypted = decrypt_message($encrypted);
echo "Decrypted: " . htmlspecialchars($decrypted) . "\n\n";

if ($test_message === $decrypted) {
    echo "✅ <strong style='color: green;'>PASS</strong> - Encryption/Decryption works!\n\n";
} else {
    echo "❌ <strong style='color: red;'>FAIL</strong> - Decryption mismatch!\n\n";
}

// Test 2: Special Characters
echo "<h2>Test 2: Special Characters</h2>\n";
$special_chars = "Testing: <script>alert('XSS')</script> & special chars: 你好 مرحبا";
echo "Original: " . htmlspecialchars($special_chars) . "\n\n";

$encrypted2 = encrypt_message($special_chars);
$decrypted2 = decrypt_message($encrypted2);

if ($special_chars === $decrypted2) {
    echo "✅ <strong style='color: green;'>PASS</strong> - Special characters handled correctly!\n\n";
} else {
    echo "❌ <strong style='color: red;'>FAIL</strong> - Special character mismatch!\n\n";
}

// Test 3: Long Message
echo "<h2>Test 3: Long Message</h2>\n";
$long_message = str_repeat("This is a very long message that will test the encryption system's ability to handle large texts. ", 100);
echo "Original length: " . strlen($long_message) . " bytes\n\n";

$encrypted3 = encrypt_message($long_message);
$decrypted3 = decrypt_message($encrypted3);

if ($long_message === $decrypted3) {
    echo "✅ <strong style='color: green;'>PASS</strong> - Long messages work!\n\n";
} else {
    echo "❌ <strong style='color: red;'>FAIL</strong> - Long message mismatch!\n\n";
}

// Test 4: Empty Message
echo "<h2>Test 4: Empty Message Handling</h2>\n";
$empty = encrypt_message("");
if ($empty === false) {
    echo "✅ <strong style='color: green;'>PASS</strong> - Empty messages rejected correctly!\n\n";
} else {
    echo "❌ <strong style='color: red;'>FAIL</strong> - Empty message should return false!\n\n";
}

// Test 5: Hash Verification
echo "<h2>Test 5: Message Integrity (Hash)</h2>\n";
$crypto = new ChatEncryption();
$message = "Test message for hashing";
$hash = $crypto->hashMessage($message);
echo "Hash: " . htmlspecialchars($hash) . "\n\n";

if ($crypto->verifyHash($message, $hash)) {
    echo "✅ <strong style='color: green;'>PASS</strong> - Hash verification works!\n\n";
} else {
    echo "❌ <strong style='color: red;'>FAIL</strong> - Hash verification failed!\n\n";
}

// Test 6: Database Integration
echo "<h2>Test 6: Database Integration</h2>\n";
if (isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];
    
    // Check if user has any sessions
    $session_check = $conn->query("SELECT session_id FROM sessions 
                                   WHERE tutor_id = $user_id OR tutee_id = $user_id 
                                   LIMIT 1");
    
    if ($session_check->num_rows > 0) {
        $session = $session_check->fetch_assoc();
        $session_id = $session['session_id'];
        
        // Insert test encrypted message
        $test_msg = "Test encrypted message at " . date('Y-m-d H:i:s');
        $encrypted_test = encrypt_message($test_msg);
        $encrypted_test = $conn->real_escape_string($encrypted_test);
        
        $insert = $conn->query("INSERT INTO chat_messages (session_id, sender_id, message, is_read) 
                               VALUES ($session_id, $user_id, '$encrypted_test', 1)");
        
        if ($insert) {
            $inserted_id = $conn->insert_id;
            
            // Retrieve and decrypt
            $retrieve = $conn->query("SELECT message FROM chat_messages WHERE chat_id = $inserted_id");
            $retrieved = $retrieve->fetch_assoc();
            $decrypted_from_db = decrypt_message($retrieved['message']);
            
            // Clean up test message
            $conn->query("DELETE FROM chat_messages WHERE chat_id = $inserted_id");
            
            if ($test_msg === $decrypted_from_db) {
                echo "✅ <strong style='color: green;'>PASS</strong> - Database encryption/decryption works!\n\n";
            } else {
                echo "❌ <strong style='color: red;'>FAIL</strong> - Database decryption mismatch!\n\n";
            }
        } else {
            echo "⚠️ <strong style='color: orange;'>SKIP</strong> - Could not insert test message\n\n";
        }
    } else {
        echo "⚠️ <strong style='color: orange;'>SKIP</strong> - No sessions found for testing\n\n";
    }
} else {
    echo "⚠️ <strong style='color: orange;'>SKIP</strong> - Not logged in (run from messenger page)\n\n";
}

// Summary
echo "<h2>Test Summary</h2>\n";
echo "All core encryption tests completed. Check results above.\n";
echo "\n<p><a href='main/shared/messenger.php'>← Back to Chat Room</a></p>\n";

?>
<style>
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        max-width: 800px;
        margin: 50px auto;
        padding: 20px;
        background: #f5f5f5;
    }
    h1 {
        color: #667eea;
    }
    h2 {
        color: #333;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 2px solid #ddd;
    }
    pre {
        background: #fff;
        padding: 15px;
        border-radius: 5px;
        overflow-x: auto;
    }
</style>
