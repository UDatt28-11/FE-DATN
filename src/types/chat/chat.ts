export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number | null;
  content: string;
  message_type: 'user' | 'ai';
  ai_provider?: string | null;
  ai_model?: string | null;
  metadata?: {
    provider?: string;
    model?: string;
    tokens_used?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
    error?: string;
  } | null;
  read_at?: string | null;
  is_read: boolean;
  is_hidden: boolean;
  sender?: {
    id: number;
    full_name: string;
    email: string;
    avatar_url?: string | null;
    role?: string | null; // Add role to identify admin
  } | null;
  created_at: string;
  updated_at: string;
}

export interface ChatConversation {
  id: number;
  type: 'user_to_user' | 'user_to_ai';
  session_id?: string | null;
  context_data?: {
    booking_id?: number;
    room_id?: number;
    user_id?: number;
    user_name?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface ChatContext {
  booking_id?: number;
  room_id?: number;
  user_name?: string;
}

export interface SendMessageRequest {
  conversation_id: number;
  content: string;
  session_id?: string;
  context?: ChatContext;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: {
    user_message: ChatMessage;
    ai_message?: ChatMessage; // Optional - only for guests, null for logged-in users
  };
}

export interface GetMessagesResponse {
  success: boolean;
  data: ChatMessage[];
  meta?: {
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}

export interface GetConversationResponse {
  success: boolean;
  data: ChatConversation;
  session_id?: string;
}

