import React, { useState, useEffect } from 'react';
import { Carousel, Select, Row, Col, Form } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import BookRoomButton from '@/components/common/BookRoomButton';
import './Home.css';

const { Option } = Select;

const Home: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

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

  const heroSlides = [
    {
      image: '/img/bg-img/bg-1.jpg',
      title: 'The Vacation Heaven',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque, at rutrum nulla dictum. Ut ac ligula sapien. Suspendisse cursus faucibus finibus.'
    },
    {
      image: '/img/bg-img/bg-2.jpg',
      title: 'A place to remember',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque, at rutrum nulla dictum. Ut ac ligula sapien. Suspendisse cursus faucibus finibus.'
    },
    {
      image: '/img/bg-img/bg-3.jpg',
      title: 'Enjoy your life',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque, at rutrum nulla dictum. Ut ac ligula sapien. Suspendisse cursus faucibus finibus.'
    }
  ];

  const rooms = [
    {
      image: '/img/bg-img/1.jpg',
      title: 'Deluxe Room',
      price: '$150',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.'
    },
    {
      image: '/img/bg-img/8.jpg',
      title: 'Double Suite',
      price: '$150',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.'
    },
    {
      image: '/img/bg-img/9.jpg',
      title: 'Single Room',
      price: '$100',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.'
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
                      <a
                        href="#"
                        className="btn palatin-btn mt-50"
                        data-animation="fadeInUp"
                        data-delay="900ms"
                      >
                        Read More
                      </a>
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
              <div className="book-now-form">
                <Form form={form} onFinish={handleBookNow}>
                  {/* Check In */}
                  <Form.Item name="checkIn" label="Check In" className="form-group">
                    <Select
                      placeholder="19 June"
                      size="large"
                      defaultValue="19 June"
                      suffixIcon={<i className="fa fa-angle-down" />}
                    >
                      <Option value="19 June">19 June</Option>
                      <Option value="20 June">20 June</Option>
                      <Option value="21 June">21 June</Option>
                      <Option value="22 June">22 June</Option>
                      <Option value="23 June">23 June</Option>
                      <Option value="24 June">24 June</Option>
                      <Option value="25 June">25 June</Option>
                    </Select>
                  </Form.Item>

                  {/* Check Out */}
                  <Form.Item name="checkOut" label="Check Out" className="form-group">
                    <Select
                      placeholder="20 June"
                      size="large"
                      defaultValue="20 June"
                      suffixIcon={<i className="fa fa-angle-down" />}
                    >
                      <Option value="20 June">20 June</Option>
                      <Option value="21 June">21 June</Option>
                      <Option value="22 June">22 June</Option>
                      <Option value="23 June">23 June</Option>
                      <Option value="24 June">24 June</Option>
                      <Option value="25 June">25 June</Option>
                      <Option value="26 June">26 June</Option>
                      <Option value="27 June">27 June</Option>
                    </Select>
                  </Form.Item>

                  {/* Adults */}
                  <Form.Item name="adults" label="Adults" className="form-group">
                    <Select
                      placeholder="02"
                      size="large"
                      defaultValue="02"
                      suffixIcon={<i className="fa fa-angle-down" />}
                    >
                      <Option value="02">02</Option>
                      <Option value="03">03</Option>
                      <Option value="04">04</Option>
                      <Option value="05">05</Option>
                      <Option value="06">06</Option>
                    </Select>
                  </Form.Item>

                  {/* Childrens */}
                  <Form.Item name="children" label="Childrens" className="form-group">
                    <Select
                      placeholder="01"
                      size="large"
                      defaultValue="01"
                      suffixIcon={<i className="fa fa-angle-down" />}
                    >
                      <Option value="01">01</Option>
                      <Option value="02">02</Option>
                      <Option value="03">03</Option>
                      <Option value="04">04</Option>
                      <Option value="05">05</Option>
                    </Select>
                  </Form.Item>

                  {/* Button */}
                  <button type="submit" className="form-submit">
                    BOOK NOW
                  </button>
                </Form>
              </div>
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
                  <h2>A place to remember</h2>
                </div>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque, at rutrum nulla dictum. Ut ac ligula sapien. Suspendisse cursus faucibus finibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque, at rutrum nulla dictum. Ut ac ligula sapien. Suspendisse cursus faucibus finibus.</p>
                <div className="about-key-text">
                  <h6><CheckOutlined /> Donec malesuada lorem maximus mauris sceleri</h6>
                  <h6><CheckOutlined /> Malesuada lorem maximus mauris sceleri</h6>
                </div>
                <a href="#" className="btn palatin-btn mt-50">Read More</a>
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
                  <h2>Infinity Pool</h2>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque, at rutrum nulla dictum. Ut ac ligula sapien. Suspendisse cursus faucibus finibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque, at rutrum nulla dictum.</p>
                </div>

                <Row gutter={[30, 30]}>
                  <Col xs={24} sm={8}>
                    <div className="pool-feature">
                      <i className="icon-cocktail-1"></i>
                      <p>Pool Beachbar</p>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="pool-feature">
                      <i className="icon-swimming-pool"></i>
                      <p>Infinity Pool</p>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="pool-feature">
                      <i className="icon-beach"></i>
                      <p>Sunbeds</p>
                    </div>
                  </Col>
                </Row>
                <a href="#" className="btn palatin-btn mt-50">Read More</a>
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
                <h2>Choose a room</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque, at rutrum nulla dictum. Ut ac ligula sapien.</p>
              </div>
            </Col>
          </Row>

          <Row justify="center" gutter={[30, 30]}>
            {rooms.map((room, index) => (
              <Col xs={24} md={12} lg={8} key={index}>
                <div className="single-rooms-area" data-aos="fade-up" data-aos-delay={index * 200}>
                  <div className="bg-thumbnail bg-img" style={{ backgroundImage: `url(${room.image})` }}></div>
                  <p className="price-from">From {room.price}/night</p>
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
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d22236.40558254599!2d-118.25292394686001!3d34.057682914027104!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c75ddc27da13%3A0xe22fdf6f254608f4!2zTG9zIEFuZ2VsZXM!5e0!3m2!1sen!2sbd!4v1532328708137"
            allowFullScreen
            title="Map"
          ></iframe>
        </div>
        <div className="contact-info" data-aos="fade-left">
          <div className="single-contact-information">
            <div className="section-heading">
              <div className="line-"></div>
              <h2>Contact Info</h2>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque, at rutrum nulla dictum. Ut ac ligula sapien. Suspendisse cursus faucibus finibus. Lorem ipsum dolor sit amet, consectetur adipiscing.</p>
            </div>

            <h4 className="mt-50">Los Angeles 1481 Creekside Lane Avila Beach, CA 931</h4>

            <h5 className="mt-30">+53 345 7953 32453</h5>

            <h5>bookstay@homestay.com</h5>

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