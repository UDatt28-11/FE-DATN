import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Tag, Button, Input, Modal, message, Breadcrumb, Spin } from 'antd';
import { GiftOutlined, CopyOutlined, CheckCircleOutlined, HomeOutlined, PercentageOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { LoginModal, RegisterModal } from '../../../components/Auth';

import BookingFilter from '../../../components/Booking/BookingFilter';

import { getPublicVouchers, type Voucher } from '../../../service/voucherService';
import { formatVND } from '../../../utils/currency';
import dayjs from '../../../utils/dayjs';

import './Promotions.css';

const { Search } = Input;

const Promotions: React.FC = () => {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState<boolean>(false);


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

    const promotions: Promotion[] = [
        {
            id: 1,
            code: 'SUMMER2025',
            title: 'Giảm Giá Mùa Hè',
            description: 'Giảm 30% cho tất cả các loại phòng trong tháng 6-8',
            discount: '30%',
            validUntil: '31/08/2025',
            minOrder: '2.000.000đ',
            maxDiscount: '1.000.000đ',
            type: 'percent',
            status: 'active',
            image: '/img/bg-img/1.jpg',
            termsAndConditions: [
                'Áp dụng cho đặt phòng từ 2 đêm trở lên',
                'Không áp dụng cho các ngày lễ, Tết',
                'Giảm tối đa 1.000.000đ cho mỗi đơn hàng',
                'Không kết hợp với các chương trình khuyến mãi khác',
                'Áp dụng khi đặt phòng trực tiếp qua website'
            ]
        },
        {
            id: 2,
            code: 'WELCOME50',
            title: 'Ưu Đãi Khách Hàng Mới',
            description: 'Giảm 50% cho lần đặt phòng đầu tiên',
            discount: '50%',
            validUntil: '31/12/2025',
            minOrder: '1.500.000đ',
            maxDiscount: '750.000đ',
            type: 'percent',
            status: 'active',
            image: '/img/bg-img/8.jpg',
            termsAndConditions: [
                'Chỉ áp dụng cho khách hàng đặt phòng lần đầu',
                'Giảm tối đa 750.000đ',
                'Áp dụng cho tất cả các loại phòng',
                'Phải đăng ký tài khoản mới',
                'Mã chỉ sử dụng được 1 lần'
            ]
        },
        {
            id: 3,
            code: 'WEEKEND200',
            title: 'Cuối Tuần Siêu Tiết Kiệm',
            description: 'Giảm 200.000đ cho đặt phòng cuối tuần',
            discount: '200.000đ',
            validUntil: '30/11/2025',
            minOrder: '1.000.000đ',
            maxDiscount: '200.000đ',
            type: 'fixed',
            status: 'active',
            image: '/img/bg-img/9.jpg',
            termsAndConditions: [
                'Áp dụng cho đặt phòng vào thứ 6, 7, Chủ Nhật',
                'Đơn hàng tối thiểu 1.000.000đ',
                'Áp dụng cho tất cả các loại phòng',
                'Có thể kết hợp với ưu đãi khác',
                'Giảm ngay 200.000đ vào tổng hóa đơn'
            ]
        },
        {
            id: 4,
            code: 'LONGSTAY15',
            title: 'Ưu Đãi Lưu Trú Dài Hạn',
            description: 'Giảm 15% khi đặt phòng từ 5 đêm trở lên',
            discount: '15%',
            validUntil: '31/12/2025',
            minOrder: '3.000.000đ',
            maxDiscount: '2.000.000đ',
            type: 'percent',
            status: 'active',
            image: '/img/bg-img/5.jpg',
            termsAndConditions: [
                'Áp dụng cho đặt phòng từ 5 đêm trở lên',
                'Giảm tối đa 2.000.000đ',
                'Áp dụng cho Suite và phòng Deluxe',
                'Thanh toán trước toàn bộ chi phí',
                'Không hoàn tiền khi hủy phòng'
            ]
        },
        {
            id: 5,
            code: 'BIRTHDAY20',
            title: 'Ưu Đãi Sinh Nhật',
            description: 'Giảm 20% + Quà tặng đặc biệt cho khách sinh nhật',
            discount: '20%',
            validUntil: '31/12/2025',
            minOrder: '1.500.000đ',
            maxDiscount: '500.000đ',
            type: 'gift',
            status: 'active',
            image: '/img/bg-img/6.jpg',
            termsAndConditions: [
                'Áp dụng trong tháng sinh nhật',
                'Phải xuất trình CMND/CCCD khi check-in',
                'Tặng kèm bánh sinh nhật và champagne',
                'Giảm 20% tổng hóa đơn phòng',
                'Đăng ký trước 3 ngày'
            ]
        },
        {
            id: 6,
            code: 'COUPLE25',
            title: 'Ưu Đãi Cặp Đôi',
            description: 'Giảm 25% cho phòng Honeymoon Suite',
            discount: '25%',
            validUntil: '14/02/2026',
            minOrder: '2.500.000đ',
            maxDiscount: '1.500.000đ',
            type: 'percent',
            status: 'active',
            image: '/img/bg-img/7.jpg',
            termsAndConditions: [
                'Chỉ áp dụng cho phòng Honeymoon Suite',
                'Trang trí phòng lãng mạn miễn phí',
                'Bữa sáng phục vụ tại phòng',
                'Đặt trước tối thiểu 7 ngày',
                'Áp dụng cho các cặp đôi đang hẹn hò hoặc mới cưới'
            ]
        }
    ];

    // Một vài ảnh nền mặc định cho thẻ khuyến mãi
    const promotionImages = [
        '/img/bg-img/1.jpg',
        '/img/bg-img/5.jpg',
        '/img/bg-img/6.jpg',
        '/img/bg-img/7.jpg',
        '/img/bg-img/8.jpg',
        '/img/bg-img/9.jpg',

    ];

    const getVoucherStatus = (voucher: Voucher): 'active' | 'expired' | 'upcoming' => {
        const now = dayjs();
        const start = voucher.start_date ? dayjs(voucher.start_date) : null;
        const end = voucher.end_date ? dayjs(voucher.end_date) : null;

        if (voucher.is_active === false) {
            return end.isBefore(now, 'day') ? 'expired' : 'upcoming';
        }

        if (start && now.isBefore(start, 'day')) return 'upcoming';
        if (end && now.isAfter(end, 'day')) return 'expired';
        return 'active';
    };

    const formatDiscountLabel = (voucher: Voucher): string => {
        if (voucher.discount_type === 'percentage') {
            return `${voucher.discount_value}%`;
        }
        return formatVND(voucher.discount_value, false);
    };

    const formatValidUntil = (voucher: Voucher): string =>
        voucher.end_date ? dayjs(voucher.end_date).format('DD/MM/YYYY') : 'Không giới hạn';

    const formatMinOrder = (voucher: Voucher): string =>
        voucher.min_order_amount
            ? formatVND(voucher.min_order_amount)
            : 'Không yêu cầu';

    const formatMaxDiscount = (voucher: Voucher): string =>
        voucher.max_discount_amount
            ? formatVND(voucher.max_discount_amount)
            : 'Không giới hạn';

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                setLoading(true);
                // Lấy danh sách voucher public từ backend
                const { vouchers } = await getPublicVouchers({
                    per_page: 20,
                });
                setVouchers(vouchers);
            } catch (error) {
                console.error(error);
                message.error('Không thể tải danh sách voucher. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchPromotions();
    }, []);

    const handleCopyCode = (code: string) => {
        // Kiểm tra đăng nhập trước khi sao chép mã
        if (!isLoggedIn) {
            message.warning('Vui lòng đăng nhập để sử dụng mã giảm giá!');
            setIsLoginModalVisible(true);
            return;
        }

        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        message.success('Đã sao chép mã giảm giá!');
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const showPromotionDetails = (voucher: Voucher) => {
        // Kiểm tra đăng nhập trước khi xem chi tiết
        if (!isLoggedIn) {
            message.warning('Vui lòng đăng nhập để xem chi tiết mã giảm giá!');
            setIsLoginModalVisible(true);
            return;
        }

        setSelectedVoucher(voucher);
        setIsModalVisible(true);
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value.toLowerCase());
    };

    const filteredVouchers = vouchers.filter((voucher) => {
        const title = voucher.name || voucher.description || `Mã giảm giá ${voucher.code}`;
        const search = searchTerm.toLowerCase();
        return (
            title.toLowerCase().includes(search) ||
            voucher.code.toLowerCase().includes(search) ||
            (voucher.description || '').toLowerCase().includes(search)
        );
    });

    const getStatusTag = (status: 'active' | 'expired' | 'upcoming') => {
        switch (status) {
            case 'active':
                return <Tag color="success">Đang áp dụng</Tag>;
            case 'expired':
                return <Tag color="error">Đã hết hạn</Tag>;
            case 'upcoming':
                return <Tag color="warning">Sắp diễn ra</Tag>;
            default:
                return null;
        }
    };

    const getTypeIcon = (voucher: Voucher) => {
        switch (voucher.discount_type) {
            case 'percentage':
                return <PercentageOutlined style={{ fontSize: '24px', color: '#cb8670' }} />;
            case 'fixed_amount':
                return <GiftOutlined style={{ fontSize: '24px', color: '#cb8670' }} />;
            default:
                return null;
        }
    };

    return (
        <div className="promotions-page" style={{ }}>
            {/* Hero Section */}
            <section style={{
                position: 'relative',
                height: 450,
                backgroundImage: "url('/img/bg-img/16.jpg')",
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
                    <h1 style={{ 
                        color: '#fff', 
                        fontSize: 52, 
                        fontWeight: 400,
                        marginBottom: 20,
                    }}>
                        Mã Giảm Giá
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 25 }}>
                        Khám phá các ưu đãi hấp dẫn dành riêng cho bạn
                    </p>
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
                                title: <span style={{ color: '#fff', fontSize: 15 }}>Khuyến mại</span>,
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

            {/* Promotions Content */}
            <section style={{ padding: '100px 0', backgroundColor: '#f8f9fa' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
                    {/* Section Header */}
                    <Row justify="center" style={{ marginBottom: '50px' }}>
                        <Col xs={24} md={18} lg={16}>
                            <div style={{ textAlign: 'center' }} data-aos="fade-up">
                                <div
                                    style={{
                                        width: '60px',
                                        height: '3px',
                                        background: '#cb8670',
                                        margin: '0 auto 20px',
                                    }}
                                ></div>
                                <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
                                    Ưu Đãi Đặc Biệt
                                </h2>
                                <p style={{ fontSize: '16px', color: '#6c757d', marginBottom: '30px' }}>
                                    Khám phá các chương trình khuyến mãi hấp dẫn và tiết kiệm chi phí khi đặt phòng tại khách sạn của chúng tôi
                                </p>
                                <Search
                                    className="promotions-search"
                                    placeholder="Tìm kiếm mã giảm giá..."
                                    allowClear
                                    enterButton="Tìm kiếm"
                                    size="large"
                                    onSearch={handleSearch}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    style={{ maxWidth: '700px', width: '100%' }}
                                />
                            </div>
                        </Col>
                    </Row>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <Spin size="large" />
                        </div>
                    ) : (
                        <>
                            {/* Vouchers Grid */}
                            <Row gutter={[30, 30]}>
                        {filteredVouchers.map((voucher, index) => {
                            const status = getVoucherStatus(voucher);
                            const title = voucher.name || voucher.description || `Mã giảm giá ${voucher.code}`;
                            const image = promotionImages[index % promotionImages.length];

                            return (
                            <Col xs={24} md={12} lg={8} key={voucher.id} data-aos="fade-up" data-aos-delay={index * 100}>
                                <Card
                                    hoverable
                                    className="promotion-card"
                                    cover={
                                        <div style={{ position: 'relative', overflow: 'hidden', height: '200px' }}>
                                            <img
                                                alt={title}
                                                src={image}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '15px',
                                                    right: '15px',
                                                }}
                                            >
                                                {getStatusTag(status)}
                                            </div>
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '15px',
                                                    left: '15px',
                                                    background: '#cb8670',
                                                    color: '#fff',
                                                    padding: '10px 20px',
                                                    borderRadius: '8px',
                                                    fontSize: '24px',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {formatDiscountLabel(voucher)}
                                            </div>
                                        </div>
                                    }
                                    style={{
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                    styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}
                                >
                                    <div style={{ marginBottom: '15px' }}>
                                        {getTypeIcon(voucher)}
                                    </div>
                                    <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#2a2a2a' }}>
                                        {title}
                                    </h3>
                                    <p style={{ color: '#6c757d', marginBottom: '15px', flex: 1 }}>
                                        {voucher.description}
                                    </p>
                                    <div
                                        style={{
                                            padding: '15px',
                                            background: '#f8f9fa',
                                            borderRadius: '8px',
                                            marginBottom: '15px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>
                                                Mã giảm giá
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: '18px',
                                                    fontWeight: 'bold',
                                                    color: '#cb8670',
                                                    letterSpacing: '2px',
                                                }}
                                            >
                                                {voucher.code}
                                            </div>
                                        </div>
                                        <Button
                                            icon={copiedCode === voucher.code ? <CheckCircleOutlined /> : <CopyOutlined />}
                                            onClick={() => handleCopyCode(voucher.code)}
                                            type={copiedCode === voucher.code ? 'primary' : 'default'}
                                            style={{
                                                backgroundColor: copiedCode === voucher.code ? '#52c41a' : undefined,
                                                borderColor: copiedCode === voucher.code ? '#52c41a' : undefined,
                                            }}
                                        >
                                            {copiedCode === voucher.code ? 'Đã sao chép' : (isLoggedIn ? 'Sao chép' : 'Đăng nhập')}
                                        </Button>
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '15px' }}>
                                        <div>Hạn sử dụng: <strong>{formatValidUntil(voucher)}</strong></div>
                                        <div>Đơn tối thiểu: <strong>{formatMinOrder(voucher)}</strong></div>
                                        {!isLoggedIn && (
                                            <div style={{
                                                marginTop: '10px',
                                                padding: '8px 12px',
                                                background: '#fff3e0',
                                                borderRadius: '6px',
                                                border: '1px solid #ffa726',
                                                fontSize: '13px',
                                                color: '#e65100',
                                                textAlign: 'center'
                                            }}>
                                                🔒 Đăng nhập để sử dụng mã này
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        type="primary"
                                        block
                                        onClick={() => showPromotionDetails(voucher)}
                                        style={{
                                            backgroundColor: '#cb8670',
                                            borderColor: '#cb8670',
                                            height: '45px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        Xem Chi Tiết
                                    </Button>
                                </Card>
                            </Col>
                            );
                        })}
                    </Row>

                    {!loading && filteredVouchers.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '50px 0' }}>
                            <GiftOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '20px' }} />
                            <h3 style={{ color: '#6c757d' }}>Không tìm thấy mã giảm giá phù hợp</h3>
                            <p style={{ color: '#999' }}>Vui lòng thử từ khóa khác</p>
                        </div>
                    )}
                        </>
                    )}
                </div>
            </section>

            {/* Promotion Details Modal */}
            <Modal
                title={
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#cb8670' }}>
                        {selectedVoucher?.name || selectedVoucher?.code}
                    </div>
                }
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalVisible(false)}>
                        Đóng
                    </Button>,
                    <Button
                        key="copy"
                        type="primary"
                        icon={<CopyOutlined />}
                        onClick={() => selectedVoucher && handleCopyCode(selectedVoucher.code)}
                        style={{ backgroundColor: '#cb8670', borderColor: '#cb8670' }}
                    >
                        Sao Chép Mã
                    </Button>,
                ]}
                width={700}
            >
                {selectedVoucher && (
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <img
                                src={promotionImages[0]}
                                alt={selectedVoucher.name || selectedVoucher.code}
                                style={{ width: '100%', borderRadius: '8px', marginBottom: '15px' }}
                            />
                            <div
                                style={{
                                    padding: '20px',
                                    background: '#f8f9fa',
                                    borderRadius: '8px',
                                    marginBottom: '20px',
                                }}
                            >
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <div style={{ fontSize: '14px', color: '#6c757d' }}>Mã giảm giá</div>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#cb8670' }}>
                                            {selectedVoucher.code}
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div style={{ fontSize: '14px', color: '#6c757d' }}>Giảm giá</div>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                                            {formatDiscountLabel(selectedVoucher)}
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div style={{ fontSize: '14px', color: '#6c757d' }}>Đơn tối thiểu</div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                            {formatMinOrder(selectedVoucher)}
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div style={{ fontSize: '14px', color: '#6c757d' }}>Giảm tối đa</div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                            {formatMaxDiscount(selectedVoucher)}
                                        </div>
                                    </Col>
                                    <Col span={24}>
                                        <div style={{ fontSize: '14px', color: '#6c757d' }}>Hạn sử dụng</div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                            {formatValidUntil(selectedVoucher)}
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '18px', marginBottom: '15px', color: '#2a2a2a' }}>
                                Chi tiết khuyến mãi:
                            </h4>
                            <p style={{ color: '#6c757d', lineHeight: 1.6 }}>
                                {selectedVoucher.description || 'Vui lòng liên hệ khách sạn để biết thêm chi tiết điều kiện áp dụng.'}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal đăng nhập/đăng ký */}
            <LoginModal
                visible={isLoginModalVisible}
                onClose={() => setIsLoginModalVisible(false)}
                onSwitchToRegister={() => {
                    setIsLoginModalVisible(false);
                    setIsRegisterModalVisible(true);
                }}
            />
            <RegisterModal
                visible={isRegisterModalVisible}
                onClose={() => setIsRegisterModalVisible(false)}
                onSwitchToLogin={() => {
                    setIsRegisterModalVisible(false);
                    setIsLoginModalVisible(true);
                }}
            />
        </div>
    );
};

export default Promotions;
