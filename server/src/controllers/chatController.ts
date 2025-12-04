import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ChatService } from '../services/ChatService';

const chatService = new ChatService();

/**
 * Get all conversations for current user
 */
export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.school_id;

    const conversations = await chatService.getAllConversations(studentId);

    res.json({ success: true, conversations });
  } catch (error) {
    return next(error);
    }
};

/**
 * Get messages in a conversation
 */
export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const myStudentId = req.user!.school_id;
    const { otherStudentId } = req.params;

    const messages = chatService.getMessages(myStudentId, otherStudentId, true);

    res.json({ success: true, messages });
  } catch (error) {
    return next(error);
    }
};

/**
 * Send a message
 */
export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const senderStudentId = req.user!.school_id;
    const { receiver_student_id, message } = req.body;

    if (!receiver_student_id || !message) {
      return res.status(400).json({ success: false, message: 'Receiver and message are required' });
    }

    const result = await chatService.sendMessage(senderStudentId, receiver_student_id, message, true);

    res.status(201).json({
      success: true,
      message: 'Message sent',
      chat_message: result.message,
    });
  } catch (error) {
    return next(error);
    }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const myStudentId = req.user!.school_id;
    const { otherStudentId } = req.params;

    chatService.markAsRead(myStudentId, otherStudentId);

    return res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    return next(error);
    }
};

/**
 * Get unread count for a conversation
 */
export const getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const myStudentId = req.user!.school_id;
    const { otherStudentId } = req.params;

    const count = chatService.getUnreadCount(myStudentId, otherStudentId);

    res.json({ success: true, count });
  } catch (error) {
    return next(error);
    }
};
