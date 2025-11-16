import { NextResponse } from 'next/server';
import { RenderCookieManager } from '@/lib/platforms/render';
import { getDeploymentCache, CacheKeys, CacheTTL } from '@/lib/deployment/deployment-cache';

/**
 * GET /api/platforms/render/auth/status
 * Check Render connection status (cached for 5 minutes)
 */
export async function GET() {
  try {
    const connection = await RenderCookieManager.getConnection();

    const isConnected = !!connection;

    if (!isConnected) {
      return NextResponse.json({
        connected: false,
        user: null,
        connectionId: null,
      });
    }

    const cache = getDeploymentCache();
    const cacheKey = CacheKeys.platformConnection(connection.accountId, 'render');
    
    // Check cache first
    const cachedStatus = cache.get<any>(cacheKey);
    if (cachedStatus) {
      return NextResponse.json(cachedStatus);
    }

    const response = {
      connected: isConnected,
      user: {
        id: connection.accountId,
        name: connection.accountName,
      },
      connectionId: connection.id,
    };

    // Cache the result for 5 minutes
    cache.set(cacheKey, response, CacheTTL.PLATFORM_CONNECTION);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to check Render connection status:', error);

    return NextResponse.json(
      {
        connected: false,
        error: 'Failed to check connection status',
      },
      { status: 500 }
    );
  }
}
