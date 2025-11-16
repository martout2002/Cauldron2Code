import { NextResponse } from 'next/server';
import { VercelCookieManager } from '@/lib/platforms/vercel';
import { getVercelOAuthService } from '@/lib/platforms/vercel';

/**
 * POST /api/platforms/vercel/auth/disconnect
 * Disconnect Vercel account
 */
export async function POST() {
  try {
    const authToken = await VercelCookieManager.getAuthToken();

    if (authToken) {
      try {
        const service = getVercelOAuthService();
        // Decrypt token and attempt to revoke it
        const decryptedToken = service.decryptToken({
          accessToken: authToken,
        } as any);
        
        await service.revokeToken(decryptedToken);
      } catch (error) {
        // Log but don't fail - Vercel doesn't have a revocation endpoint
        console.log('Token revocation not supported by Vercel:', error);
      }
    }

    // Clear all cookies
    await VercelCookieManager.clearAll();

    return NextResponse.json({
      success: true,
      message: 'Vercel account disconnected successfully',
    });
  } catch (error) {
    console.error('Failed to disconnect Vercel account:', error);

    // Clear cookies anyway
    await VercelCookieManager.clearAll();

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to disconnect Vercel account',
      },
      { status: 500 }
    );
  }
}
