import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Modal,
    Form,
    Input,
    Select,
    InputNumber,
    Upload,
    Button,
    Space,
    Typography,
    Divider,
    message,
    Row,
    Col,
    Card,
    Alert,
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
import { getAvailableRoomsForChange } from '../../service/bookingService';
import api from '../../api/axios';

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

// Validate ngày sinh dựa trên loại giấy tờ
// CCCD và hộ chiếu đều yêu cầu tuổi >= 14 (theo quy định Việt Nam)
const validateDateOfBirth = (identityType: string) => (_: any, value: any) => {
    if (!value) {
        // Nếu chưa chọn loại giấy tờ, không validate
        if (!identityType) return Promise.resolve();
        // Nếu đã chọn loại giấy tờ nhưng chưa nhập ngày sinh, yêu cầu nhập
        return Promise.reject('Vui lòng nhập ngày sinh');
    }
    
    // Kiểm tra ngày sinh có hợp lệ không
    const birthDate = dayjs(value);
    if (!birthDate.isValid()) {
        return Promise.reject('Ngày sinh không hợp lệ');
    }
    
    // Kiểm tra ngày sinh không được trong tương lai
    if (birthDate.isAfter(dayjs())) {
        return Promise.reject('Ngày sinh không được trong tương lai');
    }
    
    // Tính tuổi
    const age = dayjs().diff(birthDate, 'year', true); // true để lấy số thập phân chính xác
    
    // Theo quy định Việt Nam: CCCD và hộ chiếu đều yêu cầu tuổi >= 14
    const minAge = 14;
    
    if (age < minAge) {
        const identityTypeName = identityType === 'cccd' ? 'CCCD' : 'hộ chiếu';
        return Promise.reject(`Độ tuổi không đủ để có ${identityTypeName}. Yêu cầu tối thiểu ${minAge} tuổi.`);
    }
    
    // Kiểm tra tuổi hợp lý (không quá 150 tuổi)
    if (age > 150) {
        return Promise.reject('Ngày sinh không hợp lệ');
    }
    
    return Promise.resolve();
};

// Tính số ngày tối đa của tháng
const getMaxDayForMonth = (month?: number, year?: number): number => {
    if (!month) return 31;
    
    if ([4, 6, 9, 11].includes(month)) {
        return 30; // Tháng 4, 6, 9, 11 có 30 ngày
    } else if (month === 2) {
        // Tháng 2: kiểm tra năm nhuận
        if (year && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
            return 29; // Năm nhuận
        } else {
            return 28; // Năm không nhuận
        }
    }
    return 31; // Các tháng còn lại có 31 ngày
};

// Generate options for day, month, year selects (giữ lại cho tương thích)
const generateDayOptions = (month?: number, year?: number) => {
    const maxDay = getMaxDayForMonth(month, year);
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
    const minYear = currentYear - 100;
    return Array.from({ length: 101 }, (_, i) => ({
        value: currentYear - i,
        label: String(currentYear - i),
    }));
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
    const [availableRooms, setAvailableRooms] = useState<any[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen && booking) {
            // Reset form khi mở modal
            form.resetFields();
            setGuestForms([0]);
            setSelectedRoomId(null);
            setAvailableRooms([]);
            
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
                
                // Load danh sách phòng có thể thay đổi
                loadAvailableRooms(bookingDetail.id);
            }
        }
    }, [isOpen, booking, bookingDetailId, form]);
    
    const loadAvailableRooms = async (detailId: number) => {
        try {
            setLoadingRooms(true);
            const data = await getAvailableRoomsForChange(detailId);
            setAvailableRooms(data.available_rooms || []);
        } catch (error: any) {
            console.error('Error loading available rooms:', error);
        } finally {
            setLoadingRooms(false);
        }
    };

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

            // Validate: Chỉ cho phép check-in vào đúng ngày check-in của booking
            if (bookingDetail.check_in_date) {
                const checkInDate = dayjs(bookingDetail.check_in_date).startOf('day');
                const today = dayjs().startOf('day');
                
                if (!today.isSame(checkInDate, 'day')) {
                    message.error(`Không thể check-in. Phòng này chỉ có thể check-in vào ngày ${checkInDate.format('DD/MM/YYYY')}. Ngày hiện tại: ${today.format('DD/MM/YYYY')}`);
                    setLoading(false);
                    return;
                }
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
                
                // Lấy nhiều ảnh (mới) hoặc 1 ảnh (tương thích ngược)
                // Ant Design Upload trả về fileList trong value
                const identityImagesValue = guestData?.identity_images;
                const identityImageValue = guestData?.identity_image;
                
                // Debug log
                console.log('AdminCheckInModal - Processing files for guest', index, {
                    identity_images_value: identityImagesValue,
                    identity_image_value: identityImageValue,
                    identity_images_type: typeof identityImagesValue,
                    identity_images_is_array: Array.isArray(identityImagesValue),
                });
                
                // Ưu tiên nhiều ảnh, fallback về 1 ảnh
                const files: File[] = [];
                
                // Kiểm tra identity_images (nhiều ảnh)
                if (identityImagesValue) {
                    // Có thể là fileList (array của UploadFile) hoặc array trực tiếp
                    const fileList = Array.isArray(identityImagesValue) 
                        ? identityImagesValue 
                        : (identityImagesValue as any)?.fileList || [];
                    
                    if (fileList.length > 0) {
                        fileList.forEach((fileItem: any) => {
                            // UploadFile có originFileObj
                            if (fileItem?.originFileObj instanceof File) {
                                files.push(fileItem.originFileObj);
                            } 
                            // Hoặc có thể là File trực tiếp
                            else if (fileItem instanceof File) {
                                files.push(fileItem);
                            }
                        });
                    }
                }
                
                // Fallback: Kiểm tra identity_image (1 ảnh)
                if (files.length === 0 && identityImageValue) {
                    const fileList = Array.isArray(identityImageValue) 
                        ? identityImageValue 
                        : (identityImageValue as any)?.fileList || [];
                    
                    if (fileList.length > 0) {
                        const fileItem = fileList[0];
                        if (fileItem?.originFileObj instanceof File) {
                            files.push(fileItem.originFileObj);
                        } else if (fileItem instanceof File) {
                            files.push(fileItem);
                        }
                    }
                }
                
                console.log('AdminCheckInModal - Files extracted', {
                    guest_index: index,
                    files_count: files.length,
                    files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
                });
                
                // Validate: Phải có ít nhất 1 ảnh
                if (files.length === 0) {
                    throw new Error(`Khách ${index + 1}: Vui lòng upload ít nhất 1 ảnh giấy tờ`);
                }

                // Combine day, month, year into date_of_birth
                let dateOfBirth: string | undefined;
                if (guestData.birth_day && guestData.birth_month && guestData.birth_year) {
                    const day = String(guestData.birth_day).padStart(2, '0');
                    const month = String(guestData.birth_month).padStart(2, '0');
                    dateOfBirth = `${guestData.birth_year}-${month}-${day}`;
                }

                // Validate tuổi dựa trên loại giấy tờ
                if (dateOfBirth && guestData.identity_type) {
                    const birthDate = dayjs(dateOfBirth);
                    if (birthDate.isValid()) {
                        const age = dayjs().diff(birthDate, 'year', true);
                        const minAge = 14; // CCCD và hộ chiếu đều yêu cầu tuổi >= 14
                        
                        if (age < minAge) {
                            const identityTypeName = guestData.identity_type === 'cccd' ? 'CCCD' : 'hộ chiếu';
                            throw new Error(`Khách ${index + 1}: Độ tuổi không đủ để có ${identityTypeName}. Yêu cầu tối thiểu ${minAge} tuổi.`);
                        }
                        
                        // Kiểm tra ngày sinh không được trong tương lai
                        if (birthDate.isAfter(dayjs())) {
                            throw new Error(`Khách ${index + 1}: Ngày sinh không được trong tương lai.`);
                        }
                    }
                }

                return {
                    full_name: guestData.full_name,
                    date_of_birth: dateOfBirth,
                    identity_type: guestData.identity_type,
                    identity_number: guestData.identity_number,
                    identity_image: files[0], // Tương thích ngược
                    identity_images: files, // Nhiều ảnh
                    booking_detail_id: bookingDetail.id,
                };
            });

            // Chuẩn bị room_changes nếu có thay đổi phòng
            const roomChanges: any[] = [];
            if (selectedRoomId && bookingDetail && selectedRoomId !== bookingDetail.room_id) {
                roomChanges.push({
                    booking_detail_id: bookingDetail.id,
                    new_room_id: selectedRoomId,
                });
            }
            
            // Tạo FormData để gửi room_changes
            const formData = new FormData();
            
            // Thêm guests data
            guests.forEach((guest, index) => {
                formData.append(`guests[${index}][full_name]`, guest.full_name);
                if (guest.date_of_birth) {
                    formData.append(`guests[${index}][date_of_birth]`, guest.date_of_birth);
                }
                formData.append(`guests[${index}][identity_type]`, guest.identity_type);
                formData.append(`guests[${index}][identity_number]`, guest.identity_number);
                formData.append(`guests[${index}][booking_detail_id]`, guest.booking_detail_id.toString());
                
                // Thêm nhiều ảnh - dùng format [] để Laravel nhận được array
                if (guest.identity_images && Array.isArray(guest.identity_images) && guest.identity_images.length > 0) {
                    console.log('AdminCheckInModal - Appending identity_images', {
                        guest_index: index,
                        files_count: guest.identity_images.length,
                    });
                    guest.identity_images.forEach((file: File, fileIndex: number) => {
                        if (file instanceof File) {
                            formData.append(`guests[${index}][identity_images][]`, file);
                            console.log('AdminCheckInModal - Appended file', {
                                guest_index: index,
                                file_index: fileIndex,
                                file_name: file.name,
                                file_size: file.size,
                            });
                        } else {
                            console.warn('AdminCheckInModal - File is not a File instance', {
                                guest_index: index,
                                file_index: fileIndex,
                                file_type: typeof file,
                            });
                        }
                    });
                } else if (guest.identity_image && guest.identity_image instanceof File) {
                    console.log('AdminCheckInModal - Appending single identity_image', {
                        guest_index: index,
                        file_name: guest.identity_image.name,
                    });
                    formData.append(`guests[${index}][identity_image]`, guest.identity_image);
                } else {
                    console.warn('AdminCheckInModal - No identity images for guest', {
                        guest_index: index,
                        has_identity_images: !!guest.identity_images,
                        has_identity_image: !!guest.identity_image,
                    });
                }
            });
            
            // Thêm room_changes
            if (roomChanges.length > 0) {
                roomChanges.forEach((change, index) => {
                    formData.append(`room_changes[${index}][booking_detail_id]`, change.booking_detail_id.toString());
                    formData.append(`room_changes[${index}][new_room_id]`, change.new_room_id.toString());
                });
            }
            
            if (values.notes) {
                formData.append('notes', values.notes);
            }
            
            // Gọi API check-in với FormData
            const response = await api.post(`/staff/check-in/${booking.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
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
        // Handle file list from Upload component
        if (e?.fileList) {
            return e.fileList;
        }
        // Handle single file
        if (e?.file) {
            return [e.file];
        }
        return [];
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
    
    // Kiểm tra xem ngày hiện tại có phải là ngày check-in không
    const canCheckIn = bookingDetail?.check_in_date 
        ? dayjs().startOf('day').isSame(dayjs(bookingDetail.check_in_date).startOf('day'), 'day')
        : true; // Nếu không có check_in_date thì cho phép (fallback)

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
                    disabled={!canCheckIn}
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
                            <Text type="secondary">Phòng hiện tại</Text>
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
                    {availableRooms.length > 0 && (
                        <Row gutter={16} style={{ marginTop: 16 }}>
                            <Col span={24}>
                                <Text type="secondary">Thay đổi phòng (tùy chọn)</Text>
                                <br />
                                <Select
                                    placeholder="Chọn phòng khác (ưu tiên phòng gần nhau)"
                                    style={{ width: '100%', marginTop: 8 }}
                                    loading={loadingRooms}
                                    value={selectedRoomId}
                                    onChange={(value) => setSelectedRoomId(value)}
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    filterOption={(input, option) => {
                                        const label = String(option?.label || '');
                                        return label.toLowerCase().includes(input.toLowerCase());
                                    }}
                                >
                                    {availableRooms.map((room: any) => (
                                        <Select.Option key={room.id} value={room.id} label={room.name}>
                                            <Space>
                                                <span>{room.name}</span>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    (Tầng {room.floor_number})
                                                </Text>
                                            </Space>
                                        </Select.Option>
                                    ))}
                                </Select>
                                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
                                    Hệ thống sẽ ưu tiên phòng cùng tầng hoặc gần nhau
                                </Text>
                            </Col>
                        </Row>
                    )}
                </Card>

                {/* Cảnh báo về ngày check-in */}
                {bookingDetail?.check_in_date && (() => {
                    const checkInDate = dayjs(bookingDetail.check_in_date).startOf('day');
                    const today = dayjs().startOf('day');
                    const isToday = today.isSame(checkInDate, 'day');
                    
                    return (
                        <Alert
                            message={isToday 
                                ? `Có thể check-in hôm nay (${checkInDate.format('DD/MM/YYYY')})`
                                : `Chỉ có thể check-in vào ngày ${checkInDate.format('DD/MM/YYYY')}. Ngày hiện tại: ${today.format('DD/MM/YYYY')}`
                            }
                            type={isToday ? 'success' : 'warning'}
                            showIcon
                            style={{ marginBottom: 24 }}
                        />
                    );
                })()}

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
                            {/* Ngày sinh - 3 dropdown nhỏ gọn */}
                            <Col span={12}>
                                <Form.Item label="Ngày sinh" required style={{ marginBottom: 16 }}>
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
                                            
                                            const maxDay = getMaxDayForMonth(month, year);
                                            
                                            return (
                                                <Space.Compact style={{ width: '100%' }}>
                                                    <Form.Item
                                                        name={[`guests_${index}`, 'birth_day']}
                                                        noStyle
                                                        dependencies={[[`guests_${index}`, 'birth_month'], [`guests_${index}`, 'birth_year']]}
                                                        rules={[
                                                            { required: true, message: 'Chọn ngày' },
                                                            ({ getFieldValue }) => ({
                                                                validator: (_, value) => {
                                                                    if (!value) {
                                                                        return Promise.reject('Vui lòng chọn ngày');
                                                                    }
                                                                    const currentMonth = getFieldValue([`guests_${index}`, 'birth_month']);
                                                                    const currentYear = getFieldValue([`guests_${index}`, 'birth_year']);
                                                                    const maxDayForCurrentMonth = getMaxDayForMonth(currentMonth, currentYear);
                                                                    
                                                                    if (value > maxDayForCurrentMonth) {
                                                                        return Promise.reject(`Tháng ${currentMonth} chỉ có tối đa ${maxDayForCurrentMonth} ngày`);
                                                                    }
                                                                    
                                                                    return Promise.resolve();
                                                                },
                                                            }),
                                                        ]}
                                                    >
                                                        <Select
                                                            placeholder="Ngày"
                                                            options={generateDayOptions(month, year)}
                                                            showSearch
                                                            optionFilterProp="label"
                                                            filterOption={(input, option) => {
                                                                const label = String(option?.label || '');
                                                                return label.includes(input);
                                                            }}
                                                            style={{ width: '33%' }}
                                                            onChange={(value) => {
                                                                // Tự động focus sang tháng khi chọn ngày
                                                                setTimeout(() => {
                                                                    const formElement = document.querySelector(`form`);
                                                                    if (formElement) {
                                                                        const monthSelects = formElement.querySelectorAll('.ant-select');
                                                                        const monthSelect = monthSelects[index * 3 + 1]?.querySelector('.ant-select-selector') as HTMLElement;
                                                                        if (monthSelect) {
                                                                            monthSelect.focus();
                                                                            monthSelect.click();
                                                                        }
                                                                    }
                                                                }, 100);
                                                            }}
                                                            onSearch={(value) => {
                                                                // Khi nhập đủ 2 ký tự số, tự động chọn và focus sang tháng
                                                                const numValue = parseInt(value);
                                                                if (value.length >= 2 && !isNaN(numValue) && numValue >= 1 && numValue <= 31) {
                                                                    const currentMonth = getFieldValue([`guests_${index}`, 'birth_month']);
                                                                    const currentYear = getFieldValue([`guests_${index}`, 'birth_year']);
                                                                    const maxDayForCurrentMonth = getMaxDayForMonth(currentMonth, currentYear);
                                                                    
                                                                    if (numValue <= maxDayForCurrentMonth) {
                                                                        form.setFieldValue([`guests_${index}`, 'birth_day'], numValue);
                                                                        setTimeout(() => {
                                                                            const formElement = document.querySelector(`form`);
                                                                            if (formElement) {
                                                                                const monthSelects = formElement.querySelectorAll('.ant-select');
                                                                                const monthSelect = monthSelects[index * 3 + 1]?.querySelector('.ant-select-selector') as HTMLElement;
                                                                                if (monthSelect) {
                                                                                    monthSelect.focus();
                                                                                    monthSelect.click();
                                                                                }
                                                                            }
                                                                        }, 100);
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        name={[`guests_${index}`, 'birth_month']}
                                                        noStyle
                                                        rules={[{ required: true, message: 'Chọn tháng' }]}
                                                    >
                                                        <Select
                                                            placeholder="Tháng"
                                                            options={generateMonthOptions()}
                                                            style={{ width: '34%' }}
                                                            onChange={(value) => {
                                                                const currentDay = getFieldValue([`guests_${index}`, 'birth_day']);
                                                                const newYear = getFieldValue([`guests_${index}`, 'birth_year']);
                                                                const maxDayForMonth = getMaxDayForMonth(value, newYear);
                                                                
                                                                // Validate và điều chỉnh ngày nếu cần
                                                                if (currentDay && currentDay > maxDayForMonth) {
                                                                    form.setFieldValue([`guests_${index}`, 'birth_day'], maxDayForMonth);
                                                                }
                                                                
                                                                // Tự động focus sang năm
                                                                setTimeout(() => {
                                                                    const formElement = document.querySelector(`form`);
                                                                    if (formElement) {
                                                                        const yearSelects = formElement.querySelectorAll('.ant-select');
                                                                        // Tìm select thứ 3 trong Space.Compact (select năm)
                                                                        const yearSelect = yearSelects[index * 3 + 2]?.querySelector('.ant-select-selector') as HTMLElement;
                                                                        if (yearSelect) {
                                                                            yearSelect.focus();
                                                                            yearSelect.click();
                                                                        }
                                                                    }
                                                                }, 150);
                                                            }}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        name={[`guests_${index}`, 'birth_year']}
                                                        noStyle
                                                        dependencies={[[`guests_${index}`, 'identity_type'], [`guests_${index}`, 'birth_day'], [`guests_${index}`, 'birth_month']]}
                                                        rules={[
                                                            { required: true, message: 'Chọn năm' },
                                                            ({ getFieldValue }) => ({
                                                                validator: () => {
                                                                    const identityType = getFieldValue([`guests_${index}`, 'identity_type']);
                                                                    const birthDay = getFieldValue([`guests_${index}`, 'birth_day']);
                                                                    const birthMonth = getFieldValue([`guests_${index}`, 'birth_month']);
                                                                    const birthYear = getFieldValue([`guests_${index}`, 'birth_year']);
                                                                    
                                                                    // Validate năm
                                                                    if (birthYear) {
                                                                        const currentYear = dayjs().year();
                                                                        const minYear = currentYear - 100;
                                                                        if (birthYear < minYear || birthYear > currentYear) {
                                                                            return Promise.reject('Năm không hợp lệ');
                                                                        }
                                                                    }
                                                                    
                                                                    // Validate ngày với tháng và năm
                                                                    if (birthDay && birthMonth && birthYear) {
                                                                        const maxDayForMonth = getMaxDayForMonth(birthMonth, birthYear);
                                                                        if (birthDay > maxDayForMonth) {
                                                                            return Promise.reject(`Tháng ${birthMonth} năm ${birthYear} chỉ có tối đa ${maxDayForMonth} ngày`);
                                                                        }
                                                                    }
                                                                    
                                                                    // Chỉ validate nếu đã có đủ thông tin và đã chọn loại giấy tờ
                                                                    if (identityType && birthDay && birthMonth && birthYear) {
                                                                        const day = String(birthDay).padStart(2, '0');
                                                                        const month = String(birthMonth).padStart(2, '0');
                                                                        const dateOfBirth = `${birthYear}-${month}-${day}`;
                                                                        
                                                                        return validateDateOfBirth(identityType)({}, dateOfBirth);
                                                                    }
                                                                    return Promise.resolve();
                                                                },
                                                            }),
                                                        ]}
                                                    >
                                                        <Select
                                                            placeholder="Năm"
                                                            options={generateYearOptions()}
                                                            showSearch
                                                            optionFilterProp="label"
                                                            style={{ width: '33%' }}
                                                            onChange={() => {
                                                                const currentDay = getFieldValue([`guests_${index}`, 'birth_day']);
                                                                const newMonth = form.getFieldValue([`guests_${index}`, 'birth_month']);
                                                                const newYear = form.getFieldValue([`guests_${index}`, 'birth_year']);
                                                                const maxDayForMonth = getMaxDayForMonth(newMonth, newYear);
                                                                
                                                                // Validate và điều chỉnh ngày nếu cần
                                                                if (currentDay && currentDay > maxDayForMonth) {
                                                                    form.setFieldValue([`guests_${index}`, 'birth_day'], maxDayForMonth);
                                                                }
                                                            }}
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
                                    <Select 
                                        placeholder="Chọn loại giấy tờ"
                                        onChange={() => {
                                            // Clear and revalidate identity_number when type changes
                                            form.validateFields([[`guests_${index}`, 'identity_number']]);
                                            // Validate ngày sinh khi thay đổi loại giấy tờ
                                            form.validateFields([[`guests_${index}`, 'birth_year']]);
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
                            name={[`guests_${index}`, 'identity_images']}
                            label="Ảnh giấy tờ"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng upload ít nhất 1 ảnh giấy tờ',
                                },
                                {
                                    validator: (_: any, fileList: UploadFile[]) => {
                                        if (!fileList || fileList.length === 0) {
                                            return Promise.reject('Vui lòng upload ít nhất 1 ảnh giấy tờ');
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                            extra="Có thể upload nhiều ảnh (mặt trước và mặt sau CCCD/Hộ chiếu)"
                        >
                            <Upload
                                listType="picture-card"
                                maxCount={5}
                                beforeUpload={() => false} // Prevent auto upload
                                accept="image/*"
                                showUploadList={{
                                    showPreviewIcon: true,
                                    showRemoveIcon: true,
                                }}
                            >
                                {(form.getFieldValue([`guests_${index}`, 'identity_images'])?.length || 0) < 5 && (
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                )}
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

