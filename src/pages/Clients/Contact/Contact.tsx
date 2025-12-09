import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Form, Input, Button, Typography, Breadcrumb, Card } from 'antd';
import { HomeOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import './Contact.css';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const Contact: React.FC = () => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    console.log('Form values:', values);
    // Handle form submission
  };

  return (
    <div>
      {/* Breadcrumb Section */}
      <section
        className="contact-hero"
        style={{
          backgroundImage: "url('/img/bg-img/19.jpg')",
        }}
      >
        <div className="contact-hero-overlay" />
        <div className="contact-hero-content">
          <Title level={1} className="contact-hero-title" data-aos="fade-up">
            Contact Us
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
                title: <span style={{ color: '#fff' }}>Contact</span>,
              },
            ]}
          />
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section style={{ padding: '100px 0 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
          <Row gutter={[48, 48]}>
            <Col xs={24} lg={12} data-aos="fade-up">
              <Card style={{ border: 'none', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                  <Row gutter={16}>
                    <Col xs={24} lg={12}>
                      <Form.Item
                        name="name"
                        rules={[{ required: true, message: 'Please enter your name' }]}
                      >
                        <Input placeholder="Your Name" size="large" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Form.Item
                        name="email"
                        rules={[
                          { required: true, message: 'Please enter your email' },
                          { type: 'email', message: 'Please enter a valid email' },
                        ]}
                      >
                        <Input placeholder="Your Email" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    name="subject"
                    rules={[{ required: true, message: 'Please enter subject' }]}
                  >
                    <Input placeholder="Subject" size="large" />
                  </Form.Item>
                  <Form.Item
                    name="message"
                    rules={[{ required: true, message: 'Please enter your message' }]}
                  >
                    <TextArea placeholder="Your Message" rows={5} />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      style={{
                        backgroundColor: '#cb8670',
                        borderColor: '#cb8670',
                        height: '50px',
                        padding: '0 40px',
                      }}
                    >
                      Send Message
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={12} data-aos="fade-up">
              <div style={{ marginBottom: '100px' }}>
                <Card
                  style={{
                    marginBottom: '30px',
                    border: '1px solid #f0f0f0',
                    borderLeft: '4px solid #cb8670',
                  }}
                >
                  <PhoneOutlined style={{ fontSize: '24px', color: '#cb8670', marginBottom: '10px' }} />
                  <Title level={4} style={{ marginBottom: '10px' }}>
                    Phone:
                  </Title>
                  <Paragraph style={{ color: '#6c757d', margin: 0 }}>+12 345 678 9</Paragraph>
                </Card>

                <Card
                  style={{
                    marginBottom: '30px',
                    border: '1px solid #f0f0f0',
                    borderLeft: '4px solid #cb8670',
                  }}
                >
                  <MailOutlined style={{ fontSize: '24px', color: '#cb8670', marginBottom: '10px' }} />
                  <Title level={4} style={{ marginBottom: '10px' }}>
                    Email:
                  </Title>
                  <Paragraph style={{ color: '#6c757d', margin: 0 }}>info@bookstay.vn</Paragraph>
                </Card>

                <Card
                  style={{
                    marginBottom: '30px',
                    border: '1px solid #f0f0f0',
                    borderLeft: '4px solid #cb8670',
                  }}
                >
                  <EnvironmentOutlined style={{ fontSize: '24px', color: '#cb8670', marginBottom: '10px' }} />
                  <Title level={4} style={{ marginBottom: '10px' }}>
                    Address:
                  </Title>
                  <Paragraph style={{ color: '#6c757d', margin: 0 }}>
                    Main Str. no 45-46, b3, 56832, Los Angeles, CA
                  </Paragraph>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Map Section */}
      <div style={{ marginBottom: '100px' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
          <Row>
            <Col span={24}>
              <iframe
                title="Google Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.3059353029!2d-74.25986548248684!3d40.69714941932609!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew+York%2C+NY%2C+USA!5e0!3m2!1sen!2s!4v1561542597668!5m2!1sen!2s"
                width="100%"
                height="450"
                style={{ border: 0, borderRadius: '8px' }}
                allowFullScreen
                loading="lazy"
              ></iframe>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default Contact;