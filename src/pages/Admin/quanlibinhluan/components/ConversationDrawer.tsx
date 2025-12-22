import React, { useState } from 'react';
import { Drawer, Button, Space, Tag, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import type { AdminConversation, AdminMessage } from '../../../../service/adminConversationService';
import {
  getConversationTitle,
  getConversationAvatar,
  getConversationTypeColor,
  getConversationTypeLabel,
} from '../utils/conversationUtils';
import MessageList from './MessageList';
import ReplyBox from './ReplyBox';

const { Title } = Typography;

interface ConversationDrawerProps {
  conversation: AdminConversation | null;
  messages: AdminMessage[];
  messagesLoading: boolean;
  sending: boolean;
  open: boolean;
  onClose: () => void;
  onSendReply: (content: string) => Promise<void>;
}

const ConversationDrawer: React.FC<ConversationDrawerProps> = ({
  conversation,
  messages,
  messagesLoading,
  sending,
  open,
  onClose,
  onSendReply,
}) => {
  const [replyContent, setReplyContent] = useState('');

  const handleSend = async () => {
    if (!replyContent.trim() || !conversation) return;
    
    await onSendReply(replyContent);
    setReplyContent('');
  };

  if (!conversation) return null;

  return (
    <Drawer
      title={
        <div>
          <Space>
            {getConversationAvatar(conversation)}
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {getConversationTitle(conversation)}
              </Title>
              <Tag color={getConversationTypeColor(conversation.type)}>
                {getConversationTypeLabel(conversation.type)}
              </Tag>
            </div>
          </Space>
        </div>
      }
      placement="right"
      width={600}
      open={open}
      onClose={onClose}
      extra={
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
        />
      }
    >
      <MessageList
        messages={messages}
        loading={messagesLoading}
        drawerOpen={open}
      />
      <ReplyBox
        content={replyContent}
        loading={sending}
        onChange={setReplyContent}
        onSend={handleSend}
      />
    </Drawer>
  );
};

export default ConversationDrawer;

