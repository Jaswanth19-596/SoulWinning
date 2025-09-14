/**
 * Password validation utility with security best practices
 */
export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-100, higher is better
  errors: string[];
  suggestions: string[];
}

export class PasswordValidator {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 128;

  // Common weak passwords to check against
  private static readonly COMMON_PASSWORDS = new Set([
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'iloveyou',
    'princess', 'rockyou', '123123', 'football', 'master', 'charlie'
  ]);

  // Common patterns to avoid
  private static readonly WEAK_PATTERNS = [
    /(.)\1{2,}/, // Repeated characters (aaa, 111)
    /012|123|234|345|456|567|678|789|890/, // Sequential numbers
    /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i, // Sequential letters
    /qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm/i, // Keyboard patterns
  ];

  /**
   * Validate a password against security criteria
   * @param password - The password to validate
   * @param username - Optional username to check against (prevent password = username)
   * @returns Validation result with score and feedback
   */
  static validatePassword(password: string, username?: string): PasswordValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Basic length check
    if (password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    } else if (password.length >= this.MIN_LENGTH) {
      score += 20;
    }

    if (password.length > this.MAX_LENGTH) {
      errors.push(`Password must not exceed ${this.MAX_LENGTH} characters`);
    }

    // Character variety checks
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

    if (!hasLowercase) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score += 15;
    }

    if (!hasUppercase) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score += 15;
    }

    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    } else {
      score += 15;
    }

    if (!hasSpecialChars) {
      errors.push('Password must contain at least one special character (!@#$%^&*...)');
    } else {
      score += 15;
    }

    // Length bonus
    if (password.length >= 12) {
      score += 10;
    }
    if (password.length >= 16) {
      score += 5;
    }

    // Check for common weak passwords
    if (this.COMMON_PASSWORDS.has(password.toLowerCase())) {
      errors.push('This password is too common and easily guessed');
      score -= 30;
    }

    // Check for weak patterns
    for (const pattern of this.WEAK_PATTERNS) {
      if (pattern.test(password)) {
        errors.push('Avoid repeated characters or common patterns');
        score -= 15;
        break;
      }
    }

    // Check against username similarity
    if (username && password.toLowerCase().includes(username.toLowerCase())) {
      errors.push('Password should not contain your username');
      score -= 20;
    }

    // Check for personal information patterns (basic)
    if (/\b(admin|user|test|guest)\b/i.test(password)) {
      errors.push('Avoid using common words like "admin", "user", "test"');
      score -= 10;
    }

    // Bonus for good entropy
    const uniqueChars = new Set(password).size;
    const entropyBonus = Math.min(10, uniqueChars - 5);
    if (entropyBonus > 0) {
      score += entropyBonus;
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    // Generate suggestions based on what's missing
    if (score < 60) {
      if (password.length < 12) {
        suggestions.push('Use at least 12 characters for better security');
      }
      if (!hasSpecialChars) {
        suggestions.push('Add special characters like !@#$%^&*');
      }
      if (!hasNumbers) {
        suggestions.push('Include numbers in your password');
      }
      if (!hasUppercase || !hasLowercase) {
        suggestions.push('Mix uppercase and lowercase letters');
      }
      suggestions.push('Consider using a passphrase with multiple words');
      suggestions.push('Avoid personal information and common patterns');
    }

    return {
      isValid: errors.length === 0 && score >= 60,
      score,
      errors,
      suggestions,
    };
  }

  /**
   * Get password strength label based on score
   * @param score - Password score (0-100)
   * @returns Strength label and color
   */
  static getStrengthLabel(score: number): { label: string; color: string; className: string } {
    if (score >= 80) {
      return { label: 'Very Strong', color: '#22c55e', className: 'text-green-600' };
    } else if (score >= 60) {
      return { label: 'Strong', color: '#84cc16', className: 'text-lime-600' };
    } else if (score >= 40) {
      return { label: 'Moderate', color: '#f59e0b', className: 'text-amber-600' };
    } else if (score >= 20) {
      return { label: 'Weak', color: '#ef4444', className: 'text-red-600' };
    } else {
      return { label: 'Very Weak', color: '#dc2626', className: 'text-red-700' };
    }
  }

  /**
   * Generate a random secure password
   * @param length - Desired password length (default: 16)
   * @returns A randomly generated secure password
   */
  static generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specials = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars = lowercase + uppercase + numbers + specials;

    // Ensure at least one character from each category
    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specials[Math.floor(Math.random() * specials.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }

  /**
   * Check if password has been compromised in known data breaches
   * Note: This would typically use an API like HaveIBeenPwned
   * @param password - Password to check
   * @returns Promise indicating if password is compromised
   */
  static async isPasswordCompromised(password: string): Promise<boolean> {
    // In a real implementation, you would:
    // 1. Hash the password with SHA-1
    // 2. Send only the first 5 characters to HaveIBeenPwned API
    // 3. Check if the remaining hash appears in the response

    // For this example, we'll just check against our common passwords list
    return this.COMMON_PASSWORDS.has(password.toLowerCase());
  }
}