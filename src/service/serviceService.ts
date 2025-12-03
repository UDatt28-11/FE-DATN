import api from "../api/axios";
import type { Service, ServiceResponse } from "../types/service/service";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface GetServicesParams {
  property_id?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

interface CreateServiceData {
  property_id: number;
  name: string;
  price: number;
  unit: string;
}

interface UpdateServiceData extends Partial<CreateServiceData> {}

const serviceService = {
  /**
   * GET /admin/services
   * Lấy danh sách dịch vụ (admin)
   */
  async getServices(params?: GetServicesParams): Promise<ServiceResponse> {
    const response = await api.get(`${API_URL}/admin/services`, { params });
    return response.data;
  },

  /**
   * GET /admin/services hoặc /services
   * Lấy danh sách tất cả dịch vụ
   */
  async getAll(params?: { property_id?: number }): Promise<Service[]> {
    try {
      // Thử gọi admin route trước (nếu user là admin)
      const res = await api.get("/admin/services", { 
        params: {
          ...params,
          per_page: 100, // Lấy tất cả services (tối đa 100)
        }
      });
      
      // ServiceController trả về dạng paginated với ServiceResource collection
      // Response format: { success: true, data: ServiceResource[], meta: {...} }
      let data = res.data?.data;
      
      // Nếu data là array của ServiceResource objects, extract ra
      if (Array.isArray(data)) {
        // ServiceResource có thể wrap trong object, cần extract
        return data.map((item: any) => {
          // Nếu item đã là Service object thì return luôn
          if (item.id && item.name) {
            return item;
          }
          // Nếu item là ServiceResource object, extract data
          return item;
        });
      }
      
      // Fallback: nếu data không phải array, thử lấy từ res.data trực tiếp
      if (res.data && Array.isArray(res.data)) {
        return res.data;
      }
      
      console.warn('Unexpected service response format:', res.data);
      return [];
    } catch (error: any) {
      console.error('Error fetching services:', error);
      // Nếu admin route fail, thử public route
      if (error.response?.status === 403 || error.response?.status === 401) {
        try {
          const res = await api.get("/services", { 
            params: {
              ...params,
              per_page: 100,
            }
          });
          let data = res.data?.data || res.data;
          if (Array.isArray(data)) {
            return data;
          }
          return [];
        } catch (publicError: any) {
          console.error('Error fetching services from public route:', publicError);
          throw publicError;
        }
      }
      throw error;
    }
  },

  /**
   * GET /admin/services/{id}
   * Lấy chi tiết một dịch vụ (admin)
   */
  async getServiceById(id: number): Promise<ServiceResponse> {
    const response = await api.get(`${API_URL}/admin/services/${id}`);
    return response.data;
  },

  /**
   * GET /services/{id}
   * Lấy chi tiết một dịch vụ (public)
   */
  async getById(id: number | string): Promise<Service> {
    const res = await api.get(`/services/${id}`);
    return res.data?.data || res.data;
  },

  /**
   * POST /admin/services
   * Tạo dịch vụ mới
   */
  async createService(data: CreateServiceData): Promise<ServiceResponse> {
    const response = await api.post(`${API_URL}/admin/services`, data);
    return response.data;
  },

  /**
   * PUT /admin/services/{id}
   * Cập nhật dịch vụ
   */
  async updateService(id: number, data: UpdateServiceData): Promise<ServiceResponse> {
    const response = await api.put(`${API_URL}/admin/services/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /admin/services/{id}
   * Xóa dịch vụ
   */
  async deleteService(id: number): Promise<ServiceResponse> {
    const response = await api.delete(`${API_URL}/admin/services/${id}`);
    return response.data;
  },
};

export default serviceService;
export type { Service, ServiceResponse };

