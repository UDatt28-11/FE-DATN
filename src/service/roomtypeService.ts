import axios from './axiosConfig';
import type { RoomType, RoomTypeResponse } from '../types/roomtype/roomtype';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface GetRoomTypesParams {
  property_id?: number;
  status?: 'active' | 'inactive';
  search?: string;
  sort_by?: 'id' | 'name' | 'status' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

const roomtypeService = {
  /**
   * Lấy danh sách room types
   */
  async getRoomTypes(params?: GetRoomTypesParams): Promise<RoomTypeResponse> {
    const response = await axios.get(`${API_URL}/admin/room-types`, { params });
    return response.data;
  },

  /**
   * Lấy danh sách room types đã bị xóa (lịch sử)
   */
  async getHistory(params?: GetRoomTypesParams): Promise<RoomTypeResponse> {
    const response = await axios.get(`${API_URL}/admin/room-types/history`, { params });
    return response.data;
  },

  /**
   * Lấy chi tiết room type theo ID
   */
  async getRoomTypeById(id: number): Promise<RoomTypeResponse> {
    const response = await axios.get(`${API_URL}/admin/room-types/${id}`);
    return response.data;
  },

  /**
   * Tạo room type mới
   */
  async createRoomType(formData: FormData): Promise<RoomTypeResponse> {
    const response = await axios.post(`${API_URL}/admin/room-types`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Cập nhật room type
   */
  async updateRoomType(id: number, formData: FormData): Promise<RoomTypeResponse> {
    const response = await axios.post(`${API_URL}/admin/room-types/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Xóa room type (soft delete)
   */
  async deleteRoomType(id: number): Promise<RoomTypeResponse> {
    const response = await axios.delete(`${API_URL}/admin/room-types/${id}`);
    return response.data;
  },

  /**
   * Xóa vĩnh viễn room type
   */
  async forceDeleteRoomType(id: number): Promise<RoomTypeResponse> {
    const response = await axios.delete(`${API_URL}/admin/room-types/${id}/force`);
    return response.data;
  },

  /**
   * Khôi phục room type đã bị xóa
   */
  async restoreRoomType(id: number): Promise<RoomTypeResponse> {
    const response = await axios.post(`${API_URL}/admin/room-types/${id}/restore`);
    return response.data;
  },

  /**
   * Cập nhật trạng thái room type
   */
  async updateStatus(id: number, status: 'active' | 'inactive'): Promise<RoomTypeResponse> {
    const response = await axios.patch(`${API_URL}/admin/room-types/${id}/status`, { status });
    return response.data;
  },

  /**
   * Lấy room type kèm amenities
   */
  async getRoomTypeWithAmenities(id: number): Promise<RoomTypeResponse> {
    const response = await axios.get(`${API_URL}/admin/room-types/${id}/amenities`);
    return response.data;
  },

  /**
   * Upload hình ảnh cho room type
   */
  async uploadImages(roomTypeId: number, formData: FormData): Promise<{ success: boolean; data: any }> {
    const response = await axios.post(`${API_URL}/admin/room-types/${roomTypeId}/upload-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for image uploads
    });
    return response.data;
  },

  /**
   * Xóa hình ảnh room type
   */
  async deleteImage(imageId: number): Promise<{ success: boolean; message: string }> {
    const response = await axios.delete(`${API_URL}/admin/room-type-images/${imageId}`);
    return response.data;
  },

  /**
   * Xóa nhiều hình ảnh room type cùng lúc
   */
  async bulkDeleteImages(imageIds: number[]): Promise<{ success: boolean; message: string }> {
    const response = await axios.post(`${API_URL}/admin/room-type-images/bulk-delete`, { ids: imageIds });
    return response.data;
  },
};

export default roomtypeService;

