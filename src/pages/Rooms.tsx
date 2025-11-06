import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Button, Typography, Breadcrumb, DatePicker, Select, Form } from 'antd';
import { HomeOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const Rooms: React.FC = () => {
  const rooms = [
    {
      id: 1,
      image: '/img/bg-img/6.jpg',
      title: 'Luxury Suite',
      price: 400,
      size: '30 ft',
      capacity: 'Max person 5',
      bed: 'King beds',
      services: 'Wifi, television, bathroom',
    },
    {
      id: 2,
      image: '/img/bg-img/7.jpg',
      title: 'Deluxe Room',
      price: 300,
      size: '25 ft',
      capacity: 'Max person 3',
      bed: 'Queen beds',
      services: 'Wifi, television, bathroom',
    },
    {
      id: 3,
      image: '/img/bg-img/8.jpg',
      title: 'Standard Room',
      price: 200,
      size: '20 ft',
      capacity: 'Max person 2',
      bed: 'Double bed',
      services: 'Wifi, television, bathroom',
    },
  ];

  const handleReservation = (values: any) => {
    console.log('Reservation:', values);
  };

  return (
    <div>
      {/* Breadcrumb Section */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          height: '400px',
          backgroundImage: "url('/img/bg-img/17.jpg')",
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
            Our Rooms
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
                title: <span style={{ color: '#fff' }}>Rooms</span>,
              },
            ]}
          />
        </div>
      </section>

      {/* Rooms Section */}
      <section style={{ padding: '100px 0 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={16}>
              {rooms.map((room, index) => (
                <Card
                  key={room.id}
                  style={{
                    marginBottom: '50px',
                    border: 'none',
                    boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                  }}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  bodyStyle={{ padding: 0 }}
                >
                  <Row gutter={0}>
                    <Col xs={24} md={12}>
                      <img
                        src={room.image}
                        alt={room.title}
                        style={{
                          width: '100%',
                          height: '300px',
                          objectFit: 'cover',
                        }}
                      />
                    </Col>
                    <Col xs={24} md={12}>
                      <div style={{ padding: '30px', backgroundColor: '#f8f9fa', height: '100%' }}>
                        <Title level={2} style={{ marginBottom: '10px' }}>
                          {room.title}
                        </Title>
                        <Title level={4} style={{ color: '#cb8670', marginBottom: '20px' }}>
                          ${room.price} <Text style={{ color: '#6c757d', fontSize: '14px' }}>/ Day</Text>
                        </Title>
                        <div style={{ marginBottom: '20px' }}>
                          <Paragraph style={{ marginBottom: '10px' }}>
                            <strong>Size:</strong> <Text style={{ color: '#6c757d' }}>{room.size}</Text>
                          </Paragraph>
                          <Paragraph style={{ marginBottom: '10px' }}>
                            <strong>Capacity:</strong> <Text style={{ color: '#6c757d' }}>{room.capacity}</Text>
                          </Paragraph>
                          <Paragraph style={{ marginBottom: '10px' }}>
                            <strong>Bed:</strong> <Text style={{ color: '#6c757d' }}>{room.bed}</Text>
                          </Paragraph>
                          <Paragraph style={{ marginBottom: '10px' }}>
                            <strong>Services:</strong> <Text style={{ color: '#6c757d' }}>{room.services}</Text>
                          </Paragraph>
                        </div>
                        <Button
                          type="primary"
                          size="large"
                          style={{
                            backgroundColor: '#cb8670',
                            borderColor: '#cb8670',
                            height: '50px',
                            padding: '0 40px',
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Col>

            <Col xs={24} lg={8}>
              <Card
                title="Hotel Reservation"
                style={{
                  marginBottom: '100px',
                  backgroundColor: '#f8f9fa',
                  border: 'none',
                }}
                headStyle={{
                  backgroundColor: '#cb8670',
                  color: '#fff',
                  fontSize: '18px',
                  fontWeight: 600,
                }}
              >
                <Form layout="vertical" onFinish={handleReservation}>
                  <Form.Item label="Check In" name="checkIn">
                    <DatePicker style={{ width: '100%' }} size="large" />
                  </Form.Item>
                  <Form.Item label="Check Out" name="checkOut">
                    <DatePicker style={{ width: '100%' }} size="large" />
                  </Form.Item>
                  <Form.Item label={<><UserOutlined /> Adults</>} name="adults" initialValue={2}>
                    <Select size="large">
                      {[1, 2, 3, 4].map((num) => (
                        <Select.Option key={num} value={num}>
                          {num}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item label={<><TeamOutlined /> Children</>} name="children" initialValue={0}>
                    <Select size="large">
                      {[0, 1, 2, 3].map((num) => (
                        <Select.Option key={num} value={num}>
                          {num}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      style={{
                        backgroundColor: '#cb8670',
                        borderColor: '#cb8670',
                        height: '50px',
                      }}
                    >
                      Check Availability
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default Rooms;