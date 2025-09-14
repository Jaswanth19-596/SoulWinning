import DOMPurify from 'dompurify';

/**
 * Input sanitization utility for preventing XSS and other injection attacks
 */
export class InputSanitizer {
  /**
   * Sanitize HTML content to prevent XSS
   * @param input - HTML string to sanitize
   * @param allowedTags - Optional array of allowed HTML tags
   * @returns Sanitized HTML string
   */
  static sanitizeHTML(input: string, allowedTags?: string[]): string {
    if (typeof input !== 'string') {
      return '';
    }

    const config: DOMPurify.Config = {
      ALLOWED_TAGS: allowedTags || [], // No tags allowed by default
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      SANITIZE_DOM: true,
      WHOLE_DOCUMENT: false,
      IN_PLACE: false,
    };

    return DOMPurify.sanitize(input, config);
  }

  /**
   * Sanitize plain text input (removes all HTML and scripts)
   * @param input - Text to sanitize
   * @param maxLength - Maximum allowed length
   * @returns Sanitized text
   */
  static sanitizeText(input: string, maxLength?: number): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove all HTML tags and decode HTML entities
    let sanitized = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });

    // Trim whitespace
    sanitized = sanitized.trim();

    // Apply length limit if specified
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }

  /**
   * Sanitize user name input
   * @param input - Name to sanitize
   * @returns Sanitized name
   */
  static sanitizeName(input: string): string {
    const sanitized = this.sanitizeText(input, 100);

    // Allow only letters, spaces, hyphens, and apostrophes
    return sanitized.replace(/[^a-zA-Z\s\-']/g, '').trim();
  }

  /**
   * Sanitize email input
   * @param input - Email to sanitize
   * @returns Sanitized email
   */
  static sanitizeEmail(input: string): string {
    const sanitized = this.sanitizeText(input, 254); // RFC 5321 limit

    // Basic email format preservation
    return sanitized.toLowerCase().replace(/[^a-z0-9@._-]/g, '');
  }

  /**
   * Sanitize phone number input
   * @param input - Phone number to sanitize
   * @returns Sanitized phone number
   */
  static sanitizePhone(input: string): string {
    const sanitized = this.sanitizeText(input, 20);

    // Allow only digits, spaces, hyphens, parentheses, and plus sign
    return sanitized.replace(/[^0-9\s\-()\\+]/g, '');
  }

  /**
   * Sanitize URL input
   * @param input - URL to sanitize
   * @returns Sanitized URL or empty string if invalid
   */
  static sanitizeURL(input: string): string {
    const sanitized = this.sanitizeText(input, 2048);

    try {
      // Use URL constructor to validate and normalize
      const url = new URL(sanitized);

      // Only allow http and https protocols
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return '';
      }

      return url.toString();
    } catch {
      return '';
    }
  }

  /**
   * Sanitize search query input
   * @param input - Search query to sanitize
   * @returns Sanitized search query
   */
  static sanitizeSearchQuery(input: string): string {
    const sanitized = this.sanitizeText(input, 200);

    // Remove potentially dangerous characters but keep useful search characters
    return sanitized.replace(/[<>"']/g, '').trim();
  }

  /**
   * Sanitize address input
   * @param input - Address to sanitize
   * @returns Sanitized address
   */
  static sanitizeAddress(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove HTML tags and decode entities, but preserve spaces and line breaks
    let sanitized = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });

    // Allow letters, numbers, spaces, commas, periods, hyphens, apostrophes, parentheses, and basic punctuation for addresses
    sanitized = sanitized.replace(/[^a-zA-Z0-9\s,.\-#/'()&]/g, '');

    // Apply length limit
    if (sanitized.length > 500) {
      sanitized = sanitized.substring(0, 500);
    }

    return sanitized.trim();
  }

  /**
   * Sanitize tags input (for contact tags, etc.)
   * @param input - Tag to sanitize
   * @returns Sanitized tag
   */
  static sanitizeTag(input: string): string {
    const sanitized = this.sanitizeText(input, 50);

    // Allow letters, numbers, spaces, and hyphens
    return sanitized.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
  }

  /**
   * Sanitize rich text content (allows some safe HTML tags)
   * @param input - Rich text to sanitize
   * @returns Sanitized rich text
   */
  static sanitizeRichText(input: string): string {
    const allowedTags = ['b', 'i', 'em', 'strong', 'u', 'br', 'p'];
    const allowedAttributes: string[] = [];

    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttributes,
      KEEP_CONTENT: true,
    });
  }

  /**
   * Validate and sanitize file names
   * @param input - File name to sanitize
   * @returns Sanitized file name
   */
  static sanitizeFileName(input: string): string {
    const sanitized = this.sanitizeText(input, 255);

    // Remove or replace dangerous characters in file names
    return sanitized
      .replace(/[<>:"/\\|?*]/g, '') // Remove dangerous characters
      .replace(/\.\./g, '') // Remove directory traversal attempts
      .replace(/^\./, '') // Remove leading dots
      .trim();
  }

  /**
   * Check if input contains potentially malicious content
   * @param input - Input to check
   * @returns true if input seems malicious
   */
  static containsMaliciousContent(input: string): boolean {
    if (typeof input !== 'string') {
      return false;
    }

    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onclick=/i,
      /onerror=/i,
      /onmouseover=/i,
      /onfocus=/i,
      /onblur=/i,
      /eval\(/i,
      /expression\(/i,
      /url\(/i,
      /import\(/i,
      /@import/i,
      /binding:/i,
      /lowsrc=/i,
      /dynsrc=/i,
      /data:text\/html/i,
    ];

    return maliciousPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Escape special characters for use in regular expressions
   * @param input - String to escape
   * @returns Escaped string safe for regex
   */
  static escapeRegExp(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Sanitize input based on field type
   * @param input - Input value
   * @param fieldType - Type of field (name, email, phone, etc.)
   * @returns Sanitized input
   */
  static sanitizeByFieldType(input: string, fieldType: string): string {
    switch (fieldType.toLowerCase()) {
      case 'name':
      case 'firstname':
      case 'lastname':
        return this.sanitizeName(input);
      case 'email':
        return this.sanitizeEmail(input);
      case 'phone':
      case 'telephone':
        return this.sanitizePhone(input);
      case 'url':
      case 'website':
        return this.sanitizeURL(input);
      case 'address':
        return this.sanitizeAddress(input);
      case 'search':
      case 'query':
        return this.sanitizeSearchQuery(input);
      case 'tag':
        return this.sanitizeTag(input);
      case 'filename':
        return this.sanitizeFileName(input);
      default:
        return this.sanitizeText(input);
    }
  }
}