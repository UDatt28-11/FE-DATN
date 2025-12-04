import api from "../api/axios";

export interface Property {
  id: number;
  name: string;
  address?: string;
  description?: string;
}

export interface GetPropertiesParams {
  page?: number;
  per_page?: number;
  keyword?: string;
}

/**
 * Lấy danh sách properties
 */
export async function getProperties(params?: GetPropertiesParams) {
  try {
    const { data } = await api.get("/admin/properties", { params });
    return {
      properties: data.data as Property[],
      pagination: data.meta?.pagination,
    };
  } catch (error: any) {
    console.error("Error fetching properties:", error);
    // Return empty array if error (e.g., no properties table)
    return {
      properties: [],
      pagination: null,
    };
  }
}

/**
 * Lấy chi tiết property
 */
export async function getProperty(id: number) {
  try {
    const { data } = await api.get(`/admin/properties/${id}`);
    return data.data as Property;
  } catch (error: any) {
    console.error("Error fetching property:", error);
    throw error;
  }
}

