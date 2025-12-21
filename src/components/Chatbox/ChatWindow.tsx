import React, { useEffect, useRef } from "react";
import { Button, Typography, Dropdown } from "antd";
import {
  CloseOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  MoreOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useChat } from "../../context/ChatContext";
import MessageList from "./MessageList";
import InputBox from "./InputBox";
import "./Chatbox.css";

const { Title } = Typography;

const ChatWindow: React.FC = () => {
  const { isOpen, closeChat, clearHistory, conversation, isLoading, messages, resetToModeSelection } =
    useChat();
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleClearHistory = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử chat?")) {
      await clearHistory();
    }
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "clear",
      label: "Xóa lịch sử",
      icon: <DeleteOutlined />,
      onClick: handleClearHistory,
      disabled: messages.length === 0 || isLoading,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="chatbox-fixed-container">
      <div className="chatbox-fixed-box" ref={drawerRef}>
        {/* Header */}
        <div className="chat-header">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={resetToModeSelection}
            className="chat-header-back"
            title="Quay lại"
          />
          <div className="chat-header-center">
            <MessageOutlined className="chat-header-icon" />
            <div className="chat-header-title-group">
              <Title level={5} className="chat-header-title">
                BookStay
              </Title>
              <span className="chat-header-subtitle">Hỗ trợ khách hàng</span>
            </div>
          </div>
          <div className="chat-header-actions">
            <Dropdown
              menu={{ items: menuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                className="chat-header-menu"
                title="Menu"
              />
            </Dropdown>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={closeChat}
              className="chat-header-close"
              title="Đóng"
            />
          </div>
        </div>

        {/* Content */}
        <div className="chat-window">
          <MessageList />
          {conversation && <InputBox />}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
