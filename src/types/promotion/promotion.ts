// src/pages/quanlimagiamgia/types/promotion.ts
export type PromotionStatus =
  | "Đang hoạt động"
  | "Chưa áp dụng"
  | "Hết hạn"
  | "Vô hiệu hóa";
export type DiscountType = "percentage" | "fixed_amount";

export interface Promotion {
  id: number;
  property_id: number;
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: number;
  max_discount_amount?: number | null;
  min_purchase_amount: number;
  max_usage_limit: number;
  max_usage_per_user: number;
  usage_count: number;
  start_date: string;
  end_date: string;
  is_active: number; // 1 = active, 0 = inactive
  applicable_to: string | null;
  created_at?: string;
  updated_at?: string;
}
