interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class SimpleCache<T> {
  private cache = new Map<string, CacheItem<T>>();

  set(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiry: now + ttl,
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    this.cache.forEach((item, key) => {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    });
  }
}

// Global cache instances
export const contactCache = new SimpleCache<any>();
export const noteCache = new SimpleCache<any>();

// Auto cleanup every 10 minutes
setInterval(() => {
  contactCache.cleanup();
  noteCache.cleanup();
}, 10 * 60 * 1000);