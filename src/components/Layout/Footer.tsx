import React from 'react';
import { Row, Col, Input, Button } from 'antd';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribe to newsletter');
  };

  return (
    <footer className="footer-area">
      <div className="container">
        <Row gutter={[30, 0]}>
          {/* Footer Widget Area - About */}
          <Col xs={24} lg={10}>
            <div className="footer-widget-area mt-50">
              <a href="/" className="d-block mb-5 footer-logo">
                <span className="logo-text">
                  <span className="logo-book">Book</span>
                  <span className="logo-stay">Stay</span>
                </span>
              </a>
              <p>
                BookStay - Hệ thống đặt phòng khách sạn trực tuyến hàng đầu. 
                Chúng tôi cam kết mang đến cho bạn trải nghiệm lưu trú tuyệt vời 
                với dịch vụ chuyên nghiệp và giá cả hợp lý.
              </p>
            </div>
          </Col>

          {/* Footer Widget Area - Map */}
          <Col xs={24} md={12} lg={8}>
            <div className="footer-widget-area mt-50">
              <h6 className="widget-title mb-5">Tìm chúng tôi trên bản đồ</h6>
              <img src="/img/bg-img/footer-map.png" alt="Bản đồ" />
            </div>
          </Col>

          {/* Footer Widget Area - Newsletter */}
          <Col xs={24} md={12} lg={6}>
            <div className="footer-widget-area mt-50">
              <h6 className="widget-title mb-5">Đăng ký nhận tin</h6>
              <form onSubmit={handleSubscribe} className="subscribe-form">
                <Input
                  type="email"
                  name="subscribe-email"
                  id="subscribeemail"
                  placeholder="Email của bạn"
                />
                <Button type="primary" htmlType="submit">
                  Đăng ký
                </Button>
              </form>
            </div>
          </Col>

          {/* Copyright Text */}
          <Col xs={24}>
            <div className="copywrite-text mt-30">
              <p>
                Bản quyền &copy;{currentYear} BookStay. Đã đăng ký bản quyền.
              </p>
            </div>
          </Col>
        </Row>
      </div>
    </footer>
  );
};

export default Footer;
