/**
 * 💰 Invoice Types - Hóa đơn
 */

export interface Invoice {
  id: number;
  property_id: number;
  booking_order_id: number;
  invoice_number: string;
  issue_date: string;
  due_date: string;

  // Customer info
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;

  // Amounts
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance: number;

  // Status
  payment_status:
    | "pending"
    | "partially_paid"
    | "paid"
    | "overdue"
    | "cancelled";
  invoice_status: "draft" | "sent" | "viewed" | "paid" | "cancelled";

  // Payment info
  payment_method?:
    | "cash"
    | "bank_transfer"
    | "credit_card"
    | "e_wallet"
    | "other";
  payment_date?: string;
  payment_notes?: string;

  // Additional
  notes?: string;
  terms_conditions?: string;

  // Relations
  items?: InvoiceItem[];
  discounts?: InvoiceDiscount[];
  property?: any;
  booking_order?: any;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface DamageImage {
  id: number;
  invoice_item_id: number;
  image_url: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  item_type: "room_charge" | "service_charge" | "damage_fee" | "penalty" | "other";
  description: string;
  quantity: number;
  unit_price: number;
  amount?: number;
  total_line?: number; // Tổng tiền của item (quantity * unit_price)
  tax_rate?: number;
  tax_amount?: number;
  total?: number; // Alias của total_line

  // Related IDs
  booking_detail_id?: number;
  room_id?: number;
  service_id?: number;

  // Relationships
  damage_images?: DamageImage[];

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface InvoiceDiscount {
  id: number;
  invoice_id: number;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  discount_amount: number;
  description?: string;

  // Relations
  promotion_id?: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface InvoiceConfig {
  id: number;
  property_id: number;

  // Tax settings
  tax_rate: number;
  tax_inclusive: boolean;

  // Payment terms
  payment_terms_days: number;
  late_fee_percentage: number;

  // Invoice settings
  invoice_prefix: string;
  invoice_starting_number: number;

  // Notes templates
  default_notes?: string;
  default_terms?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface RefundPolicy {
  id: number;
  property_id: number;
  name: string;
  description?: string;

  // Policy rules
  days_before_checkin: number;
  refund_percentage: number;

  // Status
  is_active: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface InvoiceStatistics {
  total_invoices: number;
  total_revenue: number;
  paid_invoices: number;
  unpaid_invoices?: number;
  pending_invoices: number;
  overdue_invoices: number;
  cancelled_invoices?: number;
  total_outstanding: number;
  average_invoice_amount: number;

  // By status
  by_status: {
    [key: string]: {
      count: number;
      total: number;
    };
  };

  // By payment method
  by_payment_method: {
    [key: string]: {
      count: number;
      total: number;
    };
  };
}

export interface CreateInvoiceData {
  property_id: number;
  booking_order_id?: number;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  issue_date: string;
  due_date: string;
  payment_method?: string;
  notes?: string;
  terms_conditions?: string;
  items: {
    item_type: string;
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate?: number;
  }[];
}

export interface UpdateInvoiceData {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  due_date?: string;
  payment_method?: string;
  notes?: string;
  terms_conditions?: string;
}

export interface MergeInvoicesData {
  invoice_ids: number[];
  customer_name?: string;
  notes?: string;
}

export interface SplitInvoiceData {
  items: {
    item_id: number;
    quantity: number;
  }[];
  customer_name?: string;
  notes?: string;
}

export interface ApplyDiscountData {
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  description?: string;
  promotion_id?: number;
}

export interface ApplyRefundPolicyData {
  refund_policy_id: number;
  cancellation_date: string;
  reason?: string;
}
