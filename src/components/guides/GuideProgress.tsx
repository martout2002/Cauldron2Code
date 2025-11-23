'use client';

import { CheckCircle2 } from 'lucide-react';

interface GuideProgressProps {
  completed: number;
  total: number;
}

export function GuideProgress({ completed, total }: GuideProgressProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = completed === total && total > 0;

  return (
    <div className="w-full">
      {/* Progress Text */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isComplete && (
            <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
          )}
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {completed} of {total} steps complete
          </span>
        </div>
        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${
            isComplete
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : 'bg-gradient-to-r from-blue-500 to-blue-600'
          }`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${percentage}% complete`}
        />
      </div>

      {/* Completion Message */}
      {isComplete && (
        <p className="mt-2 text-sm text-green-700 dark:text-green-400 font-medium">
          🎉 All steps completed! Check the post-deployment checklist below.
        </p>
      )}
    </div>
  );
}
