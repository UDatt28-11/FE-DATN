import React, { useState, useEffect } from "react";
import { Modal, Row, Col, Typography, Image, Descriptions, Space, Button, Tag, Spin, Empty } from "antd";
import { EyeOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined, PictureOutlined } from "@ant-design/icons";
import type { RoomType } from "../../../types/roomtype/roomtype";
import roomService from "../../../service/roomService";
import axios from "../../../service/axiosConfig";

const { Title, Paragraph } = Typography;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface RoomImage {
    id: number;
    image_url: string;
    is_primary?: boolean;
}

interface DetailCategoryProps {
    visible: boolean;
    roomType: RoomType | null;
    onClose: () => void;
    onEdit: (roomType: RoomType) => void;
}

const DetailCategory: React.FC<DetailCategoryProps> = ({ visible, roomType, onClose, onEdit }) => {
    const [roomImages, setRoomImages] = useState<RoomImage[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);

    useEffect(() => {
        if (visible && roomType) {
            loadRoomImages();
        } else {
            setRoomImages([]);
        }
    }, [visible, roomType]);

    const loadRoomImages = async () => {
        if (!roomType) return;
        
        setLoadingImages(true);
        try {
            // Load roomType với images
            const response = await axios.get(`${API_URL}/admin/room-types/${roomType.id}`);
            
            if (response.data.success && response.data.data) {
                const roomTypeData = response.data.data;
                const allImages: RoomImage[] = [];
                
                // Lấy ảnh từ roomType.images
                if (roomTypeData.images && Array.isArray(roomTypeData.images)) {
                    allImages.push(...roomTypeData.images.map((img: any) => ({
                        id: img.id,
                        image_url: img.image_url,
                        is_primary: img.is_primary || false,
                    })));
                }
                
                // Thêm ảnh chính của room type nếu có và chưa có trong images
                if (roomTypeData.image_url && !allImages.some(img => img.image_url === roomTypeData.image_url)) {
                    allImages.unshift({
                        id: 0,
                        image_url: roomTypeData.image_url,
                        is_primary: true,
                    });
                }
                
                setRoomImages(allImages);
            }
        } catch (error) {
            console.error("Error loading room type images:", error);
        } finally {
            setLoadingImages(false);
        }
    };

    if (!roomType) return null;

    return (
        <Modal
            title={<Space><EyeOutlined />Chi tiết loại phòng</Space>}
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>Đóng</Button>,
                <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => onEdit(roomType)}>Chỉnh sửa</Button>
            ]}
            width={900}
        >
            <Row gutter={24}>
                <Col span={10}>
                    <Image 
                        src={roomType.image_url || "https://via.placeholder.com/300"} 
                        alt={roomType.name} 
                        style={{ borderRadius: 12, width: "100%", marginBottom: 16 }} 
                        preview={{
                            src: roomType.image_url || "https://via.placeholder.com/300"
                        }}
                    />
                </Col>
                <Col span={14}>
                    <Title level={3}>{roomType.name}</Title>
                    <Paragraph style={{ marginTop: 16 }}>{roomType.description || "Chưa có mô tả"}</Paragraph>
                    <Descriptions column={1} bordered size="small" style={{ marginTop: 20 }}>
                        <Descriptions.Item label="ID">{roomType.id}</Descriptions.Item>
                        <Descriptions.Item label="Property">
                            {roomType.property?.name || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            {roomType.status === "active" ? (
                                <Tag icon={<CheckCircleOutlined />} color="success">
                                    Kích hoạt
                                </Tag>
                            ) : (
                                <Tag icon={<CloseCircleOutlined />} color="default">
                                    Khóa
                                </Tag>
                            )}
                        </Descriptions.Item>
                        {roomType.created_at && (
                            <Descriptions.Item label="Ngày tạo">
                                {new Date(roomType.created_at).toLocaleDateString("vi-VN")}
                            </Descriptions.Item>
                        )}
                        {roomType.updated_at && (
                            <Descriptions.Item label="Cập nhật">
                                {new Date(roomType.updated_at).toLocaleDateString("vi-VN")}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </Col>
            </Row>
            
            {/* Album hình ảnh */}
            <div style={{ marginTop: 24 }}>
                <Title level={4}>
                    <PictureOutlined /> Album hình ảnh
                </Title>
                <Spin spinning={loadingImages}>
                    {roomImages.length > 0 ? (
                        <Row gutter={[8, 8]}>
                            {roomImages.map((img, index) => (
                                <Col key={img.id || index} span={6}>
                                    <div style={{ position: 'relative' }}>
                                        <Image
                                            src={img.image_url}
                                            alt={`${roomType.name} - ${index + 1}`}
                                            style={{ 
                                                borderRadius: 8, 
                                                width: '100%',
                                                height: 120,
                                                objectFit: 'cover'
                                            }}
                                            preview={{
                                                src: img.image_url
                                            }}
                                        />
                                        {img.is_primary && (
                                            <Tag 
                                                color="gold" 
                                                style={{ 
                                                    position: 'absolute', 
                                                    top: 4, 
                                                    left: 4,
                                                    margin: 0
                                                }}
                                            >
                                                Chính
                                            </Tag>
                                        )}
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        !loadingImages && (
                            <Empty 
                                description="Chưa có hình ảnh" 
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )
                    )}
                </Spin>
            </div>
        </Modal>
    );
};

export default DetailCategory;
