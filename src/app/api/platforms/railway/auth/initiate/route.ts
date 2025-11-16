import { NextResponse } from 'next/server';
import { railwayOAuthService } from '@/lib/platforms/railway';
import { RailwayCookieManager } from '@/lib/platforms/railway';

/**
 * GET /api/platforms/railway/auth/initiate
 * Initiates Railway OAuth flow
 */
export async function GET() {
  try {
    // Generate state parameter for CSRF protection
    const state = railwayOAuthService.generateState();

    // Store state in cookie
    await RailwayCookieManager.setOAuthState(state);

    // Get authorization URL
    const authUrl = railwayOAuthService.getAuthorizationUrl(state);

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
