import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { NotificationService } from '../services/NotificationService';

const notificationService = new NotificationService();

/**
 * Get all notifications for current user
 */
export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentId;
    const { unread_only } = req.query;

    const notifications = notificationService.getNotifications(
      studentId,
      unread_only === 'true'
    );

    const unreadCount = notificationService.getUnreadCount(studentId);

    res.json({
      success: true,
      notifications,
      unread_count: unreadCount,
    });
  } catch (error) {
    return next(error);
    }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentId;
    const { id } = req.params;

    const result = notificationService.markAsRead(studentId, Number(id));

    if (!result.success) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    return next(error);
    }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentId;

    const result = notificationService.markAllAsRead(studentId);

    res.json({
      success: true,
      message: `${result.count} notifications marked as read`,
      count: result.count,
    });
  } catch (error) {
    return next(error);
    }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentId;
    const { id } = req.params;

    const result = notificationService.deleteNotification(studentId, Number(id));

    if (!result.success) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    return next(error);
    }
};

/**
 * Delete all notifications
 */
export const deleteAllNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentId;

    const result = notificationService.deleteAllNotifications(studentId);

    res.json({
      success: true,
      message: `${result.count} notifications deleted`,
      count: result.count,
    });
  } catch (error) {
    return next(error);
    }
};

/**
 * Get unread count
 */
export const getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.studentId;
    const count = notificationService.getUnreadCount(studentId);

    res.json({ success: true, count });
  } catch (error) {
    return next(error);
    }
};
