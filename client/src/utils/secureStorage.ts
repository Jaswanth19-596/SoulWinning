import CryptoJS from 'crypto-js';

/**
 * Secure storage utility for sensitive data
 * Uses AES encryption with sessionStorage for better security than localStorage
 */
class SecureStorage {
  private _encryptionKey: string;

  constructor() {
    // Generate a key based on session and some browser fingerprinting
    // In production, this should be more sophisticated
    this._encryptionKey = this.generateEncryptionKey();
  }

  private get encryptionKey(): string {
    return this._encryptionKey;
  }

  private generateEncryptionKey(): string {
    // Create a more stable session-specific key
    const sessionId = sessionStorage.getItem('__session_id') || this.createSessionId();
    // Use a simpler, more stable fingerprint that won't change as frequently
    const stableFingerprint = this.getStableBrowserFingerprint();
    return CryptoJS.SHA256(sessionId + stableFingerprint).toString();
  }

  private createSessionId(): string {
    const sessionId = CryptoJS.lib.WordArray.random(128/8).toString();
    sessionStorage.setItem('__session_id', sessionId);
    return sessionId;
  }

  private getStableBrowserFingerprint(): string {
    // More stable browser fingerprinting that's less likely to change
    // Use only relatively stable browser characteristics
    const userAgentHash = CryptoJS.SHA256(navigator.userAgent).toString().substring(0, 8);
    const platformInfo = navigator.platform || 'unknown';

    return CryptoJS.SHA256(
      userAgentHash +
      platformInfo +
      'soul-winning-app' // App-specific salt
    ).toString().substring(0, 16);
  }

  private getBrowserFingerprint(): string {
    // Keep the old method as fallback for legacy data
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx?.fillText('fingerprint', 10, 10);
      const canvasFingerprint = canvas.toDataURL();

      return CryptoJS.SHA256(
        navigator.userAgent +
        window.screen.width +
        window.screen.height +
        new Date().getTimezoneOffset() +
        canvasFingerprint
      ).toString().substring(0, 16);
    } catch (error) {
      // Fallback to stable fingerprint if canvas fails
      return this.getStableBrowserFingerprint();
    }
  }

  setItem(key: string, value: string): void {
    try {
      const encrypted = CryptoJS.AES.encrypt(value, this.encryptionKey).toString();
      sessionStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('SecureStorage: Failed to encrypt and store data', error);
      throw new Error('Failed to securely store data');
    }
  }

  getItem(key: string): string | null {
    try {
      const encrypted = sessionStorage.getItem(key);
      if (!encrypted) return null;

      // Try current encryption key first
      let decryptedString = this.tryDecrypt(encrypted, this.encryptionKey);

      if (!decryptedString) {
        // If current key fails, try with legacy fingerprint method
        const legacyKey = this.generateLegacyEncryptionKey();
        decryptedString = this.tryDecrypt(encrypted, legacyKey);
      }

      if (!decryptedString) {
        // All decryption attempts failed, remove corrupted data
        console.warn('SecureStorage: Unable to decrypt data, removing corrupted entry');
        this.removeItem(key);
        return null;
      }

      // If we successfully decrypted with legacy key, re-encrypt with current key
      if (decryptedString && encrypted !== CryptoJS.AES.encrypt(decryptedString, this.encryptionKey).toString()) {
        console.log('SecureStorage: Migrating data to new encryption key');
        this.setItem(key, decryptedString);
      }

      return decryptedString;
    } catch (error) {
      console.error('SecureStorage: Failed to decrypt data', error);
      this.removeItem(key);
      return null;
    }
  }

  private tryDecrypt(encrypted: string, key: string): string | null {
    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, key);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

      // Validate that we got valid UTF-8 data
      if (!decryptedString || decryptedString.length === 0) {
        return null;
      }

      // Additional validation: try to parse as JSON if it looks like JSON
      if (decryptedString.startsWith('{') || decryptedString.startsWith('[')) {
        JSON.parse(decryptedString); // This will throw if invalid JSON
      }

      return decryptedString;
    } catch (error) {
      return null;
    }
  }

  private generateLegacyEncryptionKey(): string {
    // Generate key using the old method for backward compatibility
    const sessionId = sessionStorage.getItem('__session_id') || this.createSessionId();
    const browserFingerprint = this.getBrowserFingerprint();
    return CryptoJS.SHA256(sessionId + browserFingerprint).toString();
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  clear(): void {
    // Only clear our encrypted items, preserve session ID
    const sessionId = sessionStorage.getItem('__session_id');
    sessionStorage.clear();
    if (sessionId) {
      sessionStorage.setItem('__session_id', sessionId);
    }
  }

  // Utility method to check if an item exists
  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  // Method to clear all encrypted data and reset session
  clearAllEncryptedData(): void {
    console.log('SecureStorage: Clearing all encrypted data due to decryption issues');

    // Get all keys from sessionStorage
    const keys = Object.keys(sessionStorage);

    // Remove all items except session ID
    keys.forEach(key => {
      if (key !== '__session_id') {
        sessionStorage.removeItem(key);
      }
    });

    // Force regeneration of encryption key
    this._encryptionKey = this.generateEncryptionKey();
  }

  // Method to test if encryption/decryption is working
  testEncryption(): boolean {
    try {
      const testValue = 'test-encryption-' + Date.now();
      this.setItem('__test__', testValue);
      const retrieved = this.getItem('__test__');
      this.removeItem('__test__');
      return retrieved === testValue;
    } catch (error) {
      console.error('SecureStorage: Encryption test failed', error);
      return false;
    }
  }
}

// Export a singleton instance
export const secureStorage = new SecureStorage();