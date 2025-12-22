import React from 'react';
import { Modal, Button, Card, Typography, Space } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import './Chatbox.css';

const { Title, Text } = Typography;

interface ChatModeModalProps {
  open: boolean;
  onSelectMode: (mode: 'admin' | 'ai') => void;
  onCancel: () => void;
}

const ChatModeModal: React.FC<ChatModeModalProps> = ({ open, onSelectMode, onCancel }) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={600}
      className="chat-mode-modal"
    >
      <div style={{ padding: '20px 0' }}>
        <Title level={4} style={{ textAlign: 'center', marginBottom: '30px' }}>
          Chọn phương thức chat
        </Title>
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Chat với Admin */}
          <Card
            hoverable
            onClick={() => onSelectMode('admin')}
            style={{
              border: '2px solid #e8e8e8',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s',
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
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#cb8670',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                  }}
                >
                  <UserOutlined />
                </div>
                <div style={{ flex: 1 }}>
                  <Title level={5} style={{ margin: 0 }}>
                    Chat với Admin
                  </Title>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    Nhân viên hỗ trợ sẽ trả lời bạn
                  </Text>
                </div>
              </div>
              <Text style={{ fontSize: '13px', color: '#666', marginTop: '8px', display: 'block' }}>
                • Phản hồi từ nhân viên hỗ trợ<br />
                • Thời gian phản hồi: Trong giờ làm việc<br />
                • Phù hợp cho các câu hỏi phức tạp
              </Text>
            </Space>
          </Card>

          {/* Chat với AI */}
          <Card
            hoverable
            onClick={() => onSelectMode('ai')}
            style={{
              border: '2px solid #e8e8e8',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s',
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
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#52c41a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                  }}
                >
                  <RobotOutlined />
                </div>
                <div style={{ flex: 1 }}>
                  <Title level={5} style={{ margin: 0 }}>
                    Chat với AI
                  </Title>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    Trợ lý AI tự động trả lời ngay lập tức
                  </Text>
                </div>
              </div>
              <Text style={{ fontSize: '13px', color: '#666', marginTop: '8px', display: 'block' }}>
                • Phản hồi tự động 24/7<br />
                • Trả lời ngay lập tức<br />
                • Hỗ trợ về đặt phòng, dịch vụ, chính sách
              </Text>
            </Space>
          </Card>
        </Space>
      </div>
    </Modal>
  );
};

export default ChatModeModal;

