// src/pages/quanlimagiamgia/listPromotion.tsx
import React, { useState, useEffect } from "react";
import {
    Table, Button, Space, Input, Select, Tag, Row, Tooltip, Popconfirm, Spin
} from "antd";
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
    PercentageOutlined, DollarOutlined, CopyOutlined, ReloadOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { Promotion, PromotionStatus } from "../../../types/promotion/promotion";
import promotionService from "../../../service/promotionService";



const { Search } = Input;
const { Option } = Select;

const ListPromotion: React.FC = () => {
    const navigate = useNavigate();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [loading, setLoading] = useState(false);

    // --- Gọi API lấy danh sách mã giảm giá ---
    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const response: any = await promotionService.getAll();
            
            // Xử lý response có thể có nhiều dạng
            let data: Promotion[] = [];
            if (Array.isArray(response)) {
                data = response;
            } else if (response?.data && Array.isArray(response.data)) {
                data = response.data;
            } else if (response?.promotions && Array.isArray(response.promotions)) {
                data = response.promotions;
            }
            
            setPromotions(data);
            setFilteredPromotions(data);
        } catch (error: any) {
            if (import.meta.env.DEV) {
                console.error("Lỗi khi tải danh sách:", error);
            }
            toast.error(error.response?.data?.message || "Không thể tải danh sách mã giảm giá!");
            // Set empty array để tránh lỗi
            setPromotions([]);
            setFilteredPromotions([]);
        } finally {
            setLoading(false);
        }
    };

    // --- Load dữ liệu khi component mount ---
    useEffect(() => {
        fetchPromotions();
    }, []);

    // --- Bộ lọc ---
    const applyFilters = (search: string, status: string) => {
        let filtered = promotions;
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    (p.code || "").toLowerCase().includes(searchLower) ||
                    (p.description || "").toLowerCase().includes(searchLower)
            );
        }
        if (status !== "all") {
            filtered = filtered.filter((p) => {
                const itemStatus = getPromotionStatus(p);
                return itemStatus === status;
            });
        }
        setFilteredPromotions(filtered);
    };

    // --- Helper function để tính trạng thái ---
    const getPromotionStatus = (promotion: Promotion): PromotionStatus => {
        if (promotion.is_active === 0) return "Vô hiệu hóa";
        
        const now = new Date();
        const startDate = new Date(promotion.start_date);
        const endDate = new Date(promotion.end_date);
        
        if (now < startDate) return "Chưa áp dụng";
        if (now > endDate) return "Hết hạn";
        return "Đang hoạt động";
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        applyFilters(value, statusFilter);
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        applyFilters(searchText, value);
    };

    // --- Xử lý trạng thái & xóa ---
    const handleStatusChange = async (id: number, newStatus: PromotionStatus) => {
        try {
            // Chuyển đổi status sang is_active
            const is_active = (newStatus === "Vô hiệu hóa") ? 0 : 1;
            
            await promotionService.update(id, { is_active });
            
            // Cập nhật local state
            const updated = promotions.map((p) => 
                p.id === id ? { ...p, is_active } : p
            );
            setPromotions(updated);
            applyFilters(searchText, statusFilter);
            toast.success("Đã cập nhật trạng thái!");
        } catch (error: any) {
            if (import.meta.env.DEV) {
                console.error("Lỗi cập nhật trạng thái:", error);
            }
            toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái!");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await promotionService.remove(id);
            
            const updated = promotions.filter((p) => p.id !== id);
            setPromotions(updated);
            applyFilters(searchText, statusFilter);
            
            toast.success("Xóa mã giảm giá thành công!");
            
            // Reload lại danh sách để đảm bảo đồng bộ
            setTimeout(() => {
                fetchPromotions();
            }, 500);
        } catch (error: any) {
            if (import.meta.env.DEV) {
                console.error("Lỗi xóa mã giảm giá:", error);
            }
            toast.error(error.response?.data?.message || error.message || "Không thể xóa mã giảm giá. Vui lòng thử lại.");
        }
    };

    const handleBulkDelete = async () => {
        try {
            await Promise.all(selectedRowKeys.map(id => promotionService.remove(id as number)));
            const updated = promotions.filter((p) => !selectedRowKeys.includes(p.id));
            setPromotions(updated);
            applyFilters(searchText, statusFilter);
            setSelectedRowKeys([]);
            
            toast.success(`Đã xóa ${selectedRowKeys.length} mã giảm giá khỏi hệ thống.`);
            
            // Reload lại danh sách
            fetchPromotions();
        } catch (error: any) {
            if (import.meta.env.DEV) {
                console.error("Lỗi xóa hàng loạt:", error);
            }
            toast.error(error.response?.data?.message || "Không thể xóa các mã giảm giá. Vui lòng thử lại.");
        }
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Đã sao chép mã!");
    };

    const columns: ColumnsType<Promotion> = [
        {
            title: "Mã",
            dataIndex: "code",
            key: "code",
            sorter: (a, b) => (a.code || "").localeCompare(b.code || ""),
            render: (code) => (
                <Space>
                    <span style={{ fontWeight: 600, color: "#1890ff" }}>{code || "N/A"}</span>
                    <Tooltip title="Sao chép">
                        <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => handleCopyCode(code || "")} />
                    </Tooltip>
                </Space>
            ),
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            render: (description) => description || "N/A",
        },
        {
            title: "Loại giảm",
            dataIndex: "discount_type",
            key: "discount_type",
            render: (type, record) => {
                const discountValue = record.discount_value || 0;
                const isPercentage = type === "percentage";
                return (
                    <Tag color={isPercentage ? "blue" : "green"}>
                        {isPercentage ? `${discountValue}%` : `${discountValue.toLocaleString("vi-VN")}₫`}
                    </Tag>
                );
            },
        },
        {
            title: "Điều kiện",
            render: (_, record) => (
                <div>
                    <DollarOutlined style={{ color: "#f5222d", marginRight: 4 }} />
                    Tối thiểu: {(record.min_purchase_amount || 0).toLocaleString("vi-VN")}₫
                    {record.max_discount_amount && (
                        <div style={{ fontSize: 12 }}>
                            <PercentageOutlined /> Tối đa: {record.max_discount_amount.toLocaleString("vi-VN")}₫
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Sử dụng",
            render: (_, record) => (
                <div>
                    <div>Đã dùng: {record.usage_count || 0} / {record.max_usage_limit || 0}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>
                        Tối đa/user: {record.max_usage_per_user || 0}
                    </div>
                </div>
            ),
        },
        {
            title: "Thời gian",
            render: (_, record) => (
                <div style={{ fontSize: 12 }}>
                    <div>Bắt đầu: {new Date(record.start_date).toLocaleDateString('vi-VN')}</div>
                    <div>Kết thúc: {new Date(record.end_date).toLocaleDateString('vi-VN')}</div>
                </div>
            ),
        },
        {
            title: "Trạng thái",
            key: "status",
            render: (_, record) => {
                const status = getPromotionStatus(record);
                return (
                    <Select
                        value={status}
                        onChange={(value) => handleStatusChange(record.id, value)}
                        style={{ width: 140 }}
                    >
                        <Option value="Đang hoạt động">Đang hoạt động</Option>
                        <Option value="Chưa áp dụng">Chưa áp dụng</Option>
                        <Option value="Hết hạn">Hết hạn</Option>
                        <Option value="Vô hiệu hóa">Vô hiệu hóa</Option>
                    </Select>
                );
            },
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Sửa">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/admin/promotion/edit/${record.id}`)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xác nhận xóa mã giảm giá"
                        description={`Bạn có chắc chắn muốn xóa mã "${record.code}"?`}
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okType="danger"
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    };

    return (
        <div style={{ padding: 24 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Space>
                    <Search
                        placeholder="Tìm kiếm mã hoặc tên..."
                        enterButton={<SearchOutlined />}
                        onSearch={handleSearch}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ width: 300 }}
                    />
                    <Select
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        style={{ width: 160 }}
                    >
                        <Option value="all">Tất cả</Option>
                        <Option value="Đang hoạt động">Đang hoạt động</Option>
                        <Option value="Chưa áp dụng">Chưa áp dụng</Option>
                        <Option value="Hết hạn">Hết hạn</Option>
                        <Option value="Vô hiệu hóa">Vô hiệu hóa</Option>
                    </Select>
                </Space>
                <Space>
                    {selectedRowKeys.length > 0 && (
                        <Popconfirm
                            title="Xác nhận xóa hàng loạt"
                            description={`Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} mã giảm giá?`}
                            onConfirm={handleBulkDelete}
                            okText="Xóa"
                            cancelText="Hủy"
                            okType="danger"
                        >
                            <Button danger icon={<DeleteOutlined />}>
                                Xóa ({selectedRowKeys.length})
                            </Button>
                        </Popconfirm>
                    )}
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchPromotions}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate("/admin/promotion/add")}
                    >
                        Thêm mã
                    </Button>
                </Space>
            </Row>

            <Spin spinning={loading}>
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={filteredPromotions}
                    rowKey="id"
                    pagination={{
                        pageSize: 15,
                        showSizeChanger: true,
                        pageSizeOptions: [15, 30, 45],
                    }}
                />
            </Spin>
        </div>
    );
};

export default ListPromotion;
