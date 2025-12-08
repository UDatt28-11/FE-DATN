import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    DatePicker,
    Select,
    Upload,
    Button,
    Space,
    Typography,
    Divider,
    message,
    Row,
    Col,
    Card,
} from 'antd';
import {
    UserOutlined,
    IdcardOutlined,
    UploadOutlined,
    PlusOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import type { BookingOrder, BookingDetail, CheckInGuestData } from '../../types/booking/booking';
import { checkInDirect } from '../../service/bookingService';

const { Text, Title } = Typography;
const { TextArea } = Input;

// Custom validators
const validateFullName = (_: any, value: string) => {
    if (!value) return Promise.reject('Vui lòng nhập họ và tên');
    const words = value.trim().split(/\s+/);
    if (words.length < 2) {
        return Promise.reject('Thông tin không hợp lệ');
    }
    return Promise.resolve();
};

const validateDateOfBirth = (_: any, value: any) => {
    if (!value) return Promise.resolve(); // Optional field
    const age = dayjs().diff(dayjs(value), 'year');
    if (age < 16) {
        return Promise.reject('Thông tin không hợp lệ');
    }
    return Promise.resolve();
};

const validateIdentityNumber = (identityType: string) => (_: any, value: string) => {
    if (!value) return Promise.reject('Vui lòng nhập số giấy tờ');
    
    if (identityType === 'cccd') {
        // CCCD: exactly 12 digits
        if (!/^\d{12}$/.test(value)) {
            return Promise.reject('Thông tin không hợp lệ');
        }
    } else if (identityType === 'passport') {
        // Passport: 1 letter + 7 digits
        if (!/^[A-Za-z]\d{7}$/.test(value)) {
            return Promise.reject('Thông tin không hợp lệ');
        }
    }
    
    return Promise.resolve();
};

interface AdminCheckInModalProps {
    open?: boolean;
    visible?: boolean; // Deprecated, use open instead
    booking: BookingOrder | null;
    bookingDetailId?: number; // Optional: specify which booking detail to check-in
    onCancel: () => void;
    onSuccess: () => void;
}

const AdminCheckInModal: React.FC<AdminCheckInModalProps> = ({
    open,
    visible, // Deprecated, use open instead
    booking,
    bookingDetailId, // Optional: specify which booking detail to check-in
    onCancel,
    onSuccess,
}) => {
    const isOpen = open !== undefined ? open : visible; // Support both for backward compatibility
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [guestForms, setGuestForms] = useState<number[]>([0]); // Index của các form guest

    useEffect(() => {
        if (isOpen && booking) {
            // Reset form khi mở modal
            form.resetFields();
            setGuestForms([0]);
            
            // Pre-fill với thông tin booking nếu có
            let bookingDetail: BookingDetail | undefined;
            if (bookingDetailId) {
                bookingDetail = booking.details?.find(d => d.id === bookingDetailId);
            } else {
                bookingDetail = booking.details?.[0];
            }
            
            if (bookingDetail) {
                form.setFieldsValue({
                    notes: booking.notes || '',
                });
            }
        }
    }, [isOpen, booking, bookingDetailId, form]);

    const handleAddGuest = () => {
        setGuestForms([...guestForms, guestForms.length]);
    };

    const handleRemoveGuest = (index: number) => {
        if (guestForms.length > 1) {
            const newForms = guestForms.filter((_, i) => i !== index);
            setGuestForms(newForms);
            // Xóa fields tương ứng
            const fieldNames = form.getFieldsValue();
            newForms.forEach((_, newIndex) => {
                if (newIndex >= index) {
                    const oldIndex = newIndex + 1;
                    if (fieldNames[`guests_${oldIndex}`]) {
                        form.setFieldsValue({
                            [`guests_${newIndex}`]: fieldNames[`guests_${oldIndex}`],
                        });
                        form.setFieldsValue({
                            [`guests_${oldIndex}`]: undefined,
                        });
                    }
                }
            });
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (!booking) {
                message.error('Không tìm thấy thông tin đặt phòng');
                return;
            }

            // Kiểm tra booking có details không
            if (!booking.details || booking.details.length === 0) {
                message.error('Không tìm thấy thông tin phòng trong đơn đặt phòng');
                return;
            }

            // Tìm booking detail theo bookingDetailId nếu có, nếu không thì lấy đầu tiên
            let bookingDetail: BookingDetail | undefined;
            if (bookingDetailId) {
                bookingDetail = booking.details?.find(d => d.id === bookingDetailId);
            } else {
                bookingDetail = booking.details?.[0];
            }
            
            if (!bookingDetail) {
                message.error('Không tìm thấy thông tin phòng');
                return;
            }

            // Validate số lượng khách không vượt quá capacity
            const maxGuests = (bookingDetail.num_adults || 0) + (bookingDetail.num_children || 0);
            if (guestForms.length > maxGuests) {
                message.warning(`Số lượng khách (${guestForms.length}) vượt quá sức chứa phòng (${maxGuests} người). Vui lòng kiểm tra lại.`);
            }

            // Chuyển đổi form values sang format API
            const guests: CheckInGuestData[] = guestForms.map((_, index) => {
                const guestData = values[`guests_${index}`];
                if (!guestData) {
                    throw new Error(`Thông tin khách ${index + 1} không hợp lệ`);
                }
                const fileList = guestData?.identity_image?.fileList as UploadFile[];
                const file = fileList?.[0]?.originFileObj as File | undefined;

                return {
                    full_name: guestData.full_name,
                    date_of_birth: guestData.date_of_birth
                        ? dayjs(guestData.date_of_birth).format('YYYY-MM-DD')
                        : undefined,
                    identity_type: guestData.identity_type,
                    identity_number: guestData.identity_number,
                    identity_image: file,
                    booking_detail_id: bookingDetail.id,
                };
            });

            await checkInDirect(booking.id, {
                guests,
                notes: values.notes,
            });

            // Không hiển thị message ở đây, để onSuccess callback xử lý
            onSuccess();
            onCancel();
        } catch (error: any) {
            // Không log error cho 401/403 vì axios interceptor sẽ xử lý redirect
            if (error.response?.status !== 401 && error.response?.status !== 403) {
                console.error('Check-in error:', error);
                if (error.response?.data?.errors) {
                    const errors = error.response.data.errors;
                    Object.keys(errors).forEach((key) => {
                        message.error(errors[key][0]);
                    });
                } else {
                    message.error(error.response?.data?.message || 'Có lỗi xảy ra khi check-in');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    if (!booking) return null;

    // Tìm booking detail theo bookingDetailId nếu có, nếu không thì lấy đầu tiên
    let bookingDetail: BookingDetail | undefined;
    if (bookingDetailId) {
        bookingDetail = booking.details?.find(d => d.id === bookingDetailId);
    } else {
        bookingDetail = booking.details?.[0];
    }
    
    const roomName = bookingDetail?.room?.name || 'N/A';
    const checkInDate = bookingDetail?.check_in_date
        ? dayjs(bookingDetail.check_in_date).format('DD/MM/YYYY')
        : 'N/A';

    return (
        <Modal
            title={
                <Space>
                    <IdcardOutlined />
                    <span>Check-in trực tiếp (Admin)</span>
                </Space>
            }
            open={isOpen}
            onCancel={onCancel}
            width={800}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleSubmit}
                    style={{
                        backgroundColor: '#52c41a',
                        borderColor: '#52c41a',
                    }}
                >
                    Xác nhận Check-in
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical">
                {/* Thông tin booking */}
                <Card size="small" style={{ marginBottom: 24, backgroundColor: '#f5f5f5' }}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Text type="secondary">Phòng</Text>
                            <br />
                            <Text strong>{roomName}</Text>
                        </Col>
                        <Col span={8}>
                            <Text type="secondary">Ngày check-in</Text>
                            <br />
                            <Text strong>{checkInDate}</Text>
                        </Col>
                        <Col span={8}>
                            <Text type="secondary">Sức chứa</Text>
                            <br />
                            <Text strong>
                                {bookingDetail ? 
                                    `${(bookingDetail.num_adults || 0) + (bookingDetail.num_children || 0)} người` : 
                                    'N/A'}
                            </Text>
                        </Col>
                    </Row>
                </Card>

                <Divider>Thông tin khách check-in</Divider>

                {/* Guest forms */}
                {guestForms.map((_, index) => (
                    <Card
                        key={index}
                        size="small"
                        style={{ marginBottom: 16 }}
                        title={
                            <Space>
                                <UserOutlined />
                                <span>Khách {index + 1}</span>
                            </Space>
                        }
                        extra={
                            guestForms.length > 1 && (
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleRemoveGuest(index)}
                                >
                                    Xóa
                                </Button>
                            )
                        }
                    >
                        <Form.Item
                            name={[`guests_${index}`, 'full_name']}
                            label="Họ và tên"
                            rules={[{ validator: validateFullName }]}
                        >
                            <Input placeholder="Nhập họ và tên" />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name={[`guests_${index}`, 'date_of_birth']}
                                    label="Ngày sinh"
                                    rules={[
                                        { required: true, message: 'Vui lòng chọn ngày sinh' },
                                        { validator: validateDateOfBirth }
                                    ]}
                                >
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        format="DD/MM/YYYY"
                                        placeholder="Chọn ngày sinh"
                                        disabledDate={(current) => current && current > dayjs().endOf('day')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={[`guests_${index}`, 'identity_type']}
                                    label="Loại giấy tờ"
                                    rules={[{ required: true, message: 'Vui lòng chọn loại giấy tờ' }]}
                                >
                                    <Select 
                                        placeholder="Chọn loại giấy tờ"
                                        onChange={() => {
                                            // Clear and revalidate identity_number when type changes
                                            form.validateFields([[`guests_${index}`, 'identity_number']]);
                                        }}
                                    >
                                        <Select.Option value="cccd">CCCD/CMND</Select.Option>
                                        <Select.Option value="passport">Hộ chiếu</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) => 
                                prevValues[`guests_${index}`]?.identity_type !== currentValues[`guests_${index}`]?.identity_type
                            }
                        >
                            {({ getFieldValue }) => {
                                const identityType = getFieldValue([`guests_${index}`, 'identity_type']) || 'cccd';
                                return (
                                    <Form.Item
                                        name={[`guests_${index}`, 'identity_number']}
                                        label="Số giấy tờ"
                                        rules={[{ validator: validateIdentityNumber(identityType) }]}
                                    >
                                        <Input 
                                            placeholder={identityType === 'passport' 
                                                ? "Nhập số hộ chiếu (VD: A1234567)" 
                                                : "Nhập số CCCD (12 số)"
                                            } 
                                        />
                                    </Form.Item>
                                );
                            }}
                        </Form.Item>

                        <Form.Item
                            name={[`guests_${index}`, 'identity_image']}
                            label="Ảnh giấy tờ (tùy chọn)"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                        >
                            <Upload
                                listType="picture-card"
                                maxCount={1}
                                beforeUpload={() => false} // Prevent auto upload
                                accept="image/*"
                            >
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            </Upload>
                        </Form.Item>
                    </Card>
                ))}

                <Button
                    type="dashed"
                    onClick={handleAddGuest}
                    block
                    icon={<PlusOutlined />}
                    style={{ marginBottom: 16 }}
                >
                    Thêm khách
                </Button>

                <Form.Item name="notes" label="Ghi chú (tùy chọn)">
                    <TextArea rows={3} placeholder="Nhập ghi chú nếu có" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AdminCheckInModal;

