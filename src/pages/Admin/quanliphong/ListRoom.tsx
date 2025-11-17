import React, { useState } from "react";
import {
  Table,
  Card,
  Space,
  Input,
  Button,
  Switch,
  message,
  Modal,
  Tooltip,
  Image,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";

import { Listing } from "../../../types/room/room";

import AddRoom from "./addroom";
import EditRoom from "./editroom";

const ListRoom: React.FC = () => {
  // State quản lý danh sách phòng
 

  const [searchText, setSearchText] = useState("");
  const [pageSize, setPageSize] = useState<number>(15);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isModalVisible, setIsModalVisible] = useState(false);


  // Cấu hình phân trang
  const pagination: TablePaginationConfig = {
    pageSize,
    showSizeChanger: true,
    pageSizeOptions: ["15", "30", "45"],
    onShowSizeChange: (_, size) => setPageSize(size),
    showTotal: (total) => `Tổng ${total} phòng`,
  };

  // Cột Table
  const columns: ColumnsType<Listing> = [
    { title: "ID", dataIndex: "id", key: "id", render: (id) => <>#{id}</> },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (image) => (
        <Image
          src={image}
          alt="Listing"
          width={70}
          height={70}
          style={{ borderRadius: 8 }}
          placeholder
        />
      ),
    },
    { title: "Tên phòng", dataIndex: "name", key: "name" },
    { title: "Địa điểm", dataIndex: "location", key: "location" },
    {
      title: "Giá (VNĐ)",
      dataIndex: "price",
      key: "price",
      render: (price) => price.toLocaleString(),
    },
    { title: "Đánh giá", dataIndex: "rating", key: "rating" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (_, record) => (
        <Switch
        
          checkedChildren="Còn"
          unCheckedChildren="Hết"
        />
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              onClick={() => {
                setSelectedListing(record);
                setModalMode("edit");
                setIsModalVisible(true);
              }}
              icon={<EditOutlined />}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              danger
              onClick={() => {
                Modal.confirm({
                  title: "Xóa phòng",
                  content: `Bạn có chắc muốn xóa "${record.name}"?`,
                 
                });
              }}
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
          <HomeOutlined /> Danh sách phòng
        </Space>
      }
      extra={
        <Space>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
          />
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
      <Table
        columns={columns}
     
        pagination={pagination}
        rowKey="key"
        scroll={{ x: 1000 }}
      />

      {/* Modal thêm / sửa */}
      {modalMode === "add" && (
        <AddRoom
          visible={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
           
          }}
        />
      )}
      {modalMode === "edit" && selectedListing && (
        <EditRoom
          visible={isModalVisible}
          listing={selectedListing}
          onClose={() => {
            setIsModalVisible(false);
          
          }}
        />
      )}
    </Card>
  );
};

export default ListRoom;
