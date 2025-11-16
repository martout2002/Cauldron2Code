import { NextRequest, NextResponse } from 'next/server';
import { railwayOAuthService } from '@/lib/platforms/railway';
import { RailwayCookieManager } from '@/lib/platforms/railway';

/**
 * GET /api/platforms/railway/auth/callback
 * Handles Railway OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Check for OAuth errors
    if (error) {
      console.error('Railway OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/configure?error=${encodeURIComponent(errorDescription || error)}`,
          request.url
        )
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/configure?error=Missing code or state parameter', request.url)
      );
    }

    // Verify state to prevent CSRF attacks
    const storedState = await RailwayCookieManager.getOAuthState();
    if (!storedState || !railwayOAuthService.validateState(state, storedState)) {
      return NextResponse.redirect(
        new URL('/configure?error=Invalid state parameter', request.url)
      );
    }

    // Clear state cookie
    await RailwayCookieManager.clearOAuthState();

    // Exchange code for tokens
    const tokens = await railwayOAuthService.exchangeCodeForToken(code);

    // Get user information
    const user = await railwayOAuthService.getUserInfo(tokens.accessToken);

    // Create connection object
    // In a real implementation, you would get the actual userId from the session
    const connection = await railwayOAuthService.createConnection(
      'user-id-placeholder',
      tokens,
      user
    );

    // Store connection in cookie
    await RailwayCookieManager.setConnection(connection);

    // Redirect to configure page with success message
    return NextResponse.redirect(
      new URL('/configure?railway_connected=true', request.url)
    );
  } catch (error) {
    console.error('Railway OAuth callback error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to complete Railway authentication';

    return NextResponse.redirect(
      new URL(`/configure?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
