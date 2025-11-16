/**
 * GET /api/deployments/[id]
 * Returns detailed deployment information including masked environment variables and build logs
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
 * Mask sensitive environment variable values
 */
function maskEnvironmentVariable(value: string, sensitive: boolean): string {
  if (!sensitive || !value) {
    return value;
  }

  // Show first 4 and last 4 characters, mask the rest
  if (value.length <= 8) {
    return '****';
  }

  const start = value.substring(0, 4);
  const end = value.substring(value.length - 4);
  const masked = '*'.repeat(Math.min(value.length - 8, 20));

  return `${start}${masked}${end}`;
}

/**
 * Prepare deployment data for detailed view
 */
function prepareDeploymentDetails(deployment: any) {
  // Mask sensitive environment variables
  const maskedEnvVars = deployment.config.environmentVariables.map((envVar: any) => ({
    key: envVar.key,
    value: maskEnvironmentVariable(envVar.value, envVar.sensitive),
    description: envVar.description,
    required: envVar.required,
    sensitive: envVar.sensitive,
    example: envVar.example,
  }));

  return {
    id: deployment.id,
    projectName: deployment.projectName,
    platform: deployment.platform,
    status: deployment.status,
    deploymentUrl: deployment.deploymentUrl,
    previewUrl: deployment.previewUrl,
    services: deployment.services,
    buildLogs: deployment.buildLogs,
    error: deployment.error,
    createdAt: deployment.createdAt,
    completedAt: deployment.completedAt,
    duration: deployment.duration,
    config: {
      projectName: deployment.config.projectName,
      platform: deployment.config.platform,
      environmentVariables: maskedEnvVars,
      scaffoldConfig: {
        projectName: deployment.config.scaffoldConfig.projectName,
        projectStructure: deployment.config.scaffoldConfig.projectStructure,
        frontendFramework: deployment.config.scaffoldConfig.frontendFramework,
        backendFramework: deployment.config.scaffoldConfig.backendFramework,
        database: deployment.config.scaffoldConfig.database,
        auth: deployment.config.scaffoldConfig.auth,
        aiTemplate: deployment.config.scaffoldConfig.aiTemplate,
        // Include other non-sensitive config fields
      },
    },
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deploymentId } = await params;

    if (!deploymentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Deployment ID is required',
        },
        { status: 400 }
      );
    }

    // Get user ID
    const userId = await getUserId(request);

    // Get deployment from store
    const store = getDeploymentStore();
    const deployment = store.get(deploymentId);

    if (!deployment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Deployment not found',
        },
        { status: 404 }
      );
    }

    // Verify user owns this deployment
    if (deployment.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized access to deployment',
        },
        { status: 403 }
      );
    }

    // Prepare detailed deployment data
    const details = prepareDeploymentDetails(deployment);

    return NextResponse.json(
      {
        success: true,
        deployment: details,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching deployment details:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch deployment details',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

