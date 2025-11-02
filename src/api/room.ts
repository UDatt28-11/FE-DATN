import { api } from './client';

export type Room = {
  id: number;
  name: string;
  room_type?: string;
  capacity?: number;
  price_per_night?: number;
  status?: 'available' | 'occupied' | 'maintenance';
  description?: string;
};

// Lấy danh sách phòng
export async function listRooms() {
  const { data } = await api.get('/admin/rooms');
  return (data.data as Room[]) ?? [];
}

// Lấy chi tiết phòng
export async function getRoom(id: number) {
  const { data } = await api.get(`/admin/rooms/${id}`);
  return data.data as Room;
}
