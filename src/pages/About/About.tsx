import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Image, Breadcrumb } from 'antd';
import { CheckOutlined, HomeOutlined } from '@ant-design/icons';
import BookingFilter from '../../components/Booking/BookingFilter';

const { Title, Paragraph, Text } = Typography;

// Counter animation hook
const useCountUp = (end: number, duration: number = 2000, shouldStart: boolean = false) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldStart) {
      setCount(0);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function - easeOutQuart for smooth deceleration
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      const currentCount = Math.floor(easeOutQuart * end);

      if (currentCount !== countRef.current) {
        countRef.current = currentCount;
        setCount(currentCount);
      }

      if (percentage < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      startTimeRef.current = null;
    };
  }, [end, duration, shouldStart]);

  return count;
};

// Add CSS animations
const injectStyles = () => {
  const styleId = 'about-page-styles';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .cool-fact-box {
      transition: all 0.4s ease;
    }
    
    .cool-fact-box:hover {
      border-color: rgba(212, 175, 55, 1) !important;
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    .cool-fact-box:hover svg {
      transform: scale(1.1);
    }
    
    .cool-fact-box svg {
      transition: transform 0.3s ease;
    }
    
    .milestone-item {
      animation: fadeInUp 0.6s ease forwards;
      opacity: 0;
    }
    
    .milestone-item.visible {
      opacity: 1;
    }
    
    .milestone-item:nth-child(1) { animation-delay: 0.1s; }
    .milestone-item:nth-child(2) { animation-delay: 0.3s; }
    .milestone-item:nth-child(3) { animation-delay: 0.5s; }
    .milestone-item:nth-child(4) { animation-delay: 0.7s; }
  `;
  document.head.appendChild(style);
};

// CSS styles
const styles = {
  // Breadcrumb Area
  breadcrumbArea: {
    height: '400px',
    backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
  },
  breadcrumbOverlay: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  breadcrumbContent: {
    textAlign: 'center' as const,
    position: 'relative' as const,
    zIndex: 2,
  },
  // Section Heading
  sectionHeading: {
    marginBottom: 50,
  },
  line: {
    width: 60,
    height: 4,
    background: '#d4af37',
    marginBottom: 20,
  },
  lineCenter: {
    width: 60,
    height: 4,
    background: '#d4af37',
    margin: '0 auto 20px',
  },
  // About Section
  aboutSection: {
    padding: '100px 0',
    background: '#fff',
  },
  // Milestones Section
  milestonesSection: {
    padding: '100px 0 0 0',
    backgroundImage: "url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed' as const,
    position: 'relative' as const,
  },
  milestonesOverlay: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1,
  },
  // Single Cool Fact
  singleCoolFact: {
    textAlign: 'center' as const,
    marginBottom: 100,
    border: '2px solid rgba(212, 175, 55, 0.5)',
    padding: '40px 20px',
    transition: 'all 0.3s ease',
    background: 'rgba(26, 26, 26, 0.9)',
  },
  // Hotels Section
  hotelsSection: {
    padding: '100px 0 0 0',
    background: '#fff',
  },
  // Single Hotel Info
  singleHotelInfo: {
    marginBottom: 100,
  },
  hotelInfoText: {
    padding: '30px 25px',
    background: '#f8f8f8',
  },
  // Testimonial Section
  testimonialSection: {
    padding: '100px 0',
    backgroundImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OEI2QzI2RkY4QjNCMTFFNDk3QTZFNUM5RDREOTI5M0QiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OEI2QzI3MDA4QjNCMTFFNDk3QTZFNUM5RDREOTI5M0QiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4QjZDMjZGRDhCM0IxMUU0OTdBNkU1QzlENEQ5MjkzRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4QjZDMjZGRThCM0IxMUU0OTdBNkU1QzlENEQ5MjkzRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqqezsUAAAA+SURBVHjaYmDAA/7//8/AwMDAhCKFBrCKMTIyMjAxMaEIokmhKQQrRFOIphBNIZpCNIVoCtEUYvM/QIABAKQOBAc4vuiBAAAAAElFTkSuQmCC)',
    backgroundRepeat: 'repeat',
    background: '#f8f8f8',
  },
  // Footer Section
  footerSection: {
    background: '#1a1a1a',
    padding: '80px 0',
    color: '#fff',
  },
};

const About: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const milestonesRef = useRef<HTMLDivElement>(null);

  // Counter values
  const cocktailCount = useCountUp(231, 2000, isVisible);
  const poolCount = useCountUp(3, 1500, isVisible);
  const roomCount = useCountUp(79, 2000, isVisible);
  const apartmentCount = useCountUp(25, 1800, isVisible);

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

  // Inject CSS animations on mount
  useEffect(() => {
    injectStyles();
  }, []);

  // Intersection Observer for counter animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of the section is visible
        rootMargin: '0px',
      }
    );

    if (milestonesRef.current) {
      observer.observe(milestonesRef.current);
    }

    return () => {
      if (milestonesRef.current) {
        observer.unobserve(milestonesRef.current);
      }
    };
  }, [isVisible]);

  return (
    <div style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        height: 450,
        backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945')",
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
            Về Chúng Tôi
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 25 }}>
            Khám phá câu chuyện và giá trị của BookStay
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
                title: <span style={{ color: '#fff', fontSize: 15 }}>Giới thiệu</span>,
              },
            ]}
          />
        </div>
      </section>

      {/* Book Now Area */}
      <div className="book-now-area" style={{ marginTop: '-7px', marginBottom: '10px', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <Row justify="center">
            <Col xs={24} lg={20}>
              <BookingFilter onSubmit={handleBookNow} showButton={true} />
            </Col>
          </Row>
        </div>
      </div>

      {/* ##### About Us Area Start ##### */}
      <section style={{
        ...styles.aboutSection,
        background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)',
      }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 15px' }}>
          <Row gutter={[60, 40]} align="middle">
            <Col xs={24} lg={12}>
              <div style={{ marginBottom: 100 }}>
                <div style={{ marginBottom: 30 }}>
                  <div style={{
                    width: 70,
                    height: 4,
                    background: 'linear-gradient(90deg, #cb8670, #e0a090)',
                    marginBottom: 25,
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(203, 134, 112, 0.3)',
                  }} />
                  <Title level={2} style={{ 
                    fontSize: 42, 
                    fontWeight: 600, 
                    marginBottom: 0, 
                    color: '#1a1a1a',
                    letterSpacing: '-0.5px',
                  }}>
                    Một Nơi Đáng Nhớ
                  </Title>
                </div>
                <Paragraph style={{ fontSize: 16, color: '#7d7d7d', lineHeight: 2, marginBottom: 0 }}>
                  Nằm giữa thiên nhiên yên bình, homestay của chúng tôi là nơi lý tưởng để bạn thư giãn
                  và tận hưởng khoảng thời gian nghỉ dưỡng tuyệt vời. Với không gian ấm cúng, phòng ốc
                  tiện nghi và dịch vụ tận tâm, chúng tôi cam kết mang đến cho bạn trải nghiệm lưu trú
                  như ở nhà, đầy ấm áp và thân thiện. Homestay được thiết kế với phong cách hiện đại 
                  kết hợp truyền thống, mang đến sự hài hòa giữa tiện nghi đô thị và nét đẹp văn hóa địa phương.
                </Paragraph>
                <Link 
                  to="/rooms" 
                  style={{
                    display: 'inline-block',
                    marginTop: 50,
                    padding: '15px 40px',
                    background: '#d4af37',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    border: 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  Xem thêm
                </Link>
              </div>
            </Col>
            <Col xs={24} lg={12}>
              <div style={{ marginBottom: 100 }}>
                <Image
                  src="https://images.unsplash.com/photo-1571896349842-33c89424de2d"
                  alt="Homestay"
                  style={{ width: '100%' }}
                  preview={false}
                />
              </div>
            </Col>
          </Row>
        </div>
      </section>
      {/* ##### About Us Area End ##### */}

      {/* ##### Milestones Area Start ##### */}
      <section ref={milestonesRef} style={styles.milestonesSection}>
        <div style={styles.milestonesOverlay} />
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 15px', position: 'relative', zIndex: 2 }}>
          {/* Section Heading */}
          <Row justify="center">
            <Col xs={24} lg={16}>
              <div style={{ textAlign: 'center', marginBottom: 60 }}>
                <div style={styles.lineCenter} />
                <Title level={2} style={{ 
                  color: '#fff', 
                  fontSize: 42, 
                  fontWeight: 400, 
                  marginBottom: 20,
                }}>
                  Thành Tựu Của Chúng Tôi
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.8 }}>
                  Với nhiều năm kinh nghiệm trong lĩnh vực lưu trú, chúng tôi tự hào đã phục vụ hàng nghìn khách hàng từ khắp nơi trên cả nước. Homestay của chúng tôi không chỉ là nơi nghỉ ngơi mà còn là điểm đến lý tưởng để bạn tận hưởng những khoảnh khắc đáng nhớ cùng gia đình và bạn bè.
                </Paragraph>
              </div>
            </Col>
          </Row>

          {/* Cool Facts */}
          <Row gutter={[30, 30]} justify="center">
            {/* Single Cool Facts - Khách hàng hài lòng */}
            <Col xs={12} sm={12} lg={6} className="milestone-item">
              <div style={{ textAlign: 'center', marginBottom: 100 }}>
                {/* Icon Box */}
                <div className="cool-fact-box" style={{
                  border: '2px solid rgba(212, 175, 55, 0.6)',
                  background: 'rgba(26, 26, 26, 0.85)',
                  padding: '35px',
                  marginBottom: 25,
                  display: 'inline-block',
                  cursor: 'pointer',
                }}>
                  <svg width="55" height="55" viewBox="0 0 64 64" fill="none" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    {/* Happy customer - smile face */}
                    <circle cx="32" cy="28" r="18" />
                    <circle cx="26" cy="24" r="2" fill="#d4af37" stroke="none" />
                    <circle cx="38" cy="24" r="2" fill="#d4af37" stroke="none" />
                    <path d="M24 32c2 4 6 6 8 6s6-2 8-6" />
                    {/* Heart */}
                    <path d="M26 50c-3-2-6-1-7 2s1 6 7 10c6-4 8-7 7-10s-4-4-7-2z" fill="#d4af37" stroke="none" />
                    <path d="M38 50c-3-2-6-1-7 2s1 6 7 10c6-4 8-7 7-10s-4-4-7-2z" fill="#d4af37" stroke="none" />
                  </svg>
                </div>
                {/* Number */}
                <Title level={2} style={{ 
                  color: '#fff', 
                  margin: '0 0 8px 0', 
                  fontSize: 56, 
                  fontWeight: 300,
                  lineHeight: 1,
                }}>
                  {cocktailCount}
                </Title>
                {/* Label */}
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, letterSpacing: 1 }}>Khách hàng hài lòng</Text>
              </div>
            </Col>

            {/* Single Cool Facts - Địa điểm */}
            <Col xs={12} sm={12} lg={6} className="milestone-item">
              <div style={{ textAlign: 'center', marginBottom: 100 }}>
                {/* Icon Box */}
                <div className="cool-fact-box" style={{
                  border: '2px solid rgba(212, 175, 55, 0.6)',
                  background: 'rgba(26, 26, 26, 0.85)',
                  padding: '35px',
                  marginBottom: 25,
                  display: 'inline-block',
                  cursor: 'pointer',
                }}>
                  <svg width="55" height="55" viewBox="0 0 64 64" fill="none" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    {/* Location pin */}
                    <path d="M32 4C22 4 14 12 14 22c0 14 18 36 18 36s18-22 18-36c0-10-8-18-18-18z" />
                    <circle cx="32" cy="22" r="8" />
                    <circle cx="32" cy="22" r="3" fill="#d4af37" stroke="none" />
                  </svg>
                </div>
                {/* Number */}
                <Title level={2} style={{ 
                  color: '#fff', 
                  margin: '0 0 8px 0', 
                  fontSize: 56, 
                  fontWeight: 300,
                  lineHeight: 1,
                }}>
                  {poolCount}
                </Title>
                {/* Label */}
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, letterSpacing: 1 }}>Địa điểm</Text>
              </div>
            </Col>

            {/* Single Cool Facts - Rooms */}
            <Col xs={12} sm={12} lg={6} className="milestone-item">
              <div style={{ textAlign: 'center', marginBottom: 100 }}>
                {/* Icon Box */}
                <div className="cool-fact-box" style={{
                  border: '2px solid rgba(212, 175, 55, 0.6)',
                  background: 'rgba(26, 26, 26, 0.85)',
                  padding: '35px',
                  marginBottom: 25,
                  display: 'inline-block',
                  cursor: 'pointer',
                }}>
                  <svg width="55" height="55" viewBox="0 0 64 64" fill="none" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    {/* Building */}
                    <rect x="10" y="18" width="44" height="38" />
                    {/* Roof */}
                    <path d="M6 18l26-14 26 14" />
                    {/* Door */}
                    <rect x="26" y="40" width="12" height="16" />
                    <circle cx="35" cy="48" r="1.5" fill="#d4af37" stroke="none" />
                    {/* Windows */}
                    <rect x="16" y="26" width="8" height="8" />
                    <rect x="40" y="26" width="8" height="8" />
                    {/* Ground */}
                    <path d="M4 56h56" />
                  </svg>
                </div>
                {/* Number */}
                <Title level={2} style={{ 
                  color: '#fff', 
                  margin: '0 0 8px 0', 
                  fontSize: 56, 
                  fontWeight: 300,
                  lineHeight: 1,
                }}>
                  {roomCount}
                </Title>
                {/* Label */}
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, letterSpacing: 1 }}>Phòng nghỉ</Text>
              </div>
            </Col>

            {/* Single Cool Facts - Nhân viên */}
            <Col xs={12} sm={12} lg={6} className="milestone-item">
              <div style={{ textAlign: 'center', marginBottom: 100 }}>
                {/* Icon Box */}
                <div className="cool-fact-box" style={{
                  border: '2px solid rgba(212, 175, 55, 0.6)',
                  background: 'rgba(26, 26, 26, 0.85)',
                  padding: '35px',
                  marginBottom: 25,
                  display: 'inline-block',
                  cursor: 'pointer',
                }}>
                  <svg width="55" height="55" viewBox="0 0 64 64" fill="none" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    {/* Team/Staff icon - multiple people */}
                    {/* Person 1 - center */}
                    <circle cx="32" cy="16" r="8" />
                    <path d="M20 56v-10c0-6 5-10 12-10s12 4 12 10v10" />
                    {/* Person 2 - left */}
                    <circle cx="14" cy="20" r="6" />
                    <path d="M4 52v-8c0-5 4-8 10-8" />
                    {/* Person 3 - right */}
                    <circle cx="50" cy="20" r="6" />
                    <path d="M60 52v-8c0-5-4-8-10-8" />
                  </svg>
                </div>
                {/* Number */}
                <Title level={2} style={{ 
                  color: '#fff', 
                  margin: '0 0 8px 0', 
                  fontSize: 56, 
                  fontWeight: 300,
                  lineHeight: 1,
                }}>
                  {apartmentCount}
                </Title>
                {/* Label */}
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, letterSpacing: 1 }}>Nhân viên</Text>
              </div>
            </Col>
          </Row>
        </div>
      </section>
      {/* ##### Milestones Area End ##### */}

      {/* ##### Hotels Area Start ##### */}
      <section style={styles.hotelsSection}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 15px' }}>
          {/* Section Heading */}
          <Row>
            <Col span={24}>
              <div style={{ textAlign: 'center', marginBottom: 50 }}>
                <div style={styles.lineCenter} />
                <Title level={2} style={{ fontSize: 36, fontWeight: 700, color: '#303030' }}>
                  Homestay của chúng tôi
                </Title>
              </div>
            </Col>
          </Row>

          <Row gutter={[30, 0]} justify="center">
            {/* Single Hotel Info */}
            <Col xs={24} md={12} lg={8}>
              <div style={styles.singleHotelInfo}>
                <div style={styles.hotelInfoText}>
                  <div style={{ marginBottom: 12, display: 'flex', alignItems: 'flex-start' }}>
                    <CheckOutlined style={{ color: '#d4af37', marginRight: 12, marginTop: 4 }} />
                    <Text style={{ fontSize: 15, color: '#303030' }}>Phòng trang bị đầy đủ tiện nghi</Text>
                  </div>
                  <div style={{ marginBottom: 12, display: 'flex', alignItems: 'flex-start' }}>
                    <CheckOutlined style={{ color: '#d4af37', marginRight: 12, marginTop: 4 }} />
                    <Text style={{ fontSize: 15, color: '#303030' }}>Wifi tốc độ cao miễn phí</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckOutlined style={{ color: '#d4af37', marginRight: 12, marginTop: 4 }} />
                    <Text style={{ fontSize: 15, color: '#303030' }}>Khu vực bếp chung hiện đại</Text>
                  </div>
                </div>
                <div>
                  <Image
                    src="https://images.unsplash.com/photo-1590490360182-c33d57733427"
                    alt="Phòng khách"
                    style={{ width: '100%', height: 250, objectFit: 'cover' }}
                    preview={false}
                  />
                </div>
              </div>
            </Col>

            {/* Single Hotel Info */}
            <Col xs={24} md={12} lg={8}>
              <div style={styles.singleHotelInfo}>
                <div style={styles.hotelInfoText}>
                  <div style={{ marginBottom: 12, display: 'flex', alignItems: 'flex-start' }}>
                    <CheckOutlined style={{ color: '#d4af37', marginRight: 12, marginTop: 4 }} />
                    <Text style={{ fontSize: 15, color: '#303030' }}>Không gian yên tĩnh, sạch sẽ</Text>
                  </div>
                  <div style={{ marginBottom: 12, display: 'flex', alignItems: 'flex-start' }}>
                    <CheckOutlined style={{ color: '#d4af37', marginRight: 12, marginTop: 4 }} />
                    <Text style={{ fontSize: 15, color: '#303030' }}>Điều hòa, nước nóng 24/7</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckOutlined style={{ color: '#d4af37', marginRight: 12, marginTop: 4 }} />
                    <Text style={{ fontSize: 15, color: '#303030' }}>Ban công riêng thoáng mát</Text>
                  </div>
                </div>
                <div>
                  <Image
                    src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"
                    alt="Khu vực chung"
                    style={{ width: '100%', height: 250, objectFit: 'cover' }}
                    preview={false}
                  />
                </div>
              </div>
            </Col>

            {/* Single Hotel Info */}
            <Col xs={24} md={12} lg={8}>
              <div style={styles.singleHotelInfo}>
                <div style={styles.hotelInfoText}>
                  <div style={{ marginBottom: 12, display: 'flex', alignItems: 'flex-start' }}>
                    <CheckOutlined style={{ color: '#d4af37', marginRight: 12, marginTop: 4 }} />
                    <Text style={{ fontSize: 15, color: '#303030' }}>Bảo mật với khóa thông minh</Text>
                  </div>
                  <div style={{ marginBottom: 12, display: 'flex', alignItems: 'flex-start' }}>
                    <CheckOutlined style={{ color: '#d4af37', marginRight: 12, marginTop: 4 }} />
                    <Text style={{ fontSize: 15, color: '#303030' }}>Hỗ trợ tư vấn du lịch</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckOutlined style={{ color: '#d4af37', marginRight: 12, marginTop: 4 }} />
                    <Text style={{ fontSize: 15, color: '#303030' }}>Dịch vụ tận tâm 24/7</Text>
                  </div>
                </div>
                <div>
                  <Image
                    src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"
                    alt="View"
                    style={{ width: '100%', height: 250, objectFit: 'cover' }}
                    preview={false}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>
      {/* ##### Hotels Area End ##### */}

      {/* ##### Testimonial Area Start ##### */}
      <section style={styles.testimonialSection}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 15px' }}>
          <Row>
            <Col span={24}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 50 }}>
                  <div style={styles.lineCenter} />
                  <Title level={2} style={{ fontSize: 36, fontWeight: 700, color: '#303030' }}>
                    Khách hàng nói gì
                  </Title>
                </div>

                {/* Single Testimonial */}
                <div style={{ 
                  maxWidth: 900, 
                  margin: '0 auto',
                  background: '#fff',
                  padding: '60px 50px',
                  boxShadow: '0 5px 30px rgba(0,0,0,0.08)',
                }}>
                  <Paragraph style={{ 
                    fontSize: 18, 
                    color: '#7d7d7d', 
                    lineHeight: 2,
                    fontStyle: 'italic',
                    marginBottom: 30,
                  }}>
                    "Homestay thật sự tuyệt vời! Không gian ấm cúng, sạch sẽ và đầy đủ tiện nghi. Chủ nhà
                    rất nhiệt tình và thân thiện, giúp chúng tôi có những trải nghiệm tuyệt vời trong chuyến
                    du lịch. Vị trí thuận lợi, gần trung tâm nhưng vẫn yên tĩnh. Chắc chắn sẽ quay lại vào lần tới!"
                  </Paragraph>
                  <Title level={5} style={{ color: '#303030', fontSize: 16, marginBottom: 20 }}>
                    Nguyễn Văn A, <span style={{ color: '#7d7d7d', fontWeight: 400 }}>Khách hàng</span>
                  </Title>
                  <img
                    src="https://logo.com/image-cdn/images/kts928pd/production/eb25c68b2f90b321c630fb8f3fcb1962e4c2a7e2-920x920.png?w=1080&q=72"
                    alt="TripAdvisor"
                    style={{ height: 40, opacity: 0.6 }}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>
      {/* ##### Testimonial Area End ##### */}

      {/* ##### Footer/Contact Area Start ##### */}
      <section style={styles.footerSection}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 15px' }}>
          <Row gutter={[60, 40]}>
            {/* Footer Widget - About */}
            <Col xs={24} lg={10}>
              <div style={{ marginTop: 0 }}>
                <Title level={4} style={{ color: '#fff', marginBottom: 30, fontSize: 18 }}>
                  Về Homestay
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.8 }}>
                  Homestay của chúng tôi mang đến không gian nghỉ dưỡng lý tưởng cho những ai muốn tìm kiếm 
                  sự yên bình và thư giãn. Với vị trí thuận tiện và dịch vụ chu đáo, chúng tôi cam kết 
                  mang đến cho bạn trải nghiệm lưu trú tuyệt vời nhất.
                </Paragraph>
                <div style={{ marginTop: 20 }}>
                  <Text style={{ color: '#d4af37', display: 'block', marginBottom: 8 }}>
                    📍 36-37-38 Kiều Mai, Phường Yên Hòa, Quận Cầu Giấy, Hà Nội
                  </Text>
                  <Text style={{ color: '#d4af37', display: 'block', marginBottom: 8 }}>
                    📞 0123-456-789
                  </Text>
                  <Text style={{ color: '#d4af37', display: 'block' }}>
                    ✉️ contact@homestay.com
                  </Text>
                </div>
              </div>
            </Col>

            {/* Footer Widget - Map */}
            <Col xs={24} md={12} lg={8}>
              <div style={{ marginTop: 0 }}>
                <Title level={4} style={{ color: '#fff', marginBottom: 30, fontSize: 18 }}>
                  Vị trí trên bản đồ
                </Title>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.663372345678!2d105.77916631540254!3d21.045950885994414!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454b32ca18ff3%3A0x5b8e3db2a0e23894!2zS2nhu4F1IE1haSwgWcOqbiBIb8OgLCBD4bqndSBHaeG6pXksIEjDoCBO4buZaSwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1702651234567!5m2!1svi!2s"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Vị trí Homestay"
                />
              </div>
            </Col>

            {/* Footer Widget - Newsletter */}
            <Col xs={24} md={12} lg={6}>
              <div style={{ marginTop: 0 }}>
                <Title level={4} style={{ color: '#fff', marginBottom: 30, fontSize: 18 }}>
                  Đăng ký nhận tin
                </Title>
                <input
                  type="email"
                  placeholder="Email của bạn"
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    border: 'none',
                    background: '#2d2d2d',
                    color: '#fff',
                    fontSize: 14,
                    marginBottom: 15,
                  }}
                />
                <button
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    background: '#d4af37',
                    color: '#fff',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    cursor: 'pointer',
                  }}
                >
                  Đăng ký
                </button>
              </div>
            </Col>
          </Row>
        </div>
      </section>
      {/* ##### Footer Area End ##### */}
    </div>
  );
};

export default About;