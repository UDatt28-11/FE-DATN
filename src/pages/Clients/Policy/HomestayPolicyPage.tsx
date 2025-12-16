import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, Card, Divider, Row, Col, Breadcrumb } from 'antd';
import { 
  HomeOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined, 
  UsergroupAddOutlined,
  DollarOutlined,
  SafetyOutlined,
  WarningOutlined,
  CarOutlined,
  CheckCircleOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import BookingFilter from '@/components/Booking/BookingFilter';
import './HomestayPolicyPage.css';
const { Title, Paragraph, Text } = Typography;

const HomestayPolicyPage: React.FC = () => {
  const navigate = useNavigate();

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

  const policies = [
    {
      id: 1,
      title: 'Chính sách đặt phòng',
      icon: <HomeOutlined />,
      color: '#cb8670',
      items: [
        'Khách vui lòng thanh toán hết khi giá trị hóa đơn dưới 1 triệu',
        'Khách có thể cọc 50% hoặc thanh toán hết khi giá trị hóa đơn trên 1 triệu',
        'Đơn đặt phòng chỉ được xác nhận sau khi homestay nhận được tiền cọc.',
        'Giá phòng có thể thay đổi tùy theo mùa, cuối tuần hoặc ngày lễ.',
        'Khách vui lòng cung cấp thông tin đầy đủ: họ tên, số điện thoại, số lượng khách, ngày ở – ngày đi.'
      ]
    },
    {
      id: 2,
      title: 'Chính sách hủy phòng / thay đổi ngày',
      icon: <CalendarOutlined />,
      color: '#d89070',
      items: [
        'Hủy trước 7 ngày: hoàn lại 100% tiền cọc.',
        'Hủy trong vòng 3–6 ngày: hoàn lại 50% tiền cọc.',
        'Hủy trong vòng 0–2 ngày hoặc không đến: mất 100% tiền cọc.',
        'Khách có thể đổi ngày 1 lần miễn phí (tùy tình trạng phòng trống).'
      ]
    },
    {
      id: 3,
      title: 'Thời gian check-in / check-out',
      icon: <ClockCircleOutlined />,
      color: '#e8a882',
      items: [
        'Check-in: từ 14:00 trở đi.',
        'Check-out: trước 11:00.',
        'Check-in sớm hoặc check-out trễ sẽ phụ thu từ 50.000 – 200.000đ tùy thời điểm và tình trạng phòng.'
      ]
    },
    {
      id: 4,
      title: 'Số lượng khách',
      icon: <UsergroupAddOutlined />,
      color: '#b8755a',
      items: [
        'Mỗi phòng có giới hạn số khách tối đa, tùy theo tiêu chuẩn phòng.',
        'Thêm người ở phụ thu 100.000 – 150.000đ/người/đêm (tùy phòng).',
        'Trẻ em dưới 6 tuổi được miễn phí nếu ngủ chung với bố mẹ.',
        'Trẻ em từ 6–12 tuổi phụ thu 50% giá người lớn.'
      ]
    },
    {
      id: 5,
      title: 'Chính sách phụ thu',
      icon: <DollarOutlined />,
      color: '#cb8670',
      items: [
        'Thêm người: theo mục 4.',
        'Sử dụng bếp BBQ: 50.000 – 150.000đ/lần tùy khu vực.',
        'Đốt lửa trại (nếu có): 100.000 – 300.000đ/buổi.',
        'Mang thú cưng (nếu homestay cho phép): 50.000 – 100.000đ/con/đêm.'
      ]
    },
    
    {
      id: 6,
      title: 'Nội quy sử dụng phòng',
      icon: <WarningOutlined />,
      color: '#a5634a',
      items: [
        'Không hút thuốc trong phòng — nếu vi phạm sẽ phụ thu 300.000đ để khử mùi.',
        'Không mang đồ ăn nặng mùi vào phòng.',
        'Không mang theo thú cưng',
        'Tắt đèn, điều hòa, quạt và khóa cửa khi ra khỏi phòng.',
        'Không di chuyển đồ nội thất sang vị trí khác khi chưa hỏi chủ nhà.',
        'Không nấu ăn trong phòng (nếu khu vực phòng thuộc loại không cho phép nấu).'
      ]
    },
    {
      id: 7,
      title: 'Nội quy chung',
      icon: <CheckCircleOutlined />,
      color: '#cb8670',
      items: [
        'Hạn chế gây ồn sau 22:00 để tránh ảnh hưởng các phòng khác.',
        'Giữ gìn vệ sinh khu vực chung.',
        'Tuyệt đối không mang chất cấm, chất dễ cháy nổ hoặc vũ khí vào homestay.',
        'Không tổ chức tiệc tùng vượt quá số lượng khách quy định nếu không thông báo trước.'
      ]
    },
    {
      id: 8,
      title: 'Trách nhiệm & bồi thường thiệt hại',
      icon: <SafetyOutlined />,
      color: '#b8755a',
      items: [
        'Khách chịu trách nhiệm đối với mọi hư hỏng do mình gây ra.',
        'Phí bồi thường tính theo giá trị sửa chữa hoặc thay mới của vật dụng.',
        'Homestay không chịu trách nhiệm với tài sản cá nhân thất lạc mà khách không gửi giữ.'
      ]
    },
    {
      id: 9,
      title: 'Dọn phòng & tiện ích',
      icon: <HomeOutlined />,
      color: '#d89070',
      items: [
        'Homestay dọn phòng theo lịch cố định hoặc theo yêu cầu.',
        'Thay khăn, thay ga theo yêu cầu có thể phụ thu 20.000 – 50.000đ.',
        'Giờ sử dụng các tiện ích chung (bếp chung, hồ bơi, sân BBQ) sẽ được thông báo cụ thể khi check-in.'
      ]
    },
    {
      id: 10,
      title: 'Bãi đỗ xe',
      icon: <CarOutlined />,
      color: '#e8a882',
      items: [
        'Có bãi đỗ xe máy miễn phí.',
       
        'Khách tự chịu trách nhiệm khóa xe và bảo vệ tài sản cá nhân.'
      ]
    }
  ];

  return (
    <div style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        height: 450,
        backgroundImage: "url('/img/bg-img/20.jpg')",
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
            Chính Sách & Nội Quy
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 25 }}>
            Quy định và hướng dẫn để có trải nghiệm tốt nhất tại BookStay
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
                title: <span style={{ color: '#fff', fontSize: 15 }}>Chính Sách</span>,
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

      {/* Policies Content Section */}
      <div style={{ 
        padding: '100px 50px', 
        background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Section Heading */}
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
              fontFamily: '"Playfair Display", Georgia, serif',
              color: '#1a1a1a',
              letterSpacing: '-0.5px',
            }}>
              Quy Định Và Điều Khoản
            </Title>
            <Paragraph style={{ 
              color: '#6c757d', 
              fontSize: 17, 
              maxWidth: 700, 
              margin: '0 auto',
              lineHeight: 1.7,
            }}>
              Vui lòng đọc kỹ các chính sách và nội quy dưới đây để đảm bảo trải nghiệm lưu trú tốt nhất
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {policies.map((policy, index) => (
              <Col xs={24} md={12} key={policy.id}>
                <Card
                  className="policy-card"
                  hoverable
                  style={{
                    borderTop: `4px solid ${policy.color}`,
                    borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    height: '100%',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid #e8e8e8',
                  }}
                  styles={{ body: { padding: '28px' } }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(203, 134, 112, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(203, 134, 112, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderColor = '#e8e8e8';
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 16,
                    marginBottom: 20,
                  }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${policy.color}15, ${policy.color}25)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 26,
                      color: policy.color,
                      flexShrink: 0,
                    }}>
                      {policy.icon}
                    </div>
                    <Title level={4} style={{ 
                      margin: 0,
                      fontSize: 20,
                      fontWeight: 600,
                      color: '#1a1a1a',
                      fontFamily: '"Playfair Display", Georgia, serif',
                    }}>
                      {policy.id}. {policy.title}
                    </Title>
                  </div>
                  <Divider style={{ margin: '20px 0', borderColor: '#e8e8e8' }} />
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                  }}>
                    {policy.items.map((item, idx) => (
                      <li key={idx} style={{
                        marginBottom: 14,
                        paddingLeft: 28,
                        position: 'relative',
                        fontSize: 14,
                        lineHeight: 1.7,
                        color: '#5a5a5a',
                      }}>
                        <span style={{
                          position: 'absolute',
                          left: 0,
                          top: 8,
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: policy.color,
                        }} />
                        <Text style={{ fontSize: 14, lineHeight: 1.7 }}>{item}</Text>
                      </li>
                    ))}
                  </ul>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Footer Note */}
      <div style={{ padding: '0 50px 80px', background: 'transparent' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Card 
            style={{ 
              borderRadius: 16,
              background: 'linear-gradient(135deg, #cb8670 0%, #b87560 100%)', 
              border: 'none',
              boxShadow: '0 8px 30px rgba(203, 134, 112, 0.25)',
            }}
            styles={{ body: { padding: '40px' } }}
          >
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: 24,
              }}>
                <PhoneOutlined style={{ fontSize: 24, color: 'white', transform: 'rotate(90deg)' }} />
              </div>
              <Title level={3} style={{ 
                color: 'white', 
                marginBottom: 16,
                fontFamily: '"Playfair Display", Georgia, serif',
              }}>
                Cần Hỗ Trợ Thêm?
              </Title>
              <Paragraph style={{ 
                color: 'rgba(255,255,255,0.95)', 
                fontSize: 16, 
                margin: 0,
                lineHeight: 1.8,
              }}>
                Nếu bạn có bất kỳ thắc mắc nào về chính sách, vui lòng liên hệ với chúng tôi qua{' '}
                <Link to="/contact" style={{ 
                  color: '#fff', 
                  fontWeight: 700, 
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}>
                  trang liên hệ
                </Link>
                {' '}hoặc hotline để được hỗ trợ tốt nhất.
              </Paragraph>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomestayPolicyPage;