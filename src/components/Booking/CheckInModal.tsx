import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
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
import { checkInUserBooking } from '../../service/bookingService';

const { Text, Title } = Typography;
const { TextArea } = Input;

// Generate options for day, month, year selects
const generateDayOptions = (month?: number, year?: number) => {
    let maxDay = 31;
    if (month) {
        if ([4, 6, 9, 11].includes(month)) {
            maxDay = 30;
        } else if (month === 2) {
            if (year && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
                maxDay = 29;
            } else {
                maxDay = 28;
            }
        }
    }
    return Array.from({ length: maxDay }, (_, i) => ({
        value: i + 1,
        label: String(i + 1).padStart(2, '0'),
    }));
};

const generateMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: `Tháng ${i + 1}`,
    }));
};

const generateYearOptions = () => {
    const currentYear = dayjs().year();
    return Array.from({ length: 101 }, (_, i) => ({
        value: currentYear - i,
        label: String(currentYear - i),
    }));
};

interface CheckInModalProps {
    open?: boolean;
    visible?: boolean; // Deprecated, use open instead
    booking: BookingOrder | null;
    onCancel: () => void;
    onSuccess: () => void;
}

const CheckInModal: React.FC<CheckInModalProps> = ({
    open,
    visible, // Deprecated, use open instead
    booking,
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
            if (booking.details && booking.details.length > 0) {
                const firstDetail = booking.details[0];
                form.setFieldsValue({
                    notes: booking.notes || '',
                });
            }
        }
    }, [isOpen, booking, form]);

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

            // Lấy booking detail đầu tiên (hoặc có thể cho user chọn)
            const bookingDetail = booking.details?.[0];
            if (!bookingDetail) {
                message.error('Không tìm thấy thông tin phòng');
                return;
            }

            // Chuyển đổi form values sang format API
            const guests: CheckInGuestData[] = guestForms.map((_, index) => {
                const guestData = values[`guests_${index}`];
                const fileList = guestData?.identity_image?.fileList as UploadFile[];
                const file = fileList?.[0]?.originFileObj as File | undefined;

                // Combine day, month, year into date_of_birth
                let dateOfBirth: string | undefined;
                if (guestData.birth_day && guestData.birth_month && guestData.birth_year) {
                    const day = String(guestData.birth_day).padStart(2, '0');
                    const month = String(guestData.birth_month).padStart(2, '0');
                    dateOfBirth = `${guestData.birth_year}-${month}-${day}`;
                }

                return {
                    full_name: guestData.full_name,
                    date_of_birth: dateOfBirth,
                    identity_type: guestData.identity_type,
                    identity_number: guestData.identity_number,
                    identity_image: file,
                    booking_detail_id: bookingDetail.id,
                };
            });

            await checkInUserBooking(booking.id, {
                guests,
                notes: values.notes,
            });

            message.success('Yêu cầu check-in đã được gửi. Vui lòng chờ admin/staff xác minh.');
            onSuccess();
            onCancel();
        } catch (error: any) {
            console.error('Check-in error:', error);
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                Object.keys(errors).forEach((key) => {
                    message.error(errors[key][0]);
                });
            } else {
                message.error(error.response?.data?.message || 'Có lỗi xảy ra khi check-in');
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

    const bookingDetail = booking.details?.[0];
    const roomName = bookingDetail?.room?.name || 'N/A';
    const checkInDate = bookingDetail?.check_in_date
        ? dayjs(bookingDetail.check_in_date).format('DD/MM/YYYY')
        : 'N/A';

    return (
        <Modal
            title={
                <Space>
                    <IdcardOutlined />
                    <span>Check-in</span>
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
                        backgroundColor: '#cb8670',
                        borderColor: '#cb8670',
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
                        <Col span={12}>
                            <Text type="secondary">Phòng</Text>
                            <br />
                            <Text strong>{roomName}</Text>
                        </Col>
                        <Col span={12}>
                            <Text type="secondary">Ngày check-in</Text>
                            <br />
                            <Text strong>{checkInDate}</Text>
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
                            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                        >
                            <Input placeholder="Nhập họ và tên" />
                        </Form.Item>

                        <Row gutter={16}>
                            {/* Ngày sinh - 3 dropdown nhỏ gọn */}
                            <Col span={12}>
                                <Form.Item label="Ngày sinh" style={{ marginBottom: 16 }}>
                                    <Form.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => 
                                            prevValues[`guests_${index}`]?.birth_month !== currentValues[`guests_${index}`]?.birth_month ||
                                            prevValues[`guests_${index}`]?.birth_year !== currentValues[`guests_${index}`]?.birth_year
                                        }
                                    >
                                        {({ getFieldValue }) => {
                                            const month = getFieldValue([`guests_${index}`, 'birth_month']);
                                            const year = getFieldValue([`guests_${index}`, 'birth_year']);
                                            const dayOptions = generateDayOptions(month, year);
                                            
                                            return (
                                                <Space.Compact style={{ width: '100%' }}>
                                                    <Form.Item
                                                        name={[`guests_${index}`, 'birth_day']}
                                                        noStyle
                                                    >
                                                        <Select
                                                            placeholder="Ngày"
                                                            options={dayOptions}
                                                            showSearch
                                                            optionFilterProp="label"
                                                            allowClear
                                                            style={{ width: '33%' }}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        name={[`guests_${index}`, 'birth_month']}
                                                        noStyle
                                                    >
                                                        <Select
                                                            placeholder="Tháng"
                                                            options={generateMonthOptions()}
                                                            allowClear
                                                            style={{ width: '34%' }}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        name={[`guests_${index}`, 'birth_year']}
                                                        noStyle
                                                    >
                                                        <Select
                                                            placeholder="Năm"
                                                            options={generateYearOptions()}
                                                            showSearch
                                                            optionFilterProp="label"
                                                            allowClear
                                                            style={{ width: '33%' }}
                                                        />
                                                    </Form.Item>
                                                </Space.Compact>
                                            );
                                        }}
                                    </Form.Item>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={[`guests_${index}`, 'identity_type']}
                                    label="Loại giấy tờ"
                                    rules={[{ required: true, message: 'Vui lòng chọn loại giấy tờ' }]}
                                >
                                    <Select placeholder="Chọn loại giấy tờ">
                                        <Select.Option value="cccd">CCCD/CMND</Select.Option>
                                        <Select.Option value="passport">Hộ chiếu</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name={[`guests_${index}`, 'identity_number']}
                            label="Số giấy tờ"
                            rules={[{ required: true, message: 'Vui lòng nhập số giấy tờ' }]}
                        >
                            <Input placeholder="Nhập số CCCD/CMND hoặc hộ chiếu" />
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

export default CheckInModal;

