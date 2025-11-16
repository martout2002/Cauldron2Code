import crypto from 'crypto';
import { TokenEncryption } from '../token-encryption';
import type { PlatformConnection } from '../types';

/**
 * Render OAuth Service
 * Handles Render authentication flow with secure token storage
 */

export interface RenderUser {
  id: string;
  name: string;
  email: string;
}

export interface RenderOAuthTokens {
  accessToken: string;
  tokenType: string;
}

export class RenderOAuthService {
  private clientId: string;
  private clientSecret: string;
  private callbackUrl: string;
  private tokenEncryption: TokenEncryption | null = null;

  constructor() {
    this.clientId = process.env.RENDER_CLIENT_ID || '';
    this.clientSecret = process.env.RENDER_CLIENT_SECRET || '';
    this.callbackUrl = process.env.RENDER_CALLBACK_URL || '';

    if (!this.clientId || !this.clientSecret || !this.callbackUrl) {
      console.warn(
        'Render OAuth configuration is missing. Please set RENDER_CLIENT_ID, RENDER_CLIENT_SECRET, and RENDER_CALLBACK_URL environment variables.'
      );
    }
  }

  /**
   * Ensure the service is properly configured
   */
  private ensureConfigured(): void {
    if (!this.clientId || !this.clientSecret || !this.callbackUrl) {
      throw new Error(
        'Render OAuth is not configured. Please check environment variables.'
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
      response_type: 'code',
      state: state,
      scope: 'read write',
    });

    return `https://dashboard.render.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<RenderOAuthTokens> {
    this.ensureConfigured();
    
    const response = await fetch('https://api.render.com/v1/oauth/token', {
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
      throw new Error(`Render OAuth error: ${data.error_description || data.error}`);
    }

    return {
      accessToken: data.access_token,
      tokenType: data.token_type || 'Bearer',
    };
  }

  /**
   * Get user information from Render
   */
  async getUserInfo(accessToken: string): Promise<RenderUser> {
    this.ensureConfigured();
    
    const response = await fetch('https://api.render.com/v1/owners', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Render returns an array of owners, get the first one (personal account)
    const owner = data[0]?.owner;
    
    if (!owner) {
      throw new Error('No owner information found');
    }

    return {
      id: owner.id,
      name: owner.name || owner.email,
      email: owner.email,
    };
  }

  /**
   * Create a platform connection object
   */
  async createConnection(
    userId: string,
    tokens: RenderOAuthTokens,
    user: RenderUser
  ): Promise<PlatformConnection> {
    this.ensureConfigured();
    
    const encryptedToken = this.tokenEncryption!.encrypt(tokens.accessToken);

    return {
      id: crypto.randomUUID(),
      userId,
      platform: 'render',
      accountId: user.id,
      accountName: user.name,
      accessToken: encryptedToken,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year (Render tokens don't expire)
      scopes: ['read', 'write'],
      createdAt: new Date(),
      lastUsedAt: new Date(),
    };
  }

  /**
   * Refresh access token (Render tokens don't expire, but this is here for interface compatibility)
   */
  async refreshToken(connection: PlatformConnection): Promise<PlatformConnection> {
    // Render tokens don't expire, so just update lastUsedAt
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
    // Render doesn't have a documented token revocation endpoint
    // Tokens are managed through the Render dashboard
    // This is a no-op for compatibility
    console.log('Render token revocation must be done through Render dashboard');
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

// Lazy singleton instance
let renderOAuthServiceInstance: RenderOAuthService | null = null;

export function getRenderOAuthService(): RenderOAuthService {
  if (!renderOAuthServiceInstance) {
    renderOAuthServiceInstance = new RenderOAuthService();
  }
  return renderOAuthServiceInstance;
}
