import React, { useEffect, useState } from "react";
import { Form, Input, Button, DatePicker, InputNumber, Select, message, Space, Card, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Room } from "../../../types/room/room";

import { createBooking, CreateBookingData } from "../../../service/bookingService";
import { listRooms } from "../../../service/room";



const { RangePicker } = DatePicker;
const { Option } = Select;

const AddBooking: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    // Load danh sách phòng khi component mount
    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            setLoadingRooms(true);
            const roomsData = await listRooms();
            setRooms(roomsData);
        } catch (error) {
            message.error("Không thể tải danh sách phòng");
        } finally {
            setLoadingRooms(false);
        }
    };

    const handleRoomChange = (roomId: number) => {
        const room = rooms.find(r => r.id === roomId);
        setSelectedRoom(room || null);
        if (room && room.price_per_night) {
            // Tự động tính tổng tiền nếu đã chọn ngày
            const dates = form.getFieldValue('dates');
            if (dates && dates[0] && dates[1]) {
                const nights = dates[1].diff(dates[0], 'day');
                const totalPrice = nights * room.price_per_night;
                form.setFieldsValue({ totalPrice });
            }
        }
    };

    const handleDateChange = (dates: any) => {
        if (dates && dates[0] && dates[1] && selectedRoom?.price_per_night) {
            const nights = dates[1].diff(dates[0], 'day');
            const totalPrice = nights * selectedRoom.price_per_night;
            form.setFieldsValue({ 
                nights,
                totalPrice 
            });
        }
    };

    const handleAddBooking = async (values: any) => {
        try {
            setLoading(true);

            // Chuẩn bị dữ liệu gửi lên API
            const bookingData: CreateBookingData = {
                customer_name: values.customerName,
                customer_phone: values.customerPhone,
                customer_email: values.customerEmail,
                total_amount: values.totalPrice,
                payment_method: values.paymentMethod,
                notes: values.notes,
                details: [
                    {
                        room_id: values.roomId,
                        check_in_date: values.dates[0].format('YYYY-MM-DD'),
                        check_out_date: values.dates[1].format('YYYY-MM-DD'),
                        num_adults: values.numAdults || 1,
                        num_children: values.numChildren || 0,
                        sub_total: values.totalPrice,
                    }
                ]
            };

            // Gọi API tạo booking
            const result = await createBooking(bookingData);
            
            message.success(`Đã thêm đặt phòng mới! Mã đơn: ${result.code}`);
            
            // Reset form
            form.resetFields();
            setSelectedRoom(null);

            // Chuyển về trang danh sách sau 1.5s
            setTimeout(() => {
                navigate('/admin/booking');
            }, 1500);

        } catch (error: any) {
            message.error(error.response?.data?.message || "Không thể thêm đặt phòng. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Card title="📝 Thêm đặt phòng mới" bordered={false}>
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={handleAddBooking}
                    initialValues={{
                        numAdults: 1,
                        numChildren: 0,
                    }}
                >
                    {/* Thông tin khách hàng */}
                    <h3 style={{ marginTop: 0, marginBottom: 16, color: '#1890ff' }}>
                        👤 Thông tin khách hàng
                    </h3>
                    
                    <Form.Item 
                        label="Tên khách hàng" 
                        name="customerName" 
                        rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
                    >
                        <Input placeholder="Nhập tên khách hàng" />
                    </Form.Item>

                    <Form.Item 
                        label="Số điện thoại" 
                        name="customerPhone" 
                        rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại' },
                            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ (10-11 số)' }
                        ]}
                    >
                        <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>

                    <Form.Item 
                        label="Email khách hàng" 
                        name="customerEmail"
                        rules={[
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input placeholder="Nhập email (không bắt buộc)" />
                    </Form.Item>

                    {/* Thông tin đặt phòng */}
                    <h3 style={{ marginTop: 24, marginBottom: 16, color: '#1890ff' }}>
                        🏠 Thông tin đặt phòng
                    </h3>

                    <Form.Item 
                        label="Phòng" 
                        name="roomId" 
                        rules={[{ required: true, message: 'Vui lòng chọn phòng' }]}
                    >
                        <Select 
                            placeholder="Chọn phòng" 
                            loading={loadingRooms}
                            onChange={handleRoomChange}
                        >
                            {rooms.map(room => (
                                <Option key={room.id} value={room.id}>
                                    {room.name} 
                                    {room.price_per_night && ` - ${room.price_per_night.toLocaleString('vi-VN')} đ/đêm`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item 
                        label="Check-in & Check-out" 
                        name="dates" 
                        rules={[{ required: true, message: 'Vui lòng chọn ngày check-in và check-out' }]}
                    >
                        <RangePicker 
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            placeholder={['Ngày check-in', 'Ngày check-out']}
                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                            onChange={handleDateChange}
                        />
                    </Form.Item>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item 
                            label="Số đêm" 
                            name="nights"
                            style={{ marginBottom: 0 }}
                        >
                            <InputNumber min={1} disabled placeholder="Tự động" style={{ width: 120 }} />
                        </Form.Item>

                        <Form.Item 
                            label="Số người lớn" 
                            name="numAdults" 
                            rules={[{ required: true, message: 'Vui lòng nhập số người lớn' }]}
                            style={{ marginBottom: 0 }}
                        >
                            <InputNumber min={1} placeholder="Số người lớn" style={{ width: 120 }} />
                        </Form.Item>

                        <Form.Item 
                            label="Số trẻ em" 
                            name="numChildren"
                            style={{ marginBottom: 0 }}
                        >
                            <InputNumber min={0} placeholder="Số trẻ em" style={{ width: 120 }} />
                        </Form.Item>
                    </Space>

                    {/* Thông tin thanh toán */}
                    <h3 style={{ marginTop: 24, marginBottom: 16, color: '#1890ff' }}>
                        💰 Thông tin thanh toán
                    </h3>

                    <Form.Item 
                        label="Tổng tiền" 
                        name="totalPrice" 
                        rules={[{ required: true, message: 'Vui lòng nhập tổng tiền' }]}
                    >
                        <InputNumber 
                            min={0} 
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
                            addonAfter="đ"
                        />
                    </Form.Item>

                    <Form.Item 
                        label="Phương thức thanh toán" 
                        name="paymentMethod" 
                        rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
                    >
                        <Select placeholder="Chọn phương thức thanh toán">
                            <Option value="Tiền mặt">💵 Tiền mặt</Option>
                            <Option value="Chuyển khoản">🏦 Chuyển khoản</Option>
                            <Option value="Thẻ tín dụng">💳 Thẻ tín dụng</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Ghi chú" name="notes">
                        <Input.TextArea 
                            rows={3} 
                            placeholder="Nhập ghi chú (không bắt buộc)"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading}
                                size="large"
                            >
                                ✅ Thêm đặt phòng
                            </Button>
                            <Button 
                                onClick={() => navigate('/admin/booking')}
                                size="large"
                            >
                                ❌ Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AddBooking;