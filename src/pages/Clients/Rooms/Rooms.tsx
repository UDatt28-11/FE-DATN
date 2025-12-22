import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Breadcrumb, Spin } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import BookingFilter from '@/components/Booking/BookingFilter';
import roomtypeService from '@/service/roomtypeService';
import type { RoomType } from '@/types/roomtype/roomtype';
import './Rooms.css';

const { Title, Paragraph } = Typography;

const Rooms: React.FC = () => {
  const navigate = useNavigate();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      const response = await roomtypeService.getRoomTypes({ status: 'active', per_page: 100 });
      const data = Array.isArray(response.data) ? response.data : [response.data];
      setRoomTypes(data);
    } catch (error) {
      console.error('Error fetching room types:', error);
      setRoomTypes([]);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="rooms-page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        height: 450,
        backgroundImage: "url('/img/bg-img/bg-6.jpg')",
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
            Phòng Nghỉ Của Chúng Tôi
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 25 }}>
            Khám phá những không gian nghỉ dưỡng đẳng cấp
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
                title: <span style={{ color: '#fff', fontSize: 15 }}>Phòng</span>,
              },
            ]}
          />
        </div>
      </section>

      {/* Book Now Area */}
      <div style={{ marginTop: '-7px', marginBottom: '10px', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <Row justify="center">
            <Col xs={24} lg={20}>
              <BookingFilter onSubmit={handleBookNow} showButton={true} />
            </Col>
          </Row>
        </div>
      </div>

      {/* Rooms Area */}
      <section className="rooms-area section-padding-0-100" style={{
        background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)',
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-6">
              <div style={{ textAlign: 'center', marginBottom: 70 }}>
                <div style={{
                  width: 70,
                  height: 4,
                  background: 'linear-gradient(90deg, #cb8670, #e0a090)',
                  margin: '0 auto 25px',
                  borderRadius: 3,
                  boxShadow: '0 2px 8px rgba(203, 134, 112, 0.3)',
                }} />
                <Title level={2} style={{ 
                  fontSize: 42, 
                  fontWeight: 600, 
                  marginBottom: 18,
                  color: '#1a1a1a',
                  letterSpacing: '-0.5px',
                }}>
                  Các Loại Phòng
                </Title>
                <Paragraph style={{ 
                  color: '#6c757d', 
                  fontSize: 17, 
                  maxWidth: 600, 
                  margin: '0 auto',
                  lineHeight: 1.7,
                }}>
                  Khám phá các loại phòng đa dạng với tiện nghi hiện đại và dịch vụ chất lượng cao
                </Paragraph>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Spin size="large" />
            </div>
          ) : (
            <div className="rooms-grid">
              {roomTypes.length > 0 ? (
                roomTypes.map((roomType, index) => (
                  <div 
                    key={roomType.id} 
                    className="room-card wow fadeInUp" 
                    data-wow-delay={`${(index % 3) * 100 + 100}ms`}
                    style={{ animationDelay: `${(index % 3) * 100 + 100}ms` }}
                  >
                    <div className="room-card-container">
                      {/* Background Image */}
                      <div 
                        className="room-card-bg" 
                        style={{ backgroundImage: `url(${roomType.image_url || '/img/bg-img/1.jpg'})` }}
                      ></div>
                      
                      {/* Overlay */}
                      <div className="room-card-overlay"></div>
                      
                      {/* Roof decoration */}
                      <div className="room-card-roof"></div>
                      
                      {/* Content */}
                      <div className="room-card-content">
                        <h3 className="room-card-title">{roomType.name}</h3>
                        <p className="room-card-desc">
                          {roomType.description || 'Loại phòng chất lượng cao với tiện nghi đầy đủ'}
                        </p>
                        <Link to={`/rooms/${roomType.id}`} className="room-card-btn">
                          Xem Chi Tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                  <Paragraph style={{ color: '#6c757d', fontSize: 16 }}>
                    Không có loại phòng nào
                  </Paragraph>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Rooms;