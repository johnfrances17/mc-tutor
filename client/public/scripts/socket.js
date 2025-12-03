/**
 * Socket.IO Client for Real-time Chat
 * Handles WebSocket connections and real-time messaging
 */

let socket = null;
let isConnected = false;

/**
 * Initialize Socket.IO connection
 */
function initSocket() {
  if (socket) {
    return socket;
  }
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found. Cannot connect to socket.');
    return null;
  }
  
  const socketURL = API_BASE_URL.replace('/api', '');
  
  socket = io(socketURL, {
    auth: {
      token: token
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });
  
  // Connection events
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    isConnected = true;
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
    isConnected = false;
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    isConnected = false;
  });
  
  return socket;
}

/**
 * Join a conversation room
 * @param {string} otherStudentId - Student ID of the other user
 */
function joinConversation(otherStudentId) {
  if (!socket || !isConnected) {
    console.error('Socket not connected');
    return;
  }
  
  socket.emit('join_conversation', { otherStudentId });
}

/**
 * Send a message
 * @param {string} receiverStudentId - Student ID of the receiver
 * @param {string} message - Message content
 */
function sendMessage(receiverStudentId, message) {
  if (!socket || !isConnected) {
    console.error('Socket not connected');
    return;
  }
  
  socket.emit('send_message', {
    receiver_student_id: receiverStudentId,
    message: message
  });
}

/**
 * Mark messages as read
 * @param {string} otherStudentId - Student ID of the other user
 */
function markMessagesAsRead(otherStudentId) {
  if (!socket || !isConnected) {
    console.error('Socket not connected');
    return;
  }
  
  socket.emit('mark_read', { otherStudentId });
}

/**
 * Send typing indicator
 * @param {string} receiverStudentId - Student ID of the receiver
 */
function sendTypingStart(receiverStudentId) {
  if (!socket || !isConnected) return;
  
  socket.emit('typing_start', { receiverStudentId });
}

/**
 * Stop typing indicator
 * @param {string} receiverStudentId - Student ID of the receiver
 */
function sendTypingStop(receiverStudentId) {
  if (!socket || !isConnected) return;
  
  socket.emit('typing_stop', { receiverStudentId });
}

/**
 * Listen for new messages
 * @param {function} callback - Function to call when new message received
 */
function onNewMessage(callback) {
  if (!socket) return;
  
  socket.on('new_message', (data) => {
    callback(data);
  });
}

/**
 * Listen for typing indicators
 * @param {function} callback - Function to call when user is typing
 */
function onUserTyping(callback) {
  if (!socket) return;
  
  socket.on('user_typing', (data) => {
    callback(data);
  });
}

/**
 * Listen for messages read event
 * @param {function} callback - Function to call when messages are read
 */
function onMessagesRead(callback) {
  if (!socket) return;
  
  socket.on('messages_read', (data) => {
    callback(data);
  });
}

/**
 * Listen for user online status
 * @param {function} callback - Function to call when user comes online
 */
function onUserOnline(callback) {
  if (!socket) return;
  
  socket.on('user_online', (data) => {
    callback(data);
  });
}

/**
 * Listen for user offline status
 * @param {function} callback - Function to call when user goes offline
 */
function onUserOffline(callback) {
  if (!socket) return;
  
  socket.on('user_offline', (data) => {
    callback(data);
  });
}

/**
 * Disconnect socket
 */
function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnected = false;
  }
}

/**
 * Check if socket is connected
 * @returns {boolean}
 */
function isSocketConnected() {
  return isConnected;
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.socketClient = {
    initSocket,
    joinConversation,
    sendMessage,
    markMessagesAsRead,
    sendTypingStart,
    sendTypingStop,
    onNewMessage,
    onUserTyping,
    onMessagesRead,
    onUserOnline,
    onUserOffline,
    disconnectSocket,
    isSocketConnected
  };
}
