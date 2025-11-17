import api from "../api/axios";
import type {
  SupplyLog,
  SupplyLogActivity,
  MovementSummary,
} from "../types/supply/supplyLog";

/**
 * 📋 Supply Log Service - Lịch sử Vật tư
 * Gọi API tới Laravel backend: /api/supply-logs/...
 */
const supplyLogService = {
  // ============================================
  // READ Operations
  // ============================================

  /**
   * GET /supply-logs
   * Lấy danh sách tất cả nhật ký vật tư
   */
  async getAll(params?: Record<string, any>): Promise<SupplyLog[]> {
    const res = await api.get("/supply-logs", { params });
    return res.data.data || res.data;
  },

  /**
   * GET /supply-logs/{id}
   * Lấy chi tiết một nhật ký
   */
  async getById(id: number | string): Promise<SupplyLog> {
    const res = await api.get(`/supply-logs/${id}`);
    return res.data.data || res.data;
  },

  /**
   * GET /supply-logs/supply/{supplyId}
   * Lấy lịch sử của một vật tư cụ thể
   */
  async getSupplyLogs(
    supplyId: number | string,
    params?: Record<string, any>
  ): Promise<SupplyLog[]> {
    const res = await api.get(`/supply-logs/supply/${supplyId}`, { params });
    return res.data.data || res.data;
  },

  /**
   * GET /supply-logs/activities/recent
   * Lấy các hoạt động gần đây
   */
  async getRecentActivities(limit: number = 20): Promise<SupplyLogActivity[]> {
    const res = await api.get("/supply-logs/activities/recent", {
      params: { limit },
    });
    return res.data.data || res.data;
  },

  /**
   * GET /supply-logs/summary/movement
   * Lấy tóm tắt di chuyển vật tư
   */
  async getMovementSummary(params?: {
    supply_id?: number;
    date_from?: string;
    date_to?: string;
    action_type?: string;
  }): Promise<MovementSummary[]> {
    const res = await api.get("/supply-logs/summary/movement", { params });
    return res.data.data || res.data;
  },

  // ============================================
  // FILTER & SEARCH Helpers
  // ============================================

  /**
   * Lọc log theo loại hành động
   */
  async getByActionType(
    actionType: SupplyLog["action_type"],
    params?: Record<string, any>
  ): Promise<SupplyLog[]> {
    const res = await api.get("/supply-logs", {
      params: { ...params, action_type: actionType },
    });
    return res.data.data || res.data;
  },

  /**
   * Lọc log theo khoảng thời gian
   */
  async getByDateRange(
    dateFrom: string,
    dateTo: string,
    params?: Record<string, any>
  ): Promise<SupplyLog[]> {
    const res = await api.get("/supply-logs", {
      params: { ...params, date_from: dateFrom, date_to: dateTo },
    });
    return res.data.data || res.data;
  },

  /**
   * Lọc log theo room
   */
  async getByRoom(
    roomId: number | string,
    params?: Record<string, any>
  ): Promise<SupplyLog[]> {
    const res = await api.get("/supply-logs", {
      params: { ...params, room_id: roomId },
    });
    return res.data.data || res.data;
  },

  /**
   * Lọc log theo user
   */
  async getByUser(
    userId: number | string,
    params?: Record<string, any>
  ): Promise<SupplyLog[]> {
    const res = await api.get("/supply-logs", {
      params: { ...params, user_id: userId },
    });
    return res.data.data || res.data;
  },
};

export default supplyLogService;
