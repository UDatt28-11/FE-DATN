import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Space,
  Input,
  Button,
  Tooltip,
  Image,
  Tag,
  Spin,
  DatePicker,
  Modal,
  Tabs,
  Select,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  HomeOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import type { Dayjs } from "dayjs";

import type { Room } from "../../../types/room/room";
import roomService from "../../../service/roomService";
import roomtypeService from "../../../service/roomtypeService";
import type { RoomType } from "../../../types/roomtype/roomtype";

import AddRoom from "./addroom";
import EditRoom from "./editroom";

const ListRoom: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]); // Lưu tất cả phòng khi filter theo tab
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [pageSize, setPageSize] = useState<number>(15);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 15,
  });
  const [activeTab, setActiveTab] = useState<string>("all"); // "available", "occupied", "all"
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [roomTypeFilter, setRoomTypeFilter] = useState<number | undefined>(undefined);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Load danh sách loại phòng
  const loadRoomTypes = async () => {
    try {
      const response = await roomtypeService.getRoomTypes({
        per_page: 100,
        status: 'active',
      });
      if (response.success && response.data) {
        setRoomTypes(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error loading room types:", error);
    }
  };

  // Load tất cả phòng (load nhiều lần, mỗi lần 100)
  const loadAllRooms = async (search = "", checkDate?: Dayjs | null, roomTypeId?: number) => {
    setLoading(true);
    try {
      const allRoomsData: Room[] = [];
      let currentPage = 1;
      let hasMore = true;
      const perPage = 100; // Backend chỉ cho phép tối đa 100

      while (hasMore) {
        const params: any = {
          page: currentPage,
          per_page: perPage,
          search: search || undefined,
          room_type_id: roomTypeId,
        };
        
        // Nếu có chọn ngày, thêm check_in parameter
        if (checkDate) {
          const dateStr = checkDate.format('YYYY-MM-DD');
          params.check_in = dateStr;
          params.check_out = dateStr;
        }
        
        const response = await roomService.getRooms(params);
        
        if (response && response.success) {
          const roomsData = Array.isArray(response.data) ? response.data : [];
          allRoomsData.push(...roomsData);
          
          // Kiểm tra xem còn trang nào không
          if (response.meta?.pagination) {
            const totalPages = response.meta.pagination.last_page;
            hasMore = currentPage < totalPages;
            currentPage++;
          } else {
            // Nếu không có pagination info, dừng nếu không có dữ liệu
            hasMore = roomsData.length === perPage;
            currentPage++;
          }
        } else {
          hasMore = false;
        }
      }
      
      setAllRooms(allRoomsData);
    } catch (error: any) {
      console.error('Error loading all rooms:', error);
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi tải danh sách phòng";
      toast.error(errorMessage);
      setAllRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // Load rooms
  const loadRooms = async (page = 1, search = "", perPage?: number, checkDate?: Dayjs | null, loadAll = false, roomTypeId?: number) => {
    if (loadAll) {
      // Load tất cả phòng bằng cách gọi nhiều lần
      await loadAllRooms(search, checkDate, roomTypeId);
      return;
    }
    
    setLoading(true);
    try {
      const params: any = {
        page,
        per_page: perPage || pageSize,
        search: search || undefined,
        room_type_id: roomTypeId,
      };
      
      // Nếu có chọn ngày, thêm check_in parameter (dùng cùng ngày cho check_in và check_out)
      if (checkDate) {
        const dateStr = checkDate.format('YYYY-MM-DD');
        params.check_in = dateStr;
        params.check_out = dateStr;
      }
      
      const response = await roomService.getRooms(params);

      console.log('Rooms API Response:', response);
      if (response && response.success) {
        const roomsData = Array.isArray(response.data) ? response.data : [];
        
        // Dùng pagination từ backend
        setRooms(roomsData);
        if (response.meta?.pagination) {
          setPagination({
            current: response.meta.pagination.current_page,
            total: response.meta.pagination.total,
            pageSize: response.meta.pagination.per_page,
          });
        } else {
          // Fallback nếu không có pagination meta
          setPagination(prev => ({
            ...prev,
            current: page,
          }));
        }
      } else {
        console.error('API returned success=false or invalid response:', response);
        toast.error("Không thể tải danh sách phòng");
        setRooms([]);
      }
    } catch (error: any) {
      console.error('Error loading rooms:', error);
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi tải danh sách phòng";
      toast.error(errorMessage);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // Load room types khi component mount
  useEffect(() => {
    loadRoomTypes();
  }, []);

  // Load rooms khi thay đổi search, pageSize, selectedDate, activeTab, hoặc roomTypeFilter
  useEffect(() => {
    // Nếu filter theo tab (không phải "all"), load tất cả phòng để filter ở frontend
    if (activeTab !== "all") {
      loadRooms(1, searchText, pageSize, selectedDate, true, roomTypeFilter);
    } else {
      // Nếu tab "all", dùng pagination từ backend
      loadRooms(1, searchText, pageSize, selectedDate, false, roomTypeFilter);
    }
    // Reset về page 1 khi thay đổi filter
    setPagination(prev => ({ ...prev, current: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, pageSize, selectedDate, activeTab, roomTypeFilter]);

  // Xóa room
  const handleDeleteRoom = async (room: Room) => {
    Modal.confirm({
      title: "Xóa phòng",
      content: `Bạn có chắc muốn xóa "${room.name}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          const response = await roomService.deleteRoom(room.id);
          if (response.success) {
            toast.success(`Đã xóa phòng "${room.name}"`);
            // Reload dựa trên tab hiện tại
            if (activeTab !== "all") {
              loadRooms(1, searchText, pageSize, selectedDate, true, roomTypeFilter);
            } else {
              loadRooms(pagination.current, searchText, pageSize, selectedDate, false, roomTypeFilter);
            }
          } else {
            toast.error(response.message || "Có lỗi xảy ra khi xóa");
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa");
        }
      },
    });
  };

  // Lấy trạng thái phòng dựa trên booking detail
  const getRoomAvailabilityStatus = (room: Room): { status: 'available' | 'occupied' | 'maintenance'; bookingInfo?: any } => {
    // Nếu phòng đang maintenance, trả về luôn
    if (room.status === 'maintenance') {
      return { status: 'maintenance' };
    }
    
    // Nếu có selectedDate, kiểm tra booking detail để xác định trạng thái thực tế
    if (selectedDate && (room as any).booking_details) {
      const bookingDetails = (room as any).booking_details || [];
      const dateStr = selectedDate.format('YYYY-MM-DD');
      
      // Tìm booking detail có ngày check_in <= selectedDate <= check_out và status = checked_in hoặc confirmed
      const activeBooking = bookingDetails.find((bd: any) => {
        const checkIn = bd.check_in_date;
        const checkOut = bd.check_out_date;
        const status = bd.status;
        
        return checkIn && checkOut && 
               checkIn <= dateStr && 
               dateStr <= checkOut && 
               (status === 'checked_in' || status === 'confirmed');
      });
      
      if (activeBooking) {
        return { 
          status: 'occupied',
          bookingInfo: activeBooking
        };
      }
      
      // Nếu không có booking active trong ngày đã chọn, phòng trống
      return { status: 'available' };
    }
    
    // Nếu không có selectedDate, dùng trạng thái từ room.status
    if (room.status === 'occupied') {
      return { status: 'occupied' };
    }
    
    // Mặc định là available
    return { status: 'available' };
  };

  // Cấu hình phân trang
  const tablePagination: TablePaginationConfig = {
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: pagination.total,
    showSizeChanger: true,
    pageSizeOptions: ["15", "30", "45"],
    onShowSizeChange: (_, size) => {
      setPageSize(size);
      setPagination({ ...pagination, pageSize: size, current: 1 });
      // useEffect sẽ tự động gọi loadRooms
    },
    onChange: (page) => {
      if (activeTab === "all") {
        // Tab "all" cần gọi API với page mới
        loadRooms(page, searchText, pageSize, selectedDate, false, roomTypeFilter);
      } else {
        // Tab filter chỉ cần cập nhật state, không cần gọi API
        setPagination(prev => ({ ...prev, current: page }));
      }
    },
    showTotal: (total) => `Tổng ${total} phòng`,
  };

  // Cột Table
  const columns: ColumnsType<Room> = [
    { 
      title: "ID", 
      dataIndex: "id", 
      key: "id", 
      width: 60, 
      fixed: 'left' as const,
      render: (id) => <>#{id}</> 
    },
    {
      title: "Hình ảnh",
      dataIndex: "images",
      key: "images",
      width: 80,
      render: (images: Room["images"]) => (
        <Image
          src={images?.[0]?.image_url || "https://via.placeholder.com/50"}
          alt="Room"
          width={50}
          height={50}
          style={{ borderRadius: 8, objectFit: "cover" }}
          preview={false}
        />
      ),
    },
    { 
      title: "Tên phòng", 
      dataIndex: "name", 
      key: "name",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Loại phòng",
      dataIndex: "roomType",
      key: "roomType",
      width: 120,
      ellipsis: true,
      render: (roomType: Room["roomType"], record: Room) => {
        // Try multiple ways to access roomType
        const type = roomType || record.roomType || (record as any).room_type;
        return type?.name || record.room_type_id || "-";
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 180,
      render: (_: string, record: Room) => {
        // Lấy trạng thái thực tế dựa trên booking detail nếu có chọn ngày
        const availability = getRoomAvailabilityStatus(record);
        const actualStatus = availability.status;
        
        const statusMap: Record<string, { color: string; text: string }> = {
          available: { color: "success", text: "Trống" },
          maintenance: { color: "warning", text: "Bảo trì" },
          occupied: { color: "error", text: "Đang sử dụng" },
        };
        const statusInfo = statusMap[actualStatus] || { color: "default", text: actualStatus };
        
        return (
          <Tag color={statusInfo.color} style={{ margin: 0 }}>
            {statusInfo.text}
            {availability.bookingInfo && (
              <Tooltip title={`Booking ID: ${availability.bookingInfo.booking_order_id || 'N/A'}`}>
                <span style={{ marginLeft: 4 }}>📋</span>
              </Tooltip>
            )}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/listing/view/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              onClick={async () => {
                try {
                  // Fetch room với images từ roomType để đảm bảo có đầy đủ thông tin
                  const roomResponse = await roomService.getRoomById(record.id, 'property,roomType,roomType.images,amenities');
                  if (roomResponse.success && roomResponse.data) {
                    setSelectedRoom(roomResponse.data);
                    setModalMode("edit");
                    setIsModalVisible(true);
                  } else {
                    toast.error("Không thể tải thông tin phòng");
                  }
                } catch (error: any) {
                  console.error("Error loading room:", error);
                  toast.error("Không thể tải thông tin phòng");
                }
              }}
              icon={<EditOutlined />}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              size="small"
              danger
              onClick={() => handleDeleteRoom(record)}
              icon={<DeleteOutlined />}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <HomeOutlined /> Quản lý phòng
        </Space>
      }
      extra={
        <Space>
          <DatePicker
            placeholder="Lọc theo ngày"
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            format="DD/MM/YYYY"
            allowClear
            style={{ width: 180 }}
            prefixCls="ant-picker"
            suffixIcon={<CalendarOutlined />}
          />
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 250 }}
          />
          <Select
            placeholder="Lọc theo loại phòng"
            allowClear
            style={{ width: 200 }}
            value={roomTypeFilter}
            onChange={setRoomTypeFilter}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => {
              const label = String(option?.label ?? '');
              return label.toLowerCase().includes(input.toLowerCase());
            }}
          >
            {roomTypes.map((roomType) => (
              <Select.Option key={roomType.id} value={roomType.id} label={roomType.name}>
                {roomType.name}
              </Select.Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setModalMode("add");
              setIsModalVisible(true);
            }}
          >
            Thêm phòng
          </Button>
        </Space>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "available",
            label: "Trống",
          },
          {
            key: "occupied",
            label: "Đang sử dụng",
          },
          {
            key: "all",
            label: "Tất cả",
          },
        ]}
        style={{ marginBottom: 16 }}
      />
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={(() => {
            // Nếu filter theo tab, dùng allRooms và filter + phân trang ở frontend
            if (activeTab !== "all") {
              const filteredRooms = allRooms.filter((room) => {
                const availability = getRoomAvailabilityStatus(room);
                const actualStatus = availability.status;
                
                if (activeTab === "available") {
                  return actualStatus === "available";
                }
                if (activeTab === "occupied") {
                  return actualStatus === "occupied";
                }
                
                return true;
              });
              
              // Phân trang ở frontend
              const startIndex = (pagination.current - 1) * pagination.pageSize;
              const endIndex = startIndex + pagination.pageSize;
              return filteredRooms.slice(startIndex, endIndex);
            }
            
            // Nếu tab "all", dùng rooms từ backend (đã được phân trang)
            return rooms;
          })()}
          pagination={(() => {
            if (activeTab !== "all") {
              // Tính tổng số phòng sau khi filter
              const filteredCount = allRooms.filter((room) => {
                const availability = getRoomAvailabilityStatus(room);
                const actualStatus = availability.status;
                
                if (activeTab === "available") {
                  return actualStatus === "available";
                }
                if (activeTab === "occupied") {
                  return actualStatus === "occupied";
                }
                
                return true;
              }).length;
              
              return {
                ...tablePagination,
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredCount,
                showTotal: (total) => `Tổng ${total} phòng`,
              };
            }
            
            // Tab "all" dùng pagination từ backend
            return tablePagination;
          })()}
          rowKey="id"
          size="small"
        />
      </Spin>

      {/* Modal thêm / sửa */}
      {modalMode === "add" && (
        <AddRoom
          visible={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            // Reload dựa trên tab hiện tại
            if (activeTab !== "all") {
              loadRooms(1, searchText, pageSize, selectedDate, true, roomTypeFilter);
            } else {
              loadRooms(1, searchText, pageSize, selectedDate, false, roomTypeFilter);
            }
          }}
        />
      )}
      {modalMode === "edit" && selectedRoom && (
        <EditRoom
          visible={isModalVisible}
          room={selectedRoom}
          onClose={() => {
            setIsModalVisible(false);
            setSelectedRoom(null);
            // Reload dựa trên tab hiện tại
            if (activeTab !== "all") {
              loadRooms(1, searchText, pageSize, selectedDate, true, roomTypeFilter);
            } else {
              loadRooms(1, searchText, pageSize, selectedDate, false, roomTypeFilter);
            }
          }}
        />
      )}
    </Card>
  );
};

export default ListRoom;
