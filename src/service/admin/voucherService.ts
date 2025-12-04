import api from "../../api/axios";

// Types
export interface Voucher {
  id: number;
  property_id?: number | null;
  code: string;
  name: string;
  description?: string | null;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  discount_text?: string;
  min_order_amount: number;
  max_discount_amount?: number | null;
  usage_limit?: number | null;
  usage_count: number;
  max_usage_per_user: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_public: boolean;
  can_be_used?: boolean;
  remaining_uses?: number | null;
  property?: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface VoucherFormData {
  property_id?: number | null;
  code: string;
  name?: string;
  description?: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number | null;
  usage_limit?: number | null;
  max_usage_per_user?: number;
  start_date: string;
  end_date: string;
  is_active?: boolean;
  is_public?: boolean;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ListVouchersParams {
  page?: number;
  per_page?: number;
  keyword?: string;
  is_active?: boolean;
  property_id?: number;
  sort?: string;
}

// API Functions

/**
 * Lấy danh sách vouchers (Admin)
 */
export async function getVouchers(params?: ListVouchersParams) {
  try {
    const { data } = await api.get("/admin/vouchers", { params });
    return {
      vouchers: data.data as Voucher[],
      pagination: data.meta?.pagination as PaginationMeta,
    };
  } catch (error: any) {
    console.error("Error fetching vouchers:", error);
    throw error;
  }
}

/**
 * Lấy chi tiết voucher
 */
export async function getVoucher(id: number) {
  try {
    const { data } = await api.get(`/admin/vouchers/${id}`);
    return data.data as Voucher;
  } catch (error: any) {
    console.error("Error fetching voucher:", error);
    throw error;
  }
}

/**
 * Tạo voucher mới
 */
export async function createVoucher(formData: VoucherFormData) {
  try {
    const { data } = await api.post("/admin/vouchers", formData);
    return {
      success: true,
      message: data.message as string,
      voucher: data.data as Voucher,
    };
  } catch (error: any) {
    console.error("Error creating voucher:", error);
    throw error;
  }
}

/**
 * Cập nhật voucher
 */
export async function updateVoucher(id: number, formData: Partial<VoucherFormData>) {
  try {
    const { data } = await api.put(`/admin/vouchers/${id}`, formData);
    return {
      success: true,
      message: data.message as string,
      voucher: data.data as Voucher,
    };
  } catch (error: any) {
    console.error("Error updating voucher:", error);
    throw error;
  }
}

/**
 * Xóa voucher
 */
export async function deleteVoucher(id: number) {
  try {
    const { data } = await api.delete(`/admin/vouchers/${id}`);
    return {
      success: true,
      message: data.message as string,
    };
  } catch (error: any) {
    console.error("Error deleting voucher:", error);
    throw error;
  }
}

/**
 * Toggle trạng thái active
 */
export async function toggleVoucherActive(id: number, is_active: boolean) {
  try {
    const { data } = await api.put(`/admin/vouchers/${id}`, { is_active });
    return {
      success: true,
      message: data.message as string,
      voucher: data.data as Voucher,
    };
  } catch (error: any) {
    console.error("Error toggling voucher:", error);
    throw error;
  }
}

/**
 * Validate mã voucher
 */
export async function validateVoucherCode(code: string, propertyId?: number) {
  try {
    const { data } = await api.post("/vouchers/validate", {
      code,
      property_id: propertyId,
    });
    return {
      valid: data.success,
      voucher: data.data as Voucher | null,
      message: data.message,
    };
  } catch (error: any) {
    return {
      valid: false,
      voucher: null,
      message: error.response?.data?.message || "Mã voucher không hợp lệ",
    };
  }
}

