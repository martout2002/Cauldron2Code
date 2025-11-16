import { NextRequest, NextResponse } from 'next/server';
import { getDeploymentStore } from '@/lib/deployment/deployment-store';
import { DeploymentOrchestrator } from '@/lib/deployment/deployment-orchestrator';
import { checkRateLimit } from '@/lib/platforms/rate-limit-middleware';

/**
 * POST /api/deploy/redeploy
 * Redeploy an existing deployment with the same configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deploymentId, environmentVariables } = body;

    if (!deploymentId) {
      return NextResponse.json(
        { error: 'Deployment ID is required' },
        { status: 400 }
      );
    }

    // Get the original deployment
    const store = getDeploymentStore();
    const originalDeployment = store.get(deploymentId);

    if (!originalDeployment) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      );
    }

    // Check rate limit
    const userId = originalDeployment.userId;
    const rateLimitResult = await checkRateLimit(userId);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset,
        },
        { status: 429 }
      );
    }

    // Create new deployment config based on original
    const redeployConfig = {
      ...originalDeployment.config,
      // Allow updating environment variables if provided
      environmentVariables: environmentVariables || originalDeployment.config.environmentVariables,
    };

    // Initiate new deployment
    const orchestrator = new DeploymentOrchestrator();
    const newDeployment = await orchestrator.deploy(redeployConfig, userId);

    // Save the new deployment
    store.save(newDeployment);

    return NextResponse.json({
      success: true,
      deploymentId: newDeployment.id,
      message: 'Redeployment initiated successfully',
    });
  } catch (error) {
    console.error('Redeploy error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate redeployment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
