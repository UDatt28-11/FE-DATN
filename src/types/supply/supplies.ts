export type SupplyStatus = "Hoạt động" | "Ngưng hoạt động";
export type SupplyStatusBackend = "active" | "inactive" | "discontinued";

// Helper functions để map status giữa backend và frontend
export const statusMapToFrontend: Record<SupplyStatusBackend, SupplyStatus> = {
  active: "Hoạt động",
  inactive: "Ngưng hoạt động",
  discontinued: "Ngưng hoạt động", // Map discontinued thành Ngưng hoạt động
};

export const statusMapToBackend: Record<SupplyStatus, SupplyStatusBackend> = {
  "Hoạt động": "active",
  "Ngưng hoạt động": "inactive",
};

export interface Supply {
  id: number;
  name: string;
  description: string;
  category: string;
  unit: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  unit_price: number;
  supplier: string;
  supplier_contact: string;
  status: SupplyStatus | SupplyStatusBackend; // Có thể nhận cả 2 dạng
  created_at: string;
  updated_at: string;
}
