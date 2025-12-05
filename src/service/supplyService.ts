import api from "../api/axios";
import type { Supply } from "../types/supply/supplies";

/**
 * 🧩 Service quản lý Vật Tư (Supplies)
 * Gọi API tới Laravel backend: /api/supplies/...
 */
const supplyService = {
  // --- 📍 Public API ---
  // Lấy danh sách vật tư (public)
  async getAll(): Promise<Supply[]> {
    const res = await api.get("/supplies");
    // API trả về paginated response: {success: true, data: {current_page: 1, data: [...], ...}}
    if (res.data?.success && res.data?.data) {
      // Nếu là paginated response
      if (res.data.data?.data && Array.isArray(res.data.data.data)) {
        return res.data.data.data;
      }
      // Nếu data là array trực tiếp
      if (Array.isArray(res.data.data)) {
        return res.data.data;
      }
    }
    // Fallback: thử lấy từ res.data trực tiếp
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  // Lấy chi tiết 1 vật tư
  async getById(id: number | string): Promise<Supply> {
    const res = await api.get(`/supplies/${id}`);
    return res.data?.data || res.data || res;
  },

  // Lấy vật tư theo room_id
  async getByRoom(roomId: number | string): Promise<Supply[]> {
    try {
      const res = await api.get(`/supplies/room/${roomId}`);
      const data = res.data.data || res.data;
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      throw error;
    }
  },

  // --- 🔒 Protected API (cần token + role: staff/admin) ---
  // Vật tư sắp hết hàng
  async getLowStock(): Promise<Supply[]> {
    const res = await api.get("/supplies/low-stock/items");
    const data = res.data.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  // Vật tư hết hàng
  async getOutOfStock(): Promise<Supply[]> {
    const res = await api.get("/supplies/out-of-stock/items");
    const data = res.data.data || res.data;
    return Array.isArray(data) ? data : [];
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
};

export default supplyService;
