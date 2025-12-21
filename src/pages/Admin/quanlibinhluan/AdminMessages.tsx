import React, { useState, useCallback } from 'react';
import { Typography, message as antdMessage } from 'antd';
import { MessageOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import type { AdminConversation } from '../../../service/adminConversationService';
import { useConversations } from './hooks/useConversations';
import { useMessages } from './hooks/useMessages';
import ConversationList from './components/ConversationList';
import ConversationDrawer from './components/ConversationDrawer';
import './AdminMessages.css';

const { Title } = Typography;

const AdminMessages: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<AdminConversation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Load both types of conversations separately
  const { conversations: aiConversations, loading: aiLoading, reloadConversations: reloadAIConversations } = useConversations('user_to_ai');
  const { conversations: userConversations, loading: userLoading, reloadConversations: reloadUserConversations } = useConversations('user_to_user');

  const { messages, loading: messagesLoading, sending, sendMessage } = useMessages(
    selectedConversation?.id ?? null,
    drawerOpen
  );

  const handleSelectConversation = useCallback((conversation: AdminConversation) => {
    setSelectedConversation(conversation);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleSendReply = useCallback(
    async (content: string) => {
      if (!selectedConversation) return;

      try {
        await sendMessage(selectedConversation.id, content);
        // Refresh both conversation lists
        setTimeout(() => {
          reloadAIConversations();
          reloadUserConversations();
        }, 500);
        antdMessage.success('Đã gửi phản hồi');
      } catch (error) {
        // Error already handled in useMessages hook
      }
    },
    [selectedConversation, sendMessage, reloadAIConversations, reloadUserConversations]
  );

  return (
    <div className="admin-messages-container">
      <div className="admin-messages-header">
        <Title level={2}>
          <MessageOutlined /> Quản lý tin nhắn
        </Title>
      </div>

      <div className="admin-messages-content-two-columns">
        {/* Left Column - AI Chat */}
        <div className="conversations-column ai-chat-column">
          <ConversationList
            conversations={aiConversations}
            loading={aiLoading}
            selectedConversationId={selectedConversation?.id ?? null}
            onSelectConversation={handleSelectConversation}
            title="Danh sách cuộc trò chuyện AI"
            icon={<RobotOutlined />}
          />
        </div>

        {/* Right Column - User Chat */}
        <div className="conversations-column user-chat-column">
          <ConversationList
            conversations={userConversations}
            loading={userLoading}
            selectedConversationId={selectedConversation?.id ?? null}
            onSelectConversation={handleSelectConversation}
            title="Danh sách cuộc trò chuyện User"
            icon={<UserOutlined />}
          />
        </div>

        <ConversationDrawer
          conversation={selectedConversation}
          messages={messages}
          messagesLoading={messagesLoading}
          sending={sending}
          open={drawerOpen}
          onClose={handleCloseDrawer}
          onSendReply={handleSendReply}
        />
      </div>
    </div>
  );
};

export default AdminMessages;

