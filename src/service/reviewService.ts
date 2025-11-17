import api from "../api/axios";
import type { Review } from "../types/review/review";

/**
 * 🎯 Service quản lý Review (Frontend)
 * Gọi API tới backend Laravel
 */
const reviewService = {
  /**
   * GET /reviews
   * Lấy danh sách review, hỗ trợ filter, search, pagination
   */
  async getAll(params?: Record<string, any>): Promise<any> {
    const res = await api.get("/reviews", { params });
    return res.data;
  },

  /**
   * GET /reviews/{id}
   * Lấy chi tiết review
   */
  async getById(id: number | string): Promise<Review> {
    const res = await api.get(`/reviews/${id}`);
    return res.data.data;
  },

  /**
   * POST /reviews
   * Tạo review mới
   */
  async create(data: Partial<Review>): Promise<Review> {
    const res = await api.post("/reviews", data);
    return res.data.data;
  },

  /**
   * PUT /reviews/{id}
   * Cập nhật review
   */
  async update(id: number | string, data: Partial<Review>): Promise<Review> {
    const res = await api.put(`/reviews/${id}`, data);
    return res.data.data;
  },

  /**
   * DELETE /reviews/{id}
   * Xóa review
   */
  async remove(id: number | string): Promise<void> {
    await api.delete(`/reviews/${id}`);
  },

  /**
   * POST /reviews/{id}/approve
   * Phê duyệt review
   */
  async approve(id: number | string, admin_notes?: string): Promise<any> {
    const res = await api.post(`/reviews/${id}/approve`, { admin_notes });
    return res.data.data;
  },

  /**
   * POST /reviews/{id}/reject
   * Từ chối review
   */
  async reject(id: number | string, rejection_reason: string): Promise<any> {
    const res = await api.post(`/reviews/${id}/reject`, {
      admin_notes: rejection_reason,
    });
    return res.data.data;
  },

  /**
   * POST /reviews/{id}/mark-helpful
   */
  async markHelpful(id: number | string): Promise<any> {
    const res = await api.post(`/reviews/${id}/mark-helpful`);
    return res.data.data;
  },

  /**
   * POST /reviews/{id}/mark-not-helpful
   */
  async markNotHelpful(id: number | string): Promise<any> {
    const res = await api.post(`/reviews/${id}/mark-not-helpful`);
    return res.data.data;
  },

  /**
   * GET /reviews/property/{propertyId}
   * Lấy review theo property
   */
  async getByProperty(
    propertyId: number | string,
    params?: Record<string, any>
  ): Promise<any> {
    const res = await api.get(`/reviews/property/${propertyId}`, { params });
    return res.data.data;
  },

  /**
   * GET /reviews/room/{roomId}
   * Lấy review theo room
   */
  async getByRoom(
    roomId: number | string,
    params?: Record<string, any>
  ): Promise<any> {
    const res = await api.get(`/reviews/room/${roomId}`, { params });
    return res.data.data;
  },

  /**
   * GET /reviews/statistics/overview
   * Lấy thống kê review
   */
  async getStatistics(params?: Record<string, any>): Promise<any> {
    const res = await api.get("/reviews/statistics/overview", { params });
    return res.data.data;
  },
};

export default reviewService;
