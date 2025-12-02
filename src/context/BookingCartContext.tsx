import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { message } from 'antd';
import type { Room } from '../types/room/room';
import type { RoomType } from '../types/roomtype/roomtype';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

// Interface cho loại phòng đã chọn trong cart (mô hình mới - đặt theo RoomType)
export interface SelectedRoomType {
    roomType: RoomType;
    quantity?: number; // Số lượng phòng muốn đặt
    checkIn?: string;
    checkOut?: string;
    nights?: number;
    pricePerNight?: number; // Giá mỗi đêm (từ RoomType hoặc Room đầu tiên)
    totalPrice?: number;
    maxAdults?: number; // Từ RoomType hoặc Room mẫu
    maxChildren?: number; // Từ RoomType hoặc Room mẫu
}

// Interface cho phòng đã chọn trong cart (mô hình cũ - giữ lại để backward compatibility)
export interface SelectedRoom {
    room: Room;
    checkIn?: string;
    checkOut?: string;
    nights?: number;
    totalPrice?: number;
}

interface BookingCartContextType {
    // Mô hình mới: RoomType-based booking
    selectedRoomTypes: SelectedRoomType[];
    addRoomTypeToCart: (roomType: RoomType, quantity: number, checkIn: string, checkOut: string, nights: number, pricePerNight: number, maxAdults: number, maxChildren: number) => void;
    removeRoomTypeFromCart: (roomTypeId: number) => void;
    isRoomTypeInCart: (roomTypeId: number) => boolean;
    
    // Mô hình cũ: Room-based booking (giữ lại để backward compatibility)
    selectedRooms: SelectedRoom[];
    addToCart: (room: Room, checkIn: string, checkOut: string, nights: number, totalPrice: number) => void;
    removeFromCart: (roomId: number) => void;
    isInCart: (roomId: number) => boolean;
    
    // Common
    dateRange: [Dayjs | null, Dayjs | null] | null;
    clearCart: () => void;
    setDateRange: (range: [Dayjs | null, Dayjs | null] | null) => void;
    cartVisible: boolean;
    setCartVisible: (visible: boolean) => void;
}

const BookingCartContext = createContext<BookingCartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'booking_cart';
const ROOM_TYPE_CART_STORAGE_KEY = 'booking_room_type_cart'; // Key mới cho RoomType cart
const DATE_RANGE_STORAGE_KEY = 'booking_date_range';

export const BookingCartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Mô hình mới: RoomType-based cart
    const [selectedRoomTypes, setSelectedRoomTypes] = useState<SelectedRoomType[]>(() => {
        try {
            const saved = localStorage.getItem(ROOM_TYPE_CART_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Validate và filter out invalid entries
                return Array.isArray(parsed) ? parsed.filter((item: any) => item?.roomType?.id) : [];
            }
        } catch (e) {
            console.error('Error loading room type cart from localStorage:', e);
        }
        return [];
    });
    
    // Mô hình cũ: Room-based cart (giữ lại để backward compatibility)
    const [selectedRooms, setSelectedRooms] = useState<SelectedRoom[]>(() => {
        try {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Validate và filter out invalid entries
                return Array.isArray(parsed) ? parsed.filter((item: any) => item?.room?.id) : [];
            }
        } catch (e) {
            console.error('Error loading cart from localStorage:', e);
        }
        return [];
    });

    const [dateRange, setDateRangeState] = useState<[Dayjs | null, Dayjs | null] | null>(() => {
        try {
            const saved = localStorage.getItem(DATE_RANGE_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as [string | null, string | null];
                // Convert ISO strings back to Dayjs objects
                if (parsed && Array.isArray(parsed) && parsed.length === 2) {
                    return [
                        parsed[0] ? dayjs(parsed[0]) : null,
                        parsed[1] ? dayjs(parsed[1]) : null
                    ] as [Dayjs | null, Dayjs | null];
                }
            }
        } catch (e) {
            console.error('Error loading date range from localStorage:', e);
        }
        return null;
    });

    const [cartVisible, setCartVisible] = useState<boolean>(false);

    // Save RoomType cart to localStorage
    useEffect(() => {
        try {
            const cartData = selectedRoomTypes.map(item => ({
                roomType: {
                    id: item.roomType.id,
                    name: item.roomType.name,
                    description: item.roomType.description,
                    image_url: item.roomType.image_url,
                    property: item.roomType.property,
                },
                quantity: item.quantity,
                checkIn: item.checkIn,
                checkOut: item.checkOut,
                nights: item.nights,
                pricePerNight: item.pricePerNight,
                totalPrice: item.totalPrice,
                maxAdults: item.maxAdults,
                maxChildren: item.maxChildren,
            }));
            localStorage.setItem(ROOM_TYPE_CART_STORAGE_KEY, JSON.stringify(cartData));
        } catch (e) {
            console.error('Error saving room type cart to localStorage:', e);
        }
    }, [selectedRoomTypes]);

    // Save Room cart to localStorage (backward compatibility)
    useEffect(() => {
        try {
            // Only save room IDs and essential data, not full Room objects
            const cartData = selectedRooms.map(item => ({
                room: {
                    id: item.room.id,
                    name: item.room.name,
                    price_per_night: item.room.price_per_night,
                    max_adults: item.room.max_adults,
                    max_children: item.room.max_children,
                    images: item.room.images,
                    property: item.room.property,
                    roomType: item.room.roomType,
                },
                checkIn: item.checkIn,
                checkOut: item.checkOut,
                nights: item.nights,
                totalPrice: item.totalPrice,
            }));
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
        } catch (e) {
            console.error('Error saving cart to localStorage:', e);
        }
    }, [selectedRooms]);

    // Save date range to localStorage
    useEffect(() => {
        try {
            if (dateRange) {
                // Convert Dayjs to ISO strings for storage
                const dateRangeData = dateRange.map(date => 
                    date ? date.toISOString() : null
                ) as [string | null, string | null];
                localStorage.setItem(DATE_RANGE_STORAGE_KEY, JSON.stringify(dateRangeData));
            } else {
                localStorage.removeItem(DATE_RANGE_STORAGE_KEY);
            }
        } catch (e) {
            console.error('Error saving date range to localStorage:', e);
        }
    }, [dateRange]);

    // Mô hình mới: Thêm RoomType vào cart
    const addRoomTypeToCart = useCallback((
        roomType: RoomType, 
        quantity: number, 
        checkIn: string, 
        checkOut: string, 
        nights: number, 
        pricePerNight: number,
        maxAdults: number,
        maxChildren: number
    ) => {
        setSelectedRoomTypes(prev => {
            // Kiểm tra xem loại phòng đã có trong cart chưa
            const existingIndex = prev.findIndex(item => item.roomType.id === roomType.id);
            
            if (existingIndex >= 0) {
                // Nếu đã có, cập nhật quantity
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: (updated[existingIndex].quantity || 1) + quantity,
                    totalPrice: ((updated[existingIndex].quantity || 1) + quantity) * pricePerNight * nights,
                };
                message.success(`Đã cập nhật số lượng "${roomType.name}" trong booking cart!`);
                return updated;
            }

            const newSelectedRoomType: SelectedRoomType = {
                roomType,
                quantity,
                checkIn,
                checkOut,
                nights,
                pricePerNight,
                totalPrice: quantity * pricePerNight * nights,
                maxAdults,
                maxChildren,
            };

            message.success(`Đã thêm ${quantity} "${roomType.name}" vào booking cart!`);
            return [...prev, newSelectedRoomType];
        });
    }, []);

    // Mô hình cũ: Thêm Room vào cart (backward compatibility)
    const addToCart = useCallback((room: Room, checkIn: string, checkOut: string, nights: number, totalPrice: number) => {
        setSelectedRooms(prev => {
            // Kiểm tra xem phòng đã có trong cart chưa
            const isAlreadySelected = prev.some(item => item.room.id === room.id);
            if (isAlreadySelected) {
                message.warning(`Phòng "${room.name}" đã có trong booking cart!`);
                return prev;
            }

            const newSelectedRoom: SelectedRoom = {
                room,
                checkIn,
                checkOut,
                nights,
                totalPrice,
            };

            message.success(`Đã thêm "${room.name}" vào booking cart!`);
            return [...prev, newSelectedRoom];
        });
    }, []);

    // Mô hình mới: Xóa RoomType khỏi cart
    const removeRoomTypeFromCart = useCallback((roomTypeId: number) => {
        setSelectedRoomTypes(prev => {
            const filtered = prev.filter(item => item.roomType.id !== roomTypeId);
            if (filtered.length < prev.length) {
                message.success('Đã xóa loại phòng khỏi booking cart!');
            }
            return filtered;
        });
    }, []);

    // Mô hình cũ: Xóa Room khỏi cart (backward compatibility)
    const removeFromCart = useCallback((roomId: number) => {
        setSelectedRooms(prev => {
            const filtered = prev.filter(item => item.room.id !== roomId);
            if (filtered.length < prev.length) {
                message.success('Đã xóa phòng khỏi booking cart!');
            }
            return filtered;
        });
    }, []);

    const clearCart = useCallback(() => {
        setSelectedRoomTypes([]);
        setSelectedRooms([]);
        message.success('Đã xóa tất cả khỏi booking cart!');
    }, []);

    const setDateRange = useCallback((range: [Dayjs | null, Dayjs | null] | null) => {
        setDateRangeState(range);
    }, []);

    // Mô hình mới: Kiểm tra RoomType có trong cart không
    const isRoomTypeInCart = useCallback((roomTypeId: number) => {
        return selectedRoomTypes.some(item => item.roomType.id === roomTypeId);
    }, [selectedRoomTypes]);

    // Mô hình cũ: Kiểm tra Room có trong cart không (backward compatibility)
    const isInCart = useCallback((roomId: number) => {
        return selectedRooms.some(item => item.room.id === roomId);
    }, [selectedRooms]);

    const value = useCallback(() => ({
        // Mô hình mới
        selectedRoomTypes,
        addRoomTypeToCart,
        removeRoomTypeFromCart,
        isRoomTypeInCart,
        // Mô hình cũ (backward compatibility)
        selectedRooms,
        addToCart,
        removeFromCart,
        isInCart,
        // Common
        dateRange,
        clearCart,
        setDateRange,
        cartVisible,
        setCartVisible,
    }), [
        selectedRoomTypes, addRoomTypeToCart, removeRoomTypeFromCart, isRoomTypeInCart,
        selectedRooms, addToCart, removeFromCart, isInCart,
        dateRange, clearCart, setDateRange, cartVisible
    ]);

    return (
        <BookingCartContext.Provider value={value()}>
            {children}
        </BookingCartContext.Provider>
    );
};

export const useBookingCart = () => {
    const context = useContext(BookingCartContext);
    if (context === undefined) {
        throw new Error('useBookingCart must be used within a BookingCartProvider');
    }
    return context;
};

