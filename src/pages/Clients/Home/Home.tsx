import React, { useState, useEffect } from 'react';
import { Carousel, Row, Col } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import BookRoomButton from '@/components/common/BookRoomButton';
import BookingFilter from '@/components/Booking/BookingFilter';
import './Home.css';

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate preloader
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleBookNow = (values: any) => {
    console.log('Booking:', values);
  };

  const handleRoomClick = (roomId: number) => {
    navigate(`/rooms/${roomId}`);
  };

  const heroSlides = [
    {
      image: '/img/bg-img/bg-1.jpg',
      title: 'Thiên Đường Nghỉ Dưỡng',
      description: 'Khám phá không gian nghỉ dưỡng đẳng cấp với thiết kế sang trọng, tiện nghi hiện đại và dịch vụ tận tâm. Nơi mọi khoảnh khắc đều trở nên đáng nhớ.'
    },
    {
      image: '/img/bg-img/bg-2.jpg',
      title: 'Nơi Đáng Nhớ',
      description: 'Tận hưởng những trải nghiệm tuyệt vời cùng gia đình và người thân. Mỗi phòng là một câu chuyện, mỗi khoảnh khắc là một kỷ niệm.'
    },
    {
      image: '/img/bg-img/bg-3.jpg',
      title: 'Tận Hưởng Cuộc Sống',
      description: 'Hãy để chúng tôi chăm sóc mọi chi tiết để bạn có thể thư giãn hoàn toàn. Trải nghiệm sự kết hợp hoàn hảo giữa thiên nhiên và tiện nghi hiện đại.'
    }
  ];

  const rooms = [
    {
      id: 1,
      image: '/img/bg-img/1.jpg',
      title: 'Phòng Deluxe',
      price: '1.500.000đ',
      description: 'Phòng Deluxe sang trọng với thiết kế hiện đại, đầy đủ tiện nghi cao cấp, view đẹp và không gian rộng rãi.'
    },
    {
      id: 2,
      image: '/img/bg-img/8.jpg',
      title: 'Phòng Suite Đôi',
      price: '2.000.000đ',
      description: 'Suite đôi rộng rãi với phòng khách riêng, phòng ngủ sang trọng và đầy đủ tiện nghi cho gia đình.'
    },
    {
      id: 3,
      image: '/img/bg-img/9.jpg',
      title: 'Phòng Đơn',
      price: '800.000đ',
      description: 'Phòng đơn ấm cúng, tiện nghi đầy đủ, phù hợp cho khách đi công tác hoặc du lịch một mình.'
    }
  ];

  return (
    <div className="home-wrapper">
      {/* Preloader */}
      {loading && (
        <div className="preloader d-flex align-items-center justify-content-center">
          <div className="cssload-container">
            <div className="cssload-loading">
              <i></i><i></i><i></i><i></i>
            </div>
          </div>
        </div>
      )}

      {/* Hero Area */}
      <section className="hero-area">
        <Carousel
          autoplay
          effect="fade"
          className="hero-slides"
          dots={true}
        >
          {heroSlides.map((slide, index) => (
            <div key={index} className="single-hero-slide d-flex align-items-center justify-content-center">
              <div
                className="slide-img bg-img"
                style={{ backgroundImage: `url(${slide.image})` }}
              ></div>
              <div className="container">
                <Row justify="center">
                  <Col xs={24} lg={18}>
                    <div className="hero-slides-content" data-animation="fadeInUp" data-delay="100ms">
                      <div className="line" data-animation="fadeInUp" data-delay="300ms"></div>
                      <h2 data-animation="fadeInUp" data-delay="500ms">{slide.title}</h2>
                      <p data-animation="fadeInUp" data-delay="700ms">{slide.description}</p>
                      <button
                        onClick={() => navigate('/rooms')}
                        className="btn palatin-btn mt-50"
                        data-animation="fadeInUp"
                        data-delay="900ms"
                      >
                        Xem Thêm
                      </button>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          ))}
        </Carousel>
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

      {/* About Us Area */}
      <section className="about-us-area section-padding-100">
        <div className="container">
          <Row align="middle" gutter={[30, 30]}>
            <Col xs={24} lg={12}>
              <div className="about-text text-center mb-100" data-aos="fade-up">
                <div className="section-heading text-center">
                  <div className="line-"></div>
                  <h2>Nơi Đáng Nhớ</h2>
                </div>
                <p>Chào mừng đến với khách sạn của chúng tôi - nơi kết hợp hoàn hảo giữa sự sang trọng và ấm cúng. Với đội ngũ nhân viên chuyên nghiệp, tiện nghi hiện đại và dịch vụ tận tâm, chúng tôi cam kết mang đến cho bạn những trải nghiệm lưu trú tuyệt vời nhất. Mỗi chi tiết đều được chăm chút kỹ lưỡng để tạo nên không gian nghỉ dưỡng hoàn hảo.</p>
                <div className="about-key-text">
                  <h6><CheckOutlined /> Vị trí đắc địa, giao thông thuận tiện</h6>
                  <h6><CheckOutlined /> Dịch vụ chăm sóc khách hàng 24/7</h6>
                </div>
                <button onClick={() => navigate('/services')} className="btn palatin-btn mt-50">Xem Thêm</button>
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div className="about-thumbnail homepage mb-100">
                <div className="first-img" data-aos="fade-up" data-aos-delay="100">
                  <img src="/img/bg-img/5.jpg" alt="" />
                </div>
                <div className="second-img" data-aos="fade-up" data-aos-delay="300">
                  <img src="/img/bg-img/6.jpg" alt="" />
                </div>
                <div className="third-img" data-aos="fade-up" data-aos-delay="500">
                  <img src="/img/bg-img/7.jpg" alt="" />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Pool Area */}
      <section className="pool-area section-padding-100 bg-img bg-fixed" style={{ backgroundImage: 'url(/img/bg-img/4.png)' }}>
        <div className="container">
          <Row justify="end">
            <Col xs={24} lg={14}>
              <div className="pool-content text-center" data-aos="fade-up" data-aos-delay="300">
                <div className="section-heading text-center white">
                  <div className="line-"></div>
                  <h2>Hồ Bơi Vô Cực</h2>
                  <p>Tận hưởng những giây phút thư giãn tuyệt vời tại hồ bơi vô cực với tầm nhìn panorama tuyệt đẹp. Được thiết kế hiện đại, hồ bơi mang đến không gian nghỉ dưỡng lý tưởng cùng các dịch vụ cao cấp. Hãy đắm mình trong làn nước trong xanh và tận hưởng khoảnh khắc bình yên.</p>
                </div>

                <Row gutter={[30, 30]}>
                  <Col xs={24} sm={8}>
                    <div className="pool-feature">
                      <i className="icon-cocktail-1"></i>
                      <p>Bar Bên Hồ Bơi</p>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="pool-feature">
                      <i className="icon-swimming-pool"></i>
                      <p>Hồ Bơi Vô Cực</p>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="pool-feature">
                      <i className="icon-beach"></i>
                      <p>Ghế Tắm Nắng</p>
                    </div>
                  </Col>
                </Row>
                <button onClick={() => navigate('/services')} className="btn palatin-btn mt-50">Xem Thêm</button>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Rooms Area */}
      <section className="rooms-area section-padding-100-0">
        <div className="container">
          <Row justify="center">
            <Col xs={24} lg={12}>
              <div className="section-heading text-center" data-aos="fade-up">
                <div className="line-"></div>
                <h2>Chọn Phòng Của Bạn</h2>
                <p>Khám phá các loại phòng đa dạng với thiết kế sang trọng, tiện nghi hiện đại và dịch vụ hoàn hảo. Mỗi phòng đều được thiết kế để mang đến sự thoải mái tối đa cho quý khách.</p>
              </div>
            </Col>
          </Row>

          <Row justify="center" gutter={[30, 30]}>
            {rooms.map((room, index) => (
              <Col xs={24} md={12} lg={8} key={index}>
                <div
                  className="single-rooms-area"
                  data-aos="fade-up"
                  data-aos-delay={index * 200}
                  onClick={() => handleRoomClick(room.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="bg-thumbnail bg-img" style={{ backgroundImage: `url(${room.image})` }}></div>
                  <p className="price-from">Từ {room.price}/đêm</p>
                  <div className="rooms-text">
                    <div className="line"></div>
                    <h4>{room.title}</h4>
                    <p>{room.description}</p>
                  </div>
                  <BookRoomButton />
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>


      {/* Contact Area */}
      <section className="contact-area d-flex flex-wrap align-items-center">
        <div className="home-map-area" data-aos="fade-right">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.3193500194533!2d106.69522431533314!3d10.78240279230088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f9ed887b%3A0x14aded5703768989!2zMTIzIMSQxrDhu51uZyBMw6ogTOG7o2ksIELhur9uIE5naOG6uSwgUXXhuq1uIDEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1699999999999!5m2!1svi!2s"
            allowFullScreen
            title="Map"
          ></iframe>
        </div>
        <div className="contact-info" data-aos="fade-left">
          <div className="single-contact-information">
            <div className="section-heading">
              <div className="line-"></div>
              <h2>Thông Tin Liên Hệ</h2>
              <p>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi qua bất kỳ kênh nào dưới đây để được tư vấn và đặt phòng. Đội ngũ của chúng tôi sẽ phản hồi nhanh chóng và nhiệt tình.</p>
            </div>

            <h4 className="mt-50">123 Đường Lê Lợi, Quận 1, Thành phố Hồ Chí Minh</h4>

            <h5 className="mt-30">+84 28 3822 1234</h5>

            <h5>contact@palatinhotel.vn</h5>

            <div className="social-info mt-50">
              <a href="#"><i className="fa-brands fa-pinterest" aria-hidden="true"></i></a>
              <a href="https://www.facebook.com/storeFW"><i className="fa-brands fa-facebook" aria-hidden="true"></i></a>
              <a href="#"><i className="fa-brands fa-twitter" aria-hidden="true"></i></a>
              <a href="#"><i className="fa-brands fa-dribbble" aria-hidden="true"></i></a>
              <a href="#"><i className="fa-brands fa-behance" aria-hidden="true"></i></a>
              <a href="#"><i className="fa-brands fa-linkedin" aria-hidden="true"></i></a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;