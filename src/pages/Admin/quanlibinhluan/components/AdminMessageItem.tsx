import React from 'react';
import { Avatar, Typography } from 'antd';
import { RobotOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { AdminMessage } from '../../../../service/adminConversationService';

const { Text } = Typography;

interface AdminMessageItemProps {
  message: AdminMessage;
}

const AdminMessageItem: React.FC<AdminMessageItemProps> = ({ message }) => {
  const isAI = message.message_type === 'ai';
  const isAdmin = message.sender?.role === 'admin' || message.sender?.role === 'staff';

  const getMessageClassName = () => {
    if (isAI) return 'message-ai';
    if (isAdmin) return 'message-admin';
    return 'message-user';
  };

  const getSenderName = () => {
    if (isAI) return 'AI Assistant';
    if (isAdmin) return message.sender?.full_name || 'Admin';
    return message.sender?.full_name || message.sender?.email || 'User';
  };

  const getAvatarIcon = () => {
    if (isAI) return <RobotOutlined />;
    return <UserOutlined />;
  };

  return (
    <div className={`message-item ${getMessageClassName()}`}>
      <div className="message-header">
        <Avatar
          src={message.sender?.avatar_url}
          icon={getAvatarIcon()}
          size="small"
        />
        <div className="message-info">
          <Text strong>{getSenderName()}</Text>
          <Text type="secondary" style={{ fontSize: '11px', marginLeft: '8px' }}>
            {dayjs(message.created_at).format('DD/MM/YYYY HH:mm')}
          </Text>
        </div>
      </div>
      <div className="message-content">{message.content}</div>
    </div>
  );
};

export default AdminMessageItem;

