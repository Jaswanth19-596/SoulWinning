#!/usr/bin/env node

/**
 * Utility script to generate a new database encryption key
 * Run with: node scripts/generateEncryptionKey.js
 */

const crypto = require('crypto');

function generateEncryptionKey() {
  // Generate a 32-byte (256-bit) key for AES-256-CBC
  const key = crypto.randomBytes(32);
  const base64Key = key.toString('base64');

  console.log('Generated new database encryption key:');
  console.log('');
  console.log('DB_ENCRYPTION_KEY=' + base64Key);
  console.log('');
  console.log('Add this to your .env file.');
  console.log('');
  console.log('⚠️  IMPORTANT SECURITY NOTES:');
  console.log('1. Keep this key secret and secure');
  console.log('2. Back up this key safely - lost keys mean lost data');
  console.log('3. Use different keys for different environments');
  console.log('4. Rotate keys periodically in production');
  console.log('');
  console.log('Key details:');
  console.log('- Length: 32 bytes (256 bits)');
  console.log('- Format: Base64 encoded');
  console.log('- Algorithm: AES-256-CBC');

  return base64Key;
}

// Generate key when script is run directly
if (require.main === module) {
  generateEncryptionKey();
}

module.exports = { generateEncryptionKey };