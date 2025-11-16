import { NextResponse } from 'next/server';
import { getRenderOAuthService } from '@/lib/platforms/render';
import { RenderCookieManager } from '@/lib/platforms/render';

/**
 * GET /api/platforms/render/auth/initiate
 * Initiates Render OAuth flow
 */
export async function GET() {
  try {
    const service = getRenderOAuthService();
    // Generate state parameter for CSRF protection
    const state = service.generateState();

    // Store state in cookie
    await RenderCookieManager.setOAuthState(state);

    // Get authorization URL
    const authUrl = service.getAuthorizationUrl(state);

    return NextResponse.json({
      authUrl,
      success: true,
    });
  } catch (error) {
    console.error('Failed to initiate Render OAuth:', error);

    return NextResponse.json(
      {
        error: 'Failed to initiate Render authentication',
        success: false,
      },
      { status: 500 }
    );
  }
}
