import { NextResponse } from 'next/server';
import { RenderCookieManager } from '@/lib/platforms/render';
import { renderOAuthService } from '@/lib/platforms/render';

/**
 * POST /api/platforms/render/auth/disconnect
 * Disconnect Render account
 */
export async function POST() {
  try {
    const connection = await RenderCookieManager.getConnection();

    if (connection) {
      try {
        // Decrypt token and attempt to revoke it
        const decryptedToken = renderOAuthService.decryptToken(connection);
        
        await renderOAuthService.revokeToken(decryptedToken);
      } catch (error) {
        // Log but don't fail - Render doesn't have a revocation endpoint
        console.log('Token revocation not supported by Render:', error);
      }
    }

    // Clear all cookies
    await RenderCookieManager.clearConnection();
    await RenderCookieManager.clearOAuthState();

    return NextResponse.json({
      success: true,
      message: 'Render account disconnected successfully',
    });
  } catch (error) {
    console.error('Failed to disconnect Render account:', error);

    // Clear cookies anyway
    await RenderCookieManager.clearConnection();
    await RenderCookieManager.clearOAuthState();

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to disconnect Render account',
      },
      { status: 500 }
    );
  }
}
