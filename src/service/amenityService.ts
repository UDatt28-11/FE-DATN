import axios from './axiosConfig';
import type { Amenity, AmenityResponse } from '../types/amenity/amenity';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface GetAmenitiesParams {
  property_id?: number;
  type?: 'basic' | 'advanced' | 'safety';
  search?: string;
  sort_by?: 'id' | 'name' | 'type' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

interface CreateAmenityData {
  property_id?: number;
  name: string;
  icon_file?: File;
  type: 'basic' | 'advanced' | 'safety';
  category?: string;
}

interface UpdateAmenityData extends Partial<CreateAmenityData> {
  icon_file?: File;
}

const amenityService = {
  /**
   * Lấy danh sách amenities (admin)
   */
  async getAmenities(params?: GetAmenitiesParams): Promise<AmenityResponse> {
    const response = await axios.get(`${API_URL}/admin/amenities`, { params });
    return response.data;
  },

  /**
   * Lấy danh sách amenities đã bị xóa (lịch sử)
   */
  async getHistory(params?: GetAmenitiesParams): Promise<AmenityResponse> {
    const response = await axios.get(`${API_URL}/admin/amenities/history`, { params });
    return response.data;
  },

  /**
   * Lấy chi tiết amenity theo ID (admin)
   */
  async getAmenityById(id: number): Promise<AmenityResponse> {
    const response = await axios.get(`${API_URL}/admin/amenities/${id}`);
    return response.data;
  },

  /**
   * Tạo amenity mới
   */
  async createAmenity(formData: FormData): Promise<AmenityResponse> {
    const response = await axios.post(`${API_URL}/admin/amenities`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Cập nhật amenity
   */
  async updateAmenity(id: number, formData: FormData): Promise<AmenityResponse> {
    const response = await axios.post(`${API_URL}/admin/amenities/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Xóa amenity (soft delete)
   */
  async deleteAmenity(id: number): Promise<AmenityResponse> {
    const response = await axios.delete(`${API_URL}/admin/amenities/${id}`);
    return response.data;
  },

  /**
   * Xóa vĩnh viễn amenity
   */
  async forceDeleteAmenity(id: number): Promise<AmenityResponse> {
    const response = await axios.delete(`${API_URL}/admin/amenities/${id}/force`);
    return response.data;
  },

  /**
   * Khôi phục amenity đã bị xóa
   */
  async restoreAmenity(id: number): Promise<AmenityResponse> {
    const response = await axios.post(`${API_URL}/admin/amenities/${id}/restore`);
    return response.data;
  },

  /**
   * Toggle trạng thái tiện ích (active/inactive)
   */
  async toggleStatus(id: number): Promise<AmenityResponse> {
    const response = await axios.patch(`${API_URL}/admin/amenities/${id}/toggle-status`);
    return response.data;
  },
};

export default amenityService;

