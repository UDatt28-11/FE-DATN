import React, { useState, useEffect } from "react";
import { Modal, Row, Col, Typography, Image, Descriptions, Space, Button, Tag, Spin, Empty, Table, Divider, Tooltip, Upload } from "antd";
import { EyeOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined, PictureOutlined, HomeOutlined, PlusOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { toast } from "react-toastify";
import type { RoomType } from "../../../types/roomtype/roomtype";
import type { Room } from "../../../types/room/room";
import roomService from "../../../service/roomService";
import axios from "../../../service/axiosConfig";
import roomtypeService from "../../../service/roomtypeService";
import AddRoom from "../quanliphong/addroom";
import EditRoom from "../quanliphong/editroom";
import type { Supply } from "../../../types/supply/supplies";
import supplyService from "../../../service/supplyService";
import AddSupply from "../quanlivattu/addsupply";
import EditSupply from "../quanlivattu/editsupply";
import ViewSupply from "../quanlivattu/viewsupply";

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
    /** Khi mở từ thêm mới, tự động bật modal Thêm phòng một lần */
    autoOpenAddRoom?: boolean;
    onAutoAddRoomHandled?: () => void;
}

const DetailCategory: React.FC<DetailCategoryProps> = ({
    visible,
    roomType,
    onClose,
    onEdit,
    autoOpenAddRoom,
    onAutoAddRoomHandled,
}) => {
    const [roomImages, setRoomImages] = useState<RoomImage[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    
    // State cho Add/Edit Room
    const [addRoomVisible, setAddRoomVisible] = useState(false);
    const [editRoomVisible, setEditRoomVisible] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    // State cho quản lý vật tư theo phòng (modal lồng trong modal)
    const [suppliesModalVisible, setSuppliesModalVisible] = useState(false);
    const [selectedRoomForSupplies, setSelectedRoomForSupplies] = useState<Room | null>(null);
    const [roomSupplies, setRoomSupplies] = useState<Supply[]>([]);
    const [loadingSupplies, setLoadingSupplies] = useState(false);
    const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
    const [addSupplyVisible, setAddSupplyVisible] = useState(false);
    const [editSupplyVisible, setEditSupplyVisible] = useState(false);
    const [viewSupplyVisible, setViewSupplyVisible] = useState(false);
    const [uploadingRoomImages, setUploadingRoomImages] = useState(false);

    useEffect(() => {
        if (visible && roomType) {
            loadRoomImages();
            loadRooms();
            // Nếu được yêu cầu auto-open AddRoom (trường hợp vừa tạo mới)
            if (autoOpenAddRoom) {
                setAddRoomVisible(true);
                onAutoAddRoomHandled && onAutoAddRoomHandled();
            }
        } else {
            setRoomImages([]);
            setRooms([]);
        }
    }, [visible, roomType, autoOpenAddRoom, onAutoAddRoomHandled]);

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

    const loadRooms = async () => {
        if (!roomType) return;
        
        setLoadingRooms(true);
        try {
            const response = await roomService.getRooms({
                room_type_id: roomType.id,
                per_page: 100, // Lấy tất cả phòng thuộc loại phòng này
            });
            
            if (response.success) {
                setRooms(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error("Error loading rooms:", error);
        } finally {
            setLoadingRooms(false);
        }
    };

    // Load supplies theo phòng
    const loadSuppliesForRoom = async (roomId: number) => {
        setLoadingSupplies(true);
        try {
            const supplies = await supplyService.getByRoom(roomId);
            setRoomSupplies(supplies);
        } catch (error: any) {
            console.error("Error loading supplies for room:", error);
            toast.error(error.response?.data?.message || "Không thể tải danh sách vật tư của phòng");
            setRoomSupplies([]);
        } finally {
            setLoadingSupplies(false);
        }
    };

    // Xử lý sửa phòng
    const handleEditRoom = async (room: Room) => {
        try {
            // Fetch room với đầy đủ thông tin
            const response = await roomService.getRoomById(room.id, 'property,roomType,roomType.images,amenities');
            if (response.success && response.data) {
                setSelectedRoom(response.data);
                setEditRoomVisible(true);
            } else {
                toast.error("Không thể tải thông tin phòng");
            }
        } catch (error) {
            console.error("Error loading room:", error);
            toast.error("Không thể tải thông tin phòng");
        }
    };

    // Xử lý xóa phòng
    const handleDeleteRoom = (room: Room) => {
        Modal.confirm({
            title: "Xóa phòng",
            content: `Bạn có chắc muốn xóa phòng "${room.name}"?`,
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            async onOk() {
                try {
                    const response = await roomService.deleteRoom(room.id);
                    if (response.success) {
                        toast.success(`Đã xóa phòng "${room.name}"`);
                        loadRooms();
                    } else {
                        toast.error(response.message || "Có lỗi xảy ra khi xóa");
                    }
                } catch (error: any) {
                    toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa");
                }
            },
        });
    };

    // Cột cho bảng phòng (chỉ hiển thị thông tin riêng của từng phòng,
    // không lặp lại giá / sức chứa vì đó là thông tin chung của room type)
    const roomColumns: ColumnsType<Room> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 60,
            render: (id) => <>#{id}</>,
        },
        {
            title: "Tên phòng",
            dataIndex: "name",
            key: "name",
            ellipsis: true,
        },
        {
            title: "Tầng",
            dataIndex: "floor_number",
            key: "floor_number",
            width: 80,
            render: (floor) => floor ?? "-",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 110,
            render: (status: string) => {
                const statusMap: Record<string, { color: string; text: string }> = {
                    available: { color: "success", text: "Có sẵn" },
                    maintenance: { color: "warning", text: "Bảo trì" },
                    occupied: { color: "error", text: "Đã thuê" },
                };
                const statusInfo = statusMap[status] || { color: "default", text: status };
                return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
            },
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 180,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem & quản lý vật tư trong phòng này">
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => {
                                setSelectedRoomForSupplies(record);
                                setSuppliesModalVisible(true);
                                loadSuppliesForRoom(record.id);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Sửa phòng">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditRoom(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa phòng">
                        <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteRoom(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

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
            width={1000}
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
                        <Descriptions.Item label="Giá / đêm">
                            <strong>
                                {(roomType.base_price ?? 0).toLocaleString("vi-VN")} ₫
                            </strong>
                        </Descriptions.Item>
                        <Descriptions.Item label="Sức chứa chuẩn">
                            {(roomType.max_adults ?? 0)} người lớn, {(roomType.max_children ?? 0)} trẻ em
                        </Descriptions.Item>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={4} style={{ margin: 0 }}>
                        <PictureOutlined /> Album hình ảnh
                    </Title>
                    <Upload
                        multiple
                        showUploadList={false}
                        disabled={uploadingRoomImages}
                        beforeUpload={async (file) => {
                            const formData = new FormData();
                            formData.append("images[]", file);
                            setUploadingRoomImages(true);
                            try {
                                const res = await roomtypeService.uploadImages(roomType.id, formData);
                                if (res.success) {
                                    toast.success("Đã thêm ảnh vào album");
                                    loadRoomImages();
                                } else {
                                    toast.error("Không thể tải ảnh, vui lòng thử lại");
                                }
                            } catch (error: any) {
                                console.error("Error uploading room type image:", error);
                                toast.error(error.response?.data?.message || "Có lỗi khi tải ảnh");
                            } finally {
                                setUploadingRoomImages(false);
                            }
                            return false;
                        }}
                    >
                        <Button icon={<UploadOutlined />} loading={uploadingRoomImages}>
                            Thêm ảnh nhanh
                        </Button>
                    </Upload>
                </div>
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

            <Divider />

            {/* Danh sách phòng thuộc loại phòng này */}
            <div style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Title level={4} style={{ margin: 0 }}>
                        <HomeOutlined /> Danh sách phòng ({rooms.length})
                    </Title>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => setAddRoomVisible(true)}
                    >
                        Thêm phòng
                    </Button>
                </div>
                <Spin spinning={loadingRooms}>
                    {rooms.length > 0 ? (
                        <Table
                            columns={roomColumns}
                            dataSource={rooms}
                            rowKey="id"
                            size="small"
                            pagination={{ pageSize: 5, showSizeChanger: false }}
                            scroll={{ x: 700 }}
                        />
                    ) : (
                        !loadingRooms && (
                            <Empty 
                                description="Chưa có phòng nào thuộc loại phòng này" 
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )
                    )}
                </Spin>
            </div>

            {/* Modal thêm phòng */}
            <AddRoom
                visible={addRoomVisible}
                onClose={() => {
                    setAddRoomVisible(false);
                    loadRooms(); // Reload danh sách phòng
                }}
                initialRoomTypeId={roomType?.id}
                initialPropertyId={roomType?.property_id}
            />

            {/* Modal sửa phòng */}
            {selectedRoom && (
                <EditRoom
                    visible={editRoomVisible}
                    room={selectedRoom}
                    onClose={() => {
                        setEditRoomVisible(false);
                        setSelectedRoom(null);
                        loadRooms(); // Reload danh sách phòng
                    }}
                />
            )}

            {/* Modal quản lý vật tư theo từng phòng - lồng bên trong modal loại phòng */}
            <Modal
                title={
                    <Space>
                        <EyeOutlined />
                        <span>
                            Vật tư trong phòng{" "}
                            <strong>{selectedRoomForSupplies?.name || ""}</strong>
                        </span>
                    </Space>
                }
                open={suppliesModalVisible}
                onCancel={() => {
                    setSuppliesModalVisible(false);
                    setSelectedRoomForSupplies(null);
                    setRoomSupplies([]);
                }}
                footer={null}
                width={900}
            >
                <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
                    <div>
                        <span>
                            Phòng: <strong>{selectedRoomForSupplies?.name}</strong>
                        </span>
                        <br />
                        <span>
                            Tầng:{" "}
                            {selectedRoomForSupplies?.floor_number ?? "-"}
                        </span>
                    </div>
                    <Space>
                        {/* Upload ảnh nhanh cho phòng (thực chất là ảnh loại phòng) */}
                        {roomType && (
                            <Upload
                                multiple
                                showUploadList={false}
                                beforeUpload={async (file) => {
                                    if (!roomType) return false;
                                    const formData = new FormData();
                                    formData.append("images[]", file);
                                    setUploadingRoomImages(true);
                                    try {
                                        const res = await roomtypeService.uploadImages(roomType.id, formData);
                                        if (res.success) {
                                            toast.success("Đã tải lên 1 ảnh cho loại phòng");
                                            // Refresh danh sách ảnh ở modal loại phòng
                                            loadRoomImages();
                                        } else {
                                            toast.error("Không thể tải ảnh, vui lòng thử lại");
                                        }
                                    } catch (error: any) {
                                        console.error("Error uploading room image:", error);
                                        toast.error(error.response?.data?.message || "Có lỗi khi tải ảnh");
                                    } finally {
                                        setUploadingRoomImages(false);
                                    }
                                    return false; // ngăn antd tự upload
                                }}
                            >
                                <Button icon={<UploadOutlined />} loading={uploadingRoomImages}>
                                    Thêm ảnh nhanh
                                </Button>
                            </Upload>
                        )}
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setAddSupplyVisible(true)}
                            disabled={!selectedRoomForSupplies}
                        >
                            Thêm vật tư cho phòng
                        </Button>
                    </Space>
                </div>

                <Spin spinning={loadingSupplies}>
                    {roomSupplies.length > 0 ? (
                        <Table
                            size="small"
                            rowKey="id"
                            dataSource={roomSupplies}
                            pagination={{ pageSize: 8, showSizeChanger: false }}
                            columns={[
                                { title: "ID", dataIndex: "id", width: 70 },
                                { title: "Tên vật tư", dataIndex: "name" },
                                { title: "Loại", dataIndex: "category", width: 140 },
                                { title: "Đơn vị", dataIndex: "unit", width: 90 },
                                {
                                    title: "Tồn kho",
                                    dataIndex: "current_stock",
                                    width: 90,
                                },
                                {
                                    title: "Đơn giá (₫)",
                                    dataIndex: "unit_price",
                                    width: 130,
                                    render: (v: number) =>
                                        v != null ? v.toLocaleString("vi-VN") : "0",
                                },
                                {
                                    title: "Thao tác",
                                    key: "actions",
                                    width: 190,
                                    render: (_: any, record: Supply) => (
                                        <Space size="small">
                                            <Tooltip title="Xem chi tiết vật tư">
                                                <Button
                                                    size="small"
                                                    icon={<EyeOutlined />}
                                                    onClick={() => {
                                                        setSelectedSupply(record);
                                                        setViewSupplyVisible(true);
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip title="Chỉnh sửa vật tư">
                                                <Button
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    onClick={() => {
                                                        setSelectedSupply(record);
                                                        setEditSupplyVisible(true);
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip title="Xóa vật tư">
                                                <Button
                                                    size="small"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => {
                                                        Modal.confirm({
                                                            title: "Xóa vật tư",
                                                            content: `Bạn có chắc muốn xóa vật tư "${record.name}"?`,
                                                            okText: "Xóa",
                                                            okType: "danger",
                                                            cancelText: "Hủy",
                                                            async onOk() {
                                                                try {
                                                                    await supplyService.remove(record.id);
                                                                    toast.success("Đã xóa vật tư");
                                                                    if (selectedRoomForSupplies) {
                                                                        loadSuppliesForRoom(selectedRoomForSupplies.id);
                                                                    }
                                                                } catch (error: any) {
                                                                    toast.error(
                                                                        error.response?.data?.message ||
                                                                            "Không thể xóa vật tư"
                                                                    );
                                                                }
                                                            },
                                                        });
                                                    }}
                                                />
                                            </Tooltip>
                                        </Space>
                                    ),
                                },
                            ]}
                        />
                    ) : (
                        !loadingSupplies && (
                            <Empty
                                description="Chưa có vật tư nào cho phòng này"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )
                    )}
                </Spin>

                {/* Modals thao tác vật tư trong context phòng */}
                {selectedRoomForSupplies && (
                    <AddSupply
                        visible={addSupplyVisible}
                        roomId={selectedRoomForSupplies.id}
                        onCancel={() => setAddSupplyVisible(false)}
                        onAdd={() => {
                            setAddSupplyVisible(false);
                            loadSuppliesForRoom(selectedRoomForSupplies.id);
                        }}
                    />
                )}

                {selectedSupply && (
                    <EditSupply
                        visible={editSupplyVisible}
                        supply={selectedSupply}
                        onCancel={() => {
                            setEditSupplyVisible(false);
                            setSelectedSupply(null);
                        }}
                        onUpdate={() => {
                            setEditSupplyVisible(false);
                            if (selectedRoomForSupplies) {
                                loadSuppliesForRoom(selectedRoomForSupplies.id);
                            }
                        }}
                    />
                )}

                {selectedSupply && (
                    <ViewSupply
                        visible={viewSupplyVisible}
                        onCancel={() => {
                            setViewSupplyVisible(false);
                            setSelectedSupply(null);
                        }}
                        supplyId={selectedSupply.id}
                        supply={selectedSupply}
                    />
                )}
            </Modal>
        </Modal>
    );
};

export default DetailCategory;
