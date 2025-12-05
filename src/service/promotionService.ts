import api from "../api/axios";
import type { Promotion } from "../types/promotion/promotion";

/**
 * 🎁 Service quản lý Mã giảm giá (Promotions)
 * Gọi API tới Laravel backend: /api/promotions/...
 */
const promotionService = {
  // --- 📍 Public API ---

  /**
   * GET /promotions - Lấy danh sách tất cả khuyến mãi
   */
  async getAll(): Promise<Promotion[]> {
    const res = await api.get("/promotions");
    const data = res.data.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * GET /promotions/active - Lấy danh sách khuyến mãi đang hoạt động
   */
  async getActivePromotions(): Promise<Promotion[]> {
    const res = await api.get("/promotions/active");
    const data = res.data.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * GET /promotions/{id} - Lấy chi tiết một khuyến mãi
   */
  async getById(id: number | string): Promise<Promotion> {
    const res = await api.get(`/promotions/${id}`);
    return res.data.data || res.data;
  },

  /**
   * POST /promotions/validate - Kiểm tra mã khuyến mãi có hợp lệ không
   * @param code - Mã khuyến mãi cần kiểm tra
   * @param orderValue - Giá trị đơn hàng (optional)
   */
  async validateCode(
    code: string,
    orderValue?: number
  ): Promise<{
    valid: boolean;
    promotion?: Promotion;
    message?: string;
  }> {
    const res = await api.post("/promotions/validate", {
      code,
      order_value: orderValue,
    });
    return res.data;
  },

  // --- 🔒 Protected API (cần token + role: staff/admin) ---

  /**
   * GET /promotions/statistics/overview - Lấy thống kê tổng quan về khuyến mãi
   */
  async getStatistics(): Promise<any> {
    const res = await api.get("/promotions/statistics/overview");
    return res.data;
  },

  // --- ✍️ CRUD ---

  /**
   * POST /promotions - Tạo mới khuyến mãi
   */
  async create(data: Partial<Promotion>): Promise<Promotion> {
    const res = await api.post("/promotions", data);
    return res.data.data || res.data;
  },

  /**
   * PUT /promotions/{id} - Cập nhật khuyến mãi
   */
  async update(
    id: number | string,
    data: Partial<Promotion>
  ): Promise<Promotion> {
    const res = await api.put(`/promotions/${id}`, data);
    return res.data.data || res.data;
  },

  /**
   * DELETE /promotions/{id} - Xóa khuyến mãi
   */
  async remove(id: number | string): Promise<void> {
    await api.delete(`/promotions/${id}`);
  },
};

export default promotionService;
