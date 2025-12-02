<?php
require_once '../../config/database.php';
require_once '../../assets/includes/chat_encryption.php';
require_once '../../assets/includes/pin_encryption.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: ../../index.php');
    exit();
}

$user_id = $_SESSION['user_id'];
$role = $_SESSION['role'];

// Handle PIN verification
$pin_system = get_pin_encryption($user_id, $conn);
$pin_error = '';

if (isset($_POST['verify_pin'])) {
    $result = $pin_system->verifyPin($_POST['pin']);
    if (!$result['success']) {
        $pin_error = $result['error'];
    }
}

if ($pin_system->needsPinEntry()) {
    include 'pin_entry_screen.php';
    exit();
}

// Get all users I have active bookings with or have chatted with
$conversations_sql = "SELECT DISTINCT
    u.user_id,
    u.full_name,
    u.profile_picture,
    u.role as user_role,
    (SELECT s.subject_id FROM sessions s 
     WHERE ((s.tutor_id = $user_id AND s.tutee_id = u.user_id) 
            OR (s.tutee_id = $user_id AND s.tutor_id = u.user_id))
     AND s.status = 'confirmed'
     ORDER BY s.session_date DESC, s.start_time DESC
     LIMIT 1) as active_subject_id,
    (SELECT message FROM chat_messages 
     WHERE (sender_id = $user_id AND receiver_id = u.user_id) 
        OR (sender_id = u.user_id AND receiver_id = $user_id)
     ORDER BY created_at DESC LIMIT 1) as last_message,
    (SELECT created_at FROM chat_messages 
     WHERE (sender_id = $user_id AND receiver_id = u.user_id) 
        OR (sender_id = u.user_id AND receiver_id = $user_id)
     ORDER BY created_at DESC LIMIT 1) as last_message_time,
    (SELECT COUNT(*) FROM chat_messages 
     WHERE sender_id = u.user_id AND receiver_id = $user_id AND is_read = 0) as unread_count
FROM users u
WHERE u.user_id != $user_id
  AND u.role != 'admin'
  AND (
    EXISTS (
        SELECT 1 FROM sessions s
        WHERE ((s.tutor_id = $user_id AND s.tutee_id = u.user_id)
               OR (s.tutee_id = $user_id AND s.tutor_id = u.user_id))
        AND s.status IN ('confirmed', 'completed')
    )
    OR EXISTS (
        SELECT 1 FROM chat_messages cm
        WHERE (cm.sender_id = $user_id AND cm.receiver_id = u.user_id)
           OR (cm.sender_id = u.user_id AND cm.receiver_id = $user_id)
    )
  )
ORDER BY last_message_time DESC";

$conversations = $conn->query($conversations_sql);

// Get subject info if there's an active booking
$selected_user = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
$active_subject = null;

if ($selected_user > 0) {
    $subject_sql = "SELECT subj.subject_code, subj.subject_name
                   FROM sessions s
                   JOIN subjects subj ON s.subject_id = subj.subject_id
                   WHERE ((s.tutor_id = $user_id AND s.tutee_id = $selected_user)
                          OR (s.tutee_id = $user_id AND s.tutor_id = $selected_user))
                   AND s.status = 'confirmed'
                   ORDER BY s.session_date DESC, s.start_time DESC
                   LIMIT 1";
    $subject_result = $conn->query($subject_sql);
    if ($subject_result && $subject_result->num_rows > 0) {
        $active_subject = $subject_result->fetch_assoc();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Room - MC Tutor</title>
    <link rel="stylesheet" href="../../assets/css/style.php">
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #f0f2f5;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .messenger-wrapper {
            padding-top: 120px;
            min-height: 100vh;
        }
        
        .messenger-container {
            display: flex;
            height: calc(100vh - 120px);
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        /* Conversations Sidebar */
        .conversations-sidebar {
            width: 360px;
            border-right: 1px solid #e4e6eb;
            display: flex;
            flex-direction: column;
            background: white;
            padding-top: 0;
        }
        
        .sidebar-header {
            padding: 20px;
            border-bottom: 1px solid #e4e6eb;
            background: white;
            flex-shrink: 0;
        }
        
        .sidebar-header h2 {
            margin: 0;
            font-size: 24px;
            color: #050505;
        }
        
        .conversations-list {
            flex: 1;
            overflow-y: auto;
        }
        
        .conversation-item {
            display: flex;
            align-items: center;
            padding: 12px 20px;
            cursor: pointer;
            transition: background 0.2s;
            border-bottom: 1px solid #f0f2f5;
            text-decoration: none;
            color: inherit;
        }
        
        .conversation-item:hover {
            background: #f2f3f5;
        }
        
        .conversation-item.active {
            background: #e7f3ff;
        }
        
        .conversation-avatar {
            position: relative;
            margin-right: 12px;
        }
        
        .avatar-circle {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: 600;
            overflow: hidden;
        }
        
        .avatar-circle img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .conversation-info {
            flex: 1;
            min-width: 0;
        }
        
        .conversation-name {
            font-weight: 600;
            font-size: 15px;
            color: #050505;
            margin-bottom: 2px;
        }
        
        .conversation-subject {
            font-size: 12px;
            color: #667eea;
            margin-bottom: 2px;
        }
        
        .conversation-preview {
            font-size: 13px;
            color: #65676b;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .conversation-preview.unread {
            color: #050505;
            font-weight: 600;
        }
        
        .conversation-meta {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;
        }
        
        .conversation-time {
            font-size: 12px;
            color: #65676b;
        }
        
        .unread-badge {
            background: #667eea;
            color: white;
            font-size: 12px;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 12px;
            min-width: 20px;
            text-align: center;
        }
        
        /* Chat Area */
        .chat-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: white;
        }
        
        .chat-header {
            padding: 16px 20px;
            border-bottom: 1px solid #e4e6eb;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: white;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            flex-shrink: 0;
        }
        
        .chat-header-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .chat-header-name {
            font-size: 17px;
            font-weight: 600;
            color: #050505;
        }
        
        .chat-header-status {
            font-size: 13px;
            color: #65676b;
        }
        
        .chat-messages-container {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: #f0f2f5;
        }
        
        .message-group {
            display: flex;
            margin-bottom: 16px;
            gap: 8px;
        }
        
        .message-group.own {
            flex-direction: row-reverse;
        }
        
        .message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            font-weight: 600;
            flex-shrink: 0;
            overflow: hidden;
        }
        
        .message-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .message-content {
            display: flex;
            flex-direction: column;
            max-width: 60%;
        }
        
        .message-group.own .message-content {
            align-items: flex-end;
        }
        
        .message-sender-name {
            font-size: 12px;
            font-weight: 600;
            color: #65676b;
            margin-bottom: 4px;
            padding: 0 8px;
        }
        
        .message-group.own .message-sender-name {
            display: none;
        }
        
        .message-bubble {
            padding: 8px 12px;
            border-radius: 18px;
            word-wrap: break-word;
            font-size: 15px;
            line-height: 1.4;
        }
        
        .message-group.own .message-bubble {
            background: #667eea;
            color: white;
        }
        
        .message-group.other .message-bubble {
            background: #e4e6eb;
            color: #050505;
        }
        
        .message-timestamp {
            font-size: 11px;
            color: #65676b;
            margin-top: 4px;
            padding: 0 8px;
        }
        
        .chat-input-container {
            padding: 16px 20px;
            border-top: 1px solid #e4e6eb;
            background: white;
        }
        
        .chat-input-wrapper {
            display: flex;
            align-items: flex-end;
            gap: 12px;
            background: #f0f2f5;
            border-radius: 20px;
            padding: 8px 12px;
        }
        
        .chat-input {
            flex: 1;
            border: none;
            background: transparent;
            resize: none;
            font-size: 15px;
            font-family: inherit;
            min-height: 20px;
            max-height: 100px;
            line-height: 20px;
        }
        
        .chat-input:focus {
            outline: none;
        }
        
        .chat-send-button {
            background: #667eea;
            color: white;
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            flex-shrink: 0;
            transition: background 0.2s;
        }
        
        .chat-send-button:hover {
            background: #5568d3;
        }
        
        .chat-send-button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #65676b;
        }
        
        .empty-state-icon {
            font-size: 64px;
            margin-bottom: 16px;
            opacity: 0.5;
        }
        
        @media (max-width: 768px) {
            .conversations-sidebar {
                width: 100%;
                max-width: 360px;
            }
            
            .messenger-container {
                flex-direction: column;
            }
            
            .chat-area {
                height: 60%;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="header-content">
            <div class="logo">
                <h1>MC Tutor - Chat Room</h1>
                <p>Cloud-Based Peer Tutoring Platform</p>
            </div>
            <div class="user-info">
                <span>Welcome, <?php echo $_SESSION['full_name']; ?></span>
                <a href="../profile.php" class="logout-btn" style="background-color: #667eea; margin-right: 10px;">Profile</a>
                <a href="<?php echo $role == 'tutor' ? '../tutor/dashboard.php' : '../student/dashboard.php'; ?>" class="logout-btn" style="background-color: #28a745; margin-right: 10px;">Dashboard</a>
                <a href="../logout.php" class="logout-btn">Logout</a>
            </div>
        </div>
    </header>

    <div class="messenger-wrapper">
        <div class="messenger-container">
        <!-- Conversations Sidebar -->
        <div class="conversations-sidebar">
            <div class="sidebar-header">
                <h2>Chats</h2>
            </div>
            <div class="conversations-list">
                <?php if ($conversations && $conversations->num_rows > 0): ?>
                    <?php while ($conv = $conversations->fetch_assoc()): 
                        // Get subject info for this conversation
                        $conv_subject = null;
                        if ($conv['active_subject_id']) {
                            $subj_result = $conn->query("SELECT subject_code, subject_name FROM subjects WHERE subject_id = {$conv['active_subject_id']}");
                            if ($subj_result && $subj_result->num_rows > 0) {
                                $conv_subject = $subj_result->fetch_assoc();
                            }
                        }
                    ?>
                        <a href="?user_id=<?php echo $conv['user_id']; ?>" 
                           class="conversation-item <?php echo $selected_user == $conv['user_id'] ? 'active' : ''; ?>">
                            <div class="conversation-avatar">
                                <div class="avatar-circle">
                                    <?php if (!empty($conv['profile_picture'])): ?>
                                        <img src="../../<?php echo $conv['profile_picture']; ?>" alt="Avatar">
                                    <?php else: ?>
                                        <?php echo strtoupper(substr($conv['full_name'], 0, 1)); ?>
                                    <?php endif; ?>
                                </div>
                            </div>
                            <div class="conversation-info">
                                <div class="conversation-name"><?php echo htmlspecialchars($conv['full_name']); ?></div>
                                <?php if ($conv_subject): ?>
                                    <div class="conversation-subject">
                                        <?php echo htmlspecialchars($conv_subject['subject_code'] . ' - ' . $conv_subject['subject_name']); ?>
                                    </div>
                                <?php endif; ?>
                                <div class="conversation-preview <?php echo $conv['unread_count'] > 0 ? 'unread' : ''; ?>">
                                    <?php 
                                    if (!empty($conv['last_message'])) {
                                        $last_msg = decrypt_message($conv['last_message']);
                                        if ($last_msg === false) $last_msg = $conv['last_message'];
                                        echo htmlspecialchars(substr($last_msg, 0, 40)) . (strlen($last_msg) > 40 ? '...' : '');
                                    } else {
                                        echo 'No messages yet';
                                    }
                                    ?>
                                </div>
                            </div>
                            <div class="conversation-meta">
                                <?php if ($conv['last_message_time']): ?>
                                    <span class="conversation-time">
                                        <?php 
                                        $time = strtotime($conv['last_message_time']);
                                        $today = strtotime('today');
                                        echo $time >= $today ? date('g:i A', $time) : date('M j', $time);
                                        ?>
                                    </span>
                                <?php endif; ?>
                                <?php if ($conv['unread_count'] > 0): ?>
                                    <span class="unread-badge"><?php echo $conv['unread_count']; ?></span>
                                <?php endif; ?>
                            </div>
                        </a>
                    <?php endwhile; ?>
                <?php else: ?>
                    <div class="empty-state">
                        <div class="empty-state-icon">💬</div>
                        <p>No conversations yet</p>
                        <p style="font-size: 14px;">Book a session to start chatting</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Chat Area -->
        <div class="chat-area" id="chatArea">
            <?php if ($selected_user > 0): ?>
                <?php
                // Get other user info
                $other_user_sql = "SELECT full_name, profile_picture FROM users WHERE user_id = $selected_user";
                $other_user = $conn->query($other_user_sql)->fetch_assoc();
                ?>
                <div class="chat-header">
                    <div class="chat-header-info">
                        <div class="conversation-avatar">
                            <div class="avatar-circle" style="width: 40px; height: 40px; font-size: 18px;">
                                <?php if (!empty($other_user['profile_picture'])): ?>
                                    <img src="../../<?php echo $other_user['profile_picture']; ?>" alt="Avatar">
                                <?php else: ?>
                                    <?php echo strtoupper(substr($other_user['full_name'], 0, 1)); ?>
                                <?php endif; ?>
                            </div>
                        </div>
                        <div>
                            <div class="chat-header-name"><?php echo htmlspecialchars($other_user['full_name']); ?></div>
                            <?php if ($active_subject): ?>
                                <div class="chat-header-status">
                                    <?php echo htmlspecialchars($active_subject['subject_code'] . ' - ' . $active_subject['subject_name']); ?>
                                </div>
                            <?php endif; ?>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <a href="../chat_security.php" title="Chat Security Settings" style="color: #667eea; text-decoration: none; font-size: 20px;">⚙️</a>
                </div>
            </div>                <div class="chat-messages-container" id="messagesContainer">
                    <div class="empty-state">
                        <div class="empty-state-icon">💬</div>
                        <p>Loading messages...</p>
                    </div>
                </div>
                
                <div class="chat-input-container">
                    <div class="chat-input-wrapper">
                        <textarea 
                            id="messageInput" 
                            class="chat-input" 
                            placeholder="Type a message..." 
                            rows="1"
                            maxlength="1000"></textarea>
                        <button id="sendMessageBtn" class="chat-send-button">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            <?php else: ?>
                <div class="empty-state">
                    <div class="empty-state-icon">💭</div>
                    <p>Select a conversation to start messaging</p>
                </div>
            <?php endif; ?>
        </div>
    </div>
    </div> <!-- End messenger-wrapper -->

    <script>
        const currentUserId = <?php echo $user_id; ?>;
        const otherUserId = <?php echo $selected_user; ?>;

        if (otherUserId > 0) {
            initializeChat();
        }

        function initializeChat() {
            const sendButton = document.getElementById('sendMessageBtn');
            const messageInput = document.getElementById('messageInput');
            
            if (sendButton && messageInput) {
                sendButton.addEventListener('click', sendMessage);
                messageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                });

                messageInput.addEventListener('input', function() {
                    this.style.height = 'auto';
                    this.style.height = (this.scrollHeight) + 'px';
                });

                setInterval(fetchNewMessages, 2000);
                fetchNewMessages();
            }
        }

        async function sendMessage() {
            const messageInput = document.getElementById('messageInput');
            const message = messageInput.value.trim();
            
            if (!message) return;

            const sendButton = document.getElementById('sendMessageBtn');
            sendButton.disabled = true;

            try {
                const response = await fetch('messenger_api_unified.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'send',
                        receiver_id: otherUserId,
                        message: message
                    })
                });

                const result = await response.json();
                
                if (result.success) {
                    messageInput.value = '';
                    messageInput.style.height = 'auto';
                    fetchNewMessages();
                } else {
                    alert(result.error || 'Failed to send message');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to send message');
            } finally {
                sendButton.disabled = false;
                messageInput.focus();
            }
        }

        let lastMessageId = 0;

        async function fetchNewMessages() {
            try {
                const response = await fetch(`messenger_api_unified.php?action=fetch&other_user_id=${otherUserId}&last_id=${lastMessageId}`);
                const result = await response.json();

                if (result.messages && result.messages.length > 0) {
                    const container = document.getElementById('messagesContainer');
                    if (!container) return;

                    const wasAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;

                    // Clear "Loading messages..." on first load
                    if (lastMessageId === 0) {
                        container.innerHTML = '';
                    }

                    result.messages.forEach(msg => {
                        appendMessage(msg);
                        lastMessageId = Math.max(lastMessageId, msg.chat_id);
                    });

                    if (wasAtBottom) {
                        container.scrollTop = container.scrollHeight;
                    }

                    markAsRead();
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        }

        function appendMessage(msg) {
            const container = document.getElementById('messagesContainer');
            if (!container) return;

            const existingMsg = document.getElementById('msg-' + msg.chat_id);
            if (existingMsg) return;

            const messageGroup = document.createElement('div');
            messageGroup.className = `message-group ${msg.is_own ? 'own' : 'other'}`;
            messageGroup.id = 'msg-' + msg.chat_id;

            const time = new Date(msg.created_at);
            const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            messageGroup.innerHTML = `
                <div class="message-avatar">
                    ${msg.sender_profile ? 
                        `<img src="../../${msg.sender_profile}" alt="Avatar">` : 
                        msg.sender_name.charAt(0).toUpperCase()
                    }
                </div>
                <div class="message-content">
                    ${!msg.is_own ? `<div class="message-sender-name">${escapeHtml(msg.sender_name)}</div>` : ''}
                    <div class="message-bubble">${escapeHtml(msg.message)}</div>
                    <div class="message-timestamp">${timeStr}</div>
                </div>
            `;

            container.appendChild(messageGroup);
        }

        async function markAsRead() {
            try {
                await fetch('messenger_api_unified.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'mark_read',
                        sender_id: otherUserId
                    })
                });
            } catch (error) {
                console.error('Error marking messages as read:', error);
            }
        }

        function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        }
    </script>
</body>
</html>
