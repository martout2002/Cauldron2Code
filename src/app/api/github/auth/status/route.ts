import { NextResponse } from 'next/server';
import { GitHubAuthHelper } from '@/lib/github/auth-helper';

/**
 * GET /api/github/auth/status
 * Checks GitHub authentication status
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
