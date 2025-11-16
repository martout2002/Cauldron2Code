import { NextResponse } from 'next/server';
import { RailwayCookieManager } from '@/lib/platforms/railway';
import { getDeploymentCache, CacheKeys, CacheTTL } from '@/lib/deployment/deployment-cache';

/**
 * GET /api/platforms/railway/auth/status
 * Check Railway connection status (cached for 5 minutes)
 */
export async function GET() {
  try {
    const connection = await RailwayCookieManager.getConnection();

    if (!connection) {
      return NextResponse.json({
        connected: false,
        success: true,
      });
    }

    const cache = getDeploymentCache();
    const cacheKey = CacheKeys.platformConnection(connection.accountId, 'railway');
    
    // Check cache first
    const cachedStatus = cache.get<any>(cacheKey);
    if (cachedStatus) {
      return NextResponse.json(cachedStatus);
    }

    // Check if token is expired
    const isExpired = new Date() > new Date(connection.expiresAt);

    const response = {
      connected: !isExpired,
      accountName: connection.accountName,
      accountId: connection.accountId,
      expiresAt: connection.expiresAt,
      success: true,
    };

    // Cache the result for 5 minutes
    cache.set(cacheKey, response, CacheTTL.PLATFORM_CONNECTION);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to check Railway connection status:', error);

    return NextResponse.json(
      {
        error: 'Failed to check connection status',
        success: false,
      },
      { status: 500 }
    );
  }
}
