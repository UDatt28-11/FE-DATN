import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Typography, Breadcrumb, Image, Card, Button } from 'antd';
import { HomeOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const About: React.FC = () => {
  const [showMore, setShowMore] = useState(false);

  return (
    <div>
      {/* Breadcrumb Section */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          height: '400px',
          backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945')",
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
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: -1,
          }}
        />
        <div style={{ textAlign: 'center', color: '#fff', zIndex: 1 }}>
          <Title level={1} style={{ color: '#fff', fontSize: '3rem', marginBottom: '1rem' }} data-aos="fade-up">
            Về chúng tôi
          </Title>
          <Breadcrumb
            data-aos="fade-up"
            data-aos-delay="200"
            style={{ justifyContent: 'center', display: 'flex' }}
            items={[
              {
                title: (
                  <Link to="/" style={{ color: '#d4af37' }}>
                    <HomeOutlined /> Trang chủ
                  </Link>
                ),
              },
              {
                title: <span style={{ color: '#fff' }}>Về chúng tôi</span>,
              },
            ]}
          />
        </div>
      </section>

      {/* Giới thiệu */}
      <section style={{ padding: '100px 0', backgroundColor: '#fff' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{
              width: 60,
              height: 4,
              background: '#d4af37',
              margin: '0 auto 20px'
            }} />
            <Title level={2} style={{ fontSize: 36, fontWeight: 700, marginBottom: 24 }}>
              Chào mừng đến với Homestay của chúng tôi
            </Title>
            <Paragraph style={{
              fontSize: 16,
              color: '#666',
              maxWidth: 800,
              margin: '0 auto',
              lineHeight: 1.8
            }}>
              Nằm giữa thiên nhiên yên bình, homestay của chúng tôi là nơi lý tưởng để bạn thư giãn
              và tận hưởng khoảng thời gian nghỉ dưỡng tuyệt vời. Với không gian ấm cúng, phòng ốc
              tiện nghi và dịch vụ tận tâm, chúng tôi cam kết mang đến cho bạn trải nghiệm lưu trú
              như ở nhà, đầy ấm áp và thân thiện.
            </Paragraph>

            {showMore && (
              <Paragraph style={{
                fontSize: 16,
                color: '#666',
                maxWidth: 800,
                margin: '20px auto 0',
                lineHeight: 1.8
              }}>
                Homestay của chúng tôi được thiết kế với phong cách hiện đại kết hợp truyền thống,
                mang đến sự hài hòa giữa tiện nghi đô thị và nét đẹp văn hóa địa phương. Mỗi phòng
                đều có ban công riêng với tầm nhìn tuyệt đẹp, nơi bạn có thể thưởng thức ly cà phê
                buổi sáng hay ngắm hoàng hôn buổi chiều.
                <br /><br />
                Chúng tôi cung cấp các dịch vụ miễn phí như: đưa đón sân bay (theo yêu cầu),
                bữa sáng tự chọn hàng ngày, sử dụng xe đạp khám phá khu vực xung quanh, và đặc biệt
                là các hoạt động trải nghiệm văn hóa như nấu ăn, làm đồ thủ công truyền thống.
                Đội ngũ nhân viên thân thiện, am hiểu địa phương sẵn sàng tư vấn và giúp bạn lên
                kế hoạch cho chuyến du lịch hoàn hảo.
              </Paragraph>
            )}

            <Button
              size="large"
              onClick={() => setShowMore(!showMore)}
              style={{
                marginTop: 32,
                background: '#d4af37',
                borderColor: '#d4af37',
                color: '#fff',
                height: 48,
                fontSize: 16,
                paddingLeft: 40,
                paddingRight: 40,
                fontWeight: 600
              }}
            >
              {showMore ? 'THU GỌN' : 'XEM CHI TIẾT'}
            </Button>
          </div>

          <Row gutter={[40, 40]}>
            <Col xs={24} md={12}>
              <Image
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d"
                alt="Beach resort"
                style={{ width: '100%', borderRadius: 8 }}
                preview={false}
              />
            </Col>
            <Col xs={24} md={12}>
              <Image
                src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461"
                alt="Pool"
                style={{ width: '100%', borderRadius: 8 }}
                preview={false}
              />
            </Col>
          </Row>
        </div>
      </section>

      {/* Thành tựu */}
      <section style={{ background: '#2d2d2d', padding: '80px 0', color: '#fff' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{
              width: 60,
              height: 4,
              background: '#d4af37',
              margin: '0 auto 20px'
            }} />
            <Title level={2} style={{ color: '#fff', fontSize: 36, fontWeight: 700 }}>
              Thành tựu của chúng tôi
            </Title>
          </div>

          <Row gutter={[40, 40]} justify="center">
            <Col xs={12} sm={12} md={6}>
              <Card
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #444',
                  textAlign: 'center',
                  borderRadius: 8
                }}
                bodyStyle={{ padding: '40px 20px' }}
              >
                <div style={{ fontSize: 48, color: '#d4af37', marginBottom: 12 }}>
                  ⭐
                </div>
                <Title level={3} style={{ color: '#fff', margin: 0, fontSize: 32 }}>
                  5.0
                </Title>
                <Text style={{ color: '#999' }}>Đánh giá trung bình</Text>
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Card
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #444',
                  textAlign: 'center',
                  borderRadius: 8
                }}
                bodyStyle={{ padding: '40px 20px' }}
              >
                <div style={{ fontSize: 48, color: '#d4af37', marginBottom: 12 }}>
                  👥
                </div>
                <Title level={3} style={{ color: '#fff', margin: 0, fontSize: 32 }}>
                  500+
                </Title>
                <Text style={{ color: '#999' }}>Khách hàng hài lòng</Text>
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Card
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #444',
                  textAlign: 'center',
                  borderRadius: 8
                }}
                bodyStyle={{ padding: '40px 20px' }}
              >
                <div style={{ fontSize: 48, color: '#d4af37', marginBottom: 12 }}>
                  🛏️
                </div>
                <Title level={3} style={{ color: '#fff', margin: 0, fontSize: 32 }}>
                  10
                </Title>
                <Text style={{ color: '#999' }}>Loại phòng</Text>
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Card
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #444',
                  textAlign: 'center',
                  borderRadius: 8
                }}
                bodyStyle={{ padding: '40px 20px' }}
              >
                <div style={{ fontSize: 48, color: '#d4af37', marginBottom: 12 }}>
                  🏆
                </div>
                <Title level={3} style={{ color: '#fff', margin: 0, fontSize: 32 }}>
                  3
                </Title>
                <Text style={{ color: '#999' }}>Năm kinh nghiệm</Text>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Khách sạn */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{
              width: 60,
              height: 4,
              background: '#d4af37',
              margin: '0 auto 20px'
            }} />
            <Title level={2} style={{ fontSize: 36, fontWeight: 700 }}>
              Tiện nghi nổi bật
            </Title>
          </div>

          <Row gutter={[40, 40]}>
            <Col xs={24} md={12}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <CheckCircleOutlined style={{ fontSize: 24, color: '#d4af37', flexShrink: 0, marginTop: 4 }} />
                <div>
                  <Title level={4} style={{ marginBottom: 8 }}>
                    Phòng được trang bị đầy đủ tiện nghi hiện đại
                  </Title>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <CheckCircleOutlined style={{ fontSize: 24, color: '#d4af37', flexShrink: 0, marginTop: 4 }} />
                <div>
                  <Title level={4} style={{ marginBottom: 8 }}>
                    Wifi miễn phí tốc độ cao trong toàn bộ khu vực
                  </Title>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <CheckCircleOutlined style={{ fontSize: 24, color: '#d4af37', flexShrink: 0, marginTop: 4 }} />
                <div>
                  <Title level={4} style={{ marginBottom: 8 }}>
                    Khu vực bếp chung hiện đại, tiện lợi
                  </Title>
                </div>
              </div>
              <Image
                src="https://images.unsplash.com/photo-1590490360182-c33d57733427"
                alt="Hotel lobby"
                style={{ width: '100%', borderRadius: 8, marginTop: 20 }}
                preview={false}
              />
            </Col>

            <Col xs={24} md={12}>
              <Image
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"
                alt="Pool area"
                style={{ width: '100%', borderRadius: 8, marginBottom: 20 }}
                preview={false}
              />
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <CheckCircleOutlined style={{ fontSize: 24, color: '#d4af37', flexShrink: 0, marginTop: 4 }} />
                <div>
                  <Title level={4} style={{ marginBottom: 8 }}>
                    Không gian yên tĩnh, sạch sẽ và thoáng mát
                  </Title>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <CheckCircleOutlined style={{ fontSize: 24, color: '#d4af37', flexShrink: 0, marginTop: 4 }} />
                <div>
                  <Title level={4} style={{ marginBottom: 8 }}>
                    Khu vực ngoài trời với ban công riêng
                  </Title>
                </div>
              </div>
            </Col>
          </Row>

          <Row gutter={[40, 40]} style={{ marginTop: 40 }}>
            <Col xs={24} md={8}>
              <div style={{ display: 'flex', gap: 16 }}>
                <CheckCircleOutlined style={{ fontSize: 24, color: '#d4af37', flexShrink: 0, marginTop: 4 }} />
                <div>
                  <Title level={4} style={{ marginBottom: 8 }}>
                    Điều hòa nhiệt độ, nước nóng 24/7
                  </Title>
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ display: 'flex', gap: 16 }}>
                <CheckCircleOutlined style={{ fontSize: 24, color: '#d4af37', flexShrink: 0, marginTop: 4 }} />
                <div>
                  <Title level={4} style={{ marginBottom: 8 }}>
                    Bảo mật an toàn với khóa thông minh
                  </Title>
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ display: 'flex', gap: 16 }}>
                <CheckCircleOutlined style={{ fontSize: 24, color: '#d4af37', flexShrink: 0, marginTop: 4 }} />
                <div>
                  <Title level={4} style={{ marginBottom: 8 }}>
                    Hỗ trợ tư vấn và đặt tour du lịch
                  </Title>
                </div>
              </div>
            </Col>
          </Row>

          <div style={{ textAlign: 'center', marginTop: 60 }}>
            <Image
              src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"
              alt="Beach view"
              style={{ width: '100%', maxWidth: 600, borderRadius: 8 }}
              preview={false}
            />
          </div>
        </div>
      </section>

      {/* Đánh giá khách hàng */}
      <section style={{ background: '#f8f8f8', padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 15px', textAlign: 'center' }}>
          <div style={{
            width: 60,
            height: 4,
            background: '#d4af37',
            margin: '0 auto 20px'
          }} />
          <Title level={2} style={{ fontSize: 36, fontWeight: 700, marginBottom: 40 }}>
            Khách hàng nói gì
          </Title>

          <Card
            style={{
              border: 'none',
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
            bodyStyle={{ padding: '50px 40px' }}
          >
            <Paragraph style={{
              fontSize: 18,
              color: '#666',
              lineHeight: 1.8,
              fontStyle: 'italic',
              marginBottom: 30
            }}>
              "Homestay thật sự tuyệt vời! Không gian ấm cúng, sạch sẽ và đầy đủ tiện nghi. Chủ nhà
              rất nhiệt tình và thân thiện, giúp chúng tôi có những trải nghiệm tuyệt vời trong chuyến
              du lịch. Chắc chắn sẽ quay lại vào lần tới!"
            </Paragraph>
            <div style={{ marginTop: 30 }}>
              <img
                src="https://logo.com/image-cdn/images/kts928pd/production/eb25c68b2f90b321c630fb8f3fcb1962e4c2a7e2-920x920.png?w=1080&q=72"
                alt="TripAdvisor"
                style={{ height: 40, opacity: 0.8 }}
              />
            </div>
          </Card>
        </div>
      </section>

      {/* Đăng ký nhận tin */}
      <section style={{ background: '#2d2d2d', padding: '80px 0', color: '#fff' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
          <Row gutter={[60, 40]} align="middle">
            <Col xs={24} md={12}>
              <Title level={2} style={{ color: '#fff', fontSize: 32, fontWeight: 700, marginBottom: 20 }}>
                Vị trí của chúng tôi
              </Title>
              <Paragraph style={{ color: '#ccc', fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
                <strong style={{ color: '#d4af37' }}>📍 Địa chỉ:</strong> 36-37-38 Kiều Mai, Phường Yên Hòa, Quận Cầu Giấy, Hà Nội
                <br />
                <strong style={{ color: '#d4af37' }}>📞 Điện thoại:</strong> 0123-456-789
                <br />
                <strong style={{ color: '#d4af37' }}>✉️ Email:</strong> contact@homestay.com
              </Paragraph>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.663372345678!2d105.77916631540254!3d21.045950885994414!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454b32ca18ff3%3A0x5b8e3db2a0e23894!2zS2nhu4F1IE1haSwgWcOqbiBIb8OgLCBD4bqndSBHaeG6pXksIEjDoCBO4buZaSwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1702651234567!5m2!1svi!2s"
                width="100%"
                height="350"
                style={{
                  border: 0,
                  borderRadius: 8,
                  marginTop: 10,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Vị trí Homestay - 36-37-38 Kiều Mai, Hà Nội"
              />
            </Col>
            <Col xs={24} md={12}>
              <Title level={2} style={{ color: '#fff', fontSize: 32, fontWeight: 700, marginBottom: 20 }}>
                Đăng ký nhận tin tức
              </Title>
              <div style={{
                background: '#1a1a1a',
                padding: 40,
                borderRadius: 8,
                border: '1px solid #444'
              }}>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    border: '1px solid #555',
                    borderRadius: 4,
                    background: '#2d2d2d',
                    color: '#fff',
                    fontSize: 16,
                    marginBottom: 20
                  }}
                />
                <Button
                  block
                  size="large"
                  style={{
                    background: '#d4af37',
                    borderColor: '#d4af37',
                    color: '#fff',
                    height: 50,
                    fontSize: 16,
                    fontWeight: 600
                  }}
                >
                  ĐĂNG KÝ
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default About;