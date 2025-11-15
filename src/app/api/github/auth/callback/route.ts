import { NextRequest, NextResponse } from 'next/server';
import { githubOAuthService } from '@/lib/github';
import { CookieManager } from '@/lib/github/cookie-manager';
import { GitHubAuthHelper } from '@/lib/github/auth-helper';

/**
 * GET /api/github/auth/callback
 * Handles GitHub OAuth callback
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('GitHub OAuth error:', error, errorDescription);
    
    // Redirect to configure page with error
    const redirectUrl = new URL('/configure', request.url);
    redirectUrl.searchParams.set('github_auth_error', errorDescription || error);
    
    return NextResponse.redirect(redirectUrl);
  }

  // Validate required parameters
  if (!code || !state) {
    const redirectUrl = new URL('/configure', request.url);
    redirectUrl.searchParams.set('github_auth_error', 'Missing authorization code or state');
    
    return NextResponse.redirect(redirectUrl);
  }

  try {
    // Validate state parameter (CSRF protection)
    const storedState = await CookieManager.getOAuthState();
    
    if (!storedState || !githubOAuthService.validateState(state, storedState)) {
      throw new Error('Invalid state parameter. Possible CSRF attack.');
    }

    // Remove state cookie after validation
    await CookieManager.removeOAuthState();

    // Exchange code for access token
    const tokens = await githubOAuthService.exchangeCodeForToken(code);

    // Get user information
    const user = await githubOAuthService.getUserInfo(tokens.accessToken);

    // Store session
    await GitHubAuthHelper.storeSession(user);

    // Redirect to configure page with success
    const redirectUrl = new URL('/configure', request.url);
    redirectUrl.searchParams.set('github_auth_success', 'true');
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Failed to complete GitHub OAuth:', error);
    
    // Clear any partial state
    await CookieManager.clearAll();
    
    // Redirect to configure page with error
    const redirectUrl = new URL('/configure', request.url);
    redirectUrl.searchParams.set(
      'github_auth_error',
      error instanceof Error ? error.message : 'Authentication failed'
    );
    
    return NextResponse.redirect(redirectUrl);
  }
}
