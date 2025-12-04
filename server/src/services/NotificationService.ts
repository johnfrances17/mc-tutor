import path from 'path';
import { ensureDirectoryExists, readJsonFile, writeJsonFile } from '../utils/fileSystem';

export interface Notification {
  notification_id: number;
  school_id: string;
  title: string;
  message: string;
  type: 'session_confirmed' | 'session_cancelled' | 'session_completed' | 'new_message' | 'feedback_received' | 'material_uploaded' | 'session_reminder' | 'general';
  related_id?: number | string;
  is_read: boolean;
  created_at: string;
}

interface NotificationFile {
  school_id: string;
  notifications: Notification[];
  last_updated: string;
}

/**
 * Notification Manager Service
 * File-based notification system - port of PHP NotificationManager
 */
export class NotificationService {
  private notificationsDir: string;

  constructor() {
    const baseDir = process.env.UPLOAD_DIR || './data';
    this.notificationsDir = path.join(baseDir, 'notifications');
    ensureDirectoryExists(this.notificationsDir);
  }

  /**
   * Get notification file path for a student
   */
  private getNotificationFilePath(studentId: string): string {
    return path.join(this.notificationsDir, `${studentId}.json`);
  }

  /**
   * Load notifications for a student
   */
  private loadNotifications(studentId: string): NotificationFile {
    const filePath = this.getNotificationFilePath(studentId);
    const existing = readJsonFile<NotificationFile>(filePath, null as any);

    if (existing) {
      return existing;
    }

    // Create new notification file
    const newFile: NotificationFile = {
      school_id: studentId,
      notifications: [],
      last_updated: new Date().toISOString(),
    };

    writeJsonFile(filePath, newFile);
    return newFile;
  }

  /**
   * Save notifications for a student
   */
  private saveNotifications(data: NotificationFile): void {
    data.last_updated = new Date().toISOString();
    const filePath = this.getNotificationFilePath(data.school_id);
    writeJsonFile(filePath, data);
  }

  /**
   * Create a new notification
   */
  createNotification(
    studentId: string,
    title: string,
    message: string,
    type: Notification['type'],
    relatedId?: number | string
  ): Notification {
    const notifData = this.loadNotifications(studentId);

    // Get next notification ID
    const nextId =
      notifData.notifications.length > 0
        ? Math.max(...notifData.notifications.map((n) => n.notification_id)) + 1
        : 1;

    const notification: Notification = {
      notification_id: nextId,
      school_id: studentId,
      title,
      message,
      type,
      related_id: relatedId,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    notifData.notifications.push(notification);
    this.saveNotifications(notifData);

    return notification;
  }

  /**
   * Get all notifications for a student
   */
  getNotifications(studentId: string, unreadOnly: boolean = false): Notification[] {
    const notifData = this.loadNotifications(studentId);

    let notifications = notifData.notifications;

    if (unreadOnly) {
      notifications = notifications.filter((n) => !n.is_read);
    }

    // Sort by newest first
    return notifications.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(studentId: string): number {
    const notifData = this.loadNotifications(studentId);
    return notifData.notifications.filter((n) => !n.is_read).length;
  }

  /**
   * Mark notification as read
   */
  markAsRead(studentId: string, notificationId: number): { success: boolean } {
    const notifData = this.loadNotifications(studentId);

    const notification = notifData.notifications.find((n) => n.notification_id === notificationId);

    if (!notification) {
      return { success: false };
    }

    notification.is_read = true;
    this.saveNotifications(notifData);

    return { success: true };
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(studentId: string): { success: boolean; count: number } {
    const notifData = this.loadNotifications(studentId);

    let count = 0;
    notifData.notifications.forEach((notification) => {
      if (!notification.is_read) {
        notification.is_read = true;
        count++;
      }
    });

    if (count > 0) {
      this.saveNotifications(notifData);
    }

    return { success: true, count };
  }

  /**
   * Delete a notification
   */
  deleteNotification(studentId: string, notificationId: number): { success: boolean } {
    const notifData = this.loadNotifications(studentId);

    const index = notifData.notifications.findIndex((n) => n.notification_id === notificationId);

    if (index === -1) {
      return { success: false };
    }

    notifData.notifications.splice(index, 1);
    this.saveNotifications(notifData);

    return { success: true };
  }

  /**
   * Delete all notifications for a student
   */
  deleteAllNotifications(studentId: string): { success: boolean; count: number } {
    const notifData = this.loadNotifications(studentId);
    const count = notifData.notifications.length;

    notifData.notifications = [];
    this.saveNotifications(notifData);

    return { success: true, count };
  }

  /**
   * Send session confirmed notification
   */
  notifySessionConfirmed(studentId: string, sessionId: number, tutorName: string): Notification {
    return this.createNotification(
      studentId,
      'Session Confirmed',
      `Your tutoring session with ${tutorName} has been confirmed.`,
      'session_confirmed',
      sessionId
    );
  }

  /**
   * Send session cancelled notification
   */
  notifySessionCancelled(studentId: string, sessionId: number, reason: string = ''): Notification {
    const message = reason
      ? `Your tutoring session has been cancelled. Reason: ${reason}`
      : 'Your tutoring session has been cancelled.';

    return this.createNotification(
      studentId,
      'Session Cancelled',
      message,
      'session_cancelled',
      sessionId
    );
  }

  /**
   * Send session completed notification
   */
  notifySessionCompleted(studentId: string, sessionId: number, tutorName: string): Notification {
    return this.createNotification(
      studentId,
      'Session Completed',
      `Your tutoring session with ${tutorName} has been completed. Please provide feedback.`,
      'session_completed',
      sessionId
    );
  }

  /**
   * Send new message notification
   */
  notifyNewMessage(studentId: string, senderName: string, senderId: string): Notification {
    return this.createNotification(
      studentId,
      'New Message',
      `You have a new message from ${senderName}.`,
      'new_message',
      senderId
    );
  }

  /**
   * Send feedback received notification
   */
  notifyFeedbackReceived(studentId: string, rating: number, studentName: string): Notification {
    return this.createNotification(
      studentId,
      'Feedback Received',
      `${studentName} rated your session ${rating}/5 stars.`,
      'feedback_received'
    );
  }

  /**
   * Send material uploaded notification
   */
  notifyMaterialUploaded(
    studentId: string,
    materialTitle: string,
    tutorName: string
  ): Notification {
    return this.createNotification(
      studentId,
      'New Study Material',
      `${tutorName} uploaded "${materialTitle}".`,
      'material_uploaded'
    );
  }

  /**
   * Send session reminder notification
   */
  notifySessionReminder(studentId: string, sessionId: number, sessionTime: string): Notification {
    return this.createNotification(
      studentId,
      'Session Reminder',
      `You have an upcoming tutoring session at ${sessionTime}.`,
      'session_reminder',
      sessionId
    );
  }
}
