/**
 * Token Encryption Utility
 * Provides AES-256-GCM encryption for secure token storage
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class TokenEncryption {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor(encryptionKey?: string) {
    const keyString = encryptionKey || process.env.TOKEN_ENCRYPTION_KEY;
    
    if (!keyString) {
      throw new Error('TOKEN_ENCRYPTION_KEY environment variable is required');
    }

    // Ensure the key is 32 bytes (256 bits) for AES-256
    this.key = Buffer.from(keyString, 'hex');
    
    if (this.key.length !== 32) {
      throw new Error('TOKEN_ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
    }
  }

  /**
   * Encrypt a token using AES-256-GCM
   * @param token - The token to encrypt
   * @returns Encrypted token in format: iv:authTag:encrypted
   */
  encrypt(token: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv) as any;

    let encrypted = cipher.update(token, 'utf8', 'hex') as string;
    encrypted += cipher.final('hex') as string;

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt a token using AES-256-GCM
   * @param encryptedToken - The encrypted token in format: iv:authTag:encrypted
   * @returns Decrypted token
   */
  decrypt(encryptedToken: string): string {
    const parts = encryptedToken.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted token format');
    }

    const ivHex = parts[0]!;
    const authTagHex = parts[1]!;
    const encrypted = parts[2]!;

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = createDecipheriv(this.algorithm, this.key, iv) as any;

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8') as string;
    decrypted += decipher.final('utf8') as string;

    return decrypted;
  }

  /**
   * Generate a new encryption key
   * @returns A 32-byte hex string suitable for TOKEN_ENCRYPTION_KEY
   */
  static generateKey(): string {
    return randomBytes(32).toString('hex');
  }
}
