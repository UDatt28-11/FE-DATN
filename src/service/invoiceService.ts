// src/service/invoiceService.ts
import api from "../ApiFromBE/axios";
import { Invoice } from "../types/invoices/invoice";

/**
 * 📄 Service quản lý Hóa Đơn (Invoices)
 * Gọi API tới Laravel backend: /api/invoices/...
 */
const invoiceService = {
  // --- 📍 Public API ---
  // Lấy danh sách hóa đơn
async getAll(): Promise<Invoice[]> {
  const res = await api.get("/invoices");
  const raw = res.data;

  // ✅ Laravel Pagination Format: { success, data: { data: [] } }
  if (Array.isArray(raw?.data?.data)) {
    return raw.data.data;
  }

  // Dự phòng thêm (nếu BE thay đổi)
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw)) return raw;

  console.warn("⚠️ API không trả đúng format mảng.", raw);
  return [];
},


  // Lấy chi tiết hóa đơn theo ID
  async getById(id: number | string): Promise<Invoice> {
    const res = await api.get(`/invoices/${id}`);
    return res.data.data || res.data;
  },

  // --- ✍️ CRUD ---
  async create(data: Partial<Invoice>): Promise<Invoice> {
    const res = await api.post("/invoices", data);
    return res.data.data || res.data;
  },

  async update(id: number | string, data: Partial<Invoice>): Promise<Invoice> {
    const res = await api.put(`/invoices/${id}`, data);
    return res.data.data || res.data;
  },

  async remove(id: number | string): Promise<void> {
    await api.delete(`/invoices/${id}`);
  },

  // --- 🔄 Actions đặc biệt ---
  async markAsPaid(id: number | string): Promise<Invoice> {
    const res = await api.post(`/invoices/${id}/mark-paid`);
    return res.data.data || res.data;
  },

  async refund(id: number | string, amount: number): Promise<Invoice> {
    const res = await api.post(`/invoices/${id}/refund`, { amount });
    return res.data.data || res.data;
  },
};

export default invoiceService;
