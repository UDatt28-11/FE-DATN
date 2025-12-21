import React from 'react';
import { Card, List, Spin, Empty } from 'antd';
import type { ReactNode } from 'react';
import type { AdminConversation } from '../../../../service/adminConversationService';
import ConversationItem from './ConversationItem';

interface ConversationListProps {
  conversations: AdminConversation[];
  loading: boolean;
  selectedConversationId: number | null;
  onSelectConversation: (conversation: AdminConversation) => void;
  title?: string;
  icon?: ReactNode;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  loading,
  selectedConversationId,
  onSelectConversation,
  title = "Danh sách cuộc trò chuyện",
  icon,
}) => {
  return (
    <Card 
      className="conversations-list-card" 
      title={
        <span>
          {icon && <span style={{ marginRight: 8 }}>{icon}</span>}
          {title}
        </span>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      ) : conversations.length === 0 ? (
        <Empty description="Chưa có cuộc trò chuyện nào" />
      ) : (
        <List
          dataSource={conversations}
          renderItem={(conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversationId === conversation.id}
              onClick={() => onSelectConversation(conversation)}
            />
          )}
        />
      )}
    </Card>
  );
};

export default ConversationList;

