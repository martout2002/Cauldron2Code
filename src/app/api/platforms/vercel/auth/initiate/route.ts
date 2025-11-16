import { NextResponse } from 'next/server';
import { vercelOAuthService } from '@/lib/platforms/vercel';
import { VercelCookieManager } from '@/lib/platforms/vercel';

/**
 * GET /api/platforms/vercel/auth/initiate
 * Initiates Vercel OAuth flow
 */
export async function GET() {
  try {
    // Generate state parameter for CSRF protection
    const state = vercelOAuthService.generateState();

    // Store state in cookie
    await VercelCookieManager.setOAuthState(state);

    // Get authorization URL
    const authUrl = vercelOAuthService.getAuthorizationUrl(state);

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
