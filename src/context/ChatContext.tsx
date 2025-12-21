import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import chatService from '../service/chatService';
import type { ChatMessage, ChatConversation, ChatContext as ChatContextType } from '../types/chat/chat';
import { useAuth } from './AuthContext';

interface ChatContextValue {
  // State
  isOpen: boolean;
  isLoading: boolean;
  messages: ChatMessage[];
  conversation: ChatConversation | null;
  sessionId: string | null;
  context: ChatContextType | null;
  chatMode: 'admin' | 'ai' | null; // null = chưa chọn

  // Actions
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  initializeConversationWithMode: (mode: 'admin' | 'ai') => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  loadMessages: () => Promise<void>;
  clearHistory: () => Promise<void>;
  setContext: (context: ChatContextType | null) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    // Initialize from localStorage if exists (will be cleared if user is logged in)
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chat_session_id') || null;
    }
    return null;
  });
  const [context, setContextState] = useState<ChatContextType | null>(null);
  const [chatMode, setChatMode] = useState<'admin' | 'ai' | null>(null);

  // Initialize session ID for guest users
  useEffect(() => {
    if (!isLoggedIn) {
      // Generate or get session ID from localStorage for guests
      if (!sessionId) {
        let storedSessionId = localStorage.getItem('chat_session_id');
        if (!storedSessionId) {
          storedSessionId = crypto.randomUUID();
          localStorage.setItem('chat_session_id', storedSessionId);
        }
        setSessionId(storedSessionId);
      }
    } else {
      // Clear session ID for logged-in users
      if (sessionId) {
        setSessionId(null);
        localStorage.removeItem('chat_session_id');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]); // Only depend on isLoggedIn to avoid infinite loop

  const loadMessages = useCallback(async () => {
    if (!conversation) return;

    try {
      setIsLoading(true);
      const currentSessionId = sessionId || localStorage.getItem('chat_session_id') || undefined;
      const response = await chatService.getMessages(
        conversation.id,
        currentSessionId
      );
      
      // Reverse messages to show oldest first
      setMessages(response.data.reverse());
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [conversation, sessionId]);

  const initializeConversationWithMode = useCallback(async (mode: 'admin' | 'ai') => {
    if (conversation) return; // Don't initialize if already has conversation
    
    try {
      setIsLoading(true);
      setChatMode(mode);
      const currentSessionId = sessionId || localStorage.getItem('chat_session_id') || undefined;
      const response = await chatService.getConversation(currentSessionId, mode);
      setConversation(response.data);
      if (response.session_id) {
        setSessionId(response.session_id);
        localStorage.setItem('chat_session_id', response.session_id);
      }
      // Auto open chat when mode is selected
      if (!isOpen) {
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
    } finally {
      setIsLoading(false);
    }
  }, [conversation, sessionId, isOpen]);

  // Load messages when conversation is available
  useEffect(() => {
    if (conversation && isOpen) {
      loadMessages();
    }
  }, [conversation, isOpen, loadMessages]);

  // Poll for new messages (for admin mode to get admin replies)
  useEffect(() => {
    if (!conversation || !isOpen || chatMode !== 'admin') return;

    const pollInterval = setInterval(() => {
      loadMessages();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [conversation, isOpen, chatMode, loadMessages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversation || !content.trim()) return;

      try {
        setIsLoading(true);

        // Add user message to UI immediately (optimistic update)
        const tempUserMessage: ChatMessage = {
          id: Date.now(), // Temporary ID
          conversation_id: conversation.id,
          sender_id: user?.id || null,
          content: content.trim(),
          message_type: 'user',
          is_read: false,
          is_hidden: false,
          sender: user
            ? {
                id: user.id,
                full_name: user.full_name || user.email || 'User',
                email: user.email || '',
                avatar_url: user.avatar_url || null,
              }
            : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, tempUserMessage]);

        // Send to API
        const response = await chatService.sendMessage(
          conversation.id,
          content.trim(),
          sessionId || undefined,
          context || undefined
        );

        // Replace temp message with real message and add AI response if available
        setMessages((prev) => {
          // Remove only the temp message, keep all other messages
          const filtered = prev.filter((msg) => msg.id !== tempUserMessage.id);
          const newMessages = [response.data.user_message];
          
          // Add AI message if available (for AI mode)
          if (response.data.ai_message) {
            newMessages.push(response.data.ai_message);
          }
          
          // Merge with existing messages, avoiding duplicates
          const existingIds = new Set(filtered.map(m => m.id));
          const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id));
          return [...filtered, ...uniqueNewMessages];
        });
      } catch (error) {
        console.error('Error sending message:', error);
        // Remove temp message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== Date.now()));
      } finally {
        setIsLoading(false);
      }
    },
    [conversation, sessionId, context, user]
  );

  const clearHistory = useCallback(async () => {
    if (!conversation) return;

    try {
      setIsLoading(true);
      await chatService.clearHistory(conversation.id, sessionId || undefined);
      setMessages([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [conversation, sessionId]);

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    // Reset chat mode when closing (user will need to choose again next time)
    setChatMode(null);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const setContext = useCallback((newContext: ChatContextType | null) => {
    setContextState(newContext);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      isLoading,
      messages,
      conversation,
      sessionId,
      context,
      chatMode,
      openChat,
      closeChat,
      toggleChat,
      initializeConversationWithMode,
      sendMessage,
      loadMessages,
      clearHistory,
      setContext,
    }),
    [
      isOpen,
      isLoading,
      messages,
      conversation,
      sessionId,
      context,
      chatMode,
      openChat,
      closeChat,
      toggleChat,
      initializeConversationWithMode,
      sendMessage,
      loadMessages,
      clearHistory,
      setContext,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

