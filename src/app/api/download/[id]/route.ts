import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import {
  getArchiveStoragePath,
  cleanupArchive,
} from '@/lib/generator/archive-generator';
import { Readable } from 'stream';

/**
 * GET /api/download/[id]
 * Download generated scaffold by download ID
 * Streams file to avoid memory issues with large archives
 * Supports retry attempts via query parameter
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const retryAttempt = parseInt(searchParams.get('retry') || '0', 10);

    // Validate download ID format (hex string)
    if (!/^[a-f0-9]{32}$/i.test(id)) {
      return NextResponse.json(
        {
          error: 'Invalid download ID',
          message: 'The download ID format is invalid. Please check the URL and try again.',
          canRetry: false,
        },
        { status: 400 }
      );
    }

    const archivePath = getArchiveStoragePath(id);

    // Check if file exists
    let fileExists = false;
    try {
      await fs.access(archivePath);
      fileExists = true;
    } catch {
      // File doesn't exist
    }

    if (!fileExists) {
      // Provide helpful error message based on retry attempt
      const message =
        retryAttempt > 0
          ? 'The download archive is still not available. It may have expired or been deleted.'
          : 'The download archive does not exist or has already been downloaded. If generation just completed, please wait a moment and try again.';

      return NextResponse.json(
        {
          error: 'Archive not found',
          message,
          canRetry: retryAttempt < 3,
          retryAttempt,
          suggestion:
            retryAttempt < 3
              ? 'Click the download button again to retry'
              : 'Please regenerate your scaffold',
        },
        { status: 404 }
      );
    }

    // Get file stats
    let stats;
    try {
      stats = await fs.stat(archivePath);
    } catch (error) {
      console.error('Failed to get file stats:', error);
      return NextResponse.json(
        {
          error: 'File access error',
          message: 'Unable to access the download file. Please try again.',
          canRetry: retryAttempt < 3,
          retryAttempt,
        },
        { status: 500 }
      );
    }

    const fileSize = stats.size;

    // Validate file size (should be > 0)
    if (fileSize === 0) {
      return NextResponse.json(
        {
          error: 'Invalid archive',
          message: 'The archive file is empty. Please regenerate your scaffold.',
          canRetry: false,
        },
        { status: 500 }
      );
    }

    // Create read stream with error handling
    let fileStream;
    try {
      fileStream = createReadStream(archivePath);

      // Handle stream errors
      fileStream.on('error', (streamError) => {
        console.error('Stream error during download:', streamError);
        // Cleanup on stream error
        cleanupArchive(archivePath);
      });
    } catch (error) {
      console.error('Failed to create read stream:', error);
      return NextResponse.json(
        {
          error: 'Stream creation failed',
          message: 'Unable to start download. Please try again.',
          canRetry: retryAttempt < 3,
          retryAttempt,
        },
        { status: 500 }
      );
    }

    // Convert Node.js stream to Web ReadableStream
    const webStream = Readable.toWeb(fileStream) as ReadableStream;

    // Schedule cleanup after download (with delay to ensure download completes)
    // Increase delay for larger files
    const cleanupDelay = Math.min(10000, Math.max(5000, fileSize / 100000));
    setTimeout(() => {
      cleanupArchive(archivePath);
    }, cleanupDelay);

    // Return streaming response with retry information
    return new NextResponse(webStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="scaffold-${id}.zip"`,
        'Content-Length': fileSize.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Retry-Attempt': retryAttempt.toString(),
        'X-File-Size': fileSize.toString(),
      },
    });
  } catch (error) {
    console.error('Download error:', error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred during download';

    return NextResponse.json(
      {
        error: 'Download failed',
        message: errorMessage,
        canRetry: true,
        suggestion: 'Please try downloading again. If the problem persists, regenerate your scaffold.',
      },
      { status: 500 }
    );
  }
}

// Use Node.js runtime for file streaming
export const runtime = 'nodejs';
