import React, { useState, useEffect, useCallback } from "react";
import {
    Layout,
    Row,
    Col,
    Typography,
    Card,
    Rate,
    Breadcrumb,
    Button,
    Select,
    Slider,
    Space,
    Image,
    Checkbox,
    Divider,
    Empty,
    Spin,
    message,
    Input,
    Pagination,
    DatePicker,
    Badge,
    Drawer,
    List,
    Modal,
    Descriptions,
} from "antd";
import {
    HomeOutlined,
    EnvironmentOutlined,
    FilterOutlined,
    UserOutlined,
    SearchOutlined,
    ReloadOutlined,
    CalendarOutlined,
    ShoppingCartOutlined,
    DeleteOutlined,
    CheckOutlined,
    CheckCircleFilled,
    WifiOutlined,
    CoffeeOutlined,
    SafetyOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { RangePickerProps } from "antd/es/date-picker";
// import { getRooms, getRoomById } from "../../../service/room"; // Không dùng nữa, đã chuyển sang RoomType
import { getRoomTypesWithDetails, type RoomTypeWithDetails } from "../../../service/roomType";
import api from "../../../api/axios";
// import type { Room } from "../../../types/room/room"; // Không dùng nữa
// import type { RoomType } from "../../../types/roomtype/roomtype"; // Không dùng nữa
import type { Amenity } from "../../../types/amenity/amenity";
import { formatVND, formatVNDWithUnit } from "../../../utils/currency";
import { useAuth } from "../../../context/AuthContext";
import { useBookingCart } from "../../../context/BookingCartContext";
import "./RoomList.css";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

// Helper functions cho RoomType
const getRoomTypeImage = (roomType: RoomTypeWithDetails): string => {
    if (roomType.image_url) return roomType.image_url;
    if (roomType.images && roomType.images.length > 0) {
        const primaryImage = roomType.images.find(img => img.is_primary);
        if (primaryImage?.image_url) return primaryImage.image_url;
        if (roomType.images[0]?.image_url) return roomType.images[0].image_url;
    }
    return "/img/bg-img/1.jpg";
};

const getRoomTypeLocation = (roomType: RoomTypeWithDetails): string => {
    if (roomType.property?.name) return roomType.property.name;
    return "N/A";
};

const getBedType = (roomType: RoomTypeWithDetails): string => {
    const maxAdults = roomType.max_adults || 2;
    if (maxAdults <= 1) return "1 giường đơn";
    if (maxAdults <= 2) return "1 giường King";
    if (maxAdults <= 4) return "1 giường King + 1 giường Queen";
    return "2 giường King";
};

const getRoomSize = (roomType: RoomTypeWithDetails): string => {
    const maxAdults = roomType.max_adults || 2;
    if (maxAdults <= 1) return "20 m²";
    if (maxAdults <= 2) return "35 m²";
    if (maxAdults <= 4) return "65 m²";
    return "85 m²";
};

// Helper functions cho Room (giữ lại để backward compatibility - có thể xóa sau)
// const getRoomImage = (room: Room): string => { ... }
// const getRoomLocation = (room: Room): string => { ... }

// Debounce hook
const useDebounce = (value: any, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const RoomList: React.FC = () => {
    const navigate = useNavigate();
    // const [searchParams, setSearchParams] = useSearchParams(); // Không dùng nữa vì đã bỏ filter theo loại phòng
    
    // Sử dụng useAuth - nếu không có AuthProvider sẽ throw error
    // Component này cần được wrap trong AuthProvider ở App level
    const { isLoggedIn } = useAuth();
    
    // Sử dụng BookingCartContext để quản lý cart globally
    const {
        // Mô hình mới: RoomType-based
        selectedRoomTypes,
        dateRange,
        setDateRange,
        addRoomTypeToCart,
        removeRoomTypeFromCart,
        clearCart,
        isRoomTypeInCart,
        cartVisible,
        setCartVisible,
        // Mô hình cũ: Room-based (backward compatibility - không dùng nữa)
        // selectedRooms,
        // addToCart,
        // removeFromCart,
        // isInCart,
    } = useBookingCart();

    // State cho dữ liệu - Mô hình mới: RoomType
    const [roomTypes, setRoomTypes] = useState<RoomTypeWithDetails[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalRoomTypes, setTotalRoomTypes] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(12);

    // State cho modal chi tiết loại phòng
    const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
    const [selectedRoomTypeDetail, setSelectedRoomTypeDetail] = useState<RoomTypeWithDetails | null>(null);
    const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

    // State cho filter options (amenities)
    // const [roomTypeOptions, setRoomTypeOptions] = useState<RoomType[]>([]); // Không dùng nữa
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [loadingOptions, setLoadingOptions] = useState<boolean>(false);

    // State cho các bộ lọc
    const [searchQuery, setSearchQuery] = useState<string>("");
    // const [selectedRoomTypeIds, setSelectedRoomTypeIds] = useState<number[]>([]); // Đã bỏ filter theo loại phòng
    const [selectedAmenityIds, setSelectedAmenityIds] = useState<number[]>([]);
    const [selectedKeyAmenityIds, setSelectedKeyAmenityIds] = useState<number[]>([]); // Key amenities (Bồn tắm, Ban công, etc.)
    const [selectedViewIds, setSelectedViewIds] = useState<number[]>([]); // View amenities
    const [selectedFloorIds, setSelectedFloorIds] = useState<number[]>([]); // Floor amenities
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
    const [minRating, setMinRating] = useState<number>(0);
    const [maxAdults, setMaxAdults] = useState<number>(1);
    const [maxChildren, setMaxChildren] = useState<number>(0);
    const [roomCapacityPreset, setRoomCapacityPreset] = useState<string | null>(null); // Preset: 'couple', 'family', 'group'
    const [sortBy, setSortBy] = useState<string>("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);

    // Debounce search query
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Đã bỏ filter theo loại phòng, không cần lấy room_type_id từ URL nữa

    // Fetch room types và amenities cho filter options
    useEffect(() => {
        const fetchFilterOptions = async () => {
            setLoadingOptions(true);
            try {
                const [, amenitiesRes] = await Promise.allSettled([
                    api.get('/public/room-types', { params: { status: 'active', per_page: 100 } }),
                    api.get('/public/amenities', { params: { per_page: 100 } }),
                ]);

                // Không cần lưu roomTypeOptions nữa vì đã dùng roomTypes từ fetchRoomTypes
                // if (roomTypesRes.status === 'fulfilled' && roomTypesRes.value.data.success) {
                //     setRoomTypeOptions(roomTypesRes.value.data.data || []);
                // }

                if (amenitiesRes.status === 'fulfilled' && amenitiesRes.value.data.success) {
                    setAmenities(amenitiesRes.value.data.data || []);
                }
            } catch (error: any) {
                if (import.meta.env.DEV) {
                    console.error("Error fetching filter options:", error);
                }
            } finally {
                setLoadingOptions(false);
            }
        };

        fetchFilterOptions();
    }, []);

    // Fetch RoomTypes với filtering (mô hình mới)
    const fetchRoomTypes = useCallback(async () => {
        setLoading(true);
        try {
            // Lấy check-in/check-out dates nếu có
            let checkIn: string | undefined;
            let checkOut: string | undefined;
            if (dateRange && dateRange[0] && dateRange[1]) {
                checkIn = dateRange[0].format('YYYY-MM-DD');
                checkOut = dateRange[1].format('YYYY-MM-DD');
            }

            const response = await getRoomTypesWithDetails({
                check_in: checkIn,
                check_out: checkOut,
                per_page: 100, // Lấy tất cả để filter ở frontend
            });

            if (response.success && response.data) {
                let filteredRoomTypes = [...response.data];

                // Filter ở frontend
                // Search
                if (debouncedSearchQuery) {
                    const query = debouncedSearchQuery.toLowerCase();
                    filteredRoomTypes = filteredRoomTypes.filter(rt =>
                        rt.name.toLowerCase().includes(query) ||
                        rt.description?.toLowerCase().includes(query) ||
                        rt.property?.name?.toLowerCase().includes(query)
                    );
                }

                // Room type filter đã bỏ (không cần filter theo loại phòng nữa)

                // Price range
                if (priceRange[0] > 0 || priceRange[1] < 5000000) {
                    filteredRoomTypes = filteredRoomTypes.filter(rt => {
                        const price = rt.price_per_night || 0;
                        return price >= priceRange[0] && price <= priceRange[1];
                    });
                }

                // Rating filter
                if (minRating > 0) {
                    filteredRoomTypes = filteredRoomTypes.filter(rt =>
                        (rt.rating || 0) >= minRating
                    );
                }

                // Guests filter
                if (maxAdults > 1) {
                    filteredRoomTypes = filteredRoomTypes.filter(rt =>
                        (rt.max_adults || 0) >= maxAdults
                    );
                }
                if (maxChildren > 0) {
                    filteredRoomTypes = filteredRoomTypes.filter(rt =>
                        (rt.max_children || 0) >= maxChildren
                    );
                }

                // Amenities filter (general amenities)
                if (selectedAmenityIds.length > 0) {
                    filteredRoomTypes = filteredRoomTypes.filter(rt => {
                        const roomAmenities = rt.amenities || [];
                        return selectedAmenityIds.every(amenityId =>
                            roomAmenities.some((a: any) => a.id === amenityId)
                        );
                    });
                }

                // Key Amenities filter (dùng .some() - OR logic: chỉ cần có MỘT trong các amenities được chọn)
                if (selectedKeyAmenityIds.length > 0) {
                    filteredRoomTypes = filteredRoomTypes.filter(rt => {
                        const roomAmenities = rt.amenities || [];
                        return selectedKeyAmenityIds.some(keyAmenityId =>
                            roomAmenities.some((a: any) => a.id === keyAmenityId && a.filter_category === 'key_amenity')
                        );
                    });
                }

                // View filter (dùng .some() - OR logic: chỉ cần có MỘT trong các views được chọn)
                if (selectedViewIds.length > 0) {
                    filteredRoomTypes = filteredRoomTypes.filter(rt => {
                        const roomAmenities = rt.amenities || [];
                        return selectedViewIds.some(viewId =>
                            roomAmenities.some((a: any) => a.id === viewId && a.filter_category === 'view')
                        );
                    });
                }

                // Floor filter (dùng .some() - OR logic: chỉ cần có MỘT trong các floors được chọn)
                if (selectedFloorIds.length > 0) {
                    filteredRoomTypes = filteredRoomTypes.filter(rt => {
                        const roomAmenities = rt.amenities || [];
                        return selectedFloorIds.some(floorId =>
                            roomAmenities.some((a: any) => a.id === floorId && a.filter_category === 'floor')
                        );
                    });
                }

                // Availability filter: chỉ hiển thị RoomType còn phòng trống
                if (dateRange && dateRange[0] && dateRange[1]) {
                    filteredRoomTypes = filteredRoomTypes.filter(rt =>
                        (rt.available_count || 0) > 0
                    );
                }

                // Sort
                if (sortBy !== "default") {
                    filteredRoomTypes.sort((a, b) => {
                        let aValue: any = 0;
                        let bValue: any = 0;

                        // Best seller: Ưu tiên rating cao + reviews nhiều + available nhiều
                        if (sortBy === "best-seller") {
                            const aScore = ((a.rating || 0) * 10) + (a.reviews_count || 0) + ((a.available_count || 0) * 2);
                            const bScore = ((b.rating || 0) * 10) + (b.reviews_count || 0) + ((b.available_count || 0) * 2);
                            return bScore - aScore; // Descending
                        }

                        switch (sortBy) {
                            case "price_per_night":
                                aValue = a.price_per_night || 0;
                                bValue = b.price_per_night || 0;
                                break;
                            case "rating":
                                aValue = a.rating || 0;
                                bValue = b.rating || 0;
                                break;
                            case "name":
                                aValue = a.name;
                                bValue = b.name;
                                break;
                            default:
                                aValue = a.created_at || '';
                                bValue = b.created_at || '';
                        }

                        if (sortOrder === "asc") {
                            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
                        } else {
                            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
                        }
                    });
                }

                // Pagination ở frontend
                const startIndex = (currentPage - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                const paginatedRoomTypes = filteredRoomTypes.slice(startIndex, endIndex);

                setRoomTypes(paginatedRoomTypes);
                setTotalRoomTypes(filteredRoomTypes.length);

                // Cập nhật price range max nếu cần
                if (response.data.length > 0) {
                    const maxPrice = Math.max(...response.data.map(rt => rt.price_per_night || 0));
                    if (maxPrice > priceRange[1]) {
                        setPriceRange([0, Math.ceil(maxPrice / 100000) * 100000]);
                    }
                }
            }
        } catch (error: any) {
            if (import.meta.env.DEV) {
                console.error("Error fetching room types:", error);
            }
            message.error("Không thể tải danh sách loại phòng. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    }, [
        currentPage,
        pageSize,
        debouncedSearchQuery,
        // selectedRoomTypeIds, // Đã bỏ filter theo loại phòng
        selectedAmenityIds,
        selectedKeyAmenityIds,
        selectedViewIds,
        selectedFloorIds,
        priceRange,
        minRating,
        maxAdults,
        maxChildren,
        roomCapacityPreset,
        sortBy,
        sortOrder,
        dateRange, // Thêm dateRange vào dependencies
    ]);

    // Fetch RoomTypes khi filters thay đổi
    useEffect(() => {
        fetchRoomTypes();
    }, [fetchRoomTypes]);

    // Reset về page 1 khi filter thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, selectedAmenityIds, selectedKeyAmenityIds, selectedViewIds, selectedFloorIds, priceRange, minRating, maxAdults, maxChildren, roomCapacityPreset]);

    // Reset tất cả bộ lọc
    const handleResetFilters = () => {
        setSearchQuery("");
        // setSelectedRoomTypeIds([]); // Đã bỏ filter theo loại phòng
        setSelectedAmenityIds([]);
        setSelectedKeyAmenityIds([]);
        setSelectedViewIds([]);
        setSelectedFloorIds([]);
        setPriceRange([0, 5000000]);
        setMinRating(0);
        setMaxAdults(1);
        setMaxChildren(0);
        setRoomCapacityPreset(null);
        setSortBy("created_at");
        setSortOrder("desc");
        setCurrentPage(1);
        // setSearchParams({}); // Không dùng nữa
    };

    // Xử lý chọn preset nhóm khách
    const handleCapacityPresetChange = (preset: string | null) => {
        setRoomCapacityPreset(preset);
        if (preset === 'couple') {
            setMaxAdults(2);
            setMaxChildren(0);
        } else if (preset === 'family') {
            setMaxAdults(2);
            setMaxChildren(1);
        } else if (preset === 'group') {
            setMaxAdults(4);
            setMaxChildren(0);
        }
    };

    // Disable dates: không cho chọn ngày quá khứ
    const disabledDate: RangePickerProps['disabledDate'] = (current) => {
        if (!current) return false;
        const today = dayjs().startOf('day');
        const currentDate = current.startOf('day');
        return currentDate.isBefore(today);
    };

    // Xử lý chọn ngày
    const handleDateChange: RangePickerProps['onChange'] = (dates) => {
        const newRange = dates as [Dayjs | null, Dayjs | null] | null;
        setDateRange(newRange);
        
        // Note: Cart sẽ tự động cập nhật khi dateRange thay đổi
        // Các phòng mới thêm vào sẽ dùng dateRange mới
        // Các phòng cũ vẫn giữ dateRange cũ (có thể cần clear cart nếu muốn đồng bộ)
    };

    // Thêm loại phòng vào cart (mô hình mới)
    const handleAddRoomTypeToCart = (roomType: RoomTypeWithDetails, quantity: number = 1) => {
        if (!dateRange || !dateRange[0] || !dateRange[1]) {
            message.warning('Vui lòng chọn ngày nhận và trả phòng trước!');
            return;
        }

        if (!roomType.price_per_night) {
            message.error('Loại phòng này chưa có thông tin giá. Vui lòng thử lại sau.');
            return;
        }

        if ((roomType.available_count || 0) < quantity) {
            message.warning(`Chỉ còn ${roomType.available_count} phòng trống cho loại phòng này.`);
            return;
        }

        const checkIn = dateRange[0].format('DD/MM/YYYY');
        const checkOut = dateRange[1].format('DD/MM/YYYY');
        const nights = dateRange[1].diff(dateRange[0], 'day');
        const pricePerNight = roomType.price_per_night;
        const maxAdults = roomType.max_adults || 2;
        const maxChildren = roomType.max_children || 0;

        // Sử dụng addRoomTypeToCart từ context
        addRoomTypeToCart(
            roomType,
            quantity,
            checkIn,
            checkOut,
            nights,
            pricePerNight,
            maxAdults,
            maxChildren
        );
    };

    // Các hàm này đã được thay thế bằng handleAddRoomTypeToCart và removeRoomTypeFromCart

    // Xóa tất cả phòng - sử dụng từ context
    const handleClearCart = () => {
        clearCart();
    };

    // Xử lý đặt phòng (mô hình mới - RoomType)
    const handleBookNow = () => {
        if (!isLoggedIn) {
            message.warning('Vui lòng đăng nhập để đặt phòng!');
            return;
        }

        if (selectedRoomTypes.length === 0) {
            message.warning('Vui lòng chọn ít nhất một loại phòng!');
            return;
        }

        if (!dateRange || !dateRange[0] || !dateRange[1]) {
            message.warning('Vui lòng chọn ngày nhận và trả phòng!');
            return;
        }

        // Chuyển đổi selectedRoomTypes sang format BookingRoomItem
        // Mỗi RoomType với quantity sẽ tạo ra nhiều room items
        const rooms: any[] = [];
        selectedRoomTypes.forEach(item => {
            const quantity = item.quantity || 1;
            for (let i = 0; i < quantity; i++) {
                rooms.push({
                    roomTypeId: item.roomType.id.toString(),
                    roomName: item.roomType.name,
                    price: item.pricePerNight || 0,
                    checkIn: item.checkIn!,
                    checkOut: item.checkOut!,
                    nights: item.nights!,
                    adults: item.maxAdults || 2,
                    children: item.maxChildren || 0,
                    totalPrice: (item.pricePerNight || 0) * (item.nights || 1),
                });
            }
        });

        // Navigate đến BookingInfoPage
        navigate('/booking/info', {
            state: {
                rooms: rooms
            }
        });
    };

    // Xử lý xem chi tiết loại phòng
    const handleViewDetail = async (roomTypeId: number) => {
        setDetailModalVisible(true);
        setLoadingDetail(true);
        setSelectedRoomTypeDetail(null);

        try {
            const response = await getRoomTypesWithDetails();
            if (response.success && response.data) {
                const roomType = response.data.find(rt => rt.id === roomTypeId);
                if (roomType) {
                    setSelectedRoomTypeDetail(roomType);
                } else {
                    message.error('Không tìm thấy phòng');
                    setDetailModalVisible(false);
                }
            } else {
                message.error('Không thể tải thông tin chi tiết phòng');
                setDetailModalVisible(false);
            }
        } catch (error: any) {
            console.error('Error fetching room type detail:', error);
            message.error('Không thể tải thông tin chi tiết phòng');
            setDetailModalVisible(false);
        } finally {
            setLoadingDetail(false);
        }
    };

    // Helper để map amenities thành format UI
    const mapAmenitiesToUI = (amenities?: { id: number; name: string }[]) => {
        if (!amenities || amenities.length === 0) return [];
        
        return amenities.map(amenity => {
            const name = amenity.name.toLowerCase();
            let icon = <CheckCircleFilled style={{ color: '#52c41a' }} />;
            
            if (name.includes('wifi') || name.includes('internet')) {
                icon = <WifiOutlined />;
            } else if (name.includes('coffee') || name.includes('cà phê') || name.includes('minibar')) {
                icon = <CoffeeOutlined />;
            } else if (name.includes('safe') || name.includes('két')) {
                icon = <SafetyOutlined />;
            } else if (name.includes('tv') || name.includes('tivi')) {
                icon = <ThunderboltOutlined />;
            }
            
            return {
                icon,
                text: amenity.name
            };
        });
    };

    // Xử lý sort change
    const handleSortChange = (value: string) => {
        if (value === "default") {
            setSortBy("created_at");
            setSortOrder("desc");
        } else if (value === "best-seller") {
            setSortBy("best-seller");
            setSortOrder("desc");
        } else if (value === "price-asc") {
            setSortBy("price_per_night");
            setSortOrder("asc");
        } else if (value === "price-desc") {
            setSortBy("price_per_night");
            setSortOrder("desc");
        } else if (value === "rating") {
            setSortBy("rating");
            setSortOrder("desc");
        } else if (value === "name") {
            setSortBy("name");
            setSortOrder("asc");
        }
    };

    const getSortDisplayValue = () => {
        if (sortBy === "best-seller") return "best-seller";
        if (sortBy === "price_per_night" && sortOrder === "asc") return "price-asc";
        if (sortBy === "price_per_night" && sortOrder === "desc") return "price-desc";
        if (sortBy === "rating") return "rating";
        if (sortBy === "name") return "name";
        return "default";
    };

    return (
        <div className="room-list-page">
            {/* Breadcrumb */}
            <div className="breadcrumb-wrapper" style={{ padding: '20px 0', background: '#f5f5f5' }}>
                <div className="container">
                    <Breadcrumb
                        items={[
                            {
                                title: (
                                    <Link to="/">
                                        <HomeOutlined /> Trang chủ
                                    </Link>
                                ),
                            },
                            {
                                title: <Link to="/rooms">Phòng</Link>,
                            },
                        ]}
                    />
                </div>
            </div>

            <Content style={{ padding: '40px 0', minHeight: '80vh', background: '#fff' }}>
                <div className="container">
                    {/* Tiêu đề & Thống kê */}
                    <div style={{ marginBottom: 32 }}>
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Title level={2} style={{ marginBottom: 8 }}>
                                    Danh sách phòng
                                </Title>
                                <Space split={<Divider type="vertical" />}>
                                    <Text type="secondary">
                                        Tìm thấy <Text strong style={{ color: '#cb8670' }}>{totalRoomTypes}</Text> loại phòng
                                    </Text>
                                    {(debouncedSearchQuery || selectedAmenityIds.length > 0) && (
                                        <Button
                                            type="link"
                                            icon={<ReloadOutlined />}
                                            onClick={handleResetFilters}
                                            size="small"
                                        >
                                            Xóa bộ lọc
                                        </Button>
                                    )}
                                </Space>
                            </Col>
                            <Col>
                                <Space>
                                    {/* DatePicker cho ngày check-in/check-out */}
                                    <Space>
                                        <CalendarOutlined style={{ color: '#cb8670' }} />
                                        <RangePicker
                                            format="DD/MM/YYYY"
                                            placeholder={['Nhận phòng', 'Trả phòng']}
                                            value={dateRange}
                                            onChange={handleDateChange}
                                            disabledDate={disabledDate}
                                            allowClear
                                            style={{ width: 280 }}
                                        />
                                    </Space>
                                    {/* Booking Cart Button */}
                                    <Badge count={selectedRoomTypes.length} showZero={false}>
                                        <Button
                                            type="primary"
                                            icon={<ShoppingCartOutlined />}
                                            onClick={() => setCartVisible(true)}
                                            style={{
                                                backgroundColor: '#cb8670',
                                                borderColor: '#cb8670',
                                            }}
                                        >
                                            Booking Cart {selectedRoomTypes.length > 0 && `(${selectedRoomTypes.length})`}
                                        </Button>
                                    </Badge>
                                </Space>
                            </Col>
                        </Row>
                    </div>

                    {/* Button mở Filter Modal - Thay thế sidebar */}
                    <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                        <Space>
                            <Button
                                type="default"
                                icon={<FilterOutlined />}
                                onClick={() => setFilterModalVisible(true)}
                                size="large"
                            >
                                Bộ lọc
                                {(selectedAmenityIds.length > 0 || selectedKeyAmenityIds.length > 0 || 
                                  selectedViewIds.length > 0 || selectedFloorIds.length > 0 ||
                                  priceRange[0] > 0 || priceRange[1] < 5000000 || minRating > 0 ||
                                  maxAdults > 1 || maxChildren > 0) && (
                                    <Badge count={selectedAmenityIds.length + selectedKeyAmenityIds.length + 
                                                  selectedViewIds.length + selectedFloorIds.length + 
                                                  (priceRange[0] > 0 || priceRange[1] < 5000000 ? 1 : 0) +
                                                  (minRating > 0 ? 1 : 0) + (maxAdults > 1 ? 1 : 0) + (maxChildren > 0 ? 1 : 0)} 
                                           offset={[8, 0]} />
                                )}
                            </Button>
                            {(selectedAmenityIds.length > 0 || selectedKeyAmenityIds.length > 0 || 
                              selectedViewIds.length > 0 || selectedFloorIds.length > 0 ||
                              priceRange[0] > 0 || priceRange[1] < 5000000 || minRating > 0 ||
                              maxAdults > 1 || maxChildren > 0) && (
                                <Button type="link" onClick={handleResetFilters} size="small">
                                    Xóa bộ lọc
                                </Button>
                            )}
                        </Space>
                        <Space>
                            <Text type="secondary">
                                Hiển thị {roomTypes.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, totalRoomTypes)} trong tổng số {totalRoomTypes} loại phòng
                            </Text>
                            <Space>
                                <Text>Sắp xếp theo:</Text>
                                <Select
                                    style={{ width: 200 }}
                                    value={getSortDisplayValue()}
                                    onChange={handleSortChange}
                                >
                                    <Option value="default">Mặc định</Option>
                                    <Option value="best-seller">Bán chạy nhất</Option>
                                    <Option value="price-asc">Giá: Thấp đến cao</Option>
                                    <Option value="price-desc">Giá: Cao đến thấp</Option>
                                    <Option value="rating">Đánh giá cao nhất</Option>
                                    <Option value="name">Tên A-Z</Option>
                                </Select>
                            </Space>
                        </Space>
                    </div>

                    {/* Danh sách phòng - Full width */}
                    <Row gutter={[24, 24]}>
                        <Col xs={24}>
                            {/* Danh sách phòng */}
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                    <Spin size="large" />
                                </div>
                            ) : roomTypes.length === 0 ? (
                                <Empty
                                    description="Không tìm thấy phòng phù hợp"
                                    style={{ padding: '60px 0' }}
                                >
                                    <Button type="primary" onClick={handleResetFilters}>
                                        Đặt lại bộ lọc
                                    </Button>
                                </Empty>
                            ) : (
                                <>
                                    <Row gutter={[24, 24]}>
                                        {roomTypes.map((roomType) => {
                                            const roomTypeImage = getRoomTypeImage(roomType);
                                            const roomTypeLocation = getRoomTypeLocation(roomType);
                                            const bedType = getBedType(roomType);
                                            const roomSize = getRoomSize(roomType);
                                            const maxTotalGuests = (roomType.max_adults || 0) + (roomType.max_children || 0);
                                            const roomTypeRating = roomType.rating || 0;
                                            const availableCount = roomType.available_count || 0;

                                            return (
                                                <Col xs={24} sm={12} lg={12} key={roomType.id}>
                                                    <Card
                                                        hoverable
                                                        className="room-card"
                                                        bodyStyle={{ padding: 0 }}
                                                        style={{ borderRadius: 12, overflow: 'hidden', height: '100%' }}
                                                    >
                                                        <Row gutter={0}>
                                                            {/* Ảnh loại phòng */}
                                                            <Col xs={24} sm={10}>
                                                                <div
                                                                    style={{
                                                                        height: 220,
                                                                        overflow: 'hidden',
                                                                        position: 'relative',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    onClick={() => handleViewDetail(roomType.id)}
                                                                >
                                                                    <Image
                                                                        alt={roomType.name}
                                                                        src={roomTypeImage}
                                                                        preview={false}
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            objectFit: 'cover',
                                                                            transition: 'transform 0.3s ease'
                                                                        }}
                                                                        className="room-image-hover"
                                                                    />
                                                                    {/* Badge số lượng còn trống */}
                                                                    {availableCount > 0 && (
                                                                        <div
                                                                            style={{
                                                                                position: 'absolute',
                                                                                top: 12,
                                                                                right: 12,
                                                                                background: 'rgba(82, 196, 26, 0.9)',
                                                                                color: 'white',
                                                                                padding: '4px 12px',
                                                                                borderRadius: 4,
                                                                                fontSize: 12,
                                                                                fontWeight: 'bold'
                                                                            }}
                                                                        >
                                                                            Còn {availableCount} phòng
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </Col>

                                                            {/* Thông tin phòng */}
                                                            <Col xs={24} sm={14}>
                                                                <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                                    <Space direction="vertical" size="small" style={{ width: '100%', flex: 1 }}>
                                                                        <Title
                                                                            level={5}
                                                                            style={{
                                                                                marginBottom: 0,
                                                                                cursor: 'pointer',
                                                                                transition: 'color 0.3s ease'
                                                                            }}
                                                                            onClick={() => handleViewDetail(roomType.id)}
                                                                            className="room-title-hover"
                                                                        >
                                                                            {roomType.name}
                                                                        </Title>

                                                                        {roomTypeRating > 0 && (
                                                                            <Space>
                                                                                <Rate disabled defaultValue={roomTypeRating} allowHalf style={{ fontSize: 14 }} />
                                                                                <Text strong style={{ color: '#cb8670' }}>{roomTypeRating.toFixed(1)}</Text>
                                                                                {roomType.reviews_count && (
                                                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                                                        ({roomType.reviews_count})
                                                                                    </Text>
                                                                                )}
                                                                            </Space>
                                                                        )}

                                                                        <Space>
                                                                            <EnvironmentOutlined style={{ color: '#8c8c8c' }} />
                                                                            <Text type="secondary" style={{ fontSize: 13 }}>
                                                                                {roomTypeLocation}
                                                                            </Text>
                                                                        </Space>

                                                                        <Paragraph
                                                                            ellipsis={{ rows: 2 }}
                                                                            style={{ marginBottom: 8, fontSize: 13 }}
                                                                        >
                                                                            {roomType.description || "Loại phòng đẹp, tiện nghi đầy đủ"}
                                                                        </Paragraph>

                                                                        <Space split={<Divider type="vertical" />} style={{ fontSize: 12 }}>
                                                                            <Text type="secondary">{roomSize}</Text>
                                                                            <Text type="secondary">{bedType}</Text>
                                                                            <Text type="secondary">
                                                                                <UserOutlined /> {maxTotalGuests} khách
                                                                            </Text>
                                                                        </Space>
                                                                    </Space>

                                                                    <Divider style={{ margin: '12px 0' }} />

                                                                    {/* Price và Buttons */}
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                                        {/* Price */}
                                                                        {roomType.price_per_night && (
                                                                            <div>
                                                                                <Text style={{ fontSize: 20, color: '#cb8670', fontWeight: 'bold' }}>
                                                                                    {formatVNDWithUnit(roomType.price_per_night, '/đêm')}
                                                                                </Text>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {/* Buttons - Stack vertically on small screens, horizontal on larger */}
                                                                        <Space 
                                                                            direction="vertical" 
                                                                            size="small" 
                                                                            style={{ width: '100%' }}
                                                                            className="room-card-buttons"
                                                                        >
                                                                            {/* Kiểm tra xem loại phòng đã được chọn chưa */}
                                                                            {isRoomTypeInCart(roomType.id) ? (
                                                                                <Button
                                                                                    type="default"
                                                                                    icon={<CheckOutlined />}
                                                                                    block
                                                                                    style={{
                                                                                        borderColor: '#52c41a',
                                                                                        color: '#52c41a',
                                                                                        height: 40
                                                                                    }}
                                                                                    disabled
                                                                                >
                                                                                    Đã chọn
                                                                                </Button>
                                                                            ) : (
                                                                                <Button
                                                                                    type="primary"
                                                                                    block
                                                                                    style={{
                                                                                        backgroundColor: '#52c41a',
                                                                                        borderColor: '#52c41a',
                                                                                        height: 40
                                                                                    }}
                                                                                    onClick={() => handleAddRoomTypeToCart(roomType, 1)}
                                                                                    disabled={!dateRange || !dateRange[0] || !dateRange[1] || availableCount === 0}
                                                                                >
                                                                                    Thêm vào booking
                                                                                </Button>
                                                                            )}
                                                                            <Button
                                                                                type="primary"
                                                                                block
                                                                                style={{
                                                                                    backgroundColor: '#cb8670',
                                                                                    borderColor: '#cb8670',
                                                                                    height: 40
                                                                                }}
                                                                                onClick={() => handleViewDetail(roomType.id)}
                                                                            >
                                                                                Chi tiết
                                                                            </Button>
                                                                        </Space>
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </Card>
                                                </Col>
                                            );
                                        })}
                                    </Row>

                                    {/* Pagination */}
                                    {totalRoomTypes > pageSize && (
                                        <div style={{ marginTop: 32, textAlign: 'center' }}>
                                            <Pagination
                                                current={currentPage}
                                                total={totalRoomTypes}
                                                pageSize={pageSize}
                                                showSizeChanger
                                                showQuickJumper
                                                showTotal={(total, range) =>
                                                    `${range[0]}-${range[1]} của ${total} phòng`
                                                }
                                                onChange={(page, size) => {
                                                    setCurrentPage(page);
                                                    setPageSize(size || 12);
                                                }}
                                                onShowSizeChange={(_current, size) => {
                                                    setCurrentPage(1);
                                                    setPageSize(size);
                                                }}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </Col>
                    </Row>
                </div>
            </Content>

            {/* Booking Cart Drawer */}
            <Drawer
                title={
                    <Space>
                        <ShoppingCartOutlined />
                        <span>Booking Cart ({selectedRoomTypes.length} loại phòng)</span>
                    </Space>
                }
                placement="right"
                onClose={() => setCartVisible(false)}
                open={cartVisible}
                width={400}
                extra={
                    selectedRoomTypes.length > 0 && (
                        <Button type="link" danger onClick={handleClearCart} size="small">
                            Xóa tất cả
                        </Button>
                    )
                }
            >
                {selectedRoomTypes.length === 0 ? (
                    <Empty
                        description="Chưa có loại phòng nào được chọn"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Text type="secondary">
                            Chọn ngày và thêm loại phòng vào booking để bắt đầu
                        </Text>
                    </Empty>
                ) : (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <List
                            dataSource={selectedRoomTypes}
                            renderItem={(item) => {
                                const roomTypeImage = getRoomTypeImage(item.roomType);
                                return (
                                    <List.Item
                                        actions={[
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => removeRoomTypeFromCart(item.roomType.id)}
                                            >
                                                Xóa
                                            </Button>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Image
                                                    src={roomTypeImage}
                                                    alt={item.roomType.name}
                                                    width={80}
                                                    height={80}
                                                    style={{ objectFit: 'cover', borderRadius: 8 }}
                                                    preview={false}
                                                />
                                            }
                                            title={
                                                <Text strong style={{ fontSize: 14 }}>
                                                    {item.roomType.name}
                                                    {item.quantity && item.quantity > 1 && (
                                                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                                                            (x{item.quantity})
                                                        </Text>
                                                    )}
                                                </Text>
                                            }
                                            description={
                                                <Space direction="vertical" size="small" style={{ fontSize: 12 }}>
                                                    {item.checkIn && item.checkOut && (
                                                        <Text type="secondary">
                                                            {item.checkIn} → {item.checkOut}
                                                        </Text>
                                                    )}
                                                    {item.nights && (
                                                        <Text type="secondary">
                                                            {item.nights} đêm
                                                        </Text>
                                                    )}
                                                    <Text strong style={{ color: '#cb8670', fontSize: 14 }}>
                                                        {formatVND(item.totalPrice || 0)}
                                                    </Text>
                                                </Space>
                                            }
                                        />
                                    </List.Item>
                                );
                            }}
                        />

                        <Divider />

                        {/* Tổng tiền */}
                        <div style={{
                            padding: 16,
                            background: '#f5f5f5',
                            borderRadius: 8,
                            border: '2px solid #cb8670'
                        }}>
                            <Row justify="space-between" align="middle">
                                <Col>
                                    <Text strong style={{ fontSize: 16 }}>Tổng cộng</Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {selectedRoomTypes.length} loại phòng
                                    </Text>
                                </Col>
                                <Col>
                                    <Text
                                        strong
                                        style={{
                                            fontSize: 24,
                                            color: '#cb8670'
                                        }}
                                    >
                                        {formatVND(selectedRoomTypes.reduce((sum, item) => sum + (item.totalPrice || 0), 0))}
                                    </Text>
                                </Col>
                            </Row>
                        </div>

                        {/* Nút đặt phòng */}
                        <Button
                            type="primary"
                            size="large"
                            block
                            onClick={handleBookNow}
                            style={{
                                backgroundColor: '#cb8670',
                                borderColor: '#cb8670',
                                height: 50,
                                fontSize: 16,
                                fontWeight: 'bold'
                            }}
                        >
                            Đặt phòng ngay ({selectedRoomTypes.length} loại phòng)
                        </Button>

                        <Text type="secondary" style={{ fontSize: 12, textAlign: 'center', display: 'block' }}>
                            Bạn sẽ điền thông tin người đặt ở bước tiếp theo
                        </Text>
                    </Space>
                )}
            </Drawer>

            {/* Modal Bộ lọc */}
            <Modal
                title={
                    <Space>
                        <FilterOutlined />
                        <span>Bộ lọc</span>
                    </Space>
                }
                open={filterModalVisible}
                onCancel={() => setFilterModalVisible(false)}
                footer={[
                    <Button key="reset" onClick={handleResetFilters}>
                        Đặt lại
                    </Button>,
                    <Button key="apply" type="primary" onClick={() => setFilterModalVisible(false)}>
                        Áp dụng
                    </Button>,
                ]}
                width={800}
                centered
            >
                <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '8px 0' }}>
                    <Row gutter={[24, 24]}>
                        {/* Cột trái */}
                        <Col xs={24} md={12}>
                            {/* Search Box */}
                            <div style={{ marginBottom: 24 }}>
                                <Text strong style={{ display: 'block', marginBottom: 12 }}>
                                    Tìm kiếm
                                </Text>
                                <Search
                                    placeholder="Tìm theo tên phòng, địa chỉ..."
                                    allowClear
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onSearch={(value) => setSearchQuery(value)}
                                    enterButton={<SearchOutlined />}
                                />
                            </div>

                            {/* Khoảng giá */}
                            <div style={{ marginBottom: 24 }}>
                                <Text strong style={{ display: 'block', marginBottom: 12 }}>
                                    Khoảng giá (VNĐ/đêm)
                                </Text>
                                <Slider
                                    range
                                    min={0}
                                    max={5000000}
                                    step={100000}
                                    value={priceRange}
                                    onChange={(value) => setPriceRange(value as [number, number])}
                                    tooltip={{
                                        formatter: (value) => formatVND(value || 0)
                                    }}
                                />
                                <Space style={{ width: '100%', justifyContent: 'space-between', marginTop: 8 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {formatVND(priceRange[0])}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {formatVND(priceRange[1])}
                                    </Text>
                                </Space>
                            </div>

                            {/* Đánh giá tối thiểu */}
                            <div style={{ marginBottom: 24 }}>
                                <Text strong style={{ display: 'block', marginBottom: 12 }}>
                                    Đánh giá tối thiểu
                                </Text>
                                <Select
                                    style={{ width: '100%' }}
                                    value={minRating}
                                    onChange={setMinRating}
                                >
                                    <Option value={0}>Tất cả</Option>
                                    <Option value={4}>
                                        <Space>
                                            <Rate disabled defaultValue={4} style={{ fontSize: 12 }} />
                                            <span>trở lên</span>
                                        </Space>
                                    </Option>
                                    <Option value={4.5}>
                                        <Space>
                                            <Rate disabled defaultValue={4.5} allowHalf style={{ fontSize: 12 }} />
                                            <span>trở lên</span>
                                        </Space>
                                    </Option>
                                    <Option value={4.8}>
                                        <Space>
                                            <Rate disabled defaultValue={4.8} allowHalf style={{ fontSize: 12 }} />
                                            <span>trở lên</span>
                                        </Space>
                                    </Option>
                                </Select>
                            </div>

                            {/* Nhóm khách */}
                            <div style={{ marginBottom: 24 }}>
                                <Text strong style={{ display: 'block', marginBottom: 12 }}>
                                    Nhóm khách
                                </Text>
                                <Select
                                    style={{ width: '100%' }}
                                    value={roomCapacityPreset}
                                    onChange={handleCapacityPresetChange}
                                    placeholder="Chọn nhóm khách"
                                    allowClear
                                >
                                    <Option value="couple">Dành cho cặp đôi (2 người)</Option>
                                    <Option value="family">Dành cho gia đình nhỏ (2 người lớn + 1 trẻ em)</Option>
                                    <Option value="group">Dành cho nhóm bạn (4-6 người)</Option>
                                </Select>
                            </div>

                            {/* Số người lớn */}
                            <div style={{ marginBottom: 24 }}>
                                <Text strong style={{ display: 'block', marginBottom: 12 }}>
                                    Số người lớn
                                </Text>
                                <Select
                                    style={{ width: '100%' }}
                                    value={maxAdults}
                                    onChange={(value) => {
                                        setMaxAdults(value);
                                        setRoomCapacityPreset(null);
                                    }}
                                >
                                    <Option value={1}>1 người</Option>
                                    <Option value={2}>2 người</Option>
                                    <Option value={3}>3 người</Option>
                                    <Option value={4}>4 người</Option>
                                    <Option value={6}>6 người trở lên</Option>
                                </Select>
                            </div>

                            {/* Số trẻ em */}
                            <div>
                                <Text strong style={{ display: 'block', marginBottom: 12 }}>
                                    Số trẻ em <Text type="secondary" style={{ fontSize: 11, fontWeight: 'normal' }}>(6-12 tuổi)</Text>
                                </Text>
                                <Select
                                    style={{ width: '100%' }}
                                    value={maxChildren}
                                    onChange={(value) => {
                                        setMaxChildren(value);
                                        setRoomCapacityPreset(null);
                                    }}
                                >
                                    <Option value={0}>Không có</Option>
                                    <Option value={1}>1 trẻ</Option>
                                    <Option value={2}>2 trẻ</Option>
                                    <Option value={3}>3 trẻ trở lên</Option>
                                </Select>
                            </div>
                        </Col>

                        {/* Cột phải */}
                        <Col xs={24} md={12}>
                            {/* Tiện nghi đặc biệt */}
                            <div style={{ marginBottom: 24 }}>
                                <Text strong style={{ display: 'block', marginBottom: 12 }}>
                                    Tiện nghi đặc biệt
                                </Text>
                                {loadingOptions ? (
                                    <Spin size="small" />
                                ) : (
                                    <Checkbox.Group
                                        style={{ width: '100%' }}
                                        value={selectedKeyAmenityIds}
                                        onChange={(values) => setSelectedKeyAmenityIds(values as number[])}
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            {amenities
                                                .filter(amenity => amenity.filter_category === 'key_amenity')
                                                .map((amenity) => (
                                                    <Checkbox key={amenity.id} value={amenity.id}>
                                                        {amenity.name}
                                                    </Checkbox>
                                                ))}
                                            {amenities.filter(amenity => amenity.filter_category === 'key_amenity').length === 0 && (
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Không có tiện nghi đặc biệt
                                                </Text>
                                            )}
                                        </Space>
                                    </Checkbox.Group>
                                )}
                            </div>

                            {/* Hướng nhìn */}
                            <div style={{ marginBottom: 24 }}>
                                <Text strong style={{ display: 'block', marginBottom: 12 }}>
                                    Hướng nhìn
                                </Text>
                                {loadingOptions ? (
                                    <Spin size="small" />
                                ) : (
                                    <Checkbox.Group
                                        style={{ width: '100%' }}
                                        value={selectedViewIds}
                                        onChange={(values) => setSelectedViewIds(values as number[])}
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            {amenities
                                                .filter(amenity => amenity.filter_category === 'view')
                                                .map((amenity) => (
                                                    <Checkbox key={amenity.id} value={amenity.id}>
                                                        {amenity.name}
                                                    </Checkbox>
                                                ))}
                                            {amenities.filter(amenity => amenity.filter_category === 'view').length === 0 && (
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Không có thông tin hướng nhìn
                                                </Text>
                                            )}
                                        </Space>
                                    </Checkbox.Group>
                                )}
                            </div>

                            {/* Vị trí tầng */}
                            <div style={{ marginBottom: 24 }}>
                                <Text strong style={{ display: 'block', marginBottom: 12 }}>
                                    Vị trí tầng
                                </Text>
                                {loadingOptions ? (
                                    <Spin size="small" />
                                ) : (
                                    <Checkbox.Group
                                        style={{ width: '100%' }}
                                        value={selectedFloorIds}
                                        onChange={(values) => setSelectedFloorIds(values as number[])}
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            {amenities
                                                .filter(amenity => amenity.filter_category === 'floor')
                                                .map((amenity) => (
                                                    <Checkbox key={amenity.id} value={amenity.id}>
                                                        {amenity.name}
                                                    </Checkbox>
                                                ))}
                                            {amenities.filter(amenity => amenity.filter_category === 'floor').length === 0 && (
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Không có thông tin tầng
                                                </Text>
                                            )}
                                        </Space>
                                    </Checkbox.Group>
                                )}
                            </div>

                            {/* Tiện ích khác */}
                            <div>
                                <Text strong style={{ display: 'block', marginBottom: 12 }}>
                                    Tiện ích khác
                                </Text>
                                {loadingOptions ? (
                                    <Spin size="small" />
                                ) : (
                                    <Checkbox.Group
                                        style={{ width: '100%' }}
                                        value={selectedAmenityIds}
                                        onChange={(values) => setSelectedAmenityIds(values as number[])}
                                    >
                                        <Space direction="vertical" style={{ width: '100%', maxHeight: 200, overflowY: 'auto' }}>
                                            {amenities
                                                .filter(amenity => !amenity.filter_category || amenity.filter_category === null)
                                                .map((amenity) => (
                                                    <Checkbox key={amenity.id} value={amenity.id}>
                                                        {amenity.name}
                                                    </Checkbox>
                                                ))}
                                            {amenities.filter(amenity => !amenity.filter_category || amenity.filter_category === null).length === 0 && (
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Không có tiện ích nào
                                                </Text>
                                            )}
                                        </Space>
                                    </Checkbox.Group>
                                )}
                            </div>
                        </Col>
                    </Row>
                </div>
            </Modal>

            {/* Modal Chi tiết phòng */}
            <Modal
                title={
                    <Space>
                        <HomeOutlined />
                        <span>Chi tiết phòng</span>
                    </Space>
                }
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedRoomTypeDetail(null);
                }}
                footer={null}
                width={900}
                centered
            >
                {loadingDetail ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Spin size="large" />
                    </div>
                ) : selectedRoomTypeDetail ? (
                    <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            {/* Ảnh loại phòng */}
                            {(selectedRoomTypeDetail.images && selectedRoomTypeDetail.images.length > 0) || selectedRoomTypeDetail.image_url ? (
                                <Image.PreviewGroup>
                                    <Row gutter={[8, 8]}>
                                        {selectedRoomTypeDetail.images && selectedRoomTypeDetail.images.length > 0 ? (
                                            selectedRoomTypeDetail.images.slice(0, 4).map((img, idx) => (
                                                <Col span={idx === 0 ? 24 : 8} key={idx}>
                                                    <Image
                                                        src={img.image_url}
                                                        alt={`${selectedRoomTypeDetail.name} ${idx + 1}`}
                                                        style={{
                                                            width: '100%',
                                                            height: idx === 0 ? 300 : 150,
                                                            objectFit: 'cover',
                                                            borderRadius: 8
                                                        }}
                                                    />
                                                </Col>
                                            ))
                                        ) : (
                                            <Col span={24}>
                                                <Image
                                                    src={selectedRoomTypeDetail.image_url || '/img/bg-img/1.jpg'}
                                                    alt={selectedRoomTypeDetail.name}
                                                    style={{
                                                        width: '100%',
                                                        height: 300,
                                                        objectFit: 'cover',
                                                        borderRadius: 8
                                                    }}
                                                />
                                            </Col>
                                        )}
                                    </Row>
                                </Image.PreviewGroup>
                            ) : null}

                            <Divider />

                            {/* Thông tin cơ bản */}
                            <Descriptions title="Thông tin phòng" bordered column={2}>
                                <Descriptions.Item label="Tên phòng" span={2}>
                                    <Text strong style={{ fontSize: 18 }}>{selectedRoomTypeDetail.name}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Địa điểm">
                                    {selectedRoomTypeDetail.property?.name || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Số lượng còn trống">
                                    <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                                        {selectedRoomTypeDetail.available_count || 0} phòng
                                    </Text>
                                </Descriptions.Item>
                                {selectedRoomTypeDetail.price_per_night && (
                                    <Descriptions.Item label="Giá mỗi đêm">
                                        <Text strong style={{ color: '#cb8670', fontSize: 16 }}>
                                            {formatVNDWithUnit(selectedRoomTypeDetail.price_per_night, '/đêm')}
                                        </Text>
                                    </Descriptions.Item>
                                )}
                                {selectedRoomTypeDetail.rating && selectedRoomTypeDetail.rating > 0 && (
                                    <Descriptions.Item label="Đánh giá">
                                        <Space>
                                            <Rate disabled defaultValue={selectedRoomTypeDetail.rating} allowHalf />
                                            <Text strong>{selectedRoomTypeDetail.rating.toFixed(1)}</Text>
                                            {selectedRoomTypeDetail.reviews_count && (
                                                <Text type="secondary">({selectedRoomTypeDetail.reviews_count} đánh giá)</Text>
                                            )}
                                        </Space>
                                    </Descriptions.Item>
                                )}
                                {selectedRoomTypeDetail.max_adults && (
                                    <>
                                        <Descriptions.Item label="Diện tích">
                                            {getRoomSize(selectedRoomTypeDetail)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Loại giường">
                                            {getBedType(selectedRoomTypeDetail)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Số khách tối đa">
                                            <Space>
                                                <UserOutlined />
                                                <Text>{selectedRoomTypeDetail.max_adults} người lớn</Text>
                                                {selectedRoomTypeDetail.max_children && selectedRoomTypeDetail.max_children > 0 && (
                                                    <Text>, {selectedRoomTypeDetail.max_children} trẻ em</Text>
                                                )}
                                            </Space>
                                        </Descriptions.Item>
                                    </>
                                )}
                                <Descriptions.Item label="Mô tả" span={2}>
                                    <Paragraph>{selectedRoomTypeDetail.description || 'Phòng đẹp, tiện nghi đầy đủ'}</Paragraph>
                                </Descriptions.Item>
                            </Descriptions>

                            {/* Tiện nghi */}
                            {selectedRoomTypeDetail.amenities && selectedRoomTypeDetail.amenities.length > 0 && (
                                <>
                                    <Divider />
                                    <div>
                                        <Title level={5}>Tiện nghi phòng</Title>
                                        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                                            {mapAmenitiesToUI(selectedRoomTypeDetail.amenities).map((amenity, index) => (
                                                <Col span={12} key={index}>
                                                    <Space>
                                                        {amenity.icon}
                                                        <Text>{amenity.text}</Text>
                                                    </Space>
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                </>
                            )}

                            {/* Nút hành động */}
                            <Divider />
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Button
                                        type="primary"
                                        block
                                        size="large"
                                        style={{
                                            backgroundColor: '#52c41a',
                                            borderColor: '#52c41a',
                                        }}
                                        onClick={() => {
                                            if (!dateRange || !dateRange[0] || !dateRange[1]) {
                                                message.warning('Vui lòng chọn ngày nhận và trả phòng trước!');
                                                return;
                                            }
                                            handleAddRoomTypeToCart(selectedRoomTypeDetail, 1);
                                            setDetailModalVisible(false);
                                        }}
                                        disabled={!dateRange || !dateRange[0] || !dateRange[1] || isRoomTypeInCart(selectedRoomTypeDetail.id) || (selectedRoomTypeDetail.available_count || 0) === 0}
                                    >
                                        {isRoomTypeInCart(selectedRoomTypeDetail.id) ? 'Đã thêm vào booking' : 'Thêm vào booking'}
                                    </Button>
                                </Col>
                            </Row>
                        </Space>
                    </div>
                ) : (
                    <Empty description="Không tìm thấy thông tin phòng" />
                )}
            </Modal>
        </div>
    );
};

export default RoomList;
