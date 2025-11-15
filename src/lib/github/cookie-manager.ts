import { cookies } from 'next/headers';

/**
 * Cookie Manager for GitHub OAuth
 * Handles secure HTTP-only cookie operations
 */

const COOKIE_NAMES = {
  AUTH_TOKEN: 'github_auth_token',
  OAUTH_STATE: 'github_oauth_state',
  USER_INFO: 'github_user_info',
} as const;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export class CookieManager {
  /**
   * Set encrypted auth token cookie
   */
  static async setAuthToken(encryptedToken: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAMES.AUTH_TOKEN, encryptedToken, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  /**
   * Get encrypted auth token from cookie
   */
  static async getAuthToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAMES.AUTH_TOKEN)?.value;
  }

  /**
   * Remove auth token cookie
   */
  static async removeAuthToken(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAMES.AUTH_TOKEN);
  }

  /**
   * Set OAuth state for CSRF protection
   */
  static async setOAuthState(state: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAMES.OAUTH_STATE, state, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 10, // 10 minutes
    });
  }

  /**
   * Get OAuth state
   */
  static async getOAuthState(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAMES.OAUTH_STATE)?.value;
  }

  /**
   * Remove OAuth state cookie
   */
  static async removeOAuthState(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAMES.OAUTH_STATE);
  }

  /**
   * Set user info cookie (non-sensitive data for UI)
   */
  static async setUserInfo(userInfo: {
    login: string;
    name: string;
    avatar_url: string;
  }): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAMES.USER_INFO, JSON.stringify(userInfo), {
      httpOnly: false, // Allow client-side access for UI
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  /**
   * Get user info from cookie
   */
  static async getUserInfo(): Promise<{
    login: string;
    name: string;
    avatar_url: string;
  } | null> {
    const cookieStore = await cookies();
    const userInfoCookie = cookieStore.get(COOKIE_NAMES.USER_INFO);
    
    if (!userInfoCookie?.value) {
      return null;
    }

    try {
      return JSON.parse(userInfoCookie.value);
    } catch {
      return null;
    }
  }

  /**
   * Remove user info cookie
   */
  static async removeUserInfo(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAMES.USER_INFO);
  }

  /**
   * Clear all GitHub-related cookies
   */
  static async clearAll(): Promise<void> {
    await this.removeAuthToken();
    await this.removeOAuthState();
    await this.removeUserInfo();
  }
}
