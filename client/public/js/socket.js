// Socket.IO Client Manager
class SocketManager {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.messageHandlers = new Map();
        this.typingTimeouts = new Map();
    }

    // Connect to Socket.IO server
    connect(token) {
        if (this.socket && this.isConnected) {
            console.log('Already connected to socket server');
            return;
        }

        // Get API base URL
        const apiUrl = window.API_BASE_URL || 'http://localhost:3000';

        this.socket = io(apiUrl, {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to Socket.IO server');
            this.isConnected = true;
            this.triggerEvent('connected');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from Socket.IO server');
            this.isConnected = false;
            this.triggerEvent('disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.triggerEvent('error', error);
        });

        // Handle incoming events
        this.setupEventHandlers();
    }

    // Setup Socket.IO event handlers
    setupEventHandlers() {
        // New message received
        this.socket.on('new_message', (data) => {
            console.log('💬 New message:', data);
            this.triggerEvent('message_received', data);
        });

        // User online/offline status
        this.socket.on('user_online', (data) => {
            console.log('🟢 User online:', data.fullName);
            this.triggerEvent('user_status', { ...data, status: 'online' });
        });

        this.socket.on('user_offline', (data) => {
            console.log('⚫ User offline:', data.fullName);
            this.triggerEvent('user_status', { ...data, status: 'offline' });
        });

        // Online users list
        this.socket.on('online_users', (users) => {
            console.log('👥 Online users:', users);
            this.triggerEvent('online_users', users);
        });

        // Typing indicators
        this.socket.on('user_typing', (data) => {
            this.triggerEvent('typing', data);
        });

        // Messages read
        this.socket.on('messages_read', (data) => {
            this.triggerEvent('messages_read', data);
        });

        // Message notification
        this.socket.on('message_notification', (data) => {
            console.log('🔔 Message notification:', data);
            this.triggerEvent('notification', data);
            
            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
                new Notification(`New message from ${data.fromName}`, {
                    body: data.preview,
                    icon: '/assets/logo.png'
                });
            }
        });

        // Session updates
        this.socket.on('session_update', (data) => {
            console.log('📅 Session update:', data);
            this.triggerEvent('session_update', data);
        });

        // New notification
        this.socket.on('new_notification', (data) => {
            console.log('🔔 New notification:', data);
            this.triggerEvent('new_notification', data);
        });

        // Error handling
        this.socket.on('message_error', (data) => {
            console.error('Message error:', data);
            this.triggerEvent('message_error', data);
        });
    }

    // Join a conversation room
    joinConversation(otherUserId) {
        if (!this.socket || !this.isConnected) {
            console.warn('Socket not connected');
            return;
        }
        this.socket.emit('join_conversation', { otherUserId });
        console.log(`👥 Joined conversation with ${otherUserId}`);
    }

    // Leave a conversation room
    leaveConversation(otherUserId) {
        if (!this.socket || !this.isConnected) return;
        this.socket.emit('leave_conversation', { otherUserId });
        console.log(`👋 Left conversation with ${otherUserId}`);
    }

    // Send a message
    sendMessage(receiverId, message, encrypt = true) {
        if (!this.socket || !this.isConnected) {
            console.error('Socket not connected');
            return Promise.reject(new Error('Socket not connected'));
        }

        return new Promise((resolve, reject) => {
            this.socket.emit('send_message', { receiverId, message, encrypt });
            
            // Wait for confirmation (with timeout)
            const timeout = setTimeout(() => {
                reject(new Error('Message send timeout'));
            }, 5000);

            const handler = (data) => {
                if (data.receiverId === receiverId) {
                    clearTimeout(timeout);
                    this.socket.off('new_message', handler);
                    resolve(data);
                }
            };

            this.socket.on('new_message', handler);
        });
    }

    // Send typing indicator
    startTyping(receiverId) {
        if (!this.socket || !this.isConnected) return;
        
        // Clear previous timeout
        if (this.typingTimeouts.has(receiverId)) {
            clearTimeout(this.typingTimeouts.get(receiverId));
        }

        this.socket.emit('typing_start', { receiverId });

        // Auto-stop typing after 3 seconds
        const timeout = setTimeout(() => {
            this.stopTyping(receiverId);
        }, 3000);

        this.typingTimeouts.set(receiverId, timeout);
    }

    stopTyping(receiverId) {
        if (!this.socket || !this.isConnected) return;

        // Clear timeout
        if (this.typingTimeouts.has(receiverId)) {
            clearTimeout(this.typingTimeouts.get(receiverId));
            this.typingTimeouts.delete(receiverId);
        }

        this.socket.emit('typing_stop', { receiverId });
    }

    // Mark messages as read
    markAsRead(otherUserId) {
        if (!this.socket || !this.isConnected) return;
        this.socket.emit('mark_read', { otherUserId });
    }

    // Emit session events
    sessionConfirmed(studentId, sessionDetails) {
        if (!this.socket || !this.isConnected) return;
        this.socket.emit('session_confirmed', { studentId, sessionDetails });
    }

    sessionCancelled(userId, sessionDetails, reason) {
        if (!this.socket || !this.isConnected) return;
        this.socket.emit('session_cancelled', { userId, sessionDetails, reason });
    }

    // Event listener management
    on(event, handler) {
        if (!this.messageHandlers.has(event)) {
            this.messageHandlers.set(event, []);
        }
        this.messageHandlers.get(event).push(handler);
    }

    off(event, handler) {
        if (!this.messageHandlers.has(event)) return;
        
        const handlers = this.messageHandlers.get(event);
        const index = handlers.indexOf(handler);
        if (index > -1) {
            handlers.splice(index, 1);
        }
    }

    triggerEvent(event, data) {
        if (!this.messageHandlers.has(event)) return;
        
        const handlers = this.messageHandlers.get(event);
        handlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`Error in ${event} handler:`, error);
            }
        });
    }

    // Disconnect socket
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            console.log('Socket disconnected');
        }
    }

    // Check connection status
    isSocketConnected() {
        return this.isConnected;
    }
}

// Create singleton instance
const socketManager = new SocketManager();

// Request notification permission on load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Export for use in other modules
export default socketManager;
