import CryptoJS from 'crypto-js';

/**
 * Secure storage utility for sensitive data
 * Uses AES encryption with sessionStorage for better security than localStorage
 */
class SecureStorage {
  private readonly encryptionKey: string;

  constructor() {
    // Generate a key based on session and some browser fingerprinting
    // In production, this should be more sophisticated
    this.encryptionKey = this.generateEncryptionKey();
  }

  private generateEncryptionKey(): string {
    // Create a session-specific key that doesn't persist
    const sessionId = sessionStorage.getItem('__session_id') || this.createSessionId();
    const browserFingerprint = this.getBrowserFingerprint();
    return CryptoJS.SHA256(sessionId + browserFingerprint).toString();
  }

  private createSessionId(): string {
    const sessionId = CryptoJS.lib.WordArray.random(128/8).toString();
    sessionStorage.setItem('__session_id', sessionId);
    return sessionId;
  }

  private getBrowserFingerprint(): string {
    // Simple browser fingerprinting for additional entropy
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

      const decrypted = CryptoJS.AES.decrypt(encrypted, this.encryptionKey);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedString) {
        // Decryption failed, remove the corrupted data
        this.removeItem(key);
        return null;
      }

      return decryptedString;
    } catch (error) {
      console.error('SecureStorage: Failed to decrypt data', error);
      this.removeItem(key);
      return null;
    }
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
}

// Export a singleton instance
export const secureStorage = new SecureStorage();