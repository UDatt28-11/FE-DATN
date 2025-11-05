

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
    return res.data.data || res.data;
  },

  // Lấy chi tiết 1 vật tư
  async getById(id: number | string): Promise<Supply> {
    const res = await api.get(`/supplies/${id}`);
    return res.data.data || res.data;
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
     return res.data.data;
  },

  // Cập nhật vật tư
  async update(id: number | string, data: Partial<Supply>): Promise<Supply> {
    const res = await api.put(`/supplies/${id}`, data);
    return res.data;
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
