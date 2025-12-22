import React from 'react';
import { Avatar, Typography } from 'antd';
import { UserOutlined, HomeOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import type { ChatMessage } from '../../types/chat/chat';
import './Chatbox.css';

const { Text } = Typography;

interface MessageItemProps {
  message: ChatMessage;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { isLoggedIn, user } = useAuth();
  const isAI = message.message_type === 'ai';
  const isUser = message.message_type === 'user';
  
  // Check if message is from admin
  const isAdmin = message.sender?.role === 'admin' || message.sender?.role === 'staff';
  
  // Determine sender name - Show user's name and avatar for logged-in users
  const getSenderName = () => {
    // AI messages always show "BookStay"
    if (isAI) {
      return 'BookStay';
    }
    // Admin messages can show admin name
    if (isAdmin) {
      return message.sender?.full_name || 'Admin';
    }
    // For logged-in users: show their actual name
    if (isLoggedIn && message.sender) {
      return message.sender.full_name || message.sender.email || 'Bạn';
    }
    // For logged-in users but no sender data: show "Bạn"
    if (isLoggedIn) {
      return user?.full_name || user?.email || 'Bạn';
    }
    // Guest user messages
    return 'Khách';
  };

  // Determine avatar and color
  const getAvatarConfig = () => {
    // AI messages
    if (isAI) {
      return {
        icon: <HomeOutlined />,
        backgroundColor: '#666',
        className: 'message-ai',
        src: null,
      };
    }
    // Admin messages
    if (isAdmin) {
      return {
        icon: <CustomerServiceOutlined />,
        backgroundColor: '#666',
        className: 'message-admin',
        src: message.sender?.avatar_url,
      };
    }
    // For logged-in users: show their avatar
    if (isLoggedIn) {
      const avatarUrl = message.sender?.avatar_url || user?.avatar_url;
      return {
        icon: <UserOutlined />,
        backgroundColor: '#87d068',
        className: 'message-user',
        src: avatarUrl,
      };
    }
    // Guest users
    return {
      icon: <UserOutlined />,
      backgroundColor: '#87d068',
      className: 'message-user',
      src: message.sender?.avatar_url,
    };
  };

  const avatarConfig = getAvatarConfig();

  return (
    <div className={`message-item ${avatarConfig.className}`}>
      <div className="message-avatar">
        <Avatar
          icon={avatarConfig.icon}
          src={avatarConfig.src}
          style={{ backgroundColor: avatarConfig.backgroundColor }}
        />
      </div>
      <div className="message-content">
        <div className="message-header">
          <Text strong className="message-sender">
            {getSenderName()}
          </Text>
          <Text type="secondary" className="message-time">
            {new Date(message.created_at).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </div>
        <div className="message-text">
          <Text>{message.content}</Text>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;

