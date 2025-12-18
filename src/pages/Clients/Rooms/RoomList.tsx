import React, { useState, useEffect, useCallback, useRef } from "react";
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
    InputNumber,
    Pagination,
    DatePicker,
    Badge,
    Drawer,
    List,
    Modal,
    Descriptions,
    Avatar,
    Popover,
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
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { Dayjs } from "dayjs";
import dayjs from "../../../utils/dayjs";
import type { RangePickerProps } from "antd/es/date-picker";
// import { getRooms, getRoomById } from "../../../service/room"; // Không dùng nữa, đã chuyển sang RoomType
import { getRoomTypesWithDetails, getRoomTypeReviews, type RoomTypeWithDetails } from "../../../service/roomType";
import api from "../../../api/axios";
// import type { Room } from "../../../types/room/room"; // Không dùng nữa
// import type { RoomType } from "../../../types/roomtype/roomtype"; // Không dùng nữa
import type { Amenity } from "../../../types/amenity/amenity";
import { formatVND, formatVNDWithUnit } from "../../../utils/currency";
import { useAuth } from "../../../context/AuthContext";
import { useBookingCart } from "../../../context/BookingCartContext";
import ImageWithFallback from "../../../components/ImageWithFallback";
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
    const [searchParams, setSearchParams] = useSearchParams();

    // Sử dụng useAuth - nếu không có AuthProvider sẽ throw error
    // Component này cần được wrap trong AuthProvider ở App level
    const { isLoggedIn } = useAuth();

    // Sử dụng BookingCartContext để quản lý cart globally
    const {
        // Mô hình mới: RoomType-based
        selectedRoomTypes = [],
        dateRange,
        setDateRange,
        addRoomTypeToCart,
        updateRoomTypeQuantity,
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
        desiredGuests,
        setDesiredGuests,
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
    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
    const [reviewsPage, setReviewsPage] = useState<number>(1);
    const [reviewsTotal, setReviewsTotal] = useState<number>(0);
    const [averageRating, setAverageRating] = useState<number>(0);

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

    // State cho tính năng chia phòng nhanh (Smart Room Allocation)
    // Nếu chưa có số khách (desiredGuests <= 0) thì để null để input hiển thị trống
    const [totalGuests, setTotalGuests] = useState<number | null>(
        desiredGuests && desiredGuests > 0 ? desiredGuests : null
    );
    const [showRoomSuggestions, setShowRoomSuggestions] = useState<boolean>(false);
    const [urlParamsInitialized, setUrlParamsInitialized] = useState<boolean>(false);

    // State cho Guest Picker (Người lớn, Trẻ em, Phòng)
    const [guestPickerVisible, setGuestPickerVisible] = useState<boolean>(false);
    const [numAdults, setNumAdults] = useState<number>(2);
    const [numChildren, setNumChildren] = useState<number>(0);
    const [numRooms, setNumRooms] = useState<number>(1);
    const [childrenAges, setChildrenAges] = useState<number[]>([]);

    // Giới hạn
    const MAX_ADULTS = 6;
    const MAX_CHILDREN = 2;

    // Đọc URL params và khởi tạo giá trị ban đầu (từ Homepage search bar)
    useEffect(() => {
        const checkInParam = searchParams.get('check_in');
        const checkOutParam = searchParams.get('check_out');
        const adultsParam = searchParams.get('adults');
        const childrenParam = searchParams.get('children');
        const totalGuestsParam = searchParams.get('total_guests');

        // Set ngày check-in/check-out nếu có
        if (checkInParam && checkOutParam) {
            const checkInDate = dayjs(checkInParam);
            const checkOutDate = dayjs(checkOutParam);

            if (checkInDate.isValid() && checkOutDate.isValid() && checkOutDate.isAfter(checkInDate)) {
                setDateRange([checkInDate, checkOutDate]);
            }
        }

        // Set tổng số khách và hiển thị gợi ý chia phòng
        // Khi có total_guests, KHÔNG áp dụng filter maxAdults/maxChildren
        // Thay vào đó, hiển thị modal gợi ý chia phòng thông minh
        if (totalGuestsParam) {
            const guests = parseInt(totalGuestsParam, 10);
            if (!isNaN(guests) && guests > 1) {
                setTotalGuests(guests);
                setDesiredGuests(guests);
                // Không set maxAdults/maxChildren để hiển thị tất cả phòng
                // Modal gợi ý chia phòng sẽ được hiển thị tự động
            }
        } else {
            // Chỉ áp dụng filter số khách nếu KHÔNG có total_guests
            // (tức là user đang filter thủ công, không phải từ homepage search)
            if (adultsParam) {
                const adults = parseInt(adultsParam, 10);
                if (!isNaN(adults) && adults > 0) {
                    setMaxAdults(adults);
                }
            }

            if (childrenParam) {
                const children = parseInt(childrenParam, 10);
                if (!isNaN(children) && children >= 0) {
                    setMaxChildren(children);
                }
            }
        }

        setUrlParamsInitialized(true);
    }, [searchParams, setDateRange]);

    // Popup "Tìm nhanh" chỉ hiển thị khi người dùng bấm nút, không tự động mở

    // Định nghĩa interface cho gợi ý chia phòng
    interface RoomAllocationSuggestion {
        type: 'optimal' | 'economical' | 'comfortable';
        label: string;
        description: string;
        rooms: { roomType: RoomTypeWithDetails; quantity: number }[];
        totalRooms: number;
        totalPrice: number;
        totalCapacity: number;
        wastedCapacity: number;
    }

    // Tính toán gợi ý chia phòng thông minh
    const calculateRoomSuggestions = useCallback((): RoomAllocationSuggestion[] => {
        if (totalGuests < 1 || roomTypes.length === 0) return [];

        // Chỉ lấy các loại phòng còn trống
        const availableRoomTypes = roomTypes.filter(rt => (rt.available_count || 0) > 0);
        if (availableRoomTypes.length === 0) return [];

        const suggestions: RoomAllocationSuggestion[] = [];

        // ========================================
        // GIỚI HẠN SỐ NGƯỜI/PHÒNG
        // ========================================
        const MIN_GUESTS_PER_ROOM = 2; // Tối thiểu 2 người/phòng
        const MAX_GUESTS_PER_ROOM = 6; // Tối đa 6 người/phòng

        // Hàm tính sức chứa hiệu dụng của phòng (có giới hạn)
        const getEffectiveCapacity = (rt: RoomTypeWithDetails) => {
            const actualCapacity = rt.max_adults || 2;
            return Math.min(actualCapacity, MAX_GUESTS_PER_ROOM);
        };

        // ========================================
        // GỢI Ý 1: TỐI ƯU (vừa đủ số khách, 1 phòng nếu có thể)
        // Ưu tiên: 1 phòng vừa đủ > nhiều phòng kết hợp vừa đủ > ít dư nhất
        // ========================================
        const optimalRooms: { roomType: RoomTypeWithDetails; quantity: number }[] = [];
        let remainingGuests = totalGuests;

        // Bước 1: Tìm 1 phòng có sức chứa hiệu dụng = đúng số khách (exact match)
        // Chỉ áp dụng nếu số khách >= MIN và <= MAX
        let exactMatch: RoomTypeWithDetails | undefined = undefined;
        if (totalGuests >= MIN_GUESTS_PER_ROOM && totalGuests <= MAX_GUESTS_PER_ROOM) {
            exactMatch = availableRoomTypes.find(rt => getEffectiveCapacity(rt) === totalGuests);
            
            // Bước 2: Nếu không có exact match, tìm phòng có sức chứa >= số khách và gần nhất
            if (!exactMatch) {
                const roomsWithEnoughCapacity = availableRoomTypes
                    .filter(rt => getEffectiveCapacity(rt) >= totalGuests)
                    .sort((a, b) => getEffectiveCapacity(a) - getEffectiveCapacity(b));
                
                if (roomsWithEnoughCapacity.length > 0) {
                    exactMatch = roomsWithEnoughCapacity[0];
                }
            }
        }

        // Bước 3: Nếu có phòng đủ sức chứa, dùng 1 phòng
        if (exactMatch) {
            optimalRooms.push({ roomType: exactMatch, quantity: 1 });
            remainingGuests = 0;
        } else {
            // Bước 4: Không có phòng nào đủ 1 mình, tìm combo tối ưu
            // Mục tiêu: Tìm combo có tổng sức chứa = đúng số khách (exact match) và ÍT PHÒNG NHẤT
            // Sử dụng sức chứa hiệu dụng (có giới hạn MAX_GUESTS_PER_ROOM)
            
            type RoomCombo = { roomType: RoomTypeWithDetails; quantity: number }[];
            
            // Hàm tìm combo tối ưu (backtracking với pruning)
            const findBestCombo = (): { combo: RoomCombo; totalRooms: number; totalCapacity: number } | null => {
                let bestResult: { combo: RoomCombo; totalRooms: number; totalCapacity: number } | null = null;
                
                // Sắp xếp theo sức chứa hiệu dụng giảm dần để tìm combo ít phòng trước
                const sortedRooms = [...availableRoomTypes].sort((a, b) => 
                    getEffectiveCapacity(b) - getEffectiveCapacity(a)
                );
                
                const backtrack = (
                    index: number, 
                    currentCombo: RoomCombo, 
                    currentCapacity: number, 
                    currentRooms: number
                ) => {
                    // Đã đủ hoặc vượt số khách
                    if (currentCapacity >= totalGuests) {
                        const waste = currentCapacity - totalGuests;
                        
                        // Ưu tiên: exact match > ít dư > ít phòng
                        if (!bestResult || 
                            waste < (bestResult.totalCapacity - totalGuests) ||
                            (waste === (bestResult.totalCapacity - totalGuests) && currentRooms < bestResult.totalRooms)) {
                            bestResult = {
                                combo: JSON.parse(JSON.stringify(currentCombo)),
                                totalRooms: currentRooms,
                                totalCapacity: currentCapacity
                            };
                        }
                        
                        // Nếu exact match và đã tối ưu, dừng sớm
                        if (waste === 0) return;
                    }
                    
                    // Pruning: nếu đã có kết quả exact match, không cần tìm tiếp
                    if (bestResult && bestResult.totalCapacity === totalGuests) return;
                    
                    // Pruning: nếu số phòng hiện tại >= best, không cần tìm tiếp
                    if (bestResult && currentRooms >= bestResult.totalRooms && currentCapacity < totalGuests) return;
                    
                    // Thử thêm phòng từ index trở đi
                    for (let i = index; i < sortedRooms.length; i++) {
                        const rt = sortedRooms[i];
                        const capacity = getEffectiveCapacity(rt); // Sử dụng sức chứa hiệu dụng
                        const available = rt.available_count || 0;
                        
                        // Tính số phòng đã dùng của loại này
                        const usedOfThis = currentCombo.find(c => c.roomType.id === rt.id)?.quantity || 0;
                        const remainingAvailable = available - usedOfThis;
                        
                        if (remainingAvailable <= 0) continue;
                        
                        // Tính số phòng cần thêm (tối đa)
                        const guestsNeeded = totalGuests - currentCapacity;
                        const maxNeeded = Math.ceil(guestsNeeded / capacity);
                        const toAdd = Math.min(maxNeeded, remainingAvailable);
                        
                        // Thử thêm từ 1 đến toAdd phòng
                        for (let qty = 1; qty <= toAdd; qty++) {
                            const existingIndex = currentCombo.findIndex(c => c.roomType.id === rt.id);
                            
                            if (existingIndex >= 0) {
                                currentCombo[existingIndex].quantity += qty;
                            } else {
                                currentCombo.push({ roomType: rt, quantity: qty });
                            }
                            
                            backtrack(i, currentCombo, currentCapacity + qty * capacity, currentRooms + qty);
                            
                            // Rollback
                            if (existingIndex >= 0) {
                                currentCombo[existingIndex].quantity -= qty;
                                if (currentCombo[existingIndex].quantity === 0) {
                                    currentCombo.splice(existingIndex, 1);
                                }
                            } else {
                                currentCombo.pop();
                            }
                            
                            // Nếu đã tìm được exact match, dừng
                            if (bestResult && bestResult.totalCapacity === totalGuests) return;
                        }
                    }
                };
                
                backtrack(0, [], 0, 0);
                return bestResult;
            };
            
            const bestCombo = findBestCombo();
            
            if (bestCombo && bestCombo.combo.length > 0) {
                optimalRooms.push(...bestCombo.combo);
                remainingGuests = totalGuests - bestCombo.totalCapacity;
            } else {
                // Fallback: greedy algorithm với sức chứa hiệu dụng
                const sortedByCapacity = [...availableRoomTypes].sort((a, b) =>
                    getEffectiveCapacity(b) - getEffectiveCapacity(a)
                );

                for (const rt of sortedByCapacity) {
                    if (remainingGuests <= 0) break;
                    const capacity = getEffectiveCapacity(rt);
                    const available = rt.available_count || 0;
                    const needed = Math.ceil(remainingGuests / capacity);
                    const quantity = Math.min(needed, available);

                    if (quantity > 0) {
                        optimalRooms.push({ roomType: rt, quantity });
                        remainingGuests -= quantity * capacity;
                    }
                }
            }
        }

        if (remainingGuests <= 0 && optimalRooms.length > 0) {
            const totalRooms = optimalRooms.reduce((sum, r) => sum + r.quantity, 0);
            const totalPrice = optimalRooms.reduce((sum, r) => sum + (r.roomType.price_per_night || 0) * r.quantity, 0);
            // Sử dụng sức chứa hiệu dụng để tính tổng
            const totalCapacity = optimalRooms.reduce((sum, r) => sum + getEffectiveCapacity(r.roomType) * r.quantity, 0);

            suggestions.push({
                type: 'optimal',
                label: '🎯 Tối ưu',
                description: 'Vừa đủ số khách, ít phòng nhất',
                rooms: optimalRooms,
                totalRooms,
                totalPrice,
                totalCapacity,
                wastedCapacity: totalCapacity - totalGuests,
            });
        }

        // ========================================
        // GỢI Ý 2: TIẾT KIỆM (giá thấp nhất theo đầu người)
        // ========================================
        const economicalRooms: { roomType: RoomTypeWithDetails; quantity: number }[] = [];
        remainingGuests = totalGuests;

        // Sắp xếp theo giá/người tăng dần (dùng sức chứa hiệu dụng)
        const sortedByPricePerPerson = [...availableRoomTypes].sort((a, b) => {
            const pricePerPersonA = (a.price_per_night || 0) / getEffectiveCapacity(a);
            const pricePerPersonB = (b.price_per_night || 0) / getEffectiveCapacity(b);
            return pricePerPersonA - pricePerPersonB;
        });

        for (const rt of sortedByPricePerPerson) {
            if (remainingGuests <= 0) break;
            const capacity = getEffectiveCapacity(rt); // Sức chứa hiệu dụng
            const available = rt.available_count || 0;
            const needed = Math.ceil(remainingGuests / capacity);
            const quantity = Math.min(needed, available);

            if (quantity > 0) {
                economicalRooms.push({ roomType: rt, quantity });
                remainingGuests -= quantity * capacity;
            }
        }

        if (remainingGuests <= 0 && economicalRooms.length > 0) {
            const totalRooms = economicalRooms.reduce((sum, r) => sum + r.quantity, 0);
            const totalPrice = economicalRooms.reduce((sum, r) => sum + (r.roomType.price_per_night || 0) * r.quantity, 0);
            const totalCapacity = economicalRooms.reduce((sum, r) => sum + getEffectiveCapacity(r.roomType) * r.quantity, 0);

            // Chỉ thêm nếu khác với gợi ý tối ưu
            const isDifferent = JSON.stringify(economicalRooms.map(r => ({ id: r.roomType.id, qty: r.quantity }))) !==
                JSON.stringify(optimalRooms.map(r => ({ id: r.roomType.id, qty: r.quantity })));

            if (isDifferent) {
                suggestions.push({
                    type: 'economical',
                    label: '💰 Tiết kiệm',
                    description: 'Chi phí thấp nhất theo đầu người',
                    rooms: economicalRooms,
                    totalRooms,
                    totalPrice,
                    totalCapacity,
                    wastedCapacity: totalCapacity - totalGuests,
                });
            }
        }

        // ========================================
        // GỢI Ý 3: THOẢI MÁI (tối thiểu MIN_GUESTS_PER_ROOM người/phòng)
        // ========================================
        const comfortableRooms: { roomType: RoomTypeWithDetails; quantity: number }[] = [];
        remainingGuests = totalGuests;

        // Sắp xếp theo sức chứa tăng dần (ưu tiên phòng nhỏ trước)
        const sortedBySmallest = [...availableRoomTypes].sort((a, b) =>
            getEffectiveCapacity(a) - getEffectiveCapacity(b)
        );

        // Mục tiêu: mỗi phòng xếp MIN_GUESTS_PER_ROOM người (thoải mái, không quá đông)
        for (const rt of sortedBySmallest) {
            if (remainingGuests <= 0) break;
            const available = rt.available_count || 0;
            // Mỗi phòng xếp MIN_GUESTS_PER_ROOM người (tối thiểu 2 người/phòng)
            const guestsPerRoom = MIN_GUESTS_PER_ROOM;
            const neededRooms = Math.ceil(remainingGuests / guestsPerRoom);
            const quantity = Math.min(neededRooms, available);

            if (quantity > 0) {
                comfortableRooms.push({ roomType: rt, quantity });
                remainingGuests -= quantity * guestsPerRoom;
            }
        }

        if (remainingGuests <= 0 && comfortableRooms.length > 0) {
            const totalRooms = comfortableRooms.reduce((sum, r) => sum + r.quantity, 0);
            const totalPrice = comfortableRooms.reduce((sum, r) => sum + (r.roomType.price_per_night || 0) * r.quantity, 0);
            // Tính sức chứa thực tế dựa trên số người xếp (MIN_GUESTS_PER_ROOM/phòng)
            const totalCapacity = totalRooms * MIN_GUESTS_PER_ROOM;

            // Chỉ thêm nếu khác với các gợi ý trước
            const comfortKey = JSON.stringify(comfortableRooms.map(r => ({ id: r.roomType.id, qty: r.quantity })));
            const optimalKey = JSON.stringify(optimalRooms.map(r => ({ id: r.roomType.id, qty: r.quantity })));
            const economicalKey = JSON.stringify(economicalRooms.map(r => ({ id: r.roomType.id, qty: r.quantity })));

            if (comfortKey !== optimalKey && comfortKey !== economicalKey) {
                suggestions.push({
                    type: 'comfortable',
                    label: '🛋️ Thoải mái',
                    description: `Tối thiểu ${MIN_GUESTS_PER_ROOM} người/phòng, rộng rãi hơn`,
                    rooms: comfortableRooms,
                    totalRooms,
                    totalPrice,
                    totalCapacity,
                    wastedCapacity: totalCapacity - totalGuests,
                });
            }
        }

        return suggestions;
    }, [totalGuests, roomTypes]);

    // Áp dụng gợi ý chia phòng vào cart
    const applyRoomSuggestion = (suggestion: RoomAllocationSuggestion) => {
        if (!dateRange || !dateRange[0] || !dateRange[1]) {
            message.warning('Vui lòng chọn ngày nhận và trả phòng trước!');
            return;
        }

        // Clear cart trước
        clearCart();

        // Tính số đêm
        const checkInStr = dateRange[0].format('YYYY-MM-DD');
        const checkOutStr = dateRange[1].format('YYYY-MM-DD');
        const nights = dateRange[1].diff(dateRange[0], 'day');

        // Thêm các phòng theo gợi ý
        for (const { roomType, quantity } of suggestion.rooms) {
            const pricePerNight = roomType.price_per_night || 0;
            addRoomTypeToCart(
                roomType,
                quantity,
                checkInStr,
                checkOutStr,
                nights,
                pricePerNight,
                roomType.max_adults || 2,
                roomType.max_children || 0
            );
        }

        message.success(`Đã thêm ${suggestion.totalRooms} phòng vào giỏ hàng theo gợi ý "${suggestion.label}"`);
        setShowRoomSuggestions(false);
        setCartVisible(true);
    };

    // Tính toán gợi ý khi totalGuests thay đổi
    const roomSuggestions = calculateRoomSuggestions();

    // Debounce search query
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Đã bỏ filter theo loại phòng, không cần lấy room_type_id từ URL nữa

    // Fetch amenities cho filter options (OPTIMIZED: chỉ lấy amenities, room types đã có từ fetchRoomTypes)
    useEffect(() => {
        const fetchFilterOptions = async () => {
            setLoadingOptions(true);
            try {
                // Chỉ gọi 1 API lấy amenities, không gọi room-types nữa vì đã có từ fetchRoomTypes
                const amenitiesRes = await api.get('/public/amenities', { params: { per_page: 100 } });

                if (amenitiesRes.data.success) {
                    setAmenities(amenitiesRes.data.data || []);
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

    // AbortController ref để cancel requests
    const abortControllerRef = useRef<AbortController | null>(null);

    // Fetch RoomTypes với filtering (mô hình mới) - với AbortController
    const fetchRoomTypes = useCallback(async () => {
        // Cancel previous request nếu có
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Tạo AbortController mới
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setLoading(true);
        try {
            // Lấy check-in/check-out dates nếu có
            // Chỉ gửi check_in/check_out nếu cả hai đều có giá trị hợp lệ và không phải ngày quá khứ
            const params: any = {
                per_page: pageSize, // Pagination ở backend
                page: currentPage,
            };

            if (dateRange && dateRange[0] && dateRange[1]) {
                const today = dayjs().startOf('day');
                const checkInDate = dateRange[0].startOf('day');
                const checkOutDate = dateRange[1].startOf('day');

                // Chỉ gửi nếu cả hai ngày đều không phải quá khứ và check-out sau check-in
                if (!checkInDate.isBefore(today) && checkOutDate.isAfter(checkInDate)) {
                    params.check_in = dateRange[0].format('YYYY-MM-DD');
                    params.check_out = dateRange[1].format('YYYY-MM-DD');
                }
            }

            const response = await getRoomTypesWithDetails(params);

            // Kiểm tra nếu request bị cancel thì không update state
            if (abortController.signal.aborted) {
                return;
            }

            if (response.success && response.data) {
                // Backend đã xử lý pagination, chỉ cần filter client-side cho các filter phức tạp
                let filteredRoomTypes = [...response.data];

                // Search filter (client-side vì cần search nhiều field)
                if (debouncedSearchQuery) {
                    const query = debouncedSearchQuery.toLowerCase();
                    filteredRoomTypes = filteredRoomTypes.filter(rt =>
                        rt.name.toLowerCase().includes(query) ||
                        rt.description?.toLowerCase().includes(query) ||
                        rt.property?.name?.toLowerCase().includes(query)
                    );
                }

                // Price range filter (client-side)
                if (priceRange[0] > 0 || priceRange[1] < 5000000) {
                    filteredRoomTypes = filteredRoomTypes.filter(rt => {
                        const price = rt.price_per_night || 0;
                        return price >= priceRange[0] && price <= priceRange[1];
                    });
                }

                // Rating filter (client-side)
                if (minRating > 0) {
                    filteredRoomTypes = filteredRoomTypes.filter(rt =>
                        (rt.rating || 0) >= minRating
                    );
                }

                // Guests filter (client-side)
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

                // Amenities filters (client-side - complex logic)
                if (selectedAmenityIds.length > 0) {
                    filteredRoomTypes = filteredRoomTypes.filter(rt => {
                        const roomAmenities = rt.amenities || [];
                        return selectedAmenityIds.every(amenityId =>
                            roomAmenities.some((a: any) => a.id === amenityId)
                        );
                    });
                }

                if (selectedKeyAmenityIds.length > 0) {
                    filteredRoomTypes = filteredRoomTypes.filter(rt => {
                        const roomAmenities = rt.amenities || [];
                        return selectedKeyAmenityIds.some(keyAmenityId =>
                            roomAmenities.some((a: any) => a.id === keyAmenityId && a.filter_category === 'key_amenity')
                        );
                    });
                }

                if (selectedViewIds.length > 0) {
                    filteredRoomTypes = filteredRoomTypes.filter(rt => {
                        const roomAmenities = rt.amenities || [];
                        return selectedViewIds.some(viewId =>
                            roomAmenities.some((a: any) => a.id === viewId && a.filter_category === 'view')
                        );
                    });
                }

                if (selectedFloorIds.length > 0) {
                    filteredRoomTypes = filteredRoomTypes.filter(rt => {
                        const roomAmenities = rt.amenities || [];
                        return selectedFloorIds.some(floorId =>
                            roomAmenities.some((a: any) => a.id === floorId && a.filter_category === 'floor')
                        );
                    });
                }

                // Client-side sorting
                if (sortBy !== "default") {
                    filteredRoomTypes.sort((a, b) => {
                        let aValue: any = 0;
                        let bValue: any = 0;

                        if (sortBy === "best-seller") {
                            const aScore = ((a.rating || 0) * 10) + (a.reviews_count || 0) + ((a.available_count || 0) * 2);
                            const bScore = ((b.rating || 0) * 10) + (b.reviews_count || 0) + ((b.available_count || 0) * 2);
                            return bScore - aScore;
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

                        return sortOrder === "asc"
                            ? (aValue > bValue ? 1 : aValue < bValue ? -1 : 0)
                            : (aValue < bValue ? 1 : aValue > bValue ? -1 : 0);
                    });
                }

                // Set data from backend pagination
                setRoomTypes(filteredRoomTypes);
                setTotalRoomTypes(response.meta?.total || filteredRoomTypes.length);
            }
        } catch (error: any) {
            // Ignore abort errors
            if (error.name === 'CanceledError' || error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
                console.log('[RoomList] Request was cancelled');
                return;
            }

            if (!abortController.signal.aborted) {
                if (import.meta.env.DEV) {
                    console.error("Error fetching room types:", error);
                }
                message.error("Không thể tải danh sách loại phòng. Vui lòng thử lại sau.");
            }
        } finally {
            if (!abortController.signal.aborted) {
                setLoading(false);
            }
        }
    }, [
        currentPage,
        pageSize,
        debouncedSearchQuery,
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
        dateRange,
    ]);

    // Fetch RoomTypes khi filters thay đổi
    useEffect(() => {
        fetchRoomTypes();

        // Cleanup function để cancel request khi component unmount hoặc dependencies thay đổi
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
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
        setTotalGuests(0);
        setShowRoomSuggestions(false);
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

    // Disable dates: chỉ disable ngày quá khứ, cho phép chọn lại ngày nhận
    const disabledDate: RangePickerProps['disabledDate'] = (current) => {
        if (!current) return false;
        const today = dayjs().startOf('day');
        const currentDate = current.startOf('day');

        // Chỉ disable ngày quá khứ, cho phép chọn lại ngày nhận
        return currentDate.isBefore(today);
    };

    // Xử lý chọn ngày
    const handleDateChange: RangePickerProps['onChange'] = (dates) => {
        const newRange = dates as [Dayjs | null, Dayjs | null] | null;

        // Kiểm tra nếu ngày nhận phòng và trả phòng trùng nhau
        if (newRange && newRange[0] && newRange[1]) {
            if (newRange[0].isSame(newRange[1], 'day')) {
                message.warning('Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 ngày!');
                return; // Không cập nhật state
            }

            // Kiểm tra ngày checkout phải sau ngày checkin
            if (!newRange[1].isAfter(newRange[0], 'day')) {
                message.warning('Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 ngày!');
                return; // Không cập nhật state
            }
        }

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

        if (!selectedRoomTypes || selectedRoomTypes.length === 0) {
            message.warning('Vui lòng chọn ít nhất một loại phòng!');
            return;
        }

        if (!dateRange || !dateRange[0] || !dateRange[1]) {
            message.warning('Vui lòng chọn ngày nhận và trả phòng!');
            return;
        }

        // Validate sức chứa tổng so với desiredGuests (nếu người dùng đã nhập)
        if (desiredGuests && desiredGuests > 0) {
            // Tính tổng số phòng
            const totalRooms = selectedRoomTypes.reduce((sum, item) => {
                return sum + (item.quantity || 1);
            }, 0);

            // Validate: Số phòng không được nhiều hơn số khách muốn đặt
            if (totalRooms > desiredGuests) {
                message.error(`Bạn đang đặt ${totalRooms} phòng, nhiều hơn số khách muốn đặt (${desiredGuests} người). Vui lòng giảm bớt số phòng.`);
                return;
            }

            // Chỉ tính sức chứa người lớn (max_adults) để so sánh với số khách
            const totalCapacity = selectedRoomTypes.reduce((sum, item) => {
                const qty = item.quantity || 1;
                const cap = item.maxAdults || 2; // Chỉ tính max_adults
                return sum + qty * cap;
            }, 0);

            if (totalCapacity < desiredGuests) {
                message.error(`Tổng sức chứa (${totalCapacity} người) nhỏ hơn số khách bạn nhập (${desiredGuests}). Vui lòng thêm thêm phòng.`);
                return;
            }
            // Cho phép đặt phòng khi sức chứa >= số khách mong muốn
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

    // Xử lý xem chi tiết loại phòng - Navigate đến page detail
    const handleViewDetail = (roomTypeId: number) => {
        navigate(`/room-types/${roomTypeId}`);
    };

    // Fetch reviews cho RoomType
    const fetchRoomTypeReviews = async (roomTypeId: number, page: number = 1) => {
        setLoadingReviews(true);
        try {
            const response = await getRoomTypeReviews(roomTypeId, {
                page,
                per_page: 5,
            });
            if (response.success && response.data) {
                setReviews(response.data);
                setReviewsPage(page);
                if (response.meta) {
                    setReviewsTotal(response.meta.pagination?.total || 0);
                    setAverageRating(response.meta.average_rating || 0);
                }
            }
        } catch (error: any) {
            console.error('Error fetching room type reviews:', error);
        } finally {
            setLoadingReviews(false);
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
            {/* Hero Section */}
            <section style={{
                position: 'relative',
                height: 450,
                backgroundImage: "url('/img/bg-img/bg-6.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(26,26,26,0.8) 100%)',
                    zIndex: 1,
                }} />
                <div style={{
                    position: 'relative',
                    zIndex: 2,
                    textAlign: 'center',
                    padding: '0 20px',
                }}>
                    <div style={{
                        width: 60,
                        height: 3,
                        background: 'linear-gradient(90deg, #cb8670, #e0a090)',
                        margin: '0 auto 25px',
                        borderRadius: 2,
                    }} />
                    <Title 
                        level={1} 
                        style={{ 
                            color: '#fff', 
                            fontSize: 52, 
                            fontWeight: 400,
                            marginBottom: 20,
                        }}
                    >
                        Phòng Nghỉ Của Chúng Tôi
                    </Title>
                    <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 25 }}>
                        Khám phá không gian nghỉ dưỡng sang trọng và tiện nghi
                    </Paragraph>
                    <Breadcrumb
                        style={{ justifyContent: 'center', display: 'flex' }}
                        items={[
                            {
                                title: (
                                    <Link to="/" style={{ color: '#cb8670', fontSize: 15 }}>
                                        <HomeOutlined /> Trang chủ
                                    </Link>
                                ),
                            },
                            {
                                title: <span style={{ color: '#fff', fontSize: 15 }}>Phòng</span>,
                            },
                        ]}
                    />
                </div>
            </section>

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
                                    {(debouncedSearchQuery || (selectedAmenityIds?.length || 0) > 0) && (
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
                                <Space className="search-actions-wrapper">
                                    {/* DatePicker cho ngày check-in/check-out */}
                                    <div className="date-picker-wrapper">
                                        <RangePicker
                                            format="DD/MM/YYYY"
                                            placeholder={['Nhận phòng', 'Trả phòng']}
                                            value={dateRange}
                                            onChange={handleDateChange}
                                            disabledDate={disabledDate}
                                            allowClear
                                            className="date-range-picker"
                                        />
                                    </div>
                                    {/* Input tổng số khách liên kết với chia phòng thông minh */}
                                    <Space.Compact>
                                        <InputNumber
                                            min={0}
                                            max={100}
                                            value={totalGuests}
                                            style={{ width: 140 }}
                                            placeholder="Số khách"
                                            onChange={(value) => {
                                                // Cho phép để trống: khi user xóa hết -> value === null
                                                if (value === null || value === undefined) {
                                                    setTotalGuests(null);
                                                    // Khi không nhập gì, không dùng desiredGuests để kiểm tra sức chứa
                                                    setDesiredGuests(0);
                                                    return;
                                                }

                                                const guests = Number(value) || 0;
                                                setTotalGuests(guests);
                                                setDesiredGuests(guests);
                                            }}
                                        />
                                        <Button type="default" disabled style={{ pointerEvents: 'none' }}>người</Button>
                                    </Space.Compact>
                                    {/* Nút tìm / chia phòng thông minh */}
                                    <Button
                                        type="default"
                                        onClick={() => {
                                            const guests = totalGuests || 0;
                                            setDesiredGuests(guests);
                                            if (guests < 2) {
                                                message.warning('Vui lòng nhập số khách (ít nhất 2) để gợi ý chia phòng phù hợp.');
                                                return;
                                            }
                                            if (!dateRange || !dateRange[0] || !dateRange[1]) {
                                                message.warning('Vui lòng chọn ngày nhận và trả phòng trước khi tìm phòng phù hợp.');
                                                return;
                                            }
                                            setShowRoomSuggestions(true);
                                        }}
                                    >
                                        Tìm nhanh
                                    </Button>
                                    {/* Booking Cart Button */}
                                    <Badge count={selectedRoomTypes?.length || 0} showZero={false} className="booking-cart-badge">
                                        <Button
                                            type="primary"
                                            icon={<ShoppingCartOutlined />}
                                            onClick={() => setCartVisible(true)}
                                            className="booking-cart-btn"
                                        >
                                            <span className="btn-text">Giỏ hàng</span>
                                        </Button>
                                    </Badge>
                                </Space>
                            </Col>
                        </Row>
                    </div>

                    {/* Button mở Filter Modal - Thay thế sidebar */}
                    <div className="filter-sort-bar">
                        <Button
                            type="default"
                            icon={<FilterOutlined />}
                            onClick={() => setFilterModalVisible(true)}
                            className="filter-btn"
                        >
                            Bộ lọc
                            {((selectedAmenityIds?.length || 0) > 0 || (selectedKeyAmenityIds?.length || 0) > 0 ||
                                (selectedViewIds?.length || 0) > 0 || (selectedFloorIds?.length || 0) > 0 ||
                                (priceRange?.[0] || 0) > 0 || (priceRange?.[1] || 5000000) < 5000000 || minRating > 0 ||
                                maxAdults > 1 || maxChildren > 0) && (
                                    <Badge count={(selectedAmenityIds?.length || 0) + (selectedKeyAmenityIds?.length || 0) +
                                        (selectedViewIds?.length || 0) + (selectedFloorIds?.length || 0) +
                                        ((priceRange?.[0] || 0) > 0 || (priceRange?.[1] || 5000000) < 5000000 ? 1 : 0) +
                                        (minRating > 0 ? 1 : 0) + (maxAdults > 1 ? 1 : 0) + (maxChildren > 0 ? 1 : 0)}
                                        offset={[8, 0]} />
                                )}
                        </Button>
                        <div className="sort-section">
                            <Text className="sort-label">Sắp xếp:</Text>
                            <Select
                                value={getSortDisplayValue()}
                                onChange={handleSortChange}
                                className="sort-select"
                            >
                                <Option value="default">Mặc định</Option>
                                <Option value="best-seller">Bán chạy</Option>
                                <Option value="price-asc">Giá ↑</Option>
                                <Option value="price-desc">Giá ↓</Option>
                                <Option value="rating">Đánh giá</Option>
                                <Option value="name">Tên A-Z</Option>
                            </Select>
                        </div>
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
                                                        styles={{ body: { padding: 0 } }}
                                                        style={{
                                                            borderRadius: 12,
                                                            overflow: 'hidden',
                                                            height: '100%',
                                                            // Chỉ làm mờ khi đã chọn ngày và hết phòng
                                                            opacity: (dateRange && dateRange[0] && dateRange[1] && availableCount === 0) ? 0.7 : 1,
                                                        }}
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
                                                                    <ImageWithFallback
                                                                        src={roomTypeImage}
                                                                        alt={roomType.name}
                                                                        fallbackSrc="/img/bg-img/placeholder.jpg"
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            objectFit: 'cover',
                                                                            transition: 'transform 0.3s ease'
                                                                        }}
                                                                        className="room-image-hover"
                                                                    />
                                                                    {/* Badge số lượng còn trống / hết phòng */}
                                                                    {/* Chỉ hiển thị "Hết phòng" khi đã chọn ngày và availableCount = 0 */}
                                                                    {(() => {
                                                                        const hasDateRange = dateRange && dateRange[0] && dateRange[1];
                                                                        if (hasDateRange && availableCount === 0) {
                                                                            return (
                                                                                <div
                                                                                    style={{
                                                                                        position: 'absolute',
                                                                                        top: 12,
                                                                                        right: 12,
                                                                                        background: 'rgba(0, 0, 0, 0.6)',
                                                                                        color: 'white',
                                                                                        padding: '4px 12px',
                                                                                        borderRadius: 4,
                                                                                        fontSize: 12,
                                                                                        fontWeight: 'bold',
                                                                                    }}
                                                                                >
                                                                                    Hết phòng
                                                                                </div>
                                                                            );
                                                                        } else if (availableCount > 0) {
                                                                            return (
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
                                                                                        fontWeight: 'bold',
                                                                                    }}
                                                                                >
                                                                                    Còn {availableCount} phòng
                                                                                </div>
                                                                            );
                                                                        }
                                                                        // Không hiển thị badge khi chưa chọn ngày
                                                                        return null;
                                                                    })()}
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
                                                                                    disabled={!dateRange || !dateRange[0] || !dateRange[1] || (dateRange && dateRange[0] && dateRange[1] && availableCount === 0)}
                                                                                >
                                                                                    Thêm vào booking
                                                                                </Button>
                                                                            )}
                                                                            <Button
                                                                                type="default"
                                                                                block
                                                                                style={{
                                                                                    backgroundColor: '#fff',
                                                                                    borderColor: '#cb8670',
                                                                                    color: '#cb8670',
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
                        <span>Booking Cart ({(selectedRoomTypes?.length || 0)} loại phòng)</span>
                    </Space>
                }
                placement="right"
                onClose={() => setCartVisible(false)}
                open={cartVisible}
                width={400}
                extra={
                    (selectedRoomTypes?.length || 0) > 0 && (
                        <Button type="link" danger onClick={handleClearCart} size="small">
                            Xóa tất cả
                        </Button>
                    )
                }
            >
                {(!selectedRoomTypes || selectedRoomTypes.length === 0) ? (
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
                            dataSource={selectedRoomTypes || []}
                            renderItem={(item) => {
                                const roomTypeImage = getRoomTypeImage(item.roomType);
                                const quantity = item.quantity || 1;

                                // Lấy available_count mới nhất từ danh sách roomTypes (từ API) thay vì dùng giá trị cũ trong cart
                                const currentRoomType = roomTypes.find(rt => rt.id === item.roomType.id);
                                const latestAvailableCount = currentRoomType?.available_count ?? (item.roomType as any).available_count ?? 0;

                                // Tính tổng số lượng của cùng RoomType đã có trong cart (bao gồm cả item hiện tại)
                                const totalQuantityInCart = (selectedRoomTypes || []).reduce((sum, cartItem) => {
                                    if (cartItem.roomType.id === item.roomType.id) {
                                        return sum + (cartItem.quantity || 1);
                                    }
                                    return sum;
                                }, 0);

                                // Số lượng của item hiện tại
                                const currentItemQuantity = item.quantity || 1;

                                // Số lượng của các item khác cùng RoomType (không bao gồm item hiện tại)
                                const otherItemsQuantity = totalQuantityInCart - currentItemQuantity;

                                // Số lượng tối đa có thể đặt cho item hiện tại = available_count mới nhất - số lượng đã có của các item khác
                                // Nếu không tìm thấy trong roomTypes, dùng giá trị từ cart và trừ đi số lượng đã có trong cart
                                const maxQuantity = Math.max(1, latestAvailableCount - otherItemsQuantity);

                                // Debug log (chỉ trong dev mode)
                                if (import.meta.env.DEV) {
                                    console.log(`RoomType ${item.roomType.name}:`, {
                                        latestAvailableCount,
                                        totalQuantityInCart,
                                        currentItemQuantity,
                                        otherItemsQuantity,
                                        maxQuantity
                                    });
                                }

                                return (
                                    <List.Item
                                        style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}
                                    >
                                        <Row gutter={16} style={{ width: '100%' }}>
                                            <Col flex="80px">
                                                <Image
                                                    src={roomTypeImage}
                                                    alt={item.roomType.name}
                                                    width={80}
                                                    height={80}
                                                    style={{ objectFit: 'cover', borderRadius: 8 }}
                                                    preview={false}
                                                />
                                            </Col>
                                            <Col flex="auto" style={{ minWidth: 0 }}>
                                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                    <Text strong style={{ fontSize: 14, display: 'block' }}>
                                                        {item.roomType.name}
                                                    </Text>
                                                    <Space wrap style={{ width: '100%' }}>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>Số lượng:</Text>
                                                        <InputNumber
                                                            min={1}
                                                            max={maxQuantity}
                                                            value={quantity}
                                                            onChange={(value) => {
                                                                if (value && value > 0) {
                                                                    // Lấy available_count mới nhất
                                                                    const currentRoomType = roomTypes.find(rt => rt.id === item.roomType.id);
                                                                    const latestAvailableCount = currentRoomType?.available_count || (item.roomType as any).available_count || 0;

                                                                    // Tính lại maxQuantity: available_count mới nhất - số lượng của các item khác (không đổi)
                                                                    // otherItemsQuantity không thay đổi vì chỉ tính các item khác, không tính item hiện tại
                                                                    const newMaxQuantity = Math.max(1, latestAvailableCount - otherItemsQuantity);

                                                                    if (value <= newMaxQuantity) {
                                                                        updateRoomTypeQuantity(item.roomType.id, value);
                                                                    } else {
                                                                        message.warning(`Chỉ còn ${newMaxQuantity} phòng trống cho loại phòng này${otherItemsQuantity > 0 ? ` (đã có ${otherItemsQuantity} phòng khác trong cart)` : ''}`);
                                                                        updateRoomTypeQuantity(item.roomType.id, newMaxQuantity);
                                                                    }
                                                                }
                                                            }}
                                                            size="small"
                                                            style={{ width: 80 }}
                                                        />
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            phòng (tối đa: {maxQuantity})
                                                        </Text>
                                                    </Space>
                                                    {item.checkIn && item.checkOut && (
                                                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                                                            {item.checkIn} → {item.checkOut}
                                                        </Text>
                                                    )}
                                                    {item.nights && (
                                                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                                                            {item.nights} đêm
                                                        </Text>
                                                    )}
                                                    <Text strong style={{ color: '#cb8670', fontSize: 14, display: 'block' }}>
                                                        {formatVND(item.totalPrice || 0)}
                                                        {quantity > 1 && (
                                                            <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
                                                                ({formatVND((item.pricePerNight || 0) * (item.nights || 1))} x {quantity})
                                                            </Text>
                                                        )}
                                                    </Text>
                                                </Space>
                                            </Col>
                                            <Col flex="none">
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => removeRoomTypeFromCart(item.roomType.id)}
                                                    size="small"
                                                    style={{ padding: '4px 8px' }}
                                                >
                                                    Xóa
                                                </Button>
                                            </Col>
                                        </Row>
                                    </List.Item>
                                );
                            }}
                        />

                        <Divider />

                        {/* Tổng tiền + Validate sức chứa */}
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
                                        {(selectedRoomTypes?.length || 0)} loại phòng, {(selectedRoomTypes || []).reduce((sum, item) => sum + (item.quantity || 1), 0)} phòng
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

                            {/* Thông tin sức chứa so với số khách mong muốn */}
                            {desiredGuests > 0 && (
                                <div style={{ marginTop: 12 }}>
                                    {(() => {
                                        const totalRooms = (selectedRoomTypes || []).reduce((sum, item) => {
                                            return sum + (item.quantity || 1);
                                        }, 0);

                                        // Chỉ tính sức chứa người lớn (max_adults) để so sánh với số khách
                                        const totalCapacity = (selectedRoomTypes || []).reduce((sum, item) => {
                                            const qty = item.quantity || 1;
                                            const cap = item.maxAdults || 2; // Chỉ tính max_adults
                                            return sum + qty * cap;
                                        }, 0);

                                        // Validate số phòng không được nhiều hơn số khách
                                        if (totalRooms > desiredGuests) {
                                            return (
                                                <Text type="danger" style={{ fontSize: 12, display: 'block' }}>
                                                    Bạn đang đặt <strong>{totalRooms}</strong> phòng, nhiều hơn số khách muốn đặt (<strong>{desiredGuests}</strong> người). 
                                                    Vui lòng giảm bớt số phòng.
                                                </Text>
                                            );
                                        }

                                        if (totalCapacity < desiredGuests) {
                                            return (
                                                <Text type="danger" style={{ fontSize: 12, display: 'block' }}>
                                                    Tổng sức chứa hiện tại là <strong>{totalCapacity}</strong> người, 
                                                    nhỏ hơn số khách bạn nhập là <strong>{desiredGuests}</strong>. 
                                                    Vui lòng thêm thêm phòng.
                                                </Text>
                                            );
                                        }

                                        // Hiển thị thông tin - không cần cảnh báo nếu sức chứa >= số khách
                                        return (
                                            <Text type="success" style={{ fontSize: 12, display: 'block' }}>
                                                Sức chứa tối đa <strong>{totalCapacity}</strong> người phù hợp với số khách mong muốn <strong>{desiredGuests}</strong>.
                                            </Text>
                                        );
                                    })()}
                                </div>
                            )}
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
                            disabled={(() => {
                                if (!desiredGuests || desiredGuests <= 0) return false;
                                
                                // Validate số phòng không được nhiều hơn số khách
                                const totalRooms = (selectedRoomTypes || []).reduce((sum, item) => {
                                    return sum + (item.quantity || 1);
                                }, 0);
                                if (totalRooms > desiredGuests) return true;

                                // Chỉ kiểm tra sức chứa (max_adults) phải đủ cho số khách
                                const totalCapacity = (selectedRoomTypes || []).reduce((sum, item) => {
                                    const qty = item.quantity || 1;
                                    const cap = item.maxAdults || 2; // Chỉ tính max_adults
                                    return sum + qty * cap;
                                }, 0);
                                if (totalCapacity < desiredGuests) return true;
                                // Cho phép đặt khi sức chứa >= số khách mong muốn
                                return false;
                            })()}
                        >
                            Đặt phòng ngay ({selectedRoomTypes.reduce((sum, item) => sum + (item.quantity || 1), 0)} phòng)
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

                            {/* 🎯 Chia phòng thông minh cho nhóm đông 
                                (ô nhập số khách đã được đưa ra thanh trên cùng cạnh chọn ngày) */}

                            {/* Nhóm khách */}
                            <div style={{ marginBottom: 24 }}>
                                <Text strong style={{ display: 'block', marginBottom: 12 }}>
                                    Nhóm khách (cách khác)
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
                                            {(!amenities || amenities.filter(amenity => amenity.filter_category === 'key_amenity').length === 0) && (
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
                                            {(!amenities || amenities.filter(amenity => amenity.filter_category === 'view').length === 0) && (
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
                                            {(!amenities || amenities.filter(amenity => amenity.filter_category === 'floor').length === 0) && (
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Không có thông tin tầng
                                                </Text>
                                            )}
                                        </Space>
                                    </Checkbox.Group>
                                )}
                            </div>

                            {/* Bộ lọc tiện ích đã được ẩn. Tiện ích/dịch vụ hiện là thông tin chung cấp homestay. */}
                        </Col>
                    </Row>
                </div>
            </Modal>

            {/* Modal Gợi ý chia phòng thông minh */}
            <Modal
                title={
                    <Space>
                        <span>🎯</span>
                        <span>Gợi ý chia phòng cho {totalGuests} khách</span>
                    </Space>
                }
                open={showRoomSuggestions && totalGuests >= 2}
                onCancel={() => setShowRoomSuggestions(false)}
                footer={null}
                width={900}
                centered
            >
                {!dateRange || !dateRange[0] || !dateRange[1] ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <CalendarOutlined style={{ fontSize: 48, color: '#999', marginBottom: 16 }} />
                        <Title level={4} style={{ color: '#999' }}>Vui lòng chọn ngày nhận - trả phòng trước</Title>
                        <Text type="secondary">Hệ thống cần biết ngày để kiểm tra phòng còn trống</Text>
                    </div>
                ) : roomSuggestions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Empty
                            description={
                                <span>
                                    Không đủ phòng trống cho {totalGuests} khách trong khoảng thời gian đã chọn.
                                    <br />
                                    Vui lòng thử chọn ngày khác hoặc giảm số lượng khách.
                                </span>
                            }
                        />
                    </div>
                ) : (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div style={{
                            padding: 16,
                            background: '#f0f5ff',
                            borderRadius: 8,
                            border: '1px solid #d6e4ff'
                        }}>
                            <Text>
                                <strong>Ngày nhận phòng:</strong> {dateRange[0]?.format('DD/MM/YYYY')} →
                                <strong> Ngày trả phòng:</strong> {dateRange[1]?.format('DD/MM/YYYY')}
                                <span style={{ marginLeft: 16, color: '#1890ff' }}>
                                    ({dateRange[1]?.diff(dateRange[0], 'day')} đêm)
                                </span>
                            </Text>
                        </div>

                        {roomSuggestions.map((suggestion, index) => (
                            <Card
                                key={suggestion.type}
                                size="small"
                                style={{
                                    borderRadius: 12,
                                    border: suggestion.type === 'optimal' ? '2px solid #52c41a' : '1px solid #e8e8e8',
                                    background: suggestion.type === 'optimal' ? '#f6ffed' : 'white'
                                }}
                                title={
                                    <Space>
                                        <span style={{ fontSize: 18 }}>{suggestion.label}</span>
                                        {suggestion.type === 'optimal' && (
                                            <Badge count="Đề xuất" style={{ backgroundColor: '#52c41a' }} />
                                        )}
                                    </Space>
                                }
                                extra={
                                    <Button
                                        type={suggestion.type === 'optimal' ? 'primary' : 'default'}
                                        onClick={() => applyRoomSuggestion(suggestion)}
                                        icon={<ShoppingCartOutlined />}
                                    >
                                        Áp dụng
                                    </Button>
                                }
                            >
                                <Row gutter={[16, 16]}>
                                    <Col span={24}>
                                        <Text type="secondary">{suggestion.description}</Text>
                                    </Col>
                                    <Col span={24}>
                                        <Space wrap size={[8, 8]}>
                                            {suggestion.rooms.map((room, idx) => (
                                                <Card
                                                    key={idx}
                                                    size="small"
                                                    style={{
                                                        width: 200,
                                                        borderRadius: 8,
                                                        background: '#fafafa'
                                                    }}
                                                >
                                                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                                        <Text strong style={{ fontSize: 13 }}>
                                                            {room.roomType.name}
                                                        </Text>
                                                        <Space split={<Divider type="vertical" />}>
                                                            <Text type="secondary" style={{ fontSize: 11 }}>
                                                                <UserOutlined /> {room.roomType.max_adults || 2} người/phòng
                                                            </Text>
                                                            <Text style={{ fontSize: 11, color: '#1890ff' }}>
                                                                x{room.quantity} phòng
                                                            </Text>
                                                        </Space>
                                                        <Text style={{ color: '#f5222d', fontSize: 12 }}>
                                                            {formatVND((room.roomType.price_per_night || 0) * room.quantity)}/đêm
                                                        </Text>
                                                    </Space>
                                                </Card>
                                            ))}
                                        </Space>
                                    </Col>
                                    <Col span={24}>
                                        <Divider style={{ margin: '8px 0' }} />
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Text type="secondary">Tổng phòng:</Text>
                                                <br />
                                                <Text strong style={{ fontSize: 16 }}>{suggestion.totalRooms} phòng</Text>
                                            </Col>
                                            <Col span={6}>
                                                <Text type="secondary">Sức chứa:</Text>
                                                <br />
                                                <Text strong style={{ fontSize: 16 }}>{suggestion.totalCapacity} người</Text>
                                                {suggestion.wastedCapacity > 0 && (
                                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                                        {' '}(+{suggestion.wastedCapacity} dư)
                                                    </Text>
                                                )}
                                            </Col>
                                            <Col span={12}>
                                                <Text type="secondary">Tổng tiền/đêm:</Text>
                                                <br />
                                                <Text strong style={{ fontSize: 18, color: '#f5222d' }}>
                                                    {formatVND(suggestion.totalPrice)}
                                                </Text>
                                                <Text type="secondary" style={{ fontSize: 11 }}>
                                                    {' '}≈ {formatVND(Math.round(suggestion.totalPrice / totalGuests))}/người
                                                </Text>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Card>
                        ))}

                        <div style={{
                            padding: 12,
                            background: '#fffbe6',
                            borderRadius: 8,
                            border: '1px solid #ffe58f'
                        }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                💡 <strong>Lưu ý:</strong> Giá hiển thị là giá/đêm. Tổng tiền sẽ được tính dựa trên số đêm lưu trú.
                                Bạn có thể điều chỉnh số lượng phòng sau khi thêm vào giỏ hàng.
                            </Text>
                        </div>
                    </Space>
                )}
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

                            {/* Đánh giá */}
                            <Divider />
                            <div>
                                <Title level={5}>Đánh giá từ khách hàng</Title>
                                {averageRating > 0 && (
                                    <Space style={{ marginBottom: 16 }}>
                                        <Rate disabled defaultValue={averageRating} allowHalf />
                                        <Text strong>{averageRating.toFixed(1)}</Text>
                                        <Text type="secondary">({reviewsTotal} đánh giá)</Text>
                                    </Space>
                                )}
                                {loadingReviews ? (
                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                        <Spin />
                                    </div>
                                ) : reviews.length > 0 ? (
                                    <List
                                        dataSource={reviews}
                                        renderItem={(review: any) => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar
                                                            src={review.user?.avatar}
                                                            icon={<UserOutlined />}
                                                        />
                                                    }
                                                    title={
                                                        <Space>
                                                            <Text strong>{review.user?.full_name || 'Khách hàng'}</Text>
                                                            <Rate disabled defaultValue={review.rating} style={{ fontSize: 12 }} />
                                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                                {review.reviewed_at ? new Date(review.reviewed_at).toLocaleDateString('vi-VN') : ''}
                                                            </Text>
                                                        </Space>
                                                    }
                                                    description={
                                                        <div>
                                                            {review.title && (
                                                                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                                                    {review.title}
                                                                </Text>
                                                            )}
                                                            {review.comment && (
                                                                <Paragraph style={{ marginBottom: 0 }}>
                                                                    {review.comment}
                                                                </Paragraph>
                                                            )}
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <Text type="secondary">Chưa có đánh giá nào</Text>
                                )}
                                {reviewsTotal > 5 && (
                                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                                        <Button
                                            type="link"
                                            onClick={() => {
                                                const nextPage = reviewsPage + 1;
                                                if (selectedRoomTypeDetail) {
                                                    fetchRoomTypeReviews(selectedRoomTypeDetail.id, nextPage);
                                                }
                                            }}
                                            disabled={loadingReviews || reviews.length >= reviewsTotal}
                                        >
                                            Xem thêm đánh giá
                                        </Button>
                                    </div>
                                )}
                            </div>

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
