import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, InputNumber, message, Card, Space, Spin, Select, DatePicker } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getBooking, updateBooking } from "../../../api/booking";
import type { BookingOrder, UpdateBookingData } from "../../../api/booking";
import { listRooms, listRoomTypes } from "../../../api/room";
import type { Room, RoomType } from "../../../api/room";

const { RangePicker } = DatePicker;
const { Option } = Select;

const EditBooking: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [booking, setBooking] = useState<BookingOrder | null>(null);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [selectedRoomType, setSelectedRoomType] = useState<number | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [originalTotalAmount, setOriginalTotalAmount] = useState<number>(0);
    const [priceDifference, setPriceDifference] = useState<number>(0);

    // Load dữ liệu booking và room types khi component mount
    useEffect(() => {
        fetchRoomTypes();
        if (id) {
            fetchBookingDetail(parseInt(id));
        }
    }, [id]);

    const fetchRoomTypes = async () => {
        try {
            setLoadingRoomTypes(true);
            const roomTypesData = await listRoomTypes();
            setRoomTypes(roomTypesData);
        } catch (error) {
            message.error("Không thể tải danh sách loại phòng");
        } finally {
            setLoadingRoomTypes(false);
        }
    };

    const fetchRoomsByType = async (roomTypeId: number) => {
        try {
            setLoadingRooms(true);
            const roomsData = await listRooms(roomTypeId);
            setRooms(roomsData);
        } catch (error) {
            message.error("Không thể tải danh sách phòng");
        } finally {
            setLoadingRooms(false);
        }
    };

    const handleRoomTypeChange = (roomTypeId: number) => {
        setSelectedRoomType(roomTypeId);
        setSelectedRoom(null);
        form.setFieldsValue({ roomId: undefined });
        fetchRoomsByType(roomTypeId);
    };

    const calculatePriceDifference = (newTotalAmount: number) => {
        const difference = newTotalAmount - originalTotalAmount;
        setPriceDifference(difference);
        return difference;
    };

    const handleRoomChange = (roomId: number) => {
        const room = rooms.find(r => r.id === roomId);
        setSelectedRoom(room || null);
        if (room && room.price_per_night) {
            const dates = form.getFieldValue('dates');
            if (dates && dates[0] && dates[1]) {
                const nights = dates[1].diff(dates[0], 'day');
                const newTotalPrice = nights * room.price_per_night;
                form.setFieldsValue({ total_amount: newTotalPrice });
                calculatePriceDifference(newTotalPrice);
            }
        }
    };

    const handleDateChange = (dates: any) => {
        if (dates && dates[0] && dates[1] && selectedRoom?.price_per_night) {
            const nights = dates[1].diff(dates[0], 'day');
            const newTotalPrice = nights * selectedRoom.price_per_night;
            form.setFieldsValue({ total_amount: newTotalPrice });
            calculatePriceDifference(newTotalPrice);
        }
    };

    const fetchBookingDetail = async (bookingId: number) => {
        try {
            setLoading(true);
            // Include thông tin phòng và loại phòng
            const data = await getBooking(bookingId, "details,details.room,details.room.roomType");
            setBooking(data);
            
            // Lưu tổng tiền ban đầu để so sánh
            setOriginalTotalAmount(data.total_amount);
            
            // Điền dữ liệu vào form
            const firstDetail = data.details?.[0];
            if (firstDetail) {
                const roomTypeId = firstDetail.room?.room_type_id;
                if (roomTypeId) {
                    setSelectedRoomType(roomTypeId);
                    fetchRoomsByType(roomTypeId);
                }
                
                form.setFieldsValue({
                    customer_name: data.customer_name,
                    customer_phone: data.customer_phone,
                    customer_email: data.customer_email || '',
                    total_amount: data.total_amount,
                    payment_method: data.payment_method || '',
                    notes: data.notes || '',
                    roomTypeId: roomTypeId,
                    roomId: firstDetail.room_id,
                    dates: firstDetail.check_in_date && firstDetail.check_out_date 
                        ? [dayjs(firstDetail.check_in_date), dayjs(firstDetail.check_out_date)]
                        : null,
                    numAdults: firstDetail.num_adults,
                    numChildren: firstDetail.num_children,
                });
                
                setSelectedRoom(firstDetail.room);
            } else {
                form.setFieldsValue({
                    customer_name: data.customer_name,
                    customer_phone: data.customer_phone,
                    customer_email: data.customer_email || '',
                    total_amount: data.total_amount,
                    payment_method: data.payment_method || '',
                    notes: data.notes || '',
                });
            }
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
                        label="Tổng tiền mới" 
                        name="total_amount" 
                        rules={[{ required: true, message: 'Tổng tiền tự động tính' }]}
                    >
                        <InputNumber 
                            min={0}
                            disabled
                            style={{ width: '100%' }}
                            size="large"
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
                            addonAfter="đ"
                            placeholder="Tự động tính khi chọn phòng và ngày"
                        />
                    </Form.Item>

                    {/* Hiển thị chênh lệch tiền */}
                    {priceDifference !== 0 && (
                        <div style={{
                            padding: 16,
                            marginBottom: 24,
                            borderRadius: 8,
                            background: priceDifference > 0 ? '#fff7e6' : '#e6f7ff',
                            border: `1px solid ${priceDifference > 0 ? '#ffd591' : '#91d5ff'}`
                        }}>
                            <p style={{ 
                                margin: 0, 
                                fontSize: 16, 
                                fontWeight: 'bold',
                                color: priceDifference > 0 ? '#d46b08' : '#0958d9'
                            }}>
                                {priceDifference > 0 ? '💰 Khách cần bù thêm:' : '💵 Hoàn lại cho khách:'}
                                <span style={{ fontSize: 20, marginLeft: 8 }}>
                                    {Math.abs(priceDifference).toLocaleString('vi-VN')} đ
                                </span>
                            </p>
                            <p style={{ margin: '8px 0 0 0', fontSize: 14, color: '#666' }}>
                                Tổng tiền ban đầu: <strong>{originalTotalAmount.toLocaleString('vi-VN')} đ</strong>
                                {' → '}
                                Tổng tiền mới: <strong>{form.getFieldValue('total_amount')?.toLocaleString('vi-VN')} đ</strong>
                            </p>
                        </div>
                    )}

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

                    {/* Thông tin phòng */}
                    <h3 style={{ marginTop: 24, marginBottom: 16, color: '#1890ff' }}>
                        🏠 Thông tin phòng
                    </h3>

                    <Form.Item 
                        label="Loại phòng" 
                        name="roomTypeId" 
                        rules={[{ required: true, message: 'Vui lòng chọn loại phòng' }]}
                    >
                        <Select 
                            placeholder="Chọn loại phòng" 
                            loading={loadingRoomTypes}
                            onChange={handleRoomTypeChange}
                            size="large"
                        >
                            {roomTypes.map(roomType => (
                                <Option key={roomType.id} value={roomType.id}>
                                    {roomType.name}
                                    {roomType.description && ` - ${roomType.description}`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item 
                        label="Phòng" 
                        name="roomId" 
                        rules={[{ required: true, message: 'Vui lòng chọn phòng' }]}
                    >
                        <Select 
                            placeholder={selectedRoomType ? "Chọn phòng" : "Vui lòng chọn loại phòng trước"} 
                            loading={loadingRooms}
                            disabled={!selectedRoomType}
                            onChange={handleRoomChange}
                            size="large"
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
                            onChange={handleDateChange}
                            size="large"
                        />
                    </Form.Item>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item 
                            label="Số người lớn" 
                            name="numAdults" 
                            rules={[{ required: true, message: 'Vui lòng nhập số người lớn' }]}
                            style={{ marginBottom: 0 }}
                        >
                            <InputNumber min={1} placeholder="Số người lớn" style={{ width: 150 }} size="large" />
                        </Form.Item>

                        <Form.Item 
                            label="Số trẻ em" 
                            name="numChildren"
                            style={{ marginBottom: 0 }}
                        >
                            <InputNumber min={0} placeholder="Số trẻ em" style={{ width: 150 }} size="large" />
                        </Form.Item>
                    </Space>

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
