import React from 'react';
import { Row, Col } from 'antd';
import { 
  HomeOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  DollarOutlined, 
  WarningOutlined, 
  SafetyOutlined, 
  CarOutlined, 
  ToolOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import './HomestayPolicyPage.css';

const HomestayPolicyPage: React.FC = () => {
  const policies = [
    {
      id: 1,
      icon: <HomeOutlined />,
      title: 'Chính sách đặt phòng',
      items: [
        'Khách vui lòng thanh toán hết khi giá trị hóa đơn dưới 1 triệu',
        'Khách có thể cọc 50% hoặc thanh toán hết khi giá trị hóa đơn trên 1 triệu',
        'Đơn đặt phòng chỉ được xác nhận sau khi homestay nhận được tiền cọc.',
        'Giá phòng có thể thay đổi tùy theo mùa, cuối tuần hoặc ngày lễ.',
        'Khách vui lòng cung cấp thông tin đầy đủ: họ tên, số điện thoại, số lượng khách, ngày ở – ngày đi.',
      ],
    },
    {
      id: 2,
      icon: <CalendarOutlined />,
      title: 'Chính sách hủy phòng / thay đổi ngày',
      items: [
        'Hủy trước 7 ngày: hoàn lại 100% tiền cọc.',
        'Hủy trong vòng 3–6 ngày: hoàn lại 50% tiền cọc.',
        'Hủy trong vòng 0–2 ngày hoặc không đến: mất 100% tiền cọc.',
        'Khách có thể đổi ngày 1 lần miễn phí (tùy tình trạng phòng trống).',
      ],
    },
    {
      id: 3,
      icon: <ClockCircleOutlined />,
      title: 'Thời gian check-in / check-out',
      items: [
        'Check-in: từ 14:00 trở đi.',
        'Check-out: trước 11:00.',
        'Check-in sớm hoặc check-out trễ sẽ phụ thu từ 50.000 – 200.000đ tùy thời điểm và tình trạng phòng.',
      ],
    },
    {
      id: 4,
      icon: <UserOutlined />,
      title: 'Số lượng khách',
      items: [
        'Mỗi phòng có giới hạn số khách tối đa, tùy theo tiêu chuẩn phòng.',
        'Thêm người ở phụ thu 100.000 – 150.000đ/người/đêm (tùy phòng).',
        'Trẻ em dưới 6 tuổi được miễn phí nếu ngủ chung với bố mẹ.',
        'Trẻ em từ 6–12 tuổi phụ thu 50% giá người lớn.',
      ],
    },
    {
      id: 5,
      icon: <DollarOutlined />,
      title: 'Chính sách phụ thu',
      items: [
        'Thêm người: theo mục 4.',
        'Sử dụng bếp BBQ: 50.000 – 150.000đ/lần tùy khu vực.',
        'Đốt lửa trại (nếu có): 100.000 – 300.000đ/buổi.',
      ],
    },
    {
      id: 7,
      icon: <WarningOutlined />,
      title: 'Nội quy sử dụng phòng',
      items: [
        'Không mang theo thú cưng',
        'Tắt đèn, điều hòa, quạt và khóa cửa khi ra khỏi phòng.',
        'Không di chuyển đồ nội thất sang vị trí khác khi chưa hỏi chủ nhà.',
        'Không nấu ăn trong phòng (nếu khu vực phòng thuộc loại không cho phép nấu).',
      ],
    },
    {
      id: 8,
      icon: <SafetyOutlined />,
      title: 'Nội quy chung',
      items: [
        'Hạn chế gây ồn sau 22:00 để tránh ảnh hưởng các phòng khác.',
        'Giữ gìn vệ sinh khu vực chung.',
        'Tuyệt đối không mang chất cấm, chất dễ cháy nổ hoặc vũ khí vào homestay.',
        'Không tổ chức tiệc tùng vượt quá số lượng khách quy định nếu không thông báo trước.',
      ],
    },
    {
      id: 9,
      icon: <ToolOutlined />,
      title: 'Trách nhiệm & bồi thường thiệt hại',
      items: [
        'Khách chịu trách nhiệm đối với mọi hư hỏng do mình gây ra.',
        'Phí bồi thường tính theo giá trị sửa chữa hoặc thay mới của vật dụng.',
        'Homestay không chịu trách nhiệm với tài sản cá nhân thất lạc mà khách không gửi giữ.',
      ],
    },
    {
      id: 10,
      icon: <CarOutlined />,
      title: 'Bãi đỗ xe',
      items: [
        'Có bãi đỗ xe máy miễn phí.',
        'Khách tự chịu trách nhiệm khóa xe và bảo vệ tài sản cá nhân.',
      ],
    },
  ];

  return (
    <div className="policy-wrapper">
      <Helmet>
        <title>Chính sách và nội quy Homestay - BookStay</title>
        <meta 
          name="description" 
          content="Tìm hiểu về các chính sách đặt phòng, hủy phòng, check-in/check-out, và nội quy sử dụng tại homestay của chúng tôi." 
        />
      </Helmet>

      {/* Hero Area */}
      <section className="hero-area">
        <div className="single-hero-slide d-flex align-items-center justify-content-center">
          <div
            className="slide-img bg-img"
            style={{ backgroundImage: 'url(/img/bg-img/bg-1.jpg)' }}
          ></div>
          <div className="container">
            <Row justify="center">
              <Col xs={24} lg={18}>
                <div className="hero-slides-content" data-aos="fadeInUp" data-delay="100ms">
                  <div className="line" data-aos="fadeInUp" data-delay="300ms"></div>
                  <h2 data-aos="fadeInUp" data-delay="500ms">🏡 CHÍNH SÁCH VÀ NỘI QUY HOMESTAY</h2>
                  <p data-aos="fadeInUp" data-delay="700ms">Quy định và hướng dẫn sử dụng dịch vụ</p>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </section>

      {/* Policies Area */}
      <section className="policies-area section-padding-100">
        <div className="container">
          <Row justify="center">
            <Col xs={24} lg={12}>
              <div className="section-heading text-center" data-aos="fade-up">
                <div className="line-"></div>
                <h2>Chính Sách & Nội Quy</h2>
                <p>Vui lòng đọc kỹ các quy định và chính sách trước khi đặt phòng để có trải nghiệm tốt nhất.</p>
              </div>
            </Col>
          </Row>

          <Row gutter={[30, 30]}>
            {policies.map((policy, index) => (
              <Col xs={24} md={12} lg={8} key={policy.id}>
                <div 
                  className="single-policy-card"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="policy-icon">
                    {policy.icon}
                  </div>
                  <div className="policy-content">
                    <h4>{policy.id}. {policy.title}</h4>
                    <ul className="policy-items">
                      {policy.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <CheckCircleOutlined className="check-icon" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Important Notes Area */}
      <section className="important-notes-area section-padding-100">
        <div className="container">
          <Row justify="center">
            <Col xs={24} lg={12}>
              <div className="section-heading text-center" data-aos="fade-up">
                <div className="line-"></div>
                <h2>Lưu Ý Quan Trọng</h2>
              </div>
            </Col>
          </Row>

          <Row gutter={[30, 20]} justify="center">
            <Col xs={24} md={12} lg={10}>
              <div className="note-item" data-aos="fade-up" data-aos-delay="100">
                <CheckCircleOutlined className="note-icon" />
                <p>Vui lòng đọc kỹ các chính sách trước khi đặt phòng để tránh hiểu lầm.</p>
              </div>
            </Col>
            <Col xs={24} md={12} lg={10}>
              <div className="note-item" data-aos="fade-up" data-aos-delay="200">
                <CheckCircleOutlined className="note-icon" />
                <p>Mọi thắc mắc về chính sách, vui lòng liên hệ với chúng tôi qua hotline hoặc email.</p>
              </div>
            </Col>
            <Col xs={24} md={12} lg={10}>
              <div className="note-item" data-aos="fade-up" data-aos-delay="300">
                <CheckCircleOutlined className="note-icon" />
                <p>Chúng tôi có quyền từ chối phục vụ nếu khách vi phạm nghiêm trọng nội quy.</p>
              </div>
            </Col>
            <Col xs={24} md={12} lg={10}>
              <div className="note-item" data-aos="fade-up" data-aos-delay="400">
                <CheckCircleOutlined className="note-icon" />
                <p>Các chính sách có thể được cập nhật, vui lòng kiểm tra lại trước mỗi lần đặt phòng.</p>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Contact Support Area */}
      <section className="contact-support-area section-padding-100 bg-img bg-fixed" style={{ backgroundImage: 'url(/img/bg-img/4.png)' }}>
        <div className="container">
          <Row justify="end">
            <Col xs={24} lg={14}>
              <div className="support-content text-center" data-aos="fade-up" data-aos-delay="300">
                <div className="section-heading text-center white">
                  <div className="line-"></div>
                  <h2>Cần Hỗ Trợ Thêm?</h2>
                  <p>Nếu bạn có bất kỳ câu hỏi nào về chính sách và nội quy, đừng ngần ngại liên hệ với chúng tôi. Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>
                </div>

                <div className="support-info">
                  <div className="support-item">
                    <h4>📞 Hotline</h4>
                    <p>1900-xxxx</p>
                  </div>
                  <div className="support-item">
                    <h4>✉️ Email</h4>
                    <p>support@bookstay.com</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default HomestayPolicyPage;
