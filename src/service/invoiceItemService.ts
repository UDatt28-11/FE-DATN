import api from "../api/axios";
import type { InvoiceItem } from "../types/invoice/invoice";

/**
 * 📝 Invoice Item Service - Quản lý Mục hóa đơn
 * Gọi API tới Laravel backend: /api/invoice-items/... & /api/invoices/{invoiceId}/items/...
 */
const invoiceItemService = {
  // ============================================
  // READ Operations - Generic Items
  // ============================================

  /**
   * GET /invoice-items
   * Lấy danh sách tất cả mục hóa đơn
   */
  async getAll(params?: Record<string, any>): Promise<InvoiceItem[]> {
    const res = await api.get("/invoice-items", { params });
    const data = res.data.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * GET /invoice-items/{id}
   * Lấy chi tiết một mục hóa đơn
   */
  async getById(id: number | string): Promise<InvoiceItem> {
    const res = await api.get(`/invoice-items/${id}`);
    return res.data.data || res.data;
  },

  // ============================================
  // READ Operations - By Invoice
  // ============================================

  /**
   * GET /invoices/{invoiceId}/items
   * Lấy danh sách mục hóa đơn theo invoice ID
   */
  async getByInvoice(invoiceId: number | string): Promise<InvoiceItem[]> {
    const res = await api.get(`/invoices/${invoiceId}/items`);
    const data = res.data.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * GET /invoices/{invoiceId}/items/penalties
   * Lấy các mục phạt của hóa đơn
   */
  async getPenaltyItems(invoiceId: number | string): Promise<InvoiceItem[]> {
    const res = await api.get(`/invoices/${invoiceId}/items/penalties`);
    const data = res.data.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * GET /invoices/{invoiceId}/items/regular
   * Lấy các mục thường (không phải phạt) của hóa đơn
   */
  async getRegularItems(invoiceId: number | string): Promise<InvoiceItem[]> {
    const res = await api.get(`/invoices/${invoiceId}/items/regular`);
    const data = res.data.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  // ============================================
  // CREATE Operations
  // ============================================

  /**
   * POST /invoice-items
   * Tạo mục hóa đơn mới
   */
  async create(data: Partial<InvoiceItem>): Promise<InvoiceItem> {
    const res = await api.post("/invoice-items", data);
    return res.data.data || res.data;
  },

  /**
   * POST /invoices/{invoiceId}/items/penalty
   * Thêm mục phạt vào hóa đơn
   */
  async addPenaltyItem(
    invoiceId: number | string,
    data: {
      description: string;
      quantity: number;
      unit_price: number;
      tax_rate?: number;
    }
  ): Promise<InvoiceItem> {
    const res = await api.post(`/invoices/${invoiceId}/items/penalty`, data);
    return res.data.data || res.data;
  },

  /**
   * POST /invoices/{invoiceId}/items/regular
   * Thêm mục thường vào hóa đơn
   */
  async addRegularItem(
    invoiceId: number | string,
    data: {
      item_type: string;
      description: string;
      quantity: number;
      unit_price: number;
      tax_rate?: number;
    }
  ): Promise<InvoiceItem> {
    const res = await api.post(`/invoices/${invoiceId}/items/regular`, data);
    return res.data.data || res.data;
  },

  /**
   * POST /invoice-items/bulk/create
   * Tạo nhiều mục hóa đơn cùng lúc
   */
  async bulkCreate(items: Partial<InvoiceItem>[]): Promise<InvoiceItem[]> {
    const res = await api.post("/invoice-items/bulk/create", { items });
    const data = res.data.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  // ============================================
  // UPDATE Operations
  // ============================================

  /**
   * PUT /invoice-items/{id}
   * Cập nhật mục hóa đơn
   */
  async update(
    id: number | string,
    data: Partial<InvoiceItem>
  ): Promise<InvoiceItem> {
    const res = await api.put(`/invoice-items/${id}`, data);
    return res.data.data || res.data;
  },

  // ============================================
  // DELETE Operations
  // ============================================

  /**
   * DELETE /invoice-items/{id}
   * Xóa mục hóa đơn
   */
  async remove(id: number | string): Promise<void> {
    await api.delete(`/invoice-items/${id}`);
  },

  /**
   * DELETE /invoice-items/bulk/delete
   * Xóa nhiều mục hóa đơn cùng lúc
   */
  async bulkDelete(itemIds: number[]): Promise<void> {
    await api.delete("/invoice-items/bulk/delete", {
      data: { item_ids: itemIds },
    });
  },
};

export default invoiceItemService;
