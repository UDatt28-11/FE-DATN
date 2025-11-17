

import api from "../ApiFromBE/axios";
import { Supply } from "../types/supply/supplies";

/**
 * 🧩 Service quản lý Vật Tư (Supplies)
 * Gọi API tới Laravel backend: /api/supplies/...
 */
const supplyService = {
  // --- 📍 Public API ---
  // Lấy danh sách vật tư (public)
  async getAll(): Promise<Supply[]> {
    const res = await api.get("/supplies");
    
    // Laravel paginate trả về: {success: true, data: {data: [...], current_page: ..., total: ...}}
    if (res.data?.success && res.data?.data) {
      // Nếu là paginated response
      if (res.data.data.data && Array.isArray(res.data.data.data)) {
        return res.data.data.data;
      }
      // Nếu là array trực tiếp
      if (Array.isArray(res.data.data)) {
        return res.data.data;
      }
    }
    
    // Fallback
    if (Array.isArray(res.data?.data?.data)) {
      return res.data.data.data;
    }
    if (Array.isArray(res.data?.data)) {
      return res.data.data;
    }
    if (Array.isArray(res.data)) {
      return res.data;
    }
    
    console.warn("Unexpected response structure in getAll():", res.data);
    return [];
  },

  // Lấy chi tiết 1 vật tư
  async getById(id: number | string): Promise<Supply> {
    const res = await api.get(`/supplies/${id}`);
    return res.data?.data || res.data || res;
  },

  // --- 🔒 Protected API (cần token + role: staff/admin) ---
  // Vật tư sắp hết hàng
  async getLowStock(): Promise<Supply[]> {
    const res = await api.get("/supplies/low-stock/items");
    return res.data.data || res.data;
  },

  // Vật tư hết hàng
  async getOutOfStock(): Promise<Supply[]> {
    const res = await api.get("/supplies/out-of-stock/items");
    return res.data.data || res.data;
  },

  // Thống kê vật tư
  async getStatistics(): Promise<any> {
    const res = await api.get("/supplies/statistics/overview");
    return res.data;
  },

  // --- ✍️ CRUD ---
  // Tạo mới vật tư
  async create(data: Partial<Supply>): Promise<Supply> {
    const res = await api.post("/supplies", data);
    // Xử lý response có thể có nhiều dạng
    return res.data?.data || res.data || res;
  },

  // Cập nhật vật tư
  async update(id: number | string, data: Partial<Supply>): Promise<Supply> {
    const res = await api.put(`/supplies/${id}`, data);
    return res.data?.data || res.data || res;
  },

  // Xóa vật tư
  async remove(id: number | string): Promise<void> {
    await api.delete(`/supplies/${id}`);
  },

  // Điều chỉnh tồn kho (thêm / bớt)
  async adjustStock(id: number | string, amount: number): Promise<Supply> {
    const res = await api.post(`/supplies/${id}/adjust-stock`, { amount });
    return res.data;
  },

  // Lấy danh sách vật tư theo room_id
  async getByRoom(roomId: number | string): Promise<Supply[]> {
    const res = await api.get("/supplies", { params: { room_id: roomId } });
    
    // Laravel paginate trả về: {success: true, data: {data: [...], current_page: ..., total: ...}}
    if (res.data?.success && res.data?.data) {
      // Nếu là paginated response
      if (res.data.data.data && Array.isArray(res.data.data.data)) {
        return res.data.data.data;
      }
      // Nếu là array trực tiếp
      if (Array.isArray(res.data.data)) {
        return res.data.data;
      }
    }
    
    // Fallback: thử các cấu trúc khác
    if (Array.isArray(res.data?.data?.data)) {
      return res.data.data.data;
    }
    if (Array.isArray(res.data?.data)) {
      return res.data.data;
    }
    if (Array.isArray(res.data)) {
      return res.data;
    }
    
    console.warn("Unexpected response structure:", res.data);
    return [];
  },
};

export default supplyService;
