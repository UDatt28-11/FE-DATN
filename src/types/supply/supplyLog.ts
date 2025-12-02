/**
 * 📋 Supply Log Types - Lịch sử vật tư
 */

export interface SupplyLog {
  id: number;
  supply_id: number;
  
  // Action info
  action_type: 'in' | 'out' | 'adjust' | 'return' | 'damage' | 'expired';
  quantity: number;
  unit_price?: number;
  total_value?: number;
  
  // Stock info
  stock_before: number;
  stock_after: number;
  
  // Related entities
  room_id?: number;
  booking_detail_id?: number;
  user_id?: number;
  
  // Additional info
  notes?: string;
  reason?: string;
  performed_by?: string;
  
  // Relations
  supply?: any;
  room?: any;
  user?: any;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface SupplyLogActivity {
  id: number;
  supply_name: string;
  action_type: string;
  quantity: number;
  performed_by: string;
  timestamp: string;
  notes?: string;
}

export interface MovementSummary {
  supply_id: number;
  supply_name: string;
  
  // Totals
  total_in: number;
  total_out: number;
  total_adjust: number;
  total_return: number;
  total_damage: number;
  total_expired: number;
  
  // Net movement
  net_movement: number;
  
  // Current stock
  current_stock: number;
  
  // Time period
  period_start: string;
  period_end: string;
}



