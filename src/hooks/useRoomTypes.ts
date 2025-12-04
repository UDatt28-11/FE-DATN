import { useApiCache, clearCacheByPattern } from './useApiCache';
import api from '../api/axios';

export interface RoomType {
  id: number;
  name: string;
  description: string;
  base_price: number;
  max_adults: number;
  max_children: number;
  image_url?: string;
  images?: { image_url: string; is_primary: boolean }[];
  amenities?: { id: number; name: string; icon: string }[];
  rating?: number;
  reviews_count?: number;
  available_count?: number;
}

interface RoomTypesResponse {
  success: boolean;
  data: RoomType[];
  meta?: {
    current_page: number;
    total: number;
    per_page: number;
  };
}

interface UseRoomTypesOptions {
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  amenities?: number[];
}

/**
 * Hook to fetch room types with caching
 * Cache duration: 5 minutes
 */
export function useRoomTypes(options: UseRoomTypesOptions = {}) {
  const {
    limit = 10,
    page = 1,
    sortBy = 'created_at',
    sortOrder = 'desc',
    minPrice,
    maxPrice,
    amenities,
  } = options;

  // Build query string for cache key
  const queryParams = new URLSearchParams();
  queryParams.set('limit', String(limit));
  queryParams.set('page', String(page));
  queryParams.set('sort_by', sortBy);
  queryParams.set('sort_order', sortOrder);
  if (minPrice) queryParams.set('min_price', String(minPrice));
  if (maxPrice) queryParams.set('max_price', String(maxPrice));
  if (amenities?.length) queryParams.set('amenities', amenities.join(','));

  const cacheKey = `room-types-${queryParams.toString()}`;

  return useApiCache<RoomTypesResponse>(
    cacheKey,
    async () => {
      const response = await api.get(`/public/room-types?${queryParams.toString()}`);
      return response.data;
    },
    {
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      staleTime: 60 * 1000, // 1 minute
      refetchOnFocus: false,
      refetchOnReconnect: true,
    }
  );
}

/**
 * Hook to fetch single room type detail with caching
 * Cache duration: 10 minutes
 */
export function useRoomTypeDetail(id: number | string) {
  const cacheKey = `room-type-detail-${id}`;

  return useApiCache<{ success: boolean; data: RoomType }>(
    cacheKey,
    async () => {
      const response = await api.get(`/public/room-types/${id}`);
      return response.data;
    },
    {
      cacheDuration: 10 * 60 * 1000, // 10 minutes
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

/**
 * Hook to fetch room type reviews with caching
 */
export function useRoomTypeReviews(id: number | string, page = 1) {
  const cacheKey = `room-type-reviews-${id}-page-${page}`;

  return useApiCache(
    cacheKey,
    async () => {
      const response = await api.get(`/public/room-types/${id}/reviews?page=${page}`);
      return response.data;
    },
    {
      cacheDuration: 5 * 60 * 1000,
      staleTime: 60 * 1000,
    }
  );
}

/**
 * Invalidate all room types cache
 */
export function invalidateRoomTypesCache() {
  clearCacheByPattern('room-type');
}

export default useRoomTypes;

