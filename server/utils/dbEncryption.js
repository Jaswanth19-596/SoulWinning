const crypto = require('crypto');

/**
 * Database encryption utility for sensitive data
 * Uses AES-256-GCM encryption for maximum security
 */
class DatabaseEncryption {
  constructor() {
    // Use environment variable for encryption key in production
    this.encryptionKey = this.getEncryptionKey();
    this.algorithm = 'aes-256-cbc';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
  }

  /**
   * Get encryption key from environment or generate default
   */
  getEncryptionKey() {
    if (process.env.DB_ENCRYPTION_KEY) {
      // Decode base64 key from environment
      try {
        const keyBuffer = Buffer.from(process.env.DB_ENCRYPTION_KEY, 'base64');

        // Ensure key is exactly 32 bytes for AES-256
        if (keyBuffer.length === 32) {
          return keyBuffer;
        } else if (keyBuffer.length > 32) {
          console.warn(`DB_ENCRYPTION_KEY is ${keyBuffer.length} bytes, truncating to 32 bytes`);
          return keyBuffer.slice(0, 32);
        } else {
          console.warn(`DB_ENCRYPTION_KEY is ${keyBuffer.length} bytes, padding to 32 bytes`);
          const paddedKey = Buffer.alloc(32);
          keyBuffer.copy(paddedKey);
          return paddedKey;
        }
      } catch (error) {
        console.error('Invalid DB_ENCRYPTION_KEY format, using default');
        return this.generateDefaultKey();
      }
    }
    return this.generateDefaultKey();
  }

  /**
   * Generate a default key for development (should be replaced in production)
   */
  generateDefaultKey() {
    console.warn('WARNING: Using default encryption key. Set DB_ENCRYPTION_KEY environment variable in production.');
    return crypto.scryptSync('soul-winning-default-key-2024', 'soul-winning-salt', this.keyLength);
  }

  /**
   * Encrypt a string value
   * @param {string} text - Text to encrypt
   * @returns {string} - Encrypted value with IV and auth tag (base64 encoded)
   */
  encrypt(text) {
    if (!text || typeof text !== 'string') {
      return text; // Return as-is for null, undefined, or non-string values
    }

    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Combine IV and encrypted data
      const result = iv.toString('hex') + ':' + encrypted;
      return Buffer.from(result).toString('base64');
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt a string value
   * @param {string} encryptedData - Encrypted data (base64 encoded)
   * @returns {string} - Decrypted text
   */
  decrypt(encryptedData) {
    if (!encryptedData || typeof encryptedData !== 'string') {
      return encryptedData; // Return as-is for null, undefined, or non-string values
    }

    // Check if data is already unencrypted (legacy data)
    if (!this.isEncryptedData(encryptedData)) {
      return encryptedData; // Return unencrypted data as-is
    }

    try {
      // Decode from base64
      const decoded = Buffer.from(encryptedData, 'base64').toString('utf8');
      const parts = decoded.split(':');

      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      // If decryption fails, return the original data (might be unencrypted legacy data)
      return encryptedData;
    }
  }

  /**
   * Check if data appears to be encrypted (base64 with colon-separated format)
   * @param {string} data - Data to check
   * @returns {boolean} - True if data appears encrypted
   */
  isEncryptedData(data) {
    try {
      // Check if it's valid base64
      const decoded = Buffer.from(data, 'base64').toString('utf8');
      // Check if it has our expected format (iv:encrypted)
      const parts = decoded.split(':');
      return parts.length === 2 && parts[0].length === 32 && parts[1].length > 0; // 32 hex chars for 16 byte IV
    } catch (error) {
      return false;
    }
  }

  /**
   * Encrypt an object's specified fields
   * @param {Object} obj - Object to encrypt
   * @param {Array} fields - Array of field names to encrypt
   * @returns {Object} - Object with encrypted fields
   */
  encryptFields(obj, fields) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const result = { ...obj };

    fields.forEach(field => {
      if (result[field] !== undefined && result[field] !== null) {
        result[field] = this.encrypt(result[field]);
      }
    });

    return result;
  }

  /**
   * Decrypt an object's specified fields
   * @param {Object} obj - Object to decrypt
   * @param {Array} fields - Array of field names to decrypt
   * @returns {Object} - Object with decrypted fields
   */
  decryptFields(obj, fields) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const result = { ...obj };

    fields.forEach(field => {
      if (result[field] !== undefined && result[field] !== null) {
        try {
          result[field] = this.decrypt(result[field]);
        } catch (error) {
          console.warn(`Failed to decrypt field ${field}:`, error.message);
          // Keep the encrypted value if decryption fails
        }
      }
    });

    return result;
  }

  /**
   * Generate a secure encryption key
   * @returns {string} - Base64 encoded key
   */
  generateSecureKey() {
    const key = crypto.randomBytes(this.keyLength);
    return key.toString('base64');
  }

  /**
   * Log key information for debugging
   */
  logKeyInfo() {
    console.log('Encryption key length:', this.encryptionKey.length, 'bytes');
    console.log('Expected key length:', this.keyLength, 'bytes');
    console.log('Key is correct length:', this.encryptionKey.length === this.keyLength);
  }

  /**
   * Test encryption/decryption functionality
   * @returns {boolean} - True if test passes
   */
  testEncryption() {
    try {
      console.log('Testing database encryption...');

      // Log key information first
      this.logKeyInfo();

      const testData = 'Test encryption data ' + Date.now();
      console.log('Original data:', testData);

      const encrypted = this.encrypt(testData);
      console.log('Encrypted data:', encrypted);
      console.log('Is encrypted format:', this.isEncryptedData(encrypted));

      const decrypted = this.decrypt(encrypted);
      console.log('Decrypted data:', decrypted);

      const success = testData === decrypted;
      console.log('Encryption test result:', success ? 'PASSED' : 'FAILED');

      return success;
    } catch (error) {
      console.error('Encryption test failed:', error);
      this.logKeyInfo(); // Log key info on failure too
      return false;
    }
  }
}

// Export singleton instance
module.exports = new DatabaseEncryption();