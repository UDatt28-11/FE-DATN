import api from '../api/axios';

export interface AdminConversation {
  id: number;
  type: 'user_to_user' | 'user_to_ai';
  session_id?: string | null;
  context_data?: Record<string, any> | null;
  participants: Array<{
    id: number;
    full_name: string;
    email: string;
    avatar_url?: string | null;
  }>;
  latest_message?: {
    id: number;
    content: string;
    sender_id: number;
    message_type: 'user' | 'ai';
    created_at: string;
  } | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminMessage {
  id: number;
  conversation_id: number;
  sender_id: number | null;
  content: string;
  message_type: 'user' | 'ai';
  ai_provider?: string | null;
  ai_model?: string | null;
  read_at?: string | null;
  is_read: boolean;
  is_hidden: boolean;
  sender?: {
    id: number;
    full_name: string;
    email: string;
    avatar_url?: string | null;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface GetConversationsResponse {
  success: boolean;
  data: AdminConversation[];
  meta?: {
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}

export interface GetMessagesResponse {
  success: boolean;
  data: AdminMessage[];
  meta?: {
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}

const adminConversationService = {
  /**
   * GET /api/admin/conversations
   * Lấy danh sách conversations (admin có thể xem tất cả)
   */
  async getConversations(params?: {
    type?: 'user_to_user' | 'user_to_ai';
    user_id?: number;
    session_id?: string;
    page?: number;
    per_page?: number;
  }): Promise<GetConversationsResponse> {
    try {
      const { data } = await api.get('/admin/conversations', { params });
      return data;
    } catch (error: any) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  },

  /**
   * GET /api/admin/conversations/{id}/messages
   * Lấy danh sách messages trong conversation
   */
  async getMessages(
    conversationId: number,
    params?: {
      page?: number;
      per_page?: number;
    }
  ): Promise<GetMessagesResponse> {
    try {
      const { data } = await api.get(`/admin/conversations/${conversationId}/messages`, { params });
      return data;
    } catch (error: any) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },

  /**
   * POST /api/admin/conversations/{id}/messages
   * Gửi tin nhắn vào conversation (admin reply)
   */
  async sendMessage(
    conversationId: number,
    content: string
  ): Promise<{ success: boolean; message: string; data: AdminMessage }> {
    try {
      const { data } = await api.post(`/admin/conversations/${conversationId}/messages`, {
        content,
      });
      return data;
    } catch (error: any) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
};

export default adminConversationService;

