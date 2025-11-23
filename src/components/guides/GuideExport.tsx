'use client';

import { useState } from 'react';
import { Download, Printer, Check, AlertCircle } from 'lucide-react';
import { getGuideExporter } from '@/lib/deployment/guide-exporter';
import { getGuideErrorHandler } from '@/lib/deployment/guide-error-handler';
import type { DeploymentGuide } from '@/types/deployment-guides';

interface GuideExportProps {
  guide: DeploymentGuide;
}

/**
 * GuideExport Component
 * 
 * Provides export and print functionality for deployment guides.
 * Allows users to download guides as Markdown files or print them.
 * 
 * Requirements: 10.5, 10.6
 */
export function GuideExport({ guide }: GuideExportProps) {
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [printStatus, setPrintStatus] = useState<'idle' | 'printing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const exporter = getGuideExporter();
  const errorHandler = getGuideErrorHandler();

  /**
   * Download the guide as a Markdown file
   * 
   * Requirement 10.6: Export as Markdown option
   */
  const handleDownloadMarkdown = () => {
    try {
      setExportStatus('exporting');
      setErrorMessage(null);

      // Use the exporter's downloadMarkdown method which includes error handling
      exporter.downloadMarkdown(guide);

      // Show success state
      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 2000);
    } catch (error) {
      const guideError = errorHandler.handleExportError(error as Error, 'markdown');
      errorHandler.logError(guideError, { platform: guide.platform.id });
      
      setExportStatus('error');
      setErrorMessage(errorHandler.getUserMessage(guideError));
      
      // Reset error state after 5 seconds
      setTimeout(() => {
        setExportStatus('idle');
        setErrorMessage(null);
      }, 5000);
    }
  };

  /**
   * Print the guide using browser print dialog
   * 
   * Requirement 10.5: Print Guide option
   */
  const handlePrint = () => {
    try {
      setPrintStatus('printing');
      setErrorMessage(null);
      
      // Use the exporter's printGuide method which includes error handling
      exporter.printGuide();
      
      // Show success state
      setPrintStatus('success');
      setTimeout(() => setPrintStatus('idle'), 2000);
    } catch (error) {
      const guideError = errorHandler.handleExportError(error as Error, 'print');
      errorHandler.logError(guideError, { platform: guide.platform.id });
      
      setPrintStatus('error');
      setErrorMessage(errorHandler.getUserMessage(guideError));
      
      // Reset error state after 5 seconds
      setTimeout(() => {
        setPrintStatus('idle');
        setErrorMessage(null);
      }, 5000);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Export as Markdown Button */}
        <button
          onClick={handleDownloadMarkdown}
          disabled={exportStatus === 'exporting'}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          aria-label="Export guide as Markdown"
        >
          {exportStatus === 'success' ? (
            <>
              <Check size={18} />
              <span>Exported!</span>
            </>
          ) : exportStatus === 'error' ? (
            <>
              <AlertCircle size={18} />
              <span>Export Failed</span>
            </>
          ) : (
            <>
              <Download size={18} />
              <span>{exportStatus === 'exporting' ? 'Exporting...' : 'Export as Markdown'}</span>
            </>
          )}
        </button>

        {/* Print Guide Button */}
        <button
          onClick={handlePrint}
          disabled={printStatus === 'printing'}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          aria-label="Print guide"
        >
          {printStatus === 'success' ? (
            <>
              <Check size={18} />
              <span>Ready to Print!</span>
            </>
          ) : printStatus === 'error' ? (
            <>
              <AlertCircle size={18} />
              <span>Print Failed</span>
            </>
          ) : (
            <>
              <Printer size={18} />
              <span>{printStatus === 'printing' ? 'Opening...' : 'Print Guide'}</span>
            </>
          )}
        </button>
      </div>

      {/* Error Message Display */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
