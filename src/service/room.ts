import api from "../ApiFromBE/axios";
import { Listing, Room } from "../types/room/room";

// Lấy danh sách phòng
export async function listRooms() {
  const { data } = await api.get('/admin/rooms');
  return (data.data as Room[]) ?? [];


}


export const getListingById = async (id: number | string): Promise<Listing> => {
  const res = await api.get(`/listings/${id}`);
  return res.data.data;
};

export const updateListing = async (
  id: number | string,
  data: Partial<Listing>
): Promise<Listing> => {
  const res = await api.put(`/listings/${id}`, data);
  return res.data.data;
};


export const removeListing = async (id: number | string): Promise<void> => {
  await api.delete(`/listings/${id}`);
};

// Lấy chi tiết phòng
export async function getRoom(id: number) {
  const { data } = await api.get(`/admin/rooms/${id}`);
  return data.data as Room;
}

export const addListing = async (data: Listing): Promise<Listing> => {
  const res = await api.post("/listings", data);
  return res.data.data; // Giả sử server trả về data.listing
};