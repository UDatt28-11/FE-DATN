import React, { useState } from 'react';
import { Card, Row, Col, Typography, Switch, Select, Button, message, Divider } from 'antd';
import { 
  BellOutlined, 
  MailOutlined, 
  LockOutlined, 
  GlobalOutlined,
  MoonOutlined,
  SaveOutlined
} from '@ant-design/icons';
import './Settings.css';

const { Title, Text } = Typography;
const { Option } = Select;

const Settings: React.FC = () => {
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [showBookingHistory, setShowBookingHistory] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  // Preferences
  const [language, setLanguage] = useState('vi');
  const [currency, setCurrency] = useState('VND');
  const [theme, setTheme] = useState('light');

  const handleSaveSettings = () => {
    // TODO: Call API to save settings
    const settings = {
      notifications: {
        email: emailNotifications,
        push: pushNotifications,
        bookingReminders,
        promotional: promotionalEmails
      },
      privacy: {
        profileVisibility,
        showBookingHistory,
        twoFactorAuth
      },
      preferences: {
        language,
        currency,
        theme
      }
    };

    console.log('Saving settings:', settings);
    message.success('Cài đặt đã được lưu thành công!');
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <Title level={2}>Cài Đặt</Title>
        <Text type="secondary">Quản lý thông báo, quyền riêng tư và tùy chọn cá nhân</Text>
      </div>

      <Row gutter={[24, 24]} className="settings-content">
        <Col xs={24}>
          {/* Notifications Settings */}
          <Card title={
            <span>
              <BellOutlined style={{ marginRight: 8 }} />
              Thông báo
            </span>
          } className="settings-card">
            <div className="setting-item">
              <div className="setting-info">
                <Text strong>Thông báo qua Email</Text>
                <br />
                <Text type="secondary">Nhận thông báo về đặt phòng qua email</Text>
              </div>
              <Switch 
                checked={emailNotifications} 
                onChange={setEmailNotifications}
              />
            </div>

            <Divider />

            <div className="setting-item">
              <div className="setting-info">
                <Text strong>Thông báo đẩy</Text>
                <br />
                <Text type="secondary">Nhận thông báo đẩy trên trình duyệt</Text>
              </div>
              <Switch 
                checked={pushNotifications} 
                onChange={setPushNotifications}
              />
            </div>

            <Divider />

            <div className="setting-item">
              <div className="setting-info">
                <Text strong>Nhắc nhở đặt phòng</Text>
                <br />
                <Text type="secondary">Nhận nhắc nhở trước ngày check-in</Text>
              </div>
              <Switch 
                checked={bookingReminders} 
                onChange={setBookingReminders}
              />
            </div>

            <Divider />

            <div className="setting-item">
              <div className="setting-info">
                <Text strong>Email khuyến mãi</Text>
                <br />
                <Text type="secondary">Nhận thông tin về ưu đãi và khuyến mãi</Text>
              </div>
              <Switch 
                checked={promotionalEmails} 
                onChange={setPromotionalEmails}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24}>
          {/* Privacy Settings */}
          <Card title={
            <span>
              <LockOutlined style={{ marginRight: 8 }} />
              Quyền riêng tư & Bảo mật
            </span>
          } className="settings-card">
            <div className="setting-item">
              <div className="setting-info">
                <Text strong>Hiển thị hồ sơ</Text>
                <br />
                <Text type="secondary">Ai có thể xem hồ sơ của bạn</Text>
              </div>
              <Select 
                value={profileVisibility} 
                onChange={setProfileVisibility}
                style={{ width: 150 }}
              >
                <Option value="public">Công khai</Option>
                <Option value="private">Riêng tư</Option>
                <Option value="friends">Bạn bè</Option>
              </Select>
            </div>

            <Divider />

            <div className="setting-item">
              <div className="setting-info">
                <Text strong>Lịch sử đặt phòng</Text>
                <br />
                <Text type="secondary">Hiển thị lịch sử đặt phòng của bạn</Text>
              </div>
              <Switch 
                checked={showBookingHistory} 
                onChange={setShowBookingHistory}
              />
            </div>

            <Divider />

            <div className="setting-item">
              <div className="setting-info">
                <Text strong>Xác thực hai yếu tố (2FA)</Text>
                <br />
                <Text type="secondary">Tăng cường bảo mật cho tài khoản</Text>
              </div>
              <Switch 
                checked={twoFactorAuth} 
                onChange={setTwoFactorAuth}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24}>
          {/* Preferences */}
          <Card title={
            <span>
              <GlobalOutlined style={{ marginRight: 8 }} />
              Tùy chọn
            </span>
          } className="settings-card">
            <div className="setting-item">
              <div className="setting-info">
                <Text strong>Ngôn ngữ</Text>
                <br />
                <Text type="secondary">Chọn ngôn ngữ hiển thị</Text>
              </div>
              <Select 
                value={language} 
                onChange={setLanguage}
                style={{ width: 150 }}
              >
                <Option value="vi">Tiếng Việt</Option>
                <Option value="en">English</Option>
                <Option value="ja">日本語</Option>
                <Option value="ko">한국어</Option>
              </Select>
            </div>

            <Divider />

            <div className="setting-item">
              <div className="setting-info">
                <Text strong>Đơn vị tiền tệ</Text>
                <br />
                <Text type="secondary">Đơn vị tiền tệ mặc định</Text>
              </div>
              <Select 
                value={currency} 
                onChange={setCurrency}
                style={{ width: 150 }}
              >
                <Option value="VND">VND (₫)</Option>
                <Option value="USD">USD ($)</Option>
                <Option value="EUR">EUR (€)</Option>
                <Option value="JPY">JPY (¥)</Option>
              </Select>
            </div>

            <Divider />

            <div className="setting-item">
              <div className="setting-info">
                <Text strong>
                  <MoonOutlined style={{ marginRight: 4 }} />
                  Giao diện
                </Text>
                <br />
                <Text type="secondary">Chế độ hiển thị</Text>
              </div>
              <Select 
                value={theme} 
                onChange={setTheme}
                style={{ width: 150 }}
              >
                <Option value="light">Sáng</Option>
                <Option value="dark">Tối</Option>
                <Option value="auto">Tự động</Option>
              </Select>
            </div>
          </Card>
        </Col>

        <Col xs={24}>
          <div className="settings-actions">
            <Button 
              type="primary" 
              size="large"
              icon={<SaveOutlined />}
              onClick={handleSaveSettings}
            >
              Lưu tất cả cài đặt
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Settings;
