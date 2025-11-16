import { NextRequest, NextResponse } from 'next/server';
import { getRenderOAuthService } from '@/lib/platforms/render';
import { RenderCookieManager } from '@/lib/platforms/render';

/**
 * GET /api/platforms/render/auth/callback
 * Handles Render OAuth callback
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('Render OAuth error:', error, errorDescription);

    // Redirect to configure page with error
    const redirectUrl = new URL('/configure', request.url);
    redirectUrl.searchParams.set(
      'render_auth_error',
      errorDescription || error
    );

    return NextResponse.redirect(redirectUrl);
  }

  // Validate required parameters
  if (!code || !state) {
    const redirectUrl = new URL('/configure', request.url);
    redirectUrl.searchParams.set(
      'render_auth_error',
      'Missing authorization code or state'
    );

    return NextResponse.redirect(redirectUrl);
  }

  try {
    const service = getRenderOAuthService();
    // Validate state parameter (CSRF protection)
    const storedState = await RenderCookieManager.getOAuthState();

    if (!storedState || !service.validateState(state, storedState)) {
      throw new Error('Invalid state parameter. Possible CSRF attack.');
    }

    // Remove state cookie after validation
    await RenderCookieManager.clearOAuthState();

    // Exchange code for access token
    const tokens = await service.exchangeCodeForToken(code);

    // Get user information
    const user = await service.getUserInfo(tokens.accessToken);

    // Create connection
    // Note: In a real implementation, you would get the actual userId from the session
    const connection = await service.createConnection(
      'current-user-id', // This should come from your auth system
      tokens,
      user
    );

    // Store connection data in cookies
    await RenderCookieManager.setConnection(connection);

    // Redirect to configure page with success
    const redirectUrl = new URL('/configure', request.url);
    redirectUrl.searchParams.set('render_auth_success', 'true');

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Failed to complete Render OAuth:', error);

    // Clear any partial state
    await RenderCookieManager.clearConnection();
    await RenderCookieManager.clearOAuthState();

    // Redirect to configure page with error
    const redirectUrl = new URL('/configure', request.url);
    redirectUrl.searchParams.set(
      'render_auth_error',
      error instanceof Error ? error.message : 'Authentication failed'
    );

    return NextResponse.redirect(redirectUrl);
  }
}
