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
              <a href="#" className="d-block mb-5">
                <img src="/img/core-img/logo.png" alt="Palatin Logo" />
              </a>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada 
                lorem maximus mauris sceleri sque, at rutrum nulla dictum. Ut ac ligula 
                sapien. Suspendisse cursus faucibus finibus.
              </p>
            </div>
          </Col>

          {/* Footer Widget Area - Map */}
          <Col xs={24} md={12} lg={8}>
            <div className="footer-widget-area mt-50">
              <h6 className="widget-title mb-5">Find us on the map</h6>
              <img src="/img/bg-img/footer-map.png" alt="Map" />
            </div>
          </Col>

          {/* Footer Widget Area - Newsletter */}
          <Col xs={24} md={12} lg={6}>
            <div className="footer-widget-area mt-50">
              <h6 className="widget-title mb-5">Subscribe to our newsletter</h6>
              <form onSubmit={handleSubscribe} className="subscribe-form">
                <Input
                  type="email"
                  name="subscribe-email"
                  id="subscribeemail"
                  placeholder="Your E-mail"
                />
                <Button type="primary" htmlType="submit">
                  Subscribe
                </Button>
              </form>
            </div>
          </Col>

          {/* Copyright Text */}
          <Col xs={24}>
            <div className="copywrite-text mt-30">
              <p>
                <a href="#">
                  Copyright &copy;{currentYear} All rights reserved | This template is made with{' '}
                  <i className="fa fa-heart-o" aria-hidden="true"></i> by{' '}
                  <a href="https://colorlib.com" target="_blank" rel="noopener noreferrer">
                    Colorlib
                  </a>
                </a>
              </p>
            </div>
          </Col>
        </Row>
      </div>
    </footer>
  );
};

export default Footer;
