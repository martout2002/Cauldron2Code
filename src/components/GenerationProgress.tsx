'use client';

import { useEffect, useState } from 'react';
import { GenerationProgress as ProgressType } from '@/lib/generator/progress-tracker';

interface GenerationProgressProps {
  generationId: string;
  onComplete?: (downloadId: string) => void;
  onError?: (error: string) => void;
}

const STEP_LABELS: Record<string, string> = {
  validating: 'Validating Configuration',
  'creating-structure': 'Creating Project Structure',
  'generating-files': 'Generating Files',
  'applying-theme': 'Applying Theme',
  'generating-docs': 'Generating Documentation',
  'creating-archive': 'Creating Archive',
  complete: 'Complete',
  error: 'Error',
};

export function GenerationProgress({
  generationId,
  onComplete,
  onError,
}: GenerationProgressProps) {
  const [progress, setProgress] = useState<ProgressType | null>(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!polling) return;

    const pollProgress = async () => {
      try {
        const response = await fetch(`/api/progress/${generationId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch progress');
        }

        const data: ProgressType = await response.json();
        setProgress(data);

        // Stop polling if complete or error
        if (data.status === 'complete') {
          setPolling(false);
          if (data.downloadId && onComplete) {
            onComplete(data.downloadId);
          }
        } else if (data.status === 'error') {
          setPolling(false);
          if (data.error && onError) {
            onError(data.error);
          }
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error);
        setPolling(false);
        if (onError) {
          onError('Failed to track generation progress');
        }
      }
    };

    // Poll immediately
    pollProgress();

    // Then poll every 500ms
    const interval = setInterval(pollProgress, 500);

    return () => clearInterval(interval);
  }, [generationId, polling, onComplete, onError]);

  if (!progress) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">
            {STEP_LABELS[progress.currentStep] || progress.currentStep}
          </span>
          <span className="text-muted-foreground">{progress.progress}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>

      {/* Current Message */}
      {progress.events && progress.events.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {progress.events[progress.events.length - 1]?.message}
        </div>
      )}

      {/* Error State */}
      {progress.status === 'error' && progress.error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-sm text-destructive font-medium">
            Generation Failed
          </p>
          <p className="text-sm text-destructive/80 mt-1">{progress.error}</p>
        </div>
      )}

      {/* Complete State */}
      {progress.status === 'complete' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            ✓ Generation Complete!
          </p>
          <p className="text-sm text-green-700 mt-1">
            Your scaffold is ready to download.
          </p>
        </div>
      )}

      {/* Event Log (Optional - for debugging) */}
      {process.env.NODE_ENV === 'development' && progress.events && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground">
            View Event Log
          </summary>
          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
            {progress.events.map((event, index) => (
              <div key={index} className="text-muted-foreground">
                <span className="font-mono">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>{' '}
                - {event.message}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
