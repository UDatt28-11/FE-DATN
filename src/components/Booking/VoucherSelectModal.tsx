import React, { useState, useEffect } from 'react';
import {
    Modal,
    Card,
    Space,
    Typography,
    Empty,
    Spin,
    Input,
    Button,
    Tag,
    Radio,
    message,
    Alert,
    Divider,
} from 'antd';
import {
    GiftOutlined,
    TagOutlined,
    PercentageOutlined,
    DollarOutlined,
    CheckCircleOutlined,
    ShoppingOutlined,
} from '@ant-design/icons';
import {
    getUserVouchers,
    claimVoucher,
    applyVoucher,
    type Voucher,
    type ApplyVoucherResult,
} from '../../service/voucherService';
import { formatVND } from '../../utils/currency';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface VoucherSelectModalProps {
    open: boolean;
    orderAmount: number;
    bookingOrderId?: number;
    onCancel: () => void;
    onSelect: (result: ApplyVoucherResult | null) => void;
}

const VoucherSelectModal: React.FC<VoucherSelectModalProps> = ({
    open,
    orderAmount,
    bookingOrderId,
    onCancel,
    onSelect,
}) => {
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [claimLoading, setClaimLoading] = useState(false);
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);
    const [claimCode, setClaimCode] = useState('');

    useEffect(() => {
        if (open) {
            fetchVouchers();
            setSelectedVoucherId(null);
        }
    }, [open]);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const { vouchers } = await getUserVouchers({ status: 'unused', per_page: 50 });
            setVouchers(vouchers);
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
            await claimVoucher(claimCode.trim());
            message.success('Đã lưu mã giảm giá thành công!');
            setClaimCode('');
            fetchVouchers();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể lưu mã voucher');
        } finally {
            setClaimLoading(false);
        }
    };

    const handleApplyVoucher = async () => {
        if (!selectedVoucherId) {
            message.warning('Vui lòng chọn mã giảm giá');
            return;
        }

        setApplying(true);
        try {
            const response = await applyVoucher({
                voucher_id: selectedVoucherId,
                order_amount: orderAmount,
                booking_order_id: bookingOrderId,
            });
            
            message.success(response.message);
            onSelect(response.result);
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể áp dụng mã giảm giá');
        } finally {
            setApplying(false);
        }
    };

    const handleRemoveVoucher = () => {
        setSelectedVoucherId(null);
        onSelect(null);
    };

    const calculateDiscount = (voucher: Voucher): number => {
        if (orderAmount < voucher.min_order_amount) {
            return 0;
        }

        let discount = 0;
        if (voucher.discount_type === 'percentage') {
            discount = (orderAmount * voucher.discount_value) / 100;
            if (voucher.max_discount_amount && discount > voucher.max_discount_amount) {
                discount = voucher.max_discount_amount;
            }
        } else {
            discount = voucher.discount_value;
        }

        return Math.min(discount, orderAmount);
    };

    const canUseVoucher = (voucher: Voucher): boolean => {
        if (!voucher.can_use) return false;
        if (orderAmount < voucher.min_order_amount) return false;
        return true;
    };

    const getVoucherReasonCannotUse = (voucher: Voucher): string | null => {
        if (!voucher.can_use) return 'Voucher đã hết hạn hoặc không khả dụng';
        if (orderAmount < voucher.min_order_amount) {
            return `Đơn tối thiểu ${formatVND(voucher.min_order_amount)}`;
        }
        return null;
    };

    return (
        <Modal
            title={
                <Space>
                    <GiftOutlined style={{ color: '#eb2f96' }} />
                    <span>Chọn mã giảm giá</span>
                </Space>
            }
            open={open}
            onCancel={onCancel}
            width={600}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                selectedVoucherId && (
                    <Button key="remove" onClick={handleRemoveVoucher}>
                        Bỏ chọn
                    </Button>
                ),
                <Button
                    key="apply"
                    type="primary"
                    loading={applying}
                    onClick={handleApplyVoucher}
                    disabled={!selectedVoucherId}
                >
                    Áp dụng
                </Button>,
            ].filter(Boolean)}
        >
            {/* Order amount info */}
            <Alert
                message={
                    <Space>
                        <ShoppingOutlined />
                        <span>Tổng đơn hàng: <Text strong>{formatVND(orderAmount)}</Text></span>
                    </Space>
                }
                type="info"
                style={{ marginBottom: 16 }}
            />

            {/* Claim voucher section */}
            <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
                <Space.Compact style={{ width: '100%' }}>
                    <Input
                        placeholder="Nhập mã voucher"
                        value={claimCode}
                        onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                        onPressEnter={handleClaimVoucher}
                        prefix={<TagOutlined style={{ color: '#bfbfbf' }} />}
                        style={{ textTransform: 'uppercase' }}
                    />
                    <Button 
                        type="primary" 
                        loading={claimLoading}
                        onClick={handleClaimVoucher}
                    >
                        Lưu mã
                    </Button>
                </Space.Compact>
            </Card>

            <Divider style={{ margin: '16px 0' }}>Voucher của bạn</Divider>

            {/* Voucher list */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <Spin />
                </div>
            ) : vouchers.length === 0 ? (
                <Empty
                    description="Bạn chưa có voucher nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            ) : (
                <Radio.Group
                    value={selectedVoucherId}
                    onChange={(e) => setSelectedVoucherId(e.target.value)}
                    style={{ width: '100%' }}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {vouchers.map((voucher) => {
                            const canUse = canUseVoucher(voucher);
                            const reason = getVoucherReasonCannotUse(voucher);
                            const discount = calculateDiscount(voucher);

                            return (
                                <Card
                                    key={voucher.id}
                                    size="small"
                                    style={{
                                        cursor: canUse ? 'pointer' : 'not-allowed',
                                        opacity: canUse ? 1 : 0.6,
                                        border: selectedVoucherId === voucher.voucher_id 
                                            ? '2px solid #1890ff' 
                                            : '1px solid #f0f0f0',
                                    }}
                                    onClick={() => canUse && setSelectedVoucherId(voucher.voucher_id!)}
                                >
                                    <Space align="start" style={{ width: '100%' }}>
                                        <Radio 
                                            value={voucher.voucher_id} 
                                            disabled={!canUse}
                                            style={{ marginTop: 4 }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <Space>
                                                {voucher.discount_type === 'percentage' ? (
                                                    <Tag color="red" icon={<PercentageOutlined />}>
                                                        {voucher.discount_value}%
                                                    </Tag>
                                                ) : (
                                                    <Tag color="green" icon={<DollarOutlined />}>
                                                        {formatVND(voucher.discount_value)}
                                                    </Tag>
                                                )}
                                                <Text strong>{voucher.name || voucher.code}</Text>
                                            </Space>
                                            
                                            <div style={{ marginTop: 4 }}>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Mã: {voucher.code}
                                                </Text>
                                                {voucher.min_order_amount > 0 && (
                                                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                                                        | Đơn tối thiểu {formatVND(voucher.min_order_amount)}
                                                    </Text>
                                                )}
                                            </div>

                                            {voucher.end_date && (
                                                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                                                    HSD: {dayjs(voucher.end_date).format('DD/MM/YYYY')}
                                                </Text>
                                            )}

                                            {!canUse && reason && (
                                                <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                                                    ⚠️ {reason}
                                                </Text>
                                            )}
                                        </div>
                                        
                                        {canUse && discount > 0 && (
                                            <div style={{ textAlign: 'right' }}>
                                                <Text type="success" strong>
                                                    -{formatVND(discount)}
                                                </Text>
                                            </div>
                                        )}
                                    </Space>
                                </Card>
                            );
                        })}
                    </Space>
                </Radio.Group>
            )}

            {/* Selected voucher summary */}
            {selectedVoucherId && (
                <Card 
                    size="small" 
                    style={{ marginTop: 16, background: '#f6ffed', border: '1px solid #b7eb8f' }}
                >
                    <Space>
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        <Text>
                            Tiết kiệm: <Text strong style={{ color: '#52c41a' }}>
                                {formatVND(calculateDiscount(
                                    vouchers.find(v => v.voucher_id === selectedVoucherId)!
                                ))}
                            </Text>
                        </Text>
                    </Space>
                </Card>
            )}
        </Modal>
    );
};

export default VoucherSelectModal;

