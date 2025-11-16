import { cookies } from 'next/headers';
import type { PlatformConnection } from '../types';

/**
 * Railway Cookie Manager
 * Manages secure HTTP-only cookies for Railway OAuth state and connection data
 */

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

const STATE_COOKIE_NAME = 'railway_oauth_state';
const CONNECTION_COOKIE_NAME = 'railway_connection';

export class RailwayCookieManager {
  /**
   * Set OAuth state cookie for CSRF protection
   */
  static async setOAuthState(state: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(STATE_COOKIE_NAME, state, {
      ...COOKIE_OPTIONS,
      maxAge: 600, // 10 minutes
    });
  }

  /**
   * Get OAuth state from cookie
   */
  static async getOAuthState(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(STATE_COOKIE_NAME)?.value;
  }

  /**
   * Clear OAuth state cookie
   */
  static async clearOAuthState(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(STATE_COOKIE_NAME);
  }

  /**
   * Set platform connection cookie
   */
  static async setConnection(connection: PlatformConnection): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(CONNECTION_COOKIE_NAME, JSON.stringify(connection), {
      ...COOKIE_OPTIONS,
      maxAge: 365 * 24 * 60 * 60, // 1 year
    });
  }

  /**
   * Get platform connection from cookie
   */
  static async getConnection(): Promise<PlatformConnection | null> {
    const cookieStore = await cookies();
    const connectionCookie = cookieStore.get(CONNECTION_COOKIE_NAME);

    if (!connectionCookie) {
      return null;
    }

    try {
      return JSON.parse(connectionCookie.value) as PlatformConnection;
    } catch {
      return null;
    }
  }

  /**
   * Clear platform connection cookie
   */
  static async clearConnection(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(CONNECTION_COOKIE_NAME);
  }

  /**
   * Check if user is connected to Railway
   */
  static async isConnected(): Promise<boolean> {
    const connection = await this.getConnection();
    return connection !== null;
  }
}
