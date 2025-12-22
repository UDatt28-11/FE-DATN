import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import chatService from "../service/chatService";
import type {
  ChatMessage,
  ChatConversation,
  ChatContext as ChatContextType,
} from "../types/chat/chat";
import { useAuth } from "./AuthContext";

interface ChatContextValue {
  // State
  isOpen: boolean;
  isLoading: boolean;
  messages: ChatMessage[];
  conversation: ChatConversation | null;
  sessionId: string | null;
  context: ChatContextType | null;
  chatMode: "admin" | "ai" | null; // null = chưa chọn

  // Actions
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  resetToModeSelection: () => void;
  initializeConversationWithMode: (mode: "admin" | "ai") => Promise<void>;
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
  const [conversation, setConversation] = useState<ChatConversation | null>(
    null
  );
  const [sessionId, setSessionId] = useState<string | null>(() => {
    // Initialize from localStorage if exists (will be cleared if user is logged in)
    if (typeof window !== "undefined") {
      return localStorage.getItem("chat_session_id") || null;
    }
    return null;
  });
  const [context, setContextState] = useState<ChatContextType | null>(null);
  const [chatMode, setChatMode] = useState<"admin" | "ai" | null>(null);
  const [
    loadingMessagesForConversationId,
    setLoadingMessagesForConversationId,
  ] = useState<number | null>(null);
  const loadedConversationIdRef = React.useRef<number | null>(null);
  // Store conversation IDs separately for each mode to avoid confusion
  const adminConversationIdRef = React.useRef<number | null>(null);
  const aiConversationIdRef = React.useRef<number | null>(null);

  // Initialize session ID for guest users
  useEffect(() => {
    if (!isLoggedIn) {
      // Generate or get session ID from localStorage for guests
      if (!sessionId) {
        let storedSessionId = localStorage.getItem("chat_session_id");
        if (!storedSessionId) {
          storedSessionId = crypto.randomUUID();
          localStorage.setItem("chat_session_id", storedSessionId);
        }
        setSessionId(storedSessionId);
      }
    } else {
      // Clear session ID for logged-in users
      if (sessionId) {
        setSessionId(null);
        localStorage.removeItem("chat_session_id");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]); // Only depend on isLoggedIn to avoid infinite loop

  // Internal function to load messages with explicit parameters
  const _loadMessages = useCallback(
    async (
      conversationId: number,
      currentSessionId?: string,
      forceReload = false
    ) => {
      if (!conversationId) return;

      // Prevent duplicate fetch if already loading for this conversation
      if (loadingMessagesForConversationId === conversationId && isLoading) {
        return;
      }

      // If we already loaded messages for this conversation and not forcing reload, skip
      if (
        !forceReload &&
        loadedConversationIdRef.current === conversationId &&
        messages.length > 0
      ) {
        return;
      }

      try {
        setLoadingMessagesForConversationId(conversationId);
        setIsLoading(true);
        const sessionIdToUse =
          currentSessionId ||
          sessionId ||
          localStorage.getItem("chat_session_id") ||
          undefined;
        const response = await chatService.getMessages(
          conversationId,
          sessionIdToUse
        );

        // Reverse messages to show oldest first
        setMessages(response.data.reverse());
        loadedConversationIdRef.current = conversationId;
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsLoading(false);
        setLoadingMessagesForConversationId(null);
      }
    },
    [sessionId, isLoading, loadingMessagesForConversationId, messages.length]
  );

  // Public function that uses current conversation
  const loadMessages = useCallback(async () => {
    if (!conversation) return;
    await _loadMessages(conversation.id);
  }, [conversation, _loadMessages]);

  const initializeConversationWithMode = useCallback(
    async (mode: "admin" | "ai") => {
      const expectedType = mode === "admin" ? "user_to_user" : "user_to_ai";

      console.log("[ChatContext] initializeConversationWithMode:", {
        mode,
        expectedType,
        currentConversation: conversation?.id,
        currentConversationType: conversation?.type,
        currentChatMode: chatMode,
        storedAdminId: adminConversationIdRef.current,
        storedAIId: aiConversationIdRef.current,
      });

      // Get stored conversation ID for this mode
      const storedConversationId =
        mode === "admin"
          ? adminConversationIdRef.current
          : aiConversationIdRef.current;

      // If we have a stored conversation ID for this mode and it matches current conversation
      // AND current conversation type matches, reuse it
      if (
        storedConversationId &&
        conversation &&
        conversation.id === storedConversationId
      ) {
        const conversationType = conversation.type;
        if (conversationType === expectedType && chatMode === mode) {
          console.log(
            "[ChatContext] Reusing stored conversation for mode:",
            mode,
            "id:",
            storedConversationId
          );
          // Just load messages if needed
          if (
            loadedConversationIdRef.current !== conversation.id ||
            messages.length === 0
          ) {
            await _loadMessages(conversation.id);
          }
          return;
        }
      }

      // If current conversation exists but doesn't match the requested mode, clear it
      if (conversation) {
        const conversationType = conversation.type;
        if (conversationType !== expectedType || chatMode !== mode) {
          console.log(
            "[ChatContext] Current conversation doesn't match mode, clearing state"
          );
          setConversation(null);
          setMessages([]);
          loadedConversationIdRef.current = null;
        }
      }

      try {
        setIsLoading(true);
        // Always set chatMode to the requested mode
        setChatMode(mode);
        const currentSessionId =
          sessionId || localStorage.getItem("chat_session_id") || undefined;
        console.log(
          "[ChatContext] Fetching conversation with mode:",
          mode,
          "sessionId:",
          currentSessionId
        );
        const response = await chatService.getConversation(
          currentSessionId,
          mode
        );

        const newConversation = response.data;
        console.log("[ChatContext] Received conversation:", {
          id: newConversation?.id,
          type: newConversation?.type,
          expectedType,
        });

        // Verify the conversation type matches what we requested
        if (newConversation && newConversation.type !== expectedType) {
          console.warn(
            `[ChatContext] Conversation type mismatch: expected ${expectedType}, got ${newConversation.type}`
          );
          throw new Error(
            `Conversation type mismatch: expected ${expectedType}, got ${newConversation.type}`
          );
        }

        // Only set conversation if type matches
        if (newConversation && newConversation.type === expectedType) {
          setConversation(newConversation);
          // Store conversation ID for this mode
          if (mode === "admin") {
            adminConversationIdRef.current = newConversation.id;
          } else {
            aiConversationIdRef.current = newConversation.id;
          }
        } else {
          throw new Error("Invalid conversation type received");
        }

        if (response.session_id) {
          setSessionId(response.session_id);
          localStorage.setItem("chat_session_id", response.session_id);
        }

        // Always load messages for the new conversation
        console.log(
          "[ChatContext] Loading messages for conversation:",
          newConversation.id
        );
        await _loadMessages(
          newConversation.id,
          response.session_id || currentSessionId
        );

        // Auto open chat when mode is selected
        if (!isOpen) {
          setIsOpen(true);
        }
      } catch (error) {
        console.error("[ChatContext] Error initializing conversation:", error);
        // Reset state on error
        setChatMode(null);
        setConversation(null);
      } finally {
        setIsLoading(false);
      }
    },
    [conversation, sessionId, isOpen, messages.length, _loadMessages, chatMode]
  );

  // Auto-polling for messages when chatbox is open and user is not interacting
  // This ensures users always see new replies, especially for admin chat
  useEffect(() => {
    if (!conversation || !isOpen) return;

    const currentSessionId =
      sessionId || localStorage.getItem("chat_session_id") || undefined;

    // Poll more frequently for admin mode (to get admin replies)
    // Poll less frequently for AI mode (AI responds immediately, no need for frequent polling)
    const pollInterval = chatMode === "admin" ? 15000 : 10000; // 5s for admin, 10s for AI

    const interval = setInterval(() => {
      // Force reload when polling to get new messages
      _loadMessages(conversation.id, currentSessionId, true);
    }, pollInterval);

    return () => clearInterval(interval);
  }, [conversation?.id, isOpen, chatMode, sessionId, _loadMessages]);

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
          message_type: "user",
          is_read: false,
          is_hidden: false,
          sender: user
            ? {
                id: user.id,
                full_name: user.full_name || user.email || "User",
                email: user.email || "",
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
          const existingIds = new Set(filtered.map((m) => m.id));
          const uniqueNewMessages = newMessages.filter(
            (m) => !existingIds.has(m.id)
          );
          return [...filtered, ...uniqueNewMessages];
        });
      } catch (error: any) {
        console.error("Error sending message:", error);
        
        // Remove temp message on error
        setMessages((prev) => {
          const filtered = prev.filter((msg) => msg.id !== tempUserMessage.id);
          
          // Add error message from AI/BookStay
          const errorMessage: ChatMessage = {
            id: Date.now() + 1,
            conversation_id: conversation.id,
            sender_id: null,
            content: error?.response?.data?.message || 
                     error?.message || 
                     "Xin lỗi, dịch vụ AI chat hiện đang tạm thời không khả dụng. Vui lòng thử lại sau hoặc liên hệ với chúng tôi qua email.",
            message_type: "ai",
            is_read: false,
            is_hidden: false,
            sender: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          return [...filtered, errorMessage];
        });
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
      // Reset loaded conversation reference after clearing
      loadedConversationIdRef.current = null;
    } catch (error) {
      console.error("Error clearing history:", error);
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
    // Reset loaded conversation reference
    loadedConversationIdRef.current = null;
    // Clear messages when closing
    setMessages([]);
    setConversation(null);
  }, []);

  const resetToModeSelection = useCallback(() => {
    // Reset conversation and mode to show mode selection screen
    console.log("[ChatContext] resetToModeSelection - clearing all state");
    setConversation(null);
    setChatMode(null);
    setMessages([]);
    // Reset loaded conversation reference
    loadedConversationIdRef.current = null;
    // Don't reset adminConversationIdRef and aiConversationIdRef - keep them for reuse
    // This allows switching between modes without losing conversation references
    // Keep chatbox open to show mode selection
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
      resetToModeSelection,
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
      resetToModeSelection,
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
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
