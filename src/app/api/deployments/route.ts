/**
 * GET /api/deployments
 * Returns list of user's deployments with status and metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDeploymentStore } from '@/lib/deployment/deployment-store';
import { cookies } from 'next/headers';

/**
 * Get user ID from session/cookies
 */
async function getUserId(request: NextRequest): Promise<string> {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  
  if (userId) {
    return userId;
  }

  // Fallback to IP-based identifier
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? (forwarded.split(',')[0] || 'anonymous') : (request.headers.get('x-real-ip') || 'anonymous');
  return `user_${ip.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

/**
 * Sanitize deployment data for client response
 * Masks sensitive environment variables
 */
function sanitizeDeployment(deployment: any) {
  return {
    id: deployment.id,
    projectName: deployment.projectName,
    platform: deployment.platform,
    status: deployment.status,
    deploymentUrl: deployment.deploymentUrl,
    previewUrl: deployment.previewUrl,
    createdAt: deployment.createdAt,
    completedAt: deployment.completedAt,
    duration: deployment.duration,
    error: deployment.error,
    // Don't include full config or build logs in list view
    hasError: !!deployment.error,
    serviceCount: deployment.services?.length || 0,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID
    const userId = await getUserId(request);

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get deployments from store
    const store = getDeploymentStore();
    let deployments = store.getByUser(userId);

    // Apply filters
    if (platform && ['vercel', 'railway', 'render'].includes(platform)) {
      deployments = deployments.filter((d) => d.platform === platform);
    }

    if (status && ['pending', 'building', 'deploying', 'success', 'failed'].includes(status)) {
      deployments = deployments.filter((d) => d.status === status);
    }

    // Apply pagination
    const total = deployments.length;
    const paginatedDeployments = deployments.slice(offset, offset + limit);

    // Sanitize deployment data
    const sanitizedDeployments = paginatedDeployments.map(sanitizeDeployment);

    return NextResponse.json(
      {
        success: true,
        deployments: sanitizedDeployments,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching deployments:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch deployments',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

