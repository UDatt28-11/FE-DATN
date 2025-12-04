import React, { useState, useEffect } from 'react';
import {
    Card,
    Tabs,
    Tag,
    Button,
    Space,
    Typography,
    Empty,
    Spin,
    Input,
    Modal,
    message,
    Badge,
    Row,
    Col,
    Divider,
    Alert,
} from 'antd';
import {
    GiftOutlined,
    TagOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    PercentageOutlined,
    DollarOutlined,
    PlusOutlined,
    CopyOutlined,
    CalendarOutlined,
    ShoppingOutlined,
} from '@ant-design/icons';
import {
    getUserVouchers,
    getAvailableVouchers,
    getVoucherCounts,
    claimVoucher,
    type Voucher,
    type VoucherCounts,
} from '../../../service/voucherService';
import { formatVND } from '../../../utils/currency';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const MyVouchersPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [claimLoading, setClaimLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('unused');
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
    const [counts, setCounts] = useState<VoucherCounts>({ unused: 0, used: 0, expired: 0, total: 0 });
    
    // Claim voucher modal
    const [claimModalVisible, setClaimModalVisible] = useState(false);
    const [claimCode, setClaimCode] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch counts
            const countsData = await getVoucherCounts();
            setCounts(countsData);

            // Fetch vouchers based on active tab
            if (activeTab === 'available') {
                const { vouchers } = await getAvailableVouchers({ per_page: 50 });
                setAvailableVouchers(vouchers);
            } else {
                const status = activeTab === 'all' ? 'all' : activeTab as 'unused' | 'used';
                const { vouchers } = await getUserVouchers({ status, per_page: 50 });
                setVouchers(vouchers);
            }
        } catch (error) {
            console.error('Error fetching vouchers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClaimVoucher = async () => {
        if (!claimCode.trim()) {
            message.warning('Vui lòng nhập mã voucher');
            return;
        }

        setClaimLoading(true);
        try {
            const result = await claimVoucher(claimCode.trim());
            message.success(result.message);
            setClaimModalVisible(false);
            setClaimCode('');
            fetchData();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể lưu mã voucher');
        } finally {
            setClaimLoading(false);
        }
    };

    const handleClaimFromList = async (voucher: Voucher) => {
        try {
            const result = await claimVoucher(voucher.code);
            message.success(result.message);
            fetchData();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể lưu mã voucher');
        }
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        message.success('Đã sao chép mã: ' + code);
    };

    const renderVoucherCard = (voucher: Voucher, isAvailable: boolean = false) => {
        const isExpired = voucher.end_date && dayjs(voucher.end_date).isBefore(dayjs());
        const isUsed = !!voucher.used_at;

        return (
            <Card
                key={voucher.id}
                className="voucher-card"
                style={{
                    marginBottom: 16,
                    borderLeft: `4px solid ${isUsed ? '#d9d9d9' : isExpired ? '#ff4d4f' : '#52c41a'}`,
                    opacity: isUsed || isExpired ? 0.7 : 1,
                }}
            >
                <Row gutter={16} align="middle">
                    <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
                        <div style={{
                            background: voucher.discount_type === 'percentage' 
                                ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)'
                                : 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                            borderRadius: 12,
                            padding: '20px 16px',
                            color: '#fff',
                        }}>
                            {voucher.discount_type === 'percentage' ? (
                                <>
                                    <PercentageOutlined style={{ fontSize: 24 }} />
                                    <div style={{ fontSize: 28, fontWeight: 'bold' }}>
                                        {voucher.discount_value}%
                                    </div>
                                </>
                            ) : (
                                <>
                                    <DollarOutlined style={{ fontSize: 24 }} />
                                    <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                                        {formatVND(voucher.discount_value)}
                                    </div>
                                </>
                            )}
                        </div>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                            <Space>
                                <Text strong style={{ fontSize: 16 }}>
                                    {voucher.name || voucher.code}
                                </Text>
                                {isUsed && <Tag color="default">Đã sử dụng</Tag>}
                                {!isUsed && isExpired && <Tag color="error">Hết hạn</Tag>}
                                {!isUsed && !isExpired && voucher.can_use && <Tag color="success">Có thể dùng</Tag>}
                            </Space>
                            
                            {voucher.description && (
                                <Paragraph type="secondary" style={{ margin: 0 }} ellipsis={{ rows: 2 }}>
                                    {voucher.description}
                                </Paragraph>
                            )}

                            <Space wrap size={[8, 4]}>
                                <Tag icon={<TagOutlined />} color="blue">
                                    {voucher.code}
                                    <CopyOutlined 
                                        style={{ marginLeft: 4, cursor: 'pointer' }} 
                                        onClick={() => copyToClipboard(voucher.code)}
                                    />
                                </Tag>

                                {voucher.min_order_amount > 0 && (
                                    <Tag icon={<ShoppingOutlined />}>
                                        Đơn tối thiểu {formatVND(voucher.min_order_amount)}
                                    </Tag>
                                )}

                                {voucher.max_discount_amount && (
                                    <Tag>Giảm tối đa {formatVND(voucher.max_discount_amount)}</Tag>
                                )}
                            </Space>

                            {voucher.end_date && (
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    <CalendarOutlined style={{ marginRight: 4 }} />
                                    HSD: {dayjs(voucher.end_date).format('DD/MM/YYYY HH:mm')}
                                </Text>
                            )}

                            {voucher.property && (
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Áp dụng tại: {voucher.property.name}
                                </Text>
                            )}
                        </Space>
                    </Col>
                    <Col xs={24} sm={6} style={{ textAlign: 'right' }}>
                        {isAvailable ? (
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                onClick={() => handleClaimFromList(voucher)}
                            >
                                Lưu mã
                            </Button>
                        ) : isUsed ? (
                            <Space direction="vertical" size={0} style={{ textAlign: 'right' }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>Đã dùng:</Text>
                                <Text strong style={{ color: '#52c41a' }}>
                                    -{formatVND(voucher.applied_discount_amount || 0)}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                    {dayjs(voucher.used_at).format('DD/MM/YYYY')}
                                </Text>
                            </Space>
                        ) : !isExpired && voucher.can_use ? (
                            <Button 
                                type="primary"
                                onClick={() => navigate('/rooms')}
                            >
                                Đặt phòng ngay
                            </Button>
                        ) : null}
                    </Col>
                </Row>
            </Card>
        );
    };

    return (
        <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
                <Space align="center" style={{ marginBottom: 8 }}>
                    <GiftOutlined style={{ fontSize: 28, color: '#eb2f96' }} />
                    <Title level={2} style={{ margin: 0 }}>Kho mã giảm giá</Title>
                </Space>
                <Paragraph type="secondary">
                    Quản lý và sử dụng mã giảm giá của bạn
                </Paragraph>
            </div>

            {/* Claim voucher button */}
            <Card style={{ marginBottom: 24 }}>
                <Row align="middle" justify="space-between">
                    <Col>
                        <Space>
                            <TagOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                            <div>
                                <Text strong>Có mã giảm giá?</Text>
                                <br />
                                <Text type="secondary">Nhập mã để lưu vào kho của bạn</Text>
                            </div>
                        </Space>
                    </Col>
                    <Col>
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={() => setClaimModalVisible(true)}
                        >
                            Nhập mã
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Tabs */}
            <Card>
                <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab}
                    tabBarExtraContent={
                        <Badge count={counts.unused} showZero style={{ backgroundColor: '#52c41a' }}>
                            <span></span>
                        </Badge>
                    }
                >
                    <TabPane
                        tab={
                            <span>
                                <CheckCircleOutlined />
                                Chưa sử dụng ({counts.unused})
                            </span>
                        }
                        key="unused"
                    />
                    <TabPane
                        tab={
                            <span>
                                <ClockCircleOutlined />
                                Đã sử dụng ({counts.used})
                            </span>
                        }
                        key="used"
                    />
                    <TabPane
                        tab={
                            <span>
                                <GiftOutlined />
                                Voucher có thể nhận
                            </span>
                        }
                        key="available"
                    />
                </Tabs>

                <Divider style={{ margin: '0 0 24px 0' }} />

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Spin size="large" />
                    </div>
                ) : activeTab === 'available' ? (
                    availableVouchers.length === 0 ? (
                        <Empty 
                            description="Không có voucher mới để nhận"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    ) : (
                        <>
                            <Alert
                                message="Nhấn 'Lưu mã' để thêm voucher vào kho của bạn"
                                type="info"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />
                            {availableVouchers.map(v => renderVoucherCard(v, true))}
                        </>
                    )
                ) : vouchers.length === 0 ? (
                    <Empty 
                        description={activeTab === 'unused' 
                            ? "Bạn chưa có voucher nào. Hãy nhập mã hoặc nhận voucher mới!"
                            : "Chưa có voucher đã sử dụng"
                        }
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        {activeTab === 'unused' && (
                            <Button type="primary" onClick={() => setActiveTab('available')}>
                                Xem voucher có thể nhận
                            </Button>
                        )}
                    </Empty>
                ) : (
                    vouchers.map(v => renderVoucherCard(v))
                )}
            </Card>

            {/* Claim voucher modal */}
            <Modal
                title={
                    <Space>
                        <TagOutlined style={{ color: '#1890ff' }} />
                        <span>Nhập mã giảm giá</span>
                    </Space>
                }
                open={claimModalVisible}
                onCancel={() => {
                    setClaimModalVisible(false);
                    setClaimCode('');
                }}
                footer={[
                    <Button key="cancel" onClick={() => {
                        setClaimModalVisible(false);
                        setClaimCode('');
                    }}>
                        Hủy
                    </Button>,
                    <Button 
                        key="submit" 
                        type="primary" 
                        loading={claimLoading}
                        onClick={handleClaimVoucher}
                    >
                        Lưu mã
                    </Button>
                ]}
            >
                <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">
                        Nhập mã voucher để lưu vào kho và sử dụng khi đặt phòng
                    </Text>
                </div>
                <Input
                    size="large"
                    placeholder="Nhập mã voucher (VD: GIAM50K)"
                    value={claimCode}
                    onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                    onPressEnter={handleClaimVoucher}
                    prefix={<TagOutlined style={{ color: '#bfbfbf' }} />}
                    style={{ textTransform: 'uppercase' }}
                />
            </Modal>

            <style>{`
                .voucher-card:hover {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    transform: translateY(-2px);
                    transition: all 0.3s ease;
                }
            `}</style>
        </div>
    );
};

export default MyVouchersPage;

