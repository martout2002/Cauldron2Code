'use client';

import { useEffect, useRef, useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface BuildLogViewerProps {
  logs: string[];
  maxHeight?: string;
  className?: string;
}

export function BuildLogViewer({
  logs,
  maxHeight = '400px',
  className = '',
}: BuildLogViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const prevLogsLengthRef = useRef(logs.length);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logContainerRef.current && logs.length > prevLogsLengthRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
    prevLogsLengthRef.current = logs.length;
  }, [logs, autoScroll]);

  // Detect manual scroll to disable auto-scroll
  const handleScroll = () => {
    if (!logContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;

    setAutoScroll(isAtBottom);
  };

  const handleCopyLogs = async () => {
    try {
      await navigator.clipboard.writeText(logs.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy logs:', error);
    }
  };

  const getLogLineClass = (log: string): string => {
    const lowerLog = log.toLowerCase();

    if (
      lowerLog.includes('error') ||
      lowerLog.includes('failed') ||
      lowerLog.includes('✗') ||
      lowerLog.includes('fatal')
    ) {
      return 'text-red-400 bg-red-950/30 font-semibold';
    }

    if (
      lowerLog.includes('warning') ||
      lowerLog.includes('warn') ||
      lowerLog.includes('⚠')
    ) {
      return 'text-yellow-400 bg-yellow-950/20';
    }

    if (
      lowerLog.includes('success') ||
      lowerLog.includes('complete') ||
      lowerLog.includes('✓') ||
      lowerLog.includes('done')
    ) {
      return 'text-green-400';
    }

    if (
      lowerLog.includes('info') ||
      lowerLog.includes('→') ||
      lowerLog.includes('building') ||
      lowerLog.includes('deploying')
    ) {
      return 'text-blue-400';
    }

    return 'text-gray-300';
  };

  const hasErrors = logs.some((log) => {
    const lowerLog = log.toLowerCase();
    return (
      lowerLog.includes('error') ||
      lowerLog.includes('failed') ||
      lowerLog.includes('fatal')
    );
  });

  const getErrorSuggestions = (): string[] => {
    const suggestions: string[] = [];
    const logsText = logs.join('\n').toLowerCase();

    if (logsText.includes('module_not_found') || logsText.includes('cannot find module')) {
      suggestions.push('Missing dependency - check your package.json and run npm install');
    }

    if (logsText.includes('enoent') || logsText.includes('no such file')) {
      suggestions.push('File not found - verify file paths in your build configuration');
    }

    if (logsText.includes('syntax error') || logsText.includes('unexpected token')) {
      suggestions.push('Syntax error in your code - check the error location in the logs');
    }

    if (logsText.includes('out of memory') || logsText.includes('heap')) {
      suggestions.push('Memory issue - try optimizing your build or upgrading your plan');
    }

    if (logsText.includes('timeout') || logsText.includes('timed out')) {
      suggestions.push('Build timeout - consider optimizing build time or splitting into smaller builds');
    }

    if (logsText.includes('permission denied') || logsText.includes('eacces')) {
      suggestions.push('Permission error - check file permissions and access rights');
    }

    if (suggestions.length === 0 && hasErrors) {
      suggestions.push('Review the error messages above for specific details');
      suggestions.push('Verify all environment variables are correctly set');
      suggestions.push('Check that your dependencies are compatible');
    }

    return suggestions;
  };

  if (logs.length === 0) {
    return (
      <div className={`p-4 bg-gray-900 rounded-lg ${className}`}>
        <p className="text-sm text-gray-400 text-center">
          No build logs available yet...
        </p>
      </div>
    );
  }

  return (
    <div className={`border border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            aria-label={isExpanded ? 'Collapse logs' : 'Expand logs'}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <h4 className="text-sm font-semibold text-gray-200">Build Logs</h4>
          <span className="text-xs text-gray-500">({logs.length} lines)</span>
        </div>

        <div className="flex items-center gap-2">
          {!autoScroll && (
            <button
              onClick={() => {
                setAutoScroll(true);
                if (logContainerRef.current) {
                  logContainerRef.current.scrollTop =
                    logContainerRef.current.scrollHeight;
                }
              }}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Jump to bottom
            </button>
          )}
          <button
            onClick={handleCopyLogs}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            aria-label="Copy logs"
          >
            {copied ? (
              <>
                <Check size={14} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Log Content */}
      {isExpanded && (
        <>
          <div
            ref={logContainerRef}
            onScroll={handleScroll}
            className="bg-gray-900 p-4 overflow-y-auto font-mono text-xs leading-relaxed"
            style={{ maxHeight }}
          >
            {logs.map((log, index) => (
              <div
                key={index}
                className={`${getLogLineClass(log)} whitespace-pre-wrap break-all px-2 py-0.5 -mx-2 rounded`}
              >
                <span className="text-gray-600 select-none mr-3">
                  {String(index + 1).padStart(3, ' ')}
                </span>
                {log}
              </div>
            ))}

            {/* Auto-scroll indicator */}
            {autoScroll && (
              <div className="mt-2 text-gray-600 text-center animate-pulse">
                Streaming logs...
              </div>
            )}
          </div>

          {/* Error Suggestions */}
          {hasErrors && getErrorSuggestions().length > 0 && (
            <div className="px-4 py-3 bg-red-950/20 border-t border-red-900/50">
              <p className="text-xs font-semibold text-red-400 mb-2">
                💡 Troubleshooting Suggestions:
              </p>
              <ul className="space-y-1">
                {getErrorSuggestions().map((suggestion, index) => (
                  <li key={index} className="text-xs text-red-300 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
