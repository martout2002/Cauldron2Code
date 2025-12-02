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
            <CheckCircle2 size={18} className="text-[#b4ff64]" />
          )}
          <span className="text-sm font-semibold font-[family-name:var(--font-pixelify)] text-white">
            {completed} of {total} steps complete
          </span>
        </div>
        <span className="text-sm font-bold font-[family-name:var(--font-pixelify)] text-[#8b5cf6]">
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-[rgba(40,40,50,0.8)] border-2 border-[#8fcc4f] rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${
            isComplete
              ? 'bg-gradient-to-r from-[#b4ff64] to-[#8fcc4f]'
              : 'bg-gradient-to-r from-[#8b5cf6] to-[#b4ff64]'
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
        <p className="mt-2 text-sm font-[family-name:var(--font-pixelify)] text-[#b4ff64] font-medium">
          🎉 All steps completed! Check the post-deployment checklist below.
        </p>
      )}
    </div>
  );
}
