import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Breadcrumb, Button, Tag } from 'antd';
import BookingFilter from '../../../components/Booking/BookingFilter';
import {
  HomeOutlined,
  CarOutlined,
  CoffeeOutlined,
  WifiOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
  SkinOutlined,
  GiftOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import './Services.css';

const { Title, Paragraph, Text } = Typography;

const Services: React.FC = () => {
  const navigate = useNavigate();

  const handleBookNow = (values: any) => {
    const params = new URLSearchParams();
    
    if (values.checkIn) {
      params.set('check_in', values.checkIn.format('YYYY-MM-DD'));
    }
    if (values.checkOut) {
      params.set('check_out', values.checkOut.format('YYYY-MM-DD'));
    }
    
    const totalGuests = values.guests || 2;
    params.set('total_guests', totalGuests.toString());
    
    navigate(`/rooms?${params.toString()}`);
  };

  const freeServices = [
    {
      icon: <WifiOutlined style={{ fontSize: '48px', color: '#cb8670' }} />,
      title: 'WiFi Miễn Phí',
      description: 'Kết nối internet tốc độ cao miễn phí trong toàn bộ khu vực khách sạn, phục vụ công việc và giải trí của quý khách.',
      isFree: true,
    },
    {
      icon: <SafetyOutlined style={{ fontSize: '48px', color: '#cb8670' }} />,
      title: 'An Ninh 24/7',
      description: 'Hệ thống an ninh và camera giám sát hiện đại hoạt động liên tục đảm bảo an toàn tuyệt đối cho khách hàng.',
      isFree: true,
    },
    {
      icon: <CustomerServiceOutlined style={{ fontSize: '48px', color: '#cb8670' }} />,
      title: 'Lễ Tân 24/7',
      description: 'Đội ngũ lễ tân chuyên nghiệp, thân thiện luôn sẵn sàng hỗ trợ quý khách mọi lúc mọi nơi.',
      isFree: true,
    },
    {
      icon: <EnvironmentOutlined style={{ fontSize: '48px', color: '#cb8670' }} />,
      title: 'Tư Vấn Du Lịch',
      description: 'Tư vấn miễn phí về các địa điểm tham quan, di chuyển và lịch trình phù hợp cho chuyến đi của bạn.',
      isFree: true,
    },
  ];

  const paidServices = [
    {
      icon: <CoffeeOutlined style={{ fontSize: '48px', color: '#cb8670' }} />,
      title: 'Nhà Hàng & Bar',
      description: 'Thưởng thức ẩm thực đa dạng với các món ăn truyền thống và quốc tế do đầu bếp chuyên nghiệp chế biến.',
      price: 'Từ 150.000đ',
      isFree: false,
    },
    {
      icon: <CarOutlined style={{ fontSize: '48px', color: '#cb8670' }} />,
      title: 'Đưa Đón Sân Bay',
      description: 'Dịch vụ đưa đón sân bay 24/7 với xe sang trọng, thoải mái và đúng giờ cho mọi chuyến đi của bạn.',
      price: '500.000đ - 800.000đ',
      isFree: false,
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: '48px', color: '#cb8670' }} />,
      title: 'Tour Du Lịch',
      description: 'Tổ chức các tour du lịch khám phá những địa điểm nổi tiếng và hấp dẫn nhất với hướng dẫn viên chuyên nghiệp.',
      price: 'Từ 1.200.000đ/người',
      isFree: false,
    },
    {
      icon: <SkinOutlined style={{ fontSize: '48px', color: '#cb8670' }} />,
      title: 'Spa & Massage',
      description: 'Thư giãn cơ thể và tâm hồn với các liệu trình massage, chăm sóc da chuyên nghiệp bằng sản phẩm cao cấp.',
      price: '300.000đ - 1.500.000đ',
      isFree: false,
    },
    {
      icon: <GiftOutlined style={{ fontSize: '48px', color: '#cb8670' }} />,
      title: 'Dịch Vụ Giặt Ủi',
      description: 'Giặt ủi quần áo chuyên nghiệp với công nghệ hiện đại, giao nhận tận phòng nhanh chóng.',
      price: 'Từ 30.000đ/món',
      isFree: false,
    },
    {
      icon: <SmileOutlined style={{ fontSize: '48px', color: '#cb8670' }} />,
      title: 'Tổ Chức Sự Kiện',
      description: 'Phục vụ tổ chức tiệc cưới, hội nghị, sinh nhật với không gian sang trọng và đội ngũ chuyên nghiệp.',
      price: 'Liên hệ để báo giá',
      isFree: false,
    },
  ];

  return (
    <div style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        height: 450,
        backgroundImage: "url('/img/bg-img/15.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(26,26,26,0.8) 100%)',
          zIndex: 1,
        }} />
        <div style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          padding: '0 20px',
        }}>
          <div style={{
            width: 60,
            height: 3,
            background: 'linear-gradient(90deg, #cb8670, #e0a090)',
            margin: '0 auto 25px',
            borderRadius: 2,
          }} />
          <Title 
            level={1} 
            style={{ 
              color: '#fff', 
              fontSize: 52, 
              fontWeight: 400,
              marginBottom: 20,
            }}
          >
            Dịch Vụ Của Chúng Tôi
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 25 }}>
            Trải nghiệm các dịch vụ cao cấp và tiện ích đẳng cấp
          </Paragraph>
          <Breadcrumb
            style={{ justifyContent: 'center', display: 'flex' }}
            items={[
              {
                title: (
                  <Link to="/" style={{ color: '#cb8670', fontSize: 15 }}>
                    <HomeOutlined /> Trang chủ
                  </Link>
                ),
              },
              {
                title: <span style={{ color: '#fff', fontSize: 15 }}>Dịch vụ</span>,
              },
            ]}
          />
        </div>
      </section>

      {/* Book Now Area */}
      <div className="book-now-area" style={{ marginTop: '-7px', marginBottom: '10px', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <Row justify="center">
            <Col xs={24} lg={20}>
              <BookingFilter onSubmit={handleBookNow} showButton={true} />
            </Col>
          </Row>
        </div>
      </div>

      {/* Free Services Section */}
      <section style={{ 
        padding: '100px 0 50px',
        background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)',
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
          {/* Section Title */}
          <div style={{ textAlign: 'center', marginBottom: 70 }}>
            <div style={{
              width: 70,
              height: 4,
              background: 'linear-gradient(90deg, #52c41a, #73d13d)',
              margin: '0 auto 25px',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)',
            }}></div>
            <Title level={2} style={{ 
              fontSize: 42, 
              fontWeight: 600, 
              marginBottom: 18,
              color: '#1a1a1a',
              letterSpacing: '-0.5px',
            }}>
              Dịch Vụ Miễn Phí
            </Title>
            <Paragraph style={{ 
              color: '#6c757d', 
              fontSize: 17, 
              maxWidth: 700, 
              margin: '0 auto',
              lineHeight: 1.7,
            }}>
              Các tiện ích miễn phí dành cho tất cả khách hàng lưu trú tại khách sạn, mang đến trải nghiệm tốt nhất.
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {freeServices.map((service, index) => (
              <Col xs={24} md={12} lg={6} key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                <Card
                  hoverable
                  style={{
                    textAlign: 'center',
                    backgroundColor: '#fff',
                    border: '2px solid #52c41a',
                    borderRadius: '12px',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    position: 'relative',
                    overflow: 'visible',
                  }}
                  styles={{ body: { padding: '40px 20px' } }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(82, 196, 26, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                  }}
                >
                  <Tag 
                    color="success" 
                    style={{ 
                      position: 'absolute', 
                      top: '15px', 
                      right: '15px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    MIỄN PHÍ
                  </Tag>
                  <div style={{ marginBottom: '24px' }}>{service.icon}</div>
                  <Title level={4} style={{ marginBottom: '16px', color: '#2a2a2a', fontSize: '18px' }}>
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

      {/* Paid Services Section */}
      <section style={{ padding: '50px 0 100px', backgroundColor: '#f8f9fa' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
          {/* Section Title */}
          <div style={{ textAlign: 'center', marginBottom: 70 }}>
            <div style={{
              width: 70,
              height: 4,
              background: 'linear-gradient(90deg, #cb8670, #e0a090)',
              margin: '0 auto 25px',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(203, 134, 112, 0.3)',
            }}></div>
            <Title level={2} style={{ 
              fontSize: 42, 
              fontWeight: 600, 
              marginBottom: 18,
              color: '#1a1a1a',
              letterSpacing: '-0.5px',
            }}>
              Dịch Vụ Cao Cấp
            </Title>
            <Paragraph style={{ 
              color: '#6c757d', 
              fontSize: 17, 
              maxWidth: 700, 
              margin: '0 auto',
              lineHeight: 1.7,
            }}>
              Các dịch vụ cao cấp với chất lượng tốt nhất, mang đến sự hài lòng và trải nghiệm đẳng cấp cho quý khách.
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {paidServices.map((service, index) => (
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
                    position: 'relative',
                    overflow: 'visible',
                  }}
                  styles={{ body: { padding: '40px 30px' } }}
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
                  <Tag 
                    color="gold" 
                    style={{ 
                      position: 'absolute', 
                      top: '15px', 
                      right: '15px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    TRẢ PHÍ
                  </Tag>
                  <div style={{ marginBottom: '24px' }}>{service.icon}</div>
                  <Title level={4} style={{ marginBottom: '16px', color: '#2a2a2a', fontSize: '20px' }}>
                    {service.title}
                  </Title>
                  <Paragraph style={{ color: '#6c757d', marginBottom: '16px', fontSize: '14px', lineHeight: '1.8' }}>
                    {service.description}
                  </Paragraph>
                  <div style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#fff7e6', 
                    borderRadius: '8px',
                    border: '1px solid #ffd591',
                  }}>
                    <Text style={{ 
                      color: '#cb8670', 
                      fontWeight: 'bold',
                      fontSize: '16px',
                    }}>
                      {service.price}
                    </Text>
                  </div>
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