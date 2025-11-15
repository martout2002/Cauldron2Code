import { NextResponse } from 'next/server';
import { githubOAuthService } from '@/lib/github';
import { CookieManager } from '@/lib/github/cookie-manager';

/**
 * GET /api/github/auth/initiate
 * Initiates GitHub OAuth flow
 */
export async function GET() {
  try {
    // Generate state parameter for CSRF protection
    const state = githubOAuthService.generateState();
    
    // Store state in cookie
    await CookieManager.setOAuthState(state);
    
    // Get authorization URL
    const authUrl = githubOAuthService.getAuthorizationUrl(state);
    
    return NextResponse.json({
      authUrl,
      success: true,
    });
  } catch (error) {
    console.error('Failed to initiate GitHub OAuth:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to initiate GitHub authentication',
        success: false,
      },
      { status: 500 }
    );
  }
}
