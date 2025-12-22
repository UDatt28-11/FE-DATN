import React from 'react';
import { Button, Card, Typography, Space } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import { useChat } from '../../context/ChatContext';
import './Chatbox.css';

const { Title, Text } = Typography;

const ModeSelection: React.FC = () => {
  const { initializeConversationWithMode } = useChat();

  const handleSelectMode = async (mode: 'admin' | 'ai') => {
    await initializeConversationWithMode(mode);
  };

  return (
    <div className="mode-selection-container">
      <div className="mode-selection-content">
        <Title level={4} style={{ textAlign: 'center', marginBottom: '24px', fontSize: '18px' }}>
          Chọn phương thức chat
        </Title>
        
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Chat với Admin */}
          <Card
            hoverable
            onClick={() => handleSelectMode('admin')}
            style={{
              border: '2px solid #e8e8e8',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              marginBottom: '0',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#cb8670';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(203, 134, 112, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e8e8e8';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#cb8670',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    flexShrink: 0,
                  }}
                >
                  <UserOutlined />
                </div>
                <div style={{ flex: 1 }}>
                  <Title level={5} style={{ margin: 0, fontSize: '16px' }}>
                    Chat với Admin
                  </Title>
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    Nhân viên hỗ trợ sẽ trả lời bạn
                  </Text>
                </div>
              </div>
              <Text style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
                • Phản hồi từ nhân viên hỗ trợ<br />
                • Thời gian phản hồi: Trong giờ làm việc<br />
                • Phù hợp cho các câu hỏi phức tạp
              </Text>
            </Space>
          </Card>

          {/* Chat với AI */}
          <Card
            hoverable
            onClick={() => handleSelectMode('ai')}
            style={{
              border: '2px solid #e8e8e8',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              marginBottom: '0',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#52c41a';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(82, 196, 26, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e8e8e8';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#52c41a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    flexShrink: 0,
                  }}
                >
                  <RobotOutlined />
                </div>
                <div style={{ flex: 1 }}>
                  <Title level={5} style={{ margin: 0, fontSize: '16px' }}>
                    Chat với AI
                  </Title>
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    Trợ lý AI tự động trả lời ngay lập tức
                  </Text>
                </div>
              </div>
              <Text style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
                • Phản hồi tự động 24/7<br />
                • Trả lời ngay lập tức<br />
                • Hỗ trợ về đặt phòng, dịch vụ, chính sách
              </Text>
            </Space>
          </Card>
        </Space>
      </div>
    </div>
  );
};

export default ModeSelection;

