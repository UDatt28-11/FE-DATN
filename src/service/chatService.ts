import api from '../api/axios';
import type {
  ChatMessage,
  ChatConversation,
  SendMessageRequest,
  SendMessageResponse,
  GetMessagesResponse,
  GetConversationResponse,
  ChatContext,
} from '../types/chat/chat';

/**
 * Chat Service - Quản lý AI Chat
 * Gọi API tới Laravel backend: /api/chat/...
 */
const chatService = {
  /**
   * GET /api/chat/conversation
   * Lấy hoặc tạo conversation với Admin hoặc AI
   */
  async getConversation(sessionId?: string, type?: 'admin' | 'ai'): Promise<GetConversationResponse> {
    try {
      const params: any = {};
      if (sessionId) {
        params.session_id = sessionId;
      }
      if (type) {
        params.type = type;
      }

      const { data } = await api.get('/chat/conversation', { params });
      return data;
    } catch (error: any) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  },

  /**
   * POST /api/chat/send-message
   * Gửi tin nhắn đến AI và nhận phản hồi
   */
  async sendMessage(
    conversationId: number,
    content: string,
    sessionId?: string,
    context?: ChatContext
  ): Promise<SendMessageResponse> {
    try {
      const payload: SendMessageRequest = {
        conversation_id: conversationId,
        content,
      };

      if (sessionId) {
        payload.session_id = sessionId;
      }

      if (context) {
        payload.context = context;
      }

      const { data } = await api.post('/chat/send-message', payload);
      return data;
    } catch (error: any) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * GET /api/chat/messages
   * Lấy lịch sử tin nhắn
   */
  async getMessages(
    conversationId: number,
    sessionId?: string,
    page: number = 1,
    perPage: number = 50
  ): Promise<GetMessagesResponse> {
    try {
      const params: any = {
        conversation_id: conversationId,
        page,
        per_page: perPage,
      };

      if (sessionId) {
        params.session_id = sessionId;
      }

      const { data } = await api.get('/chat/messages', { params });
      return data;
    } catch (error: any) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },

  /**
   * POST /api/chat/clear-history
   * Xóa lịch sử chat
   */
  async clearHistory(
    conversationId: number,
    sessionId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const payload: any = {
        conversation_id: conversationId,
      };

      if (sessionId) {
        payload.session_id = sessionId;
      }

      const { data } = await api.post('/chat/clear-history', payload);
      return data;
    } catch (error: any) {
      console.error('Error clearing history:', error);
      throw error;
    }
  },
};

export default chatService;

