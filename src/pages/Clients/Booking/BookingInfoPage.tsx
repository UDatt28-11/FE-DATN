import React, { useState, useEffect } from 'react';
import {
    Layout,
    Form,
    Input,
    Button,
    Card,
    Row,
    Col,
    Typography,
    Steps,
    Space,
    Divider,
    message,
} from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    ArrowLeftOutlined,
    ArrowRightOutlined,
    DeleteOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth } from '../../../context/AuthContext';
import { useBookingCart } from '../../../context/BookingCartContext';
import { createUserBooking } from '../../../service/bookingService';
import './BookingInfo.css';

const { Content } = Layout;
const { Text } = Typography;

interface BookingRoomItem {
    roomId: string;
    roomName: string;
    price: number;
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    children?: number;
    nights?: number;
    totalPrice?: number;
}

interface BookingData {
    // Hỗ trợ cả format cũ (1 phòng) và format mới (nhiều phòng)
    roomId?: string;
    roomName?: string;
    price?: number;
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    children?: number;
    nights?: number;
    totalPrice?: number;
    // Format mới: mảng phòng
    rooms?: BookingRoomItem[];
}

interface GuestInfo {
    fullName: string;
    phone: string;
    email: string;
}

const BookingInfoPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoggedIn } = useAuth();
    const { dateRange, clearCart } = useBookingCart(); // Lấy dateRange & hàm clear cart từ context
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Lấy thông tin booking từ location state
    const locationState = location.state as BookingData | null;
    
    // Chuyển đổi format cũ (1 phòng) sang format mới (mảng phòng) để xử lý thống nhất
    const normalizeBookingData = (): BookingData => {
        // Kiểm tra xem có phòng nào đã được lưu trong sessionStorage không (từ nút "Thêm phòng khác")
        const savedRooms = sessionStorage.getItem('booking_rooms');
        let existingRooms: BookingRoomItem[] = [];
        
        if (savedRooms) {
            try {
                existingRooms = JSON.parse(savedRooms);
            } catch (e) {
                console.error('Error parsing saved rooms:', e);
            }
        }

        if (!locationState) {
            // Nếu có rooms đã lưu, dùng chúng
            if (existingRooms.length > 0) {
                return { rooms: existingRooms };
            }
            return {
                rooms: [{
        roomId: '1',
        roomName: 'Deluxe Room',
        price: 1500000,
        nights: 1,
        totalPrice: 1500000,
                }]
            };
        }

        // Nếu đã có rooms array, merge với existing rooms nếu có
        if (locationState.rooms && locationState.rooms.length > 0) {
            // Kiểm tra xem phòng mới có trùng với phòng đã có không (theo roomId)
            const newRooms = locationState.rooms.filter(newRoom => 
                !existingRooms.some(existingRoom => existingRoom.roomId === newRoom.roomId)
            );
            const mergedRooms = [...existingRooms, ...newRooms];
            // Xóa sessionStorage sau khi đã merge
            sessionStorage.removeItem('booking_rooms');
            return { ...locationState, rooms: mergedRooms };
        }

        // Nếu là format cũ (1 phòng), chuyển sang format mới và merge với existing rooms
        if (locationState.roomId) {
            const newRoom: BookingRoomItem = {
                roomId: locationState.roomId,
                roomName: locationState.roomName || 'Phòng',
                price: locationState.price || 0,
                checkIn: locationState.checkIn,
                checkOut: locationState.checkOut,
                adults: locationState.adults,
                children: locationState.children,
                nights: locationState.nights,
                totalPrice: locationState.totalPrice || locationState.price || 0,
            };
            
            // Kiểm tra xem phòng mới có trùng với phòng đã có không
            const isDuplicate = existingRooms.some(room => room.roomId === newRoom.roomId);
            const mergedRooms = isDuplicate ? existingRooms : [...existingRooms, newRoom];
            
            // Xóa sessionStorage sau khi đã merge
            sessionStorage.removeItem('booking_rooms');
            
            return {
                ...locationState,
                rooms: mergedRooms
            };
        }

        // Nếu có rooms đã lưu, dùng chúng
        if (existingRooms.length > 0) {
            return { ...locationState, rooms: existingRooms };
        }

        return locationState;
    };

    const bookingData = normalizeBookingData();
    const rooms = bookingData.rooms || [];

    // Điền thông tin từ user đã đăng nhập vào form
    useEffect(() => {
        if (isLoggedIn && user) {
            form.setFieldsValue({
                fullName: user.full_name || user.name || '',
                email: user.email || '',
                phone: user.phone_number || user.phone || '',
            });
        }
    }, [isLoggedIn, user, form]);

    const handleSubmit = async (values: GuestInfo) => {
        if (rooms.length === 0) {
            message.error('Vui lòng chọn ít nhất một phòng!');
            return;
        }

        setLoading(true);
        try {
            // Tạo details array từ mảng phòng
            const details = rooms.map((room) => {
                // Ưu tiên dùng checkIn/checkOut từ room, nếu không có thì dùng dateRange từ context
                let checkInDate: string;
                let checkOutDate: string;

                if (room.checkIn && room.checkOut) {
                    // Parse từ format DD/MM/YYYY
                    checkInDate = dayjs(room.checkIn, 'DD/MM/YYYY').format('YYYY-MM-DD');
                    checkOutDate = dayjs(room.checkOut, 'DD/MM/YYYY').format('YYYY-MM-DD');
                } else if (dateRange && dateRange[0] && dateRange[1]) {
                    // Fallback: dùng dateRange từ context
                    checkInDate = dateRange[0].format('YYYY-MM-DD');
                    checkOutDate = dateRange[1].format('YYYY-MM-DD');
                } else {
                    // Fallback cuối cùng: dùng ngày hiện tại
                    checkInDate = dayjs().format('YYYY-MM-DD');
                    checkOutDate = dayjs().add(1, 'day').format('YYYY-MM-DD');
                }

                const detail: any = {
                    check_in_date: checkInDate,
                    check_out_date: checkOutDate,
                    num_adults: room.adults || 2,
                    num_children: room.children || 0,
                    sub_total: room.totalPrice || room.price * (room.nights || 1),
                };

                // Nếu có roomTypeId (đặt theo RoomType), gửi room_type_id
                // Nếu có roomId (đặt theo Room cụ thể), gửi room_id
                if ((room as any).roomTypeId) {
                    detail.room_type_id = Number((room as any).roomTypeId);
                } else if (room.roomId) {
                    detail.room_id = Number(room.roomId);
                } else {
                    throw new Error('Thiếu thông tin room_id hoặc room_type_id');
                }

                return detail;
            });

            // Tính tổng tiền từ tất cả các phòng
            const totalAmount = details.reduce((sum, detail) => sum + detail.sub_total, 0);

            // Tạo booking data
            const bookingPayload = {
                customer_name: values.fullName,
                customer_phone: values.phone,
                customer_email: values.email,
                total_amount: totalAmount,
                payment_method: undefined, // Sẽ cập nhật ở PaymentPage
                notes: undefined,
                details: details
            };

            // Gọi API tạo booking
            const createdBooking = await createUserBooking(bookingPayload);

            // Xóa cart sau khi tạo đơn thành công
            clearCart();

            message.success('Đặt phòng thành công! Vui lòng tiến hành thanh toán.');

            // Chuyển sang trang thanh toán với thông tin đầy đủ
            navigate('/booking/payment', {
                state: {
                    rooms: rooms,
                    checkIn: rooms[0]?.checkIn,
                    checkOut: rooms[0]?.checkOut,
                    totalPrice: totalAmount,
                    guestInfo: values,
                    bookingId: createdBooking.id,
                    booking: createdBooking,
                }
            });
        } catch (error: any) {
            // Không log error cho 401/403 vì axios interceptor sẽ xử lý redirect
            if (error.response?.status !== 401 && error.response?.status !== 403) {
                console.error('Error creating booking:', error);
                const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!';
                message.error(errorMessage);
            }
            // Nếu là 401/403, axios interceptor sẽ tự động redirect đến login
            // Không cần hiển thị error message vì user sẽ được redirect
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="booking-info-page">
            {/* Header Steps */}
            <div style={{ background: '#f5f5f5', padding: '30px 0' }}>
                <div className="container">
                    <Steps
                        current={0}
                        items={[
                            {
                                title: 'Thông tin',
                                description: 'Nhập thông tin người đặt',
                            },
                            {
                                title: 'Thanh toán',
                                description: 'Xác nhận và thanh toán',
                            },
                            {
                                title: 'Hoàn tất',
                                description: 'Xác nhận đặt phòng',
                            },
                        ]}
                    />
                </div>
            </div>

            <Content style={{ padding: '40px 0', minHeight: '70vh', background: '#fff' }}>
                <div className="container">
                    {/* Nút Trở về */}
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        style={{ marginBottom: 24 }}
                        size="large"
                    >
                        Trở về
                    </Button>

                    <Row gutter={[32, 32]}>
                        {/* Form nhập thông tin */}
                        <Col xs={24} lg={16}>
                            <Card
                                title={
                                    <Space>
                                        <UserOutlined />
                                        <span>Thông tin người đặt phòng</span>
                                    </Space>
                                }
                                variant="borderless"
                            >
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={handleSubmit}
                                    autoComplete="off"
                                    requiredMark="optional"
                                >
                                    <Row gutter={16}>
                                        <Col xs={24} sm={24}>
                                            <Form.Item
                                                label="Họ và tên"
                                                name="fullName"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập họ tên!' },
                                                    { min: 3, message: 'Họ tên phải có ít nhất 3 ký tự!' },
                                                    {
                                                        pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                                                        message: 'Họ tên chỉ được chứa chữ cái!'
                                                    }
                                                ]}
                                            >
                                                <Input
                                                    prefix={<UserOutlined style={{ color: '#cb8670' }} />}
                                                    placeholder="Nguyễn Văn A"
                                                    size="large"
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                label="Số điện thoại"
                                                name="phone"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                                    {
                                                        pattern: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
                                                        message: 'Số điện thoại không hợp lệ!'
                                                    }
                                                ]}
                                            >
                                                <Input
                                                    prefix={<PhoneOutlined style={{ color: '#cb8670' }} />}
                                                    placeholder="0912345678"
                                                    size="large"
                                                    maxLength={10}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                label="Email"
                                                name="email"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập email!' },
                                                    { type: 'email', message: 'Email không hợp lệ!' }
                                                ]}
                                            >
                                                <Input
                                                    prefix={<MailOutlined style={{ color: '#cb8670' }} />}
                                                    placeholder="example@email.com"
                                                    size="large"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Divider />

                                    <Form.Item style={{ marginBottom: 0 }}>
                                        <Space size="middle">
                                            <Button
                                                type="default"
                                                size="large"
                                                icon={<ArrowLeftOutlined />}
                                                onClick={() => navigate(-1)}
                                            >
                                                Quay lại
                                            </Button>
                                            <Button
                                                type="primary"
                                                size="large"
                                                htmlType="submit"
                                                loading={loading}
                                                icon={<ArrowRightOutlined />}
                                                style={{
                                                    backgroundColor: '#cb8670',
                                                    borderColor: '#cb8670',
                                                }}
                                            >
                                                Tiếp tục thanh toán
                                            </Button>
                                        </Space>
                                    </Form.Item>
                                </Form>
                            </Card>

                            {/* Nút thêm phòng khác */}
                            {rooms.length > 0 && (
                                <Card
                                    variant="borderless"
                                    style={{ marginTop: 24 }}
                                >
                                    <Button
                                        type="dashed"
                                        size="large"
                                        block
                                        icon={<PlusOutlined />}
                                        onClick={() => {
                                            // Lưu rooms hiện tại vào sessionStorage để có thể merge sau
                                            sessionStorage.setItem('booking_rooms', JSON.stringify(rooms));
                                            // Navigate đến danh sách phòng với flag để biết là đang thêm phòng
                                            navigate('/rooms', {
                                                state: { addToBooking: true }
                                            });
                                        }}
                                        style={{
                                            borderColor: '#cb8670',
                                            color: '#cb8670',
                                            height: 50,
                                        }}
                                    >
                                        Thêm phòng khác vào booking này
                                    </Button>
                                </Card>
                            )}

                            {/* Thông tin quan trọng */}
                            <Card
                                title="Lưu ý quan trọng"
                                variant="borderless"
                                style={{ marginTop: 24 }}
                            >
                                <Space direction="vertical" size="small">
                                    <Text>• Vui lòng kiểm tra kỹ thông tin trước khi tiếp tục</Text>
                                    <Text>• Email sẽ nhận được xác nhận đặt phòng</Text>
                                    <Text>• Số điện thoại để liên hệ khi cần thiết</Text>
                                    {rooms.length > 1 && (
                                        <Text strong style={{ color: '#cb8670' }}>
                                            • Bạn đang đặt {rooms.length} phòng trong một booking
                                        </Text>
                                    )}
                                </Space>
                            </Card>
                        </Col>

                        {/* Thông tin đặt phòng */}
                        <Col xs={24} lg={8}>
                            <Card
                                title={`Chi tiết đặt phòng (${rooms.length} phòng)`}
                                variant="borderless"
                                style={{ position: 'sticky', top: 20 }}
                            >
                                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                    {/* Danh sách phòng */}
                                    {rooms.map((room, index) => (
                                        <div key={index} style={{
                                            padding: 12,
                                            background: '#fafafa',
                                            borderRadius: 8,
                                            border: '1px solid #e8e8e8'
                                        }}>
                                            <Row justify="space-between" align="top" style={{ marginBottom: 8 }}>
                                                <Col flex="auto">
                                                    <Text strong style={{ fontSize: 14 }}>
                                                        {room.roomName}
                                                    </Text>
                                                </Col>
                                            </Row>
                                            {room.checkIn && room.checkOut && (
                                                <div style={{ marginTop: 4 }}>
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        {room.checkIn} → {room.checkOut}
                                                    </Text>
                                        <br />
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        {room.nights} đêm
                                                    </Text>
                                                </div>
                                            )}
                                            {(room.adults || room.children) && (
                                                <div style={{ marginTop: 4 }}>
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        {room.adults || 0} người lớn
                                                        {room.children ? `, ${room.children} trẻ em` : ''}
                                                    </Text>
                                                </div>
                                            )}
                                            <div style={{ marginTop: 8 }}>
                                                <Text strong style={{ color: '#cb8670', fontSize: 14 }}>
                                                    {(room.totalPrice || room.price * (room.nights || 1)).toLocaleString('vi-VN')} VNĐ
                                                </Text>
                                            </div>
                                    </div>
                                    ))}

                                    {rooms.length > 0 && rooms[0].checkIn && (
                                        <>
                                            <Divider style={{ margin: '8px 0' }} />
                                            <Row>
                                                <Col span={12}>
                                                    <Text type="secondary">Nhận phòng</Text>
                                                    <br />
                                                    <Text strong>{rooms[0].checkIn}</Text>
                                                </Col>
                                                <Col span={12}>
                                                    <Text type="secondary">Trả phòng</Text>
                                                    <br />
                                                    <Text strong>{rooms[0].checkOut}</Text>
                                                </Col>
                                            </Row>
                                        </>
                                    )}

                                    <Divider style={{ margin: '8px 0' }} />

                                    {/* Tổng cộng */}
                                    <div style={{
                                        background: '#f5f5f5',
                                        padding: 16,
                                        borderRadius: 8,
                                        border: '2px solid #cb8670'
                                    }}>
                                        <Row justify="space-between" align="middle">
                                            <Col>
                                                <Text strong style={{ fontSize: 16 }}>Tổng cộng</Text>
                                                        <br />
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {rooms.length} phòng
                                                        </Text>
                                            </Col>
                                            <Col>
                                                <Text
                                                    strong
                                                    style={{
                                                        fontSize: 24,
                                                        color: '#cb8670'
                                                    }}
                                                >
                                                    {rooms.reduce((sum, room) => 
                                                        sum + (room.totalPrice || room.price * (room.nights || 1)), 0
                                                    ).toLocaleString('vi-VN')} VNĐ
                                                </Text>
                                            </Col>
                                        </Row>
                                    </div>

                                    <Text type="secondary" style={{ fontSize: 12, display: 'block', textAlign: 'center' }}>
                                        Bạn sẽ thanh toán ở bước tiếp theo
                                    </Text>
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Content>
        </div>
    );
};

export default BookingInfoPage;
