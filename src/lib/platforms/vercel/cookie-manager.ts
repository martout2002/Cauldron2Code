import { cookies } from 'next/headers';

/**
 * Cookie Manager for Vercel OAuth
 * Handles secure HTTP-only cookie operations
 */

const COOKIE_NAMES = {
  AUTH_TOKEN: 'vercel_auth_token',
  OAUTH_STATE: 'vercel_oauth_state',
  USER_INFO: 'vercel_user_info',
  CONNECTION_ID: 'vercel_connection_id',
} as const;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export class VercelCookieManager {
  /**
   * Set encrypted auth token cookie
   */
  static async setAuthToken(encryptedToken: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAMES.AUTH_TOKEN, encryptedToken, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 365, // 1 year (Vercel tokens don't expire)
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
   * Set connection ID cookie
   */
  static async setConnectionId(connectionId: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAMES.CONNECTION_ID, connectionId, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  /**
   * Get connection ID from cookie
   */
  static async getConnectionId(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAMES.CONNECTION_ID)?.value;
  }

  /**
   * Remove connection ID cookie
   */
  static async removeConnectionId(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAMES.CONNECTION_ID);
  }

  /**
   * Set user info cookie (non-sensitive data for UI)
   */
  static async setUserInfo(userInfo: {
    username: string;
    name: string;
    avatar: string;
  }): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAMES.USER_INFO, JSON.stringify(userInfo), {
      httpOnly: false, // Allow client-side access for UI
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  /**
   * Get user info from cookie
   */
  static async getUserInfo(): Promise<{
    username: string;
    name: string;
    avatar: string;
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
   * Clear all Vercel-related cookies
   */
  static async clearAll(): Promise<void> {
    await this.removeAuthToken();
    await this.removeOAuthState();
    await this.removeUserInfo();
    await this.removeConnectionId();
  }
}
