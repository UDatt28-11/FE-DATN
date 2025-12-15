import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Tag, Button, Input, Modal, message, Breadcrumb, Spin } from 'antd';
import { GiftOutlined, CopyOutlined, CheckCircleOutlined, HomeOutlined, PercentageOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { LoginModal, RegisterModal } from '../../../components/Auth';
import { getPublicVouchers, type Voucher } from '../../../service/voucherService';
import { formatVND } from '../../../utils/currency';
import dayjs from '../../../utils/dayjs';
import './Promotions.css';

const { Search } = Input;

const Promotions: React.FC = () => {
    const { isLoggedIn } = useAuth();
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

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
        <div className="promotions-page">
            {/* Breadcrumb Section */}
            <section
                className="breadcrumb-area"
                style={{
                    backgroundImage: "url('/img/bg-img/18.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    padding: '100px 0',
                    position: 'relative',
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
                        zIndex: 0,
                    }}
                />
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <Row justify="center">
                        <Col xs={24}>
                            <div style={{ textAlign: 'center', color: '#fff' }}>
                                <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: '#fff' }} data-aos="fade-up">
                                    Mã Giảm Giá
                                </h1>
                                <Breadcrumb
                                    data-aos="fade-up"
                                    data-aos-delay="200"
                                    style={{ justifyContent: 'center', display: 'flex' }}
                                    items={[
                                        {
                                            title: (
                                                <Link to="/" style={{ color: '#cb8670' }}>
                                                    <HomeOutlined /> Trang chủ
                                                </Link>
                                            ),
                                        },
                                        {
                                            title: <span style={{ color: '#fff' }}>Mã giảm giá</span>,
                                        },
                                    ]}
                                />
                            </div>
                        </Col>
                    </Row>
                </div>
            </section>

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
                                    placeholder="Tìm kiếm mã giảm giá..."
                                    allowClear
                                    enterButton="Tìm kiếm"
                                    size="large"
                                    onSearch={handleSearch}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    style={{ maxWidth: '500px' }}
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
                                    bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
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
