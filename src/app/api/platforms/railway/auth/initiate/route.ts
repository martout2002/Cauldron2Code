import { NextResponse } from 'next/server';
import { getRailwayOAuthService } from '@/lib/platforms/railway';
import { RailwayCookieManager } from '@/lib/platforms/railway';

/**
 * GET /api/platforms/railway/auth/initiate
 * Initiates Railway OAuth flow
 */
export async function GET() {
  try {
    const service = getRailwayOAuthService();
    // Generate state parameter for CSRF protection
    const state = service.generateState();

    // Store state in cookie
    await RailwayCookieManager.setOAuthState(state);

    // Get authorization URL
    const authUrl = service.getAuthorizationUrl(state);

    return NextResponse.json({
      authUrl,
      success: true,
    });
  } catch (error) {
    console.error('Failed to initiate Railway OAuth:', error);

    return NextResponse.json(
      {
        error: 'Failed to initiate Railway authentication',
        success: false,
      },
      { status: 500 }
    );
  }
}
