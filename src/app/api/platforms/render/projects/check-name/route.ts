import { NextRequest, NextResponse } from 'next/server';
import { RenderService } from '@/lib/platforms/render/render-service';
import { RenderCookieManager } from '@/lib/platforms/render';
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
    const cacheKey = CacheKeys.projectNameAvailability('render', name);
    const cachedResult = cache.get<{ available: boolean }>(cacheKey);
    
    if (cachedResult !== undefined) {
      return NextResponse.json({
        available: cachedResult.available,
        cached: true,
      });
    }

    // Get Render token from cookies
    const connection = await RenderCookieManager.getConnection();
    if (!connection) {
      return NextResponse.json(
        { error: 'Not authenticated with Render' },
        { status: 401 }
      );
    }

    // Check name availability
    const renderService = new RenderService(connection.accessToken);
    const available = await renderService.checkProjectNameAvailability(name);

    // Cache the result for 30 seconds
    cache.set(cacheKey, { available }, CacheTTL.PROJECT_NAME_AVAILABILITY);

    return NextResponse.json({ available });
  } catch (error: any) {
    console.error('Failed to check Render project name:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check project name availability' },
      { status: 500 }
    );
  }
}
