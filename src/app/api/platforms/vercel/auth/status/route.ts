import { NextResponse } from 'next/server';
import { VercelCookieManager } from '@/lib/platforms/vercel';
import { getDeploymentCache, CacheKeys, CacheTTL } from '@/lib/deployment/deployment-cache';

/**
 * GET /api/platforms/vercel/auth/status
 * Check Vercel connection status (cached for 5 minutes)
 */
export async function GET() {
  try {
    const cache = getDeploymentCache();
    const connectionId = await VercelCookieManager.getConnectionId();
    
    // Use connection ID as user identifier for caching
    const cacheKey = CacheKeys.platformConnection(connectionId || 'anonymous', 'vercel');
    
    // Check cache first
    const cachedStatus = cache.get<{ connected: boolean; user: any; connectionId: string | null }>(cacheKey);
    if (cachedStatus) {
      return NextResponse.json(cachedStatus);
    }

    // Fetch fresh data
    const authToken = await VercelCookieManager.getAuthToken();
    const userInfo = await VercelCookieManager.getUserInfo();

    const isConnected = !!(authToken && userInfo && connectionId);

    const response = {
      connected: isConnected,
      user: userInfo,
      connectionId,
    };

    // Cache the result for 5 minutes
    cache.set(cacheKey, response, CacheTTL.PLATFORM_CONNECTION);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to check Vercel connection status:', error);

    return NextResponse.json(
      {
        connected: false,
        error: 'Failed to check connection status',
      },
      { status: 500 }
    );
  }
}
