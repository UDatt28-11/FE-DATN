import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface UseApiCacheOptions {
  /** Cache duration in milliseconds (default: 5 minutes) */
  cacheDuration?: number;
  /** Whether to refetch on window focus */
  refetchOnFocus?: boolean;
  /** Whether to refetch on reconnect */
  refetchOnReconnect?: boolean;
  /** Stale time - data is fresh for this duration */
  staleTime?: number;
}

// In-memory cache store
const cacheStore = new Map<string, CacheItem<any>>();

// Cache statistics for debugging
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Get cache statistics
 */
export const getCacheStats = () => ({
  hits: cacheHits,
  misses: cacheMisses,
  hitRate: cacheHits + cacheMisses > 0 
    ? (cacheHits / (cacheHits + cacheMisses) * 100).toFixed(2) + '%' 
    : '0%',
  size: cacheStore.size,
});

/**
 * Clear all cache
 */
export const clearApiCache = () => {
  cacheStore.clear();
  cacheHits = 0;
  cacheMisses = 0;
  console.log('🧹 API Cache cleared');
};

/**
 * Clear cache by key pattern
 */
export const clearCacheByPattern = (pattern: string) => {
  const keysToDelete: string[] = [];
  cacheStore.forEach((_, key) => {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => cacheStore.delete(key));
  console.log(`🧹 Cleared ${keysToDelete.length} cache entries matching "${pattern}"`);
};

/**
 * Custom hook for API caching
 */
export function useApiCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  options: UseApiCacheOptions = {}
) {
  const {
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    refetchOnFocus = false,
    refetchOnReconnect = true,
    staleTime = 60 * 1000, // 1 minute
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const isStale = useRef(false);

  const fetchData = useCallback(async (force = false) => {
    const now = Date.now();
    const cached = cacheStore.get(cacheKey);

    // Check if we have valid cache
    if (!force && cached && cached.expiresAt > now) {
      cacheHits++;
      setData(cached.data);
      setLoading(false);
      isStale.current = (now - cached.timestamp) > staleTime;
      
      // Background refetch if stale
      if (isStale.current) {
        console.log(`📦 Cache stale for: ${cacheKey}, background refetching...`);
        fetchFn().then(freshData => {
          if (isMounted.current) {
            setData(freshData);
            cacheStore.set(cacheKey, {
              data: freshData,
              timestamp: Date.now(),
              expiresAt: Date.now() + cacheDuration,
            });
          }
        }).catch(console.error);
      }
      
      return;
    }

    cacheMisses++;
    setLoading(true);
    setError(null);

    try {
      const freshData = await fetchFn();
      
      if (isMounted.current) {
        setData(freshData);
        setLoading(false);
        
        // Store in cache
        cacheStore.set(cacheKey, {
          data: freshData,
          timestamp: now,
          expiresAt: now + cacheDuration,
        });
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    }
  }, [cacheKey, fetchFn, cacheDuration, staleTime]);

  // Initial fetch
  useEffect(() => {
    isMounted.current = true;
    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnFocus) return;

    const handleFocus = () => {
      if (isStale.current) {
        fetchData(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnFocus, fetchData]);

  // Refetch on reconnect
  useEffect(() => {
    if (!refetchOnReconnect) return;

    const handleOnline = () => {
      console.log('🌐 Back online, refetching...');
      fetchData(true);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [refetchOnReconnect, fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);
  const invalidate = useCallback(() => {
    cacheStore.delete(cacheKey);
    fetchData(true);
  }, [cacheKey, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
    isStale: isStale.current,
  };
}

/**
 * Prefetch data into cache
 */
export async function prefetchApi<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  cacheDuration = 5 * 60 * 1000
): Promise<void> {
  try {
    const data = await fetchFn();
    cacheStore.set(cacheKey, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + cacheDuration,
    });
    console.log(`📦 Prefetched: ${cacheKey}`);
  } catch (error) {
    console.error(`Failed to prefetch ${cacheKey}:`, error);
  }
}

export default useApiCache;

