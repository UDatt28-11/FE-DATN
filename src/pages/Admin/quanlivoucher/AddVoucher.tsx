import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Select,
    InputNumber,
    DatePicker,
    Switch,
    Space,
    Typography,
    message,
    Row,
    Col,
    Divider,
    Alert,
} from 'antd';
import {
    GiftOutlined,
    ArrowLeftOutlined,
    SaveOutlined,
    PercentageOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createVoucher, type VoucherFormData } from '../../../service/admin/voucherService';
import { getProperties } from '../../../service/propertyService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const AddVoucher: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState<Array<{ id: number; name: string }>>([]);
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage');

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const response = await getProperties({ per_page: 100 });
            setProperties(response.properties || []);
        } catch (error) {
            console.error('Error fetching properties:', error);
        }
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        form.setFieldsValue({ code });
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const formData: VoucherFormData = {
                property_id: values.property_id || null,
                code: values.code.toUpperCase(),
                name: values.name,
                description: values.description,
                discount_type: values.discount_type,
                discount_value: values.discount_value,
                min_order_amount: values.min_order_amount || 0,
                max_discount_amount: values.max_discount_amount || null,
                usage_limit: values.usage_limit || null,
                max_usage_per_user: values.max_usage_per_user || 1,
                start_date: values.date_range[0].format('YYYY-MM-DD HH:mm:ss'),
                end_date: values.date_range[1].format('YYYY-MM-DD HH:mm:ss'),
                is_active: values.is_active ?? true,
                is_public: values.is_public ?? true,
            };

            await createVoucher(formData);
            message.success('Tạo voucher thành công!');
            navigate('/admin/vouchers');
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể tạo voucher');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <div style={{ marginBottom: 24 }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/admin/vouchers')}
                        style={{ marginBottom: 16 }}
                    >
                        Quay lại
                    </Button>
                    <Space align="center">
                        <GiftOutlined style={{ fontSize: 28, color: '#eb2f96' }} />
                        <Title level={3} style={{ margin: 0 }}>Thêm Voucher mới</Title>
                    </Space>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        discount_type: 'percentage',
                        is_active: true,
                        is_public: true,
                        max_usage_per_user: 1,
                        min_order_amount: 0,
                    }}
                >
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="code"
                                label="Mã voucher"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mã voucher' },
                                    { max: 50, message: 'Mã voucher tối đa 50 ký tự' },
                                ]}
                            >
                                <Input
                                    placeholder="VD: GIAM50K"
                                    style={{ textTransform: 'uppercase' }}
                                    addonAfter={
                                        <Button type="link" size="small" onClick={generateCode}>
                                            Tạo mã
                                        </Button>
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="name"
                                label="Tên voucher"
                            >
                                <Input placeholder="VD: Giảm 50K cho đơn đầu tiên" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <TextArea rows={3} placeholder="Mô tả chi tiết về voucher..." />
                    </Form.Item>

                    <Divider>Thông tin giảm giá</Divider>

                    <Row gutter={24}>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="discount_type"
                                label="Loại giảm giá"
                                rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}
                            >
                                <Select
                                    onChange={(value) => setDiscountType(value)}
                                    options={[
                                        { value: 'percentage', label: 'Phần trăm (%)' },
                                        { value: 'fixed_amount', label: 'Số tiền cố định (VNĐ)' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="discount_value"
                                label={discountType === 'percentage' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (VNĐ)'}
                                rules={[
                                    { required: true, message: 'Vui lòng nhập giá trị giảm' },
                                    {
                                        type: 'number',
                                        min: 0,
                                        max: discountType === 'percentage' ? 100 : undefined,
                                        message: discountType === 'percentage' 
                                            ? 'Phần trăm từ 0-100'
                                            : 'Số tiền phải lớn hơn 0',
                                    },
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={discountType === 'percentage' ? 100 : undefined}
                                    formatter={value => discountType === 'percentage' 
                                        ? `${value}` 
                                        : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                    }
                                    parser={value => value!.replace(/,/g, '') as unknown as number}
                                    addonAfter={discountType === 'percentage' ? '%' : 'VNĐ'}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="max_discount_amount"
                                label="Giảm tối đa (VNĐ)"
                                tooltip="Áp dụng cho loại giảm phần trăm"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value!.replace(/,/g, '') as unknown as number}
                                    placeholder="Không giới hạn"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="min_order_amount"
                                label="Đơn hàng tối thiểu (VNĐ)"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value!.replace(/,/g, '') as unknown as number}
                                    placeholder="0 = Không giới hạn"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="property_id"
                                label="Áp dụng cho cơ sở"
                                tooltip="Để trống nếu áp dụng cho tất cả cơ sở"
                            >
                                <Select
                                    allowClear
                                    placeholder="Tất cả cơ sở"
                                    options={properties.map(p => ({ value: p.id, label: p.name }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider>Thời hạn & Giới hạn</Divider>

                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="date_range"
                                label="Thời gian áp dụng"
                                rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
                            >
                                <RangePicker
                                    showTime
                                    format="DD/MM/YYYY HH:mm"
                                    style={{ width: '100%' }}
                                    placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item
                                name="usage_limit"
                                label="Tổng lượt sử dụng"
                                tooltip="Để trống = Không giới hạn"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={1}
                                    placeholder="Không giới hạn"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item
                                name="max_usage_per_user"
                                label="Lượt/người dùng"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={1}
                                    max={100}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider>Cài đặt</Divider>

                    <Row gutter={24}>
                        <Col xs={12} md={6}>
                            <Form.Item
                                name="is_active"
                                label="Kích hoạt"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                            </Form.Item>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Item
                                name="is_public"
                                label="Công khai"
                                valuePropName="checked"
                                tooltip="Voucher công khai có thể được người dùng nhìn thấy và lưu vào kho"
                            >
                                <Switch checkedChildren="Công khai" unCheckedChildren="Riêng tư" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                icon={<SaveOutlined />}
                            >
                                Tạo Voucher
                            </Button>
                            <Button onClick={() => navigate('/admin/vouchers')}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AddVoucher;

