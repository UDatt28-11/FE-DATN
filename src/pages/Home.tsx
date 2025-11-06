import React from 'react';
import { Carousel, DatePicker, Select, Button, Row, Col, Card, Typography } from 'antd';
import { CalendarOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './Home.css';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const [checkIn, setCheckIn] = React.useState<dayjs.Dayjs | null>(null);
  const [checkOut, setCheckOut] = React.useState<dayjs.Dayjs | null>(null);
  const [adults, setAdults] = React.useState(2);
  const [children, setChildren] = React.useState(0);

  const handleBookNow = () => {
    console.log({
      checkIn: checkIn?.format('YYYY-MM-DD'),
      checkOut: checkOut?.format('YYYY-MM-DD'),
      adults,
      children
    });
  };

  const slides = [
    {
      image: '/img/bg-img/1.jpg',
      title: 'The Vacation Heaven',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque, at rutrum nulla dictum. Ut ac ligula sapien.'
    },
    {
      image: '/img/bg-img/5.jpg',
      title: 'The Vacation Heaven',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque, at rutrum nulla dictum. Ut ac ligula sapien.'
    }
  ];

  return (
    <div className="home-wrapper">
      {/* Hero Section with Carousel */}
      <section className="hero-section">
        <Carousel 
          autoplay 
          effect="fade" 
          dotPosition="bottom"
          style={{ height: '100vh' }}
        >
          {slides.map((slide, index) => (
            <div key={index}>
              <div 
                className="slide-content"
                style={{ 
                  backgroundImage: `url(${slide.image})`,
                  height: '100vh',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.4)',
                  zIndex: 1
                }} />
                <div style={{ 
                  textAlign: 'center', 
                  color: '#fff',
                  position: 'relative',
                  zIndex: 2,
                  padding: '0 20px'
                }}>
                  <Title level={1} style={{ color: '#fff', fontSize: '4rem', marginBottom: '1rem' }}>
                    {slide.title}
                  </Title>
                  <Paragraph style={{ color: '#fff', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                    {slide.description}
                  </Paragraph>
                  <Button type="primary" size="large" style={{ 
                    backgroundColor: '#cb8670', 
                    borderColor: '#cb8670',
                    height: '50px',
                    padding: '0 40px',
                    fontSize: '16px'
                  }}>
                    Read More
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </Carousel>

        {/* Booking Form */}
        <div className="booking-form-container" style={{
          position: 'absolute',
          bottom: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '1200px',
          zIndex: 10
        }}>
          <Card style={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={5}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  <CalendarOutlined /> Check In
                </label>
                <DatePicker 
                  style={{ width: '100%' }}
                  value={checkIn}
                  onChange={(date) => setCheckIn(date)}
                  format="YYYY-MM-DD"
                  size="large"
                />
              </Col>
              <Col xs={24} sm={12} md={5}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  <CalendarOutlined /> Check Out
                </label>
                <DatePicker 
                  style={{ width: '100%' }}
                  value={checkOut}
                  onChange={(date) => setCheckOut(date)}
                  format="YYYY-MM-DD"
                  size="large"
                />
              </Col>
              <Col xs={24} sm={12} md={5}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  <UserOutlined /> Adults
                </label>
                <Select 
                  style={{ width: '100%' }}
                  value={adults}
                  onChange={(value) => setAdults(value)}
                  size="large"
                >
                  {[1,2,3,4,5].map(num => (
                    <Select.Option key={num} value={num}>{num}</Select.Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  <TeamOutlined /> Children
                </label>
                <Select 
                  style={{ width: '100%' }}
                  value={children}
                  onChange={(value) => setChildren(value)}
                  size="large"
                >
                  {[0,1,2,3,4].map(num => (
                    <Select.Option key={num} value={num}>{num}</Select.Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} md={4}>
                <Button 
                  type="primary" 
                  size="large" 
                  block
                  onClick={handleBookNow}
                  style={{ 
                    backgroundColor: '#cb8670', 
                    borderColor: '#cb8670',
                    height: '50px',
                    marginTop: '24px'
                  }}
                >
                  Book Now
                </Button>
              </Col>
            </Row>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section className="about-us-area" style={{ padding: '100px 0', background: '#f8f9fa' }}>
        <div className="container">
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={12}>
              <div data-aos="fade-right">
                <Title level={2} style={{ color: '#2a2a2a', marginBottom: '2rem' }}>
                  Welcome to Palatin
                </Title>
                <Paragraph style={{ color: '#6c757d', fontSize: '16px', marginBottom: '2rem' }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam eu metus sit amet odio sodales placerat. Sed varius leo ac leo fermentum, eu cursus nunc maximus. Integer convallis nisi nibh, et ornare neque ullamcorper ac.
                </Paragraph>
                <Button type="primary" size="large" style={{ 
                  backgroundColor: '#cb8670', 
                  borderColor: '#cb8670',
                  height: '50px',
                  padding: '0 40px'
                }}>
                  Read More
                </Button>
              </div>
            </Col>
            <Col xs={24} lg={12}>
              <div data-aos="fade-left">
                <img 
                  src="/img/bg-img/2.jpg" 
                  alt="About Us" 
                  style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                />
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Pool Section */}
      <section 
        className="pool-area" 
        style={{ 
          backgroundImage: 'url(/img/bg-img/3.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '100px 0',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: -1
        }} />
        <div className="container">
          <Row>
            <Col span={24}>
              <div style={{ textAlign: 'center', color: '#fff' }} data-aos="fade-up">
                <Title level={2} style={{ color: '#fff', fontSize: '48px', marginBottom: '25px' }}>
                  Infinity Pool
                </Title>
                <Paragraph style={{ color: '#fff', fontSize: '16px', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.
                </Paragraph>
                <Button type="primary" size="large" style={{ 
                  backgroundColor: '#cb8670', 
                  borderColor: '#cb8670',
                  height: '50px',
                  padding: '0 40px'
                }}>
                  Read More
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default Home;