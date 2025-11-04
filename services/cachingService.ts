// Simple caching service using localStorage

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export const CACHE_DURATION_MARKET = 1 * 60 * 1000; // 1 minute for market data (real-time)
export const CACHE_DURATION_DETAILS = 1 * 60 * 1000; // 1 minute for stock details (real-time)
export const CACHE_DURATION_ANALYSIS = 5 * 60 * 1000; // 5 minutes for AI analysis

/**
 * Stores an item in the cache (localStorage).
 * @param key The key to store the item under.
 * @param data The data to be stored.
 */
export function setInCache<T>(key: string, data: T): void {
  try {
    const item: CacheItem<T> = {
      data,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.warn(`Error setting item in cache for key "${key}":`, error);
  }
}

/**
 * Retrieves an item from the cache if it exists and is not expired.
 * @param key The key of the item to retrieve.
 * @param maxAge The maximum age of the cached item in milliseconds.
 * @returns The cached data or null if not found or expired.
 */
export function getFromCache<T>(key: string, maxAge: number): T | null {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
      return null;
    }

    const item: CacheItem<T> = JSON.parse(itemStr);
    const now = new Date().getTime();

    if (now - item.timestamp > maxAge) {
      localStorage.removeItem(key); // Cache expired
      return null;
    }

    return item.data;
  } catch (error) {
    console.warn(`Error getting item from cache for key "${key}":`, error);
    return null;
  }
}