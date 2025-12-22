import { useState, useEffect, useCallback } from 'react';
import { message as antdMessage } from 'antd';
import adminConversationService, {
  type AdminConversation,
} from '../../../../service/adminConversationService';

type TypeFilter = 'all' | 'user_to_user' | 'user_to_ai';

export const useConversations = (typeFilter: TypeFilter) => {
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [loading, setLoading] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        per_page: 50,
      };
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }
      const response = await adminConversationService.getConversations(params);
      setConversations(response.data);
    } catch (error: any) {
      antdMessage.error('Không thể tải danh sách cuộc trò chuyện');
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  // Load conversations only when typeFilter changes, not when loadConversations changes
  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]); // Only depend on typeFilter, not loadConversations

  return {
    conversations,
    loading,
    reloadConversations: loadConversations,
  };
};

