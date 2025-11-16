/**
 * Secure Token Handler
 * Unified interface for secure token management across all platforms
 * Implements security best practices:
 * - HTTP-only cookies for token storage
 * - Never expose tokens in client-side code
 * - Automatic token revocation on disconnect
 * - Automatic token cleanup
 */

import { TokenEncryption } from './token-encryption';
import { getTokenCleanupService } from './token-cleanup';
import type { PlatformConnection, PlatformType } from './types';

export class SecureTokenHandler {
  private encryption: TokenEncryption;

  constructor() {
    this.encryption = new TokenEncryption();
  }

  /**
   * Encrypt a token for secure storage
   * @param token - Plain text token
   * @returns Encrypted token
   */
  encryptToken(token: string): string {
    if (!token) {
      throw new Error('Token is required for encryption');
    }
    return this.encryption.encrypt(token);
  }

  /**
   * Decrypt a token from storage
   * @param encryptedToken - Encrypted token
   * @returns Plain text token
   */
  decryptToken(encryptedToken: string): string {
    if (!encryptedToken) {
      throw new Error('Encrypted token is required for decryption');
    }
    return this.encryption.decrypt(encryptedToken);
  }

  /**
   * Create a secure platform connection object
   * Encrypts sensitive tokens before storage
   */
  createSecureConnection(
    userId: string,
    platform: PlatformType,
    accountId: string,
    accountName: string,
    accessToken: string,
    refreshToken: string | undefined,
    expiresAt: Date,
    scopes: string[]
  ): PlatformConnection {
    return {
      id: this.generateConnectionId(),
      userId,
      platform,
      accountId,
      accountName,
      accessToken: this.encryptToken(accessToken),
      refreshToken: refreshToken ? this.encryptToken(refreshToken) : undefined,
      expiresAt,
      scopes,
      createdAt: new Date(),
      lastUsedAt: new Date(),
    };
  }

  /**
   * Extract decrypted access token from connection
   * Updates lastUsedAt timestamp
   */
  getAccessToken(connection: PlatformConnection): string {
    // Update last used timestamp (should be persisted by caller)
    connection.lastUsedAt = new Date();
    return this.decryptToken(connection.accessToken);
  }

  /**
   * Extract decrypted refresh token from connection
   */
  getRefreshToken(connection: PlatformConnection): string | undefined {
    if (!connection.refreshToken) {
      return undefined;
    }
    return this.decryptToken(connection.refreshToken);
  }

  /**
   * Update connection with new tokens
   * Encrypts tokens before storage
   */
  updateConnectionTokens(
    connection: PlatformConnection,
    accessToken: string,
    refreshToken?: string,
    expiresAt?: Date
  ): PlatformConnection {
    return {
      ...connection,
      accessToken: this.encryptToken(accessToken),
      refreshToken: refreshToken ? this.encryptToken(refreshToken) : connection.refreshToken,
      expiresAt: expiresAt || connection.expiresAt,
      lastUsedAt: new Date(),
    };
  }

  /**
   * Check if a connection token is expired
   */
  isTokenExpired(connection: PlatformConnection): boolean {
    if (!connection.expiresAt) {
      // No expiry (e.g., Vercel tokens)
      return false;
    }

    return new Date(connection.expiresAt) < new Date();
  }

  /**
   * Revoke and cleanup tokens for a user on a specific platform
   */
  async revokeTokens(userId: string, platform: PlatformType): Promise<void> {
    const cleanupService = getTokenCleanupService();
    await cleanupService.cleanupPlatformTokens(userId, platform);
  }

  /**
   * Revoke and cleanup all tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    const cleanupService = getTokenCleanupService();
    await cleanupService.cleanupUserTokens(userId);
  }

  /**
   * Generate a unique connection ID
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Validate token format before encryption
   */
  validateToken(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Check for minimum length
    if (token.length < 10) {
      return false;
    }

    // Check for suspicious patterns
    if (token.includes('YOUR_') || token.includes('REPLACE_') || token === 'changeme') {
      return false;
    }

    return true;
  }

  /**
   * Sanitize connection data for client-side use
   * Removes all sensitive token information
   */
  sanitizeConnectionForClient(connection: PlatformConnection): {
    id: string;
    platform: PlatformType;
    accountId: string;
    accountName: string;
    scopes: string[];
    createdAt: Date;
    lastUsedAt: Date;
    isExpired: boolean;
  } {
    return {
      id: connection.id,
      platform: connection.platform,
      accountId: connection.accountId,
      accountName: connection.accountName,
      scopes: connection.scopes,
      createdAt: connection.createdAt,
      lastUsedAt: connection.lastUsedAt,
      isExpired: this.isTokenExpired(connection),
    };
  }
}

// Singleton instance
let tokenHandler: SecureTokenHandler | null = null;

export function getSecureTokenHandler(): SecureTokenHandler {
  if (!tokenHandler) {
    tokenHandler = new SecureTokenHandler();
  }
  return tokenHandler;
}
