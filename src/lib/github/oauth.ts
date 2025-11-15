import crypto from 'crypto';

/**
 * GitHub OAuth Service
 * Handles GitHub authentication flow with secure token storage
 */

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  accessToken: string;
}

export interface OAuthTokens {
  accessToken: string;
  tokenType: string;
  scope: string;
}

export class GitHubOAuthService {
  private clientId: string;
  private clientSecret: string;
  private callbackUrl: string;
  private encryptionKey: Buffer;

  constructor() {
    this.clientId = process.env.GITHUB_CLIENT_ID || '';
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET || '';
    this.callbackUrl = process.env.GITHUB_CALLBACK_URL || '';
    
    const encryptionKeyString = process.env.GITHUB_TOKEN_ENCRYPTION_KEY || '';
    this.encryptionKey = Buffer.from(encryptionKeyString, 'base64');

    if (!this.clientId || !this.clientSecret || !this.callbackUrl) {
      throw new Error('GitHub OAuth configuration is missing. Please check environment variables.');
    }

    if (this.encryptionKey.length !== 32) {
      throw new Error('GITHUB_TOKEN_ENCRYPTION_KEY must be a 32-byte key (base64 encoded)');
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
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      scope: 'repo user:email',
      state: state,
      allow_signup: 'true',
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<OAuthTokens> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        redirect_uri: this.callbackUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code for token: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
    }

    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }

  /**
   * Get user information from GitHub
   */
  async getUserInfo(accessToken: string): Promise<GitHubUser> {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    const userData = await response.json();

    // Get user email if not public
    let email = userData.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (emailResponse.ok) {
        const emails = await emailResponse.json();
        const primaryEmail = emails.find((e: any) => e.primary);
        email = primaryEmail?.email || emails[0]?.email || '';
      }
    }

    return {
      id: userData.id,
      login: userData.login,
      name: userData.name || userData.login,
      email: email,
      avatar_url: userData.avatar_url,
      accessToken: accessToken,
    };
  }

  /**
   * Encrypt access token for secure storage
   * Uses AES-256-GCM encryption
   */
  encryptToken(token: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine iv, authTag, and encrypted data
    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'hex')
    ]);
    
    return combined.toString('base64');
  }

  /**
   * Decrypt access token from storage
   */
  decryptToken(encryptedToken: string): string {
    const combined = Buffer.from(encryptedToken, 'base64');
    
    const iv = combined.subarray(0, 16);
    const authTag = combined.subarray(16, 32);
    const encrypted = combined.subarray(32);
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Revoke access token
   */
  async revokeToken(accessToken: string): Promise<void> {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    const response = await fetch(
      `https://api.github.com/applications/${this.clientId}/token`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          access_token: accessToken,
        }),
      }
    );

    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to revoke token: ${response.statusText}`);
    }
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
export const githubOAuthService = new GitHubOAuthService();
