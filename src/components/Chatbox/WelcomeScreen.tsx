import React from "react";
import { Button, Typography, Space } from "antd";
import { MessageOutlined, RobotOutlined } from "@ant-design/icons";
import { useChat } from "../../context/ChatContext";
import "./Chatbox.css";

const { Title, Text } = Typography;

const WelcomeScreen: React.FC = () => {
  const { sendMessage, conversation } = useChat();

  const handleStartChat = async () => {
    if (conversation) {
      await sendMessage("Xin chào!");
    }
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-header">
          <div className="welcome-icon-wrapper">
            <RobotOutlined className="welcome-icon" />
            <span className="welcome-status-dot"></span>
          </div>
          <div className="welcome-title-section">
            <Title level={4} className="welcome-title">
              BookStay
            </Title>
            <Text type="secondary" className="welcome-subtitle">
              AI assistant
            </Text>
          </div>
        </div>

        <div className="welcome-message">
          <div className="welcome-message-bubble">
            <div className="welcome-message-icon">
              <MessageOutlined />
            </div>
            <div className="welcome-message-content">
              <Text>
                Chào mừng bạn đến với BookStay! Tôi là trợ lý AI, sẵn sàng hỗ
                trợ bạn về:
              </Text>
              <ul className="welcome-features">
                <li>Thông tin phòng và dịch vụ</li>
                <li>Quy trình đặt phòng</li>
                <li>Chính sách hủy và hoàn tiền</li>
                <li>Hướng dẫn check-in/check-out</li>
              </ul>
              <Text strong>Bạn muốn biết thêm điều gì?</Text>
            </div>
          </div>
        </div>

        <div className="welcome-action">
          <Button
            type="primary"
            size="large"
            block
            icon={<MessageOutlined />}
            onClick={handleStartChat}
            className="start-chat-button"
          >
            Bắt đầu
          </Button>
        </div>

        <div className="welcome-footer">
          <Text type="secondary" className="powered-by">
            Powered by <span className="powered-by-brand">BookStay AI</span>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
