import { NextResponse } from 'next/server';
import { GitHubAuthHelper } from '@/lib/github/auth-helper';

/**
 * GET /api/github/auth/status
 * Checks GitHub authentication status and validates token
 * Handles token expiration gracefully by clearing invalid sessions
 */
export async function GET() {
  try {
    const isAuthenticated = await GitHubAuthHelper.isAuthenticated();
    
    if (!isAuthenticated) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    // Validate token by attempting to get current user
    // This will clear the session if the token is expired or invalid
    const currentUser = await GitHubAuthHelper.getCurrentUser();
    
    if (!currentUser) {
      // Token was invalid or expired, session has been cleared
      return NextResponse.json({
        authenticated: false,
        user: null,
        expired: true,
      });
    }

    // Get user info from cookie (non-sensitive data)
    const userInfo = await GitHubAuthHelper.getUserInfoFromCookie();

    return NextResponse.json({
      authenticated: true,
      user: userInfo,
    });
  } catch (error) {
    console.error('Failed to check auth status:', error);
    
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        error: 'Failed to check authentication status',
      },
      { status: 500 }
    );
  }
}
