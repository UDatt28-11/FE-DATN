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
   * GET /invoices
   * Lấy danh sách tất cả hóa đơn
   */
  async getAll(params?: Record<string, any>): Promise<Invoice[]> {
    const res = await api.get("/invoices", { params });
    return res.data.data || res.data;
  },

  /**
   * GET /invoices/{id}
   * Lấy chi tiết một hóa đơn
   */
  async getById(id: number | string): Promise<Invoice> {
    const res = await api.get(`/invoices/${id}`);
    return res.data.data || res.data;
  },

  /**
   * GET /invoices/statistics/overview
   * Lấy thống kê tổng quan về hóa đơn
   */
  async getStatistics(
    params?: Record<string, any>
  ): Promise<InvoiceStatistics> {
    const res = await api.get("/invoices/statistics/overview", { params });
    return res.data.data || res.data;
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
    return res.data.data || res.data;
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
   * POST|PATCH /invoices/{id}/mark-paid
   * Đánh dấu hóa đơn đã thanh toán
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
    const res = await api.post(`/invoices/${id}/mark-paid`, paymentData);
    // Xử lý response có thể có nhiều dạng
    return res.data?.data || res.data || res;
  },

  /**
   * PATCH /invoices/{id}/status
   * Cập nhật trạng thái hóa đơn
   */
  async updateStatus(
    id: number | string,
    status: Invoice["invoice_status"]
  ): Promise<Invoice> {
    const res = await api.patch(`/invoices/${id}/status`, {
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
    return res.data.data || res.data;
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
};

export default invoiceService;
