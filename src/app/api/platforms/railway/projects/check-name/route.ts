import { NextRequest, NextResponse } from 'next/server';
import { RailwayService } from '@/lib/platforms/railway/railway-service';
import { RailwayCookieManager } from '@/lib/platforms/railway';
import { getDeploymentCache, CacheKeys, CacheTTL } from '@/lib/deployment/deployment-cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cache = getDeploymentCache();
    const cacheKey = CacheKeys.projectNameAvailability('railway', name);
    const cachedResult = cache.get<{ available: boolean }>(cacheKey);
    
    if (cachedResult !== undefined) {
      return NextResponse.json({
        available: cachedResult.available,
        cached: true,
      });
    }

    // Get Railway token from cookies
    const connection = await RailwayCookieManager.getConnection();
    if (!connection) {
      return NextResponse.json(
        { error: 'Not authenticated with Railway' },
        { status: 401 }
      );
    }

    // Check name availability
    const railwayService = new RailwayService(connection.accessToken);
    const available = await railwayService.checkProjectNameAvailability(name);

    // Cache the result for 30 seconds
    cache.set(cacheKey, { available }, CacheTTL.PROJECT_NAME_AVAILABILITY);

    return NextResponse.json({ available });
  } catch (error: any) {
    console.error('Failed to check Railway project name:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check project name availability' },
      { status: 500 }
    );
  }
}
