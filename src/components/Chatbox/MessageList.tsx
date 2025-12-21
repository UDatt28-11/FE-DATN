import React, { useEffect, useRef } from 'react';
import { Spin, Empty, Alert } from 'antd';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import MessageItem from './MessageItem';
import WelcomeScreen from './WelcomeScreen';
import ModeSelection from './ModeSelection';
import './Chatbox.css';

const MessageList: React.FC = () => {
  const { messages, isLoading, conversation, chatMode } = useChat();
  const { isLoggedIn } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Show mode selection if no conversation and no mode selected
  if (!conversation && !chatMode) {
    return <ModeSelection />;
  }

  if (!conversation) {
    return (
      <div className="message-list-loading">
        <Spin size="large" tip="Đang khởi tạo chat..." />
      </div>
    );
  }

  if (isLoading && messages.length === 0) {
    return (
      <div className="message-list-loading">
        <Spin size="large" tip="Đang tải tin nhắn..." />
      </div>
    );
  }

  if (messages.length === 0) {
    return <WelcomeScreen />;
  }

  return (
    <div className="message-list" ref={messagesContainerRef}>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      {isLoading && !isLoggedIn && (
        <div className="message-loading-indicator">
          <Spin size="small" tip="AI đang suy nghĩ..." />
        </div>
      )}
      {isLoggedIn && messages.length > 0 && messages[messages.length - 1]?.message_type === 'user' && (
        <div style={{ padding: '8px 16px' }}>
          <Alert
            message="Tin nhắn đã được gửi"
            description="Admin sẽ trả lời bạn sớm nhất có thể."
            type="info"
            showIcon
            closable
            style={{ fontSize: '12px' }}
          />
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

