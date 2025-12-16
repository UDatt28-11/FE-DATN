import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Rate,
    Button,
    Upload,
    message,
    Descriptions,
    Image,
    Space,
    Typography,
    Divider,
    Spin,
} from 'antd';
import {
    StarOutlined,
    UploadOutlined,
    CloseOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { Popconfirm } from 'antd';
import reviewService from '../../service/reviewService';
import type { BookingDetail } from '../../types/booking/booking';
import { formatVND } from '../../utils/currency';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface ReviewModalProps {
    open: boolean;
    bookingDetail: BookingDetail | null;
    onCancel: () => void;
    onSuccess: () => void;
    mode?: 'create' | 'edit' | 'view'; // Thêm mode để phân biệt create/edit/view
    reviewId?: number | null; // ID của review nếu đang edit/view
}

const ReviewModal: React.FC<ReviewModalProps> = ({
    open,
    bookingDetail,
    onCancel,
    onSuccess,
    mode = 'create',
    reviewId = null,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [isViewMode, setIsViewMode] = useState(mode === 'view');
    const [currentReview, setCurrentReview] = useState<any>(null);

    // Fetch review data nếu đang ở chế độ edit hoặc view
    useEffect(() => {
        const fetchReview = async () => {
            if (open && bookingDetail && (mode === 'edit' || mode === 'view') && reviewId) {
                try {
                    setLoading(true);
                    const review = await reviewService.getById(reviewId);
                    setCurrentReview(review);
                    
                    // Set view mode dựa trên mode prop
                    setIsViewMode(mode === 'view');
                    
                    // Populate form với dữ liệu review
                    form.setFieldsValue({
                        rating: review.rating,
                        title: review.title,
                        comment: review.comment,
                    });
                    
                    // Set fileList nếu có photos
                    if (review.photos && Array.isArray(review.photos)) {
                        const photos: UploadFile[] = review.photos.map((photo: string, index: number) => ({
                            uid: `-${index}`,
                            name: `photo-${index}.jpg`,
                            status: 'done',
                            url: photo,
                        }));
                        setFileList(photos);
                    }
                } catch (error: any) {
                    console.error('Error fetching review:', error);
                    message.error('Không thể tải thông tin đánh giá');
                } finally {
                    setLoading(false);
                }
            } else if (open && bookingDetail && mode === 'create') {
                form.resetFields();
                setFileList([]);
                setCurrentReview(null);
                setIsViewMode(false);
            }
        };
        
        fetchReview();
    }, [open, bookingDetail, mode, reviewId, form]);

    const handleSubmit = async (values: any) => {
        if (!bookingDetail) {
            message.error('Không tìm thấy thông tin đặt phòng');
            return;
        }

        setLoading(true);
        try {
            const reviewData = {
                rating: values.rating,
                title: values.title,
                comment: values.comment || null,
                photos: fileList
                    .filter((file) => file.status === 'done' && file.url)
                    .map((file) => file.url as string),
            };

            if (mode === 'edit' && reviewId) {
                // Update existing review
                await reviewService.update(reviewId, reviewData);
                message.success('Đánh giá đã được cập nhật');
            } else {
                // Create new review
                await reviewService.create({
                    ...reviewData,
                    booking_details_id: bookingDetail.id,
                });
                message.success('Đánh giá của bạn đã được gửi thành công!');
            }
            
            form.resetFields();
            setFileList([]);
            onSuccess();
            onCancel();
        } catch (error: any) {
            console.error('Error submitting review:', error);
            const errorMessage =
                error.response?.data?.message ||
                'Không thể gửi đánh giá. Vui lòng thử lại.';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!reviewId) return;
        
        setDeleting(true);
        try {
            await reviewService.remove(reviewId);
            message.success('Đánh giá đã được xóa');
            onSuccess();
            onCancel();
        } catch (error: any) {
            console.error('Error deleting review:', error);
            const errorMessage =
                error.response?.data?.message ||
                'Không thể xóa đánh giá. Vui lòng thử lại.';
            message.error(errorMessage);
        } finally {
            setDeleting(false);
        }
    };

    const handleUploadChange: UploadProps['onChange'] = (info) => {
        let newFileList = [...info.fileList];

        // Giới hạn 10 ảnh
        newFileList = newFileList.slice(-10);

        // Chỉ giữ lại các file đã upload thành công
        newFileList = newFileList.map((file) => {
            if (file.response) {
                file.url = file.response.url;
            }
            return file;
        });

        setFileList(newFileList);
    };

    const handleRemove = (file: UploadFile) => {
        const index = fileList.indexOf(file);
        const newFileList = fileList.slice();
        newFileList.splice(index, 1);
        setFileList(newFileList);
    };

    const uploadProps: UploadProps = {
        name: 'file',
        action: '/api/upload', // Cần cập nhật endpoint upload
        headers: {
            authorization: `Bearer ${localStorage.getItem('auth_token') || localStorage.getItem('accessToken')}`,
        },
        listType: 'picture-card',
        maxCount: 10,
        onChange: handleUploadChange,
        onRemove: handleRemove,
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('Chỉ có thể upload ảnh!');
            }
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('Ảnh phải nhỏ hơn 5MB!');
            }
            return isImage && isLt5M;
        },
    };

    if (!bookingDetail) {
        return null;
    }

    const room = bookingDetail.room as any;
    const roomType = room?.roomType;
    const property = room?.property || roomType?.property;

    const getModalTitle = () => {
        if (mode === 'view') return 'Xem đánh giá';
        if (mode === 'edit') return 'Sửa đánh giá';
        return 'Đánh giá phòng';
    };

    return (
        <Modal
            title={getModalTitle()}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={800}
            destroyOnHidden
        >
            <Spin spinning={loading}>
                <div style={{ marginBottom: 24 }}>
                    {/* Thông tin phòng */}
                    <Title level={4} style={{ marginBottom: 16 }}>
                        Thông tin phòng đã đặt
                    </Title>
                    <Descriptions bordered column={2} size="small">
                        {property && (
                            <Descriptions.Item label="Khách sạn">
                                {typeof property === 'string' 
                                    ? property 
                                    : (property?.name || property?.id || 'N/A')}
                            </Descriptions.Item>
                        )}
                        {room && (
                            <Descriptions.Item label="Tên phòng">
                                {room.name}
                            </Descriptions.Item>
                        )}
                        {roomType && (
                            <>
                                <Descriptions.Item label="Loại phòng">
                                    {roomType.name}
                                </Descriptions.Item>
                                {roomType.description && (
                                    <Descriptions.Item label="Mô tả" span={2}>
                                        {roomType.description}
                                    </Descriptions.Item>
                                )}
                                {roomType.max_adults && (
                                    <Descriptions.Item label="Số người tối đa">
                                        {roomType.max_adults} người lớn
                                        {roomType.max_children
                                            ? `, ${roomType.max_children} trẻ em`
                                            : ''}
                                    </Descriptions.Item>
                                )}
                                {roomType.price_per_night && (
                                    <Descriptions.Item label="Giá mỗi đêm">
                                        {formatVND(roomType.price_per_night)}
                                    </Descriptions.Item>
                                )}
                            </>
                        )}
                        <Descriptions.Item label="Ngày check-in">
                            {new Date(
                                bookingDetail.check_in_date
                            ).toLocaleDateString('vi-VN')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày check-out">
                            {new Date(
                                bookingDetail.check_out_date
                            ).toLocaleDateString('vi-VN')}
                        </Descriptions.Item>
                    </Descriptions>

                    {/* Hiển thị ảnh phòng */}
                    {roomType?.images && roomType.images.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <Text strong>Hình ảnh phòng:</Text>
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 8,
                                    marginTop: 8,
                                }}
                            >
                                {roomType.images.slice(0, 5).map((img: any) => (
                                    <Image
                                        key={img.id}
                                        src={img.image_url}
                                        alt={roomType.name}
                                        width={120}
                                        height={80}
                                        style={{
                                            objectFit: 'cover',
                                            borderRadius: 4,
                                        }}
                                        preview
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Divider />

                {/* Form đánh giá */}
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        rating: 5,
                    }}
                >
                    <Form.Item
                        label="Đánh giá"
                        name="rating"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng chọn số sao đánh giá',
                            },
                        ]}
                    >
                        <Rate
                            allowClear
                            disabled={isViewMode}
                            style={{ fontSize: 24 }}
                            character={<StarOutlined />}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Tiêu đề đánh giá"
                        name="title"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập tiêu đề đánh giá',
                            },
                            {
                                max: 100,
                                message: 'Tiêu đề không được quá 100 ký tự',
                            },
                        ]}
                    >
                        <Input
                            placeholder="Ví dụ: Phòng rất đẹp và sạch sẽ"
                            maxLength={100}
                            disabled={isViewMode}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Nội dung đánh giá"
                        name="comment"
                        rules={[
                            {
                                max: 2000,
                                message:
                                    'Nội dung đánh giá không được quá 2000 ký tự',
                            },
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Chia sẻ trải nghiệm của bạn về phòng này..."
                            maxLength={2000}
                            showCount
                            disabled={isViewMode}
                        />
                    </Form.Item>

                    <Form.Item label="Hình ảnh (tối đa 10 ảnh)" name="photos">
                        <Upload {...uploadProps} disabled={isViewMode}>
                            {fileList.length < 10 && !isViewMode && (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                    
                    {/* Hiển thị trạng thái review nếu đang xem */}
                    {isViewMode && currentReview && (
                        <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                            <Text strong>Trạng thái: </Text>
                            <Text>
                                {currentReview.status === 'pending' && 'Đang chờ duyệt'}
                                {currentReview.status === 'approved' && 'Đã được duyệt'}
                                {currentReview.status === 'rejected' && 'Đã bị từ chối'}
                            </Text>
                        </div>
                    )}

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                icon={<StarOutlined />}
                            >
                                Gửi đánh giá
                            </Button>
                            <Button onClick={onCancel}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

export default ReviewModal;

