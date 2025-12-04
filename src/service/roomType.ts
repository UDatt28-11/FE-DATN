import api from "../api/axios";
import type { RoomType, RoomTypeResponse } from "../types/roomtype/roomtype";
import type { Room } from "../types/room/room";

// Extended RoomType với thông tin từ Room mẫu
export interface RoomTypeWithDetails extends RoomType {
    price_per_night?: number;
    max_adults?: number;
    max_children?: number;
    amenities?: { id: number; name: string; filter_category?: string | null }[];
    images?: { id: number; image_url: string; is_primary: boolean }[];
    rating?: number;
    reviews_count?: number;
    available_count?: number; // Số lượng phòng còn trống
    floor_number?: number; // Số tầng
    floor_category?: 'ground_floor' | 'upper_floor' | 'attic' | null; // Phân loại tầng
}

export interface RoomTypesWithDetailsResponse {
    success: boolean;
    data: RoomTypeWithDetails[];
    meta?: {
        pagination: {
            current_page: number;
            per_page: number;
            total: number;
            last_page: number;
        };
    };
    message?: string;
}

/**
 * Lấy danh sách RoomType với đầy đủ thông tin (price, amenities, etc.) từ Room mẫu
 * @param params Query parameters
 */
export async function getRoomTypesWithDetails(params?: {
    property_id?: number;
    status?: 'active' | 'inactive';
    search?: string;
    check_in?: string; // Format: YYYY-MM-DD
    check_out?: string; // Format: YYYY-MM-DD
    page?: number;
    per_page?: number;
}): Promise<RoomTypesWithDetailsResponse> {
    try {
        // Lấy danh sách RoomType từ API public
        // Backend chỉ chấp nhận limit tối đa 20, nên cần điều chỉnh
        const limit = params?.per_page ? Math.min(params.per_page, 20) : 20;
        // Chỉ gửi check_in và check_out nếu cả hai đều có giá trị
        const requestParams: any = {
            limit: limit,
        };
        
        if (params?.check_in && params?.check_out) {
            requestParams.check_in = params.check_in;
            requestParams.check_out = params.check_out;
        }
        
        const roomTypesResponse = await api.get<RoomTypeResponse>('/public/room-types', {
            params: requestParams
        });

        if (!roomTypesResponse.data.success || !Array.isArray(roomTypesResponse.data.data)) {
            return {
                success: false,
                data: [],
                message: 'Không thể lấy danh sách loại phòng'
            };
        }

        const roomTypes = roomTypesResponse.data.data;
        const roomTypesWithDetails: RoomTypeWithDetails[] = [];

        // Với mỗi RoomType, lấy một Room mẫu để lấy thông tin chi tiết
        for (const roomType of roomTypes) {
            try {
                // Lấy một Room mẫu của RoomType này
                // Backend tự động filter status='available', không cần gửi param status
                const roomRequestParams: any = {
                    room_type_id: roomType.id,
                    per_page: 1,
                };
                
                // Chỉ gửi check_in và check_out nếu cả hai đều có giá trị
                if (params?.check_in && params?.check_out) {
                    roomRequestParams.check_in = params.check_in;
                    roomRequestParams.check_out = params.check_out;
                }
                
                const roomsResponse = await api.get('/rooms', {
                    params: roomRequestParams
                }).catch((error) => {
                    // Nếu lỗi 422 hoặc lỗi khác, log và return null
                    if (error.response?.status === 422) {
                        console.warn(`Validation error for room_type_id ${roomType.id}:`, error.response?.data);
                    } else {
                        console.warn(`Error fetching rooms for room_type_id ${roomType.id}:`, error);
                    }
                    return null;
                });

                let roomTypeWithDetails: RoomTypeWithDetails = {
                    ...roomType,
                    available_count: roomType.rooms_count || 0,
                };

                if (roomsResponse && roomsResponse.data?.success && Array.isArray(roomsResponse.data.data) && roomsResponse.data.data.length > 0) {
                    const sampleRoom = roomsResponse.data.data[0] as Room;
                    
                    // Lấy thông tin từ Room mẫu
                    roomTypeWithDetails = {
                        ...roomTypeWithDetails,
                        price_per_night: sampleRoom.price_per_night,
                        max_adults: sampleRoom.max_adults,
                        max_children: sampleRoom.max_children,
                        amenities: sampleRoom.amenities,
                        images: sampleRoom.images,
                        rating: sampleRoom.rating,
                        reviews_count: sampleRoom.reviews_count,
                    };
                }

                roomTypesWithDetails.push(roomTypeWithDetails);
            } catch (error) {
                // Nếu không lấy được Room mẫu, vẫn thêm RoomType nhưng không có thông tin chi tiết
                console.warn(`Could not fetch sample room for room type ${roomType.id}:`, error);
                roomTypesWithDetails.push({
                    ...roomType,
                    available_count: roomType.rooms_count || 0,
                });
            }
        }

        return {
            success: true,
            data: roomTypesWithDetails,
            meta: roomTypesResponse.data.meta,
        };
    } catch (error: any) {
        console.error('Error fetching room types with details:', error);
        return {
            success: false,
            data: [],
            message: error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách loại phòng'
        };
    }
}

/**
 * Lấy chi tiết RoomType theo ID với đầy đủ thông tin
 * @param id RoomType ID
 */
export async function getRoomTypeByIdWithDetails(
    id: number | string,
    options?: { check_in?: string; check_out?: string }
): Promise<{
    success: boolean;
    data?: RoomTypeWithDetails;
    message?: string;
}> {
    try {
        // Gọi endpoint riêng để lấy chi tiết một RoomType (tối ưu hơn)
        const params: Record<string, string> = {};
        if (options?.check_in) params.check_in = options.check_in;
        if (options?.check_out) params.check_out = options.check_out;
        
        const response = await api.get(`/public/room-types/${id}`, { params });
        
        if (response.data.success && response.data.data) {
            return {
                success: true,
                data: response.data.data as RoomTypeWithDetails,
            };
        }

        return {
            success: false,
            message: response.data.message || 'Không tìm thấy loại phòng'
        };
    } catch (error: any) {
        console.error('Error fetching room type details:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin loại phòng'
        };
    }
}

/**
 * Lấy danh sách reviews của RoomType
 * @param id RoomType ID
 * @param params Query parameters
 */
export async function getRoomTypeReviews(id: number | string, params?: {
    page?: number;
    per_page?: number;
    rating?: number;
}): Promise<{
    success: boolean;
    data?: any[];
    meta?: {
        pagination: {
            current_page: number;
            per_page: number;
            total: number;
            last_page: number;
        };
        average_rating?: number;
        total_reviews?: number;
    };
    message?: string;
}> {
    try {
        const response = await api.get(`/public/room-types/${id}/reviews`, {
            params: {
                page: params?.page || 1,
                per_page: params?.per_page || 10,
                rating: params?.rating,
            }
        });

        if (response.data.success) {
            return {
                success: true,
                data: response.data.data,
                meta: response.data.meta,
            };
        }

        return {
            success: false,
            message: response.data.message || 'Không thể lấy danh sách đánh giá'
        };
    } catch (error: any) {
        console.error('Error fetching room type reviews:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách đánh giá'
        };
    }
}

