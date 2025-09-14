import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  exp: number;
  iat: number;
  userId?: string;
  username?: string;
  [key: string]: any;
}

/**
 * JWT utility functions for token validation and management
 */
export class JWTUtils {
  /**
   * Decode and validate a JWT token
   * @param token - The JWT token to validate
   * @returns The decoded payload if valid, null if invalid
   */
  static validateToken(token: string): JWTPayload | null {
    try {
      if (!token || typeof token !== 'string') {
        return null;
      }

      // Check if token has the correct format (3 parts separated by dots)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = jwtDecode<JWTPayload>(token);

      // Check if token is expired
      if (this.isTokenExpired(payload)) {
        return null;
      }

      return payload;
    } catch (error) {
      console.error('JWT validation failed:', error);
      return null;
    }
  }

  /**
   * Check if a JWT token is expired
   * @param payload - The decoded JWT payload
   * @returns true if expired, false otherwise
   */
  static isTokenExpired(payload: JWTPayload): boolean {
    if (!payload.exp) {
      // If no expiration time, consider it expired for security
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    // Add a 30-second buffer to account for clock skew
    return payload.exp < (now + 30);
  }

  /**
   * Check if a token will expire soon (within 5 minutes)
   * @param token - The JWT token to check
   * @returns true if expiring soon, false otherwise
   */
  static isTokenExpiringSoon(token: string): boolean {
    try {
      const payload = jwtDecode<JWTPayload>(token);
      if (!payload.exp) return true;

      const now = Math.floor(Date.now() / 1000);
      const fiveMinutesFromNow = now + (5 * 60);

      return payload.exp < fiveMinutesFromNow;
    } catch {
      return true;
    }
  }

  /**
   * Get the remaining time until token expires
   * @param token - The JWT token
   * @returns remaining time in seconds, or 0 if expired/invalid
   */
  static getTokenRemainingTime(token: string): number {
    try {
      const payload = jwtDecode<JWTPayload>(token);
      if (!payload.exp) return 0;

      const now = Math.floor(Date.now() / 1000);
      const remaining = payload.exp - now;

      return Math.max(0, remaining);
    } catch {
      return 0;
    }
  }

  /**
   * Extract user information from token
   * @param token - The JWT token
   * @returns user info or null if invalid
   */
  static getUserFromToken(token: string): { userId?: string; username?: string } | null {
    const payload = this.validateToken(token);
    if (!payload) return null;

    return {
      userId: payload.userId,
      username: payload.username
    };
  }
}