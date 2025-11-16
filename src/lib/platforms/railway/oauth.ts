import crypto from 'crypto';
import { TokenEncryption } from '../token-encryption';
import type { PlatformConnection } from '../types';

/**
 * Railway OAuth Service
 * Handles Railway authentication flow with secure token storage
 */

export interface RailwayUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface RailwayOAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType: string;
}

export class RailwayOAuthService {
  private clientId: string;
  private clientSecret: string;
  private callbackUrl: string;
  private tokenEncryption: TokenEncryption;

  constructor() {
    this.clientId = process.env.RAILWAY_CLIENT_ID || '';
    this.clientSecret = process.env.RAILWAY_CLIENT_SECRET || '';
    this.callbackUrl = process.env.RAILWAY_CALLBACK_URL || '';

    if (!this.clientId || !this.clientSecret || !this.callbackUrl) {
      throw new Error(
        'Railway OAuth configuration is missing. Please check environment variables.'
      );
    }

    this.tokenEncryption = new TokenEncryption();
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
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      state: state,
      scope: 'read write',
    });

    return `https://railway.app/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<RailwayOAuthTokens> {
    const response = await fetch('https://railway.app/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        redirect_uri: this.callbackUrl,
        grant_type: 'authorization_code',
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
      throw new Error(`Railway OAuth error: ${data.error_description || data.error}`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type || 'Bearer',
    };
  }

  /**
   * Get user information from Railway
   */
  async getUserInfo(accessToken: string): Promise<RailwayUser> {
    const query = `
      query {
        me {
          id
          name
          email
          avatar
        }
      }
    `;

    const response = await fetch('https://backboard.railway.app/graphql/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`Railway GraphQL error: ${data.errors[0]?.message || 'Unknown error'}`);
    }

    const user = data.data.me;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };
  }

  /**
   * Create a platform connection object
   */
  async createConnection(
    userId: string,
    tokens: RailwayOAuthTokens,
    user: RailwayUser
  ): Promise<PlatformConnection> {
    const encryptedToken = this.tokenEncryption.encrypt(tokens.accessToken);
    const encryptedRefreshToken = tokens.refreshToken
      ? this.tokenEncryption.encrypt(tokens.refreshToken)
      : undefined;

    const expiresAt = tokens.expiresIn
      ? new Date(Date.now() + tokens.expiresIn * 1000)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default 1 year

    return {
      id: crypto.randomUUID(),
      userId,
      platform: 'railway',
      accountId: user.id,
      accountName: user.name || user.email,
      accessToken: encryptedToken,
      refreshToken: encryptedRefreshToken,
      expiresAt,
      scopes: ['read', 'write'],
      createdAt: new Date(),
      lastUsedAt: new Date(),
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(connection: PlatformConnection): Promise<PlatformConnection> {
    if (!connection.refreshToken) {
      throw new Error('No refresh token available');
    }

    const decryptedRefreshToken = this.tokenEncryption.decrypt(connection.refreshToken);

    const response = await fetch('https://railway.app/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: decryptedRefreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to refresh token: ${errorData.error_description || response.statusText}`
      );
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Railway OAuth error: ${data.error_description || data.error}`);
    }

    const encryptedToken = this.tokenEncryption.encrypt(data.access_token);
    const encryptedRefreshToken = data.refresh_token
      ? this.tokenEncryption.encrypt(data.refresh_token)
      : connection.refreshToken;

    const expiresAt = data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    return {
      ...connection,
      accessToken: encryptedToken,
      refreshToken: encryptedRefreshToken,
      expiresAt,
      lastUsedAt: new Date(),
    };
  }

  /**
   * Decrypt access token from connection
   */
  decryptToken(connection: PlatformConnection): string {
    return this.tokenEncryption.decrypt(connection.accessToken);
  }

  /**
   * Revoke access token
   */
  async revokeToken(_accessToken: string): Promise<void> {
    // Railway doesn't have a documented token revocation endpoint
    // Tokens are managed through the Railway dashboard
    // This is a no-op for compatibility
    console.log('Railway token revocation must be done through Railway dashboard');
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
export const railwayOAuthService = new RailwayOAuthService();
