import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount,
} from '../controllers/chatController';

const router = Router();

// Get all conversations
router.get('/conversations', authMiddleware, getConversations);

// Get messages in a conversation
router.get('/messages/:otherStudentId', authMiddleware, getMessages);

// Send message
router.post('/send', authMiddleware, sendMessage);

// Mark messages as read
router.put('/mark-read/:otherStudentId', authMiddleware, markMessagesAsRead);

// Get unread count
router.get('/unread/:otherStudentId', authMiddleware, getUnreadCount);

export default router;
