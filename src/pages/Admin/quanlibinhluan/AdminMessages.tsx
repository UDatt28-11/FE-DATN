import React, { useState, useCallback } from 'react';
import { Typography, Select, message as antdMessage } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import type { AdminConversation } from '../../../service/adminConversationService';
import { useConversations } from './hooks/useConversations';
import { useMessages } from './hooks/useMessages';
import ConversationList from './components/ConversationList';
import ConversationDrawer from './components/ConversationDrawer';
import './AdminMessages.css';

const { Title } = Typography;
const { Option } = Select;

const AdminMessages: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState<'all' | 'user_to_user' | 'user_to_ai'>('all');
  const [selectedConversation, setSelectedConversation] = useState<AdminConversation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { conversations, loading, reloadConversations } = useConversations(typeFilter);
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
        // Only refresh conversations list (not reload messages) to update latest message
        // Use setTimeout to avoid blocking UI
        setTimeout(() => {
          reloadConversations();
        }, 500);
        antdMessage.success('Đã gửi phản hồi');
      } catch (error) {
        // Error already handled in useMessages hook
      }
    },
    [selectedConversation, sendMessage, reloadConversations]
  );

  return (
    <div className="admin-messages-container">
      <div className="admin-messages-header">
        <Title level={2}>
          <MessageOutlined /> Quản lý tin nhắn
        </Title>
        <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 200 }}>
          <Option value="all">Tất cả</Option>
          <Option value="user_to_user">User to User</Option>
          <Option value="user_to_ai">AI Chat</Option>
        </Select>
      </div>

      <div className="admin-messages-content">
        <ConversationList
          conversations={conversations}
          loading={loading}
          selectedConversationId={selectedConversation?.id ?? null}
          onSelectConversation={handleSelectConversation}
        />

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

