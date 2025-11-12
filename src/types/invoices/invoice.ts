// src/types/invoice.ts

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: string;
  total_line: string;
  item_type: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  booking_order_id: number;

  issue_date: string;
  due_date: string;

  total_amount: number;
  discount_amount: number;
  refund_amount: number;

  refund_policy_id: number | null;
  refund_date: string | null;

  calculation_method: string;
  status: string;

  created_at: string;
  updated_at: string;

  // ✅ Gộp InvoiceItem vào đây
  invoice_items: InvoiceItem[];

  // (không bắt buộc nhưng thường có)
  booking_order?: {
    id: number;
    order_code: string;
    status: string;
    total_amount: string;
    guest?: {
      id: number;
      full_name: string;
      email: string;
      phone_number: string;
      avatar_url: string | null;
    };
  };
}
