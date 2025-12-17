import React, { useEffect } from 'react';
import { Row, Col, Typography, Breadcrumb } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import BookingFilter from '@/components/Booking/BookingFilter';
import './Rooms.css';

const { Title, Paragraph } = Typography;

const Rooms: React.FC = () => {
  const navigate = useNavigate();

  const rooms = [
    { id: 1, image: '/img/bg-img/1.jpg', title: 'Deluxe Room', price: 150, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.', delay: '100ms' },
    { id: 2, image: '/img/bg-img/8.jpg', title: 'Double Suite', price: 150, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.', delay: '200ms' },
    { id: 3, image: '/img/bg-img/9.jpg', title: 'Single Room', price: 100, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.', delay: '300ms' },
    { id: 4, image: '/img/bg-img/15.jpg', title: 'Deluxe Room', price: 150, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.', delay: '100ms' },
    { id: 5, image: '/img/bg-img/16.jpg', title: 'Double Suite', price: 150, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.', delay: '200ms' },
    { id: 6, image: '/img/bg-img/17.jpg', title: 'Single Room', price: 100, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.', delay: '300ms' },
    { id: 7, image: '/img/bg-img/18.jpg', title: 'Deluxe Room', price: 150, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.', delay: '100ms' },
    { id: 8, image: '/img/bg-img/19.jpg', title: 'Double Suite', price: 150, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.', delay: '200ms' },
    { id: 9, image: '/img/bg-img/20.jpg', title: 'Single Room', price: 100, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.', delay: '300ms' },
  ];

  useEffect(() => {
    // Trigger animations on mount
    const elements = document.querySelectorAll('.wow');
    elements.forEach((el) => {
      el.classList.add('fadeInUp');
    });
  }, []);

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
                  Chọn Phòng Ưng Ý
                </Title>
                <Paragraph style={{ 
                  color: '#6c757d', 
                  fontSize: 17, 
                  maxWidth: 600, 
                  margin: '0 auto',
                  lineHeight: 1.7,
                }}>
                  Mỗi phòng được thiết kế với sự tinh tế, mang đến trải nghiệm nghỉ dưỡng hoàn hảo cho quý khách
                </Paragraph>
              </div>
            </div>
          </div>

          <div className="row">
            {rooms.map((room) => (
              <div className="col-12 col-md-6 col-lg-4" key={room.id}>
                <div className="single-rooms-area wow fadeInUp" data-wow-delay={room.delay} style={{ animationDelay: room.delay }}>
                  {/* Thumbnail */}
                  <div className="bg-thumbnail bg-img" style={{ backgroundImage: `url(${room.image})` }}></div>
                  {/* Price */}
                  <p className="price-from">From ${room.price}/night</p>
                  {/* Rooms Text */}
                  <div className="rooms-text">
                    <div className="line"></div>
                    <h4>{room.title}</h4>
                    <p>{room.desc}</p>
                  </div>
                  {/* Book Room Button */}
                  <Link to={`/rooms/${room.id}`} className="book-room-btn btn palatin-btn">Xem chi tiết</Link>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="col-12">
              <div className="pagination-area wow fadeInUp" data-wow-delay="400ms" style={{ animationDelay: '400ms' }}>
                <nav>
                  <ul className="pagination">
                    <li className="page-item active"><a className="page-link" href="#">01</a></li>
                    <li className="page-item"><a className="page-link" href="#">02</a></li>
                    <li className="page-item"><a className="page-link" href="#">03</a></li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Rooms;