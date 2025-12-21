import { useState, useEffect, useCallback, useRef } from 'react';
import { message as antdMessage } from 'antd';
import adminConversationService, {
  type AdminMessage,
} from '../../../../service/adminConversationService';

export const useMessages = (conversationId: number | null, drawerOpen: boolean) => {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const loadedConversationIdRef = useRef<number | null>(null);

  const loadMessages = useCallback(async (id: number) => {
    // Prevent reload if same conversation
    if (loadedConversationIdRef.current === id) {
      return;
    }

    try {
      setLoading(true);
      loadedConversationIdRef.current = id;
      const response = await adminConversationService.getMessages(id, {
        page: 1,
        per_page: 100,
      });
      // Reverse to show oldest first
      setMessages(response.data.reverse());
    } catch (error: any) {
      antdMessage.error('Không thể tải tin nhắn');
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (id: number, content: string) => {
    try {
      setSending(true);
      const response = await adminConversationService.sendMessage(id, content.trim());
      
      // Add new message to list
      setMessages((prev) => [...prev, response.data]);
      
      return response.data;
    } catch (error: any) {
      antdMessage.error('Không thể gửi tin nhắn');
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setSending(false);
    }
  }, []);

  // Load messages when conversation is selected AND drawer is open (only if ID changed)
  useEffect(() => {
    if (drawerOpen && conversationId && conversationId !== loadedConversationIdRef.current) {
      loadMessages(conversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen, conversationId]); // Don't include loadMessages in dependencies to avoid unnecessary reloads

  // Reset loaded conversation ID when drawer closes
  useEffect(() => {
    if (!drawerOpen) {
      loadedConversationIdRef.current = null;
    }
  }, [drawerOpen]);

  return {
    messages,
    loading,
    sending,
    loadMessages,
    sendMessage,
  };
};

