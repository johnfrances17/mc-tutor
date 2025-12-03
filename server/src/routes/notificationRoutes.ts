import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
} from '../controllers/notificationController';

const router = Router();

// Get all notifications
router.get('/', authMiddleware, getNotifications);

// Get unread count
router.get('/unread/count', authMiddleware, getUnreadCount);

// Mark notification as read
router.put('/:id/read', authMiddleware, markAsRead);

// Mark all as read
router.put('/read-all', authMiddleware, markAllAsRead);

// Delete notification
router.delete('/:id', authMiddleware, deleteNotification);

// Delete all notifications
router.delete('/', authMiddleware, deleteAllNotifications);

export default router;
