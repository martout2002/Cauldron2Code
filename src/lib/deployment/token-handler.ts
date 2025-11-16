/**
 * Secure Token Handler
 * Manages platform tokens with encryption, revocation, and automatic cleanup
 */

import { TokenEncryption } from '@/lib/platforms/token-encryption';
import { cookies } from 'next/headers';

/**
 * Token metadata for tracking and cleanup
 */
interface TokenMetadata {
  platform: 'vercel' | 'railway' | 'render';
  userId: string;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt?: Date;
}

/**
 * Secure token handler with encryption and automatic cleanup
 */
export class SecureTokenHandler {
  private encryption: TokenEncryption;
  private readonly TOKEN_PREFIX = 'platform_token_';
  private readonly METADATA_PREFIX = 'token_meta_';

  constructor() {
    this.encryption = new TokenEncryption();
  }

  /**
   * Store an encrypted token in HTTP-only cookie
   */
  async storeToken(
    platform: 'vercel' | 'railway' | 'render',
    userId: string,
    token: string,
    expiresAt?: Date
  ): Promise<void> {
    // Encrypt the token
    const encryptedToken = this.encryption.encrypt(token);

    // Store in HTTP-only cookie
    const cookieStore = await cookies();
    const cookieName = `${this.TOKEN_PREFIX}${platform}`;

    cookieStore.set(cookieName, encryptedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: expiresAt
        ? Math.floor((expiresAt.getTime() - Date.now()) / 1000)
        : 60 * 60 * 24 * 365, // 1 year default
    });

    // Store metadata (non-sensitive)
    const metadata: TokenMetadata = {
      platform,
      userId,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      expiresAt,
    };

    cookieStore.set(
      `${this.METADATA_PREFIX}${platform}`,
      JSON.stringify(metadata),
      {
        httpOnly: false, // Allow client-side access for UI
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      }
    );
  }

  /**
   * Retrieve and decrypt a token
   */
  async getToken(
    platform: 'vercel' | 'railway' | 'render'
  ): Promise<string | null> {
    const cookieStore = await cookies();
    const cookieName = `${this.TOKEN_PREFIX}${platform}`;
    const encryptedToken = cookieStore.get(cookieName)?.value;

    if (!encryptedToken) {
      return null;
    }

    try {
      // Decrypt the token
      const token = this.encryption.decrypt(encryptedToken);

      // Update last used timestamp
      await this.updateLastUsed(platform);

      return token;
    } catch (error) {
      console.error(`Failed to decrypt ${platform} token:`, error);
      // If decryption fails, remove the invalid token
      await this.revokeToken(platform);
      return null;
    }
  }

  /**
   * Check if a token exists and is valid
   */
  async hasValidToken(
    platform: 'vercel' | 'railway' | 'render'
  ): Promise<boolean> {
    const token = await this.getToken(platform);
    if (!token) {
      return false;
    }

    // Check if token is expired
    const metadata = await this.getTokenMetadata(platform);
    if (metadata?.expiresAt && metadata.expiresAt < new Date()) {
      await this.revokeToken(platform);
      return false;
    }

    return true;
  }

  /**
   * Revoke a token (remove from storage)
   */
  async revokeToken(platform: 'vercel' | 'railway' | 'render'): Promise<void> {
    const cookieStore = await cookies();

    // Remove token cookie
    cookieStore.delete(`${this.TOKEN_PREFIX}${platform}`);

    // Remove metadata cookie
    cookieStore.delete(`${this.METADATA_PREFIX}${platform}`);

    // In a production system, you would also:
    // 1. Call the platform's API to revoke the token
    // 2. Remove from database if tokens are persisted
    // 3. Log the revocation for audit purposes
  }

  /**
   * Revoke all tokens for all platforms
   */
  async revokeAllTokens(): Promise<void> {
    await this.revokeToken('vercel');
    await this.revokeToken('railway');
    await this.revokeToken('render');
  }

  /**
   * Get token metadata
   */
  async getTokenMetadata(
    platform: 'vercel' | 'railway' | 'render'
  ): Promise<TokenMetadata | null> {
    const cookieStore = await cookies();
    const metadataCookie = cookieStore.get(
      `${this.METADATA_PREFIX}${platform}`
    );

    if (!metadataCookie?.value) {
      return null;
    }

    try {
      const metadata = JSON.parse(metadataCookie.value) as TokenMetadata;
      // Convert date strings back to Date objects
      metadata.createdAt = new Date(metadata.createdAt);
      metadata.lastUsedAt = new Date(metadata.lastUsedAt);
      if (metadata.expiresAt) {
        metadata.expiresAt = new Date(metadata.expiresAt);
      }
      return metadata;
    } catch (error) {
      console.error(`Failed to parse ${platform} token metadata:`, error);
      return null;
    }
  }

  /**
   * Update last used timestamp
   */
  private async updateLastUsed(
    platform: 'vercel' | 'railway' | 'render'
  ): Promise<void> {
    const metadata = await this.getTokenMetadata(platform);
    if (!metadata) {
      return;
    }

    metadata.lastUsedAt = new Date();

    const cookieStore = await cookies();
    cookieStore.set(
      `${this.METADATA_PREFIX}${platform}`,
      JSON.stringify(metadata),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      }
    );
  }

  /**
   * Get all connected platforms
   */
  async getConnectedPlatforms(): Promise<
    Array<'vercel' | 'railway' | 'render'>
  > {
    const platforms: Array<'vercel' | 'railway' | 'render'> = [
      'vercel',
      'railway',
      'render',
    ];
    const connected: Array<'vercel' | 'railway' | 'render'> = [];

    for (const platform of platforms) {
      if (await this.hasValidToken(platform)) {
        connected.push(platform);
      }
    }

    return connected;
  }

  /**
   * Cleanup expired tokens (should be called periodically)
   */
  async cleanupExpiredTokens(): Promise<void> {
    const platforms: Array<'vercel' | 'railway' | 'render'> = [
      'vercel',
      'railway',
      'render',
    ];

    for (const platform of platforms) {
      const metadata = await this.getTokenMetadata(platform);
      if (metadata?.expiresAt && metadata.expiresAt < new Date()) {
        await this.revokeToken(platform);
      }
    }
  }

  /**
   * Rotate token (replace with new token)
   */
  async rotateToken(
    platform: 'vercel' | 'railway' | 'render',
    userId: string,
    newToken: string,
    expiresAt?: Date
  ): Promise<void> {
    // Revoke old token
    await this.revokeToken(platform);

    // Store new token
    await this.storeToken(platform, userId, newToken, expiresAt);
  }

  /**
   * Check if token needs refresh (within 7 days of expiry)
   */
  async needsRefresh(
    platform: 'vercel' | 'railway' | 'render'
  ): Promise<boolean> {
    const metadata = await this.getTokenMetadata(platform);
    if (!metadata?.expiresAt) {
      return false;
    }

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return metadata.expiresAt < sevenDaysFromNow;
  }

  /**
   * Get token age in days
   */
  async getTokenAge(
    platform: 'vercel' | 'railway' | 'render'
  ): Promise<number | null> {
    const metadata = await this.getTokenMetadata(platform);
    if (!metadata) {
      return null;
    }

    const ageMs = Date.now() - metadata.createdAt.getTime();
    return Math.floor(ageMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Get days until token expires
   */
  async getDaysUntilExpiry(
    platform: 'vercel' | 'railway' | 'render'
  ): Promise<number | null> {
    const metadata = await this.getTokenMetadata(platform);
    if (!metadata?.expiresAt) {
      return null;
    }

    const daysMs = metadata.expiresAt.getTime() - Date.now();
    return Math.floor(daysMs / (1000 * 60 * 60 * 24));
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

/**
 * Middleware helper to verify token exists
 */
export async function requirePlatformToken(
  platform: 'vercel' | 'railway' | 'render'
): Promise<{ valid: boolean; token?: string; error?: string }> {
  const handler = getSecureTokenHandler();

  const hasToken = await handler.hasValidToken(platform);
  if (!hasToken) {
    return {
      valid: false,
      error: `No valid ${platform} token found. Please connect your account.`,
    };
  }

  const token = await handler.getToken(platform);
  if (!token) {
    return {
      valid: false,
      error: `Failed to retrieve ${platform} token.`,
    };
  }

  return {
    valid: true,
    token,
  };
}
