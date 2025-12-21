import React from 'react';
import { Card, List, Spin, Empty } from 'antd';
import type { AdminConversation } from '../../../../service/adminConversationService';
import ConversationItem from './ConversationItem';

interface ConversationListProps {
  conversations: AdminConversation[];
  loading: boolean;
  selectedConversationId: number | null;
  onSelectConversation: (conversation: AdminConversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  loading,
  selectedConversationId,
  onSelectConversation,
}) => {
  return (
    <Card className="conversations-list-card" title="Danh sách cuộc trò chuyện">
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

