import React, { useState, useEffect } from 'react';
import { FloatButton } from 'antd';
import { MessageOutlined, CloseOutlined } from '@ant-design/icons';
import { useChat } from '../../context/ChatContext';
import ChatWindow from './ChatWindow';
import './Chatbox.css';

const Chatbox: React.FC = () => {
  const { isOpen, toggleChat, messages } = useChat();
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const unreadCount = messages.filter((msg) => msg.message_type === 'ai' && !msg.is_read).length;

  // Kiểm tra route hiện tại (không dùng useLocation vì Chatbox render bên ngoài Router)
  useEffect(() => {
    const checkRoute = () => {
      setIsAdminRoute(window.location.pathname.startsWith('/admin'));
    };

    // Kiểm tra lần đầu
    checkRoute();

    // Lắng nghe thay đổi route (popstate cho browser back/forward)
    window.addEventListener('popstate', checkRoute);

    // Lắng nghe thay đổi route bằng cách kiểm tra định kỳ (fallback)
    const interval = setInterval(checkRoute, 100);

    return () => {
      window.removeEventListener('popstate', checkRoute);
      clearInterval(interval);
    };
  }, []);

  // Ẩn chatbox khi đang ở trang admin
  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <FloatButton
          icon={<MessageOutlined />}
          type="primary"
          style={{
            right: 24,
            bottom: 24,
            width: 56,
            height: 56,
            zIndex: 1000,
          }}
          onClick={toggleChat}
          badge={{ count: unreadCount > 0 ? unreadCount : undefined }}
          tooltip="Chat với hỗ trợ"
        />
      )}

      {/* Chat Window */}
      {isOpen && <ChatWindow />}
    </>
  );
};

export default Chatbox;

