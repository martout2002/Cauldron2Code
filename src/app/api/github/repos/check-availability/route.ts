import { NextRequest, NextResponse } from 'next/server';
import { GitHubAuthHelper } from '@/lib/github/auth-helper';
import { GitHubRepositoryService } from '@/lib/github/repository';

/**
 * POST /api/github/repos/check-availability
 * Check if a repository name is available for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Get access token
    const accessToken = await GitHubAuthHelper.getAccessToken();
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated. Please sign in with GitHub.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Repository name is required' },
        { status: 400 }
      );
    }

    // Check availability
    const repoService = new GitHubRepositoryService(accessToken);
    const result = await repoService.checkAvailability(name);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking repository availability:', error);

    if (error instanceof Error) {
      // Handle specific error cases
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'GitHub API rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      if (error.message.includes('authentication') || error.message.includes('token')) {
        return NextResponse.json(
          { error: 'Authentication failed. Please sign in again.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to check repository availability' },
      { status: 500 }
    );
  }
}
