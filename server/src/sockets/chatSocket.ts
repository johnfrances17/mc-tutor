import { Server } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { ChatService } from '../services/ChatService';
import { NotificationService } from '../services/NotificationService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface UserSocket {
  userId: string;
  socketId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string; // Computed
}

// Store active users
const activeUsers = new Map<string, UserSocket>();

// Service instances
const chatService = new ChatService();
const notificationService = new NotificationService();

// Initialize Socket.IO handlers
export function initializeSocketIO(io: Server) {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const decoded = verify(token, JWT_SECRET) as any;
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    const fullName = user.middle_name 
      ? `${user.first_name} ${user.middle_name} ${user.last_name}`
      : `${user.first_name} ${user.last_name}`;
    
    console.log(`✅ User connected: ${fullName} (${user.school_id})`);

    // Add user to active users
    activeUsers.set(user.school_id, {
      userId: user.school_id,
      socketId: socket.id,
      firstName: user.first_name,
      middleName: user.middle_name,
      lastName: user.last_name,
      fullName: fullName
    });

    // Broadcast online status to all connected users
    io.emit('user_online', {
      userId: user.school_id,
      fullName: fullName,
      timestamp: new Date()
    });

    // Send list of online users to the newly connected user
    const onlineUsersList = Array.from(activeUsers.values()).map(u => ({
      userId: u.userId,
      fullName: u.fullName
    }));
    socket.emit('online_users', onlineUsersList);

    // Handle joining a conversation room
    socket.on('join_conversation', (data: { otherUserId: string }) => {
      const conversationId = [user.school_id, data.otherUserId].sort().join('-');
      socket.join(conversationId);
      console.log(`👥 User ${user.school_id} joined conversation: ${conversationId}`);
    });

    // Handle leaving a conversation room
    socket.on('leave_conversation', (data: { otherUserId: string }) => {
      const conversationId = [user.school_id, data.otherUserId].sort().join('-');
      socket.leave(conversationId);
      console.log(`👋 User ${user.school_id} left conversation: ${conversationId}`);
    });

    // Handle sending a message
    socket.on('send_message', async (data: {
      receiverId: string;
      message: string;
      encrypt?: boolean;
    }) => {
      try {
        const { receiverId, message, encrypt = true } = data;

        // Save message to database/file
        const savedMessage = await chatService.sendMessage(
          user.school_id,
          receiverId,
          message,
          encrypt
        );

        const conversationId = [user.school_id, receiverId].sort().join('-');

        // Emit to all users in the conversation room
        io.to(conversationId).emit('new_message', {
          id: savedMessage.message.message_id,
          senderId: user.school_id,
          senderName: fullName,
          receiverId: receiverId,
          message: savedMessage.message.message,
          timestamp: savedMessage.message.timestamp,
          isRead: false
        });

        // Send notification to receiver if they're online
        const receiverSocket = activeUsers.get(receiverId);
        if (receiverSocket) {
          io.to(receiverSocket.socketId).emit('message_notification', {
            from: user.school_id,
            fromName: fullName,
            preview: message.substring(0, 50),
            timestamp: savedMessage.message.timestamp
          });

          // Create notification
          await notificationService.createNotification(
            receiverId,
            'New Message',
            'New message from ' + fullName,
            'new_message'
          );
        }

        console.log(`💬 Message sent from ${user.school_id} to ${receiverId}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('message_error', {
          error: 'Failed to send message'
        });
      }
    });

    // Handle typing indicator
    socket.on('typing_start', (data: { receiverId: string }) => {
      const receiverSocket = activeUsers.get(data.receiverId);
      if (receiverSocket) {
        io.to(receiverSocket.socketId).emit('user_typing', {
          userId: user.school_id,
          userName: fullName,
          isTyping: true
        });
      }
    });

    socket.on('typing_stop', (data: { receiverId: string }) => {
      const receiverSocket = activeUsers.get(data.receiverId);
      if (receiverSocket) {
        io.to(receiverSocket.socketId).emit('user_typing', {
          userId: user.school_id,
          userName: fullName,
          isTyping: false
        });
      }
    });

    // Handle marking messages as read
    socket.on('mark_read', async (data: { otherUserId: string }) => {
      try {
        await chatService.markAsRead(user.school_id, data.otherUserId);
        
        const conversationId = [user.school_id, data.otherUserId].sort().join('-');
        io.to(conversationId).emit('messages_read', {
          readerId: user.school_id,
          conversationId: conversationId,
          timestamp: new Date()
        });

        console.log(`✅ Messages marked as read: ${user.school_id} ← ${data.otherUserId}`);
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // Handle session notifications
    socket.on('session_confirmed', async (data: { studentId: string; sessionDetails: any }) => {
      const studentSocket = activeUsers.get(data.studentId);
      if (studentSocket) {
        io.to(studentSocket.socketId).emit('session_update', {
          type: 'confirmed',
          session: data.sessionDetails,
          message: 'Your session has been confirmed!'
        });
      }
    });

    socket.on('session_cancelled', async (data: { userId: string; sessionDetails: any; reason?: string }) => {
      const userSocket = activeUsers.get(data.userId);
      if (userSocket) {
        io.to(userSocket.socketId).emit('session_update', {
          type: 'cancelled',
          session: data.sessionDetails,
          reason: data.reason,
          message: 'A session has been cancelled'
        });
      }
    });

    // Handle notification events
    socket.on('notification_sent', async (data: { userId: string; notification: any }) => {
      const userSocket = activeUsers.get(data.userId);
      if (userSocket) {
        io.to(userSocket.socketId).emit('new_notification', data.notification);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${fullName} (${user.school_id})`);
      
      // Remove from active users
      activeUsers.delete(user.school_id);

      // Broadcast offline status
      io.emit('user_offline', {
        userId: user.school_id,
        fullName: fullName,
        timestamp: new Date()
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('🔌 Socket.IO handlers initialized');
}

// Helper function to emit to a specific user
export function emitToUser(io: Server, userId: string, event: string, data: any) {
  const userSocket = activeUsers.get(userId);
  if (userSocket) {
    io.to(userSocket.socketId).emit(event, data);
    return true;
  }
  return false;
}

// Helper function to get online users
export function getOnlineUsers(): string[] {
  return Array.from(activeUsers.keys());
}

// Helper function to check if user is online
export function isUserOnline(userId: string): boolean {
  return activeUsers.has(userId);
}

