import { NextResponse } from 'next/server';
import { GitHubAuthHelper } from '@/lib/github/auth-helper';

/**
 * POST /api/github/auth/signout
 * Signs out user and revokes GitHub token
 */
export async function POST() {
  try {
    // Clear session and revoke token
    await GitHubAuthHelper.clearSession();

    return NextResponse.json({
      success: true,
      message: 'Successfully signed out',
    });
  } catch (error) {
    console.error('Failed to sign out:', error);
    
    // Even if revocation fails, clear local session
    try {
      await GitHubAuthHelper.clearSession();
    } catch {
      // Ignore errors during cleanup
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sign out completely',
      },
      { status: 500 }
    );
  }
}
