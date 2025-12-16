import api from "../api/axios";

// Types
export interface Voucher {
  id: number;
  voucher_id?: number;
  code: string;
  name: string;
  description?: string | null;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  discount_text: string;
  min_order_amount: number;
  max_discount_amount?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
  can_use?: boolean;
  property?: {
    id: number;
    name: string;
  } | null;
  claimed_at?: string | null;
  used_at?: string | null;
  applied_discount_amount?: number | null;
  booking_order_id?: number | null;
  remaining_uses?: number | null;
}

export interface VoucherCounts {
  unused: number;
  used: number;
  expired: number;
  total: number;
}

export interface ApplyVoucherResult {
  voucher_id: number;
  voucher_code: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  discount_amount: number;
  original_amount: number;
  final_amount: number;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

// API Functions

/**
 * Lấy danh sách voucher trong kho của user
 */
export async function getUserVouchers(params?: {
  status?: "all" | "unused" | "used";
  per_page?: number;
  page?: number;
}) {
  try {
    const { data } = await api.get("/user/vouchers", { params });
    return {
      vouchers: data.data as Voucher[],
      pagination: data.meta?.pagination as PaginationMeta,
    };
  } catch (error: any) {
    console.error("Error fetching user vouchers:", error);
    throw error;
  }
}

/**
 * Lấy danh sách voucher có thể claim
 */
export async function getAvailableVouchers(params?: {
  per_page?: number;
  page?: number;
}) {
  try {
    const { data } = await api.get("/user/vouchers/available", { params });
    return {
      vouchers: data.data as Voucher[],
      pagination: data.meta?.pagination as PaginationMeta,
    };
  } catch (error: any) {
    console.error("Error fetching available vouchers:", error);
    throw error;
  }
}

/**
 * Lấy danh sách voucher public (trang Khuyến mãi)
 * Dùng API /vouchers (không yêu cầu auth)
 */
export async function getPublicVouchers(params?: {
  per_page?: number;
  page?: number;
  is_active?: boolean;
}) {
  try {
    const { data } = await api.get("/vouchers", { params });

    // Backend trả về dạng paginator { data: [...], meta: { pagination: ... } }
    const raw = data?.data ?? data;
    const vouchers = Array.isArray(raw) ? (raw as Voucher[]) : ((raw?.data as Voucher[]) ?? []);

    return {
      vouchers,
      pagination: (data.meta?.pagination || data.meta) as PaginationMeta | undefined,
    };
  } catch (error: any) {
    console.error("Error fetching public vouchers:", error);
    throw error;
  }
}

/**
 * Lấy số lượng voucher theo trạng thái
 */
export async function getVoucherCounts() {
  try {
    const { data } = await api.get("/user/vouchers/counts");
    return data.data as VoucherCounts;
  } catch (error: any) {
    console.error("Error fetching voucher counts:", error);
    throw error;
  }
}

/**
 * Claim voucher bằng mã
 */
export async function claimVoucher(code: string) {
  try {
    const { data } = await api.post("/user/vouchers/claim", { code });
    return {
      success: true,
      message: data.message as string,
      voucher: data.data as Voucher,
    };
  } catch (error: any) {
    console.error("Error claiming voucher:", error);
    throw error;
  }
}

/**
 * Áp dụng voucher cho đơn hàng
 */
export async function applyVoucher(params: {
  voucher_id: number;
  order_amount: number;
  booking_order_id?: number;
}) {
  try {
    const { data } = await api.post("/user/vouchers/apply", params);
    return {
      success: true,
      message: data.message as string,
      result: data.data as ApplyVoucherResult,
    };
  } catch (error: any) {
    console.error("Error applying voucher:", error);
    throw error;
  }
}

/**
 * Xem chi tiết voucher trong kho
 */
export async function getUserVoucherDetail(id: number) {
  try {
    const { data } = await api.get(`/user/vouchers/${id}`);
    return data.data as Voucher;
  } catch (error: any) {
    console.error("Error fetching voucher detail:", error);
    throw error;
  }
}

/**
 * Validate voucher code (public API)
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

