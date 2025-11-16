import crypto from 'crypto';
import { TokenEncryption } from '../token-encryption';
import type { PlatformConnection } from '../types';

/**
 * Vercel OAuth Service
 * Handles Vercel authentication flow with secure token storage
 */

export interface VercelUser {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar: string;
}

export interface VercelOAuthTokens {
  accessToken: string;
  tokenType: string;
  teamId?: string;
}

export class VercelOAuthService {
  private clientId: string;
  private clientSecret: string;
  private callbackUrl: string;
  private tokenEncryption: TokenEncryption | null = null;

  constructor() {
    this.clientId = process.env.VERCEL_CLIENT_ID || '';
    this.clientSecret = process.env.VERCEL_CLIENT_SECRET || '';
    this.callbackUrl = process.env.VERCEL_CALLBACK_URL || '';
  }

  /**
   * Ensure the service is properly configured
   */
  private ensureConfigured(): void {
    if (!this.clientId || !this.clientSecret || !this.callbackUrl) {
      throw new Error(
        'Vercel OAuth configuration is missing. Please check environment variables.'
      );
    }

    if (!this.tokenEncryption) {
      this.tokenEncryption = new TokenEncryption();
    }
  }

  /**
   * Generate a random state parameter for CSRF protection
   */
  generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Initiate OAuth flow
   * Returns the authorization URL to redirect the user to
   */
  getAuthorizationUrl(state: string): string {
    this.ensureConfigured();
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      state: state,
    });

    return `https://vercel.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<VercelOAuthTokens> {
    this.ensureConfigured();
    
    const response = await fetch('https://api.vercel.com/v2/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        redirect_uri: this.callbackUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to exchange code for token: ${errorData.error_description || response.statusText}`
      );
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Vercel OAuth error: ${data.error_description || data.error}`);
    }

    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
      teamId: data.team_id,
    };
  }

  /**
   * Get user information from Vercel
   */
  async getUserInfo(accessToken: string): Promise<VercelUser> {
    this.ensureConfigured();
    
    const response = await fetch('https://api.vercel.com/v2/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    const data = await response.json();
    const user = data.user;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name || user.username,
      avatar: user.avatar,
    };
  }

  /**
   * Create a platform connection object
   */
  async createConnection(
    userId: string,
    tokens: VercelOAuthTokens,
    user: VercelUser
  ): Promise<PlatformConnection> {
    this.ensureConfigured();
    
    const encryptedToken = this.tokenEncryption!.encrypt(tokens.accessToken);

    return {
      id: crypto.randomUUID(),
      userId,
      platform: 'vercel',
      accountId: user.id,
      accountName: user.username,
      accessToken: encryptedToken,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year (Vercel tokens don't expire)
      scopes: [],
      createdAt: new Date(),
      lastUsedAt: new Date(),
    };
  }

  /**
   * Refresh access token (Vercel tokens don't expire, but this is here for interface compatibility)
   */
  async refreshToken(connection: PlatformConnection): Promise<PlatformConnection> {
    // Vercel tokens don't expire, so just update lastUsedAt
    return {
      ...connection,
      lastUsedAt: new Date(),
    };
  }

  /**
   * Decrypt access token from connection
   */
  decryptToken(connection: PlatformConnection): string {
    this.ensureConfigured();
    return this.tokenEncryption!.decrypt(connection.accessToken);
  }

  /**
   * Revoke access token
   */
  async revokeToken(_accessToken: string): Promise<void> {
    // Vercel doesn't have a token revocation endpoint
    // Tokens are managed through the Vercel dashboard
    // This is a no-op for compatibility
    console.log('Vercel token revocation must be done through Vercel dashboard');
  }

  /**
   * Validate state parameter to prevent CSRF attacks
   */
  validateState(receivedState: string, storedState: string): boolean {
    if (!receivedState || !storedState) {
      return false;
    }

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(receivedState),
      Buffer.from(storedState)
    );
  }
}

// Export singleton instance
export const vercelOAuthService = new VercelOAuthService();
