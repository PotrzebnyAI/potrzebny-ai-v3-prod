import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// Get encryption key from environment
function getEncryptionKey(): Buffer {
  const keyEnv = process.env.ENCRYPTION_KEY;

  if (!keyEnv) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  // If key is hex-encoded (64 chars for 32 bytes)
  if (keyEnv.length === 64 && /^[0-9a-fA-F]+$/.test(keyEnv)) {
    return Buffer.from(keyEnv, 'hex');
  }

  // If key is a passphrase, derive a key using scrypt
  const salt = process.env.ENCRYPTION_SALT || 'potrzebny-ai-salt';
  return scryptSync(keyEnv, salt, KEY_LENGTH);
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  tag: string;
}

/**
 * Encrypts plaintext using AES-256-GCM
 * Used for GDPR Art. 9 compliant encryption of therapy notes
 */
export function encrypt(plaintext: string): EncryptedData {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return {
    ciphertext,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * Decrypts ciphertext using AES-256-GCM
 */
export function decrypt(data: EncryptedData): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(data.iv, 'hex');
  const tag = Buffer.from(data.tag, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(tag);

  let plaintext = decipher.update(data.ciphertext, 'hex', 'utf8');
  plaintext += decipher.final('utf8');

  return plaintext;
}

/**
 * Encrypts an object by stringifying it first
 */
export function encryptObject<T extends object>(obj: T): EncryptedData {
  return encrypt(JSON.stringify(obj));
}

/**
 * Decrypts and parses an object
 */
export function decryptObject<T extends object>(data: EncryptedData): T {
  const plaintext = decrypt(data);
  return JSON.parse(plaintext) as T;
}

/**
 * Generates a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Hashes a token for storage (one-way)
 */
export function hashToken(token: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Masks sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length);
  }

  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const masked = '*'.repeat(data.length - visibleChars * 2);

  return `${start}${masked}${end}`;
}

/**
 * Validates encryption key is properly configured
 */
export function validateEncryptionConfig(): boolean {
  try {
    const testData = 'test-encryption-validation';
    const encrypted = encrypt(testData);
    const decrypted = decrypt(encrypted);
    return decrypted === testData;
  } catch {
    return false;
  }
}

// Export types
export type { EncryptedData as EncryptionResult };
