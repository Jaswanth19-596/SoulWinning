/**
 * Error message sanitizer to prevent sensitive information exposure
 */
export class ErrorSanitizer {
  private static readonly USER_FRIENDLY_MESSAGES: Record<string, string> = {
    // Authentication errors
    'Invalid credentials': 'Invalid username or password',
    'User not found': 'Invalid username or password',
    'Password incorrect': 'Invalid username or password',
    'Account locked': 'Account temporarily locked. Please try again later.',
    'Token expired': 'Your session has expired. Please log in again.',
    'Invalid token': 'Your session is invalid. Please log in again.',
    'Unauthorized': 'You are not authorized to perform this action.',

    // Network errors
    'Network Error': 'Connection error. Please check your internet connection and try again.',
    'Request timeout': 'Request took too long to complete. Please try again.',
    'Service unavailable': 'Service is temporarily unavailable. Please try again later.',

    // Validation errors
    'Validation failed': 'Please check your input and try again.',
    'Missing required field': 'Please fill in all required fields.',
    'Invalid email': 'Please enter a valid email address.',
    'Password too weak': 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.',

    // General errors
    'Internal server error': 'An unexpected error occurred. Please try again later.',
    'Bad request': 'Invalid request. Please check your input and try again.',
    'Forbidden': 'You do not have permission to access this resource.',
    'Not found': 'The requested resource was not found.',
    'Conflict': 'A conflict occurred. The resource may already exist.',

    // Rate limiting
    'Too many requests': 'Too many requests. Please wait before trying again.',
    'Rate limit exceeded': 'Rate limit exceeded. Please wait before making more requests.',
  };

  private static readonly GENERIC_MESSAGES = [
    'An unexpected error occurred. Please try again.',
    'Something went wrong. Please try again later.',
    'Unable to complete your request. Please try again.',
  ];

  /**
   * Sanitize an error message for safe display to users
   * @param error - The error message or Error object
   * @param context - Optional context for more specific error handling
   * @returns A user-friendly, sanitized error message
   */
  static sanitize(error: string | Error | unknown, context?: string): string {
    let errorMessage = '';

    // Extract message from different error types
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as any).message);
    } else {
      errorMessage = String(error);
    }

    // Convert to lowercase for case-insensitive matching
    const lowerMessage = errorMessage.toLowerCase();

    // Check for known error patterns
    for (const [pattern, friendlyMessage] of Object.entries(this.USER_FRIENDLY_MESSAGES)) {
      if (lowerMessage.includes(pattern.toLowerCase())) {
        return friendlyMessage;
      }
    }

    // Context-specific error handling
    if (context) {
      switch (context) {
        case 'login':
          return 'Login failed. Please check your credentials and try again.';
        case 'register':
          return 'Registration failed. Please check your information and try again.';
        case 'contact':
          return 'Unable to process contact information. Please try again.';
        case 'search':
          return 'Search failed. Please try again.';
        case 'api':
          return 'Unable to connect to the server. Please try again later.';
      }
    }

    // For unknown errors, return a generic message
    const randomIndex = Math.floor(Math.random() * this.GENERIC_MESSAGES.length);
    return this.GENERIC_MESSAGES[randomIndex];
  }

  /**
   * Check if an error message contains sensitive information
   * @param message - The error message to check
   * @returns true if the message might contain sensitive info
   */
  static containsSensitiveInfo(message: string): boolean {
    const sensitivePatterns = [
      /database/i,
      /sql/i,
      /mongodb/i,
      /connection string/i,
      /stack trace/i,
      /file path/i,
      /line \d+/i,
      /at .+\.js:/i,
      /error.*at/i,
      /internal/i,
      /debug/i,
    ];

    return sensitivePatterns.some(pattern => pattern.test(message));
  }

  /**
   * Log the original error for debugging while returning sanitized message
   * @param error - The original error
   * @param context - Optional context
   * @returns Sanitized error message
   */
  static sanitizeAndLog(error: string | Error | unknown, context?: string): string {
    // Log original error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Original error:', error, context ? `Context: ${context}` : '');
    }

    // In production, you might want to send this to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to logging service
      // logError(error, context);
    }

    return this.sanitize(error, context);
  }
}