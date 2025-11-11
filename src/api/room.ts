import { api } from './client';

export type RoomType = {
  id: number;
  name: string;
  description?: string;
  property_id?: number;
};

export type Room = {
  id: number;
  name: string;
  room_type_id?: number;
  room_type?: RoomType;
  max_adults?: number;
  max_children?: number;
  price_per_night?: number;
  status?: 'available' | 'occupied' | 'maintenance';
  description?: string;
};

// Lấy danh sách loại phòng
export async function listRoomTypes() {
  const { data } = await api.get('/admin/room-types');
  return (data.data as RoomType[]) ?? [];
}

// Lấy chi tiết loại phòng
export async function getRoomType(id: number) {
  const { data } = await api.get(`/admin/room-types/${id}`);
  return data.data as RoomType;
}

// Lấy danh sách phòng (có thể filter theo room_type_id)
export async function listRooms(roomTypeId?: number) {
  const params = roomTypeId ? { room_type_id: roomTypeId } : {};
  const { data } = await api.get('/admin/rooms', { params });
  return (data.data as Room[]) ?? [];
}

// Lấy chi tiết phòng
export async function getRoom(id: number) {
  const { data } = await api.get(`/admin/rooms/${id}`);
  return data.data as Room;
}
