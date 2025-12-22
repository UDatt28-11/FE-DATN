import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Input,
  Button,
  Space,
  Tag,
  Tooltip,
  Tabs,
  Image,
  Modal,
  Spin,
} from "antd";
import { toast } from "react-toastify";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  HistoryOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";

import AddCategory from "./addcategory";
import EditCategory from "./editcategory";
import DetailCategory from "./detailcategory";
import type { RoomType } from "../../../types/roomtype/roomtype";
import roomtypeService from "../../../service/roomtypeService";
import roomService from "../../../service/roomService";
import supplyService from "../../../service/supplyService";

const { confirm } = Modal;

const ListCategory: React.FC = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [historyRoomTypes, setHistoryRoomTypes] = useState<RoomType[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(15);
  const [activeTab, setActiveTab] = useState<string>("list");
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 15,
  });

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);
  const [autoOpenAddRoom, setAutoOpenAddRoom] = useState<boolean>(false);

  // Load room types
  const loadRoomTypes = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const response = await roomtypeService.getRoomTypes({
        page,
        per_page: pageSize,
        search: search || undefined,
      });
      if (response.success) {
        setRoomTypes(Array.isArray(response.data) ? response.data : []);
        if (response.meta?.pagination) {
          setPagination({
            current: response.meta.pagination.current_page,
            total: response.meta.pagination.total,
            pageSize: response.meta.pagination.per_page,
          });
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tải danh sách loại phòng");
    } finally {
      setLoading(false);
    }
  };

  // Load history
  const loadHistory = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const response = await roomtypeService.getHistory({
        page,
        per_page: pageSize,
        search: search || undefined,
      });
      if (response.success) {
        setHistoryRoomTypes(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tải lịch sử");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "list") {
      loadRoomTypes(1, searchText);
    } else {
      loadHistory(1, searchText);
    }
  }, [activeTab, searchText, pageSize]);

  // Xóa room type
  const handleDeleteRoomType = async (record: RoomType) => {
    confirm({
      title: `Bạn có chắc muốn xóa loại phòng "${record.name}"?`,
      icon: <ExclamationCircleOutlined />,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          const response = await roomtypeService.deleteRoomType(record.id);
          if (response.success) {
            toast.success(`Đã xóa loại phòng "${record.name}"`);
            loadRoomTypes(pagination.current, searchText);
          } else {
            toast.error(response.message || "Có lỗi xảy ra khi xóa");
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa");
        }
      },
    });
  };

  const getStatusTag = (status: string) =>
    status === "active" ? (
      <Tag icon={<CheckCircleOutlined />} color="success">
        Kích hoạt
      </Tag>
    ) : (
      <Tag icon={<CloseCircleOutlined />} color="default">
        Khóa
      </Tag>
    );

  const tablePagination: TablePaginationConfig = {
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: pagination.total,
    showSizeChanger: true,
    pageSizeOptions: ["15", "30", "45"],
    onShowSizeChange: (_, size) => {
      setPageSize(size);
      setPagination({ ...pagination, pageSize: size });
    },
    onChange: (page) => {
      if (activeTab === "list") {
        loadRoomTypes(page, searchText);
      } else {
        loadHistory(page, searchText);
      }
    },
    showTotal: (total) => `Tổng ${total} loại phòng`,
  };

  const columns: ColumnsType<RoomType> = [
    { title: "ID", dataIndex: "id", key: "id", width: 60, align: "center" },
    {
      title: "Hình ảnh",
      dataIndex: "image_url",
      key: "image_url",
      width: 80,
      align: "center",
      render: (image: string) => (
        <Image
          src={image || "https://via.placeholder.com/48"}
          alt="roomtype"
          width={48}
          height={48}
          style={{ objectFit: "cover", borderRadius: 8 }}
          preview={false}
        />
      ),
    },
    {
      title: "Tên loại phòng",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Giá / đêm",
      dataIndex: "base_price",
      key: "base_price",
      width: 130,
      render: (price?: number) => (
        <span style={{ whiteSpace: "nowrap", fontWeight: 500 }}>
          {price != null ? price.toLocaleString("vi-VN") : "0"} ₫
        </span>
      ),
    },
    {
      title: "Sức chứa",
      key: "capacity",
      width: 110,
      render: (_, record) => (
        <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>
          {(record.max_adults ?? 0)} NL, {(record.max_children ?? 0)} TE
        </span>
      ),
    },
    {
      title: "Property",
      dataIndex: "property",
      key: "property",
      width: 180,
      ellipsis: true,
      render: (property: RoomType["property"]) => property?.name || "-",
    },
    {
      title: "Dịch vụ",
      dataIndex: "services",
      key: "services",
      width: 200,
      render: (services: RoomType["services"]) => {
        if (!services || services.length === 0) {
          return <Tag color="default">Chưa có dịch vụ</Tag>;
        }
        return (
          <Space size={[4, 4]} wrap>
            {services.slice(0, 2).map((service) => (
              <Tag key={service.id} color="blue">
                {service.name}
              </Tag>
            ))}
            {services.length > 2 && (
              <Tag color="default">+{services.length - 2}</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: getStatusTag,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết loại phòng">
            <Button
              size="small"
              icon={<EyeOutlined />}
              type="default"
              onClick={() => {
                setSelectedRoomType(record);
                setDetailModalVisible(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa loại phòng">
            <Button
              size="small"
              icon={<EditOutlined />}
              type="primary"
              onClick={() => {
                setSelectedRoomType(record);
                setEditModalVisible(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Xóa loại phòng">
            <Button
              size="small"
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDeleteRoomType(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const tabsItems = [
    {
      key: "list",
      label: (
        <span>
          <HomeOutlined /> Danh sách loại phòng
        </span>
      ),
      children: (
        <Card
          title={
            <Space>
              <HomeOutlined style={{ fontSize: 20, color: "#1890ff" }} />
              Quản lý Loại Phòng
            </Space>
          }
          extra={
            <Space>
              <Input
                placeholder="Tìm kiếm..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ width: 250 }}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAddModalVisible(true)}
              >
                Thêm loại phòng
              </Button>
            </Space>
          }
        >
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={roomTypes}
              pagination={tablePagination}
              rowKey={(record) => record.id}
            />
          </Spin>
        </Card>
      ),
    },
    {
      key: "history",
      label: (
        <span>
          <HistoryOutlined /> Lịch sử ({historyRoomTypes.length})
        </span>
      ),
      children: (
        <Card
          title={
            <Space>
              <HistoryOutlined style={{ fontSize: 20, color: "#ff4d4f" }} />
              Lịch sử Loại Phòng
            </Space>
          }
        >
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={historyRoomTypes}
              pagination={tablePagination}
              rowKey={(record) => record.id}
            />
          </Spin>
        </Card>
      ),
    },
  ];

  const handleAddRoomType = async (
    values: any,
    fileList: any[],
    selectedAmenities: number[]
  ) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      // property_id là required, phải có giá trị
      if (!values.property_id) {
        toast.error("Vui lòng chọn cơ sở lưu trú!");
        return;
      }
      // Giá & sức chứa (required fields)
      // base_price và max_adults là required, luôn phải có giá trị
      formData.append("base_price", String(values.base_price ?? 0));
      formData.append("max_adults", String(values.max_adults ?? 1));
      if (values.max_children != null) {
        formData.append("max_children", String(values.max_children));
      }
      // Dịch vụ áp dụng (nếu có)
      // Laravel nhận array từ FormData với format service_ids[]
      if (Array.isArray(values.service_ids) && values.service_ids.length > 0) {
        values.service_ids.forEach((id: number) => {
          formData.append("service_ids[]", String(id));
        });
      }
      // Nếu không có service_ids, không append gì (nullable trong backend)
      formData.append("property_id", values.property_id.toString());

      // Xử lý file upload - chỉ append nếu có file hợp lệ
      // image_file là nullable, nên không có file cũng OK
      if (fileList && fileList.length > 0 && fileList[0]) {
        const file = fileList[0];
        // Ant Design Upload: file có thể là originFileObj hoặc file trực tiếp
        const fileToUpload = file.originFileObj || file;
        
        // Chỉ append nếu là File instance hợp lệ và có size > 0
        if (fileToUpload instanceof File && fileToUpload.size > 0) {
          // Kiểm tra file type/extension để đảm bảo hợp lệ
          const fileName = fileToUpload.name || '';
          const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
          const validExtensions = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
          
          if (validExtensions.includes(fileExtension)) {
            formData.append("image_file", fileToUpload);
            console.log('File appended to FormData:', {
              name: fileToUpload.name,
              type: fileToUpload.type,
              size: fileToUpload.size,
              extension: fileExtension,
            });
          } else {
            console.warn('Invalid file extension:', {
              fileName,
              extension: fileExtension,
              validExtensions,
            });
            toast.error(`File không hợp lệ. Chỉ chấp nhận: ${validExtensions.join(', ')}`);
            return; // Dừng lại, không gửi request
          }
        } else {
          console.warn('File is not a valid File instance:', {
            isFile: fileToUpload instanceof File,
            size: fileToUpload?.size,
            type: typeof fileToUpload,
          });
          // Nếu file không hợp lệ nhưng user đã chọn, báo lỗi
          if (file.status !== 'removed') {
            toast.error('File không hợp lệ. Vui lòng chọn file ảnh khác.');
            return;
          }
        }
      }

      // Debug: Log dữ liệu gửi lên
      console.log('FormData values:', {
        name: values.name,
        description: values.description,
        property_id: values.property_id,
        base_price: values.base_price,
        max_adults: values.max_adults,
        max_children: values.max_children,
        service_ids: values.service_ids,
        has_file: fileList && fileList.length > 0,
      });

      const response = await roomtypeService.createRoomType(formData);
      if (response.success) {
        toast.success("Đã thêm loại phòng mới!");
        setAddModalVisible(false);

        const created = (response.data as RoomType) || null;

        // Nếu có cấu hình tạo phòng nhanh, tiến hành tạo phòng + vật tư trên backend
        const quickRooms = Array.isArray(values.quick_rooms) ? values.quick_rooms : [];
        if (created && created.id && quickRooms.length > 0) {
          try {
            for (const quick of quickRooms) {
              const roomPayload = {
                property_id: created.property_id!,
                room_type_id: created.id,
                name: quick.name as string,
                description: quick.description || values.description || created.description || "",
                // dùng lại thông tin sức chứa & giá từ form room type
                max_adults: values.max_adults,
                max_children: values.max_children ?? 0,
                price_per_night: values.base_price,
                status: "available" as const,
                verification_status: "verified" as const,
                amenities: [] as number[],
              };

              const roomRes = await roomService.createRoom(roomPayload);
              if (roomRes.success && roomRes.data) {
                const roomId = roomRes.data.id;
                // Nếu cấu hình vật tư nhanh: supplies là mảng object
                const quickSupplies = Array.isArray(quick.supplies) ? quick.supplies : [];
                for (const s of quickSupplies) {
                  if (!s?.name) continue;
                  await supplyService.create({
                    room_id: roomId,
                    name: s.name,
                    description: "",
                    category: "Khác",
                    unit: s.unit || "cái",
                    current_stock: s.quantity ?? 0,
                    min_stock_level: 0,
                    max_stock_level: s.quantity ?? 0,
                    unit_price: s.unit_price ?? 0,
                    status: "active",
                  } as any);
                }
              }
            }
          } catch (err: any) {
            console.error("Lỗi khi tạo phòng/vật tư nhanh:", err);
            toast.error("Loại phòng đã tạo, nhưng có lỗi khi tạo phòng/vật tư nhanh.");
          }
        }

        if (created && created.id) {
          setSelectedRoomType(created);
          setAutoOpenAddRoom(false); // không cần auto mở nữa vì đã tạo sẵn phòng
          setDetailModalVisible(true);
        }

        // Reload danh sách
        loadRoomTypes(pagination.current, searchText);
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi thêm");
      }
    } catch (error: any) {
      console.error('Error creating room type:', error);
      console.error('Error response:', error.response?.data);
      // Hiển thị lỗi validation chi tiết nếu có
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        console.error('Validation errors:', errors);
        const errorMessages = Object.values(errors).flat();
        toast.error(errorMessages.join(', '));
      } else {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm");
      }
    }
  };

  const handleUpdateRoomType = async (
    values: any,
    fileList: any[],
    selectedAmenities: number[]
  ) => {
    if (!selectedRoomType) return;
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("status", values.status || "active");
      // property_id là required
      if (!values.property_id) {
        toast.error("Vui lòng chọn cơ sở lưu trú!");
        return;
      }
      // Giá & sức chứa (required fields)
      // base_price và max_adults là required, luôn phải có giá trị
      if (values.base_price != null) {
        formData.append("base_price", String(values.base_price));
      }
      if (values.max_adults != null) {
        formData.append("max_adults", String(values.max_adults));
      }
      if (values.max_children != null) {
        formData.append("max_children", String(values.max_children));
      }
      if (Array.isArray(values.service_ids)) {
        values.service_ids.forEach((id: number) => {
          formData.append("service_ids[]", String(id));
        });
      }
      formData.append("property_id", values.property_id.toString());

      // Images are now handled directly in EditCategory component
      // No need to append image_file here anymore
      formData.append("_method", "PUT");

      const response = await roomtypeService.updateRoomType(selectedRoomType.id, formData);
      if (response.success) {
        // Success message is already shown in EditCategory
        setEditModalVisible(false);
        loadRoomTypes(pagination.current, searchText);
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi cập nhật");
      }
    } catch (error: any) {
      console.error('Error updating room type:', error);
      // Hiển thị lỗi validation chi tiết nếu có
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        toast.error(errorMessages.join(', '));
      } else {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật");
      }
    }
  };

  return (
    <>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabsItems} />

      {/* --- MODALS --- */}
      <AddCategory
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onAdd={handleAddRoomType}
      />

      <EditCategory
        visible={editModalVisible}
        roomType={selectedRoomType}
        onCancel={() => setEditModalVisible(false)}
        onUpdate={handleUpdateRoomType}
      />

      <DetailCategory
        visible={detailModalVisible}
        roomType={selectedRoomType}
        onClose={() => {
          setDetailModalVisible(false);
          setAutoOpenAddRoom(false);
        }}
        onEdit={(rt) => {
          setSelectedRoomType(rt);
          setEditModalVisible(true);
        }}
        autoOpenAddRoom={autoOpenAddRoom}
        onAutoAddRoomHandled={() => setAutoOpenAddRoom(false)}
      />
    </>
  );
};

export default ListCategory;
