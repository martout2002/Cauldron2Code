/**
 * POST /api/deploy/initiate
 * Initiates a deployment to a hosting platform
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDeploymentOrchestrator } from '@/lib/deployment/deployment-orchestrator';
import { withRateLimit, addRateLimitHeaders } from '@/lib/platforms/rate-limit-middleware';
import type { DeploymentConfig } from '@/lib/platforms/types';
import { cookies } from 'next/headers';

/**
 * Validate deployment configuration
 */
function validateDeploymentConfig(config: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.projectName || typeof config.projectName !== 'string') {
    errors.push('Project name is required');
  } else if (config.projectName.length < 3) {
    errors.push('Project name must be at least 3 characters');
  } else if (config.projectName.length > 50) {
    errors.push('Project name must be less than 50 characters');
  } else if (!/^[a-z0-9-]+$/.test(config.projectName)) {
    errors.push('Project name must contain only lowercase letters, numbers, and hyphens');
  }

  if (!config.platform || !['vercel', 'railway', 'render'].includes(config.platform)) {
    errors.push('Valid platform is required (vercel, railway, or render)');
  }

  if (!config.scaffoldConfig || typeof config.scaffoldConfig !== 'object') {
    errors.push('Scaffold configuration is required');
  }

  if (!Array.isArray(config.environmentVariables)) {
    errors.push('Environment variables must be an array');
  } else {
    // Validate required environment variables
    const requiredVars = config.environmentVariables.filter((v: any) => v.required);
    for (const envVar of requiredVars) {
      if (!envVar.value || envVar.value.trim() === '') {
        errors.push(`Required environment variable ${envVar.key} is missing`);
      }
    }

    // Validate environment variable formats
    for (const envVar of config.environmentVariables) {
      if (envVar.value && envVar.validation) {
        if (envVar.validation.pattern) {
          const regex = new RegExp(envVar.validation.pattern);
          if (!regex.test(envVar.value)) {
            errors.push(`Environment variable ${envVar.key} has invalid format`);
          }
        }
        if (envVar.validation.minLength && envVar.value.length < envVar.validation.minLength) {
          errors.push(
            `Environment variable ${envVar.key} must be at least ${envVar.validation.minLength} characters`
          );
        }
        if (envVar.validation.maxLength && envVar.value.length > envVar.validation.maxLength) {
          errors.push(
            `Environment variable ${envVar.key} must be less than ${envVar.validation.maxLength} characters`
          );
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get user ID from session/cookies
 * For now, we'll use a simple approach - in production this would integrate with auth
 */
async function getUserId(request: NextRequest): Promise<string> {
  // Try to get from cookie
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  
  if (userId) {
    return userId;
  }

  // Fallback to IP-based identifier for demo purposes
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? (forwarded.split(',')[0] || 'anonymous') : (request.headers.get('x-real-ip') || 'anonymous');
  return `user_${ip.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

/**
 * Verify platform connection exists and is valid
 */
async function verifyPlatformConnection(
  platform: string,
  _userId: string
): Promise<{ isValid: boolean; error?: string }> {
  const cookieStore = await cookies();
  
  // Check for platform-specific access token cookie
  const tokenCookie = cookieStore.get(`${platform}_access_token`);
  
  if (!tokenCookie || !tokenCookie.value) {
    return {
      isValid: false,
      error: `No ${platform} account connected. Please connect your account first.`,
    };
  }

  // In a production system, we would also verify the token hasn't expired
  // and refresh it if necessary

  return { isValid: true };
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const config: DeploymentConfig = body;

    // Get user ID
    const userId = await getUserId(request);

    // Validate deployment configuration
    const validation = validateDeploymentConfig(config);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid deployment configuration',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Verify platform connection
    const connectionCheck = await verifyPlatformConnection(config.platform, userId);
    if (!connectionCheck.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: connectionCheck.error,
          code: 'PLATFORM_NOT_CONNECTED',
        },
        { status: 401 }
      );
    }

    // Check rate limits
    const rateLimitCheck = await withRateLimit(userId);
    
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!;
    }

    // Start deployment orchestration
    const orchestrator = getDeploymentOrchestrator();
    
    // Start deployment asynchronously (don't await)
    const deploymentPromise = orchestrator.deploy(config, userId);

    // Get deployment ID immediately
    const deployment = await deploymentPromise;

    // Return deployment ID for tracking with rate limit headers
    const response = NextResponse.json(
      {
        success: true,
        deploymentId: deployment.id,
        message: 'Deployment initiated successfully',
      },
      { status: 202 } // 202 Accepted - processing has started
    );
    
    return addRateLimitHeaders(response, rateLimitCheck.result);
  } catch (error) {
    console.error('Deployment initiation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate deployment',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

