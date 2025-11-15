import { githubOAuthService, GitHubUser } from './oauth';
import { CookieManager } from './cookie-manager';

/**
 * GitHub Authentication Helper
 * High-level authentication operations
 */

export class GitHubAuthHelper {
  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const encryptedToken = await CookieManager.getAuthToken();
    return !!encryptedToken;
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<GitHubUser | null> {
    const encryptedToken = await CookieManager.getAuthToken();
    
    if (!encryptedToken) {
      return null;
    }

    try {
      const accessToken = githubOAuthService.decryptToken(encryptedToken);
      const user = await githubOAuthService.getUserInfo(accessToken);
      return user;
    } catch (error) {
      // Token is invalid or expired, clear cookies
      await CookieManager.clearAll();
      return null;
    }
  }

  /**
   * Get decrypted access token for API calls
   */
  static async getAccessToken(): Promise<string | null> {
    const encryptedToken = await CookieManager.getAuthToken();
    
    if (!encryptedToken) {
      return null;
    }

    try {
      return githubOAuthService.decryptToken(encryptedToken);
    } catch (error) {
      // Token decryption failed, clear cookies
      await CookieManager.clearAll();
      return null;
    }
  }

  /**
   * Store authenticated user session
   */
  static async storeSession(user: GitHubUser): Promise<void> {
    // Encrypt and store access token
    const encryptedToken = githubOAuthService.encryptToken(user.accessToken);
    await CookieManager.setAuthToken(encryptedToken);

    // Store non-sensitive user info for UI
    await CookieManager.setUserInfo({
      login: user.login,
      name: user.name,
      avatar_url: user.avatar_url,
    });
  }

  /**
   * Clear user session
   */
  static async clearSession(): Promise<void> {
    // Get token before clearing to revoke it
    const accessToken = await this.getAccessToken();
    
    if (accessToken) {
      try {
        await githubOAuthService.revokeToken(accessToken);
      } catch (error) {
        // Continue even if revocation fails
        console.error('Failed to revoke token:', error);
      }
    }

    await CookieManager.clearAll();
  }

  /**
   * Get user info from cookie (for client-side display)
   */
  static async getUserInfoFromCookie(): Promise<{
    login: string;
    name: string;
    avatar_url: string;
  } | null> {
    return await CookieManager.getUserInfo();
  }
}
