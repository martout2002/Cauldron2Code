import { NextRequest, NextResponse } from 'next/server';
import { vercelOAuthService } from '@/lib/platforms/vercel';
import { VercelCookieManager } from '@/lib/platforms/vercel';

/**
 * GET /api/platforms/vercel/auth/callback
 * Handles Vercel OAuth callback
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('Vercel OAuth error:', error, errorDescription);

    // Redirect to configure page with error
    const redirectUrl = new URL('/configure', request.url);
    redirectUrl.searchParams.set(
      'vercel_auth_error',
      errorDescription || error
    );

    return NextResponse.redirect(redirectUrl);
  }

  // Validate required parameters
  if (!code || !state) {
    const redirectUrl = new URL('/configure', request.url);
    redirectUrl.searchParams.set(
      'vercel_auth_error',
      'Missing authorization code or state'
    );

    return NextResponse.redirect(redirectUrl);
  }

  try {
    // Validate state parameter (CSRF protection)
    const storedState = await VercelCookieManager.getOAuthState();

    if (!storedState || !vercelOAuthService.validateState(state, storedState)) {
      throw new Error('Invalid state parameter. Possible CSRF attack.');
    }

    // Remove state cookie after validation
    await VercelCookieManager.removeOAuthState();

    // Exchange code for access token
    const tokens = await vercelOAuthService.exchangeCodeForToken(code);

    // Get user information
    const user = await vercelOAuthService.getUserInfo(tokens.accessToken);

    // Create connection
    // Note: In a real implementation, you would get the actual userId from the session
    const connection = await vercelOAuthService.createConnection(
      'current-user-id', // This should come from your auth system
      tokens,
      user
    );

    // Store connection data in cookies
    await VercelCookieManager.setAuthToken(connection.accessToken);
    await VercelCookieManager.setConnectionId(connection.id);
    await VercelCookieManager.setUserInfo({
      username: user.username,
      name: user.name,
      avatar: user.avatar,
    });

    // Redirect to configure page with success
    const redirectUrl = new URL('/configure', request.url);
    redirectUrl.searchParams.set('vercel_auth_success', 'true');

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Failed to complete Vercel OAuth:', error);

    // Clear any partial state
    await VercelCookieManager.clearAll();

    // Redirect to configure page with error
    const redirectUrl = new URL('/configure', request.url);
    redirectUrl.searchParams.set(
      'vercel_auth_error',
      error instanceof Error ? error.message : 'Authentication failed'
    );

    return NextResponse.redirect(redirectUrl);
  }
}
