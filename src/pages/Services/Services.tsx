import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Typography, Breadcrumb, Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Services: React.FC = () => {
  const services = [
    {
      icon: '🏊‍♂️',
      title: 'Pool',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.',
    },
    {
      icon: '🍽️',
      title: 'Restaurant',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.',
    },
    {
      icon: '🏋️‍♂️',
      title: 'Gym',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.',
    },
    {
      icon: '🚗',
      title: 'Car Rent',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.',
    },
    {
      icon: '💆‍♀️',
      title: 'Spa',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.',
    },
    {
      icon: '🎉',
      title: 'Events',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.',
    },
  ];

  return (
    <div>
      {/* Breadcrumb Section */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          height: '400px',
          backgroundImage: "url('/img/bg-img/18.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: -1,
          }}
        />
        <div style={{ textAlign: 'center', color: '#fff', zIndex: 1 }}>
          <Title level={1} style={{ color: '#fff', fontSize: '3rem', marginBottom: '1rem' }} data-aos="fade-up">
            Our Services
          </Title>
          <Breadcrumb
            data-aos="fade-up"
            data-aos-delay="200"
            style={{ justifyContent: 'center', display: 'flex' }}
            items={[
              {
                title: (
                  <Link to="/" style={{ color: '#cb8670' }}>
                    <HomeOutlined /> Home
                  </Link>
                ),
              },
              {
                title: <span style={{ color: '#fff' }}>Services</span>,
              },
            ]}
          />
        </div>
      </section>

      {/* Services Grid Section */}
      <section style={{ padding: '100px 0 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
          <Row gutter={[32, 32]}>
            {services.map((service, index) => (
              <Col xs={24} md={12} lg={8} key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                <Card
                  hoverable
                  style={{
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa',
                    border: 'none',
                    marginBottom: '100px',
                    transition: 'all 0.3s ease',
                  }}
                  bodyStyle={{ padding: '40px 30px' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#cb8670';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '20px' }}>{service.icon}</div>
                  <Title level={4} style={{ marginBottom: '20px', color: '#2a2a2a' }}>
                    {service.title}
                  </Title>
                  <Paragraph style={{ color: '#6c757d', margin: 0 }}>{service.description}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          backgroundImage: "url('/img/bg-img/4.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '100px 0',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: -1,
          }}
        />
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
          <Row>
            <Col span={24}>
              <div style={{ textAlign: 'center' }} data-aos="fade-up">
                <Title level={2} style={{ color: '#fff', marginBottom: '30px' }}>
                  Are you interested in our services?
                </Title>
                <Link to="/contact">
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      backgroundColor: '#cb8670',
                      borderColor: '#cb8670',
                      height: '50px',
                      padding: '0 40px',
                      fontSize: '16px',
                    }}
                  >
                    Contact Now
                  </Button>
                </Link>
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default Services;