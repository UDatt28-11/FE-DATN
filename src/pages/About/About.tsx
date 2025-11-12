import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Typography, Breadcrumb, Image } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const About: React.FC = () => {
  return (
    <div>
      {/* Breadcrumb Section */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          height: '400px',
          backgroundImage: "url('/img/bg-img/16.jpg')",
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
            About Us
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
                title: <span style={{ color: '#fff' }}>About Us</span>,
              },
            ]}
          />
        </div>
      </section>

      {/* About Us Section */}
      <section style={{ padding: '100px 0 0', backgroundColor: '#fff' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={12} data-aos="fade-right">
              <div style={{ marginBottom: '100px' }}>
                <Title level={2} style={{ marginBottom: '2rem' }}>
                  Welcome to Palatin
                </Title>
                <Paragraph style={{ marginBottom: '2rem', fontSize: '16px' }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque, at rutrum nulla dictum. Ut ac ligula sapien. Suspendisse cursus faucibus finibus.
                </Paragraph>
                <Image src="/img/bg-img/2.jpg" alt="About Us" style={{ width: '100%' }} />
              </div>
            </Col>
            <Col xs={24} lg={12} data-aos="fade-left">
              <div style={{ marginBottom: '100px' }}>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Image src="/img/bg-img/3.jpg" alt="" style={{ width: '100%' }} />
                  </Col>
                  <Col span={12}>
                    <Image src="/img/bg-img/4.png" alt="" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  </Col>
                  <Col span={12}>
                    <Image src="/img/bg-img/5.jpg" alt="" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Pool Section */}
      <section
        style={{
          padding: '100px 0',
          position: 'relative',
          zIndex: 1,
          backgroundImage: "url('/img/bg-img/4.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
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
                <Title level={2} style={{ color: '#fff', marginBottom: '1rem' }}>
                  Our Pool
                </Title>
                <Paragraph style={{ color: '#fff', fontSize: '16px' }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default About;