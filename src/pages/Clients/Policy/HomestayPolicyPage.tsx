import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Card, Divider, Row, Col } from 'antd';
import { 
  HomeOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined, 
  UsergroupAddOutlined,
  DollarOutlined,
  SafetyOutlined,
  WarningOutlined,
  CarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import './HomestayPolicyPage.css';
const { Title, Paragraph, Text } = Typography;

const HomestayPolicyPage: React.FC = () => {
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
    <div>
      {/* Breadcrumb Section */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          height: '400px',
          backgroundImage: "url('/img/bg-img/19.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 70,
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
          <Title level={1} style={{ color: '#fff', fontSize: '3rem', marginBottom: '1rem' }}>
            🏡 CHÍNH SÁCH VÀ NỘI QUY HOMESTAY
          </Title>
        </div>
      </section>

      {/* Policies Content Section */}
      <div style={{ padding: '100px 50px', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[32, 32]}>
            {policies.map((policy) => (
              <Col xs={24} md={12} key={policy.id}>
                <Card
                  className="policy-card"
                  hoverable
                  style={{
                    borderTop: `4px solid ${policy.color}`,
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    height: '100%',
                  }}
                >
                  <div className="policy-card-header">
                    <div 
                      className="policy-icon"
                      style={{ color: policy.color }}
                    >
                      {policy.icon}
                    </div>
                    <Title level={3} className="policy-card-title">
                      {policy.id}. {policy.title}
                    </Title>
                  </div>
                  <Divider style={{ margin: '16px 0' }} />
                  <ul className="policy-list">
                    {policy.items.map((item, index) => (
                      <li key={index} className="policy-item">
                        <Text>{item}</Text>
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
      <div style={{ padding: '0 50px 80px', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Card 
            style={{ 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #cb8670 0%, #d89070 100%)', 
              border: 'none' 
            }}
          >
            <div style={{ textAlign: 'center', color: 'white' }}>
              <Title level={4} style={{ color: 'white', marginBottom: '16px' }}>
                📞 Liên hệ hỗ trợ
              </Title>
              <Paragraph style={{ color: 'white', fontSize: '16px', margin: 0 }}>
                Nếu bạn có bất kỳ thắc mắc nào về chính sách, vui lòng liên hệ với chúng tôi qua{' '}
                <Link to="/contact" style={{ color: '#fff', fontWeight: 'bold', textDecoration: 'underline' }}>
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