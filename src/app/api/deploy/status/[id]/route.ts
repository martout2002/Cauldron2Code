/**
 * GET /api/deploy/status/[id]
 * Streams deployment progress updates via Server-Sent Events (SSE)
 */

import { NextRequest } from 'next/server';
import { getProgressTracker } from '@/lib/deployment/progress-tracker';

/**
 * Create a Server-Sent Events stream
 */
function createSSEStream(deploymentId: string) {
  const encoder = new TextEncoder();
  const progressTracker = getProgressTracker();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const initialMessage = `data: ${JSON.stringify({
        type: 'connected',
        deploymentId,
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(encoder.encode(initialMessage));

      // Get current state if available
      const currentState = progressTracker.getState(deploymentId);
      if (currentState) {
        const stateMessage = `data: ${JSON.stringify({
          type: 'update',
          ...currentState,
          timestamp: currentState.timestamp.toISOString(),
        })}\n\n`;
        controller.enqueue(encoder.encode(stateMessage));
      }

      // Subscribe to progress updates
      const unsubscribe = progressTracker.subscribe(deploymentId, (update) => {
        try {
          // Use compressed logs if there are many log lines
          const buildLogs = update.buildLogs && update.buildLogs.length > 100
            ? progressTracker.compressLogs(update.buildLogs)
            : update.buildLogs;

          const message = `data: ${JSON.stringify({
            type: 'update',
            deploymentId: update.deploymentId,
            status: update.status,
            message: update.message,
            timestamp: update.timestamp.toISOString(),
            buildLogs,
            deploymentUrl: update.deploymentUrl,
            error: update.error,
            services: update.services,
          })}\n\n`;

          controller.enqueue(encoder.encode(message));

          // Close stream when deployment is complete or failed
          if (update.status === 'success' || update.status === 'failed') {
            // Flush any pending batches before closing
            progressTracker.flushAllBatches();
            
            // Send final message
            const finalMessage = `data: ${JSON.stringify({
              type: 'complete',
              status: update.status,
              timestamp: new Date().toISOString(),
            })}\n\n`;
            controller.enqueue(encoder.encode(finalMessage));

            // Close the stream after a short delay to ensure message is received
            setTimeout(() => {
              unsubscribe();
              controller.close();
            }, 1000);
          }
        } catch (error) {
          console.error('Error sending SSE update:', error);
          unsubscribe();
          controller.error(error);
        }
      });

      // Handle client disconnect
      // Note: Cleanup will happen automatically when stream is closed
    },
  });

  return stream;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: deploymentId } = await params;

  if (!deploymentId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Deployment ID is required',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Create SSE stream
    const stream = createSSEStream(deploymentId);

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable buffering in nginx
      },
    });
  } catch (error) {
    console.error('Error creating SSE stream:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to create status stream',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

