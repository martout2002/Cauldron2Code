import { NextResponse } from 'next/server';
import { RailwayCookieManager } from '@/lib/platforms/railway';
import { getRailwayOAuthService } from '@/lib/platforms/railway';

/**
 * POST /api/platforms/railway/auth/disconnect
 * Disconnect Railway account
 */
export async function POST() {
  try {
    const connection = await RailwayCookieManager.getConnection();

    if (connection) {
      // Decrypt and revoke the token
      const service = getRailwayOAuthService();
      const accessToken = service.decryptToken(connection);
      await service.revokeToken(accessToken);
    }

    // Clear connection cookie
    await RailwayCookieManager.clearConnection();

    return NextResponse.json({
      success: true,
      message: 'Railway account disconnected successfully',
    });
  } catch (error) {
    console.error('Failed to disconnect Railway account:', error);

    // Even if revocation fails, clear the cookie
    await RailwayCookieManager.clearConnection();

    return NextResponse.json(
      {
        error: 'Failed to disconnect Railway account',
        success: false,
      },
      { status: 500 }
    );
  }
}
