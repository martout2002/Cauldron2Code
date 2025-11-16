import { NextRequest, NextResponse } from 'next/server';
import { VercelService } from '@/lib/platforms/vercel/vercel-service';
import { VercelCookieManager } from '@/lib/platforms/vercel';
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
    const cacheKey = CacheKeys.projectNameAvailability('vercel', name);
    const cachedResult = cache.get<{ available: boolean }>(cacheKey);
    
    if (cachedResult !== undefined) {
      return NextResponse.json({
        available: cachedResult.available,
        cached: true,
      });
    }

    // Get Vercel token from cookies
    const token = await VercelCookieManager.getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated with Vercel' },
        { status: 401 }
      );
    }

    // Check name availability
    const vercelService = new VercelService(token);
    const available = await vercelService.checkProjectNameAvailability(name);

    // Cache the result for 30 seconds
    cache.set(cacheKey, { available }, CacheTTL.PROJECT_NAME_AVAILABILITY);

    return NextResponse.json({ available });
  } catch (error: any) {
    console.error('Failed to check Vercel project name:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check project name availability' },
      { status: 500 }
    );
  }
}
