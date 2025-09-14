/**
 * Client-side rate limiter to prevent abuse
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * Check if a request can be made based on rate limiting rules
   * @param key - Unique identifier for the rate limit (e.g., 'login', 'api-call')
   * @param maxRequests - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if request can be made, false otherwise
   */
  canMakeRequest(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const requestTimes = this.requests.get(key) || [];

    // Remove expired request times
    const validRequestTimes = requestTimes.filter(time => now - time < windowMs);

    if (validRequestTimes.length >= maxRequests) {
      return false;
    }

    // Add current request time
    validRequestTimes.push(now);
    this.requests.set(key, validRequestTimes);

    return true;
  }

  /**
   * Get the remaining time until next request is allowed
   * @param key - Unique identifier for the rate limit
   * @param maxRequests - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns remaining time in milliseconds, or 0 if request can be made
   */
  getRemainingTime(key: string, maxRequests: number, windowMs: number): number {
    const now = Date.now();
    const requestTimes = this.requests.get(key) || [];

    // Remove expired request times
    const validRequestTimes = requestTimes.filter(time => now - time < windowMs);

    if (validRequestTimes.length < maxRequests) {
      return 0;
    }

    // Find the oldest request that needs to expire
    const oldestRequest = Math.min(...validRequestTimes);
    const remainingTime = windowMs - (now - oldestRequest);

    return Math.max(0, remainingTime);
  }

  /**
   * Reset rate limit for a specific key
   * @param key - Unique identifier for the rate limit
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.requests.clear();
  }

  /**
   * Get current request count for a key within the window
   * @param key - Unique identifier for the rate limit
   * @param windowMs - Time window in milliseconds
   * @returns current number of requests within the window
   */
  getCurrentRequestCount(key: string, windowMs: number): number {
    const now = Date.now();
    const requestTimes = this.requests.get(key) || [];
    return requestTimes.filter(time => now - time < windowMs).length;
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Predefined rate limit configurations
export const RATE_LIMITS = {
  LOGIN: { maxRequests: 5, windowMs: 5 * 60 * 1000 }, // 5 attempts per 5 minutes
  API_GENERAL: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  SEARCH: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 searches per minute
  CONTACT_CREATE: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 creates per minute
  FORM_SUBMISSION: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 form submissions per minute
} as const;