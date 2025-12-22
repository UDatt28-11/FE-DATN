import axios from './axiosConfig';
import type { Room, RoomsResponse, RoomResponse } from '../types/room/room';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface GetRoomsParams {
  property_id?: number;
  room_type_id?: number;
  status?: 'available' | 'maintenance' | 'occupied';
  verification_status?: 'pending' | 'verified' | 'rejected';
  search?: string;
  check_in?: string; // Format: YYYY-MM-DD
  check_out?: string; // Format: YYYY-MM-DD
  sort_by?: 'id' | 'name' | 'price_per_night' | 'status' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

interface CreateRoomData {
  property_id: number;
  room_type_id: number;
  name: string;
  description?: string;
  max_adults: number;
  max_children: number;
  price_per_night: number;
  status?: 'available' | 'maintenance' | 'occupied';
  amenities?: number[];
  verification_status?: 'pending' | 'verified' | 'rejected';
}

interface UpdateRoomData extends Partial<CreateRoomData> {
  verification_status?: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
}

const roomService = {
  /**
   * Lấy danh sách rooms (admin)
   */
  async getRooms(params?: GetRoomsParams): Promise<RoomsResponse> {
    const response = await axios.get(`${API_URL}/admin/rooms`, { params });
    return response.data;
  },

  /**
   * Lấy chi tiết room theo ID (admin)
   */
  async getRoomById(id: number, include?: string): Promise<RoomResponse> {
    const params = include ? { include } : {};
    const response = await axios.get(`${API_URL}/admin/rooms/${id}`, { params });
    return response.data;
  },

  /**
   * Tạo room mới
   */
  async createRoom(roomData: CreateRoomData): Promise<RoomResponse> {
    const response = await axios.post(`${API_URL}/admin/rooms`, roomData);
    return response.data;
  },

  /**
   * Cập nhật room
   */
  async updateRoom(id: number, roomData: UpdateRoomData): Promise<RoomResponse> {
    const response = await axios.put(`${API_URL}/admin/rooms/${id}`, roomData);
    return response.data;
  },

  /**
   * Xóa room
   */
  async deleteRoom(id: number): Promise<{ success: boolean; message: string }> {
    const response = await axios.delete(`${API_URL}/admin/rooms/${id}`);
    return response.data;
  },

  /**
   * Cập nhật trạng thái room
   */
  async updateStatus(id: number, status: 'available' | 'maintenance' | 'occupied'): Promise<RoomResponse> {
    const response = await axios.patch(`${API_URL}/admin/rooms/${id}/status`, { status });
    return response.data;
  },

  /**
   * Xác minh room
   */
  async verifyRoom(id: number, notes?: string): Promise<RoomResponse> {
    const response = await axios.post(`${API_URL}/admin/rooms/${id}/verify`, { notes });
    return response.data;
  },

  /**
   * Từ chối room
   */
  async rejectRoom(id: number, notes?: string): Promise<RoomResponse> {
    const response = await axios.post(`${API_URL}/admin/rooms/${id}/reject`, { notes });
    return response.data;
  },

  // Images đã chuyển sang room type images
};

export default roomService;

