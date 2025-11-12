import api from "../ApiFromBE/axios";
import { InvoiceItem } from "../types/invoices/invoice";


const invoiceItemService = {
  async getAll(): Promise<InvoiceItem[]> {
    const res = await api.get("/invoice-items");

    // Laravel pagination hoặc normal case
    if (Array.isArray(res.data)) return res.data;
    if (res.data?.data?.data && Array.isArray(res.data.data.data)) return res.data.data.data;
    if (Array.isArray(res.data?.data)) return res.data.data;

    console.warn("⚠ API không trả đúng định dạng danh sách invoice items", res.data);
    return [];
  },

  async getById(id: number | string): Promise<InvoiceItem> {
    const res = await api.get(`/invoice-items/${id}`);
    return res.data.data || res.data;
  },

  async create(data: Partial<InvoiceItem>): Promise<InvoiceItem> {
    const res = await api.post("/invoice-items", data);
    return res.data.data || res.data;
  },

  async update(id: number | string, data: Partial<InvoiceItem>): Promise<InvoiceItem> {
    const res = await api.put(`/invoice-items/${id}`, data);
    return res.data.data || res.data;
  },

  async remove(id: number | string): Promise<void> {
    await api.delete(`/invoice-items/${id}`);
  },
};

export default invoiceItemService;
