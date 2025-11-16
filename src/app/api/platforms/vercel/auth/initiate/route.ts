import { NextResponse } from 'next/server';
import { getVercelOAuthService } from '@/lib/platforms/vercel';
import { VercelCookieManager } from '@/lib/platforms/vercel';

/**
 * GET /api/platforms/vercel/auth/initiate
 * Initiates Vercel OAuth flow
 */
export async function GET() {
  try {
    const service = getVercelOAuthService();
    // Generate state parameter for CSRF protection
    const state = service.generateState();

    // Store state in cookie
    await VercelCookieManager.setOAuthState(state);

    // Get authorization URL
    const authUrl = service.getAuthorizationUrl(state);

    return NextResponse.json({
      authUrl,
      success: true,
    });
  } catch (error) {
    console.error('Failed to initiate Vercel OAuth:', error);

    return NextResponse.json(
      {
        error: 'Failed to initiate Vercel authentication',
        success: false,
      },
      { status: 500 }
    );
  }
}
