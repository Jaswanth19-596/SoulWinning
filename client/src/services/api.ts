import axios from 'axios';
import { secureStorage } from '../utils/secureStorage';
import { ErrorSanitizer } from '../utils/errorSanitizer';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request ID for tracking
api.interceptors.request.use(
  (config) => {
    // Add authorization header with secure token
    const token = secureStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for debugging
    config.headers['x-request-id'] = generateRequestId();

    // Add security headers
    config.headers['X-Requested-With'] = 'XMLHttpRequest';

    return config;
  },
  (error) => {
    return Promise.reject(ErrorSanitizer.sanitize(error, 'api'));
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response?.status === 401) {
      // Clear secure storage instead of localStorage
      secureStorage.removeItem('token');
      secureStorage.removeItem('user');

      // Don't automatically redirect - let the app handle auth state
      console.warn('Authentication required');

      // Dispatch custom event for auth state change
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    // Rate limiting response
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const message = retryAfter
        ? `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`
        : 'Too many requests. Please wait before trying again.';

      return Promise.reject(new Error(message));
    }

    // Sanitize error message before rejecting
    const sanitizedError = ErrorSanitizer.sanitize(error, 'api');
    return Promise.reject(new Error(sanitizedError));
  }
);

// Generate unique request ID for tracking
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Add request/response logging in development
if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use((config) => {
    console.log(`🚀 API Request [${config.headers['X-Request-ID']}]:`, {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data
    });
    return config;
  });

  api.interceptors.response.use(
    (response) => {
      console.log(`✅ API Response [${response.config.headers['X-Request-ID']}]:`, {
        status: response.status,
        data: response.data
      });
      return response;
    },
    (error) => {
      console.error(`❌ API Error [${error.config?.headers['X-Request-ID']}]:`, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      return Promise.reject(error);
    }
  );
}

export default api;