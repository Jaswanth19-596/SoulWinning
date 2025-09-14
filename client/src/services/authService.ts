import api from './api';
import { AuthResponse, User } from '../types';
import { secureStorage } from '../utils/secureStorage';
import { JWTUtils } from '../utils/jwtUtils';
import { rateLimiter, RATE_LIMITS } from '../utils/rateLimiter';
import { ErrorSanitizer } from '../utils/errorSanitizer';

export const authService = {
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    // Rate limiting for registration attempts
    if (!rateLimiter.canMakeRequest('register', RATE_LIMITS.LOGIN.maxRequests, RATE_LIMITS.LOGIN.windowMs)) {
      const remainingTime = rateLimiter.getRemainingTime('register', RATE_LIMITS.LOGIN.maxRequests, RATE_LIMITS.LOGIN.windowMs);
      throw new Error(`Too many registration attempts. Please wait ${Math.ceil(remainingTime / 1000)} seconds before trying again.`);
    }

    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
      });

      if (response.data.success && response.data.token) {
        // Validate token before storing
        if (JWTUtils.validateToken(response.data.token)) {
          secureStorage.setItem('token', response.data.token);
          secureStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          throw new Error('Invalid token received from server');
        }
      }

      return response.data;
    } catch (error) {
      const sanitizedError = ErrorSanitizer.sanitizeAndLog(error, 'register');
      throw new Error(sanitizedError);
    }
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    // Rate limiting for login attempts
    if (!rateLimiter.canMakeRequest('login', RATE_LIMITS.LOGIN.maxRequests, RATE_LIMITS.LOGIN.windowMs)) {
      const remainingTime = rateLimiter.getRemainingTime('login', RATE_LIMITS.LOGIN.maxRequests, RATE_LIMITS.LOGIN.windowMs);
      throw new Error(`Too many login attempts. Please wait ${Math.ceil(remainingTime / 60000)} minutes before trying again.`);
    }

    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });

      if (response.data.success && response.data.token) {
        // Validate token before storing
        if (JWTUtils.validateToken(response.data.token)) {
          secureStorage.setItem('token', response.data.token);
          secureStorage.setItem('user', JSON.stringify(response.data.user));

          // Reset rate limit on successful login
          rateLimiter.reset('login');
        } else {
          throw new Error('Invalid token received from server');
        }
      }

      return response.data;
    } catch (error) {
      const sanitizedError = ErrorSanitizer.sanitizeAndLog(error, 'login');
      throw new Error(sanitizedError);
    }
  },

  logout: () => {
    secureStorage.removeItem('token');
    secureStorage.removeItem('user');

    // Clear any cached data
    secureStorage.clear();

    // Reset rate limiters
    rateLimiter.clearAll();
  },

  getCurrentUser: (): User | null => {
    try {
      const userString = secureStorage.getItem('user');
      if (!userString) return null;

      const user = JSON.parse(userString);

      // Validate that we still have a valid token
      if (!authService.isAuthenticated()) {
        authService.logout();
        return null;
      }

      return user;
    } catch (error) {
      // If we can't parse the user data, clear it and return null
      secureStorage.removeItem('user');
      return null;
    }
  },

  getToken: (): string | null => {
    return secureStorage.getItem('token');
  },

  isAuthenticated: (): boolean => {
    const token = secureStorage.getItem('token');
    if (!token) return false;

    // Validate token expiration and integrity
    const payload = JWTUtils.validateToken(token);
    if (!payload) {
      // Token is invalid or expired, clean up
      authService.logout();
      return false;
    }

    return true;
  },

  isTokenExpiringSoon: (): boolean => {
    const token = secureStorage.getItem('token');
    if (!token) return true;

    return JWTUtils.isTokenExpiringSoon(token);
  },

  getTokenRemainingTime: (): number => {
    const token = secureStorage.getItem('token');
    if (!token) return 0;

    return JWTUtils.getTokenRemainingTime(token);
  },

  getProfile: async () => {
    try {
      if (!rateLimiter.canMakeRequest('profile', RATE_LIMITS.API_GENERAL.maxRequests, RATE_LIMITS.API_GENERAL.windowMs)) {
        throw new Error('Too many requests. Please wait before trying again.');
      }

      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      const sanitizedError = ErrorSanitizer.sanitizeAndLog(error, 'api');
      throw new Error(sanitizedError);
    }
  },

  // New method to refresh token if needed
  refreshTokenIfNeeded: async (): Promise<boolean> => {
    if (!authService.isAuthenticated()) return false;

    if (authService.isTokenExpiringSoon()) {
      try {
        // Call refresh endpoint if your backend supports it
        // const response = await api.post('/auth/refresh');
        // if (response.data.token) {
        //   secureStorage.setItem('token', response.data.token);
        //   return true;
        // }

        // For now, just logout if token is expiring
        authService.logout();
        return false;
      } catch (error) {
        authService.logout();
        return false;
      }
    }

    return true;
  },
};