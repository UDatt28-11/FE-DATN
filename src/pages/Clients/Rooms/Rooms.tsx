import React, { useEffect } from 'react';
import { Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import BookingFilter from '@/components/Booking/BookingFilter';
import './Rooms.css';

const Rooms: React.FC = () => {
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
    console.log('Booking:', values);
  };

  return (
    <div className="rooms-page">
      {/* Breadcrumb Area */}
      <section className="breadcumb-area bg-img d-flex align-items-center justify-content-center" style={{ backgroundImage: 'url(/img/bg-img/bg-6.jpg)' }}>
        <div className="bradcumbContent">
          <h2>Rooms</h2>
        </div>
      </section>

      {/* Book Now Area */}
      <div className="book-now-area">
        <div className="container">
          <Row justify="center">
            <Col xs={24} lg={20}>
              <BookingFilter onSubmit={handleBookNow} showButton={true} />
            </Col>
          </Row>
        </div>
      </div>

      {/* Rooms Area */}
      <section className="rooms-area section-padding-0-100">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-6">
              <div className="section-heading text-center">
                <div className="line-"></div>
                <h2>Choose a room</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque, at rutrum nulla dictum. Ut ac ligula sapien.</p>
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