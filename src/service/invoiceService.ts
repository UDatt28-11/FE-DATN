import api from "../api/axios";
import type {
  Invoice,
  InvoiceConfig,
  RefundPolicy,
  InvoiceStatistics,
  CreateInvoiceData,
  UpdateInvoiceData,
  MergeInvoicesData,
  SplitInvoiceData,
  ApplyDiscountData,
  ApplyRefundPolicyData,
} from "../types/invoice/invoice";

/**
 * 💰 Invoice Service - Quản lý Hóa đơn
 * Gọi API tới Laravel backend: /api/invoices/...
 */
const invoiceService = {
  // ============================================
  // READ Operations
  // ============================================

  /**
   * GET /admin/invoices
   * Lấy danh sách tất cả hóa đơn (Admin only)
   */
  async getAll(params?: Record<string, any>): Promise<Invoice[]> {
    try {
      const res = await api.get("/admin/invoices", { params });
      const data = res.data.data || res.data;
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      // Nếu lỗi 401/403, axios interceptor sẽ xử lý redirect
      // Chỉ throw error cho các lỗi khác
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Trả về mảng rỗng thay vì throw để tránh crash
        return [];
      }
      throw error;
    }
  },

  /**
   * GET /admin/invoices/{id}
   * Lấy chi tiết một hóa đơn (Admin only)
   */
  async getById(id: number | string, include?: string): Promise<Invoice> {
    const params = include ? { include } : {};
    const res = await api.get(`/admin/invoices/${id}`, { params });
    return res.data.data || res.data;
  },

  /**
   * GET /admin/invoices/statistics/overview
   * Lấy thống kê tổng quan về hóa đơn (Admin only)
   */
  async getStatistics(
    params?: Record<string, any>
  ): Promise<InvoiceStatistics> {
    try {
      // Gọi admin route (yêu cầu authentication)
      const res = await api.get("/admin/invoices/statistics/overview", { params });
      return res.data.data || res.data;
    } catch (error: any) {
      // Nếu lỗi 401/403, có thể user chưa đăng nhập hoặc không có quyền
      // Axios interceptor sẽ xử lý redirect, không cần log warning
      // Trả về default stats thay vì throw error
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Trả về default stats
        return {
          total_invoices: 0,
          total_revenue: 0,
          paid_invoices: 0,
          unpaid_invoices: 0,
          overdue_invoices: 0,
          cancelled_invoices: 0,
          pending_revenue: 0,
          overdue_revenue: 0,
        } as InvoiceStatistics;
      }
      throw error;
    }
  },

  /**
   * GET /invoices/config/calculation
   * Lấy cấu hình tính toán hóa đơn
   */
  async getCalculationConfig(propertyId?: number): Promise<InvoiceConfig> {
    const res = await api.get("/invoices/config/calculation", {
      params: { property_id: propertyId },
    });
    return res.data.data || res.data;
  },

  /**
   * GET /invoices/config/refund-policies
   * Lấy danh sách chính sách hoàn tiền
   */
  async getRefundPolicies(propertyId?: number): Promise<RefundPolicy[]> {
    const res = await api.get("/invoices/config/refund-policies", {
      params: { property_id: propertyId },
    });
    const data = res.data.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  // ============================================
  // CREATE Operations
  // ============================================

  /**
   * POST /invoices
   * Tạo hóa đơn mới
   */
  async create(data: CreateInvoiceData): Promise<Invoice> {
    const res = await api.post("/invoices", data);
    return res.data.data || res.data;
  },

  /**
   * POST /invoices/create-from-booking
   * Tạo hóa đơn từ booking order
   */
  async createFromBooking(
    bookingOrderId: number,
    options?: { due_date?: string; notes?: string }
  ): Promise<Invoice> {
    const res = await api.post("/invoices/create-from-booking", {
      booking_order_id: bookingOrderId,
      ...options,
    });
    // Xử lý response có thể có nhiều dạng
    return res.data?.data || res.data || res;
  },

  /**
   * POST /invoices/config/calculation
   * Cấu hình tính toán hóa đơn
   */
  async setCalculationConfig(
    config: Partial<InvoiceConfig>
  ): Promise<InvoiceConfig> {
    const res = await api.post("/invoices/config/calculation", config);
    return res.data.data || res.data;
  },

  /**
   * POST /invoices/config/refund-policies
   * Tạo chính sách hoàn tiền mới
   */
  async createRefundPolicy(
    policy: Partial<RefundPolicy>
  ): Promise<RefundPolicy> {
    const res = await api.post("/invoices/config/refund-policies", policy);
    return res.data.data || res.data;
  },

  // ============================================
  // UPDATE Operations
  // ============================================

  /**
   * PUT /invoices/{id}
   * Cập nhật hóa đơn
   */
  async update(id: number | string, data: UpdateInvoiceData): Promise<Invoice> {
    const res = await api.put(`/invoices/${id}`, data);
    return res.data.data || res.data;
  },

  /**
   * POST|PATCH /admin/invoices/{id}/mark-paid
   * Đánh dấu hóa đơn đã thanh toán (Admin only)
   */
  async markAsPaid(
    id: number | string,
    paymentData?: {
      payment_method?: string;
      payment_date?: string;
      payment_notes?: string;
      paid_amount?: number;
    }
  ): Promise<Invoice> {
    const res = await api.post(`/admin/invoices/${id}/mark-paid`, paymentData);
    // Xử lý response có thể có nhiều dạng
    return res.data?.data || res.data || res;
  },

  /**
   * PATCH /admin/invoices/{id}/status
   * Cập nhật trạng thái hóa đơn (Admin only)
   */
  async updateStatus(
    id: number | string,
    status: Invoice["invoice_status"]
  ): Promise<Invoice> {
    const res = await api.patch(`/admin/invoices/${id}/status`, {
      invoice_status: status,
    });
    // Xử lý response có thể có nhiều dạng
    return res.data?.data || res.data || res;
  },

  /**
   * PUT /invoices/config/refund-policies/{policyId}
   * Cập nhật chính sách hoàn tiền
   */
  async updateRefundPolicy(
    policyId: number,
    policy: Partial<RefundPolicy>
  ): Promise<RefundPolicy> {
    const res = await api.put(
      `/invoices/config/refund-policies/${policyId}`,
      policy
    );
    return res.data.data || res.data;
  },

  // ============================================
  // DELETE Operations
  // ============================================

  /**
   * DELETE /invoices/{id}
   * Xóa hóa đơn
   */
  async remove(id: number | string): Promise<void> {
    await api.delete(`/invoices/${id}`);
  },

  /**
   * DELETE /invoices/{id}/discounts/{discountId}
   * Xóa giảm giá khỏi hóa đơn
   */
  async removeDiscount(
    id: number | string,
    discountId: number
  ): Promise<Invoice> {
    const res = await api.delete(`/invoices/${id}/discounts/${discountId}`);
    return res.data.data || res.data;
  },

  // ============================================
  // SPECIAL Operations
  // ============================================

  /**
   * POST /invoices/merge
   * Gộp nhiều hóa đơn thành một
   */
  async merge(data: MergeInvoicesData): Promise<Invoice> {
    const res = await api.post("/invoices/merge", data);
    return res.data.data || res.data;
  },

  /**
   * POST /invoices/{id}/split
   * Tách hóa đơn thành nhiều hóa đơn
   */
  async split(id: number | string, data: SplitInvoiceData): Promise<Invoice[]> {
    const res = await api.post(`/invoices/${id}/split`, data);
    const result = res.data.data || res.data;
    return Array.isArray(result) ? result : [];
  },

  /**
   * POST /invoices/{id}/apply-discount
   * Áp dụng giảm giá cho hóa đơn
   */
  async applyDiscount(
    id: number | string,
    data: ApplyDiscountData
  ): Promise<Invoice> {
    const res = await api.post(`/invoices/${id}/apply-discount`, data);
    return res.data.data || res.data;
  },

  /**
   * POST /invoices/{id}/apply-refund-policy
   * Áp dụng chính sách hoàn tiền
   */
  async applyRefundPolicy(
    id: number | string,
    data: ApplyRefundPolicyData
  ): Promise<Invoice> {
    const res = await api.post(`/invoices/${id}/apply-refund-policy`, data);
    return res.data.data || res.data;
  },

  /**
   * POST /admin/invoices/{id}/add-service
   * Thêm dịch vụ vào hóa đơn (Admin only)
   */
  async addService(
    id: number | string,
    data: {
      service_id: number;
      quantity: number;
      description?: string;
    }
  ): Promise<Invoice> {
    const res = await api.post(`/admin/invoices/${id}/add-service`, data);
    return res.data.data?.invoice || res.data.data || res.data;
  },

  /**
   * POST /admin/invoices/{id}/add-damage
   * Thêm thiệt hại vật tư vào hóa đơn (Admin only)
   */
  async addDamage(
    id: number | string,
    data: {
      supply_id: number;
      quantity: number;
      description?: string;
      notes?: string;
    }
  ): Promise<Invoice> {
    const res = await api.post(`/admin/invoices/${id}/add-damage`, data);
    return res.data.data?.invoice || res.data.data || res.data;
  },

  /**
   * DELETE /admin/invoices/{id}/items/{itemId}
   * Xóa item khỏi hóa đơn (Admin only)
   */
  async removeItem(
    id: number | string,
    itemId: number | string
  ): Promise<Invoice> {
    const res = await api.delete(`/admin/invoices/${id}/items/${itemId}`);
    return res.data.data || res.data;
  },

  /**
   * POST /admin/invoices/{id}/approve-for-payment
   * Xác nhận hóa đơn sẵn sàng thanh toán (Admin only)
   */
  async approveForPayment(id: number | string): Promise<Invoice> {
    const res = await api.post(`/admin/invoices/${id}/approve-for-payment`);
    return res.data.data || res.data;
  },
};

export default invoiceService;
