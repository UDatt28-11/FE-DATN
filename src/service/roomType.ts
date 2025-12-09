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
 * Lấy danh sách RoomType với đầy đủ thông tin (price, amenities, etc.)
 * OPTIMIZED: Backend trả về tất cả dữ liệu trong 1 API call, không cần N+1 queries
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
        // Optimized: Backend now returns all details in a single call
        const limit = params?.per_page ? Math.min(params.per_page, 100) : 100;
        const requestParams: any = {
            limit: limit,
        };
        
        if (params?.check_in && params?.check_out) {
            requestParams.check_in = params.check_in;
            requestParams.check_out = params.check_out;
        }
        
        const response = await api.get<{
            success: boolean;
            data: RoomTypeWithDetails[];
            cached?: boolean;
        }>('/public/room-types', {
            params: requestParams
        });

        if (!response.data.success || !Array.isArray(response.data.data)) {
            return {
                success: false,
                data: [],
                message: 'Không thể lấy danh sách loại phòng'
            };
        }

        // Backend đã trả về đầy đủ thông tin, không cần gọi thêm API
        return {
            success: true,
            data: response.data.data,
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

