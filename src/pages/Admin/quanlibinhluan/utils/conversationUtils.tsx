import React from 'react';
import { Avatar } from 'antd';
import { RobotOutlined, UserOutlined } from '@ant-design/icons';
import type { AdminConversation } from '../../../../service/adminConversationService';

/**
 * Get conversation title based on type and participants
 */
export const getConversationTitle = (conversation: AdminConversation): string => {
  if (conversation.type === 'user_to_ai') {
    if (conversation.participants.length > 0) {
      return conversation.participants[0].full_name || conversation.participants[0].email;
    }
    return 'Guest User';
  }
  // user_to_user
  if (conversation.participants.length > 0) {
    return conversation.participants.map((p) => p.full_name || p.email).join(', ');
  }
  return 'Conversation';
};

/**
 * Get conversation avatar based on type
 */
export const getConversationAvatar = (conversation: AdminConversation): React.ReactNode => {
  if (conversation.type === 'user_to_ai') {
    return <RobotOutlined />;
  }
  if (conversation.participants.length > 0) {
    const participant = conversation.participants[0];
    return <Avatar src={participant.avatar_url} icon={<UserOutlined />} />;
  }
  return <UserOutlined />;
};

/**
 * Get conversation type tag color
 */
export const getConversationTypeColor = (type: string): string => {
  return type === 'user_to_ai' ? 'blue' : 'green';
};

/**
 * Get conversation type label
 */
export const getConversationTypeLabel = (type: string): string => {
  return type === 'user_to_ai' ? 'AI Chat' : 'User Chat';
};

