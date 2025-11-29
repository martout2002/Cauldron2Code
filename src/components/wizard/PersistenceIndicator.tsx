'use client';

import { useEffect, useState } from 'react';
import { useWizardStore } from '@/lib/wizard/wizard-state';
import { useConfigStore } from '@/lib/store/config-store';
import { getPersistedStateSummary } from '@/lib/wizard/wizard-persistence';

interface PersistenceIndicatorProps {
  showDebugInfo?: boolean;
}

/**
 * Visual indicator showing that wizard state is persisted
 * Can optionally show debug information about the persisted state
 */
export function PersistenceIndicator({ showDebugInfo = false }: PersistenceIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false);
  const [summary, setSummary] = useState<ReturnType<typeof getPersistedStateSummary> | null>(null);
  
  const { currentStep } = useWizardStore();
  const { config } = useConfigStore();

  // Show "saved" indicator briefly when state changes
  useEffect(() => {
    let isMounted = true;
    // Use microtask to defer state update
    Promise.resolve().then(() => {
      if (isMounted) {
        setShowSaved(true);
      }
    });
    const timer = setTimeout(() => {
      if (isMounted) {
        setShowSaved(false);
      }
    }, 2000);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentStep, config]);

  // Update summary for debug info
  useEffect(() => {
    if (showDebugInfo) {
      const newSummary = getPersistedStateSummary();
      // Use microtask to defer state update
      Promise.resolve().then(() => setSummary(newSummary));
    }
  }, [showDebugInfo, currentStep, config]);

  if (!showDebugInfo) {
    // Simple saved indicator
    return (
      <div
        className={`fixed top-4 left-4 z-50 transition-opacity duration-300 ${
          showSaved ? 'opacity-100' : 'opacity-0'
        }`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex items-center gap-2 bg-green-900/80 border-2 border-green-500 rounded-lg px-3 py-2 backdrop-blur-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-100 text-sm font-pixelify">Saved</span>
        </div>
      </div>
    );
  }

  // Debug panel
  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/90 border-2 border-purple-500 rounded-lg p-4 max-w-sm text-xs font-mono text-white">
      <div className="font-bold text-purple-400 mb-2">Persistence Debug</div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-400">Wizard State:</span>
          <span className={summary?.hasWizardState ? 'text-green-400' : 'text-red-400'}>
            {summary?.hasWizardState ? '✓ Saved' : '✗ Missing'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Config State:</span>
          <span className={summary?.hasConfigState ? 'text-green-400' : 'text-red-400'}>
            {summary?.hasConfigState ? '✓ Saved' : '✗ Missing'}
          </span>
        </div>
        
        {summary && (
          <>
            <div className="border-t border-gray-700 my-2" />
            
            <div className="flex justify-between">
              <span className="text-gray-400">Current Step:</span>
              <span className="text-blue-400">{summary.currentStep ?? 'N/A'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Completed:</span>
              <span className="text-blue-400">
                {summary.completedSteps?.length ?? 0} steps
              </span>
            </div>
            
            <div className="border-t border-gray-700 my-2" />
            
            <div className="flex justify-between">
              <span className="text-gray-400">Project:</span>
              <span className="text-yellow-400 truncate max-w-[150px]">
                {summary.projectName || 'Not set'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Frontend:</span>
              <span className="text-yellow-400">{summary.frontendFramework || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Backend:</span>
              <span className="text-yellow-400">{summary.backendFramework || 'N/A'}</span>
            </div>
          </>
        )}
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-700">
        <div className={`flex items-center gap-2 ${showSaved ? 'text-green-400' : 'text-gray-500'}`}>
          <div className={`w-2 h-2 rounded-full ${showSaved ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
          <span className="text-xs">{showSaved ? 'Saving...' : 'Idle'}</span>
        </div>
      </div>
    </div>
  );
}
