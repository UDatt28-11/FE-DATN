import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Form, Input, Button, Typography, Breadcrumb } from 'antd';
import { HomeOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, ClockCircleOutlined, SendOutlined } from '@ant-design/icons';
import BookingFilter from '../../../components/Booking/BookingFilter';
import './Contact.css';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

// Inject custom styles only once (outside component to avoid re-injection)
const styleId = 'contact-page-styles';
if (!document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .contact-info-box {
      transition: all 0.4s ease;
    }
    
    .contact-info-box:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(203, 134, 112, 0.15);
    }
    
    .contact-info-box:hover .contact-icon-wrapper {
      background: linear-gradient(135deg, #cb8670 0%, #b87560 100%);
      transform: rotateY(360deg);
    }
    
    .contact-info-box:hover .contact-icon-wrapper .anticon {
      color: #fff !important;
    }
    
    .contact-icon-wrapper {
      transition: all 0.6s ease;
    }
    
    .contact-form-input:focus {
      border-color: #cb8670 !important;
      box-shadow: 0 0 0 2px rgba(203, 134, 112, 0.1) !important;
    }
    
    .contact-form-input:hover {
      border-color: #cb8670 !important;
    }
    
    .submit-btn:hover {
      background: linear-gradient(135deg, #b87560 0%, #a56550 100%) !important;
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(203, 134, 112, 0.3);
    }
    
    .map-container {
      position: relative;
      overflow: hidden;
      border-radius: 16px;
    }
    
    .map-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #cb8670, #e0a090, #cb8670);
      z-index: 10;
    }
  `;
  document.head.appendChild(style);
}

const styles = {
  // Hero Section
  heroSection: {
    position: 'relative' as const,
    height: 450,
    backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(26,26,26,0.8) 100%)',
    zIndex: 1,
  },
  heroContent: {
    position: 'relative' as const,
    zIndex: 2,
    textAlign: 'center' as const,
    padding: '0 20px',
  },
  // Section styles
  sectionTitle: {
    fontSize: 38,
    fontWeight: 400,
    color: '#1a1a1a',
    marginBottom: 15,
    fontFamily: '"Playfair Display", Georgia, serif',
  },
  goldLine: {
    width: 60,
    height: 3,
    background: 'linear-gradient(90deg, #cb8670, #e0a090)',
    margin: '0 auto 20px',
    borderRadius: 2,
  },
  // Contact Info Box
  infoBox: {
    background: '#fff',
    borderRadius: 16,
    padding: '40px 30px',
    textAlign: 'center' as const,
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
    border: '1px solid rgba(203, 134, 112, 0.1)',
    height: '100%',
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'rgba(203, 134, 112, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 25px',
  },
  // Form styles
  formCard: {
    background: '#fff',
    borderRadius: 20,
    padding: '50px 40px',
    boxShadow: '0 15px 50px rgba(0,0,0,0.1)',
  },
  formInput: {
    height: 55,
    borderRadius: 10,
    border: '2px solid #e8e8e8',
    fontSize: 15,
    padding: '0 20px',
  },
  submitButton: {
    height: 55,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #cb8670 0%, #b87560 100%)',
    border: 'none',
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: 1,
    width: '100%',
    transition: 'all 0.3s ease',
  },
};

const Contact: React.FC = () => {
  const [form] = Form.useForm();
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

  const handleSubmit = (values: any) => {
    console.log('Form values:', values);
    // Handle form submission
  };

  const contactInfo = [
    {
      icon: <PhoneOutlined style={{ fontSize: 32, color: '#cb8670' }} />,
      title: 'Điện thoại',
      details: ['+84 123 456 789', '+84 987 654 321'],
    },
    {
      icon: <MailOutlined style={{ fontSize: 32, color: '#cb8670' }} />,
      title: 'Email',
      details: ['info@homestay.vn', 'booking@homestay.vn'],
    },
    {
      icon: <EnvironmentOutlined style={{ fontSize: 32, color: '#cb8670' }} />,
      title: 'Địa chỉ',
      details: ['123 Đường ABC, Quận 1', 'TP. Hồ Chí Minh, Việt Nam'],
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: 32, color: '#cb8670' }} />,
      title: 'Giờ làm việc',
      details: ['Thứ 2 - Chủ nhật', '08:00 - 22:00'],
    },
  ];

  return (
    <div>
      {/* ##### Hero Section ##### */}
      <section style={styles.heroSection}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <div style={{ ...styles.goldLine, marginBottom: 25 }} />
          <Title 
            level={1} 
            style={{ 
              color: '#fff', 
              fontSize: 52, 
              fontWeight: 400,
              marginBottom: 20,
              fontFamily: '"Playfair Display", Georgia, serif',
              fontStyle: 'italic',
            }}
          >
            Liên Hệ Với Chúng Tôi
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 25 }}>
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
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
                title: <span style={{ color: '#fff', fontSize: 15 }}>Liên hệ</span>,
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

      {/* ##### Contact Info Section ##### */}
      <section style={{ padding: '100px 0', background: '#f8f9fa' }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 15px' }}>
          {/* Section Heading */}
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={styles.goldLine} />
            <Title level={2} style={styles.sectionTitle}>
              Thông Tin Liên Hệ
            </Title>
            <Paragraph style={{ color: '#6c757d', fontSize: 16, maxWidth: 600, margin: '0 auto' }}>
              Hãy liên hệ với chúng tôi qua các kênh dưới đây. Đội ngũ của chúng tôi sẽ phản hồi trong thời gian sớm nhất.
            </Paragraph>
          </div>

          {/* Contact Info Cards */}
          <Row gutter={[30, 30]}>
            {contactInfo.map((info, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <div className="contact-info-box" style={styles.infoBox}>
                  <div className="contact-icon-wrapper" style={styles.iconWrapper}>
                    {info.icon}
                  </div>
                  <Title level={4} style={{ fontSize: 20, marginBottom: 15, color: '#1a1a1a' }}>
                    {info.title}
                  </Title>
                  {info.details.map((detail, idx) => (
                    <Paragraph key={idx} style={{ color: '#6c757d', margin: 0, fontSize: 15, lineHeight: 1.8 }}>
                      {detail}
                    </Paragraph>
                  ))}
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ##### Contact Form & Map Section ##### */}
      <section style={{ padding: '100px 0', background: '#fff' }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 15px' }}>
          <Row gutter={[50, 50]} align="stretch">
            {/* Contact Form */}
            <Col xs={24} lg={12}>
              <div style={styles.formCard}>
                <div style={{ marginBottom: 40 }}>
                  <div style={{ ...styles.goldLine, margin: '0 0 20px 0' }} />
                  <Title level={3} style={{ fontSize: 28, marginBottom: 10, fontFamily: '"Playfair Display", Georgia, serif' }}>
                    Gửi Tin Nhắn
                  </Title>
                  <Paragraph style={{ color: '#6c757d', margin: 0 }}>
                    Điền thông tin bên dưới, chúng tôi sẽ liên hệ lại với bạn.
                  </Paragraph>
                </div>

                <Form form={form} onFinish={handleSubmit} layout="vertical">
                  <Row gutter={20}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                      >
                        <Input 
                          className="contact-form-input"
                          placeholder="Họ và tên" 
                          style={styles.formInput} 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="phone"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                      >
                        <Input 
                          className="contact-form-input"
                          placeholder="Số điện thoại" 
                          style={styles.formInput} 
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email' },
                      { type: 'email', message: 'Email không hợp lệ' },
                    ]}
                  >
                    <Input 
                      className="contact-form-input"
                      placeholder="Email" 
                      style={styles.formInput} 
                    />
                  </Form.Item>

                  <Form.Item
                    name="subject"
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                  >
                    <Input 
                      className="contact-form-input"
                      placeholder="Tiêu đề" 
                      style={styles.formInput} 
                    />
                  </Form.Item>

                  <Form.Item
                    name="message"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung tin nhắn' }]}
                  >
                    <TextArea 
                      className="contact-form-input"
                      placeholder="Nội dung tin nhắn..." 
                      rows={5}
                      style={{ 
                        ...styles.formInput, 
                        height: 'auto', 
                        padding: '15px 20px',
                        resize: 'none',
                      }} 
                    />
                  </Form.Item>

                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                      className="submit-btn"
                      type="primary"
                      htmlType="submit"
                      style={styles.submitButton}
                      icon={<SendOutlined />}
                    >
                      Gửi Tin Nhắn
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </Col>

            {/* Map & Additional Info */}
            <Col xs={24} lg={12}>
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 30 }}>
                {/* Map */}
                <div className="map-container" style={{ flex: 1, minHeight: 350 }}>
                  <iframe
                    title="Google Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241674197956!2d106.69765231533417!3d10.778789792319788!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f9ed887b%3A0x14aded5703768989!2zUXXhuq1uIDEsIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1702648800000!5m2!1svi!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0, borderRadius: 16 }}
                    allowFullScreen
                    loading="lazy"
                  />
                </div>

                {/* Quick Contact Box */}
                <div style={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                  borderRadius: 16,
                  padding: '35px 30px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 25,
                }}>
                  <div style={{
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #cb8670 0%, #e0a090 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <PhoneOutlined style={{ fontSize: 28, color: '#fff' }} />
                  </div>
                  <div>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, display: 'block', marginBottom: 5 }}>
                      Hotline hỗ trợ 24/7
                    </Text>
                    <Title level={3} style={{ color: '#fff', margin: 0, fontSize: 26 }}>
                      1900 123 456
                    </Title>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* ##### CTA Section ##### */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        textAlign: 'center',
      }}>
        <div className="container" style={{ maxWidth: 800, margin: '0 auto', padding: '0 15px' }}>
          <Title level={2} style={{ 
            color: '#fff', 
            fontSize: 36, 
            marginBottom: 20,
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 400,
          }}>
            Sẵn sàng cho kỳ nghỉ tuyệt vời?
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginBottom: 35 }}>
            Đặt phòng ngay hôm nay để nhận ưu đãi đặc biệt từ Homestay của chúng tôi
          </Paragraph>
          <Link to="/rooms">
            <Button 
              size="large"
              style={{
                height: 55,
                padding: '0 50px',
                background: 'linear-gradient(135deg, #cb8670 0%, #b87560 100%)',
                border: 'none',
                color: '#fff',
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 30,
                letterSpacing: 1,
              }}
            >
              Xem Phòng Ngay
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Contact;