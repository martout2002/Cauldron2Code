'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { ErrorMessage, ERROR_MESSAGES } from './ErrorMessage';

interface DownloadButtonProps {
  downloadId: string;
  onRetryExhausted?: () => void;
  className?: string;
}

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000; // 2 seconds

export function DownloadButton({
  downloadId,
  onRetryExhausted,
  className = '',
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(true);

  const attemptDownload = async (attempt: number = 0) => {
    setIsDownloading(true);
    setError(null);

    try {
      // Build download URL with retry parameter
      const url = `/api/download/${downloadId}${attempt > 0 ? `?retry=${attempt}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        // Try to parse error response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();

          setError(errorData.message || 'Download failed');
          setCanRetry(errorData.canRetry !== false);

          // Automatic retry if possible and not exceeded max attempts
          if (
            errorData.canRetry !== false &&
            attempt < MAX_RETRY_ATTEMPTS &&
            response.status === 404
          ) {
            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
            setRetryAttempt(attempt + 1);
            return attemptDownload(attempt + 1);
          }

          // Max retries exhausted
          if (attempt >= MAX_RETRY_ATTEMPTS) {
            setCanRetry(false);
            if (onRetryExhausted) {
              onRetryExhausted();
            }
          }

          setIsDownloading(false);
          return;
        }

        throw new Error(`Download failed with status ${response.status}`);
      }

      // Success - trigger download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `scaffold-${downloadId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setIsDownloading(false);
      setError(null);
      setRetryAttempt(0);
    } catch (err) {
      console.error('Download error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Network error occurred. Please check your connection and try again.'
      );
      setIsDownloading(false);

      // Automatic retry for network errors
      if (attempt < MAX_RETRY_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        setRetryAttempt(attempt + 1);
        return attemptDownload(attempt + 1);
      }

      setCanRetry(false);
      if (onRetryExhausted) {
        onRetryExhausted();
      }
    }
  };

  const handleDownload = () => {
    setRetryAttempt(0);
    attemptDownload(0);
  };

  const handleManualRetry = () => {
    attemptDownload(retryAttempt);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Error Display with comprehensive messages */}
      {error && (
        <div>
          <ErrorMessage
            title={ERROR_MESSAGES.DOWNLOAD_FAILED.title}
            message={error}
            suggestions={ERROR_MESSAGES.DOWNLOAD_FAILED.suggestions}
            onRetry={canRetry ? handleManualRetry : undefined}
          />
          {retryAttempt > 0 && (
            <p className="text-xs text-gray-600 mt-2 text-center">
              Retry attempt {retryAttempt} of {MAX_RETRY_ATTEMPTS}
            </p>
          )}
        </div>
      )}

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={isDownloading || (!canRetry && error !== null)}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
          isDownloading || (!canRetry && error !== null)
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {isDownloading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            {retryAttempt > 0 ? `Retrying (${retryAttempt}/${MAX_RETRY_ATTEMPTS})...` : 'Downloading...'}
          </>
        ) : (
          <>
            <Download size={20} />
            Download Scaffold
          </>
        )}
      </button>

      {/* Fallback Options when retries exhausted */}
      {error && !canRetry && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 font-medium">
            Maximum Retry Attempts Reached
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            We&apos;ve tried downloading your scaffold {MAX_RETRY_ATTEMPTS} times without success.
          </p>
          <div className="mt-3">
            <p className="text-sm text-yellow-800 font-medium mb-2">Next steps:</p>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Wait a moment and refresh the page to try again</li>
              <li>Regenerate your scaffold with the same configuration</li>
              <li>Check your browser&apos;s download settings and permissions</li>
              <li>Try using a different browser if the issue continues</li>
            </ul>
          </div>
        </div>
      )}

      {/* Helper Text */}
      {!error && !isDownloading && (
        <p className="text-xs text-center text-gray-500">
          Your scaffold is ready. Click to download the ZIP file.
        </p>
      )}
    </div>
  );
}
