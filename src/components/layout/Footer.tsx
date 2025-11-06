import React from 'react';
import { Row, Col, Typography, Layout } from 'antd';
import { PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Title, Paragraph, Link } = Typography;

const Footer: React.FC = () => {
  return (
    <AntFooter
      style={{
        backgroundColor: '#1c1c1c',
        color: '#fff',
        padding: '4rem 0 2rem',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={24} md={8}>
            <Title level={5} style={{ color: '#cb8670', marginBottom: '1.5rem' }}>
              About Us
            </Title>
            <Paragraph style={{ color: '#8a8a8a', lineHeight: 1.6 }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris vel consectetur dolor. Aenean rutrum magna at ligula.
            </Paragraph>
          </Col>

          <Col xs={24} sm={24} md={8}>
            <Title level={5} style={{ color: '#cb8670', marginBottom: '1.5rem' }}>
              Contact Us
            </Title>
            <div style={{ color: '#8a8a8a' }}>
              <Paragraph style={{ marginBottom: '0.5rem' }}>
                <PhoneOutlined style={{ marginRight: '8px' }} />
                Phone: +12 345 678 9
              </Paragraph>
              <Paragraph style={{ marginBottom: '0.5rem' }}>
                <MailOutlined style={{ marginRight: '8px' }} />
                Email: info@palatin.com
              </Paragraph>
              <Paragraph style={{ marginBottom: '0.5rem' }}>
                <EnvironmentOutlined style={{ marginRight: '8px' }} />
                Address: Main Str. no 45-46, b3, 56832, Los Angeles, CA
              </Paragraph>
            </div>
          </Col>

          <Col xs={24} sm={24} md={8}>
            <Title level={5} style={{ color: '#cb8670', marginBottom: '1.5rem' }}>
              Quick Links
            </Title>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Home', 'Rooms', 'Services', 'About Us', 'Contact'].map((item) => (
                <li key={item} style={{ marginBottom: '0.5rem' }}>
                  <Link
                    style={{
                      color: '#8a8a8a',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#cb8670')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#8a8a8a')}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>
        </Row>

        <div
          style={{
            textAlign: 'center',
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '1px solid #2c2c2c',
          }}
        >
          <Paragraph style={{ color: '#8a8a8a', margin: 0 }}>
            © {new Date().getFullYear()} Palatin. All rights reserved.
          </Paragraph>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;