import React from 'react';
import { List, Space, Tag, Typography, Badge } from 'antd';
import dayjs from 'dayjs';
import type { AdminConversation } from '../../../../service/adminConversationService';
import {
  getConversationTitle,
  getConversationAvatar,
  getConversationTypeColor,
  getConversationTypeLabel,
} from '../utils/conversationUtils';

const { Text } = Typography;

interface ConversationItemProps {
  conversation: AdminConversation;
  isSelected: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick,
}) => {
  return (
    <List.Item
      className={`conversation-item ${isSelected ? 'active' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <List.Item.Meta
        avatar={
          <Badge count={conversation.unread_count} offset={[-5, 5]}>
            {getConversationAvatar(conversation)}
          </Badge>
        }
        title={
          <Space>
            <span>{getConversationTitle(conversation)}</span>
            <Tag color={getConversationTypeColor(conversation.type)}>
              {getConversationTypeLabel(conversation.type)}
            </Tag>
          </Space>
        }
        description={
          <div>
            {conversation.latest_message && (
              <Text ellipsis style={{ fontSize: '12px', color: '#666' }}>
                {conversation.latest_message.content}
              </Text>
            )}
            <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
              {dayjs(conversation.updated_at).format('DD/MM/YYYY HH:mm')}
            </div>
          </div>
        }
      />
    </List.Item>
  );
};

export default ConversationItem;

