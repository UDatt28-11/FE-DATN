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
  status: "Hoạt động" | "Ngưng hoạt động";
  created_at: string;
  updated_at: string;
}
