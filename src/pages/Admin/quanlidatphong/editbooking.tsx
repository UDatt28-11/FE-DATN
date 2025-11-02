import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, InputNumber, message, Card, Space, Spin } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { getBooking, updateBooking } from "../../../api/booking";
import type { BookingOrder, UpdateBookingData } from "../../../api/booking";

const EditBooking: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [booking, setBooking] = useState<BookingOrder | null>(null);

    // Load dữ liệu booking khi component mount
    useEffect(() => {
        if (id) {
            fetchBookingDetail(parseInt(id));
        }
    }, [id]);

    const fetchBookingDetail = async (bookingId: number) => {
        try {
            setLoading(true);
            const data = await getBooking(bookingId);
            setBooking(data);
            
            // Điền dữ liệu vào form
            form.setFieldsValue({
                customer_name: data.customer_name,
                customer_phone: data.customer_phone,
                customer_email: data.customer_email || '',
                total_amount: data.total_amount,
                payment_method: data.payment_method || '',
                notes: data.notes || '',
            });
        } catch (error: any) {
            message.error("Không thể tải thông tin đặt phòng");
        } finally {
            setLoading(false);
        }
    };

    const handleEditBooking = async (values: any) => {
        if (!id) return;

        try {
            setSubmitting(true);

            const updateData: UpdateBookingData = {
                customer_name: values.customer_name,
                customer_phone: values.customer_phone,
                customer_email: values.customer_email,
                total_amount: values.total_amount,
                payment_method: values.payment_method,
                notes: values.notes,
            };

            await updateBooking(parseInt(id), updateData);
            
            message.success("Cập nhật đặt phòng thành công!");
            
            // Chuyển về trang danh sách sau khi update thành công
            setTimeout(() => {
                navigate('/admin/booking');
            }, 1000);

        } catch (error: any) {
            message.error(error.response?.data?.message || "Không thể cập nhật đặt phòng. Vui lòng thử lại!");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 24, textAlign: 'center', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin size="large" tip="Đang tải thông tin đặt phòng...">
                    <div style={{ padding: '50px' }} />
                </Spin>
            </div>
        );
    }

    if (!booking) {
        return (
            <div style={{ padding: 24, textAlign: 'center' }}>
                <p>Không tìm thấy thông tin đặt phòng</p>
                <Button onClick={() => navigate('/admin/booking')}>Quay lại danh sách</Button>
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            {/* Nút quay lại */}
            <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/admin/booking')}
                style={{ marginBottom: 16 }}
            >
                Quay lại danh sách
            </Button>

            {/* Card form chỉnh sửa */}
            <Card title={`✏️ Sửa đặt phòng #${booking.code}`} bordered={false}>
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={handleEditBooking}
                >
                    {/* Thông tin khách hàng */}
                    <h3 style={{ marginTop: 0, marginBottom: 16, color: '#1890ff' }}>
                        👤 Thông tin khách hàng
                    </h3>
                    
                    <Form.Item 
                        label="Tên khách hàng" 
                        name="customer_name" 
                        rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
                    >
                        <Input placeholder="Nhập tên khách hàng" size="large" />
                    </Form.Item>

                    <Form.Item 
                        label="Số điện thoại" 
                        name="customer_phone" 
                        rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại' },
                            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ (10-11 số)' }
                        ]}
                    >
                        <Input placeholder="Nhập số điện thoại" size="large" />
                    </Form.Item>

                    <Form.Item 
                        label="Email khách hàng" 
                        name="customer_email"
                        rules={[
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input placeholder="Nhập email (không bắt buộc)" size="large" />
                    </Form.Item>

                    {/* Thông tin thanh toán */}
                    <h3 style={{ marginTop: 24, marginBottom: 16, color: '#1890ff' }}>
                        💰 Thông tin thanh toán
                    </h3>

                    <Form.Item 
                        label="Tổng tiền" 
                        name="total_amount" 
                        rules={[{ required: true, message: 'Vui lòng nhập tổng tiền' }]}
                    >
                        <InputNumber 
                            min={0} 
                            style={{ width: '100%' }}
                            size="large"
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
                            addonAfter="đ"
                        />
                    </Form.Item>

                    <Form.Item 
                        label="Phương thức thanh toán" 
                        name="payment_method"
                    >
                        <Input placeholder="VD: Tiền mặt, Chuyển khoản, Thẻ tín dụng" size="large" />
                    </Form.Item>

                    <Form.Item label="Ghi chú" name="notes">
                        <Input.TextArea 
                            rows={3} 
                            placeholder="Nhập ghi chú (không bắt buộc)"
                        />
                    </Form.Item>

                    {/* Thông tin chỉ đọc */}
                    <h3 style={{ marginTop: 24, marginBottom: 16, color: '#8c8c8c' }}>
                        ℹ️ Thông tin đơn hàng (chỉ xem)
                    </h3>
                    
                    <div style={{ 
                        padding: 16, 
                        background: '#f5f5f5', 
                        borderRadius: 6,
                        marginBottom: 24 
                    }}>
                        <p><strong>Mã đơn:</strong> {booking.code}</p>
                        <p><strong>Trạng thái:</strong> {booking.status}</p>
                        <p><strong>Ngày tạo:</strong> {new Date(booking.created_at).toLocaleString('vi-VN')}</p>
                        <p style={{ margin: 0 }}><strong>Số phòng đặt:</strong> {booking.details_count} phòng</p>
                        <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#8c8c8c' }}>
                            💡 <em>Để sửa thông tin phòng, ngày check-in/out, vui lòng liên hệ quản trị viên</em>
                        </p>
                    </div>

                    <Form.Item wrapperCol={{ span: 24 }}>
                        <Space size="middle">
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={submitting}
                                icon={<SaveOutlined />}
                                size="large"
                            >
                                Lưu thay đổi
                            </Button>
                            <Button 
                                onClick={() => navigate('/admin/booking')}
                                size="large"
                            >
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default EditBooking;
