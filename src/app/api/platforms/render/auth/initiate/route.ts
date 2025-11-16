import { NextResponse } from 'next/server';
import { renderOAuthService } from '@/lib/platforms/render';
import { RenderCookieManager } from '@/lib/platforms/render';

/**
 * GET /api/platforms/render/auth/initiate
 * Initiates Render OAuth flow
 */
export async function GET() {
  try {
    // Generate state parameter for CSRF protection
    const state = renderOAuthService.generateState();

    // Store state in cookie
    await RenderCookieManager.setOAuthState(state);

    // Get authorization URL
    const authUrl = renderOAuthService.getAuthorizationUrl(state);

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
