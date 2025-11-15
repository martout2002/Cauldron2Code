import { NextRequest, NextResponse } from 'next/server';
import { progressStore } from '@/lib/generator/progress-tracker';

/**
 * GET /api/progress/[id]
 * Get generation progress by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const progress = progressStore.get(id);

    if (!progress) {
      return NextResponse.json(
        {
          error: 'Progress tracker not found',
          message: 'The generation ID does not exist or has expired',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Progress fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch progress',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// Configure as Edge Function for optimal performance
export const runtime = 'edge';
