

export type Room = {
  id: number;
  name: string;
  room_type?: string;
  capacity?: number;
  price_per_night?: number;
  status?: 'available' | 'occupied' | 'maintenance';
  description?: string;
};

export interface Listing {
  id?: number;              // ID sẽ được server tạo ra
  name: string;             // Tên listing
  description?: string;     // Mô tả
  price: number;            // Giá
  capacity: number;         // Sức chứa
  propertyId: number;       // ID property
  photos?: string[];        // Ảnh
  createdAt?: string;
  updatedAt?: string;
}


