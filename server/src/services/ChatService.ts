import path from 'path';
import { supabase } from '../config/database';
import { ensureDirectoryExists, readJsonFile, writeJsonFile } from '../utils/fileSystem';
import { encryptMessage, decryptMessage } from './EncryptionService';

interface ChatMessage {
  message_id: number;
  sender_student_id: string;
  sender_name: string;
  message: string;
  message_type: 'text';
  is_read: boolean;
  timestamp: string;
}

interface Conversation {
  conversation_id: string;
  participants: {
    student_id_1: string;
    student_id_2: string;
  };
  created_at: string;
  last_message_at: string | null;
  is_encrypted: boolean;
  messages: ChatMessage[];
}

interface ConversationMetadata {
  conversation_id: string;
  participant1_student_id: string;
  participant2_student_id: string;
  created_at: string;
}

interface MetadataFile {
  conversations: ConversationMetadata[];
  last_updated: string;
}

/**
 * Chat Manager Service
 * File-based chat system - port of PHP ChatManager
 */
export class ChatService {
  private chatsDir: string;
  private metadataFile: string;

  constructor() {
    const baseDir = process.env.UPLOAD_DIR || './data';
    this.chatsDir = path.join(baseDir, 'chats');
    this.metadataFile = path.join(this.chatsDir, 'metadata.json');

    // Ensure directory exists
    ensureDirectoryExists(this.chatsDir);

    // Ensure metadata exists
    if (!readJsonFile<MetadataFile>(this.metadataFile, null as any)) {
      writeJsonFile(this.metadataFile, {
        conversations: [],
        last_updated: new Date().toISOString(),
      });
    }
  }

  /**
   * Get conversation ID from two student IDs (always sorted)
   */
  private getConversationId(studentId1: string, studentId2: string): string {
    const ids = [studentId1, studentId2].sort();
    return ids.join('-');
  }

  /**
   * Get chat file path for a conversation
   */
  private getChatFilePath(studentId1: string, studentId2: string): string {
    const convId = this.getConversationId(studentId1, studentId2);
    const convDir = path.join(this.chatsDir, convId);
    ensureDirectoryExists(convDir);
    return path.join(convDir, 'messages.json');
  }

  /**
   * Load conversation from file
   */
  loadConversation(studentId1: string, studentId2: string): Conversation {
    const filePath = this.getChatFilePath(studentId1, studentId2);
    const convId = this.getConversationId(studentId1, studentId2);

    const existing = readJsonFile<Conversation>(filePath, null as any);
    if (existing) {
      return existing;
    }

    // Create new conversation
    const [minId, maxId] = [studentId1, studentId2].sort();
    const newConversation: Conversation = {
      conversation_id: convId,
      participants: {
        student_id_1: minId,
        student_id_2: maxId,
      },
      created_at: new Date().toISOString(),
      last_message_at: null,
      is_encrypted: true,
      messages: [],
    };

    writeJsonFile(filePath, newConversation);
    this.updateMetadata(convId, studentId1, studentId2);

    return newConversation;
  }

  /**
   * Send a message to conversation
   */
  async sendMessage(
    senderStudentId: string,
    receiverStudentId: string,
    messageText: string,
    encrypt: boolean = true
  ): Promise<{ success: boolean; message: ChatMessage }> {
    // Load conversation
    const conversation = this.loadConversation(senderStudentId, receiverStudentId);

    // Get sender info from database
    const { data: sender } = await supabase
      .from('users')
      .select('full_name')
      .eq('school_id', senderStudentId)
      .single();

    // Encrypt message if needed
    const messageContent = encrypt ? encryptMessage(messageText) || messageText : messageText;

    // Create message
    const newMessage: ChatMessage = {
      message_id: conversation.messages.length + 1,
      sender_student_id: senderStudentId,
      sender_name: sender?.full_name || 'Unknown',
      message: messageContent,
      message_type: 'text',
      is_read: false,
      timestamp: new Date().toISOString(),
    };

    // Add to conversation
    conversation.messages.push(newMessage);
    conversation.last_message_at = newMessage.timestamp;

    // Save conversation
    const filePath = this.getChatFilePath(senderStudentId, receiverStudentId);
    writeJsonFile(filePath, conversation);

    return {
      success: true,
      message: newMessage,
    };
  }

  /**
   * Get all messages in a conversation
   */
  getMessages(studentId1: string, studentId2: string, decrypt: boolean = true): ChatMessage[] {
    const conversation = this.loadConversation(studentId1, studentId2);

    if (!decrypt) {
      return conversation.messages;
    }

    // Decrypt messages
    return conversation.messages.map((msg) => {
      const msgCopy = { ...msg };
      if (conversation.is_encrypted) {
        const decrypted = decryptMessage(msg.message);
        msgCopy.message = decrypted !== null ? decrypted : '[Encrypted]';
      }
      return msgCopy;
    });
  }

  /**
   * Mark messages as read
   */
  markAsRead(readerStudentId: string, senderStudentId: string): { success: boolean } {
    const conversation = this.loadConversation(readerStudentId, senderStudentId);

    let updated = false;
    conversation.messages.forEach((msg) => {
      if (msg.sender_student_id === senderStudentId && !msg.is_read) {
        msg.is_read = true;
        updated = true;
      }
    });

    if (updated) {
      const filePath = this.getChatFilePath(readerStudentId, senderStudentId);
      writeJsonFile(filePath, conversation);
    }

    return { success: true };
  }

  /**
   * Get unread count for a user
   */
  getUnreadCount(myStudentId: string, otherStudentId: string): number {
    const conversation = this.loadConversation(myStudentId, otherStudentId);

    return conversation.messages.filter(
      (msg) => msg.sender_student_id === otherStudentId && !msg.is_read
    ).length;
  }

  /**
   * Get all conversations for a user
   */
  async getAllConversations(myStudentId: string): Promise<any[]> {
    const metadata = readJsonFile<MetadataFile>(this.metadataFile, {
      conversations: [],
      last_updated: new Date().toISOString(),
    });

    const conversations = [];

    for (const conv of metadata.conversations) {
      // Check if user is participant
      if (
        conv.participant1_student_id === myStudentId ||
        conv.participant2_student_id === myStudentId
      ) {
        const otherStudentId =
          conv.participant1_student_id === myStudentId
            ? conv.participant2_student_id
            : conv.participant1_student_id;

        // Load conversation file
        const conversation = this.loadConversation(myStudentId, otherStudentId);

        // Get other user info
        const { data: otherUser } = await supabase
          .from('users')
          .select('user_id, school_id, full_name, role, profile_picture')
          .eq('school_id', otherStudentId)
          .single();

        // Skip if other user not found (prevents 'Unknown User' for deleted/old accounts)
        if (!otherUser || !otherUser.school_id) {
          continue;
        }

        // Get last message
        const lastMessage =
          conversation.messages.length > 0
            ? conversation.messages[conversation.messages.length - 1]
            : null;

        // Decrypt last message if exists
        let decryptedLastMessage = lastMessage;
        if (lastMessage && conversation.is_encrypted) {
          const decrypted = decryptMessage(lastMessage.message);
          decryptedLastMessage = {
            ...lastMessage,
            message: decrypted !== null ? decrypted : '[Encrypted]'
          };
        }

        // Get unread count
        const unreadCount = this.getUnreadCount(myStudentId, otherStudentId);

        conversations.push({
          conversation_id: conversation.conversation_id,
          other_user: otherUser,
          last_message: decryptedLastMessage,
          last_message_at: conversation.last_message_at,
          unread_count: unreadCount,
        });
      }
    }

    // Sort by last message time
    conversations.sort((a, b) => {
      const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return timeB - timeA;
    });

    return conversations;
  }

  /**
   * Update metadata file
   */
  private updateMetadata(conversationId: string, studentId1: string, studentId2: string): void {
    const metadata = readJsonFile<MetadataFile>(this.metadataFile, {
      conversations: [],
      last_updated: new Date().toISOString(),
    });

    // Check if conversation exists
    const exists = metadata.conversations.some((conv) => conv.conversation_id === conversationId);

    if (!exists) {
      const [minId, maxId] = [studentId1, studentId2].sort();
      metadata.conversations.push({
        conversation_id: conversationId,
        participant1_student_id: minId,
        participant2_student_id: maxId,
        created_at: new Date().toISOString(),
      });

      metadata.last_updated = new Date().toISOString();
      writeJsonFile(this.metadataFile, metadata);
    }
  }

  /**
   * Delete a conversation
   */
  deleteConversation(studentId1: string, studentId2: string): { success: boolean } {
    const filePath = this.getChatFilePath(studentId1, studentId2);
    const convId = this.getConversationId(studentId1, studentId2);

    try {
      const fs = require('fs');
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Update metadata
      const metadata = readJsonFile<MetadataFile>(this.metadataFile, {
        conversations: [],
        last_updated: new Date().toISOString(),
      });

      metadata.conversations = metadata.conversations.filter(
        (conv) => conv.conversation_id !== convId
      );

      metadata.last_updated = new Date().toISOString();
      writeJsonFile(this.metadataFile, metadata);

      return { success: true };
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return { success: false };
    }
  }
}
