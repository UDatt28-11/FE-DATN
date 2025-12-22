import React, { useEffect, useRef } from 'react';
import { Spin } from 'antd';
import type { AdminMessage } from '../../../../service/adminConversationService';
import AdminMessageItem from './AdminMessageItem';

interface MessageListProps {
  messages: AdminMessage[];
  loading: boolean;
  drawerOpen: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, loading, drawerOpen }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Auto scroll to bottom when messages change (only if drawer is open)
  useEffect(() => {
    if (drawerOpen && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages.length, drawerOpen]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="messages-container" ref={messagesContainerRef}>
      {messages.map((msg) => (
        <AdminMessageItem key={msg.id} message={msg} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

