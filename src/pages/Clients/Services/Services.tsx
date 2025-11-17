import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Typography, Breadcrumb, Button } from 'antd';
import {
  HomeOutlined,
  CarOutlined,
  CoffeeOutlined,
  WifiOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Services: React.FC = () => {
  const services = [
    {
      icon: <WifiOutlined style={{ fontSize: '48px', color: '#cb8670' }} />,
      title: 'WiFi Miễn Phí',
      description: 'Kết nối internet tốc độ cao miễn phí trong toàn bộ khu vực khách sạn, phục vụ công việc và giải trí của quý khách.',
    },
    {
      icon: <CoffeeOutlined style={{ fontSize: '48px', color: '#cb8670' }} />,
      title: 'Nhà Hàng & Bar',
      description: 'Thưởng thức ẩm thực đa dạng với các món ăn truyền thống và quốc tế do đầu bếp chuyên nghiệp chế biến.',
    },
    {
      icon: <CarOutlined style={{ fontSize: '48px', color: '#cb8670' }} />,
      title: 'Đưa Đón Sân Bay',
      description: 'Dịch vụ đưa đón sân bay 24/7 với xe sang trọng, thoải mái và đúng giờ cho mọi chuyến đi của bạn.',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: '48px', color: '#cb8670' }} />,
      title: 'An Ninh 24/7',
      description: 'Hệ thống an ninh và camera giám sát hiện đại hoạt động liên tục đảm bảo an toàn tuyệt đối cho khách hàng.',
    },
    {
      icon: <CustomerServiceOutlined style={{ fontSize: '48px', color: '#cb8670' }} />,
      title: 'Lễ Tân 24/7',
      description: 'Đội ngũ lễ tân chuyên nghiệp, thân thiện luôn sẵn sàng hỗ trợ quý khách mọi lúc mọi nơi.',
    },
    {
      icon: <EnvironmentOutlined style={{ fontSize: '48px', color: '#cb8670' }} />,
      title: 'Tour Du Lịch',
      description: 'Tư vấn và tổ chức các tour du lịch khám phá những địa điểm nổi tiếng và hấp dẫn nhất.',
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
            Dịch Vụ Của Chúng Tôi
          </Title>
          <Breadcrumb
            data-aos="fade-up"
            data-aos-delay="200"
            style={{ justifyContent: 'center', display: 'flex' }}
            items={[
              {
                title: (
                  <Link to="/" style={{ color: '#cb8670' }}>
                    <HomeOutlined /> Trang chủ
                  </Link>
                ),
              },
              {
                title: <span style={{ color: '#fff' }}>Dịch vụ</span>,
              },
            ]}
          />
        </div>
      </section>

      {/* Services Grid Section */}
      <section style={{ padding: '100px 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
          {/* Section Title */}
          <div style={{ textAlign: 'center', marginBottom: '60px' }} data-aos="fade-up">
            <div style={{
              width: '60px',
              height: '3px',
              background: '#cb8670',
              margin: '0 auto 20px'
            }}></div>
            <Title level={2} style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
              Dịch Vụ Tiện Ích
            </Title>
            <Paragraph style={{ fontSize: '16px', color: '#6c757d', maxWidth: '700px', margin: '0 auto' }}>
              Chúng tôi cung cấp đầy đủ các tiện ích và dịch vụ chất lượng cao nhằm mang đến trải nghiệm lưu trú tuyệt vời nhất cho quý khách.
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {services.map((service, index) => (
              <Col xs={24} md={12} lg={8} key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                <Card
                  hoverable
                  style={{
                    textAlign: 'center',
                    backgroundColor: '#fff',
                    border: '1px solid #e8e8e8',
                    borderRadius: '12px',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                  bodyStyle={{ padding: '40px 30px' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(203, 134, 112, 0.2)';
                    e.currentTarget.style.borderColor = '#cb8670';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                    e.currentTarget.style.borderColor = '#e8e8e8';
                  }}
                >
                  <div style={{ marginBottom: '24px' }}>{service.icon}</div>
                  <Title level={4} style={{ marginBottom: '16px', color: '#2a2a2a', fontSize: '20px' }}>
                    {service.title}
                  </Title>
                  <Paragraph style={{ color: '#6c757d', margin: 0, fontSize: '14px', lineHeight: '1.8' }}>
                    {service.description}
                  </Paragraph>
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
                <Title level={2} style={{ color: '#fff', marginBottom: '20px', fontSize: '2.5rem' }}>
                  Bạn Quan Tâm Đến Dịch Vụ Của Chúng Tôi?
                </Title>
                <Paragraph style={{ color: '#fff', marginBottom: '40px', fontSize: '16px', opacity: 0.9 }}>
                  Liên hệ với chúng tôi ngay hôm nay để được tư vấn và hỗ trợ tốt nhất
                </Paragraph>
                <Link to="/contact">
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      backgroundColor: '#cb8670',
                      borderColor: '#cb8670',
                      height: '56px',
                      padding: '0 50px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                    }}
                  >
                    Liên Hệ Ngay
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